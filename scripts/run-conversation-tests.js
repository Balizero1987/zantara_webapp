#!/usr/bin/env node

/**
 * Test runner for Conversation History module
 * This script can be used to run the conversation history tests
 */

// Simple test runner
async function runTests() {
    console.log('🔬 Running Conversation History Tests...\n');
    
    try {
        // Dynamically import the test file
        const testModule = await import('../tests/conversation-history-test.js');
        console.log('✅ Tests completed');
    } catch (error) {
        console.error('❌ Error running tests:', error);
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export { runTests };