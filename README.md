# 🛍️ Shoppy Sensay - AI Shopping Assistant

<div align="center">
  <img src="./frontend/public/ShoppyS logo .png" alt="ShoppyS Logo" width="200" height="200">
  
  <h3>Intelligent AI-Powered Shopping Assistant by Sensay Api</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js">
    <img src="https://img.shields.io/badge/React-18+-61dafb.svg" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg" alt="TypeScript">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
    <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
  </p>
  
  <p>
    <strong>Live Demo:</strong> 
    <a href="https://shoppy-s-ai-apc2.vercel.app/">Frontend</a> | 
    <a href="https://shoppy-s-ai-apc2.vercel.app/">Backend API</a>
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

<div align="center">
  <img src="./screenshot/Screenshot 2025-09-05 031344.png" alt="Screenshot 1" width="300">
  <img src="./screenshot/Screenshot 2025-09-05 073147.png" alt="Screenshot 2" width="300">
  <img src="./screenshot/Screenshot 2025-09-05 073246.png" alt="Screenshot 3" width="300">
</div>

Shoppy Sensay is an intelligent AI-powered shopping assistant that revolutionizes the e-commerce experience by providing personalized product recommendations and seamless shopping interactions. Built with cutting-edge technology including React, Node.js, and powered by Sensay AI with integrated knowledge database replica, it creates natural, human-like conversations that significantly improve conversion rates through contextual understanding of your entire Shopify store catalog.

### Key Highlights

- 🤖 **AI-Powered with Knowledge Database**: Advanced natural language processing with Shopify data integrated directly into Sensay's knowledge base for contextual understanding
- 🧠 **Smart Knowledge Replica**: Complete product catalog, descriptions, and store information embedded in AI's knowledge for instant, natural responses
- 💬 **Natural Conversations**: Human-like interactions that understand context, nuance, and customer intent to drive higher conversion rates
- 🛒 **Intelligent Cart Management**: Context-aware cart recommendations based on conversation flow and customer preferences
- 🎯 **Conversion Optimized**: AI trained on your specific product data to provide targeted recommendations that increase sales
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- 🔒 **Secure**: JWT-based authentication and secure API endpoints
- 📱 **Mobile-First**: Optimized for all devices
- ⚡ **Performance Optimized**: Fast response times with embedded knowledge for instant product recall

## 🏗️ Architecture

### Enhanced System Architecture

