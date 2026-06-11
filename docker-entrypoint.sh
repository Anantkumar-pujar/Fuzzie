#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  if [ -d "prisma/migrations" ]; then
    echo "Running Prisma migrations..."
    npx --no-install prisma migrate deploy
  else
    echo "Skipping Prisma migrations because prisma/migrations does not exist yet."
  fi
fi

exec "$@"
