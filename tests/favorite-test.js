/**
 * Simple test for the favorite functionality in conversation history
 */

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock DOM
const mockDOM = (() => {
    const elements = {};
    return {
        getElementById: (id) => elements[id] || { innerHTML: '' },
        registerElement: (id, element) => { elements[id] = element; }
    };
})();

// Test favorite functionality
function testFavoriteFunctionality() {
    console.log('🧪 Testing Favorite Functionality...\n');
    
    // Setup mocks
    global.localStorage = mockLocalStorage;
    global.document = mockDOM;
    
    // Register required elements
    mockDOM.registerElement('conversationList', { innerHTML: '' });
    
    // Initialize conversation history
    ConversationHistory.init();
    
    // Create a test conversation
    const conversationId = 'test-conv-1';
    const testConversation = {
        id: conversationId,
        title: 'Test Conversation',
        messages: [
            { content: 'Hello', role: 'user', timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to conversations
    let conversations = JSON.parse(localStorage.getItem('zantara_conversations') || '[]');
    conversations.unshift(testConversation);
    localStorage.setItem('zantara_conversations', JSON.stringify(conversations));
    
    // Reload conversations
    ConversationHistory.init();
    
    // Test toggle favorite
    console.log('1. Testing toggleFavorite...');
    ConversationHistory.toggleFavorite(conversationId);
    
    // Check if favorited
    const updatedConversations = JSON.parse(localStorage.getItem('zantara_conversations'));
    const favoritedConversation = updatedConversations.find(c => c.id === conversationId);
    
    if (favoritedConversation && favoritedConversation.favorited === true) {
        console.log('✅ Favorite toggle works correctly');
    } else {
        console.log('❌ Favorite toggle failed');
        return false;
    }
    
    // Test toggle back
    ConversationHistory.toggleFavorite(conversationId);
    
    const finalConversations = JSON.parse(localStorage.getItem('zantara_conversations'));
    const unFavoritedConversation = finalConversations.find(c => c.id === conversationId);
    
    if (unFavoritedConversation && unFavoritedConversation.favorited === false) {
        console.log('✅ Favorite toggle back works correctly');
    } else {
        console.log('❌ Favorite toggle back failed');
        return false;
    }
    
    console.log('\n✅ All favorite functionality tests passed!');
    return true;
}

// Run test
testFavoriteFunctionality();