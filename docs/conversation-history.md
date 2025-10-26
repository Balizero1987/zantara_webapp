# ZANTARA Conversation History Module

## Overview

The Conversation History module manages the storage, retrieval, and display of user conversations in the ZANTARA web application. It provides functionality for saving conversations to localStorage, searching through conversation history, and managing conversation data.

## Features

1. **Persistent Storage**: Saves conversations to localStorage with metadata
2. **Sidebar Display**: Displays conversation list in the sidebar UI
3. **Search Functionality**: Search conversations by title or content
4. **Conversation Loading**: Load previous conversations on click
5. **Conversation Management**: Delete individual conversations or clear all
6. **Auto-save**: Automatically saves current conversation every 30 seconds
7. **Smart Titles**: Generates conversation titles based on the first message
8. **Import/Export**: Export conversations to JSON file or import from JSON
9. **Date Grouping**: Groups conversations by date (Today, Yesterday, etc.)
10. **Favorites**: Star important conversations for quick access
11. **Sorting**: Sort conversations by date, title, or message count
12. **Filtering**: Filter conversations by favorites
13. **Tagging**: Add tags to conversations for better organization
14. **Statistics**: View conversation statistics and analytics

## API

### Initialization

```javascript
ConversationHistory.init()
```

Initializes the conversation history module. This is automatically called when the DOM is ready.

### Public Methods

#### `loadConversation(conversationId)`
Loads a specific conversation by ID and displays it in the chat interface.

#### `deleteConversation(conversationId)`
Deletes a specific conversation by ID after user confirmation.

#### `searchConversations(query)`
Filters the conversation list based on a search query.

#### `clearAllConversations()`
Clears all conversations after user confirmation.

#### `getCurrentConversation()`
Returns the currently active conversation object.

#### `exportConversations()`
Exports all conversations as a JSON file for download.

#### `importConversations()`
Imports conversations from a JSON file.

#### `toggleFavorite(conversationId)`
Toggles the favorite status of a conversation.

#### `filterFavorites()`
Displays only favorited conversations.

#### `sortConversations(criteria, ascending)`
Sorts conversations by specified criteria.
- `criteria`: 'date' (default), 'title', or 'messages'
- `ascending`: boolean, false by default

#### `addTag(conversationId, tag)`
Adds a tag to a conversation.

#### `removeTag(conversationId, tag)`
Removes a tag from a conversation.

#### `filterByTag(tag)`
Filters conversations by a specific tag.

#### `getAllTags()`
Returns an array of all unique tags.

#### `getStatistics()`
Returns conversation statistics.

#### `displayStatistics()`
Displays conversation statistics in the console and dispatches an event.

## Data Structure

Each conversation follows this structure:

```javascript
{
  id: string,              // Unique identifier
  title: string,           // Conversation title
  messages: Array,         // Array of message objects
  createdAt: string,       // ISO timestamp
  updatedAt: string,       // ISO timestamp
  favorited: boolean,      // Favorite status
  tags: Array              // Array of tag strings
}
```

Each message follows this structure:

```javascript
{
  role: 'user' | 'assistant',  // Message sender
  content: string,             // Message content
  timestamp: string            // ISO timestamp
}
```

## Configuration

The module can be configured through the `CONFIG` object:

```javascript
const CONFIG = {
    maxConversations: 100,       // Max conversations to store
    autoSaveInterval: 30000,     // Auto-save every 30 seconds
    storageKey: 'zantara_conversations',
    currentConversationKey: 'zantara_current_conversation_id'
};
```

## Events

The module dispatches custom events for integration with other components:

- `zantara:messageAdded` - Fired when a new message is added
- `zantara:conversationLoaded` - Fired when a conversation is loaded
- `zantara:conversationFavorited` - Fired when a conversation is starred/unstarred
- `zantara:conversationTagged` - Fired when a conversation is tagged/untagged
- `zantara:conversationStatistics` - Fired when statistics are generated

## Storage

Conversations are stored in localStorage with the key specified in `CONFIG.storageKey`. The module includes error handling for storage quota exceeded scenarios.

## Error Handling

The module includes comprehensive error handling for:
- localStorage quota exceeded
- Data corruption recovery
- Invalid data structures
- File import/export errors

## UI Components

The module interacts with the following UI elements:
- `#conversationList` - Container for conversation items
- `#newChatBtn` - Button to create new conversations
- `#exportConversationsBtn` - Button to export conversations
- `#importConversationsBtn` - Button to import conversations
- `#clearConversationsBtn` - Button to clear all conversations
- `#favoriteConversationsBtn` - Button to filter favorite conversations
- `#conversationSearch` - Input for searching conversations

## Best Practices

1. **Data Validation**: Always validate data structures when loading from storage
2. **Error Recovery**: Implement graceful degradation for storage errors
3. **Performance**: Limit the number of stored conversations to prevent performance issues
4. **User Experience**: Provide clear feedback for import/export operations
5. **Security**: Sanitize all user-generated content to prevent XSS attacks

## Testing

The module includes a test suite in `tests/conversation-history-test.js` that covers:
- Initialization
- Conversation creation
- Title generation
- Export functionality
- Search functionality
- Favorite toggle
- Sorting
- Statistics generation
- Fuzzy search

Run tests by including the test file in your test environment.

## Future Improvements

1. **Cloud Sync**: Sync conversations with backend storage
2. **Advanced Search**: Implement fuzzy search and filtering options
3. **Conversation Sharing**: Allow sharing conversations with other users
4. **Tags and Categories**: Add tagging system for better organization
5. **Archiving**: Implement conversation archiving to manage storage
6. **Statistics**: Add conversation statistics and analytics
7. **Backup Automation**: Automatic backup to cloud storage
8. **Tag Management UI**: UI for managing tags across conversations
9. **Bulk Operations**: Bulk tag/favorite operations
10. **Tag-based Notifications**: Notifications based on tagged conversations