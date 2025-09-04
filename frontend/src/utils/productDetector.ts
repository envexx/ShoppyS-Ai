import { createApiUrl } from '../config/api';

interface ProductInfo {
  id: string;
  name: string;
  price?: string;
  image?: string;
  url: string;
  description?: string;
  rating?: number;
  availability?: string;
}

interface ShopifyProductInfo {
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

// Product database - mapping product names to Shopify handles
const PRODUCT_DATABASE: { [key: string]: string } = {
  // Casual Tees
  'burgundy statement tee': 'burgundy-statement-tee',
  'burgundy statement tee short sleeve t-shirt': 'burgundy-statement-tee',
  'burgundy statement': 'burgundy-statement-tee',
  'statement tee': 'burgundy-statement-tee',
  'charcoal grey modern tee': 'charcoal-grey-modern-tee',
  'charcoal grey tee': 'charcoal-grey-modern-tee',
  'grey modern tee': 'charcoal-grey-modern-tee',
  'soft beige neutral tee': 'soft-beige-neutral-tee',
  'beige neutral tee': 'soft-beige-neutral-tee',
  'neutral tee': 'soft-beige-neutral-tee',
  'olive green everyday tee': 'olive-green-everyday-tee',
  'olive green tee': 'olive-green-everyday-tee',
  'everyday tee': 'olive-green-everyday-tee',
  'ocean blue relax fit tee': 'ocean-blue-relax-fit-tee',
  'ocean blue tee': 'ocean-blue-relax-fit-tee',
  'blue relax fit tee': 'ocean-blue-relax-fit-tee',
  'navy casual tee': 'navy-casual-tee',
  'navy tee': 'navy-casual-tee',
  'casual tee': 'navy-casual-tee',
  'white basic tee': 'white-basic-tee',
  'basic tee': 'white-basic-tee',
  'white tee': 'white-basic-tee',
  'black graphic tee': 'black-graphic-tee',
  'graphic tee': 'black-graphic-tee',
  'black tee': 'black-graphic-tee',
  
  // Shirts
  'blue oxford shirt': 'blue-oxford-shirt',
  'oxford shirt': 'blue-oxford-shirt',
  'blue shirt': 'blue-oxford-shirt',
  'white dress shirt': 'white-dress-shirt',
  'dress shirt': 'white-dress-shirt',
  'white shirt': 'white-dress-shirt',
  'striped casual shirt': 'striped-casual-shirt',
  'striped shirt': 'striped-casual-shirt',
  'casual shirt': 'striped-casual-shirt',
  
  // Dresses
  'floral summer dress': 'floral-summer-dress',
  'summer dress': 'floral-summer-dress',
  'floral dress': 'floral-summer-dress',
  'black cocktail dress': 'black-cocktail-dress',
  'cocktail dress': 'black-cocktail-dress',
  'black dress': 'black-cocktail-dress',
  'white sundress': 'white-sundress',
  'sundress': 'white-sundress',
  'white dress': 'white-sundress',
  
  // Pants & Jeans
  'blue denim jeans': 'blue-denim-jeans',
  'denim jeans': 'blue-denim-jeans',
  'blue jeans': 'blue-denim-jeans',
  'jeans': 'blue-denim-jeans',
  'black dress pants': 'black-dress-pants',
  'dress pants': 'black-dress-pants',
  'black pants': 'black-dress-pants',
  'khaki chino pants': 'khaki-chino-pants',
  'chino pants': 'khaki-chino-pants',
  'khaki pants': 'khaki-chino-pants',
  
  // Jackets & Outerwear
  'denim jacket': 'denim-jacket',
  'blue denim jacket': 'denim-jacket',
  'leather jacket': 'leather-jacket',
  'black leather jacket': 'leather-jacket',
  'bomber jacket': 'bomber-jacket',
  'olive bomber jacket': 'bomber-jacket',
  'olive jacket': 'bomber-jacket',
  
  // Hoodies & Sweaters
  'gray hoodie': 'gray-hoodie',
  'hoodie': 'gray-hoodie',
  'sweatshirt': 'gray-hoodie',
  'navy sweater': 'navy-sweater',
  'sweater': 'navy-sweater',
  'cardigan': 'navy-sweater',
  'cream knit sweater': 'cream-knit-sweater',
  'knit sweater': 'cream-knit-sweater',
  'cream sweater': 'cream-knit-sweater',
  
  // Accessories
  'leather belt': 'leather-belt',
  'belt': 'leather-belt',
  'brown belt': 'leather-belt',
  'canvas tote bag': 'canvas-tote-bag',
  'tote bag': 'canvas-tote-bag',
  'bag': 'canvas-tote-bag',
  'wool scarf': 'wool-scarf',
  'scarf': 'wool-scarf',
  'winter scarf': 'wool-scarf',
  
  // Shoes
  'white sneakers': 'white-sneakers',
  'sneakers': 'white-sneakers',
  'white shoes': 'white-sneakers',
  'brown leather boots': 'brown-leather-boots',
  'leather boots': 'brown-leather-boots',
  'boots': 'brown-leather-boots',
  'black loafers': 'black-loafers',
  'loafers': 'black-loafers',
  'black shoes': 'black-loafers'
};

// Price database - mapping product handles to prices
const PRICE_DATABASE: { [key: string]: string } = {
  'burgundy-statement-tee': '$23.00',
  'charcoal-grey-modern-tee': '$22.00',
  'soft-beige-neutral-tee': '$21.00',
  'olive-green-everyday-tee': '$20.00',
  'ocean-blue-relax-fit-tee': '$22.00',
  'navy-casual-tee': '$25.00',
  'white-basic-tee': '$20.00',
  'black-graphic-tee': '$28.00',
  'blue-oxford-shirt': '$45.00',
  'white-dress-shirt': '$40.00',
  'striped-casual-shirt': '$35.00',
  'floral-summer-dress': '$65.00',
  'black-cocktail-dress': '$85.00',
  'white-sundress': '$55.00',
  'blue-denim-jeans': '$75.00',
  'black-dress-pants': '$60.00',
  'khaki-chino-pants': '$50.00',
  'denim-jacket': '$90.00',
  'leather-jacket': '$150.00',
  'bomber-jacket': '$120.00',
  'gray-hoodie': '$45.00',
  'navy-sweater': '$55.00',
  'cream-knit-sweater': '$65.00',
  'leather-belt': '$35.00',
  'canvas-tote-bag': '$25.00',
  'wool-scarf': '$30.00',
  'white-sneakers': '$80.00',
  'brown-leather-boots': '$120.00',
  'black-loafers': '$95.00'
};

/**
 * Detect product mentions in AI response text
 * This function looks for product names and converts them to clickable product cards
 * NATURAL APPROACH: Only detect from AI responses, don't send data to Sensay
 */
export function detectProductsInText(text: string): ProductInfo[] {
  const products: ProductInfo[] = [];
  const detectedProducts = new Set<string>(); // Prevent duplicates
  
  // Convert text to lowercase for matching
  const lowerText = text.toLowerCase();
  
  // Pattern 1: Look for product names with prices (e.g., "Burgundy Statement Tee - $23" or "Burgundy Statement Tee - Rp 23")
  const productPricePattern = /([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))\s*-\s*(\$|Rp)\s*(\d+(?:\.\d{2})?)/gi;
  const priceMatches = text.matchAll(productPricePattern);
  
  for (const match of priceMatches) {
    const productName = match[1].trim().toLowerCase();
    const currency = match[2]; // $ or Rp
    const amount = match[3];
    const price = currency === 'Rp' ? `Rp ${amount}` : `$${amount}`;
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 2: Look for product names in bold format (e.g., **Product Name**)
  const boldProductPattern = /\*\*([^*]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt)[^*]*)\*\*/gi;
  const boldMatches = text.matchAll(boldProductPattern);
  
  for (const match of boldMatches) {
    const productName = match[1].trim().toLowerCase();
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        const price = PRICE_DATABASE[handle] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 3: Look for numbered product mentions (e.g., "1. Burgundy Statement Tee")
  const numberedProductPattern = /^\d+\.\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))/gim;
  const numberedMatches = text.matchAll(numberedProductPattern);
  
