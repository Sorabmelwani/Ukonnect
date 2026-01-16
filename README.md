# UKonnect

A comprehensive platform designed to help newcomers to the UK navigate their transition smoothly. UKonnect provides personalized task management, document organization, local service discovery, community support, and AI-powered assistance to ensure visa compliance and successful integration.

## 🌟 Features

### Core Functionality
- **🔐 User Authentication** - Secure JWT-based authentication with refresh tokens
- **📋 Task Management** - Personalized task lists with priorities, categories, and due dates
- **📁 Document Manager** - Upload, organize, and manage important documents
- **🏥 Local Services** - Discover healthcare, banking, mobile, and other essential services by city
- **👥 Community Hub** - Connect with other newcomers through posts and discussions
- **🤖 AI Assistant** - Get instant answers to your questions about UK life
- **📅 Smart Reminders** - Automated reminders for important deadlines and tasks
- **🛂 Visa Compliance** - Track visa expiry dates and stay compliant with requirements
- **⚙️ Profile Settings** - Customize privacy settings and notification preferences

### Key Highlights
- **Personalized Experience** - Tasks and recommendations based on your visa type, location, and purpose
- **Dark/Light Theme** - Modern UI with theme switching
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Secure File Uploads** - Safe document storage with proper validation
- **Real-time Updates** - Stay informed with timely notifications

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT (Access & Refresh Tokens)
- **AI Integration**: OpenAI API
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcrypt
- **Task Scheduling**: node-cron for reminders

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: CSS3 with custom theming

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone 
cd Ukonnect
```

### 2. Install Dependencies

Install dependencies for all projects:

```bash
npm run install:all
```

Or install them individually:

```bash
# Root dependencies
npm install

# Backend dependencies
npm install --prefix Backend

# Frontend dependencies
npm install --prefix UKConnect
```

### 3. Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Database
DATABASE_URL="file:./prisma/dev.db"

# OpenAI (optional, for AI features)
OPENAI_API_KEY=your-openai-api-key-here
```

**Generate JWT secrets:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Frontend Environment Variables

Create a `.env` file in the `UKConnect` directory (if needed):

```env
VITE_API_URL=http://localhost:4000
```

### 4. Database Setup

```bash
# Navigate to Backend directory
cd Backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database with initial data
npm run prisma:seed
```

### 5. Run the Application

From the root directory, run both backend and frontend simultaneously:

```bash
npm run dev
```

This will start:
- **Backend API** on `http://localhost:4000`
- **Frontend App** on `http://localhost:5173` (or the port Vite assigns)

### Individual Commands

You can also run them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## 📁 Project Structure

```
Ukonnect/
├── Backend/                 # Express.js API Server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── jobs/           # Background jobs (reminders)
│   │   ├── lib/            # Shared libraries (Prisma client)
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── index.ts        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
│
├── UKConnect/              # React Frontend Application
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Theme)
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS stylesheets
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── package.json            # Root package.json with dev scripts
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Tasks
- `GET /tasks` - Get user tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Documents
- `GET /documents` - Get user documents
- `POST /documents` - Upload a document
- `DELETE /documents/:id` - Delete a document

### Dashboard
- `GET /dashboard` - Get dashboard data (tasks, documents, stats)

### Services
- `GET /services` - Get local services (filterable by city/category)

### Community
- `GET /community` - Get community posts
- `POST /community` - Create a post
- `POST /community/:id/replies` - Reply to a post

### AI
- `POST /ai/chat` - Chat with AI assistant

### Reminders
- `GET /reminders` - Get user reminders
- `POST /reminders` - Create a reminder

### Profile
- `GET /me` - Get current user profile
- `PUT /me` - Update profile

## 🧪 Testing

```bash
# Run backend tests
cd Backend
npm test
```

## 🏗️ Building for Production

```bash
# Build both projects
npm run build

# Or build individually
cd Backend && npm run build
cd UKConnect && npm run build
```

## 📝 Database Management

### Prisma Studio
View and edit your database with Prisma Studio:

```bash
cd Backend
npm run prisma:studio
```

### Create a Migration
```bash
cd Backend
npm run prisma:migrate
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Refresh token rotation
- Helmet.js for security headers
- CORS configuration
- File upload validation
- Input validation with Zod