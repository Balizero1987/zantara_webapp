exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-session-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Log the request for debugging
    console.log('Incoming request:', {
      key: body.key,
      userEmail: body.params?.userEmail,
      userName: body.params?.userName,
      userId: body.params?.userId
    });

    // Ensure user context is preserved
    if (body.params && !body.params.context && body.params.userName) {
      body.params.context = `User: ${body.params.userName} (${body.params.userEmail})`;
    }

    // Forward to ZANTARA API
    const response = await fetch('https://zantara-v520-chatgpt-patch-1064094238013.europe-west1.run.app/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': event.headers['x-api-key'] || 'deabf88e8aefda722fbdb8e899d1e1717c8faf66bf56fb82be495c2f3458d30c',
        'x-session-id': event.headers['x-session-id'] || 'netlify-' + Date.now(),
        'x-user-email': body.params?.userEmail || 'unknown',
        'x-user-name': body.params?.userName || 'User'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Proxy error',
        message: error.message
      })
    };
  }
};