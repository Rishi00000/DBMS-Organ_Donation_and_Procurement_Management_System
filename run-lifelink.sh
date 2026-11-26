#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_URL="http://localhost:3000/health"
FRONTEND_URL="http://localhost:5173/"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  for pid in "$FRONTEND_PID" "$BACKEND_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done

  exit "$exit_code"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for command_name in node npm curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name. Install Node.js/npm and run this script in Git Bash."
    exit 1
  fi
done

wait_for_url() {
  local name="$1"
  local url="$2"
  local pid="${3:-}"

  for attempt in {1..60}; do
    if curl --fail --silent --show-error --max-time 2 "$url" >/dev/null 2>&1; then
      echo "$name is ready."
      return 0
    fi

    if [[ -n "$pid" ]] && ! kill -0 "$pid" 2>/dev/null; then
      echo "$name stopped before becoming ready."
      return 1
    fi

    sleep 1
  done

  echo "$name did not become ready at $url."
  return 1
}

if curl --fail --silent --max-time 2 "$BACKEND_URL" >/dev/null 2>&1; then
  echo "Backend is already running."
else
  echo "Starting backend..."
  (
    cd "$BACKEND_DIR"
    exec npm run dev
  ) &
  BACKEND_PID=$!
  wait_for_url "Backend (including database connection)" "$BACKEND_URL" "$BACKEND_PID"
fi

if curl --fail --silent --max-time 2 "$FRONTEND_URL" >/dev/null 2>&1; then
  echo "Frontend is already running."
else
  echo "Starting frontend..."
  (
    cd "$FRONTEND_DIR"
    exec npm run dev -- --host localhost
  ) &
  FRONTEND_PID=$!
  wait_for_url "Frontend" "$FRONTEND_URL" "$FRONTEND_PID"
fi

echo "Opening $FRONTEND_URL"
if [[ "${OS:-}" == "Windows_NT" ]] && command -v cmd.exe >/dev/null 2>&1; then
  cmd.exe /c start "" "$FRONTEND_URL" >/dev/null 2>&1 || true
elif command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "Start-Process '$FRONTEND_URL'" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FRONTEND_URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$FRONTEND_URL" >/dev/null 2>&1 || true
else
  echo "Open this URL in your browser: $FRONTEND_URL"
fi

if [[ -n "$BACKEND_PID" || -n "$FRONTEND_PID" ]]; then
  echo "Press Ctrl+C to stop the servers started by this script."
  while true; do
    if [[ -n "$BACKEND_PID" ]] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo "Backend process stopped."
      exit 1
    fi
    if [[ -n "$FRONTEND_PID" ]] && ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
      echo "Frontend process stopped."
      exit 1
    fi
    sleep 1
  done
fi
