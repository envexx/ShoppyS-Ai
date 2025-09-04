
import { SensayAPIComplete } from './sensay-api-complete';
import { prisma } from './database';
// @ts-ignore
import { ShopifyService } from './shopify-service';

export class SensayService {
  private sensayAPI: SensayAPIComplete;
  private shopifyService: ShopifyService;
  private replicaUUID: string;

  constructor() {
    this.sensayAPI = new SensayAPIComplete();
    this.shopifyService = new ShopifyService();
    this.replicaUUID = process.env.SENSAY_REPLICA_UUID || '';
  }

  /**
   * Get or create Sensay user ID for our app user
   */
  async getOrCreateSensayUser(userId: string): Promise<string> {
    try {
      // Check if user already has Sensay user ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { sensayUserId: true, username: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.sensayUserId) {
        return user.sensayUserId;
      }

      // Create new Sensay user
      console.log('Creating new Sensay user for:', user.username);
      const sensayUser = await this.sensayAPI.createUser(`customer_${userId}_${Date.now()}`);
      
      // Update our user with Sensay user ID
      await prisma.user.update({
        where: { id: userId },
        data: { sensayUserId: sensayUser.id }
      });

      // Log API usage
      await this.logApiUsage(userId, 'create_user', { userId }, sensayUser);

      return sensayUser.id;
    } catch (error) {
      console.error('Error creating Sensay user:', error);
      throw error;
    }
  }

  /**
   * Send message to Sensay and get response
   */
  async sendMessage(userId: string, message: string, sessionId?: string): Promise<any> {
    try {
      // Validate session ownership if sessionId is provided
      if (sessionId) {
        const isValidSession = await this.validateSessionOwnership(sessionId, userId);
        if (!isValidSession) {
          console.error(`❌ Session ${sessionId} does not belong to user ${userId}`);
          throw new Error('Invalid session access');
        }
        console.log(`✅ Session ${sessionId} validated for user ${userId}`);
      }

      // Get or create Sensay user
      const sensayUserId = await this.getOrCreateSensayUser(userId);
      
      console.log(`Sending message to Sensay for user ${userId} (Sensay ID: ${sensayUserId})`);
      console.log(`Message: "${message}"`);
      console.log(`Using replica: ${this.replicaUUID}`);

      // Check if this is a cart-related query and get current cart state
      const isCartQuery = this.isCartRelatedQuery(message);
      let cartContext = '';
      
      if (isCartQuery) {
        try {
          const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
          });
          
          if (cartItems.length === 0) {
            cartContext = '\n\n[Current Cart State: Your cart is empty. No items are currently in your cart.]';
          } else {
            const itemDetails = cartItems.map((item: any) => 
              `${item.productName} (Qty: ${item.quantity}, $${Number(item.price).toFixed(2)} each)`
            ).join(', ');
            const total = cartItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);
            cartContext = `\n\n[Current Cart State: You have ${cartItems.length} item(s) in your cart: ${itemDetails}. Total: $${total.toFixed(2)}]`;
          }
          console.log('🛒 Cart context added:', cartContext);
        } catch (error) {
          console.warn('⚠️ Failed to get cart context:', error);
        }
      }

      // Send to Sensay with cart context if needed
      const messageWithContext = isCartQuery ? message + cartContext : message;
      const chatResponse = await this.sensayAPI.chatWithReplica(
        this.replicaUUID,
        sensayUserId,
        messageWithContext
      );

      // After getting Sensay response, analyze for different intents
      let shopifyProducts: any[] = [];
      let cartAction: any = null;
      
      // Get recent chat history for context
      const recentHistory = await this.getRecentChatHistory(userId, 3);
      const lastAssistantMessage = recentHistory.find(msg => msg.role === 'assistant');
      
      // Check if user message or AI response indicates cart intent
      const cartIntent = this.detectCartIntent(
        chatResponse.content, 
        message
      );
      
      console.log('🔍 Cart intent analysis:', {
        userMessage: message.substring(0, 100),
        response: chatResponse.content.substring(0, 200) + '...',
        lastAssistantMessage: lastAssistantMessage ? lastAssistantMessage.content.substring(0, 100) : 'none',
        isCartIntent: cartIntent.isCartIntent,
        productInfo: cartIntent.productInfo,
        cartIntentObject: cartIntent
      });
      
      // If no cart intent detected from AI response, check user message directly
      if (!cartIntent.isCartIntent) {
        console.log('🔍 No cart intent from AI response, checking user message...');
        const userCartIntent = this.detectCartIntentFromUserMessage(message);
        if (userCartIntent.isCartIntent) {
          console.log('✅ Cart intent detected from user message:', userCartIntent);
          // Try to add to cart based on user message
          try {
            cartAction = await this.handleAutoAddToCart(userId, userCartIntent.productInfo, message);
            console.log('✅ Auto add to cart result from user message:', cartAction);
          } catch (cartError) {
            console.warn('❌ Auto add to cart failed from user message:', cartError);
          }
        } else {
          console.log('❌ No cart intent detected from user message either');
        }
      } else {
        // Cart intent detected from AI response
        console.log('✅ Cart intent detected from AI response, attempting auto add to cart...', cartIntent.productInfo);
        try {
          cartAction = await this.handleAutoAddToCart(userId, cartIntent.productInfo, message);
          console.log('✅ Auto add to cart result from AI response:', cartAction);
        } catch (cartError) {
          console.warn('❌ Auto add to cart failed from AI response:', cartError);
        }
      }
      
      // Check if Sensay is recommending products
      const isRecommendingProducts = this.detectProductRecommendation(chatResponse.content);
      const isGeneralInformation = this.isGeneralInformationResponse(chatResponse.content);
      
      if (isRecommendingProducts && !isGeneralInformation) {
        console.log('🛍️ Sensay is recommending products, searching Shopify...');
        try {
          // Extract specific product recommendations from Sensay response
          const recommendedProducts = this.extractRecommendedProducts(chatResponse.content);
          console.log('📦 Extracted recommended products:', recommendedProducts);
          
          if (recommendedProducts.length > 0) {
            // Search for each recommended product specifically
            const allFoundProducts: any[] = [];
            
            for (const product of recommendedProducts) {
              try {
                const foundProducts = await this.shopifyService.searchProducts(product.searchQuery, 3);
                allFoundProducts.push(...foundProducts);
              } catch (error) {
                console.warn(`Failed to search for product "${product.name}":`, error);
              }
            }
            
            // If we didn't find enough products with specific searches, try general search
            if (allFoundProducts.length < 2) {
              const userKeywords = this.extractProductKeywords(message);
              const responseKeywords = this.extractProductKeywords(chatResponse.content);
              const allKeywords = [...new Set([...userKeywords, ...responseKeywords])];
              
              if (allKeywords.length > 0) {
                const generalProducts = await this.shopifyService.searchProducts(allKeywords.join(' '), 5);
                allFoundProducts.push(...generalProducts);
              }
            }
            
            // Remove duplicates and limit results
            const uniqueProducts = allFoundProducts.filter((product, index, self) => 
              index === self.findIndex(p => p.id === product.id)
            );
            
            shopifyProducts = uniqueProducts.slice(0, 5);
            console.log(`Found ${shopifyProducts.length} unique products from Shopify`);
          } else {
            // Fallback to general keyword search
            const userKeywords = this.extractProductKeywords(message);
            const responseKeywords = this.extractProductKeywords(chatResponse.content);
            const allKeywords = [...new Set([...userKeywords, ...responseKeywords])];
            
            if (allKeywords.length > 0) {
              shopifyProducts = await this.shopifyService.searchProducts(allKeywords.join(' '), 5);
              console.log(`Found ${shopifyProducts.length} products from Shopify for keywords:`, allKeywords);
            }
          }
        } catch (shopifyError) {
          console.warn('Shopify search failed:', shopifyError);
        }
      }

      // Save to our database
      if (sessionId) {
        await this.saveChatMessage(userId, sessionId, message, chatResponse, shopifyProducts);
      }

      // Log API usage
      await this.logApiUsage(userId, 'chat', { message, sessionId }, chatResponse);

      const finalResponse = {
        content: chatResponse.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        shopifyProducts: shopifyProducts.length > 0 ? shopifyProducts : undefined,
        cartAction: cartAction || undefined
      };
      
      console.log('📤 Final response being sent to frontend:', {
        hasCartAction: !!finalResponse.cartAction,
        cartAction: finalResponse.cartAction,
        cartActionType: typeof finalResponse.cartAction,
        cartActionKeys: finalResponse.cartAction ? Object.keys(finalResponse.cartAction) : 'null',
        contentLength: finalResponse.content.length,
        shopifyProductsCount: shopifyProducts.length,
        originalCartAction: cartAction
      });
      
      return finalResponse;
    } catch (error) {
      console.error('Error in Sensay chat:', error);
      
      // Log error
      await this.logApiUsage(userId, 'chat', { message, sessionId }, null, false, error instanceof Error ? error.message : 'Unknown error');
      
      throw error;
    }
  }

  /**
   * Get or create chat session
   */
  async getOrCreateChatSession(userId: string): Promise<string> {
    try {
      // Check for existing active session (within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      let session = await prisma.chatSession.findFirst({
        where: { 
          userId,
          updatedAt: {
            gte: thirtyMinutesAgo
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (!session) {
        // Create new session
        session = await prisma.chatSession.create({
          data: { userId }
        });
        console.log(`✅ Created new chat session ${session.id} for user ${userId}`);
      } else {
        console.log(`✅ Using existing chat session ${session.id} for user ${userId}`);
      }

      return session.id;
    } catch (error) {
      console.error('Error managing chat session:', error);
      throw error;
    }
  }

  /**
   * Validate session belongs to user
   */
  async validateSessionOwnership(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: userId
        }
      });
      
      return !!session;
    } catch (error) {
      console.error('Error validating session ownership:', error);
      return false;
    }
  }

  /**
   * Get recent chat history for user (for context)
   */
  private async getRecentChatHistory(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: {
          session: {
            userId
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return messages.reverse().map((msg: any) => ({
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.warn('Error fetching recent chat history:', error);
      return [];
    }
  }

  /**
   * Get chat history for user
   */
  async getChatHistory(userId: string, limit: number = 50, sessionId?: string): Promise<any[]> {
    try {
      const whereClause: any = {
        session: {
          userId
        }
      };

      // If sessionId is provided, validate it belongs to the user and filter by it
      if (sessionId) {
        const isValidSession = await this.validateSessionOwnership(sessionId, userId);
        if (!isValidSession) {
          throw new Error('Invalid session access');
        }
        whereClause.sessionId = sessionId;
      }

      const messages = await prisma.chatMessage.findMany({
        where: whereClause,
        include: {
          session: true
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return messages.reverse().map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        link: msg.link,
        shopifyProducts: msg.shopifyProducts,
        sessionId: msg.sessionId
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Detect if user message indicates they want to add something to cart
   */
  private detectCartIntent(response: string, userMessage?: string): { isCartIntent: boolean; productInfo?: any } {
    const lowercaseUserMessage = (userMessage || '').toLowerCase();
    const lowercaseResponse = response.toLowerCase();
    
    // Direct cart intent phrases from user
    const directCartIntents = [
      'add to cart', 'add this to cart', 'put in cart', 'add to bag',
      'buy this', 'i want this', 'i\'ll take it', 'i\'ll buy',
      'purchase this', 'get this', 'order this', 'i want to buy',
      'add the', 'i want the', 'give me the', 'i\'ll get the',
      'i want', 'i need', 'get me', 'give me', 'i\'ll take',
      'i want 1', 'i want one', 'i need 1', 'i need one',
      'get me 1', 'get me one', 'give me 1', 'give me one',
      'i want 1 burgundy', 'i want one burgundy', 'i want burgundy'
    ];
    
    // Selection phrases (when user is selecting from options)
    const selectionPhrases = [
      'first one', 'second one', 'third one', 'number 1', 'number 2', 'number 3',
      '1st', '2nd', '3rd', 'option 1', 'option 2', 'option 3',
      'classic striped', 'graphic print', 'denim button', 'burgundy'
    ];
    
    // AI response indicates cart action
    const aiCartIndicators = [
      'added to cart', 'added to your cart', 'added one to your cart',
      'i\'ve added', 'i added', 'added for you', 'added it to your cart',
      'successfully added', 'added to bag', 'added to basket',
      'make sure that', 'let\'s make sure', 'let\'s add', 'let me add',
      'i\'ll add', 'i will add', 'adding to your cart', 'adding to cart',
      'is added to your cart', 'is added to cart', 'has been added',
      'will be added', 'going to add', 'about to add',
      'i\'ll make sure', 'i will make sure', 'make sure the', 'make sure that the',
      'perfect choice', 'great pick', 'excellent choice', 'good choice',
      'i\'ve added the', 'i added the', 'added the', 'added for you',
      'let\'s add the', 'let me add the', 'i\'ll add the', 'i will add the'
    ];
    
    const hasDirectCartIntent = directCartIntents.some(phrase => 
      lowercaseUserMessage.includes(phrase)
    );
    
    const hasSelectionPhrase = selectionPhrases.some(phrase => 
      lowercaseUserMessage.includes(phrase)
    );
    
    const hasAiCartIndicator = aiCartIndicators.some(phrase => 
      lowercaseResponse.includes(phrase)
    );
    
    console.log('🔍 Cart intent detection details:', {
      hasDirectCartIntent,
      hasSelectionPhrase,
      hasAiCartIndicator,
      userMessage: userMessage?.substring(0, 100),
      response: response.substring(0, 200),
      directCartIntents: directCartIntents.filter(phrase => lowercaseUserMessage.includes(phrase)),
      aiCartIndicators: aiCartIndicators.filter(phrase => lowercaseResponse.includes(phrase)),
      fullResponse: response,
      lowercaseResponse: lowercaseResponse.substring(0, 200)
    });
    
    // If user has direct cart intent OR is selecting from previous options OR AI indicates cart action
    if (hasDirectCartIntent || hasSelectionPhrase || hasAiCartIndicator) {
      console.log('Cart intent detected! Processing...');
      
      // For selection phrases, try to map to products from the response
      let productInfo = null;
      
      if (hasSelectionPhrase && userMessage) {
        productInfo = this.extractSelectedProductInfo(userMessage, response);
      } else if (hasAiCartIndicator) {
        // Extract product info from AI response when it mentions adding to cart
        productInfo = this.extractProductInfoFromAiResponse(response);
        console.log('Product info extracted from AI response:', productInfo);
      } else {
        productInfo = this.extractProductInfoFromResponse(response);
      }
      
      return { isCartIntent: true, productInfo };
    }
    
    return { isCartIntent: false };
  }

  /**
   * Detect cart intent from user message only
   */
  private detectCartIntentFromUserMessage(userMessage: string): { isCartIntent: boolean; productInfo?: any } {
    const lowercaseUserMessage = userMessage.toLowerCase();
    
    // Direct cart intent phrases from user
    const directCartIntents = [
      'add to cart', 'add this to cart', 'put in cart', 'add to bag',
      'buy this', 'i want this', 'i\'ll take it', 'i\'ll buy',
      'purchase this', 'get this', 'order this', 'i want to buy',
      'add the', 'i want the', 'give me the', 'i\'ll get the',
      'i want', 'i need', 'get me', 'give me', 'i\'ll take',
      'i want 1', 'i want one', 'i need 1', 'i need one',
      'get me 1', 'get me one', 'give me 1', 'give me one',
      'i want 1 burgundy', 'i want one burgundy', 'i want burgundy'
    ];
    
    const hasDirectCartIntent = directCartIntents.some(phrase => 
      lowercaseUserMessage.includes(phrase)
    );
    
    if (hasDirectCartIntent) {
      // Extract product info from user message
      const productInfo = this.extractProductInfoFromUserMessage(userMessage);
      return { isCartIntent: true, productInfo };
    }
    
    return { isCartIntent: false };
  }

  /**
   * Extract product information from user message
   */
  private extractProductInfoFromUserMessage(userMessage: string): any {
    const lowercaseMessage = userMessage.toLowerCase();
    
    console.log('🔍 Extracting product info from user message:', userMessage);
    
    // Look for color + product type combinations
    const colorProductPattern = /(?:i want|i need|get me|give me)\s+(?:1|one)?\s*(burgundy|red|blue|green|black|white|yellow|pink|purple|orange|brown|gray|grey|navy|olive|beige|cream)\s+(tee|shirt|dress|pants|jeans|jacket|hoodie|sweater)/i;
    
    const match = userMessage.match(colorProductPattern);
    if (match) {
      const color = match[1];
      const productType = match[2];
      const productName = `${color.charAt(0).toUpperCase() + color.slice(1)} ${productType.charAt(0).toUpperCase() + productType.slice(1)}`;
      
      console.log('✅ Extracted product from user message pattern:', productName);
      return {
        name: productName,
        price: 0,
        originalLine: match[0]
      };
    }
    
    // Look for specific product mentions
    const specificProducts = [
      'burgundy tee', 'burgundy shirt', 'burgundy t-shirt',
      'red tee', 'red shirt', 'red t-shirt',
      'blue tee', 'blue shirt', 'blue t-shirt'
    ];
    
    for (const product of specificProducts) {
      if (lowercaseMessage.includes(product)) {
        const productName = product.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        console.log('✅ Extracted specific product from user message:', productName);
        return {
          name: productName,
          price: 0,
          originalLine: product
        };
      }
    }
    
    console.log('❌ No product info extracted from user message');
    return null;
  }

  /**
   * Extract product information from Sensay response for cart operations
   */
  private extractProductInfoFromResponse(response: string): any {
    // This is a simplified extraction - in a real scenario you might want more sophisticated parsing
    const lines = response.split('\n');
    const productLine = lines.find(line => 
      line.includes('$') && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim()))
    );
    
    if (productLine) {
      const priceMatch = productLine.match(/\$(\d+(?:\.\d{2})?)/);
      const nameMatch = productLine.match(/(?:^\d+\.\s*)?([^$-•]+?)(?:\s*-\s*\$|\s*\$)/);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Product',
        price: priceMatch ? parseFloat(priceMatch[1]) : 0,
        originalLine: productLine.trim()
      };
    }
    
    return null;
  }

  /**
   * Extract product information from AI response when it mentions adding to cart
   */
  private extractProductInfoFromAiResponse(response: string): any {
    console.log('🔍 Extracting product info from AI response:', response);
    
    // Look for product names mentioned in the AI response
    const productNamePatterns = [
      // Pattern for "Let's make sure that [Product Name] is added to your cart"
      /(?:let\'s make sure that|make sure that|let\'s add|let me add)\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))\s+(?:is|are|will be|going to be)\s+(?:added|added to your cart|added to cart)/i,
      // Pattern for "The [Product Name] is now added to your cart"
      /(?:the|a)\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))\s+(?:is|are|looks|seems|appears|now added)/i,
      // Pattern for "added [Product Name] to your cart"
      /(?:added|added to cart|added to your cart)\s+(?:the|a)\s+([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))/i,
      // Pattern for "I've added [Product Name] to your cart"
      /(?:i\'ve added|i added|i\'ll add|i will add)\s+(?:the|a)?\s*([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))/i,
      // Pattern for "Perfect choice! I've added the [Product Name] to your cart"
      /(?:perfect choice|great pick|excellent choice|good choice).*?(?:i\'ve added|i added|added)\s+(?:the|a)?\s*([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))/i,
      // Pattern for color + product type combinations
      /(?:Burgundy|Red|Blue|Green|Black|White|Yellow|Pink|Purple|Orange|Brown|Gray|Grey|Navy|Olive|Beige|Cream)\s+(?:V-Neck|Crew Neck|Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater)/i,
      // Pattern for "Burgundy V-Neck Tee" specifically
      /(?:Burgundy|Red|Blue|Green|Black|White|Yellow|Pink|Purple|Orange|Brown|Gray|Grey|Navy|Olive|Beige|Cream)\s+(?:V-Neck|Crew Neck)\s+(?:Tee|Shirt)/i,
      // Pattern for quoted product names
      /\*\*([^*]+)\*\*/g
    ];
    
    for (const pattern of productNamePatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        const productName = match[1].trim();
        console.log('✅ Extracted product name from AI response:', productName);
        
        return {
          name: productName,
          price: 0, // We'll find the price from Shopify
          originalLine: match[0]
        };
      } else if (match && !match[1]) {
        // For patterns that don't have capture groups
        const productName = match[0].trim();
        console.log('Extracted product name from AI response (no capture):', productName);
        
        return {
          name: productName,
          price: 0,
          originalLine: match[0]
        };
      }
    }
    
    // Special case for "Let's make sure that Burgundy V-Neck Tee is added to your cart"
    const makeSureMatch = response.match(/let\'s make sure that\s+(.+?)\s+is added to your cart/i);
    if (makeSureMatch && makeSureMatch[1]) {
      const productName = makeSureMatch[1].trim();
      console.log('Extracted product from "make sure" pattern:', productName);
      return {
        name: productName,
        price: 0,
        originalLine: makeSureMatch[0]
      };
    }
    
    // Special case for "I'll make sure the Burgundy V-Neck Tee is added to your cart"
    const illMakeSureMatch = response.match(/i\'ll make sure the\s+(.+?)\s+is added to your cart/i);
    if (illMakeSureMatch && illMakeSureMatch[1]) {
      const productName = illMakeSureMatch[1].trim();
      console.log('Extracted product from "I\'ll make sure" pattern:', productName);
      return {
        name: productName,
        price: 0,
        originalLine: illMakeSureMatch[0]
      };
    }
    
    // Special case for quoted product names (e.g., **Classic Burgundy Tee**)
    const quotedMatch = response.match(/\*\*([^*]+)\*\*/);
    if (quotedMatch && quotedMatch[1]) {
      const productName = quotedMatch[1].trim();
      console.log('✅ Extracted quoted product name from AI response:', productName);
      return {
        name: productName,
        price: 0,
        originalLine: quotedMatch[0]
      };
    }
    
    // Special case for "Burgundy V-Neck Tee" which is mentioned in the response
    const burgundyMatch = response.match(/Burgundy\s+V-Neck\s+Tee/i);
    if (burgundyMatch) {
      console.log('✅ Extracted Burgundy V-Neck Tee from AI response');
      return {
        name: 'Burgundy V-Neck Tee',
        price: 0,
        originalLine: burgundyMatch[0]
      };
    }
    
    // Fallback: look for any product-like terms
    const productTerms = response.match(/(?:Burgundy|Red|Blue|Green|Black|White|Yellow|Pink|Purple|Orange|Brown|Gray|Grey|Navy|Olive|Beige|Cream)\s+(?:V-Neck|Crew Neck|Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater)/i);
    if (productTerms) {
      console.log('Extracted product term from AI response:', productTerms[0]);
      return {
        name: productTerms[0],
        price: 0,
        originalLine: productTerms[0]
      };
    }
    
    // Final fallback: look for any product name followed by cart-related words
    const fallbackPattern = /([A-Za-z\s]+(?:Tee|Shirt|Dress|Pants|Jeans|Jacket|Hoodie|Sweater))\s+(?:is|are|will be|going to be)\s+(?:added|added to your cart|added to cart)/i;
    const fallbackMatch = response.match(fallbackPattern);
    if (fallbackMatch && fallbackMatch[1]) {
      const productName = fallbackMatch[1].trim();
      console.log('Extracted product from fallback pattern:', productName);
      return {
        name: productName,
        price: 0,
        originalLine: fallbackMatch[0]
      };
    }
    
    console.log('❌ No product info extracted from AI response');
    return null;
  }

  /**
   * Extract specific product based on user selection (e.g., "first one", "classic striped tee")
   */
  private extractSelectedProductInfo(userMessage: string, response: string): any {
    const lowercaseUserMessage = userMessage.toLowerCase();
    const lines = response.split('\n');
    
    // Find numbered product lines
    const productLines = lines.filter(line => 
      /^\d+\./.test(line.trim()) && line.includes('$')
    );
    
    console.log('Found product lines:', productLines);
    
    // Map user selections to product numbers
    let selectedIndex = -1;
    
    if (lowercaseUserMessage.includes('first') || lowercaseUserMessage.includes('1st') || 
        lowercaseUserMessage.includes('number 1') || lowercaseUserMessage.includes('option 1')) {
      selectedIndex = 0;
    } else if (lowercaseUserMessage.includes('second') || lowercaseUserMessage.includes('2nd') || 
               lowercaseUserMessage.includes('number 2') || lowercaseUserMessage.includes('option 2')) {
      selectedIndex = 1;
    } else if (lowercaseUserMessage.includes('third') || lowercaseUserMessage.includes('3rd') || 
               lowercaseUserMessage.includes('number 3') || lowercaseUserMessage.includes('option 3')) {
      selectedIndex = 2;
    } else {
      // Try to match product names directly
      const productNameMatches = [
        { keywords: ['classic striped', 'striped tee'], index: 0 },
        { keywords: ['graphic print', 'graphic'], index: 1 },
        { keywords: ['denim button', 'denim'], index: 2 }
      ];
      
      for (const match of productNameMatches) {
        if (match.keywords.some(keyword => lowercaseUserMessage.includes(keyword))) {
          selectedIndex = match.index;
          break;
        }
      }
    }
    
    console.log('Selected index:', selectedIndex, 'for message:', userMessage);
    
    if (selectedIndex >= 0 && selectedIndex < productLines.length) {
      const selectedLine = productLines[selectedIndex];
      const priceMatch = selectedLine.match(/\$(\d+(?:\.\d{2})?)/);
      const nameMatch = selectedLine.match(/^\d+\.\s*([^$-]+?)(?:\s*-\s*\$)/);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : 'Selected Product',
        price: priceMatch ? parseFloat(priceMatch[1]) : 0,
        originalLine: selectedLine.trim(),
        selectionIndex: selectedIndex + 1
      };
    }
    
    return null;
  }

  /**
   * Handle automatic add to cart based on Sensay's response
   */
  private async handleAutoAddToCart(userId: string, productInfo: any, originalMessage: string): Promise<any> {
    if (!productInfo) {
      console.log('❌ No product information available for cart operation');
      throw new Error('No product information available for cart operation');
    }

    console.log('🛒 Attempting auto add to cart for user:', userId, 'Product:', productInfo);

    try {
      // Search for matching products in Shopify based on the extracted info
      const searchQuery = productInfo.name || this.extractProductKeywords(originalMessage).join(' ');
      console.log('🔍 Searching Shopify with query:', searchQuery);
      
      let shopifyProducts;
      try {
        shopifyProducts = await this.shopifyService.searchProducts(searchQuery, 3);
        console.log('📦 Found Shopify products:', shopifyProducts.length, shopifyProducts.map((p: any) => p.title));
        
        // If no exact match found, try with color only
        if (shopifyProducts.length === 0) {
          console.log('🔄 No exact match found, trying with color only...');
          const colorKeywords = this.extractColorKeywords(productInfo.name || originalMessage);
          if (colorKeywords.length > 0) {
            const colorQuery = colorKeywords.join(' ');
            console.log('🔍 Trying color query:', colorQuery);
            shopifyProducts = await this.shopifyService.searchProducts(colorQuery, 5);
            console.log('📦 Found products with color query:', shopifyProducts.length, shopifyProducts.map((p: any) => p.title));
          }
        }
        
        if (shopifyProducts.length === 0) {
          console.log('❌ No matching products found in store');
          throw new Error('No matching products found in store');
        }
      } catch (shopifyError) {
        console.error('❌ Shopify search failed:', shopifyError);
        throw shopifyError;
      }

      // Find the best matching product (simple price matching for now)
      let selectedProduct = shopifyProducts[0]; // Default to first
      
      if (productInfo.price > 0) {
        // Try to find product with matching or closest price
        const priceMatchedProduct = shopifyProducts.find((product: any) => {
          const productPrice = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
          return Math.abs(productPrice - productInfo.price) <= 5; // Allow $5 difference
        });
        
        if (priceMatchedProduct) {
          selectedProduct = priceMatchedProduct;
        }
      }

      console.log('✅ Selected product for auto add to cart:', selectedProduct.title);

      // Prepare cart item data
      const cartItemData = {
        productId: selectedProduct.id,
        productName: selectedProduct.title,
        description: selectedProduct.description?.substring(0, 200) || '',
        price: parseFloat(selectedProduct.priceRange?.minVariantPrice?.amount || '0'),
        quantity: 1,
        imageUrl: selectedProduct.images?.edges?.[0]?.node?.url || null,
        productUrl: `https://shoppysensay.myshopify.com/products/${selectedProduct.handle}`
      };

      console.log('📋 Cart item data prepared:', cartItemData);

      // Use the improved database approach (same logic as cart API)
      console.log('💾 Adding to cart using database transaction...');
      let cartResult;
      try {
        cartResult = await this.addToCartDatabase(userId, cartItemData);
        console.log('✅ Cart addition successful! Result:', cartResult);
      } catch (dbError) {
        console.error('❌ Database transaction failed:', dbError);
        throw dbError;
      }
      
      return {
        success: true,
        action: 'added_to_cart',
        product: cartItemData,
        cartCount: cartResult.cartCount,
        cartTotal: cartResult.cartTotal,
        message: `Successfully added "${selectedProduct.title}" to your cart!`
      };

    } catch (error) {
      console.error('❌ Auto add to cart failed:', error);
      
      // Fallback to database approach
      try {
        console.log('🔄 Attempting fallback database approach...');
        const cartItemData = {
          productId: productInfo.name || 'unknown',
          productName: productInfo.name || 'Unknown Product',
          description: productInfo.originalLine || '',
          price: productInfo.price || 0,
          quantity: 1,
          imageUrl: null,
          productUrl: null
        };
        
        console.log('📋 Fallback cart item data:', cartItemData);
        
        const addedItem = await this.addToCartDatabase(userId, cartItemData);
        
        console.log('✅ Fallback cart addition successful!', addedItem);
        
        return {
          success: true,
          action: 'added_to_cart_fallback',
          product: cartItemData,
          message: `Successfully added "${productInfo.name}" to your cart!`
        };
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return {
          success: false,
          action: 'add_to_cart_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Sorry, I couldn\'t add that item to your cart automatically.'
        };
      }
    }
  }

  /**
   * Add item to cart database with proper transaction handling
   */
  private async addToCartDatabase(userId: string, cartItem: any): Promise<any> {
    console.log('Adding to cart database with transaction:', {
      userId,
      productId: cartItem.productId,
      productName: cartItem.productName,
      price: cartItem.price,
      quantity: cartItem.quantity
    });
    
    // Use transaction for atomic operations with cart totals (same as cart API)
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if product already exists in cart
      const existingItem = await tx.cartItem.findFirst({
        where: {
          userId: userId,
          productId: cartItem.productId
        }
      });
      
      let cartItemResult;
      let isUpdate = false;
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + cartItem.quantity;
        const newTotal = Number(cartItem.price) * newQuantity;
        
        cartItemResult = await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            total: newTotal
          }
        });
        isUpdate = true;
      } else {
        // Create new cart item
        const total = Number(cartItem.price) * cartItem.quantity;
        
        cartItemResult = await tx.cartItem.create({
          data: {
            userId: userId,
            productId: cartItem.productId,
            productName: cartItem.productName,
            description: cartItem.description,
            price: Number(cartItem.price),
            quantity: cartItem.quantity,
            total: total,
            imageUrl: cartItem.imageUrl,
            productUrl: cartItem.productUrl
          }
        });
      }
      
      // Get updated cart totals
      const cartItems = await tx.cartItem.findMany({
        where: { userId: userId }
      });
      
      const cartTotal = cartItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);
      const cartCount = cartItems.length;
      
      return {
        item: cartItemResult,
        cartTotal,
        cartCount,
        isUpdate
      };
    });
    
    console.log('Successfully processed cart item:', {
      itemId: result.item.id,
      cartCount: result.cartCount,
      cartTotal: result.cartTotal,
      isUpdate: result.isUpdate
    });
    
    // Invalidate cache to ensure frontend gets updated data
    try {
      const { cacheService } = await import('./cache');
      cacheService.delete(`cart_count_${userId}`);
      cacheService.delete(`cart_${userId}`);
      console.log('Cache invalidated for user:', userId);
    } catch (cacheError) {
      console.warn('Failed to invalidate cache:', cacheError);
    }
    
    return result;
  }

  /**
   * Detect if Sensay response is recommending products
   */
  private detectProductRecommendation(response: string): boolean {
    const lowercaseResponse = response.toLowerCase();
    
    // Phrases that indicate product recommendations
    const recommendationPhrases = [
      'here are', 'here\'s', 'i recommend', 'i suggest', 'check out',
      'great options', 'perfect choice', 'you might like', 'consider',
      'available', 'in stock', 'we have', 'let me show you',
      'take a look', 'browse', 'explore', 'find', 'search',
      'classic', 'trendy', 'stylish', 'popular', 'best seller',
      '$', 'price', 'budget', 'affordable', 'deal', 'sale',
      'material', 'color', 'size', 'style', 'design',
      '1.', '2.', '3.', '•', '-', 'option', 'choice'
    ];
    
    // Product-related words that indicate actual product discussion
    const productIndicators = [
      'shirt', 'shirts', 'jeans', 'dress', 'shoes', 'jacket',
      'laptop', 'phone', 'watch', 'bag', 'headphones',
      'denim', 'leather', 'wireless', 'bluetooth'
    ];
    
    // Exclude cotton from product indicators as it's too generic
    // Cotton can be mentioned in general material discussions
    
    // Check for specific product recommendation patterns
    const hasSpecificRecommendation = (
      lowercaseResponse.includes('here are') ||
      lowercaseResponse.includes('i recommend') ||
      lowercaseResponse.includes('i suggest') ||
      lowercaseResponse.includes('check out') ||
      lowercaseResponse.includes('great options') ||
      lowercaseResponse.includes('perfect choice') ||
      lowercaseResponse.includes('you might like') ||
      lowercaseResponse.includes('consider') ||
      lowercaseResponse.includes('available') ||
      lowercaseResponse.includes('in stock') ||
      lowercaseResponse.includes('we have') ||
      lowercaseResponse.includes('let me show you') ||
      lowercaseResponse.includes('take a look') ||
      lowercaseResponse.includes('browse') ||
      lowercaseResponse.includes('explore') ||
      lowercaseResponse.includes('find') ||
      lowercaseResponse.includes('search')
    );
    
    // Check for numbered/bulleted product lists
    const hasNumberedList = /\d+\.\s+[A-Za-z]/.test(response) || /[•\-]\s+[A-Za-z]/.test(response);
    
    // Check for price mentions (strong indicator of product recommendation)
    const hasPriceMention = /\$\d+/.test(response) || /rp\s*\d+/.test(response) || /price/i.test(response);
    
    // Check for product names in quotes or bold
    const hasProductNames = /\*\*[^*]+\*\*/.test(response) || /"[^"]*shirt[^"]*"/i.test(response);
    
    const hasRecommendationPhrase = recommendationPhrases.some(phrase => 
      lowercaseResponse.includes(phrase)
    );
    
    const hasProductIndicator = productIndicators.some(indicator => 
      lowercaseResponse.includes(indicator)
    );
    
    // More sophisticated logic: must have strong recommendation signals
    const isRecommending = (
      (hasSpecificRecommendation && hasProductIndicator) ||
      (hasNumberedList && hasProductIndicator) ||
      (hasPriceMention && hasProductIndicator) ||
      (hasProductNames && hasRecommendationPhrase)
    );
    
    console.log(`🔍 Product recommendation detection:`, {
      hasSpecificRecommendation,
      hasNumberedList,
      hasPriceMention,
      hasProductNames,
      hasRecommendationPhrase,
      hasProductIndicator, 
      isRecommending,
      response: response.substring(0, 100) + '...'
    });
    
    return isRecommending;
  }

  /**
   * Extract color keywords from product name or message
   */
  private extractColorKeywords(productNameOrMessage: string): string[] {
    const colors = [
      'burgundy', 'red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 
      'purple', 'orange', 'brown', 'gray', 'grey', 'navy', 'olive', 'beige', 'cream'
    ];
    
    const lowercaseText = productNameOrMessage.toLowerCase();
    const foundColors = colors.filter(color => lowercaseText.includes(color));
    
    console.log('🎨 Extracted colors:', foundColors, 'from:', productNameOrMessage);
    return foundColors;
  }

  /**
   * Extract product-related keywords from message
   */
  private extractProductKeywords(message: string): string[] {
    const keywords: string[] = [];
    const lowercaseMessage = message.toLowerCase();
    
    // Common product categories (including plural forms)
    const categories = [
      'phone', 'phones', 'laptop', 'laptops', 'computer', 'computers', 'tablet', 'tablets', 
      'watch', 'watches', 'headphones', 'earbuds', 'headphone', 'earbud',
      'clothes', 'clothing', 'shirt', 'shirts', 'pants', 'shoes', 'shoe', 'dress', 'dresses', 
      'jacket', 'jackets', 'jeans', 'jean', 'sweater', 'sweaters', 'hoodie', 'hoodies',
      'book', 'books', 'camera', 'cameras', 'speaker', 'speakers', 'tv', 'tvs', 'television', 'televisions', 
      'monitor', 'monitors', 'bag', 'bags', 'backpack', 'backpacks', 'wallet', 'wallets', 
      'sunglasses', 'sunglass', 'jewelry', 'jewellery', 'necklace', 'necklaces', 'ring', 'rings',
      'kitchen', 'cooking', 'home', 'furniture', 'chair', 'chairs', 'table', 'tables',
      'electronics', 'electronic', 'gadget', 'gadgets', 'accessory', 'accessories', 'case', 'cases', 
      'charger', 'chargers', 'cable', 'cables', 'casual', 'formal', 'trendy', 'stylish'
    ];
    
    categories.forEach(category => {
      if (lowercaseMessage.includes(category)) {
        keywords.push(category);
      }
    });
    
    // Extract quoted terms
    const quotedTerms = message.match(/"([^"]+)"/g);
    if (quotedTerms) {
      quotedTerms.forEach(term => {
        keywords.push(term.replace(/"/g, ''));
      });
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Save chat message to database
   */
  private async saveChatMessage(
    userId: string,
    sessionId: string,
    userMessage: string,
    sensayResponse: any,
    shopifyProducts: any[]
  ): Promise<void> {
    try {
      // Validate session ownership before saving
      const isValidSession = await this.validateSessionOwnership(sessionId, userId);
      if (!isValidSession) {
        console.error(`❌ Cannot save message to session ${sessionId} - does not belong to user ${userId}`);
        throw new Error('Invalid session access for message saving');
      }

      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        }
      });

      // Save assistant response
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content: sensayResponse.content || 'Sorry, I couldn\'t generate a response.',
          timestamp: new Date(),
          sensayResponse: sensayResponse,
          shopifyProducts: shopifyProducts.length > 0 ? shopifyProducts : undefined
        }
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });

      console.log(`✅ Saved chat message to session ${sessionId} for user ${userId}`);
    } catch (error) {
      console.error('Error saving chat message:', error);
      // Don't throw here, as this is not critical for the user experience
    }
  }

  /**
   * Log API usage for monitoring
   */
  private async logApiUsage(
    userId: string,
    endpoint: string,
    requestData: any,
    responseData: any,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.apiUsage.create({
        data: {
          userId,
          endpoint,
          requestData,
          responseData,
          success,
          errorMessage,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging API usage:', error);
      // Don't throw here, as this is not critical
    }
  }

  /**
   * Get user analytics (if needed)
   */
  async getUserAnalytics(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          chatSessions: {
            include: {
              messages: true
            }
          }
        }
      });

      if (!user || !user.sensayUserId) {
        throw new Error('User not found or no Sensay user ID');
      }

      // Get analytics from Sensay API
      const analytics = await this.sensayAPI.getAnalytics(this.replicaUUID, user.sensayUserId);
      
      return {
        sensayAnalytics: analytics,
        localStats: {
          totalSessions: user.chatSessions.length,
          totalMessages: user.chatSessions.reduce((sum: number, session: any) => sum + session.messages.length, 0)
        }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  /**
   * Extract specific product recommendations from Sensay response
   */
  private extractRecommendedProducts(response: string): Array<{name: string, searchQuery: string, price?: number}> {
    const products: Array<{name: string, searchQuery: string, price?: number}> = [];
    const lines = response.split('\n');
    
    // Look for numbered product recommendations (e.g., "1. Bold Red Crew Neck Tee - $20")
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Match patterns like "1. Product Name - $20" or "• Product Name - $20"
      const numberedMatch = trimmedLine.match(/^\d+\.\s*(.+?)\s*-\s*\$(\d+(?:\.\d{2})?)/);
      const bulletMatch = trimmedLine.match(/^[•\-]\s*(.+?)\s*-\s*\$(\d+(?:\.\d{2})?)/);
      
      if (numberedMatch || bulletMatch) {
        const match = numberedMatch || bulletMatch;
        const productName = match![1].trim();
        const price = parseFloat(match![2]);
        
        // Create search query from product name
        const searchQuery = this.createSearchQueryFromProductName(productName);
        
        products.push({
          name: productName,
          searchQuery: searchQuery,
          price: price
        });
      }
    }
    
    // Look for product names in bold format (e.g., **Product Name**)
    const boldMatches = response.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
      for (const match of boldMatches) {
        const productName = match.replace(/\*\*/g, '').trim();
        if (productName.length > 3 && productName.length < 100) {
          const searchQuery = this.createSearchQueryFromProductName(productName);
          products.push({
            name: productName,
            searchQuery: searchQuery
          });
        }
      }
    }
    
    // Also look for product names mentioned in the text without prices
    // But only if they're clearly being recommended
    const productNamePatterns = [
      /(?:here are|here's|i recommend|i suggest|check out|great options|perfect choice|you might like|consider)\s+(.+?)(?:\.|,|$)/gi,
      /(?:the|a)\s+(.+?)\s+(?:is|are|looks|seems|appears|now added)/gi
    ];
    
    for (const pattern of productNamePatterns) {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        const productName = match[1].trim();
        if (productName.length > 5 && productName.length < 100) {
          const searchQuery = this.createSearchQueryFromProductName(productName);
          products.push({
            name: productName,
            searchQuery: searchQuery
          });
        }
      }
    }
    
    // Remove duplicates based on search query
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.searchQuery === product.searchQuery)
    );
    
    return uniqueProducts.slice(0, 5); // Limit to 5 products
  }

  /**
   * Create search query from product name
   */
  private createSearchQueryFromProductName(productName: string): string {
    const cleanName = productName.toLowerCase();
    
    // Extract key terms
    const terms = cleanName.split(' ').filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'with', 'like', 'want', 'need', 'looking', 'show', 'find', 'could', 'would', 'something', 'budget', 'range', 'prefer', 'comfortable'].includes(word)
    );
    
    // Create multiple search strategies
    const searchQueries: string[] = [];
    
    // Strategy 1: Exact product name
    searchQueries.push(`title:*${productName}*`);
    
    // Strategy 2: Key terms
    if (terms.length > 0) {
      const keyTerms = terms.slice(0, 3);
      searchQueries.push(`title:*${keyTerms.join('*')}*`);
    }
    
    // Strategy 3: Color + product type
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'burgundy', 'navy', 'olive', 'beige', 'cream'];
    const productTypes = ['shirt', 'tee', 't-shirt', 'tshirt', 'pants', 'jeans', 'dress', 'shoes', 'jacket', 'hoodie', 'sweater'];
    
    const foundColor = colors.find(color => cleanName.includes(color));
    const foundType = productTypes.find(type => cleanName.includes(type));
    
    if (foundColor && foundType) {
      searchQueries.push(`title:*${foundColor}*${foundType}*`);
    }
    
    // Strategy 4: Individual terms
    if (terms.length > 0) {
      terms.forEach(term => {
        searchQueries.push(`title:*${term}*`);
      });
    }
    
    // Return the most specific query first
    return searchQueries[0] || `title:*${productName.split(' ')[0]}*`;
  }

  /**
   * Check if the user message is related to cart queries
   */
  private isCartRelatedQuery(message: string): boolean {
    const lowercaseMessage = message.toLowerCase();
    
    const cartQueryKeywords = [
      'cart', 'keranjang', 'bag', 'basket',
      'what\'s in my cart', 'what is in my cart', 'what do i have in my cart',
      'show me my cart', 'view my cart', 'check my cart',
      'how many items', 'how much is in my cart', 'cart total',
      'are there any products', 'do i have anything', 'what\'s in my bag',
      'cart items', 'cart contents', 'my cart', 'my bag'
    ];
    
    return cartQueryKeywords.some(keyword => lowercaseMessage.includes(keyword));
  }

  /**
   * Check if AI response is general information rather than product recommendation
   */
  private isGeneralInformationResponse(response: string): boolean {
    const lowercaseResponse = response.toLowerCase();
    
    // Phrases that indicate general information rather than product recommendation
    const generalInfoPhrases = [
      'both are made from', 'both is made from', 'both made from',
      'is known for', 'are known for', 'known for',
      'is gentle on', 'are gentle on', 'gentle on',
      'throughout the day', 'all day', 'during the day',
      'whether you choose', 'if you choose', 'when you choose',
      'do you have a preference', 'which one do you prefer', 'prefer',
      'depends on', 'really depends', 'depends',
      'in terms of', 'in terms', 'terms',
      'style and occasion', 'style', 'occasion',
      'what you\'re looking for', 'what you are looking for', 'looking for'
    ];
    
    // Check if response contains general information patterns
    const hasGeneralInfo = generalInfoPhrases.some(phrase => 
      lowercaseResponse.includes(phrase)
    );
    
    // Check if response is explaining rather than recommending
    const isExplaining = (
      lowercaseResponse.includes('both') && 
      (lowercaseResponse.includes('are') || lowercaseResponse.includes('is')) &&
      (lowercaseResponse.includes('made from') || lowercaseResponse.includes('known for'))
    );
    
    // Check if response is asking for preference rather than showing products
    const isAskingPreference = (
      lowercaseResponse.includes('do you have a preference') ||
      lowercaseResponse.includes('which one do you prefer') ||
      lowercaseResponse.includes('prefer') ||
      lowercaseResponse.includes('suit your style')
    );
    
    // Check if response is comparing products rather than recommending
    const isComparing = (
      lowercaseResponse.includes('both') &&
      lowercaseResponse.includes('but') &&
      (lowercaseResponse.includes('depends') || lowercaseResponse.includes('prefer'))
    );
    
    const isGeneralInfo = hasGeneralInfo || isExplaining || isAskingPreference || isComparing;
    
    console.log(`🔍 General information detection:`, {
      hasGeneralInfo,
      isExplaining,
      isAskingPreference,
      isComparing,
      isGeneralInfo,
      response: response.substring(0, 100) + '...'
    });
    
    return isGeneralInfo;
  }
}

