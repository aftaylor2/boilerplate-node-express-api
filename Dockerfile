# syntax=docker/dockerfile:1

###############################################################################
# Stage 1: production dependencies only
###############################################################################
FROM node:24-alpine AS deps

WORKDIR /app

# Copy manifests first so this layer is cached until dependencies change.
COPY package.json package-lock.json ./

# --omit=dev drops nothing today (there are no devDependencies) but keeps the
# image honest as the project grows. npm ci requires package-lock.json in the
# build context — see the note in README if a clean clone lacks one.
RUN npm ci --omit=dev && npm cache clean --force

###############################################################################
# Stage 2: runtime
###############################################################################
FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    TZ=UTC

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node server.js db.js ./
COPY --chown=node:node controllers/ ./controllers/
COPY --chown=node:node middleware/ ./middleware/
COPY --chown=node:node routes/ ./routes/
COPY --chown=node:node utils/ ./utils/

# Drop root. The `node` user (uid 1000) ships with the official image.
USER node

EXPOSE 3000

# server.js listens on 0.0.0.0, so the port is reachable from outside the
# container. Hits /healthz from routes/kubernetes.js; no curl in alpine, so
# use node's global fetch.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Exec form, so node is PID 1 and receives SIGTERM directly — server.js:69-70
# install handlers, which is what exempts it from the "PID 1 ignores unhandled
# signals" rule. No init shim needed: the app spawns no child processes, so
# there are no zombies to reap. Do NOT change this to shell form or to
# `npm run start` — the shell/npm would stay PID 1 and swallow the signal.
# If an init is ever wanted, `docker run --init` supplies one.
CMD ["node", "server.js"]
