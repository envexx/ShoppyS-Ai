const fetch = require('node-fetch');

async function testSensayAPI() {
  try {
    console.log('🧪 Testing Sensay API...');
    
    const config = {
      baseUrl: 'https://api.sensay.io/v1',
      headers: {
        'X-ORGANIZATION-SECRET': '2cb4a02f16ad70cdd08b857bb94e5c1cd7d38bb4e28226c3377cb80750524717',
        'X-API-Version': '2025-03-25',
        'Content-Type': 'application/json'
      }
    };

    // Test 1: Create a user
    console.log('📝 Test 1: Creating user...');
    const userPayload = {
      id: `test_user_${Date.now()}`
    };

    const userResponse = await fetch(`${config.baseUrl}/users`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(userPayload)
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ User creation failed:', userResponse.status, errorText);
      return;
    }

    const userData = await userResponse.json();
    console.log('✅ User created:', userData);

    // Test 2: Chat with replica
    console.log('💬 Test 2: Chatting with replica...');
    const replicaUUID = '50039859-1408-4152-b6ec-1c0fde91cd87';
    const chatPayload = {
      content: 'Hello! I want to buy something'
    };

    const chatResponse = await fetch(`${config.baseUrl}/replicas/${replicaUUID}/chat/completions`, {
      method: 'POST',
      headers: {
        ...config.headers,
        'X-USER-ID': userData.id
      },
      body: JSON.stringify(chatPayload)
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('❌ Chat failed:', chatResponse.status, errorText);
      return;
    }

    const chatData = await chatResponse.json();
    console.log('✅ Chat response:', chatData);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSensayAPI();
