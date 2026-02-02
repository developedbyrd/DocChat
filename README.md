# DocChat - AI-Powered PDF Intelligence Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18.0+-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)
![React](https://img.shields.io/badge/react-19.1.1-61DAFB.svg)
![MongoDB](https://img.shields.io/badge/mongodb-8.19.2-green.svg)

**Production-ready full-stack application for intelligent PDF document conversations**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Performance](#-performance)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

DocChat is an enterprise-grade document intelligence platform that enables users to interact with PDF documents through natural language conversations powered by AI. Users can upload PDFs, ask questions, and receive contextual answers with page citations.

### Key Features

- 📄 **PDF Upload & Management** - Drag-and-drop upload with real-time validation
- 💬 **AI-Powered Chat** - Context-aware responses with OpenRouter integration
- 📖 **PDF Viewer** - Built-in viewer with zoom and page navigation
- 💾 **Persistent Storage** - MongoDB for documents and conversation history
- ⚡ **Optimistic Updates** - Instant UI feedback with React Query
- 🎨 **Modern UI** - Responsive design with dark mode support

---

## ✨ Features

### Document Management
- Upload PDF files (max 10MB) via drag-and-drop or file picker
- PDFs stored as Base64 in MongoDB (no file system dependency)
- View all uploaded documents in a grid layout
- Delete documents with confirmation
- Real-time file validation (PDF only)
- Automatic metadata extraction (title, size, upload date)

### Intelligent Conversations
- Ask questions about PDF content in natural language
- AI-powered responses with page citations
- Persistent conversation history per document
- Optimistic UI updates for instant message display
- Loading states during AI processing

### User Experience
- Responsive design (mobile, tablet, desktop)
- Dark mode with system preference detection
- Toast notifications for user feedback
- Smooth animations and transitions
- PDF viewer with zoom controls and page navigation

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework with latest features |
| **TypeScript** | 5.9.3 | Type safety and better DX |
| **Vite** | 7.1.7 | Fast build tool and dev server |
| **TanStack Query** | 5.90.5 | Server state management with caching |
| **React Router** | 7.9.5 | Client-side routing |
| **TailwindCSS** | 4.1.16 | Utility-first CSS framework |
| **Shadcn/ui** | Latest | Accessible component library |
| **React PDF** | 10.2.0 | PDF rendering in browser |
| **Sonner** | 2.0.7 | Toast notifications |
| **Lucide React** | 0.552.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.1.0 | Web framework |
| **TypeScript** | 5.9.3 | Type safety |
| **MongoDB** | 6.0+ | NoSQL database |
| **Mongoose** | 8.19.2 | MongoDB ODM |
| **Multer** | 2.0.2 | File upload middleware |
| **PDF-Parse** | 1.1.1 | PDF text extraction |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Dotenv** | 17.2.3 | Environment variable management |

### Development Tools

- **Nodemon** (3.1.10) - Auto-restart server on changes
- **ts-node** (10.9.2) - TypeScript execution
- **ESLint** (9.36.0) - Code linting
- **Vite** - Hot module replacement

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   React UI   │  │ React Query  │  │  React PDF   │ │
│  │  Components  │  │    Cache     │  │    Viewer    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                   Backend Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Routes     │→ │ Controllers  │→ │  Services    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                                      │
    ┌────▼────┐                            ┌────▼────┐
    │ MongoDB │                            │   AI    │
    │ (PDFs + │                            │   API   │
    │  Data)  │                            └─────────┘
    └─────────┘
```

### Data Flow

1. **Upload Flow**: User uploads PDF → Multer processes → PDF converted to Base64 → Stored in MongoDB → Temp file deleted
2. **Chat Flow**: User sends message → Optimistic update → API call → AI processes → Response with citations → Cache update
3. **View Flow**: User selects document → Fetch PDF from MongoDB → Convert Base64 to blob → Display PDF and chat

---

## 📦 Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: v6.0 or higher ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **OpenRouter API Key**: ([Get Key](https://openrouter.ai/))
- **npm**: v9.0.0 or higher

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd DocChat
```

### Step 2: Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file in `Backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/docchat
PORT=3000
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Step 3: Frontend Setup

```bash
cd ../Frontend
npm install
```

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Step 5: Verify Installation

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017

---

## ⚙️ Configuration

### Backend Environment Variables

Create `.env` file in `Backend/` directory:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | - |
| `PORT` | Server port | ❌ | 3000 |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | ✅ | - |

**Example `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/docchat
PORT=3000
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### Frontend Configuration

API base URL is configured in `Frontend/src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

For production, update to your deployed backend URL.

### MongoDB Setup

#### Local MongoDB

```bash
# Windows: Download installer from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data
```

#### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (Free M0 tier available)
3. Create database user with password
4. Whitelist IP: `0.0.0.0/0` (development) or specific IPs (production)
5. Get connection string from "Connect" → "Connect your application"
6. Update `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docchat
   ```

### OpenRouter API Setup

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for account
3. Navigate to API Keys section
4. Generate new API key
5. Add to `.env` as `OPENROUTER_API_KEY`

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

### Endpoints

#### Documents API

##### 1. Upload Document

```http
POST /api/documents/upload
Content-Type: multipart/form-data

Request Body:
- file: PDF file (max 10MB)

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "document.pdf",
  "filePath": "uploads/1234567890-document.pdf",
  "fileSize": 1048576,
  "fileData": "base64_encoded_pdf_string",
  "uploadedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 400: Invalid file type or size
- 500: Server error
```

##### 2. Get All Documents

```http
GET /api/documents

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "document.pdf",
    "filePath": "uploads/1234567890-document.pdf",
    "fileSize": 1048576,
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

##### 3. Get Single Document

```http
GET /api/documents/:id

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "document.pdf",
  "filePath": "uploads/1234567890-document.pdf",
  "fileSize": 1048576,
  "fileData": "base64_encoded_pdf_string",
  "uploadedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 404: Document not found
```

##### 4. Download Document PDF

```http
GET /api/documents/:id/download

Response: 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="document.pdf"

[Binary PDF Data]

Errors:
- 404: Document not found
```

##### 5. Delete Document

```http
DELETE /api/documents/:id

Response: 200 OK
{
  "message": "Document deleted successfully"
}

Errors:
- 404: Document not found
- 500: Server error
```

#### Conversations API

##### 6. Get Conversation

```http
GET /api/conversations?documentId=:documentId

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439012",
  "documentId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00.000Z"
}

Response: 404 (if not exists)
null
```

##### 7. Create Conversation

```http
POST /api/conversations
Content-Type: application/json

Request Body:
{
  "documentId": "507f1f77bcf86cd799439011"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439012",
  "documentId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

##### 8. Get Messages

```http
GET /api/conversations/:conversationId/messages

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "conversationId": "507f1f77bcf86cd799439012",
    "role": "user",
    "content": "What is this document about?",
    "createdAt": "2024-01-15T10:31:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "conversationId": "507f1f77bcf86cd799439012",
    "role": "assistant",
    "content": "This document discusses...",
    "citations": [
      {
        "page": 1,
        "text": "relevant excerpt"
      }
    ],
    "createdAt": "2024-01-15T10:31:05.000Z"
  }
]
```

##### 9. Send Message

```http
POST /api/conversations/:conversationId/messages
Content-Type: application/json

Request Body:
{
  "content": "What is this document about?"
}

Response: 200 OK
{
  "userMessage": {
    "_id": "507f1f77bcf86cd799439013",
    "conversationId": "507f1f77bcf86cd799439012",
    "role": "user",
    "content": "What is this document about?",
    "createdAt": "2024-01-15T10:31:00.000Z"
  },
  "aiResponse": {
    "_id": "507f1f77bcf86cd799439014",
    "conversationId": "507f1f77bcf86cd799439012",
    "role": "assistant",
    "content": "This document discusses...",
    "citations": [
      {
        "page": 1,
        "text": "relevant excerpt"
      }
    ],
    "createdAt": "2024-01-15T10:31:05.000Z"
  }
}

Errors:
- 400: Invalid request
- 404: Conversation not found
- 500: AI service error
```

---

## 📁 Project Structure

```
DocChat/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.config.ts      # MongoDB connection setup
│   │   │   └── multer.config.ts        # File upload configuration (temp)
│   │   ├── controllers/
│   │   │   ├── conversation.controller.ts  # Conversation logic
│   │   │   ├── document.controller.ts      # Document CRUD operations
│   │   │   └── message.controller.ts       # Message handling & AI
│   │   ├── models/
│   │   │   ├── Conversation.model.ts   # Conversation schema
│   │   │   ├── Document.model.ts       # Document schema (with Base64 storage)
│   │   │   └── Message.model.ts        # Message schema
│   │   ├── routes/
│   │   │   ├── conversation.routes.ts  # Conversation endpoints
│   │   │   └── document.routes.ts      # Document endpoints + download
│   │   ├── services/
│   │   │   ├── conversation.service.ts # Conversation business logic
│   │   │   ├── document.service.ts     # Document business logic (Base64 conversion)
│   │   │   └── message.service.ts      # Message & AI service
│   │   └── server.ts                   # Express app entry point
│   ├── uploads/                        # Temp folder (auto-cleaned)
│   ├── .env                            # Environment variables
│   ├── nodemon.json                    # Nodemon configuration
│   ├── package.json                    # Backend dependencies
│   └── tsconfig.json                   # TypeScript config
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # Shadcn UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   ├── ChatInterface.tsx       # Chat UI component
│   │   │   ├── DocumentUpload.tsx      # Upload component
│   │   │   └── PDFViewer.tsx           # PDF viewer component
│   │   ├── hooks/
│   │   │   ├── useConversations.ts     # Conversation React Query hooks
│   │   │   └── useDocuments.ts         # Document React Query hooks
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client functions
│   │   │   ├── react-query.ts          # React Query configuration
│   │   │   └── utils.ts                # Utility functions
│   │   ├── pages/
│   │   │   ├── Document.tsx            # Document view page
│   │   │   ├── Home.tsx                # Home page
│   │   │   └── NotFound.tsx            # 404 page
│   │   ├── App.tsx                     # Root component with routing
│   │   ├── index.css                   # Global styles
│   │   └── main.tsx                    # React entry point
│   ├── public/                         # Static assets
│   ├── .gitignore
│   ├── components.json                 # Shadcn config
│   ├── eslint.config.js                # ESLint configuration
│   ├── index.html                      # HTML template
│   ├── package.json                    # Frontend dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── tsconfig.app.json               # App TypeScript config
│   ├── tsconfig.node.json              # Node TypeScript config
│   └── vite.config.ts                  # Vite configuration
│
└── README.md                           # This file
```

---

## 💻 Development

### Available Scripts

#### Backend Scripts

```bash
npm run dev          # Start development server with nodemon (auto-restart)
npm run build        # Compile TypeScript to JavaScript (output: dist/)
npm start            # Start production server (requires build first)
```

#### Frontend Scripts

```bash
npm run dev          # Start Vite dev server on port 5173
npm run build        # Build for production (output: dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
```

### Development Workflow

1. **Start Backend**
   ```bash
   cd Backend
   npm run dev
   ```
   Server runs on http://localhost:3000 with auto-reload

2. **Start Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```
   App runs on http://localhost:5173 with HMR

3. **Make Changes**
   - Backend: Edit files in `Backend/src/` - nodemon auto-restarts
   - Frontend: Edit files in `Frontend/src/` - Vite hot-reloads

4. **Test Changes**
   - Upload a PDF document
   - Open document and test chat functionality
   - Check browser console and terminal for errors

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming Conventions**:
  - Files: `kebab-case.ts` (e.g., `document.controller.ts`)
  - Components: `PascalCase.tsx` (e.g., `ChatInterface.tsx`)
  - Variables/Functions: `camelCase` (e.g., `uploadDocument`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Test additions or changes
chore: Build process or dependency updates
```

---

## 🚀 Deployment

### Production Build

#### Backend

```bash
cd Backend
npm run build        # Compiles TypeScript to dist/
npm start            # Runs compiled JavaScript
```

**Output**: `dist/` directory with compiled JavaScript files

**Note**: No `/uploads` folder needed in production - PDFs stored in MongoDB

#### Frontend

```bash
cd Frontend
npm run build        # Creates optimized production build
```

**Output**: `dist/` directory with static files ready for deployment

### Environment Configuration

**Production `.env` (Backend):**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/docchat
PORT=3000
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
NODE_ENV=production
```

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection secured (Atlas recommended)
- [ ] MongoDB storage limits verified (16MB per document)
- [ ] CORS origins restricted to production domain
- [ ] HTTPS enabled
- [ ] File upload limits verified (10MB max)
- [ ] API keys secured (not in code)
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] Monitoring setup (optional)

### Deployment Platforms

**Recommended Setup:**
- **Frontend**: Vercel / Netlify / Cloudflare Pages
- **Backend**: Render / Railway / Fly.io / Heroku
- **Database**: MongoDB Atlas (Free M0 tier)

**Why this works:**
- No file system dependency (PDFs in MongoDB)
- Works on ephemeral file systems (Render, Railway, etc.)
- Easy to scale and deploy
- No external storage services needed

---

## ⚡ Performance

### Optimization Techniques

#### Frontend Optimizations

1. **React Query Caching**
   - 5-minute stale time for documents
   - Automatic background refetching
   - Optimistic updates for instant UI feedback

2. **Code Splitting**
   - Route-based lazy loading with React Router
   - Dynamic imports for heavy components

3. **PDF Rendering**
   - Lazy loading of PDF pages
   - Canvas-based rendering for performance

4. **Bundle Optimization**
   - Vite's automatic code splitting
   - Tree shaking for unused code
   - Minification and compression

#### Backend Optimizations

1. **Database Indexing**
   - Indexed queries on `_id` and `documentId`
   - Mongoose automatic indexing

2. **File Handling**
   - PDFs stored as Base64 in MongoDB
   - Temp files deleted immediately after upload
   - No file system dependency (cloud-ready)

3. **API Response**
   - JSON compression
   - Efficient query patterns
   - Binary PDF streaming via download endpoint

## 🔒 Security

### Implemented Security Measures

1. **Environment Variables**
   - All secrets in `.env` file
   - `.env` in `.gitignore`
   - No hardcoded credentials

2. **Input Validation**
   - File type validation (PDF only)
   - File size limits (10MB max)
   - Content-Type verification

3. **CORS Configuration**
   - Configured in `server.ts`
   - Restrict origins in production

4. **MongoDB Security**
   - Mongoose schema validation
   - Protection against injection attacks
   - Connection timeout handling

5. **File Storage**
   - PDFs stored in MongoDB as Base64
   - No persistent file system required
   - Temp files auto-deleted after processing

### Security Best Practices

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update
```

### Production Security Recommendations

- [ ] Implement authentication (JWT/OAuth)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Enable HTTPS/SSL
- [ ] Add request validation (express-validator)
- [ ] Implement file scanning for malware
- [ ] Add security headers (helmet.js)
- [ ] Set up logging and monitoring
- [ ] Regular security audits

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
- Verify MongoDB is running: `mongod --version`
- Check `MONGODB_URI` in `.env` file
- For Atlas: Verify IP whitelist and credentials
- Check network connectivity

#### 2. PDF Upload Fails

**Error:**
```
Error: File too large or invalid type
```

**Solutions:**
- Verify file is PDF format
- Check file size < 10MB (MongoDB document limit: 16MB)
- Ensure `uploads/` directory exists in Backend (for temp files)
- Check MongoDB connection is active

#### 3. AI Not Responding

**Error:**
```
Error: OpenRouter API error
```

**Solutions:**
- Verify `OPENROUTER_API_KEY` in `.env`
- Check API key is valid and active
- Verify API quota/limits not exceeded
- Check backend console for detailed errors

#### 4. CORS Error

**Error:**
```
Access to fetch blocked by CORS policy
```

**Solutions:**
- Verify backend is running on port 3000
- Check frontend is running on port 5173
- Verify CORS is enabled in `server.ts`
- Clear browser cache and restart

#### 5. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

#### 6. Module Not Found

**Error:**
```
Error: Cannot find module 'xyz'
```

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

#### 7. TypeScript Compilation Errors

**Error:**
```
TS2307: Cannot find module or its corresponding type declarations
```

**Solutions:**
```bash
# Install missing type definitions
npm install --save-dev @types/package-name

# Rebuild TypeScript
npm run build
```

### Debug Mode

**Backend Debug:**
```bash
# Add to .env
DEBUG=*

# Or run with node inspect
node --inspect dist/server.js
```

**Frontend Debug:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Use React DevTools extension

### Logs Location

- **Backend**: Console output (terminal)
- **Frontend**: Browser DevTools Console
- **MongoDB**: MongoDB logs directory
- **Uploads**: `Backend/uploads/` directory

## 📄 License

MIT License

Copyright (c) 2024 Ramandeep Singh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 👨‍💻 Author

**Ramandeep Singh**
- Role: Frontend Developer
- Email: developedbyrd@gmail.com

---

## 🙏 Acknowledgments

- **OpenRouter** - AI API infrastructure
- **Shadcn/ui** - Beautiful component library
- **TanStack Query** - Powerful data synchronization
- **React PDF** - PDF rendering in React
- **MongoDB** - Flexible database platform
- **Vite** - Lightning-fast build tool

---

<div align="center">

**Built with ❤️ using React, TypeScript, Node.js, Express, and MongoDB**

[⬆ Back to Top](#docchat---ai-powered-pdf-intelligence-platform)

</div>
