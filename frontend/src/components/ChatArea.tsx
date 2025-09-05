import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Smile, 
  Paperclip, 
  Send, 
  Mic,
  Shield,
  ShoppingBag,
  ShoppingCart,
  History
} from 'lucide-react';
import * as api from '../services/api';
import ProductCard from './ProductCard';
import { detectShoppingLinks, extractProductFromMessage } from '../utils/linkDetector';
import { detectProductsInText, extractProductsFromAIResponse, extractMultipleProductRecommendations, detectProductsFromShopify } from '../utils/productDetector';
import MarkdownText from '../utils/markdownParser';
import { chatStorage, ChatMessage } from '../utils/chatStorage';
import { createApiUrl, getAuthHeaders } from '../config/api';

interface User {
  id: string;
  email: string;
  username: string;
  sensayUserId?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  link?: string;
  products?: ProductInfo[];
  shopifyProducts?: ShopifyProductInfo[];
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

interface ChatAreaProps {
  selectedChat: string;
  user: User | null;
  isNewChat?: boolean;
  onSessionCreated?: (sessionId: string) => void;
  onCartClick?: () => void;
  onHistoryClick?: () => void;
}

const ChatArea = ({ selectedChat, user, isNewChat = false, onSessionCreated, onCartClick, onHistoryClick }: ChatAreaProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);



