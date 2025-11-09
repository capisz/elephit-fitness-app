FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
ENV NODE_ENV=production
ENV PORT=8080
CMD ["node", "--experimental-modules", "server.js"]
EXPOSE 8080
