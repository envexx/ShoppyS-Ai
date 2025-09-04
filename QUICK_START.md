# 🚀 ShoppyS Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Prisma Accelerate)
- Sensay API account
- Shopify store with API credentials

## 🏃‍♂️ Quick Setup (5 minutes)

### 1. Backend Setup
```bash
cd backend-nextjs
npm install
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your actual credentials
```

### 3. Database Setup
```bash
npx prisma db push
npx prisma generate
```

### 4. Start Backend
```bash
npm run dev
```
Backend will run on `http://localhost:3000`

### 5. Frontend Setup
```bash
# In new terminal
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🔧 Environment Variables

### Required for Backend (.env)
```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Sensay AI
SENSAY_API_KEY="your_sensay_api_key"
SENSAY_API_URL="https://api.sensay.io"
SENSAY_ORG_ID="your_org_id"
SENSAY_REPLICA_UUID="your_replica_uuid"

# Shopify
SHOPIFY_STORE_NAME="your-store-name"
SHOPIFY_STOREFRONT_TOKEN="your_storefront_token"
SHOPIFY_ADMIN_TOKEN="your_admin_token"

# Security
JWT_SECRET="your_random_secret_key"
NODE_ENV="development"
```

## ✅ Test Your Setup

1. Open `http://localhost:5173`
2. Register a new account
3. Try chatting: "Find me casual shirts under $50"
4. Verify products appear and add to cart works

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

Frontend and backend will be deployed separately:
- Backend: `your-app.vercel.app` 
- Frontend: `your-frontend.vercel.app`

## 🔍 Troubleshooting

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset
npx prisma generate
```

### CORS Issues
- Check `backend-nextjs/middleware.ts`
- Verify frontend URL in allowed origins

### API Issues
- Check logs in browser console
- Verify environment variables
- Test API endpoints directly

## 📖 More Info
- See `PROJECT_STRUCTURE.md` for detailed architecture
- See `README.md` for complete documentation
- Check `/backend-nextjs/src/app/api/` for API endpoints

---
Happy coding! 🎉
