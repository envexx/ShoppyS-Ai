import { NextRequest, NextResponse } from 'next/server';
import { searchProductsInShopify } from '../../../../lib/shopify-service';

export async function POST(request: NextRequest) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  let query: string = '';
  
  try {
    const body = await request.json();
    query = body.query;
    
    if (!query) {
      console.log('❌ No query provided in request body');
      return NextResponse.json({ error: 'Query parameter is required' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log(`🔍 Searching Shopify for: "${query}"`);
    
    // Search for products in Shopify
    const products = await searchProductsInShopify(query);
    
    console.log(`✅ Found ${products.length} products for query: "${query}"`);
    console.log(`📦 Products:`, products.map((p: any) => p.title));
    
    return NextResponse.json({
      success: true,
      products: products,
      query: query
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error searching Shopify:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to search Shopify products',
        details: error.message,
        query: query
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
