FROM node:22-alpine
WORKDIR /app
COPY .next ./.next
COPY package*.json ./
COPY public ./public
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "start"]