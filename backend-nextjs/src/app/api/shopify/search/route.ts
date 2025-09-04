import { NextRequest, NextResponse } from 'next/server';
import { searchProductsInShopify } from '../../../../lib/shopify-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    console.log(`🔍 Searching Shopify for: "${query}"`);
    
    // Search for products in Shopify
    const products = await searchProductsInShopify(query);
    
    console.log(`✅ Found ${products.length} products for query: "${query}"`);
    
    return NextResponse.json({
      success: true,
      products: products,
      query: query
    });
    
  } catch (error) {
    console.error('Error searching Shopify:', error);
    return NextResponse.json(
      { error: 'Failed to search Shopify products' },
      { status: 500 }
    );
  }
}
