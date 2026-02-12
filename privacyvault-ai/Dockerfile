# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build -w shared && npm run build -w frontend && npm run build -w backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist
COPY --from=build /app/shared /app/shared
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
EXPOSE 8080
CMD ["node", "backend/src/server.js"]
