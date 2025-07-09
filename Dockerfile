FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN cp .env.example .env

EXPOSE 5011

ENTRYPOINT ["npm", "start"]