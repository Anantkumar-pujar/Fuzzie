# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# Schema-management tooling: the full dependency tree (incl. the Prisma CLI and
# its deps) plus the schema — but NOT the Next.js build. Used by the one-off
# "migrate" service to run `prisma db push` against a fresh database.
FROM node:20-bookworm-slim AS migrator
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_URL=http://localhost:3001
ARG NEXT_PUBLIC_DOMAIN=localhost:3001
ARG NEXT_PUBLIC_SCHEME=http
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
ARG NEXT_PUBLIC_GOOGLE_SCOPES=https://www.googleapis.com/auth/drive
ARG NEXT_PUBLIC_OAUTH2_ENDPOINT=https://accounts.google.com/o/oauth2/v2/auth
ARG NEXT_PUBLIC_UPLOAD_CARE_CSS_SRC=https://cdn.jsdelivr.net/npm/@uploadcare/blocks@
ARG NEXT_PUBLIC_UPLOAD_CARE_SRC_PACKAGE=/web/lr-file-uploader-regular.min.css
ARG NEXT_PUBLIC_DISCORD_REDIRECT=
ARG NEXT_PUBLIC_NOTION_AUTH_URL=
ARG NEXT_PUBLIC_SLACK_REDIRECT=
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_SCHEME=$NEXT_PUBLIC_SCHEME
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GOOGLE_SCOPES=$NEXT_PUBLIC_GOOGLE_SCOPES
ENV NEXT_PUBLIC_OAUTH2_ENDPOINT=$NEXT_PUBLIC_OAUTH2_ENDPOINT
ENV NEXT_PUBLIC_UPLOAD_CARE_CSS_SRC=$NEXT_PUBLIC_UPLOAD_CARE_CSS_SRC
ENV NEXT_PUBLIC_UPLOAD_CARE_SRC_PACKAGE=$NEXT_PUBLIC_UPLOAD_CARE_SRC_PACKAGE
ENV NEXT_PUBLIC_DISCORD_REDIRECT=$NEXT_PUBLIC_DISCORD_REDIRECT
ENV NEXT_PUBLIC_NOTION_AUTH_URL=$NEXT_PUBLIC_NOTION_AUTH_URL
ENV NEXT_PUBLIC_SLACK_REDIRECT=$NEXT_PUBLIC_SLACK_REDIRECT
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
