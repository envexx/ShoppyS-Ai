import { NextRequest, NextResponse } from 'next/server';
import { SHOPIFY_CONFIG } from '../../../../lib/config';

export async function GET(request: NextRequest) {
  try {
    // Check if Shopify configuration is properly set
    const configStatus = {
      storeName: SHOPIFY_CONFIG.storeName,
      hasStorefrontToken: !!SHOPIFY_CONFIG.storefrontApiToken,
      hasAdminToken: !!SHOPIFY_CONFIG.adminApiToken,
      storefrontUrl: SHOPIFY_CONFIG.endpoints.storefront,
      adminUrl: SHOPIFY_CONFIG.endpoints.admin,
    };

    console.log('🔍 Shopify Health Check:', configStatus);

    // Check if required configuration is present
    const missingConfig = [];
    if (!SHOPIFY_CONFIG.storeName) missingConfig.push('SHOPIFY_STORE_NAME');
    if (!SHOPIFY_CONFIG.storefrontApiToken) missingConfig.push('SHOPIFY_STOREFRONT_TOKEN');
    if (!SHOPIFY_CONFIG.adminApiToken) missingConfig.push('SHOPIFY_ADMIN_TOKEN');

    if (missingConfig.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing Shopify configuration',
        missing: missingConfig,
        config: configStatus
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Shopify service is properly configured',
      config: configStatus
    });

  } catch (error: any) {
    console.error('❌ Shopify health check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Shopify health check failed',
      error: error.message
    }, { status: 500 });
  }
}
