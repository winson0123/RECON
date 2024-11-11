FROM docker.io/library/node:18-alpine3.18
RUN npm install -g pnpm@8

WORKDIR /app
COPY \
	pnpm-workspace.yaml \
	package.json \
	pnpm-lock.yaml \
	.npmrc \
	./
COPY prisma/package.json ./prisma/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    cd prisma \
	&& PRISMA_SKIP_POSTINSTALL_GENERATE=true \
	&& pnpm install --frozen-lockfile

COPY prisma/schema.prisma ./prisma/

RUN pnpm exec prisma generate

WORKDIR /app/prisma
CMD ["pnpm exec prisma migrate deploy"]