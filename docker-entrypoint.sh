#!/bin/sh
set -eu

# Database schema management is NOT run from here. This slim runtime image ships
# only the Prisma client + query engine (what the app needs), not the full Prisma
# CLI toolchain. Schema push/migrations run as a separate one-off job that uses
# the build image with full dependencies — see the "migrate" service in
# docker-compose.yml. Keeping it separate also keeps this image small.

exec "$@"
