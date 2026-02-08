
# VTeam Project

Det här projektet innehåller en fullstack-applikation med backend, frontend, databas och en scooter-simulator. Allt körs via Docker för enkel utveckling och testning.

## Innehåll

- backend – Node.js API med autentisering (Google och GitHub) och Stripe-integration.
- frontend – Next.js-applikation för användargränssnittet och admingränssnittet.
- db – MongoDB-databas.
- simulator – Scooter-simulator som genererar data till backend.

## Förutsättningar

- Docker och Docker Compose installerade.
- Node.js (för lokal utveckling utanför Docker om nödvändigt).
- Internetanslutning för att ladda ned Docker-images och npm-paket.

## Installation

1. Klona projektet:
```bash
git clone <https://github.com/Daudnaw/vteam-bike.git>
cd <vteam-bike>
```

2. Bygg och starta alla tjänster med Docker Compose:

```bash
docker-compose up
```

Detta kommer att:

-Installera npm-paket i backend och frontend.

-Starta backend på http://localhost:3000
-Starta frontend på http://localhost:8080
-Starta MongoDB på port 27017.

Simulatorn kan köras separat om så önskas.

Om du vill köra simulatorn separat:
```bash
docker-compose run simulator
```

## Miljövariabler
### Backend

PORT – Port för backend (standard 3000)
NODE_ENV – Miljö (development/production)
MONGODB_DSN – MongoDB-anslutningssträng
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI – Callback URL för GitHub OAuth
GOOGLE_REDIRECT_URI – Callback URL för Google OAuth
FRONTEND_OAUTH_REDIRECT – Frontend OAuth callback URL
JWT_SECRET – Secret för JWT
STRIPE_PUBLISHABLE_KEY / STRIPE_SECRET_KEY

### Frontend

NODE_ENV – Miljö (development/production)
API_URL_INTERNAL – Backend URL internt i Docker
NEXT_PUBLIC_API_URL – Backend URL externt
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY – Stripe public key

### Simulator

NUMBER_OF_SCOOTERS – Antal scooters som simuleras
MONGODB_DSN – MongoDB-anslutning
BACKEND_BASE_URL – Backend URL
ROUTE_PROVIDER_API_URL / ROUTE_PROVIDER_API_KEY – Om du vill integrera en rutt-tjänst

### Hälsokontroller

Backend: http://localhost:3000/health
MongoDB: docker-compose healthcheck

### Volymer

Backend och frontend mappar synkroniseras för live-ändringar.
MongoDB-data lagras i ./data/db.

### Körning och utveckling

Frontend: http://localhost:8080

Backend: http://localhost:3000

Notera
Det finns ytterligare information om varje service, gå vidare och läs readme för frontend, backend och scooter-logic för att läsa mer.