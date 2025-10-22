## Build image
FROM node:18-alpine
WORKDIR /src

COPY package*.json ./
COPY .npmrc ./
RUN npm install

COPY . .
RUN npm run build


## Target image
FROM node:18-alpine
WORKDIR /app
ENV PORT=5000
EXPOSE 5000

COPY package*.json ./
COPY .npmrc ./
RUN npm install

COPY --from=0 /src/dist ./dist

CMD ["npm", "run", "start:prod"]