```mermaid
graph TB
    A[Frontend - React App] --> B[Backend API - Next.js]
    B --> C[Sensay AI Service with Knowledge Base]
    B --> D[Shopify API]
    B --> E[PostgreSQL Database]
    
    C --> F[AI Chat Processing + Product Knowledge]
    C --> G[Embedded Shopify Catalog]
    C --> H[Natural Language Understanding]
    D --> I[Real-time Inventory Sync]
    E --> J[User Data & Cart Management]
    
    subgraph "Sensay Knowledge Database"
        K[Product Catalog Knowledge]
        L[Store Information]
        M[Product Descriptions & Features]
        N[Pricing & Inventory Context]
        O[Brand & Category Knowledge]
    end
    
    subgraph "AI Enhancement Layer"
        P[Contextual Understanding]
        Q[Natural Response Generation]
        R[Conversion Optimization]
        S[Personalized Recommendations]
    end
    
    C --> K
    C --> L
    C --> M
    C --> N
    C --> O
    
    C --> P
    C --> Q
    C --> R
    C --> S
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

#### AI & Knowledge Integration
- **Sensay AI with Knowledge Database** - AI conversation engine with embedded Shopify catalog knowledge
- **Natural Language Processing** - Advanced understanding of customer intent and context
- **Knowledge Replica** - Complete store information integrated into AI's knowledge base
- **Shopify API** - Real-time inventory and order management

### Enhanced Data Flow

1. **Knowledge Integration**: Complete Shopify catalog is embedded into Sensay's knowledge database replica
2. **Natural Understanding**: Customer interacts using natural language, AI understands context from embedded knowledge
3. **Contextual Processing**: Sensay AI processes queries using both conversation context and embedded product knowledge
4. **Intelligent Response**: AI generates natural, human-like responses with specific product recommendations
5. **Conversion Optimization**: Responses are crafted to guide customers toward purchase decisions
6. **Real-time Sync**: Live inventory updates ensure accuracy while maintaining natural conversation flow
7. **Enhanced Cart Experience**: AI suggests complementary products and handles cart management seamlessly

## ✨ Features

### 🧠 Revolutionary Knowledge-Powered AI Chat
- **Embedded Product Knowledge**: Complete Shopify catalog integrated directly into AI's knowledge base for instant, accurate responses
- **Natural Language Mastery**: Understands nuanced customer queries and responds like a knowledgeable human sales associate
- **Contextual Conversation Flow**: Maintains deep understanding of conversation history and customer preferences
- **Smart Product Recall**: Instantly recalls any product details, specifications, or recommendations without API delays
- **Conversion-Focused Responses**: AI trained to guide conversations toward purchase decisions naturally
- **Personalized Shopping Journey**: Adapts conversation style and recommendations based on customer behavior and preferences

### 🛍️ Advanced E-commerce Intelligence
- **Knowledge-Driven Recommendations**: Uses embedded catalog knowledge to suggest perfect product matches
- **Natural Sales Conversations**: Mimics expert sales associate interactions with product expertise
- **Context-Aware Upselling**: Suggests complementary products based on conversation context and embedded knowledge
- **Intelligent Cross-selling**: Recommends related items using deep product relationship understanding
- **Dynamic Pricing Context**: AI understands pricing, promotions, and value propositions from embedded data
- **Inventory-Aware Responses**: Seamlessly handles stock levels and availability in natural conversation

### 🎯 Conversion Rate Optimization
- **Purchase Intent Detection**: Advanced AI recognizes buying signals and responds appropriately
- **Objection Handling**: AI addresses customer concerns using embedded product knowledge and benefits
- **Urgency Creation**: Natural conversation techniques to encourage purchase decisions
- **Trust Building**: Builds confidence through knowledgeable, helpful responses
- **Personalized Persuasion**: Adapts selling approach based on customer communication style
- **Seamless Purchase Path**: Guides customers from inquiry to purchase naturally

### 🚀 Enhanced Performance & User Experience
- **Instant Knowledge Access**: No API delays for product information - everything is embedded in AI knowledge
- **Natural Response Speed**: Human-like conversation timing for better engagement
- **Context Preservation**: Maintains conversation context across sessions for personalized experience
- **Mobile-Optimized Conversations**: Natural chat experience across all devices
- **Real-time Cart Integration**: Seamless shopping cart management within conversation flow
- **Emotional Intelligence**: AI recognizes and responds to customer emotions appropriately

## 🎯 Enhanced Use Cases

### 1. Expert Sales Consultation
**Scenario**: Customer seeks product advice like talking to an expert
- **Input**: "I need something elegant for a business dinner"
- **AI Knowledge Response**: AI uses embedded catalog knowledge to understand available elegant options, price ranges, and styling details
- **Natural Output**: "I'd love to help you find the perfect elegant piece! For business dinners, I'm thinking of our sophisticated collection. Are you leaning more toward a classic blazer with tailored pants, or perhaps an elegant dress? I have some beautiful options in mind that would be perfect for your occasion."
- **Conversion Enhancement**: Builds trust through expertise, guides toward specific products naturally

### 2. Intelligent Product Discovery
**Scenario**: Customer explores without specific product in mind
- **Input**: "Show me what's new and exciting"
- **AI Knowledge Response**: Uses embedded knowledge of featured products, trends, and customer preferences
- **Natural Output**: "Oh, you're in for a treat! We just launched some incredible pieces that our customers are absolutely loving. There's this stunning collection that's been flying off our shelves - let me show you a few standouts that I think you'll fall in love with..."
- **Conversion Enhancement**: Creates excitement, builds anticipation, uses social proof naturally

### 3. Problem-Solution Conversations
**Scenario**: Customer has specific need or problem to solve
- **Input**: "My old gym clothes are falling apart, I need a complete overhaul"
- **AI Knowledge Response**: AI understands full activewear catalog, durability features, and customer needs
- **Natural Output**: "I totally understand that frustration! Let's get you set up with pieces that will actually last. I'm thinking we build you a complete set with our performance line - they're designed for durability and comfort. What's your primary workout style? I want to make sure we get you exactly what you need."
- **Conversion Enhancement**: Shows empathy, positions as problem-solver, guides toward comprehensive purchase

### 4. Comparison Shopping Assistant
**Scenario**: Customer wants to compare similar products
- **Input**: "What's better between these two dresses?"
- **AI Knowledge Response**: Deep product knowledge allows detailed, nuanced comparisons
- **Natural Output**: "Great question! Both are beautiful, but they serve different occasions perfectly. The midnight blue has this gorgeous flowing silhouette that's incredibly flattering and versatile - you could dress it up or down easily. The burgundy has more structured detailing that gives it a sophisticated edge, perfect for formal events. Based on what you've mentioned, I'm leaning toward the blue for you - here's why..."
- **Conversion Enhancement**: Provides expert analysis, makes personalized recommendation, reduces decision paralysis

### 5. Objection Handling & Trust Building
**Scenario**: Customer expresses concerns or hesitation
- **Input**: "I'm not sure about the price, seems expensive"
- **AI Knowledge Response**: Understands product value, materials, quality, and competitive positioning
- **Natural Output**: "I completely understand wanting to make sure you're getting great value - that's smart shopping! Let me share why this piece is priced where it is. The fabric is premium organic cotton that actually gets softer with each wash, the construction uses reinforced stitching that prevents wear, and honestly, customers tell us they've had pieces from this line for years. When you break it down per wear, it's actually quite economical. Plus, we have a satisfaction guarantee because we're that confident you'll love it."
- **Conversion Enhancement**: Validates concerns, provides detailed value justification, offers risk reduction

### 6. Seamless Cart Management with Context
**Scenario**: Customer expresses purchase intent during conversation
- **Input**: "I love that burgundy tee and the matching cardigan"
- **AI Knowledge Response**: Understands products, styling, and creates natural purchase progression
- **Natural Output**: "Perfect taste! The burgundy tee and cardigan are a match made in heaven - they look absolutely stunning together. I've added both to your cart, and I'm also thinking these would look amazing with our new denim that just came in. The whole outfit would be effortlessly chic. Want to see the complete look?"
- **Conversion Enhancement**: Confirms choices, adds items naturally, suggests complementary pieces, builds outfit concept

## 🚀 Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **PostgreSQL** - Database server
- **Git** - Version control

### Required Accounts & API Keys

1. **Sensay AI Account with Knowledge Database Setup**
   - Sign up at [Sensay AI](https://sensay.io)
   - Get your API key and Organization ID
   - Create a replica for your shopping assistant
   - **Important**: Upload your complete Shopify catalog to Sensay's knowledge database
   - Configure knowledge base with product descriptions, categories, pricing, and store information

2. **Shopify Store**
   - Create a Shopify store or use existing one
   - Generate Storefront and Admin API tokens
   - Export product catalog for Sensay knowledge database integration

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

# Sensay AI Configuration with Knowledge Database
SENSAY_API_KEY="your_sensay_api_key_here"
SENSAY_ORG_ID="your_sensay_org_id_here"
SENSAY_REPLICA_UUID="your_replica_uuid_with_shopify_knowledge"

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

#### 4. Shopify Knowledge Database Setup

**Important Step**: Before running the application, ensure your Shopify catalog is integrated into Sensay's knowledge database:

1. **Export Shopify Data**:
   - Export complete product catalog from Shopify
   - Include product descriptions, variants, pricing, categories
   - Export store policies, brand information, and FAQs

2. **Upload to Sensay Knowledge Database**:
   - Access your Sensay replica dashboard
   - Upload all product information to the knowledge base
   - Configure product categories and relationships
   - Add store-specific information and policies

3. **Test Knowledge Integration**:
   - Use Sensay's testing interface to verify AI can recall product information
   - Test natural language queries about your products
   - Ensure AI responds with accurate product details

#### 5. Database Setup

```bash
cd backend-nextjs

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) View database in Prisma Studio
npx prisma studio
```

#### 6. Build the Application

```bash
# Build backend
cd backend-nextjs
npm run build