  for (const match of numberedMatches) {
    const productName = match[1].trim().toLowerCase();
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        const price = PRICE_DATABASE[handle] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 4: Look for specific product mentions with articles (e.g., "the Burgundy Statement Tee")
  const specificProductPattern = /(?:the|a|an)\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))/gi;
  const specificMatches = text.matchAll(specificProductPattern);
  
  for (const match of specificMatches) {
    const productName = match[1].trim().toLowerCase();
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        const price = PRICE_DATABASE[handle] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 5: Look for standalone product names (case-insensitive) - ENHANCED to find ALL matches
  const sortedProductNames = Object.keys(PRODUCT_DATABASE).sort((a, b) => b.length - a.length); // Sort by length (longest first)
  
  // Pattern 10: NEW - Look for products with descriptions (e.g., "Product Name - Description")
  const productWithDescPattern = /([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))\s*-\s*([^-]+)/gi;
  const descMatches = text.matchAll(productWithDescPattern);
  
  for (const match of descMatches) {
    const productName = match[1].trim().toLowerCase();
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        const price = PRICE_DATABASE[handle] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  for (const productName of sortedProductNames) {
    if (!detectedProducts.has(productName)) {
      // Check if the product name appears in the text - find ALL occurrences
      const regex = new RegExp(`\\b${productName.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches && matches.length > 0) {
        detectedProducts.add(productName);
        const handle = PRODUCT_DATABASE[productName];
        const price = PRICE_DATABASE[handle] || '';
        const originalName = matches[0]; // Use the first match as the display name
        
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: originalName,
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(originalName.replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 6: NEW - Look for product lists separated by commas, semicolons, or "and"
  const productListPattern = /([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))(?:\s*[,;]\s*|\s+and\s+)([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))/gi;
  const listMatches = text.matchAll(productListPattern);
  
  for (const match of listMatches) {
    // Check both products in the list
    const product1 = match[1].trim().toLowerCase();
    const product2 = match[2].trim().toLowerCase();
    
    // Add first product if not already detected
    if (!detectedProducts.has(product1)) {
      const handle1 = PRODUCT_DATABASE[product1];
      if (handle1) {
        detectedProducts.add(product1);
        const price1 = PRICE_DATABASE[handle1] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price1,
          url: `https://shoppysensay.myshopify.com/products/${handle1}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
    
    // Add second product if not already detected
    if (!detectedProducts.has(product2)) {
      const handle2 = PRODUCT_DATABASE[product2];
      if (handle2) {
        detectedProducts.add(product2);
        const price2 = PRICE_DATABASE[handle2] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[2].trim(), // Original case
          price: price2,
          url: `https://shoppysensay.myshopify.com/products/${handle2}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[2].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 7: NEW - Look for bullet points or dash lists
  const bulletProductPattern = /^[\s]*[-•*]\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))/gim;
  const bulletMatches = text.matchAll(bulletProductPattern);
  
  for (const match of bulletMatches) {
    const productName = match[1].trim().toLowerCase();
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        const price = PRICE_DATABASE[handle] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  // Pattern 8: NEW - Look for product recommendations in quotes
  const quotedProductPattern = /[""']([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))[""']/gi;
  const quotedMatches = text.matchAll(quotedProductPattern);
  
  // Pattern 9: NEW - Look for products with flexible price formats (e.g., "Product Name - Rp 23" or "Product Name - $23")
  const flexiblePricePattern = /([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))\s*-\s*(\$|Rp)\s*(\d+)/gi;
  const flexibleMatches = text.matchAll(flexiblePricePattern);
  
  for (const match of flexibleMatches) {
    const productName = match[1].trim().toLowerCase();
    const currency = match[2];
    const amount = match[3];
    const price = currency === 'Rp' ? `Rp ${amount}` : `$${amount}`;
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  for (const match of quotedMatches) {
    const productName = match[1].trim().toLowerCase();
    
    if (!detectedProducts.has(productName)) {
      const handle = PRODUCT_DATABASE[productName];
      if (handle) {
        detectedProducts.add(productName);
        const price = PRICE_DATABASE[handle] || '';
        products.push({
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: match[1].trim(), // Original case
          price: price,
          url: `https://shoppysensay.myshopify.com/products/${handle}`,
          image: `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(match[1].trim().replace(/\s+/g, '+'))}`,
          availability: 'Available'
        });
      }
    }
  }
  
  console.log(`🔍 Product detection completed: Found ${products.length} products`);
  console.log('📦 Detected products:', products.map(p => p.name));
  
  return products;
}

/**
 * Convert text with product mentions to interactive text with clickable product links
 * NATURAL APPROACH: Only process AI responses, don't modify user input
 */
export function convertTextToInteractive(text: string): { text: string; products: ProductInfo[] } {
  const products = detectProductsInText(text);
  let interactiveText = text;
  
  // Replace product mentions with clickable links
  for (const product of products) {
    const productName = product.name;
    const productUrl = product.url;
    
    // Create clickable link
    const link = `[${productName}](${productUrl})`;
    
    // Replace the product name with the link (case-insensitive)
    // Use a more robust regex that handles word boundaries better
    const escapedProductName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedProductName}\\b`, 'gi');
    
    // Replace all occurrences of this product name
    interactiveText = interactiveText.replace(regex, link);
  }
  
  console.log(`🔗 Converted text with ${products.length} product links`);
  
  return { text: interactiveText, products };
}

/**
 * Extract product information from AI response and create product cards
 * NATURAL APPROACH: Only process AI responses, don't send data to Sensay
 */
export function extractProductsFromAIResponse(responseText: string): {
  processedText: string;
  detectedProducts: ProductInfo[];
} {
  const { text: processedText, products: detectedProducts } = convertTextToInteractive(responseText);
  
  console.log(`🎯 AI Response Processing: Found ${detectedProducts.length} products`);
  if (detectedProducts.length > 0) {
    console.log('📋 Product list:', detectedProducts.map(p => `${p.name} - ${p.price}`));
  }
  
  return {
    processedText,
    detectedProducts
  };
}

/**
 * NEW: Enhanced function to handle multiple product recommendations from Sensay
 * This function specifically looks for recommendation patterns in AI responses
 */
export function extractMultipleProductRecommendations(responseText: string): {
  processedText: string;
  detectedProducts: ProductInfo[];
  recommendationCount: number;
} {
  const { text: processedText, products: detectedProducts } = convertTextToInteractive(responseText);
  
  // Count how many products were recommended
  const recommendationCount = detectedProducts.length;
  
  console.log(`🎯 Multiple Product Recommendations: Found ${recommendationCount} products`);
  if (recommendationCount > 0) {
    console.log('📋 Recommended products:', detectedProducts.map(p => `${p.name} - ${p.price}`));
  }
  
  return {
    processedText,
    detectedProducts,
    recommendationCount
  };
}

/**
 * TEST FUNCTION: Demonstrate multiple product detection
 * This function can be used to test the enhanced looping functionality
 */
export function testMultipleProductDetection(): void {
  const testText = `
    Here are my top recommendations for you:
    
    1. **Burgundy Statement Tee** - $23.00
    2. **Navy Casual Tee** - $25.00
    3. **White Basic Tee** - $20.00
    
    You might also like:
    - Blue Oxford Shirt
    - Denim Jacket
    - White Sneakers
    
    For a complete look, consider pairing the "Burgundy Statement Tee" with "Blue Denim Jeans" and "White Sneakers".
    
    Other great options include: Black Graphic Tee, Gray Hoodie, and Leather Belt.
  `;
  
  console.log('🧪 Testing Multiple Product Detection...');
  console.log('📝 Test text:', testText);
  
  const result = extractMultipleProductRecommendations(testText);
  
  console.log('✅ Test Results:');
  console.log(`- Products detected: ${result.recommendationCount}`);
  console.log(`- Products:`, result.detectedProducts.map(p => p.name));
  console.log(`- Processed text length: ${result.processedText.length}`);
}

/**
 * NEW: Smart product detection that fetches from Shopify store
 * Instead of relying on local database, this function searches Shopify directly
 */
export async function detectProductsFromShopify(text: string): Promise<ProductInfo[]> {
  const products: ProductInfo[] = [];
  const detectedProducts = new Set<string>(); // Prevent duplicates
  
  // Extract product names from text using various patterns
  const productNames = extractProductNamesFromText(text);
  
  console.log('🔍 Extracted product names:', productNames);
  
  // For each product name, search in Shopify store
  for (const productName of productNames) {
    if (!detectedProducts.has(productName.toLowerCase())) {
      try {
        // Search for product in Shopify store
        const shopifyProduct = await searchProductInShopify(productName);
        
        if (shopifyProduct) {
          detectedProducts.add(productName.toLowerCase());
          products.push({
            id: shopifyProduct.id,
            name: shopifyProduct.title,
            price: formatShopifyPrice(shopifyProduct.priceRange.minVariantPrice.amount, shopifyProduct.priceRange.minVariantPrice.currencyCode),
            url: `https://shoppysensay.myshopify.com/products/${shopifyProduct.handle}`,
            image: shopifyProduct.images.edges[0]?.node.url || `https://via.placeholder.com/300x200/95BF47/FFFFFF?text=${encodeURIComponent(productName.replace(/\s+/g, '+'))}`,
            description: shopifyProduct.description,
            availability: shopifyProduct.totalInventory > 0 ? 'Available' : 'Out of Stock'
          });
          
          console.log(`✅ Found product in Shopify: ${shopifyProduct.title}`);
        }
      } catch (error) {
        console.log(`❌ Error searching for product "${productName}":`, error);
      }
    }
  }
  
  // If no products found in Shopify, fallback to local detection
  if (products.length === 0) {
    console.log('🔄 No products found in Shopify, falling back to local detection...');
    const localProducts = detectProductsInText(text);
    products.push(...localProducts);
    console.log(`📦 Local detection found ${localProducts.length} products`);
  }
  
  console.log(`🎯 Shopify search completed: Found ${products.length} products`);
  return products;
}

