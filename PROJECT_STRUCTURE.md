# ShoppyS - Project Structure

## Overview
ShoppyS adalah AI shopping assistant yang menggunakan Sensay AI dan Shopify integration. Project ini menggunakan Next.js sebagai backend dan React sebagai frontend.

## Clean Architecture

```
sensay-terbaru-clean/
├── backend-nextjs/          # 🎯 Next.js Backend (API + Server)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/         # API Routes
│   │   │   │   ├── auth/    # Authentication endpoints
│   │   │   │   ├── chat/    # Chat endpoints (Sensay integration)
│   │   │   │   ├── cart/    # Shopping cart endpoints
│   │   │   │   └── shopify/ # Shopify integration endpoints
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts          # Authentication logic
│   │   │   ├── database.ts      # Prisma database connection
│   │   │   ├── sensay-service.ts # Sensay AI integration
│   │   │   ├── shopify-service.ts # Shopify API integration
│   │   │   ├── middleware.ts    # API middleware (CORS, rate limiting)
│   │   │   └── config.ts        # Configuration
│   │   └── components/
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── .env                 # Environment variables
│   ├── middleware.ts        # Next.js middleware
│   └── package.json
│
├── frontend/                # 🎯 React Frontend (Vite)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service calls
│   │   ├── utils/          # Utility functions
│   │   └── pages/          # Page components
│   ├── public/             # Static assets
│   └── package.json
│
├── prisma/                 # 🗄️ Shared Database Schema
│   └── schema.prisma
│
├── PROJECT_STRUCTURE.md    # 📖 This documentation
├── README.md              # 📖 Main documentation
├── LICENSE                # ⚖️ License file
└── vercel.json            # 🚀 Deployment configuration
```

## Key Features

### 1. Backend (Next.js)
- **API Routes**: RESTful API endpoints
- **Sensay Integration**: AI chat functionality
- **Shopify Integration**: Product search and management
- **Authentication**: JWT-based auth system
- **Database**: PostgreSQL with Prisma ORM
- **Auto Add to Cart**: Intelligent cart management based on AI responses

### 2. Frontend (React)
- **Chat Interface**: Real-time chat with Sensay AI
- **Product Display**: Dynamic product cards from Shopify
- **Shopping Cart**: Cart management with real-time updates
- **Authentication**: Login/register functionality
- **Responsive Design**: Modern UI with Tailwind CSS

## How It Works

1. **User Chat**: User mengirim pesan ke Sensay AI
2. **AI Response**: Sensay memberikan respons dan rekomendasi produk
3. **Product Detection**: Sistem mendeteksi jika AI merekomendasikan produk
4. **Shopify Search**: Sistem mencari produk yang sesuai di Shopify
5. **Product Display**: Produk ditampilkan dengan link dan tombol add to cart
6. **Auto Add to Cart**: Jika user memilih produk, sistem otomatis menambahkan ke cart
7. **Cart Management**: User dapat melihat dan mengelola cart

## Environment Variables

### Backend (.env in backend-nextjs/)
```
DATABASE_URL=           # PostgreSQL connection string
SENSAY_API_KEY=        # Sensay API key
SENSAY_API_URL=        # Sensay API endpoint
SENSAY_ORG_ID=         # Sensay organization ID
SENSAY_REPLICA_UUID=   # Sensay replica UUID
SHOPIFY_STORE_NAME=    # Shopify store name
SHOPIFY_STOREFRONT_TOKEN= # Shopify Storefront API token
SHOPIFY_ADMIN_TOKEN=   # Shopify Admin API token
JWT_SECRET=            # JWT secret for authentication
NODE_ENV=              # Environment (development/production)
```

## Running the Application

### Backend (Next.js)
```bash
cd backend-nextjs
npm install
npm run dev
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### Database
```bash
cd backend-nextjs
npx prisma db push
npx prisma generate
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Chat
- `POST /api/chat/send` - Send message to Sensay AI
- `GET /api/chat/sessions` - Get chat sessions
- `GET /api/chat/history` - Get chat history

### Shopping Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/count` - Get cart count
- `DELETE /api/cart/[itemId]` - Remove item from cart

### Shopify
- `GET /api/shopify/search` - Search products
- `GET /api/shopify/featured` - Get featured products
- `GET /api/shopify/product/[handle]` - Get product details

## Technologies Used

- **Backend**: Next.js 15, TypeScript, Prisma ORM
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Database**: PostgreSQL (with Prisma Accelerate)
- **AI**: Sensay AI API
- **E-commerce**: Shopify Storefront & Admin API
- **Authentication**: JWT
- **Deployment**: Vercel (recommended)

## Notes

- Backend Next.js sudah include semua functionality yang diperlukan
- Tidak memerlukan backend Node.js terpisah lagi
- Semua API logic sudah ada di Next.js API routes
- Database schema sudah optimal untuk fitur shopping AI