# Build frontend
cd ../frontend
npm run build
cd ..
```

#### 7. Start the Application

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

#### 8. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **API Documentation**: http://localhost:3000/

## 🧑‍💻 Enhanced Sensay AI Configuration

### Knowledge Database Integration

The revolutionary aspect of Shoppy Sensay lies in its deep integration between Sensay AI and your Shopify store through embedded knowledge:

#### Key Components:
- **Complete Product Catalog**: Every product, variant, description, and specification embedded in AI knowledge
- **Natural Language Understanding**: AI understands your products like a human sales expert
- **Contextual Responses**: Responses draw from embedded knowledge for instant, accurate information
- **Conversion Optimization**: AI trained on your specific products to drive sales naturally
- **Real-time Synchronization**: Live updates between Shopify and knowledge base

#### Configuration Steps:

1. **Initial Setup**:
   ```bash
   # Access Sensay Dashboard
   # Create new replica with e-commerce template
   # Configure for shopping assistant use case
   ```

2. **Knowledge Base Preparation**:
   - Export complete Shopify catalog
   - Prepare product descriptions and specifications
   - Include brand story, policies, and FAQs
   - Format data for optimal AI understanding

3. **Knowledge Upload Process**:
   - Upload product catalog to Sensay knowledge base
   - Configure product relationships and categories
   - Add store-specific information and policies
   - Test knowledge recall and accuracy

4. **AI Training & Optimization**:
   - Train AI on natural sales conversations
   - Configure conversion-focused response patterns
   - Set up personalization parameters
   - Test and refine responses for your brand voice

5. **Integration Testing**:
   ```bash
   # Test knowledge integration
   curl -X POST http://localhost:3000/api/chat/send \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-token>" \
     -d '{
       "message": "Tell me about your best-selling dress",
       "isNewChat": true
     }'
   ```

### Benefits of Knowledge Database Integration:

#### 🚀 **Performance Enhancement**:
- **Instant Responses**: No API delays for product information
- **Rich Context**: AI has complete product knowledge instantly available
- **Natural Flow**: Conversations flow naturally without interruptions

#### 🎯 **Conversion Optimization**:
- **Expert-Level Responses**: AI responds like a knowledgeable sales associate
- **Contextual Upselling**: Natural product suggestions based on embedded knowledge
- **Objection Handling**: AI addresses concerns using product knowledge

#### 🤖 **AI Intelligence**:
- **Deep Understanding**: AI truly understands your products, not just keywords
- **Natural Conversations**: Responses feel human and contextual
- **Personalized Recommendations**: AI considers full product range for suggestions

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://sensay-terbaru.vercel.app/api`

