# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/build /app/build
COPY --from=prerelease /app/static /app/static
COPY --from=prerelease package.json ./
# Copy script folder
COPY scripts /app/scripts
# Copy drizzle folder
COPY drizzle /app/drizzle

# Expose port and set environment
USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production

# Create volume for logs
VOLUME /app/logs

# Start the app
CMD [ "bun", "build" ]

