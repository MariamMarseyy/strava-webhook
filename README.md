# Strava Webhook Listener (NestJS + PostgreSQL)

## 📌 Description
This is a backend-only application built using **NestJS** and **PostgreSQL** that integrates with the **Strava Webhook Events API**. It listens for activity creation events from Strava, fetches full activity data, and stores it in a PostgreSQL database.

The application is fully containerized using **Docker**, and can be started using **Docker Compose**.

#### ✅ Includes unit tests for controller and service layers.

---

## 🚀 Tech Stack
- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

---

## 📁 Project Structure
```
strava-webhook/ # Backend code (NestJS)
├── src/             
│   ├── modules/
├── .env
├── Dockerfile
├── docker-compose.yml    # Docker Compose config
└── db_data/              # PostgreSQL data volume
```

---

## ⚙️ How to Run

### 1. Clone the repository
```bash
git clone <repository_url>
cd project-root
```

### 2. Setup environment variables

Copy `.env.example` to `.env` inside the `backend/` directory:
```bash
cd backend
cp .env.example .env
```

Update the `.env` values with your Strava credentials and webhook configuration.

### 3. Run with Docker Compose
```bash
docker-compose up -d
```

---

## 🌐 Services & Ports
| Service  | URL                          |
|----------|------------------------------|
| Backend  | http://localhost:3000        |
| Database | postgresql://localhost:5432  |

---

## 🛑 Stopping the Application
To stop and remove all containers:
```bash
docker-compose down
```

---

## 📝 Notes
- PostgreSQL data is persisted in the `db_data/` volume.
- Ensure that the `.env` file is configured properly before running the backend service.
- Webhook verification and activity ingestion are handled through the `/strava/webhook` endpoint.

---

## 🛠 Troubleshooting
- **Docker Issues:** Ensure Docker & Docker Compose are installed and running correctly.
- **Port Conflicts:** Confirm that port `3000` and `5432` are not already in use on your system.
- **Strava API Access:** Verify that your `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` are correct and that your callback URL is whitelisted in your Strava app settings.

---

## 📮 Webhook Setup
To receive activity events from Strava:
1. Expose your `/strava/webhook` endpoint publicly (e.g., using [ngrok](https://ngrok.com/)).
2. Register your webhook subscription via the Strava API.
3. Verify that your endpoint responds to the `hub.challenge` verification request.

---

## ✅ Example `.env`
```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/strava/oauth/callback
STRAVA_VERIFY_TOKEN=STRAVA
STRAVA_API_BASE_URL=https://www.strava.com/api/v3

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=strava_db
```

---

