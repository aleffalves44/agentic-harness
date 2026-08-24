# syntax=docker/dockerfile:1.7
# Build stage: clone dsh, install, build (lib + web frontend).
FROM node:24-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

WORKDIR /build

# Clone dsh at the pinned version and build it. Building from source (instead
# of `npm install @deepseek-ai/dsh`) is what makes the `web` profile resolve
# its bundles: the pnpm workspace already links every @deepseek-ai/dsh-*
# package, so the profile's loader finds them without a separate
# `dsh plugin install` step.
ARG DSH_REF=0.1.1-rc.2
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    git clone --depth=1 --branch v${DSH_REF} https://github.com/deepseek-ai/deepseek-harness.git /build/dsh \
    || git clone --depth=1 https://github.com/deepseek-ai/deepseek-harness.git /build/dsh

WORKDIR /build/dsh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile && pnpm run build

# Runtime stage: keep only built dsh + the project overlay.
FROM node:24-bookworm-slim AS runtime

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

# Copy the built dsh workspace (node_modules + lib + dist + source for tsx launcher).
# We keep the whole tree because the web profile loader resolves bundles from
# the workspace's node_modules, and the CLI source-launch path needs tsx.
WORKDIR /app
COPY --from=builder /build/dsh /app/dsh

# Copy the agentic-harness project (overlay, skills, contracts, bin, agents.md).
COPY . /app/agentic-harness

# Link dsh into the project's node_modules so bin/cli.js resolves it via its
# standard search path (node_modules/@deepseek-ai/dsh/...).
RUN mkdir -p /app/agentic-harness/node_modules/@deepseek-ai \
    && ln -sf /app/dsh /app/agentic-harness/node_modules/@deepseek-ai/dsh

WORKDIR /app/agentic-harness

# Default provider key (override at runtime). Empty by default — the UI's
# Models page writes real keys into $DSH_HOME/.credentials.yaml.
ENV OLLAMA_API_KEY= \
    ANTHROPIC_API_KEY= \
    OPENAI_API_KEY= \
    DSH_HOME=/root/.dsh

EXPOSE 3080

# The dsh web app refuses --host 0.0.0.0 (RCE safety). Run it on 127.0.0.1
# inside the container; the compose file fronts it with caddy reverse proxy
# that exposes :3080 on the host and forwards to 127.0.0.1:3080.
ENTRYPOINT ["node", "bin/cli.js"]
CMD ["web", "--port", "3080"]