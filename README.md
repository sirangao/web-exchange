# CampusExchange

A secondhand marketplace for college students — buy, sell, and exchange items with peers on campus.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (localhost:3000)                     │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    React Frontend (SPA)                     │   │
│   │                                                             │   │
│   │  Pages: Home · Listing Detail · Create/Edit · My Listings  │   │
│   │         Meetups · Profile · Login · Register                │   │
│   │                                                             │   │
│   │  State: AuthContext (JWT) · React Router · Axios            │   │
│   └──────────────────────┬──────────────────────────────────────┘   │
└──────────────────────────│──────────────────────────────────────────┘
                           │  HTTP/REST  (proxied via CRA → Tomcat)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Apache Tomcat (localhost:8080)                     │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │          Java Backend  (WAR: web-exchange.war)              │   │
│   │                                                             │   │
│   │  Filters: CorsFilter → AuthFilter (JWT verify)             │   │
│   │                                                             │   │
│   │  Controllers (JAX-RS / Jersey):                            │   │
│   │   /api/auth/*        AuthController                        │   │
│   │   /api/listings/*    ListingController (multipart upload)  │   │
│   │   /api/categories    CategoryController                    │   │
│   │   /api/meetups/*     MeetupController                      │   │
│   │                                                             │   │
│   │  Repositories (JDBC):                                       │   │
│   │   UserRepository · ListingRepository · MeetupRepository    │   │
│   │                                                             │   │
│   │  Utilities:  JwtUtil (JJWT) · BCrypt · HikariCP pool       │   │
│   └──────────────────────┬──────────────────────────────────────┘   │
└──────────────────────────│──────────────────────────────────────────┘
                           │  JDBC / HikariCP connection pool
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  MySQL  (localhost:3306 · db: web_exchange)          │
│                                                                     │
│   Tables:                                                           │
│   ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐      │
│   │  users   │  │   listings   │  │  listing_payment_methods│      │
│   └────┬─────┘  └──────┬───────┘  └────────────┬────────────┘      │
│        │               │                        │                   │
│        └───────────────┼────────────────────────┘                   │
│                        │                                            │
│                  ┌─────▼──────┐   ┌────────────┐                   │
│                  │  meetups   │   │ categories │                   │
│                  └────────────┘   └────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  /uploads/  │  (local filesystem — item images)
                    └─────────────┘
```

---

## Project Structure

```
web-exchange/
├── README.md
├── database/
│   └── schema.sql                  ← Run this first
├── backend/                        ← Maven WAR project
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/webexchange/
│       │   ├── config/             ← DB, JWT, CORS, Auth filters
│       │   ├── controller/         ← REST endpoints (JAX-RS)
│       │   ├── model/              ← User, Listing, Meetup POJOs
│       │   └── repository/         ← JDBC DAOs
│       ├── resources/
│       │   └── db.properties       ← ⚠️  Edit DB credentials here
│       └── webapp/WEB-INF/
│           └── web.xml
└── frontend/                       ← Create React App
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js / index.css
        ├── context/AuthContext.js
        ├── utils/api.js
        ├── components/             ← Navbar, ListingCard, PrivateRoute
        └── pages/                  ← HomePage, Detail, Create, ...
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 11+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Apache Tomcat | 10.x |

---

## Setup & Deployment

### 1 — Create the Database

```bash
/usr/local/mysql/bin/mysql -u root -p < database/schema.sql
```

### 2 — Configure the Backend

Edit `backend/src/main/resources/db.properties`:

```properties
db.url=jdbc:mysql://localhost:3306/web_exchange?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
db.username=root
db.password=YOUR_MYSQL_PASSWORD

jwt.secret=REPLACE_WITH_32+_CHAR_RANDOM_STRING
jwt.expiry.hours=24

upload.dir=/Users/sirangao/Documents/programming/github/sirangao/web-exchange/uploads
```

Create the upload directory:

```bash
mkdir -p /Users/sirangao/Documents/programming/github/sirangao/web-exchange/uploads
```

### 3 — Build the Backend WAR

```bash
cd backend
mvn clean package -DskipTests
# Output: backend/target/web-exchange.war
```

### 4 — Deploy to Tomcat

Find your Tomcat installation (common macOS paths):

```bash
# Homebrew install
ls /usr/local/opt/tomcat/libexec/webapps/
# or
ls /opt/homebrew/opt/tomcat/libexec/webapps/

# Manual install
ls ~/apache-tomcat-*/webapps/
```

Copy the WAR to Tomcat's `webapps/` directory:

```bash
# Example — adjust TOMCAT_HOME to your actual path:
export TOMCAT_HOME=/usr/local/opt/tomcat/libexec

cp backend/target/web-exchange.war $TOMCAT_HOME/webapps/

# Start Tomcat (if not running)
$TOMCAT_HOME/bin/startup.sh

# Verify deployment — should return JSON
curl http://localhost:8080/web-exchange/api/categories
```

To stop Tomcat:

```bash
$TOMCAT_HOME/bin/shutdown.sh
```

### 5 — Run the Frontend

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

The React dev server proxies `/api/*` requests to `http://localhost:8080`
(configured via `"proxy"` in `frontend/package.json`).

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update profile |
| GET | `/api/listings` | No | List all available |
| GET | `/api/listings?type=sell&category=Textbooks` | No | Filtered listings |
| GET | `/api/listings/{id}` | No | Single listing |
| GET | `/api/listings/my` | Yes | Current user's listings |
| POST | `/api/listings` | Yes | Create listing (multipart) |
| PUT | `/api/listings/{id}` | Yes | Update listing |
| DELETE | `/api/listings/{id}` | Yes | Delete listing |
| GET | `/api/categories` | No | All categories |
| GET | `/api/meetups/my` | Yes | User's meetups |
| POST | `/api/meetups` | Yes | Propose meetup |
| PUT | `/api/meetups/{id}/status` | Yes | Update meetup status |

---

## Database Schema

```
users                listings                     meetups
─────                ────────                     ───────
id (PK)              id (PK)                      id (PK)
username             user_id (FK→users)           listing_id (FK)
password (bcrypt)    title                        buyer_id (FK→users)
email                description                  seller_id (FK→users)
phone                category_id (FK→categories) location
college              listing_type (sell|exchange|both)  proposed_time
created_at           price                        status
                     condition_grade              notes
categories           status                       created_at
──────────           image_url
id (PK)              created_at          listing_payment_methods
name                                     ───────────────────────
                                         listing_id (FK)
                                         method (paypal|venmo|zelle|cash)
```

---

## Tech Stack

**Frontend:** React 18 · React Router 6 · Axios · Google Fonts (Syne + DM Sans)

**Backend:** Java 11 · JAX-RS (Jersey 3) · JJWT · BCrypt · HikariCP · Jackson

**Database:** MySQL 8 · JDBC

**Server:** Apache Tomcat 10

**Build:** Maven (WAR) · Create React App

---

## Notes

- Payment is **never processed** on this site — sellers list preferred methods (PayPal, Venmo, Zelle, Cash) and buyers contact them directly.
- Meetup locations are agreed upon inside the app; actual exchange happens in person.
- Images are stored on the local filesystem under `upload.dir`.
- For production, replace the JWT secret, use HTTPS, and consider storing images in S3 or similar.
