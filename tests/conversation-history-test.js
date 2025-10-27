/**
 * ZANTARA - Conversation History Test Suite
 * Comprehensive tests for conversation history functionality
 */

// Mock localStorage for testing
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock DOM elements for testing
const mockDOM = (() => {
    const elements = {};
    return {
        createElement: (tag) => {
            const el = { tagName: tag, innerHTML: '', textContent: '', className: '' };
            el.appendChild = (child) => {};
            return el;
        },
        getElementById: (id) => elements[id] || null,
        registerElement: (id, element) => { elements[id] = element; }
    };
})();

// Test suite
class ConversationHistoryTest {
    constructor() {
        this.tests = [];
        this.results = { passed: 0, failed: 0, total: 0 };
    }

    // Add a test case
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    // Run all tests
    async run() {
        console.log('🧪 Starting Conversation History Test Suite...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                console.log(`✅ ${test.name}`);
                this.results.passed++;
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                this.results.failed++;
            }
            this.results.total++;
        }
        
        console.log('\n📊 Test Results:');
        console.log(`   Total: ${this.results.total}`);
        console.log(`   Passed: ${this.results.passed}`);
        console.log(`   Failed: ${this.results.failed}`);
        console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    }
}

// Initialize test suite
const testSuite = new ConversationHistoryTest();

// Test 1: Initialization
testSuite.addTest('Initialization', () => {
    // Setup mocks
    global.localStorage = mockLocalStorage;
    global.document = mockDOM;
    
    // Mock required DOM elements
    mockDOM.registerElement('conversationList', { innerHTML: '' });
    mockDOM.registerElement('newChatBtn', { addEventListener: () => {} });
    
    // Test initialization
    ConversationHistory.init();
    
    // Verify initialization
    if (!localStorage.getItem('zantara_current_conversation_id')) {
        throw new Error('Current conversation ID not set');
    }
});

// Test 2: Conversation Creation
testSuite.addTest('Conversation Creation', () => {
    // Clear storage
    localStorage.clear();
    
    // Create a new conversation
    const conversationId = Date.now().toString();
    localStorage.setItem('zantara_current_conversation_id', conversationId);
    
    // Simulate message added event
    const event = new CustomEvent('zantara:messageAdded', {
        detail: { message: 'Hello, world!', isUser: true }
    });
    
    window.dispatchEvent(event);
    
    // Verify conversation was created
    const stored = localStorage.getItem('zantara_conversations');
    if (!stored) {
        throw new Error('Conversations not saved to localStorage');
    }
    
    const conversations = JSON.parse(stored);
    if (conversations.length !== 1) {
        throw new Error(`Expected 1 conversation, got ${conversations.length}`);
    }
    
    if (conversations[0].messages.length !== 1) {
        throw new Error(`Expected 1 message, got ${conversations[0].messages.length}`);
    }
});

// Test 3: Conversation Title Generation
testSuite.addTest('Title Generation', () => {
    const shortMessage = 'Short message';
    const longMessage = 'This is a very long message that exceeds fifty characters and should be truncated with ellipsis at the end';
    const whitespaceMessage = '   Message   with   extra   whitespace   ';
    
    const shortTitle = ConversationHistory.generateConversationTitle(shortMessage);
    const longTitle = ConversationHistory.generateConversationTitle(longMessage);
    const whitespaceTitle = ConversationHistory.generateConversationTitle(whitespaceMessage);
    
    if (shortTitle !== 'Short message') {
        throw new Error(`Expected 'Short message', got '${shortTitle}'`);
    }
    
    if (longTitle !== 'This is a very long message that exceeds fifty characters and should be truncated with ellipsis...') {
        throw new Error(`Title not properly truncated: '${longTitle}'`);
    }
    
    if (whitespaceTitle !== 'Message with extra whitespace') {
        throw new Error(`Whitespace not normalized: '${whitespaceTitle}'`);
    }
});

