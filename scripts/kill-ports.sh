#!/usr/bin/env bash
# Free default dev ports before starting pnpm dev:all
PORTS=(3000 4321 5173 5174 8000)

for port in "${PORTS[@]}"; do
  pids=$(lsof -ti ":$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Freeing port $port (pid $pids)"
    kill -9 $pids 2>/dev/null || true
  fi
done
