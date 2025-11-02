 
FROM node:22-alpine3.21
RUN apk update && apk upgrade
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]