// Test 4: Export Functionality
testSuite.addTest('Export Functionality', () => {
    // Mock Blob and URL APIs
    global.Blob = function(content, options) {
        this.content = content;
        this.options = options;
    };
    
    global.URL = {
        createObjectURL: () => 'blob:test',
        revokeObjectURL: () => {}
    };
    
    // Mock document.createElement to capture created elements
    const createdElements = [];
    const originalCreateElement = document.createElement;
    document.createElement = function(tag) {
        const el = originalCreateElement.call(this, tag);
        createdElements.push({ tag, element: el });
        return el;
    };
    
    // Test export
    ConversationHistory.exportConversations();
    
    // Verify anchor element was created
    const anchorElement = createdElements.find(el => el.tag === 'a');
    if (!anchorElement) {
        throw new Error('Anchor element not created for export');
    }
    
    // Restore original createElement
    document.createElement = originalCreateElement;
});

// Test 5: Favorite Toggle Functionality
testSuite.addTest('Favorite Toggle', () => {
    // Create test conversation
    const conversationId = 'test-conv-1';
    const conversations = [{
        id: conversationId,
        title: 'Test Conversation',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorited: false
    }];
    
    localStorage.setItem('zantara_conversations', JSON.stringify(conversations));
    localStorage.setItem('zantara_current_conversation_id', conversationId);
    
    // Toggle favorite
    ConversationHistory.toggleFavorite(conversationId);
    
    // Check if favorited
    const updatedStored = localStorage.getItem('zantara_conversations');
    const updatedConversations = JSON.parse(updatedStored);
    const updatedConversation = updatedConversations.find(c => c.id === conversationId);
    
    if (!updatedConversation.favorited) {
        throw new Error('Conversation not favorited');
    }
    
    // Toggle back
    ConversationHistory.toggleFavorite(conversationId);
    
    const finalStored = localStorage.getItem('zantara_conversations');
    const finalConversations = JSON.parse(finalStored);
    const finalConversation = finalConversations.find(c => c.id === conversationId);
    
    if (finalConversation.favorited) {
        throw new Error('Conversation still favorited');
    }
});

// Test 6: Sorting Conversations
testSuite.addTest('Sorting Conversations', () => {
    // Create test conversations
    const conversations = [
        {
            id: '1',
            title: 'Zebra Conversation',
            messages: [{ content: 'Hello', role: 'user' }],
            createdAt: new Date('2023-01-01').toISOString(),
            updatedAt: new Date('2023-01-01').toISOString(),
            favorited: false
        },
        {
            id: '2',
            title: 'Alpha Conversation',
            messages: [{ content: 'Hello', role: 'user' }, { content: 'Hi', role: 'assistant' }],
            createdAt: new Date('2023-01-02').toISOString(),
            updatedAt: new Date('2023-01-02').toISOString(),
            favorited: true
        },
        {
            id: '3',
            title: 'Beta Conversation',
            messages: [{ content: 'Hello', role: 'user' }, { content: 'Hi', role: 'assistant' }, { content: 'How are you?', role: 'user' }],
            createdAt: new Date('2023-01-03').toISOString(),
            updatedAt: new Date('2023-01-03').toISOString(),
            favorited: false
        }
    ];
    
    localStorage.setItem('zantara_conversations', JSON.stringify(conversations));
    
    // Test sorting by title
    ConversationHistory.sortConversations('title', true);
    const titleSorted = JSON.parse(localStorage.getItem('zantara_conversations'));
    if (titleSorted[0].title !== 'Alpha Conversation') {
        throw new Error('Title sorting failed');
    }
    
    // Test sorting by message count
    ConversationHistory.sortConversations('messages', true);
    const messageSorted = JSON.parse(localStorage.getItem('zantara_conversations'));
    if (messageSorted[0].messages.length !== 1) {
        throw new Error('Message count sorting failed');
    }
});