  // Load cart count on component mount
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const response = await api.getCartCount();
        setCartCount(response.data.count);
      } catch (error) {
        console.error('Error loading cart count:', error);
      }
    };
    
    if (user) {
      loadCartCount();
    }
  }, [user]);

  // Function to refresh cart count (optimized)
  const refreshCartCount = useCallback(async () => {
    try {
      console.log('🔄 Refreshing cart count...');
      const response = await api.getCartCount();
      if (response.success) {
        console.log('✅ Cart count updated to:', response.data.count);
        setCartCount(response.data.count);
      } else {
        console.log('❌ Failed to get cart count:', response);
      }
    } catch (error) {
      console.error('❌ Error refreshing cart count:', error);
    }
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🛒 Cart update event received, refreshing cart count...');
      refreshCartCount();
    };

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', handleCartUpdate);
    console.log('👂 Cart update event listener added');
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      console.log('👂 Cart update event listener removed');
    };
  }, [refreshCartCount]);

  // Function to detect products in a message (disabled for user messages)
  const detectProductsInMessage = (content: string): ProductInfo[] => {
    // Don't detect products in user messages - only in AI responses
    return [];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('🔄 ChatArea useEffect triggered:', { 
      user: !!user, 
      isNewChat, 
      selectedChat, 
      currentSessionId 
    });
    
    // Hanya load jika session berubah atau user baru login
    if (user && !isNewChat && selectedChat && selectedChat !== 'new-chat' && selectedChat !== currentSessionId) {
      console.log('📝 Loading existing chat history for session:', selectedChat);
      loadChatHistory(selectedChat);
      setCurrentSessionId(selectedChat);
    } else if (isNewChat || selectedChat === 'new-chat') {
      // Clear messages for new chat and reset session ID
      console.log('🆕 NEW CHAT MODE - Clearing messages and session ID');
      setMessages([]);
      setCurrentSessionId(null);
      setError(''); // Also clear any errors
      setLoading(false); // Also clear loading state
      console.log('✅ New chat mode - messages cleared, session ID reset');
    }
  }, [user, selectedChat, isNewChat, currentSessionId]);

  const loadChatHistory = async (sessionId: string) => {
    if (!user) return;
    
    try {
      console.log('Loading chat history for session:', sessionId);
      
      // Load dari localStorage terlebih dahulu untuk performa cepat
      const localMessages = chatStorage.getSessionMessages(sessionId);
      let finalMessages: Message[] = [];
      
      if (localMessages.length > 0) {
        console.log(`📱 Loaded ${localMessages.length} messages from localStorage for session ${sessionId}`);
        // Konversi ChatMessage ke Message format
        finalMessages = localMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp).toISOString(),
          products: msg.products
        }));
      }
      
      // Kemudian sync dengan server untuk data terbaru (hanya jika ada perbedaan)
      try {
        const response = await fetch(createApiUrl(`/chat/${sessionId}`), {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Chat history response for session:', sessionId, data);
          
          if (data.success && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            const serverMessages = data.messages.map((msg: any) => ({
              id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
              content: msg.content,
              role: msg.role,
              timestamp: msg.timestamp || new Date().toISOString(),
              products: msg.products || undefined
            }));
            
            // Bandingkan jumlah pesan untuk menentukan mana yang lebih lengkap
            if (serverMessages.length > finalMessages.length) {
              console.log(`🔄 Server has more messages (${serverMessages.length} vs ${finalMessages.length}), using server data`);
              finalMessages = serverMessages;
              
              // Update localStorage dengan data server yang lebih lengkap
              serverMessages.forEach((msg: any) => {
                chatStorage.saveMessage(sessionId, {
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp).getTime(),
                  products: msg.products
                });
              });
            } else {
              console.log(`📱 Local storage has same or more messages (${finalMessages.length} vs ${serverMessages.length}), keeping local data`);
            }
          } else {
            console.log('No messages found on server for session:', sessionId, 'Response data:', data);
            // Tetap gunakan data lokal jika ada
          }
        } else {
          console.log('Failed to load chat history from server for session:', sessionId, 'Status:', response.status);
          // Tetap gunakan data lokal jika server error
        }
      } catch (error) {
        console.error('Failed to sync with server for session:', sessionId, error);
        // Tetap gunakan data lokal jika server error
      }
      
      // Set messages hanya sekali dengan data final
      setMessages(finalMessages);
      console.log(`✅ Final message count for session ${sessionId}: ${finalMessages.length}`);
      
    } catch (error) {
      console.error('Failed to load chat history for session:', sessionId, error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || !user) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!message.trim(), 
        loading, 
        hasUser: !!user,
        userId: user?.id 
      });
      return;
    }

    const messageContent = message.trim();
    
    console.log('📤 Sending message for user:', user.id, user.username, 'Content:', messageContent.substring(0, 50) + '...');
    
    const userMessage: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${performance.now()}`,
      content: messageContent,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError('');

    try {
      // Determine if this is a new chat or continuing existing session
      const isNewChatMode = isNewChat || selectedChat === 'new-chat';
      
      // For new chat mode, don't send any sessionId
      // For existing session, use the sessionId from URL or currentSessionId
      let sessionIdToSend: string | undefined;
      
      if (isNewChatMode) {
        // New chat - don't send sessionId, let backend create new one
        sessionIdToSend = undefined;
        console.log('🆕 New chat mode - no sessionId will be sent');
      } else {
        // Existing session - use sessionId from URL or currentSessionId
        sessionIdToSend = selectedChat !== 'new-chat' ? selectedChat : (currentSessionId || undefined);
        console.log('📝 Existing session mode - using sessionId:', sessionIdToSend);
      }
      
      console.log('📨 Sending message with params:', { 
        message: userMessage.content, 
        isNewChatMode: isNewChatMode, 
        sessionId: sessionIdToSend,
        selectedChat,
        isNewChat,
        messagesCount: messages.length,
        currentSessionId,
        userId: user.id
      });
      
      // Use the improved API service
      const response = await api.sendChat(
        userMessage.content, 
        isNewChatMode, 
        sessionIdToSend
      );

      console.log('📨 Chat response received:', {
        success: response.success,
        sessionId: response.data.sessionId,
        isNewSession: response.data.isNewSession,
        response: response.data.content?.substring(0, 100) + '...'
      });

      if (response.success) {
        const aiContent = response.data.content || 'No response content';
        
        // Log the original AI response from Sensay
        console.log('🤖 Original Sensay Response:', aiContent);
        console.log('📊 Response length:', aiContent.length);
        console.log('📝 Response preview:', aiContent.substring(0, 200) + '...');
        
        // Process AI response to detect product mentions and create interactive text
        // Use smart Shopify search instead of local database
        let detectedProducts = [];
        try {
          detectedProducts = await detectProductsFromShopify(aiContent);
        } catch (error) {
          console.error('❌ Shopify product detection failed, falling back to local detection:', error);
          // Fallback to local product detection
          detectedProducts = detectProductsInText(aiContent);
        }
        
        // Use AI content directly - formatting will be handled by markdownParser
        let processedText = aiContent;
        
        // Create interactive text with clickable links (but keep it clean without markdown)
        for (const product of detectedProducts) {
          // Just replace product names with bold formatting, no links
          const boldProductName = `**${product.name}**`;
          const regex = new RegExp(`\\b${product.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
          processedText = processedText.replace(regex, boldProductName);
        }
        
        // Preserve line breaks and structure after adding links
        processedText = processedText.replace(/\\n\\s*\\n/g, '\\n\\n');
        processedText = processedText.replace(/\\n{3,}/g, '\\n\\n');
        
        const aiMessage: Message = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${performance.now()}`,
          content: processedText, // Use processed text with clickable product links
          role: 'assistant',
          timestamp: new Date().toISOString(),
          products: detectedProducts.length > 0 ? detectedProducts : undefined // Use detected products from Shopify
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Save messages to localStorage
        const sessionId = response.data.sessionId || currentSessionId;
        
        if (sessionId) {
          // Save user message
          chatStorage.saveMessage(sessionId, {
            id: userMessage.id,
            role: 'user',
            content: userMessage.content,
            timestamp: new Date(userMessage.timestamp).getTime(),
            products: userMessage.products
          });
          
          // Save AI message
          chatStorage.saveMessage(sessionId, {
            id: aiMessage.id,
            role: 'assistant',
            content: aiMessage.content,
            timestamp: new Date(aiMessage.timestamp).getTime(),
            products: aiMessage.products
          });
          
          console.log(`💾 Saved messages to localStorage for session ${response.data.sessionId}`);
        }
        
        // Update currentSessionId with the session ID from response
        if (response.data.sessionId) {
          setCurrentSessionId(response.data.sessionId);
          
          // If this was a new session, notify parent to switch to it
          if (isNewChatMode && onSessionCreated) {
            console.log('🆕 New session created, notifying parent:', response.data.sessionId);
            onSessionCreated(response.data.sessionId);
          } else if (response.data.isNewSession && onSessionCreated) {
            console.log('🆕 Backend created new session, notifying parent:', response.data.sessionId);
            onSessionCreated(response.data.sessionId);
          }
        }
        
        // Update chat sessions in localStorage
        chatStorage.saveSession({
          id: response.data.sessionId,
          title: generateSessionTitle(userMessage.content),
          lastMessage: aiMessage.content.substring(0, 50) + (aiMessage.content.length > 50 ? '...' : ''),
          timestamp: new Date().getTime(),
          messageCount: 2, // User message + AI response
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
        
        // Check if response indicates cart action and refresh cart count
        const responseText = (aiContent || '').toLowerCase();
        if (responseText.includes('added to cart') || 
            responseText.includes('🛒') || 
            responseText.includes('cart') ||
            responseText.includes('enjoy your new') ||
            responseText.includes('removed') ||
            responseText.includes('deleted') ||
            responseText.includes('reduced') ||
            responseText.includes('updated') ||
            responseText.includes('changed')) {
          console.log('Response indicates cart action (fallback), refreshing cart count...');
          refreshCartCount();
        }
        
        // Product detection is now handled inline with ProductCard
      } else {
        console.error('Invalid response structure:', response);
        setError('Received invalid response from server');
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateSessionTitle = (userMessage: string): string => {
    // Clean the message
    let title = userMessage.trim();
    
    // Remove common prefixes
    title = title.replace(/^(find|search|show|get|give|tell|help|what|how|where|when|why|can|could|would|should|do|does|did|is|are|was|were)\s+/i, '');
    
    // Take first 4-6 words
    const words = title.split(' ').slice(0, 6);
    title = words.join(' ');
    
    // Limit length
    if (title.length > 40) {
      title = title.substring(0, 40) + '...';
    }
    
    // If empty or too short, use session ID
    if (title.length < 3) {
      return 'Chat Session';
    }
    
    return title;
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col bg-slate-800/30 backdrop-blur-xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-bold mb-2 font-sora text-white">Welcome to Shoppy Sensay</h3>
            <p className="text-slate-300">Please login to start chatting with your AI shopping assistant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Header with Cart and History Icons */}
      {user && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#71B836]/10 dark:bg-[#71B836]/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#71B836] dark:text-[#71B836]/80" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shoppy Sensay</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Shopping Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
              title="Keranjang"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            
            {/* History Icon */}
            <button
              onClick={onHistoryClick}
              className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
              title="Riwayat Pembelian"
            >
              <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto ultra-thin-scrollbar p-6 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            {isNewChat || selectedChat === 'new-chat' ? (
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#71B836]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#71B836]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-sora">Welcome to Shoppy Sensay!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  I'm your smart shopping assistant! I can help you find the best products, 
                  compare prices, and make informed purchasing decisions. What would you like to shop for today?
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="bg-[#71B836]/10 dark:bg-[#71B836]/20 border border-[#71B836]/30 dark:border-[#71B836]/50 rounded-lg p-3 text-left">
                    <p className="text-[#71B836] dark:text-[#71B836]/80 font-medium">💡 Try asking me:</p>
                    <p className="text-[#71B836] dark:text-[#71B836]/70">"Find me trendy casual shirts under $50"</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 text-left">
                    <p className="text-green-700 dark:text-green-300 font-medium">🔍 Or say:</p>
                    <p className="text-green-600 dark:text-green-400">"Show me the best summer dresses for 2025"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start w-full">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                  <p className="text-sm">Hello! I'm Shoppy Sensay, your smart shopping assistant! 🛍️ I'm here to help you find the best products at great prices. What are you looking to buy today?</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Session Header */}
            {!isNewChat && selectedChat !== 'new-chat' && (
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#71B836] rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      Chat Session Started
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {messages.length > 0 ? formatTime(messages[0].timestamp) : 'Now'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#71B836] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div>
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">
                          <MarkdownText content={msg.content} />
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
                
                {/* Product Cards - Show detected products from frontend */}
                {(msg.products && msg.products.length > 0) && (
                  <div className="w-full">
                    <ProductCard products={msg.products} isShopifyProducts={false} />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#71B836]/80 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#71B836]/80 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#71B836]/80 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Shoppy is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="relative p-6 
            border border-gray-200 dark:border-white/30 
            bg-white/30 dark:bg-gray-900/30 
            backdrop-blur-md 
            flex-shrink-0 
            shadow-sm 
            rounded-xl">
        {/* Enhanced Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl"></div>
        
        <form onSubmit={handleSendMessage} className="relative z-10 flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about any product you're looking for..."
              className="w-full px-4 py-3 glass-morphism-enhanced rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400 text-sm pr-20 focus:outline-none focus:ring-2 focus:ring-[#71B836]/50 focus:border-white/50 transition-all duration-300 shadow-sm"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button type="button" className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm">
                <Smile className="w-5 h-5 text-gray-600 hover:text-gray-800" />
              </button>
              <button type="button" className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm">
                <Paperclip className="w-5 h-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button type="button" className="p-3 glass-morphism-enhanced rounded-full transition-all duration-300 hover:scale-110">
              <Mic className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" />
            </button>
            <button
              type="submit"
              className="p-3 bg-gradient-to-r from-[#71B836]/90 to-[#71B836]/90 hover:from-[#71B836] hover:to-[#71B836]/80 rounded-full text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-110 backdrop-blur-sm"
              disabled={loading || !message.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <div className="relative z-10 flex items-center justify-center mt-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1 glass-morphism-enhanced px-3 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Powered by Sensay AI • Secure & Private Shopping Assistant</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;