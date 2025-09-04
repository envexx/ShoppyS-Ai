import { NextRequest, NextResponse } from 'next/server';
import { searchProductsInShopify } from '../../../../lib/shopify-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Shopify search functionality...');
    
    // Test with a simple query
    const testQuery = 't-shirt';
    console.log(`🔍 Testing with query: "${testQuery}"`);
    
    const products = await searchProductsInShopify(testQuery);
    
    console.log(`✅ Test completed: Found ${products.length} products`);
    
    return NextResponse.json({
      success: true,
      testQuery: testQuery,
      productsFound: products.length,
      products: products.slice(0, 3), // Return first 3 products for testing
      message: 'Shopify search test completed'
    });

  } catch (error: any) {
    console.error('❌ Shopify search test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Shopify search test failed'
    }, { status: 500 });
  }
}