### Enhanced Chat Endpoints

| Method | Endpoint | Description | Body | Response Enhancement |
|--------|----------|-------------|------|---------------------|
| POST | `/chat/send` | Send message to AI with knowledge | `{message, isNewChat?, sessionId?}` | Natural responses using embedded Shopify knowledge |
| GET | `/chat/history` | Get conversation history | Query: `sessionId?` | Full context with product recommendations |
| GET | `/chat/sessions` | Get chat sessions | - | Sessions with conversion tracking |

### Enhanced Response Examples

#### Natural Product Inquiry
```json
{
  "message": "I need something comfortable for working from home",
  "response": "I love that you're prioritizing comfort for your work-from-home setup! I have some perfect pieces in mind that'll keep you looking polished on video calls while feeling cozy all day. Our soft lounge collection has been a customer favorite - especially the bamboo blend pieces that are breathable and wrinkle-resistant. Would you like to see some tops, bottoms, or maybe a complete comfortable outfit?",
  "recommendations": [
    {
      "id": "prod123",
      "name": "Bamboo Blend Comfort Top",
      "reason": "Perfect for video calls, ultra-soft, professional look"
    }
  ],
  "conversationIntent": "product_discovery",
  "conversionScore": 8.5
}
```

#### Knowledge-Powered Product Comparison
```json
{
  "message": "Compare your two bestselling jeans",
  "response": "Great question! Our two bestsellers are definitely the Classic Fit and the Stretch Comfort styles, and they each have their devoted fans for good reasons. The Classic Fit uses premium denim with a timeless cut that looks incredible and lasts for years - customers love how they hold their shape. The Stretch Comfort has 2% elastane for all-day comfort and movement, perfect if you're active or prefer a more forgiving fit. Both come in the same wash options. Based on what you've mentioned about comfort, I'm thinking the Stretch Comfort might be perfect for you - want to see them?",
  "products": [
    {
      "id": "jeans_classic",
      "highlights": ["Premium denim", "Timeless cut", "Shape retention"]
    },
    {
      "id": "jeans_stretch", 
      "highlights": ["2% elastane", "All-day comfort", "Active lifestyle"]
    }
  ],
  "recommendation": "jeans_stretch",
  "conversionTactic": "personalized_recommendation"
}
```

