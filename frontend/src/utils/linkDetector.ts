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

/**
 * Detect shopping links and extract product information
 * DISABLED: Only show products from our Shopify store
 */
export function detectShoppingLinks(text: string): ProductInfo[] {
  // Return empty array to disable external link detection
  return [];
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Extract product information from surrounding text context
 */
function extractProductFromContext(text: string, url: string, index: number): ProductInfo | null {
  const domain = extractDomain(url);
  
  // Try to extract product name from surrounding text
  const sentences = text.split(/[.!?]/);
  let productName = '';
  let description = '';
  let price = '';
  
  // Find sentence containing the URL
  for (const sentence of sentences) {
    if (sentence.includes(url)) {
      const words = sentence.trim().split(/\s+/);
      
      // Extract potential product name (words before and after URL)
      const urlIndex = words.findIndex(word => word.includes(url));
      const beforeUrl = words.slice(Math.max(0, urlIndex - 5), urlIndex);
      const afterUrl = words.slice(urlIndex + 1, urlIndex + 6);
      
      productName = [...beforeUrl, ...afterUrl]
        .filter(word => !word.includes('http') && word.length > 2)
        .join(' ')
        .replace(/[^\w\s]/gi, ' ')
        .trim();
      
      description = sentence.replace(url, '').trim();
      break;
    }
  }
  
  // Extract price from text (simple regex for common price patterns)
  const priceMatch = text.match(/(?:Rp|$|€|£|\$)\s*[\d.,]+(?:\.\d{2})?/i);
  if (priceMatch) {
    price = priceMatch[0];
  }
  
  // Generate fallback product name if not found
  if (!productName) {
    const domainName = domain.split('.')[0];
    productName = `Product from ${domainName}`;
  }
  
  // Generate a simple product ID
  const productId = `product_${Date.now()}_${index}`;
  
  return {
    id: productId,
    name: productName.substring(0, 100), // Limit length
    price: price || undefined,
    url: url,
    description: description.substring(0, 200) || undefined, // Limit length
    image: generateProductImage(domain), // Generate placeholder image
    availability: 'Available'
  };
}

/**
 * Generate product image based on domain
 */
function generateProductImage(domain: string): string {
  // Return placeholder image or try to generate based on domain
  const domainImages: { [key: string]: string } = {
    'amazon.com': 'https://via.placeholder.com/300x200/FF9900/FFFFFF?text=Amazon+Product',
    'tokopedia.com': 'https://via.placeholder.com/300x200/42B549/FFFFFF?text=Tokopedia+Product',
    'shopee.co.id': 'https://via.placeholder.com/300x200/EE4D2D/FFFFFF?text=Shopee+Product',
    'lazada.co.id': 'https://via.placeholder.com/300x200/0F136D/FFFFFF?text=Lazada+Product',
    'bukalapak.com': 'https://via.placeholder.com/300x200/E31E24/FFFFFF?text=Bukalapak+Product',
  };
  
  for (const [key, image] of Object.entries(domainImages)) {
    if (domain.includes(key)) {
      return image;
    }
  }
  
  // Default placeholder
  return 'https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Product';
}

/**
 * Extract product info from AI response text patterns
 * ENABLED: Generate Shopify product links when AI mentions product names
 */
export function extractProductFromMessage(message: string): ProductInfo[] {
  const products: ProductInfo[] = [];
  
  // Look for product mentions with prices (e.g., "Burgundy Statement Tee - $23")
  const productPricePattern = /([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))\s*-\s*\$(\d+(?:\.\d{2})?)/gi;
  const priceMatches = message.matchAll(productPricePattern);
  
  for (const match of priceMatches) {
    const productName = match[1].trim();
    const price = `$${match[2]}`;
    
    // Check if this product is already added (avoid duplicates)
    const isDuplicate = products.some(p => p.name.toLowerCase() === productName.toLowerCase());
    
    if (!isDuplicate) {
      products.push({
        id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: productName,
        price: price,
        url: `https://shoppysensay.myshopify.com/products/${productName.toLowerCase().replace(/\s+/g, '-')}`,
        image: 'https://via.placeholder.com/300x200/95BF47/FFFFFF?text=Shopify+Product',
        availability: 'Available'
      });
    }
  }
  
  // Look for product names in bold format (e.g., **Product Name**)
  const boldProductPattern = /\*\*([^*]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater)[^*]*)\*\*/gi;
  const boldMatches = message.matchAll(boldProductPattern);
  
  for (const match of boldMatches) {
    const productName = match[1].trim();
    
    // Check if this product is already added
    const isDuplicate = products.some(p => p.name.toLowerCase() === productName.toLowerCase());
    
    if (!isDuplicate) {
      products.push({
        id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: productName,
        url: `https://shoppysensay.myshopify.com/products/${productName.toLowerCase().replace(/\s+/g, '-')}`,
        image: 'https://via.placeholder.com/300x200/95BF47/FFFFFF?text=Shopify+Product',
        availability: 'Available'
      });
    }
  }
  
  // Look for specific product mentions without prices (e.g., "Burgundy Statement Tee")
  const specificProductPattern = /(?:the|a|an)\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))/gi;
  const specificMatches = message.matchAll(specificProductPattern);
  
  for (const match of specificMatches) {
    const productName = match[1].trim();
    
    // Check if this product is already added
    const isDuplicate = products.some(p => p.name.toLowerCase() === productName.toLowerCase());
    
    if (!isDuplicate) {
      products.push({
        id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: productName,
        url: `https://shoppysensay.myshopify.com/products/${productName.toLowerCase().replace(/\s+/g, '-')}`,
        image: 'https://via.placeholder.com/300x200/95BF47/FFFFFF?text=Shopify+Product',
        availability: 'Available'
      });
    }
  }
  
  // Look for numbered product mentions (e.g., "1. Burgundy Statement Tee")
  const numberedProductPattern = /^\d+\.\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))/gim;
  const numberedMatches = message.matchAll(numberedProductPattern);
  
  for (const match of numberedMatches) {
    const productName = match[1].trim();
    
    // Check if this product is already added
    const isDuplicate = products.some(p => p.name.toLowerCase() === productName.toLowerCase());
    
    if (!isDuplicate) {
      products.push({
        id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: productName,
        url: `https://shoppysensay.myshopify.com/products/${productName.toLowerCase().replace(/\s+/g, '-')}`,
        image: 'https://via.placeholder.com/300x200/95BF47/FFFFFF?text=Shopify+Product',
        availability: 'Available'
      });
    }
  }
  
  return products;
}