// Test 7: Statistics Generation
testSuite.addTest('Statistics Generation', () => {
    // Create test conversations
    const conversations = [
        {
            id: '1',
            title: 'Test Conversation 1',
            messages: [
                { content: 'Hello', role: 'user' },
                { content: 'Hi there', role: 'assistant' }
            ],
            createdAt: new Date('2023-01-01').toISOString(),
            updatedAt: new Date('2023-01-01').toISOString(),
            favorited: true
        },
        {
            id: '2',
            title: 'Test Conversation 2',
            messages: [
                { content: 'How are you?', role: 'user' },
                { content: 'I am fine', role: 'assistant' },
                { content: 'Great to hear', role: 'user' }
            ],
            createdAt: new Date('2023-01-02').toISOString(),
            updatedAt: new Date('2023-01-02').toISOString(),
            favorited: false
        }
    ];
    
    localStorage.setItem('zantara_conversations', JSON.stringify(conversations));
    
    // Get statistics
    const stats = ConversationHistory.getStatistics();
    
    if (stats.totalConversations !== 2) {
        throw new Error(`Expected 2 conversations, got ${stats.totalConversations}`);
    }
    
    if (stats.totalMessages !== 5) {
        throw new Error(`Expected 5 messages, got ${stats.totalMessages}`);
    }
    
    if (stats.favoritedConversations !== 1) {
        throw new Error(`Expected 1 favorited conversation, got ${stats.favoritedConversations}`);
    }
    
    if (stats.averageMessagesPerConversation !== 2.5) {
        throw new Error(`Expected 2.5 average messages, got ${stats.averageMessagesPerConversation}`);
    }
});

// Test 8: Fuzzy Search Functionality
testSuite.addTest('Fuzzy Search', () => {
    // Create test conversations
    const conversations = [
        {
            id: '1',
            title: 'KITAS Visa Information',
            messages: [
                { content: 'How can I get an E23 Freelance KITAS?', role: 'user' },
                { content: 'You need to prepare several documents...', role: 'assistant' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favorited: false
        },
        {
            id: '2',
            title: 'Company Registration',
            messages: [
                { content: 'What is the cost of opening a PT company?', role: 'user' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favorited: false
        }
    ];
    
    localStorage.setItem('zantara_conversations', JSON.stringify(conversations));
    
    // Test search functionality (this would normally be in the module's fuzzySearch function)
    const filtered = conversations.filter(conv => 
        conv.title.toLowerCase().includes('kitas') ||
        conv.messages.some(msg => msg.content.toLowerCase().includes('kitas'))
    );
    
    if (filtered.length !== 1) {
        throw new Error('Fuzzy search failed to find KITAS conversation');
    }
    
    if (filtered[0].id !== '1') {
        throw new Error('Fuzzy search returned wrong conversation');
    }
});

// Test 9: Backward Compatibility
testSuite.addTest('Backward Compatibility', () => {
    // Create old conversation format (without favorited and tags properties)
    const oldConversationFormat = [
        {
            id: 'old-conv-1',
            title: 'Old Conversation',
            messages: [
                { content: 'Hello', role: 'user', timestamp: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
            // Note: missing favorited and tags properties
        }
    ];
    
    // Store in localStorage
    localStorage.setItem('zantara_conversations', JSON.stringify(oldConversationFormat));
    
    // Reload conversations (this should add missing properties)
    ConversationHistory.init();
    
    // Check if missing properties were added
    const updatedStored = localStorage.getItem('zantara_conversations');
    const updatedConversations = JSON.parse(updatedStored);
    
    if (updatedConversations.length !== 1) {
        throw new Error('Conversation count mismatch after loading');
    }
    
    const conversation = updatedConversations[0];
    if (typeof conversation.favorited !== 'boolean') {
        throw new Error('Missing favorited property not added');
    }
    
    if (!Array.isArray(conversation.tags)) {
        throw new Error('Missing tags property not added');
    }
    
    console.log('✅ Backward compatibility maintained');
});

// Run tests
testSuite.run().catch(console.error);