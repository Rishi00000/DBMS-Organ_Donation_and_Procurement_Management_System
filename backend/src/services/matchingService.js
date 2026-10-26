import { query, transaction } from '../config/database.js';
import { sendEmail, emailTemplates } from '../config/email.js';

/**
 * Organ Matching Algorithm Service
 * Implements the core matching logic based on multiple criteria:
 * 1. Blood type compatibility (hard constraint)
 * 2. HLA tissue type matching (scored)
 * 3. Urgency level (critical > urgent > standard)
 * 4. Geographic proximity (hospital location)
 * 5. Time on waitlist (tie-breaker)
 */

class MatchingService {
  /**
   * Find compatible recipients for a given organ
   * @param {number} organId - The organ ID to match
   * @returns {Array} - Ranked list of compatible recipients
   */
  async findMatches(organId) {
    try {
      console.log(`🔍 Finding matches for organ ID: ${organId}`);

      // Get organ details
      const organResult = await query(
        `SELECT o.*, d.hospital_id as donor_hospital_id, h.latitude as donor_lat, h.longitude as donor_lon
         FROM organs o
         JOIN donors d ON o.donor_id = d.donor_id
         JOIN hospitals h ON d.hospital_id = h.hospital_id
         WHERE o.organ_id = $1 AND o.is_available = true`,
        [organId]
      );

      if (organResult.rows.length === 0) {
        throw new Error('Organ not found or not available');
      }

      const organ = organResult.rows[0];
      console.log(`📦 Organ details:`, {
        type: organ.organ_type,
        bloodType: organ.blood_type,
        hla: organ.hla_typing,
      });

      // Find compatible recipients using optimized query
      const matchQuery = `
        WITH compatible_recipients AS (
          SELECT 
            r.*,
            h.hospital_id,
            h.name as hospital_name,
            h.latitude as recipient_lat,
            h.longitude as recipient_lon,
            -- Blood type compatibility check
            is_blood_compatible($1::blood_type, r.blood_type) as blood_compatible,
            -- HLA match score
            calculate_hla_match_score($2, r.hla_typing) as hla_score,
            -- Days on waitlist
            CURRENT_DATE - r.waitlist_date as days_on_waitlist,
            -- Urgency score (critical=3, urgent=2, standard=1)
            CASE r.urgency_level
              WHEN 'critical' THEN 3
              WHEN 'urgent' THEN 2
              ELSE 1
            END as urgency_score,
            -- Geographic distance calculation (moved here to use in compatibility score)
            -- Handle NULL coordinates gracefully
            CASE 
              WHEN h.latitude IS NULL OR h.longitude IS NULL OR $4::NUMERIC IS NULL OR $5::NUMERIC IS NULL 
              THEN 0 
              ELSE calculate_distance($4::NUMERIC, $5::NUMERIC, h.latitude, h.longitude) 
            END as distance_km
          FROM recipients r
          JOIN hospitals h ON r.hospital_id = h.hospital_id
          WHERE r.status = 'active'
            AND r.required_organ = $3::organ_type
        )
        SELECT 
          *,
          -- Calculate composite compatibility score
          (
            (CASE WHEN blood_compatible THEN 40 ELSE 0 END) +  -- 40% blood compatibility
            (COALESCE(hla_score, 6) * 3) +                     -- 36% HLA match (12 * 3)
            (urgency_score * 8) +                               -- 24% urgency (3 * 8)
            (LEAST(days_on_waitlist, 365) / 365.0 * 10)        -- 10% waitlist time
            - (LEAST(COALESCE(distance_km, 1000), 1000) / 1000.0 * 10)  -- -10% distance penalty
          ) as compatibility_score
        FROM compatible_recipients
        WHERE blood_compatible = true
        ORDER BY compatibility_score DESC, urgency_score DESC, days_on_waitlist DESC
        LIMIT 20;
      `;

      const matchesResult = await query(matchQuery, [
        organ.blood_type,
        organ.hla_typing || null,
        organ.organ_type,
        organ.donor_lat || null,
        organ.donor_lon || null,
      ]);

      console.log(`✅ Found ${matchesResult.rows.length} compatible recipients`);

      // Store matches in database
      const matches = [];
      for (const recipient of matchesResult.rows) {
        const matchResult = await query(
          `INSERT INTO matches (
            organ_id, recipient_id, compatibility_score, 
            hla_match_score, geographic_distance_km, match_status
          ) VALUES ($1, $2, $3, $4, $5, 'pending')
          ON CONFLICT (organ_id, recipient_id) DO UPDATE
          SET compatibility_score = $3,
              hla_match_score = $4,
              geographic_distance_km = $5,
              matched_at = CURRENT_TIMESTAMP
          RETURNING *`,
          [
            organId,
            recipient.recipient_id,
            parseFloat(recipient.compatibility_score) || 0,
            recipient.hla_score || null,
            recipient.distance_km ? parseFloat(recipient.distance_km) : null,
          ]
        );

        matches.push({
          ...matchResult.rows[0],
          recipient_details: {
            name: `${recipient.first_name} ${recipient.last_name}`,
            blood_type: recipient.blood_type,
            urgency_level: recipient.urgency_level,
            hospital_name: recipient.hospital_name,
            days_on_waitlist: recipient.days_on_waitlist,
          },
        });

        // Send notification email to hospital
        if (recipient.email) {
          await this.sendMatchNotification(
            recipient.email,
            `${recipient.first_name} ${recipient.last_name}`,
            organ.organ_type,
            organ.donor_hospital_id
          );
        }
      }

      return matches;
    } catch (error) {
      console.error('❌ Matching error:', error);
      throw error;
    }
  }