/**
 * Extract product names from text using various patterns
 */
function extractProductNamesFromText(text: string): string[] {
  const productNames: string[] = [];
  const detectedNames = new Set<string>();
  
  // Pattern 1: Numbered list with prices (e.g., "1. Product Name - Rp 23")
  const numberedWithPricePattern = /^\d+\.\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))\s*-\s*(\$|Rp)\s*(\d+)/gim;
  const numberedMatches = text.matchAll(numberedWithPricePattern);
  
  for (const match of numberedMatches) {
    const productName = match[1].trim();
    if (!detectedNames.has(productName.toLowerCase())) {
      productNames.push(productName);
      detectedNames.add(productName.toLowerCase());
    }
  }
  
  // Pattern 2: Bold formatting (e.g., **Product Name**)
  const boldPattern = /\*\*([^*]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt)[^*]*)\*\*/gi;
  const boldMatches = text.matchAll(boldPattern);
  
  for (const match of boldMatches) {
    const productName = match[1].trim();
    if (!detectedNames.has(productName.toLowerCase())) {
      productNames.push(productName);
      detectedNames.add(productName.toLowerCase());
    }
  }
  
  // Pattern 3: Bullet points (e.g., "- Product Name")
  const bulletPattern = /^[\s]*[-•*]\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))/gim;
  const bulletMatches = text.matchAll(bulletPattern);
  
  for (const match of bulletMatches) {
    const productName = match[1].trim();
    if (!detectedNames.has(productName.toLowerCase())) {
      productNames.push(productName);
      detectedNames.add(productName.toLowerCase());
    }
  }
  
  // Pattern 4: Quoted products (e.g., "Product Name")
  const quotedPattern = /[""']([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater|Belt|Bag|Scarf|Sneakers|Boots|Loafers|T-Shirt))[""']/gi;
  const quotedMatches = text.matchAll(quotedPattern);
  
  for (const match of quotedMatches) {
    const productName = match[1].trim();
    if (!detectedNames.has(productName.toLowerCase())) {
      productNames.push(productName);
      detectedNames.add(productName.toLowerCase());
    }
  }
  
  return productNames;
}

