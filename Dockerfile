# Base stage - set up pnpm and the environment
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Install production dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build stage - install all dependencies and build the app
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Final stage - minimal production image
FROM node:22-alpine AS production
WORKDIR /app

# Copy production dependencies and build output from previous stages
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY package.json ./

# Expose port and set environment
EXPOSE 3000
ENV NODE_ENV=production

# Start the app
CMD [ "node", "build" ]