  /**
   * Get matches for a specific recipient
   * @param {number} recipientId - The recipient ID
   * @returns {Array} - List of matches for this recipient
   */
  async getRecipientMatches(recipientId) {
    try {
      const matchesResult = await query(
        `SELECT 
          m.*,
          o.organ_type,
          o.blood_type,
          o.procurement_date,
          o.expiry_time,
          d.first_name || ' ' || d.last_name as donor_name,
          h.name as hospital_name
        FROM matches m
        JOIN organs o ON m.organ_id = o.organ_id
        JOIN donors d ON o.donor_id = d.donor_id
        JOIN hospitals h ON d.hospital_id = h.hospital_id
        WHERE m.recipient_id = $1
          AND m.match_status = 'pending'
          AND o.is_available = true
        ORDER BY m.compatibility_score DESC, m.matched_at DESC`,
        [recipientId]
      );

      return matchesResult.rows;
    } catch (error) {
      console.error('Error fetching recipient matches:', error);
      throw error;
    }
  }

  /**
   * Accept a match and proceed to transplant
   * @param {number} matchId - The match ID to accept
   * @param {number} userId - The user accepting the match
   * @returns {Object} - Updated match and transplant record
   */
  async acceptMatch(matchId, userId) {
    return transaction(async (client) => {
      // Update match status
      const matchResult = await client.query(
        `UPDATE matches 
         SET match_status = 'accepted', 
             responded_at = CURRENT_TIMESTAMP
         WHERE match_id = $1
         RETURNING *`,
        [matchId]
      );

      if (matchResult.rows.length === 0) {
        throw new Error('Match not found');
      }

      const match = matchResult.rows[0];

      // Mark organ as no longer available
      await client.query(
        `UPDATE organs SET is_available = false, allocated_at = CURRENT_TIMESTAMP 
         WHERE organ_id = $1`,
        [match.organ_id]
      );

      // Update recipient status
      await client.query(
        `UPDATE recipients SET status = 'matched' WHERE recipient_id = $1`,
        [match.recipient_id]
      );

      // Reject other pending matches for this organ
      await client.query(
        `UPDATE matches 
         SET match_status = 'rejected', 
             responded_at = CURRENT_TIMESTAMP,
             response_notes = 'Organ allocated to another recipient'
         WHERE organ_id = $1 AND match_id != $2 AND match_status = 'pending'`,
        [match.organ_id, matchId]
      );

      // Get organ and recipient details for transplant record
      const detailsResult = await client.query(
        `SELECT 
          o.organ_id, o.donor_id, m.recipient_id, d.hospital_id
         FROM matches m
         JOIN organs o ON m.organ_id = o.organ_id
         JOIN donors d ON o.donor_id = d.donor_id
         WHERE m.match_id = $1`,
        [matchId]
      );

      const details = detailsResult.rows[0];

      // Get recipient details for email notification
      const recipientResult = await client.query(
        `SELECT r.*, u.email as recipient_email
         FROM recipients r
         LEFT JOIN users u ON r.user_id = u.user_id
         WHERE r.recipient_id = $1`,
        [match.recipient_id]
      );

      const recipient = recipientResult.rows[0];

      // Create transplant record
      const transplantResult = await client.query(
        `INSERT INTO transplants (
          match_id, organ_id, donor_id, recipient_id, hospital_id, 
          surgery_date, status
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '2 days', 'scheduled')
        RETURNING *`,
        [
          matchId,
          details.organ_id,
          details.donor_id,
          details.recipient_id,
          details.hospital_id,
        ]
      );

      // Send email notification to recipient
      if (recipient && recipient.recipient_email) {
        try {
          const { sendEmail, emailTemplates } = await import('../config/email.js');
          const organResult = await client.query(
            `SELECT organ_type FROM organs WHERE organ_id = $1`,
            [match.organ_id]
          );
          const organType = organResult.rows[0]?.organ_type || 'organ';

          await sendEmail({
            to: recipient.recipient_email,
            subject: 'Organ Match Found - Transplant Scheduled',
            html: `
              <h2>Great News! An Organ Match Has Been Found</h2>
              <p>Dear ${recipient.first_name} ${recipient.last_name},</p>
              <p>We are pleased to inform you that a compatible ${organType} has been found and your transplant has been scheduled.</p>
              <p><strong>Important Information:</strong></p>
              <ul>
                <li>Organ Type: ${organType}</li>
                <li>Surgery Date: ${transplantResult.rows[0].surgery_date ? new Date(transplantResult.rows[0].surgery_date).toLocaleDateString() : 'To be confirmed'}</li>
                <li>Status: Scheduled</li>
              </ul>
              <p>Your hospital will contact you shortly with more details about the surgery date and time. Please ensure you are available and ready for the procedure.</p>
              <p>If you have any questions, please contact your hospital immediately.</p>
              <p>Best regards,<br>Organ Donation and Procurement Network Management System</p>
            `,
            text: `Great news! A compatible ${organType} has been found and your transplant has been scheduled. Your hospital will contact you shortly with surgery details.`
          });
          console.log(`📧 Email notification sent to recipient: ${recipient.recipient_email}`);
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the transaction if email fails
        }
      }

      console.log(`✅ Match accepted and transplant scheduled: ${transplantResult.rows[0].transplant_id}`);

      return {
        match: matchResult.rows[0],
        transplant: transplantResult.rows[0],
      };
    });
  }

