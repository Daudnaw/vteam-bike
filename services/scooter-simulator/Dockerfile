FROM node:22-alpine

WORKDIR /app

COPY services/scooter-logic ./services/scooter-logic
COPY services/scooter-simulator ./services/scooter-simulator

WORKDIR /app/services/scooter-simulator
RUN npm install --omit=dev

CMD ["npm", "start"]

