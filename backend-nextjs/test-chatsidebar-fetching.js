// Test script untuk memverifikasi ChatSidebar backend fetching
// Jalankan dengan: node test-chatsidebar-fetching.js

const API_BASE_URL = 'http://localhost:3000/api';

async function testChatSidebarFetching() {
  console.log('🧪 Testing ChatSidebar Backend Fetching...');
  
  try {
    // Step 1: Login untuk mendapatkan token
    console.log('\n📝 Step 1: Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log('👤 User ID:', user.id);
    console.log('👤 Username:', user.username);

    // Step 2: Test sessions API (yang dipanggil oleh ChatSidebar)
    console.log('\n📝 Step 2: Testing /chat/sessions API...');
    
    const sessionsResponse = await fetch(`${API_BASE_URL}/chat/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Sessions API Response Status:', sessionsResponse.status);
    console.log('📡 Sessions API Response Headers:', Object.fromEntries(sessionsResponse.headers.entries()));

    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      console.log('✅ Sessions API Response:', JSON.stringify(sessionsData, null, 2));
      
      if (sessionsData.success && sessionsData.data) {
        console.log('✅ User authenticated:', sessionsData.data.userAuthenticated);
        console.log('✅ User ID:', sessionsData.data.userId);
        console.log('✅ Sessions count:', sessionsData.data.sessions?.length || 0);
        
        if (sessionsData.data.sessions && Array.isArray(sessionsData.data.sessions)) {
          console.log('✅ Sessions data structure is correct');
          sessionsData.data.sessions.forEach((session, index) => {
            console.log(`  Session ${index + 1}:`, {
              id: session.id,
              title: session.title,
              messageCount: session.messageCount,
              updatedAt: session.updatedAt
            });
          });
        } else {
          console.log('⚠️ Sessions array is missing or invalid');
        }
      } else {
        console.log('❌ Response structure is invalid');
      }
    } else {
      const errorText = await sessionsResponse.text();
      console.log('❌ Sessions API failed:', sessionsResponse.status, errorText);
    }

    // Step 3: Test chat history API
    console.log('\n📝 Step 3: Testing /chat/history API...');
    
    const historyResponse = await fetch(`${API_BASE_URL}/chat/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 History API Response Status:', historyResponse.status);

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ History API Response:', JSON.stringify(historyData, null, 2));
      
      if (historyData.success && historyData.data) {
        console.log('✅ User authenticated:', historyData.data.userAuthenticated);
        console.log('✅ User ID:', historyData.data.userId);
        console.log('✅ History count:', historyData.data.history?.length || 0);
      }
    } else {
      const errorText = await historyResponse.text();
      console.log('❌ History API failed:', historyResponse.status, errorText);
    }

    // Step 4: Test send message untuk membuat session baru
    console.log('\n📝 Step 4: Testing /chat/send API to create new session...');
    
    const sendResponse = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message for session creation',
        isNewChat: true
      })
    });

    console.log('📡 Send API Response Status:', sendResponse.status);

    if (sendResponse.ok) {
      const sendData = await sendResponse.json();
      console.log('✅ Send API Response:', JSON.stringify(sendData, null, 2));
      
      if (sendData.success && sendData.data) {
        console.log('✅ Session ID:', sendData.data.sessionId);
        console.log('✅ Is New Session:', sendData.data.isNewSession);
        
        // Step 5: Test sessions API lagi untuk melihat session baru
        console.log('\n📝 Step 5: Testing sessions API again to see new session...');
        
        const sessionsResponse2 = await fetch(`${API_BASE_URL}/chat/sessions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (sessionsResponse2.ok) {
          const sessionsData2 = await sessionsResponse2.json();
          console.log('✅ Updated Sessions:', sessionsData2.data.sessions?.length || 0);
        }
      }
    } else {
      const errorText = await sendResponse.text();
      console.log('❌ Send API failed:', sendResponse.status, errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testChatSidebarFetching();