  /**
   * Reject a match
   * @param {number} matchId - The match ID to reject
   * @param {string} reason - Reason for rejection
   * @returns {Object} - Updated match record
   */
  async rejectMatch(matchId, reason) {
    try {
      const result = await query(
        `UPDATE matches 
         SET match_status = 'rejected', 
             responded_at = CURRENT_TIMESTAMP,
             response_notes = $2
         WHERE match_id = $1
         RETURNING *`,
        [matchId, reason]
      );

      if (result.rows.length === 0) {
        throw new Error('Match not found');
      }

      console.log(`❌ Match rejected: ${matchId}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error rejecting match:', error);
      throw error;
    }
  }

  /**
   * Send match notification email
   */
  async sendMatchNotification(recipientEmail, recipientName, organType, donorHospital) {
    try {
      const template = emailTemplates.matchNotification(
        recipientName,
        organType,
        `Hospital ID: ${donorHospital}`
      );

      await sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`📧 Match notification sent to ${recipientEmail}`);
    } catch (error) {
      console.error('Error sending match notification:', error);
      // Don't throw - notification failure shouldn't break matching
    }
  }

  /**
   * Get system-wide matching statistics
   */
  async getMatchingStats() {
    try {
      const statsResult = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE match_status = 'pending') as pending_matches,
          COUNT(*) FILTER (WHERE match_status = 'accepted') as accepted_matches,
          COUNT(*) FILTER (WHERE match_status = 'rejected') as rejected_matches,
          AVG(compatibility_score) FILTER (WHERE match_status = 'accepted') as avg_compatibility,
          COUNT(DISTINCT recipient_id) as unique_recipients_matched
        FROM matches
      `);

      return statsResult.rows[0];
    } catch (error) {
      console.error('Error fetching matching stats:', error);
      throw error;
    }
  }
}

export default new MatchingService();
