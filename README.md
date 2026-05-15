# NanoURL Backend 🚀

A production-grade, high-performance URL shortening service built with Node.js, Express, and TypeScript. Designed for scalability with Redis caching, BullMQ background processing, and PostgreSQL persistence.

## 🌟 Features

- **High-Speed Redirection**: Sub-millisecond redirects using a cache-first strategy with Redis.
- **Secure Authentication**: JWT-based auth stored in `httpOnly` cookies for maximum security.
- **Async Analytics**: Click tracking is decoupled from redirects using BullMQ to ensure zero latency for users.
- **Advanced Statistics**: Real-time tracking of clicks, referrers, and user agents.
- **Rate Limiting**: Protection against brute-force and DDoS attacks.
- **Clean Architecture**: Domain-driven design following the Routes → Controller → Service pattern.

## 🛠️ Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Queue**: Redis & BullMQ
- **Validation**: Zod
- **Security**: JWT & bcrypt
- **Containerization**: Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nanourl-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root (refer to `.env.example`).
   ```bash
   cp .env.example .env
   ```

4. **Spin up Infrastructure**:
   ```bash
   docker-compose up -d
   ```

5. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

6. **Start Development Server**:
   ```bash
   # Terminal 1: API Server
   npm run dev

   # Terminal 2: Analytics Worker
   npm run worker
   ```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Authenticate and receive cookie
- `POST /api/auth/logout` - Clear auth cookie
- `GET /api/auth/me` - Get current user profile

### URLs
- `POST /api/urls` - Shorten a URL (Optional Auth)
- `GET /api/urls/me/links` - Get current user's links (Auth Required)
- `GET /:shortCode` - Redirect to long URL

### Analytics
- `GET /api/analytics/:shortCode/stats` - Get detailed click statistics

## 🏗️ Architecture

For a deep dive into the system design, data flow, and architectural decisions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📄 License

MIT License.
