# 🛍️ Shoppy Sensay - AI Shopping Assistant

<div align="center">
  <img src="./frontend/public/ShoppyS logo .png" alt="ShoppyS Logo" width="200" height="200">
  
  <h3>Intelligent AI-Powered Shopping Assistant by Sensay Api</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Version-2.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js">
    <img src="https://img.shields.io/badge/React-18+-61dafb.svg" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg" alt="TypeScript">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
    <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
  </p>
  
  <p>
    <strong>Live Demo:</strong> 
    <a href="https://sensay-terbaru.vercel.app">Frontend</a> | 
    <a href="https://sensay-terbaru.vercel.app/api/health">Backend API</a>
  </p>
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Use Cases](#-use-cases)
- [Setup Instructions](#-setup-instructions)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)

## 🎯 Overview

Shoppy Sensay is an intelligent AI-powered shopping assistant that revolutionizes the e-commerce experience by providing personalized product recommendations and seamless shopping interactions. Built with cutting-edge technology including React, Node.js, and powered by Sensay AI, it helps customers find the perfect products from your Shopify store through natural conversation.

### Key Highlights

- 🤖 **AI-Powered**: Advanced natural language processing for intelligent product recommendations
- 🛒 **Smart Cart Management**: Intelligent cart intent detection and automatic product addition
- 💬 **Conversational Interface**: Natural chat-based shopping experience
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- 🔒 **Secure**: JWT-based authentication and secure API endpoints
- 📱 **Mobile-First**: Optimized for all devices
- ⚡ **Performance Optimized**: Fast response times and efficient caching

## 🏗️ Architecture

### System Architecture Overview

```mermaid
graph TB
    A[Frontend - React App] --> B[Backend API - Next.js]
    B --> C[Sensay AI Service]
    B --> D[Shopify API]
    B --> E[PostgreSQL Database]
    
    C --> F[AI Chat Processing]
    D --> G[Product Search & Inventory]
    E --> H[User Data & Cart Management]
    
    subgraph "Frontend Components"
        I[Chat Interface]
        J[Product Display]
        K[Shopping Cart]
        L[Authentication]
    end
    
    subgraph "Backend Services"
        M[Auth Service]
        N[Cart Service]
        O[Sensay Service]
        P[Shopify Service]
        Q[Cache Service]
    end
    
    A --> I
    A --> J
    A --> K
    A --> L
    
    B --> M
    B --> N
    B --> O
    B --> P
    B --> Q
```

### Technology Stack

#### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Axios** - HTTP client

#### Backend
- **Next.js 14** - Full-stack React framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **Redis** - Caching layer

#### External Services
- **Sensay AI** - AI conversation engine
- **Shopify API** - E-commerce platform integration

### Data Flow

1. **User Interaction**: Customer interacts with the chat interface
2. **AI Processing**: Sensay AI processes the natural language input
3. **Intent Detection**: System detects cart intent and product recommendations
4. **Product Search**: System searches Shopify store for relevant products
5. **Response Generation**: AI generates contextual response with product recommendations
6. **UI Update**: Frontend displays products and chat response
7. **Cart Management**: User can add products to cart and manage purchases

## ✨ Features

### 🤖 Enhanced AI-Powered Chat
- **Natural Language Understanding**: Interprets customer requests from vague to specific
- **Contextual Responses**: Maintains conversation context for better recommendations
- **Smart Product Search**: Automatically searches inventory based on customer needs
- **Learning Capabilities**: Improves recommendations based on user interactions
- **Cart Intent Detection**: Automatically detects when users want to add items to cart
- **General Information Filtering**: Distinguishes between product recommendations and general information

### 🛒 Intelligent E-commerce Integration
- **Real-time Product Search**: Live inventory from Shopify stores
- **Product Display**: Rich product cards with images, prices, and details
- **Smart Shopping Cart**: Intelligent cart management with automatic product addition
- **Cart Context Awareness**: AI provides cart-aware responses
- **Order Processing**: Seamless checkout experience
- **Purchase History**: Track and manage past orders

### 🎨 Enhanced User Experience
- **Modern Interface**: Clean, intuitive design
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Mode**: Automatic theme switching
- **Real-time Updates**: Live chat and cart updates
- **Product Modals**: Detailed product views
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error management

### 🔒 Security & Performance
- **JWT Authentication**: Secure user sessions
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error management
- **Performance Optimization**: Fast loading and response times
- **Caching**: Intelligent caching for better performance
- **Rate Limiting**: API rate limiting for security

## 🎯 Use Cases

### 1. E-commerce Customer Support
**Scenario**: Customer needs help finding specific products
- **Input**: "I'm looking for a blue dress for a wedding"
- **AI Response**: Asks clarifying questions about size, style, budget
- **Output**: Shows relevant dresses with detailed information
- **Action**: Customer can add to cart or ask for alternatives

### 2. Product Discovery
**Scenario**: Customer wants to explore new products
- **Input**: "What's trending in your store?"
- **AI Response**: Shows popular/featured products
- **Output**: Curated product recommendations
- **Action**: Customer discovers new items they might like

### 3. Sales Consultation
**Scenario**: Customer needs personalized recommendations
- **Input**: "I need workout clothes for the gym"
- **AI Response**: Asks about preferences, size, budget
- **Output**: Personalized product suggestions
- **Action**: Customer gets tailored recommendations

### 4. Shopping Assistance
**Scenario**: Customer needs help with product details
- **Input**: "What's the difference between these two jackets?"
- **AI Response**: Compares products side-by-side
- **Output**: Detailed comparison with pros/cons
- **Action**: Customer makes informed decision

### 5. Order Management
**Scenario**: Customer wants to track or modify orders
- **Input**: "Where is my order?"
- **AI Response**: Provides order status and tracking
- **Output**: Real-time order information
- **Action**: Customer stays informed about their purchase

### 6. Smart Cart Management
**Scenario**: Customer expresses intent to buy
- **Input**: "I want the burgundy tee"
- **AI Response**: "Perfect choice! I've added the Classic Burgundy Tee to your cart!"
- **Output**: Product automatically added to cart
- **Action**: Seamless shopping experience

## 🚀 Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **PostgreSQL** - Database server
- **Git** - Version control

### Required Accounts & API Keys

1. **Sensay AI Account**
   - Sign up at [Sensay AI](https://sensay.io)
   - Get your API key and Organization ID
   - Create a replica for your shopping assistant

2. **Shopify Store**
   - Create a Shopify store or use existing one
   - Generate Storefront and Admin API tokens

3. **Database**
   - Set up PostgreSQL database (local or cloud)

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sensay-shop.git
cd sensay-shop
```

#### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend-nextjs
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

#### 3. Environment Configuration

Create a `.env.local` file in the `backend-nextjs` directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sensay_shop"

# Sensay AI Configuration
SENSAY_API_KEY="your_sensay_api_key_here"
SENSAY_ORG_ID="your_sensay_org_id_here"
SENSAY_REPLICA_UUID="your_replica_uuid_here"

# Shopify Configuration
SHOPIFY_STORE_NAME="your-store-name"
SHOPIFY_STOREFRONT_TOKEN="your_shopify_storefront_token"
SHOPIFY_ADMIN_TOKEN="your_shopify_admin_token"

# JWT Configuration
JWT_SECRET="your_jwt_secret_key_here"

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### 4. Database Setup

```bash
cd backend-nextjs

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) View database in Prisma Studio
npx prisma studio
```

#### 5. Build the Application

```bash
# Build backend
cd backend-nextjs
npm run build

# Build frontend
cd ../frontend
npm run build
cd ..
```

#### 6. Start the Application

**Development Mode:**

```bash
# Start backend server (with auto-reload)
cd backend-nextjs
npm run dev

# In another terminal, start frontend development server
cd frontend
npm run dev
```

**Production Mode:**

```bash
# Start backend server
cd backend-nextjs
npm start

# Frontend is already built and served
```

#### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **API Documentation**: http://localhost:3000/

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://sensay-terbaru.vercel.app/api`

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | `{email, username, password}` |
| POST | `/auth/login` | User login | `{emailOrUsername, password}` |
| GET | `/auth/me` | Get current user | Headers: `Authorization: Bearer <token>` |

### Chat Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/chat/send` | Send message to AI | `{message, isNewChat?, sessionId?}` |
| GET | `/chat/history` | Get chat history | Query: `sessionId?` |
| GET | `/chat/sessions` | Get chat sessions | - |

### Cart Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/cart` | Get user cart | - |
| POST | `/cart/add` | Add product to cart | `{productId, productName, price, quantity, ...}` |
| PUT | `/cart/[itemId]` | Update cart item | `{quantity}` |
| DELETE | `/cart/[itemId]` | Remove cart item | - |
| DELETE | `/cart` | Clear entire cart | - |
| GET | `/cart/count` | Get cart count | - |

### Shopify Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/shopify/featured` | Get featured products | Query: `limit?` |
| GET | `/shopify/product/[handle]` | Get product details | - |
| POST | `/shopify/search` | Search products | `{query, limit?}` |

### Purchase History Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchases` | Get purchase history |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |

### Example API Calls

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword"
  }'
```

#### Send Chat Message
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "message": "I need a blue dress for a wedding",
    "isNewChat": true
  }'
```

#### Search Products
```bash
curl -X POST http://localhost:3000/api/shopify/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "query": "blue dress",
    "limit": 5
  }'
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Backend Deployment

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   ```
   DATABASE_URL=your_production_database_url
   SENSAY_API_KEY=your_sensay_api_key
   SENSAY_ORG_ID=your_sensay_org_id
   SENSAY_REPLICA_UUID=your_replica_uuid
   SHOPIFY_STORE_NAME=your-store-name
   SHOPIFY_STOREFRONT_TOKEN=your_shopify_storefront_token
   SHOPIFY_ADMIN_TOKEN=your_shopify_admin_token
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git push origin main
   ```

#### Frontend Deployment

1. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```

2. **Update API URL** in production environment

### Environment Variables for Production

Ensure all environment variables are properly configured:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Sensay AI
SENSAY_API_KEY=your_production_api_key
SENSAY_ORG_ID=your_sensay_org_id
SENSAY_REPLICA_UUID=your_replica_uuid

# Shopify
SHOPIFY_STORE_NAME=your-store-name
SHOPIFY_STOREFRONT_TOKEN=your_production_storefront_token
SHOPIFY_ADMIN_TOKEN=your_production_admin_token

# Security
JWT_SECRET=your_secure_jwt_secret

# Server
NODE_ENV=production
```

## 🧑‍💻 Sensay API Configuration

### API Integration
The Sensay AI integration provides:
- Natural language processing for customer queries
- Intelligent product recommendation algorithms
- Context-aware conversation management
- Learning capabilities for improved responses
- Smart cart intent detection
- General information filtering

### Configuration Steps
1. Sign up for a Sensay AI account
2. Get your API key and Organization ID from the dashboard
3. Create a replica for your shopping assistant
4. Configure the API keys in your environment variables

## 🏗️ Project Structure

```
sensay-shop/
├── 📁 backend-nextjs/              # Next.js backend
│   ├── 📁 src/
│   │   ├── 📁 app/                 # Next.js app router
│   │   │   ├── 📁 api/             # API routes
│   │   │   │   ├── 🔐 auth/        # Authentication endpoints
│   │   │   │   ├── 💬 chat/        # Chat endpoints
│   │   │   │   ├── 🛒 cart/        # Cart endpoints
│   │   │   │   ├── 🛍️ shopify/    # Shopify endpoints
│   │   │   │   └── 📦 purchases/   # Purchase endpoints
│   │   │   └── 📄 layout.tsx       # Root layout
│   │   ├── 📁 lib/                 # Backend libraries
│   │   │   ├── 🔐 auth.ts         # Authentication logic
│   │   │   ├── 🗄️ database.ts    # Database connection
│   │   │   ├── 🤖 sensay-service.ts # Sensay AI integration
│   │   │   ├── 🛍️ shopify-service.ts # Shopify integration
│   │   │   ├── 💾 cache.ts       # Cache service
│   │   │   └── 📋 types.ts       # TypeScript types
│   │   └── 📄 globals.css         # Global styles
│   ├── 📁 prisma/                  # Database schema
│   │   ├── 📄 schema.prisma       # Database schema
│   │   └── 📁 migrations/         # Database migrations
│   └── 📄 package.json            # Backend dependencies
├── 📁 frontend/                    # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/         # React components
│   │   │   ├── 💬 ChatArea.tsx   # Chat interface
│   │   │   ├── 🛒 CartPanel.tsx  # Shopping cart
│   │   │   ├── 🏠 LandingPage.tsx # Landing page
│   │   │   └── 📦 ProductCard.tsx # Product display
│   │   ├── 📁 services/           # API services
│   │   │   └── 🌐 api.ts         # API client
│   │   └── 📁 utils/              # Utility functions
│   └── 📁 public/                 # Static assets
│       └── 🖼️ ShoppyS logo .png  # Logo files
├── 📄 package.json                 # Root dependencies
├── 📄 vercel.json                  # Vercel configuration
└── 📄 README.md                    # This file
```

## 🔧 Development

### Available Scripts

#### Backend Scripts
```bash
cd backend-nextjs
npm run dev          # Start development server with auto-reload
npm run build        # Build for production
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

#### Frontend Scripts
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Workflow

1. **Feature Development**:
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Testing**:
   ```bash
   # Test backend
   cd backend-nextjs
   npm test
   
   # Test frontend
   cd frontend
   npm test
   ```

3. **Code Quality**:
   ```bash
   # Lint backend
   cd backend-nextjs
   npm run lint
   
   # Lint frontend
   cd frontend
   npm run lint
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/sensay-shop.git
cd sensay-shop
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes
- Write clean, readable code
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

### 4. Commit Your Changes
```bash
git add .
git commit -m "Add amazing feature"
```

### 5. Push to Your Branch
```bash
git push origin feature/amazing-feature
```

### 6. Open a Pull Request
- Provide a clear description of your changes
- Reference any related issues
- Request review from maintainers

### Contribution Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update README and code comments
- **Commits**: Use clear, descriptive commit messages
- **Issues**: Check existing issues before creating new ones

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### Common Issues

#### Database Connection Issues
```bash
# Check database connection
cd backend-nextjs
npx prisma db push

# Reset database
npx prisma migrate reset
```

#### API Key Issues
- Verify your Sensay API key is correct
- Check Shopify tokens are valid
- Ensure environment variables are set

#### Build Issues
```bash
# Clear node_modules and reinstall
cd backend-nextjs
rm -rf node_modules package-lock.json
npm install

# Clear frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Reporting Bugs

When reporting bugs, please include:
- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Error Messages**: Full error logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sensay AI** - For providing the intelligent conversation engine
- **Shopify** - For the comprehensive e-commerce API
- **React Team** - For the amazing frontend framework
- **Next.js Team** - For the powerful full-stack framework
- **Open Source Contributors** - For the amazing tools and libraries

---

<div align="center">
  <p>
    <strong>Built with ❤️ using React, Next.js, and Sensay AI</strong>
  </p>
  <p>
    <a href="https://sensay-terbaru.vercel.app">Live Demo</a> •
    <a href="https://github.com/e/sensay-shop/issues">Report Bug</a> •
    <a href="https://github.com/your-username/sensay-shop/discussions">Request Feature</a>
  </p>
</div>