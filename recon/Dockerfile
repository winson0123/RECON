FROM docker.io/library/node:18-alpine3.18
RUN npm install -g pnpm@8

WORKDIR /app

COPY \
	pnpm-workspace.yaml \
	package.json \
	pnpm-lock.yaml \
	.npmrc \
	./

COPY recon/package.json ./recon/

COPY prisma/package.json ./prisma/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    cd recon \
	&& PRISMA_SKIP_POSTINSTALL_GENERATE=true \
	&& pnpm install --frozen-lockfile


COPY prisma/ ./prisma/
COPY recon/src/ ./recon/src/

COPY \
    recon/next.config.mjs \
    recon/postcss.config.mjs \
    recon/tailwind.config.ts \
    recon/tsconfig.json \
    ./recon/

RUN pnpm exec prisma generate
# RUN cd recon \
#     && pnpm build

WORKDIR /app/recon
ENTRYPOINT ["pnpm", "dev"]