## 🚀 Deployment

### Vercel Deployment with Knowledge Database

#### Backend Deployment

1. **Ensure Knowledge Database is Configured**:
   - Verify Sensay replica has complete Shopify knowledge
   - Test AI responses using Sensay dashboard
   - Confirm knowledge base is production-ready

2. **Deploy Backend**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   DATABASE_URL=your_production_database_url
   SENSAY_API_KEY=your_sensay_api_key
   SENSAY_ORG_ID=your_sensay_org_id
   SENSAY_REPLICA_UUID=your_replica_with_shopify_knowledge
   SHOPIFY_STORE_NAME=your-store-name
   SHOPIFY_STOREFRONT_TOKEN=your_shopify_storefront_token
   SHOPIFY_ADMIN_TOKEN=your_shopify_admin_token
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

#### Knowledge Database Verification

Before going live, verify:
- ✅ All products are in Sensay knowledge base
- ✅ AI can recall product details accurately
- ✅ Responses are natural and conversion-focused
- ✅ Knowledge base updates with inventory changes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Areas for Enhancement

- **Knowledge Base Optimization**: Improve product knowledge structure
- **Conversation Flow**: Enhance natural conversation patterns
- **Conversion Analytics**: Add conversion tracking and optimization
- **Personalization**: Improve customer preference learning
- **Mobile Experience**: Enhance mobile conversation interface

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/sensay-shop.git
cd sensay-shop
```

### 2. Set Up Knowledge Database
- Configure test Sensay replica with sample product data
- Test AI responses with your knowledge integration
- Document any knowledge structure improvements

## 🆘 Support

### Getting Help

- **Knowledge Base Issues**: Check Sensay dashboard for knowledge integration status
- **AI Response Quality**: Test and refine in Sensay replica interface before deployment
- **Conversion Optimization**: Analyze conversation flows and response effectiveness

### Common Issues

#### Knowledge Database Integration Issues
```bash
# Verify knowledge base status
# Check Sensay replica dashboard
# Test AI knowledge recall manually
```

#### AI Response Quality Issues
- Review knowledge base structure in Sensay dashboard
- Test specific product queries in replica interface
- Refine knowledge organization for better AI understanding
- Check for incomplete product information in knowledge base

#### Conversion Rate Concerns
- Analyze conversation flows for drop-off points
- Test different response patterns for better engagement
- Review AI responses for natural sales conversation flow
- Optimize knowledge base for conversion-focused responses

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sensay AI** - For providing the revolutionary knowledge database integration and intelligent conversation engine
- **Shopify** - For the comprehensive e-commerce API and seamless catalog integration
- **React Team** - For the amazing frontend framework
- **Next.js Team** - For the powerful full-stack framework
- **Open Source Contributors** - For the amazing tools and libraries

---

<div align="center">
  <p>
    <strong>Built with ❤️ using React, Next.js, and Sensay AI Knowledge Database Integration</strong>
  </p>
  <p>
    <em>Revolutionizing e-commerce through natural AI conversations with embedded product knowledge</em>
  </p>
  <p>
    <a href="https://shoppy-s-ai-apc2.vercel.app/">Live Demo</a> •
    <a href="https://github.com/e/ShoppyS-Ai/issues">Report Bug</a> •
    <a href="https://github.com/envexx/ShoppyS-Ai/discussions">Request Feature</a>
  </p>
</div>
