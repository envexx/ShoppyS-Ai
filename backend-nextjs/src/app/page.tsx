export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🛍️ Shoppy Sensay API
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              AI Shopping Assistant Backend - Next.js API
            </p>
            <p className="text-lg text-green-600 dark:text-green-400 font-semibold">
              ✅ Migration from Node.js to Next.js Completed!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Available API Endpoints
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    Authentication
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><code>POST /api/auth/register</code></li>
                    <li><code>POST /api/auth/login</code></li>
                    <li><code>GET /api/auth/me</code></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    Chat (AI Assistant)
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><code>POST /api/chat/send</code></li>
                    <li><code>GET /api/chat/history</code></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    Shopping Cart
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><code>GET /api/cart</code></li>
                    <li><code>POST /api/cart/add</code></li>
                    <li><code>GET /api/cart/count</code></li>
                    <li><code>PUT /api/cart/[itemId]</code></li>
                    <li><code>DELETE /api/cart/[itemId]</code></li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
                    Shopify Integration
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><code>POST /api/shopify/search</code></li>
                    <li><code>GET /api/shopify/featured</code></li>
                    <li><code>GET /api/shopify/product/[handle]</code></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Orders & Purchases
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><code>GET /api/purchases</code></li>
                    <li><code>POST /api/checkout</code></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    System
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><code>GET /api/health</code></li>
                    <li><code>GET /api</code> (this info)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                🚀 Next.js 15
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Modern framework with App Router, server components, and built-in optimizations.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                🧠 AI Powered
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Integrated with Sensay AI for intelligent shopping assistance.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                🛒 E-commerce
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Full Shopify integration for product search and cart management.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center flex-wrap">
            <a
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              href="/api"
              target="_blank"
            >
              View API Info
            </a>
            <a
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              href="/api/health"
              target="_blank"
            >
              Health Check
            </a>
            <a
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
              href="https://github.com"
              target="_blank"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}