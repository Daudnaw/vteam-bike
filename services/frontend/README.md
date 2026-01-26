# Dokumentation för frontend

## Om frontend

Frontend är uppbygd med ramverket `Next.js` som i sin tur är ett ramverk byggd på `React`.

Paket som används:

-   `jsonwebtoken`
-   `jwt-decode`
-   `leaflet`
-   `lucide-react`
-   `react-leaflet`
-   `react-leaflet-cluster`
-   `react-toastify`

Stylingen är gjord med `tailwindcss`.

Färger som används:

-   background: #f3f4f6;
-   text: #1f2937;
-   detail-mint: #10b981;
-   detail-yellow: #facc15;
-   detail-red: #ef4444;
-   primary-dark: #1e40af;
-   primary: #3b82f6;
-   primary-light: #93c5fd;

## Struktur

Frontend är uppbygd i två större delar kan man säga. Det är två applikationer som körs via den, både `användar appen` och `webb gränsnittet` för både admin och användare.

Vid start av applikationen möts man av ett val `Användarapp` eller `Webb version` och beroende på vilket val man gör så skickas man vidare till korrekt del av applikationen. I vår mapp struktur kan man se att vi delat upp det i `(userapp)` och `(webb)`.

I vår `webb version` har vi delat upp `admin` och `user` då funktionalitet skiljer sig kring de båda. Allt som har med `admin` att göra hanterar vi i `(webb)/(admin)` och allt som har med user att göra hanterar vi i `(webb)/(user)`.

Alla api anrop till backend gör vi i mappen `actions`.

Komponenter som byggts och återanvänds i våra sidor finns under `components`.
