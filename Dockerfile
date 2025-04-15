# Use a specific Node.js version for better reproducibility
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

# Needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with better error handling
RUN pnpm install --frozen-lockfile || (echo "pnpm install failed" && exit 1)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line to disable telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permissions for the app directory
RUN mkdir -p /app/hooks && \
    chown -R nextjs:nodejs /app

# Copy build output and necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/hooks ./hooks
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Set proper permissions for the hooks directory so we can write to it
RUN chmod 777 /app/hooks

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Start the Next.js application
CMD ["pnpm", "start"]