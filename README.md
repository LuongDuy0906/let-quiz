# 🎯 LetQuiz - A Quiz Game Backend

A NestJS backend for an interactive quiz game platform with real-time multiplayer game sessions, user authentication, and comprehensive quiz management.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Google OAuth 2.0 integration
  - Role-based access control (RBAC)
  - Refresh token strategy

- **Quiz Management**
  - Create, update, delete quizzes
  - Support for multiple question types
  - Tag-based quiz categorization
  - Quiz status tracking (draft, published, archived)

- **Real-time Game Sessions**
  - WebSocket-based multiplayer game sessions
  - Real-time player tracking
  - Game metrics and statistics
  - Configurable game settings

- **Player Records & Leaderboard**
  - Track player performance
  - Record game history
  - Calculate player statistics

- **File Management**
  - Cloud-based file upload via Cloudinary
  - Image optimization and delivery

- **Email Notifications**
  - Password reset emails
  - Game notifications
  - Nodemailer integration

- **Caching & Performance**
  - Redis-based caching
  - Session management
  - Data optimization

## 📋 Prerequisites

- Node.js >= 18.x
- npm or yarn
- MongoDB (Atlas or local)
- Redis (Upstash or local)
- Cloudinary account (optional)
- Google OAuth credentials (optional)

## 🛠️ Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd let-quiz
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION_TIME` - JWT expiration (e.g., 15m)
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `REFRESH_TOKEN_EXPIRATION_TIME` - Refresh token expiration (e.g., 7d)

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `CLOUDINARY_*` - File upload credentials
- `MAIL_*` - Email service credentials

### 3. Run the Application

**Development:**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

**Debug Mode:**
```bash
npm run start:debug
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📚 API Documentation

Swagger API documentation is available at:
```
http://localhost:3000/api/document
```

## 🏗️ Project Structure

```
src/
├── config/                 # Application configuration
│   ├── validation.ts      # Environment validation
│   ├── jwt.config.ts
│   ├── refresh-token.config.ts
│   └── google-oauth.config.ts
├── common/                # Shared utilities & infrastructure
│   ├── decorators/        # Custom decorators (@Roles, etc.)
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards (JWT, Roles, etc.)
│   ├── interceptors/      # HTTP interceptors
│   ├── pipes/             # Custom pipes
│   ├── exceptions/        # Custom exception classes
│   ├── constants.ts       # App-wide constants
│   └── utils/             # Utility functions
├── enums/                 # Enums (UserRole, QuizStatus, etc.)
├── modules/               # Feature modules
│   ├── auth/              # Authentication module
│   │   ├── services/
│   │   ├── strategies/
│   │   ├── guards/
│   │   ├── dto/
│   │   └── auth.controller.ts
│   ├── user/              # User management
│   ├── quiz/              # Quiz management
│   ├── game-session/      # Real-time game sessions (WebSocket)
│   ├── player-record/     # Player statistics & history
│   ├── mail/              # Email service
│   └── cloudinary/        # File upload service
├── app.module.ts          # Root module
└── main.ts                # Bootstrap file
```

## 🔐 Authentication Flow

### JWT Authentication
```
1. User logs in with email/password
2. Server validates credentials
3. Returns access token + refresh token
4. Client stores tokens locally
5. Use access token in Authorization header for protected routes
```

### Google OAuth
```
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects back with authorization code
4. Server exchanges code for user info
5. Auto-creates/updates user account
6. Returns JWT tokens
```

## 🎮 Real-time Game Sessions

WebSocket connection for multiplayer game sessions:
```
ws://localhost:3000/game-session
```

Events:
- `createSession` - Create new game session
- `joinSession` - Join existing session
- `submitAnswer` - Submit answer during game
- `gameEnded` - Broadcast when game ends

## 📊 Database Schema Overview

### Collections:
- **users** - User accounts & profiles
- **quizzes** - Quiz data
- **game-sessions** - Active/completed game sessions
- **player-records** - Player performance records

## 🛡️ Security Features

- CORS enabled
- Input validation & sanitization
- JWT token-based authentication
- Role-based access control
- Exception filtering & error handling
- Environment validation on startup

## 📝 Code Style

- ESLint configuration
- Prettier code formatting
- TypeScript strict mode
- NestJS best practices

Commands:
```bash
# Lint
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## 📄 License

UNLICENSED

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using NestJS**
