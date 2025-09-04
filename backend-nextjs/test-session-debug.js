// Test script untuk debugging session dan user ID
// Jalankan dengan: node test-session-debug.js

const API_BASE_URL = 'http://localhost:3000/api';

async function testUserAuthentication() {
  console.log('🧪 Testing User Authentication...');
  
  try {
    // Test login
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
    console.log('✅ Login successful:', loginData.success);
    
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log('👤 User ID:', user.id);
    console.log('👤 Username:', user.username);
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    // Test get user info
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Get user info successful:', meData.data);
    } else {
      console.log('❌ Get user info failed:', meResponse.status);
    }

    // Test get sessions
    const sessionsResponse = await fetch(`${API_BASE_URL}/chat/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      console.log('✅ Get sessions successful:', sessionsData.data);
    } else {
      console.log('❌ Get sessions failed:', sessionsResponse.status);
    }

    // Test send message
    const chatResponse = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        isNewChat: true
      })
    });

    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Send message successful:', chatData.data);
      
      // Test get chat history
      const historyResponse = await fetch(`${API_BASE_URL}/chat/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        console.log('✅ Get chat history successful:', historyData.data);
      } else {
        console.log('❌ Get chat history failed:', historyResponse.status);
      }
    } else {
      console.log('❌ Send message failed:', chatResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserAuthentication();
