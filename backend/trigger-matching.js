import dotenv from 'dotenv';
import { query } from './src/config/database.js';
import matchingService from './src/services/matchingService.js';

dotenv.config();

async function triggerMatching() {
  try {
    console.log('🔍 Finding organs without matches...\n');
    
    // Find available organs that don't have matches
    const organsResult = await query(`
      SELECT o.organ_id, o.organ_type, o.blood_type, o.is_available
      FROM organs o
      WHERE o.is_available = true
        AND NOT EXISTS (
          SELECT 1 FROM matches m WHERE m.organ_id = o.organ_id
        )
      ORDER BY o.created_at DESC
    `);
    
    console.log(`Found ${organsResult.rows.length} available organs without matches\n`);
    
    for (const organ of organsResult.rows) {
      console.log(`\n🎯 Processing organ ID ${organ.organ_id}:`);
      console.log(`   Type: ${organ.organ_type}, Blood: ${organ.blood_type}`);
      
      try {
        const matches = await matchingService.findMatches(organ.organ_id);
        console.log(`   ✅ Found ${matches.length} compatible recipients`);
        
        if (matches.length > 0) {
          console.log(`   Top matches:`);
          matches.slice(0, 3).forEach((match, idx) => {
            console.log(`     ${idx + 1}. Score: ${match.compatibility_score}, Recipient: ${match.recipient_details?.name}`);
          });
        }
      } catch (error) {
        console.error(`   ❌ Error matching organ ${organ.organ_id}:`, error.message);
        if (error.code) {
          console.error(`   Database error code: ${error.code}`);
        }
      }
    }
    
    console.log('\n✅ Matching process completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

triggerMatching();

