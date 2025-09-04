/**
 * Type definitions untuk Sensay API responses
 */

export interface User {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Replica {
  uuid: string;
  name: string;
  shortDescription?: string;
  greeting?: string;
  ownerID: string;
  private: boolean;
  slug: string;
  llm?: {
    provider: string;
    model: string;
  };
  system_message?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatResponse {
  content: string;
  role: 'assistant' | 'user';
  timestamp?: string;
}

export interface SetupResult {
  userId: string;
  replicaUuid: string;
  replicaName: string;
}

export interface CreateUserRequest {
  id: string;
}

export interface CreateReplicaRequest {
  name: string;
  shortDescription?: string;
  greeting?: string;
  ownerID: string;
  private: boolean;
  slug: string;
  llm?: {
    provider: string;
    model: string;
  };
  system_message?: string;
}

export interface ChatRequest {
  content: string;
}

// Auth types for Next.js
export interface AuthRequest {
  user?: {
    id: string;
    email: string;
    username: string;
    sensayUserId?: string | null;
  };
}

// Shopify types
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  totalInventory: number;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ShopifyOrder {
  id: string;
  name: string;
  fulfillmentStatus: string;
  financialStatus: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: Array<{
      node: {
        quantity: number;
        title: string;
        variant: {
          price: {
            amount: string;
            currencyCode: string;
          };
        };
      };
    }>;
  };
}
