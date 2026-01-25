# scooter-logic

`scooter-logic` innehåller logiken för en elscooter.

Logiken

- håller ett aktuellt state
- ansluter till backend via WebSocket
- reagerar på start- och stoppkommandon
- skickar telemetri med intervall som bestäms av servern
- hanterar sensorer

---

## Översikt

En scooter består av:

- en `Scooter`-instans som ansvarar för livscykel och kommunikation med backend
- ett antal sensorer som var och en ansvarar för en del av scooterns state

Backend är det auktoritativa systemet och scootern rapporterar state och utför kommandon.

---

## Scooter

Klassen `Scooter` representerar en fysisk scooter.

Ansvarsområden:

- hantering av WebSocket-anslutning
- hantering av kommandon (`START`, `STOP`)
- hantering av körläge (`idle` / `active`)
- schemaläggning av telemetri
- upprätthållande av rapporterat state

Scootern håller:

- `mode`: internt körläge
- `state`: rapporterat state som skickas till backend

---

## Mode och status

Det finns en medveten skillnad mellan `mode` och `status`.

| Begrepp  | Omfattning      | Syfte                               |
| -------- | --------------- | ----------------------------------- |
| `mode`   | endast enhet    | styr beteende och telemetrifrekvens |
| `status` | enhet + backend | affärsmässigt synligt state         |

`mode` persisteras inte och finns inte i backend-schemat, utan ska ses som en del av scooterns livscykel för internt state.

---

## Sensorer

Sensorer enkapsulerar separata delar av scooterns data.

Varje sensor:

- äger ett definierat fält i scooterns state
- synkroniserar sitt värde till `scooter.state`
- kan vara autonom
- exponerar simulerings-API

Livscykel:

```js
sensor.start({ scooter });
sensor.getState();
sensor.stop();
```

Befintliga sensorer:

- LocationSensor → latitud / longitud
- SpeedSensor → hastighet i km/h
- BatterySensor → batterinivå (autonom, hastighetsberoende)

## Telemetri

Telemetribeteendet styrs av backend.

- Servern skickar telemetriintervall via `INIT`
- Separata intervall används för idle och active
- Telemetri planeras när:
  - körläge ändras
  - nya intervall tas emot

- Telemetrimeddelande skickas vid:
  - `INIT`
  - `START`
  - `STOP`

---

## WebSocket-protokoll

### HELLO

Skickas en gång vid anslutning.

```json
{
  "type": "HELLO",
  "scooterId": "scooter-123",
  "role": "device"
}
```

### INIT

```json
{
  "type": "INIT",
  "telemetry": {
    "idleIntervalMs": 5000,
    "activeIntervalMs": 1000
  },
  "state": {
    "status": "idle"
  }
}
```

### STATE

```json
{
  "type": "STATE",
  "status": "driving",
  "speedKmh": 18,
  "battery": 92,
  "lat": 47.49,
  "lon": 19.04
}
```

### CMD

```json
{
  "type": "CMD",
  "action": "START"
}
```

Kommandon:

- `START`
- `STOP`
