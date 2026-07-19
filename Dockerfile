# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:22-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile=false

# ============================================================
# Stage 2: Builder
# ============================================================
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args (passed at build time)
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ARG NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME

ARG INTERNAL_API_SECRET
ENV INTERNAL_API_SECRET=$INTERNAL_API_SECRET

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============================================================
# Stage 3: Runner
# ============================================================
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ARG INTERNAL_API_SECRET
ENV INTERNAL_API_SECRET=$INTERNAL_API_SECRET

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=15s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const h={'x-internal-secret':'"$INTERNAL_API_SECRET"'};const e=()=>process.exit(1);const r=require('http').request({hostname:'localhost',port:3000,path:'/api/health',headers:h},(res)=>{process.exit(res.statusCode===200?0:1)});r.on('error',e);r.setTimeout(8000,()=>{r.destroy();e()})"

CMD ["node", "server.js"]
