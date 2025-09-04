import React, { useState } from 'react';
import { Package, ShoppingCart, ExternalLink, Star, DollarSign } from 'lucide-react';
import { extractMultipleProductRecommendations } from '../utils/productDetector';
import ProductCard from './ProductCard';

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

const MultipleProductsDemo: React.FC = () => {
  const [demoText, setDemoText] = useState(`Here are my top recommendations for you:

1. **Burgundy Statement Tee** - $23.00
2. **Navy Casual Tee** - $25.00
3. **White Basic Tee** - $20.00

You might also like:
- Blue Oxford Shirt
- Denim Jacket
- White Sneakers

For a complete look, consider pairing the "Burgundy Statement Tee" with "Blue Denim Jeans" and "White Sneakers".

Other great options include: Black Graphic Tee, Gray Hoodie, and Leather Belt.`);

  const [results, setResults] = useState<{
    processedText: string;
    detectedProducts: ProductInfo[];
    recommendationCount: number;
  } | null>(null);

  const handleTest = () => {
    const result = extractMultipleProductRecommendations(demoText);
    setResults(result);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-[#71B836]/10 to-[#71B836]/5 dark:from-[#71B836]/20 dark:to-[#71B836]/10 border border-[#71B836]/20 dark:border-[#71B836]/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🎯 Multiple Product Detection Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This demo shows how Sensay can detect and display multiple product recommendations in a single response.
          The system now supports enhanced looping to handle various product mention formats.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Input Text (AI Response)</h3>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none"
              placeholder="Enter AI response text with product mentions..."
            />
            <button
              onClick={handleTest}
              className="mt-3 bg-[#71B836] hover:bg-[#5A9A2E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Test Product Detection
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Detection Results</h3>
            {results ? (
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-4 h-4 text-[#71B836]" />
                    <span className="font-medium text-sm">
                      {results.recommendationCount} products detected
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {results.detectedProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <span>{index + 1}. {product.name}</span>
                        <span className="text-green-600 dark:text-green-400">{product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Processed Text Preview</h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                    {results.processedText.substring(0, 300)}...
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click "Test Product Detection" to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Cards Display */}
      {results && results.detectedProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            📦 Product Cards Display (Looping Demo)
          </h3>
          <ProductCard products={results.detectedProducts} isShopifyProducts={false} />
        </div>
      )}

      {/* Feature List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          ✨ Enhanced Looping Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Numbered lists (1. Product Name)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Bold formatting (**Product Name**)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Bullet points (- Product Name)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Quoted products ("Product Name")</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Product lists with commas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Products with "and" conjunctions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Articles (the, a, an + Product)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Products with prices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleProductsDemo;