/**
 * Search for product in Shopify store
 */
async function searchProductInShopify(productName: string): Promise<any> {
  try {
    console.log(`🔍 Searching Shopify for product: "${productName}"`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Shopify search timeout')), 5000); // 5 second timeout
    });
    
    // Call Shopify search API using correct backend URL
    const searchPromise = fetch(createApiUrl('/shopify/search'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: productName
      })
    });
    
    // Race between the search and timeout
    const response = await Promise.race([searchPromise, timeoutPromise]) as Response;
    
    console.log(`📡 Shopify search response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Shopify search failed: ${response.status} - ${errorText}`);
      throw new Error(`Shopify search failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`📦 Shopify search response:`, data);
    
    // Return the first matching product
    if (data.products && data.products.length > 0) {
      console.log(`✅ Found ${data.products.length} products for "${productName}"`);
      return data.products[0];
    }
    
    console.log(`❌ No products found for "${productName}"`);
    return null;
  } catch (error) {
    console.error(`❌ Error searching Shopify for "${productName}":`, error);
    return null;
  }
}

/**
 * Format Shopify price
 */
function formatShopifyPrice(amount: string, currencyCode: string): string {
  const price = parseFloat(amount);
  if (currencyCode === 'IDR') {
    return `$${price.toFixed(2)}`;
  }
  if (currencyCode === 'USD') {
    return `$${price.toFixed(2)}`;
  }
  return `${price.toFixed(2)} ${currencyCode}`;
}

/**
 * TEST FUNCTION: Test the new smart Shopify search system
 */
export async function testSmartShopifySearch(): Promise<void> {
  const testText = `Sure! Here are some t-shirt options available in our store:

1. Burgundy Statement Tee Short Sleeve T-Shirt - $23
   - This t-shirt has a bold color and is perfect for making a style statement.

2. Charcoal Grey Modern Tee - $22
   - Offers a modern and sleek look, ideal for everyday wear.

3. Soft Beige Neutral Tee - $21
   - A soft and versatile choice, perfect to pair with various outfits.

4. Olive Green Everyday Tee - $20
   - Comfortable and trendy for casual style.

5. Ocean Blue Relax Fit Tee - $22
   - Provides comfort with a refreshing color, perfect for casual days.

If any of these catch your attention or if you need more information, just let me know! 😊`;

  console.log('🧪 Testing Smart Shopify Search...');
  console.log('📝 Test text:', testText);
  
  try {
    const products = await detectProductsFromShopify(testText);
    
    console.log('✅ Test Results:');
    console.log(`- Products found in Shopify: ${products.length}`);
    console.log(`- Products:`, products.map(p => `${p.name} - ${p.price}`));
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}
