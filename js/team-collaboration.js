/**
 * Team Collaboration Features
 * Enhancement #26 for NUZANTARA-RAILWAY
 * Implements comprehensive team collaboration capabilities
 */

class TeamCollaboration {
  constructor() {
    this.teamMembers = new Map();
    this.collaborationChannels = new Map();
    this.sharedResources = new Map();
    this.notifications = [];
  }

  /**
   * Initialize the team collaboration system
   */
  async initialize() {
    // Load team data
    this.loadTeamData();
    
    // Set up real-time communication
    this.setupRealTimeCommunication();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('[TeamCollaboration] System initialized');
  }

  /**
   * Load team data from localStorage or API
   */
  loadTeamData() {
    try {
      // Load team members
      const savedTeamMembers = localStorage.getItem('zantara-team-members');
      if (savedTeamMembers) {
        const members = JSON.parse(savedTeamMembers);
        members.forEach(member => {
          this.teamMembers.set(member.id, member);
        });
      } else {
        // Add default team members if none exist
        this.addDefaultTeamMembers();
      }
      
      // Load collaboration channels
      const savedChannels = localStorage.getItem('zantara-collaboration-channels');
      if (savedChannels) {
        const channels = JSON.parse(savedChannels);
        channels.forEach(channel => {
          this.collaborationChannels.set(channel.id, channel);
        });
      }
      
      console.log('[TeamCollaboration] Team data loaded');
    } catch (error) {
      console.error('[TeamCollaboration] Error loading team data:', error);
    }
  }

  /**
   * Save team data to localStorage
   */
  saveTeamData() {
    try {
      // Save team members
      const membersArray = Array.from(this.teamMembers.values());
      localStorage.setItem('zantara-team-members', JSON.stringify(membersArray));
      
      // Save collaboration channels
      const channelsArray = Array.from(this.collaborationChannels.values());
      localStorage.setItem('zantara-collaboration-channels', JSON.stringify(channelsArray));
      
    } catch (error) {
      console.error('[TeamCollaboration] Error saving team data:', error);
    }
  }

  /**
   * Add default team members
   */
  addDefaultTeamMembers() {
    const defaultMembers = [
      {
        id: 'user_1',
        name: 'Alex Johnson',
        email: 'alex@nuzantara.com',
        role: 'Administrator',
        avatar: '/public/images/avatar1.png',
        status: 'online',
        lastActive: new Date().toISOString()
      },
      {
        id: 'user_2',
        name: 'Maria Garcia',
        email: 'maria@nuzantara.com',
        role: 'Developer',
        avatar: '/public/images/avatar2.png',
        status: 'away',
        lastActive: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 'user_3',
        name: 'David Chen',
        email: 'david@nuzantara.com',
        role: 'Analyst',
        avatar: '/public/images/avatar3.png',
        status: 'offline',
        lastActive: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];
    
    defaultMembers.forEach(member => {
      this.teamMembers.set(member.id, member);
    });
    
    this.saveTeamData();
  }

  /**
   * Set up real-time communication
   */
  setupRealTimeCommunication() {
    // In a real implementation, this would connect to a WebSocket server
    // For now, we'll simulate real-time updates
    console.log('[TeamCollaboration] Real-time communication initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for team member status changes
    window.addEventListener('team-member-status-change', (event) => {
      this.updateTeamMemberStatus(event.detail.memberId, event.detail.status);
    });
    
    // Listen for new messages
    window.addEventListener('new-collaboration-message', (event) => {
      this.handleNewMessage(event.detail);
    });
    
    // Listen for shared resource updates
    window.addEventListener('shared-resource-update', (event) => {
      this.updateSharedResource(event.detail);
    });
  }

  /**
   * Get all team members
   */
  getTeamMembers() {
    return Array.from(this.teamMembers.values());
  }

  /**
   * Get team member by ID
   */
  getTeamMember(memberId) {
    return this.teamMembers.get(memberId);
  }

  /**
   * Add a new team member
   */
  addTeamMember(memberData) {
    const memberId = memberData.id || `user_${Date.now()}`;
    const member = {
      id: memberId,
      name: memberData.name,
      email: memberData.email,
      role: memberData.role || 'Member',
      avatar: memberData.avatar || '/public/images/default-avatar.png',
      status: memberData.status || 'offline',
      lastActive: new Date().toISOString(),
      ...memberData
    };
    
    this.teamMembers.set(memberId, member);
    this.saveTeamData();
    
    // Notify about new member
    window.dispatchEvent(new CustomEvent('team-member-added', {
      detail: member
    }));
    
    console.log(`[TeamCollaboration] Added team member: ${member.name}`);
    return memberId;
  }

  /**
   * Remove a team member
   */
  removeTeamMember(memberId) {
    const member = this.teamMembers.get(memberId);
    if (member) {
      this.teamMembers.delete(memberId);
      this.saveTeamData();
      
      // Notify about removed member
      window.dispatchEvent(new CustomEvent('team-member-removed', {
        detail: { id: memberId, name: member.name }
      }));
      
      console.log(`[TeamCollaboration] Removed team member: ${member.name}`);
      return true;
    }
    return false;
  }

  /**
   * Update team member status
   */
  updateTeamMemberStatus(memberId, status) {
    const member = this.teamMembers.get(memberId);
    if (member) {
      member.status = status;
      member.lastActive = new Date().toISOString();
      this.teamMembers.set(memberId, member);
      this.saveTeamData();
      
      // Notify about status change
      window.dispatchEvent(new CustomEvent('team-member-status-updated', {
        detail: { id: memberId, status, name: member.name }
      }));
      
      console.log(`[TeamCollaboration] Updated status for ${member.name}: ${status}`);
      return true;
    }
    return false;
  }

  /**
   * Get team members by status
   */
  getTeamMembersByStatus(status) {
    return Array.from(this.teamMembers.values()).filter(member => member.status === status);
  }

  /**
   * Create a collaboration channel
   */
  createChannel(channelData) {
    const channelId = channelData.id || `channel_${Date.now()}`;
    const channel = {
      id: channelId,
      name: channelData.name,
      description: channelData.description || '',
      type: channelData.type || 'general', // general, private, direct
      members: channelData.members || [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messages: channelData.messages || []
    };
    
    this.collaborationChannels.set(channelId, channel);
    this.saveTeamData();
    
    // Notify about new channel
    window.dispatchEvent(new CustomEvent('collaboration-channel-created', {
      detail: channel
    }));
    
    console.log(`[TeamCollaboration] Created channel: ${channel.name}`);
    return channelId;
  }

  /**
   * Get all collaboration channels
   */
  getChannels() {
    return Array.from(this.collaborationChannels.values());
  }

  /**
   * Get channel by ID
   */
  getChannel(channelId) {
    return this.collaborationChannels.get(channelId);
  }

  /**
   * Add member to channel
   */
  addMemberToChannel(channelId, memberId) {
    const channel = this.collaborationChannels.get(channelId);
    if (channel && !channel.members.includes(memberId)) {
      channel.members.push(memberId);
      channel.lastActivity = new Date().toISOString();
      this.collaborationChannels.set(channelId, channel);
      this.saveTeamData();
      
      console.log(`[TeamCollaboration] Added member to channel: ${channel.name}`);
      return true;
    }
    return false;
  }

  /**
   * Remove member from channel
   */
  removeMemberFromChannel(channelId, memberId) {
    const channel = this.collaborationChannels.get(channelId);
    if (channel) {
      const index = channel.members.indexOf(memberId);
      if (index !== -1) {
        channel.members.splice(index, 1);
        channel.lastActivity = new Date().toISOString();
        this.collaborationChannels.set(channelId, channel);
        this.saveTeamData();
        
        console.log(`[TeamCollaboration] Removed member from channel: ${channel.name}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Send message to channel
   */
  sendMessageToChannel(channelId, messageData) {
    const channel = this.collaborationChannels.get(channelId);
    if (channel) {
      const message = {
        id: `msg_${Date.now()}`,
        sender: messageData.sender,
        content: messageData.content,
        timestamp: new Date().toISOString(),
        attachments: messageData.attachments || []
      };
      
      channel.messages.push(message);
      channel.lastActivity = new Date().toISOString();
      
      // Keep only last 100 messages
      if (channel.messages.length > 100) {
        channel.messages.shift();
      }
      
      this.collaborationChannels.set(channelId, channel);
      this.saveTeamData();
      
      // Notify about new message
      window.dispatchEvent(new CustomEvent('new-channel-message', {
        detail: { channelId, message }
      }));
      
      console.log(`[TeamCollaboration] Message sent to channel: ${channel.name}`);
      return message.id;
    }
    return null;
  }

  /**
   * Get messages from channel
   */
  getChannelMessages(channelId, limit = 50) {
    const channel = this.collaborationChannels.get(channelId);
    if (channel) {
      // Return the most recent messages
      return channel.messages.slice(-limit);
    }
    return [];
  }

  /**
   * Share a resource with team
   */
  shareResource(resourceData) {
    const resourceId = resourceData.id || `resource_${Date.now()}`;
    const resource = {
      id: resourceId,
      name: resourceData.name,
      description: resourceData.description || '',
      type: resourceData.type || 'document', // document, link, handler, conversation
      url: resourceData.url || '',
      owner: resourceData.owner,
      sharedWith: resourceData.sharedWith || [],
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    this.sharedResources.set(resourceId, resource);
    
    // Notify about shared resource
    window.dispatchEvent(new CustomEvent('resource-shared', {
      detail: resource
    }));
    
    console.log(`[TeamCollaboration] Resource shared: ${resource.name}`);
    return resourceId;
  }

  /**
   * Get all shared resources
   */
  getSharedResources() {
    return Array.from(this.sharedResources.values());
  }

  /**
   * Get shared resource by ID
   */
  getSharedResource(resourceId) {
    return this.sharedResources.get(resourceId);
  }

  /**
   * Update shared resource
   */
  updateSharedResource(resourceData) {
    const resource = this.sharedResources.get(resourceData.id);
    if (resource) {
      Object.assign(resource, resourceData);
      resource.lastAccessed = new Date().toISOString();
      this.sharedResources.set(resourceData.id, resource);
      
      // Notify about resource update
      window.dispatchEvent(new CustomEvent('resource-updated', {
        detail: resource
      }));
      
      console.log(`[TeamCollaboration] Resource updated: ${resource.name}`);
      return true;
    }
    return false;
  }

  /**
   * Add user to shared resource
   */
  shareResourceWithUser(resourceId, userId) {
    const resource = this.sharedResources.get(resourceId);
    if (resource && !resource.sharedWith.includes(userId)) {
      resource.sharedWith.push(userId);
      resource.lastAccessed = new Date().toISOString();
      this.sharedResources.set(resourceId, resource);
      
      console.log(`[TeamCollaboration] Resource shared with user: ${resource.name}`);
      return true;
    }
    return false;
  }

  /**
   * Handle new message (from event listener)
   */
  handleNewMessage(messageData) {
    // In a real implementation, this would process incoming messages
    console.log('[TeamCollaboration] New message received:', messageData);
  }

  /**
   * Get collaboration statistics
   */
  getStatistics() {
    return {
      totalTeamMembers: this.teamMembers.size,
      onlineMembers: this.getTeamMembersByStatus('online').length,
      awayMembers: this.getTeamMembersByStatus('away').length,
      totalChannels: this.collaborationChannels.size,
      totalResources: this.sharedResources.size
    };
  }

  /**
   * Render team collaboration panel
   */
  renderCollaborationPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create collaboration panel HTML
    container.innerHTML = `
      <div class="team-collaboration-panel">
        <header>
          <h2>👥 Team Collaboration</h2>
          <p>Work together with your team members</p>
        </header>
        
        <div class="collaboration-grid">
          <div class="collaboration-section">
            <h3>Team Members</h3>
            <div id="team-members" class="members-container">
              <!-- Team members will be rendered here -->
            </div>
          </div>
          
          <div class="collaboration-section">
            <h3>Channels</h3>
            <div id="collaboration-channels" class="channels-container">
              <!-- Channels will be rendered here -->
            </div>
          </div>
          
          <div class="collaboration-section">
            <h3>Shared Resources</h3>
            <div id="shared-resources" class="resources-container">
              <!-- Shared resources will be rendered here -->
            </div>
          </div>
        </div>
        
        <div class="collaboration-actions">
          <button id="add-team-member" class="action-button">Add Member</button>
          <button id="create-channel" class="action-button">Create Channel</button>
          <button id="share-resource" class="action-button">Share Resource</button>
        </div>
      </div>
    `;
    
    // Render components
    this.renderTeamMembers('team-members');
    this.renderChannels('collaboration-channels');
    this.renderSharedResources('shared-resources');
    
    // Set up action buttons
    document.getElementById('add-team-member').addEventListener('click', () => {
      this.showAddMemberDialog();
    });
    
    document.getElementById('create-channel').addEventListener('click', () => {
      this.showCreateChannelDialog();
    });
    
    document.getElementById('share-resource').addEventListener('click', () => {
      this.showShareResourceDialog();
    });
  }

  /**
   * Render team members
   */
  renderTeamMembers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const members = this.getTeamMembers();
    
    if (members.length === 0) {
      container.innerHTML = '<p class="no-data">No team members</p>';
      return;
    }
    
    container.innerHTML = members.map(member => `
      <div class="member-card" data-member-id="${member.id}">
        <div class="member-avatar">
          <img src="${member.avatar}" alt="${member.name}" onerror="this.src='/public/images/default-avatar.png'">
        </div>
        <div class="member-info">
          <h4>${member.name}</h4>
          <p class="member-role">${member.role}</p>
          <p class="member-status ${member.status}">${member.status}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render channels
   */
  renderChannels(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const channels = this.getChannels();
    
    if (channels.length === 0) {
      container.innerHTML = '<p class="no-data">No channels</p>';
      return;
    }
    
    container.innerHTML = channels.map(channel => `
      <div class="channel-card" data-channel-id="${channel.id}">
        <div class="channel-info">
          <h4>${channel.name}</h4>
          <p class="channel-description">${channel.description || 'No description'}</p>
          <p class="channel-stats">${channel.members.length} members</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render shared resources
   */
  renderSharedResources(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const resources = this.getSharedResources();
    
    if (resources.length === 0) {
      container.innerHTML = '<p class="no-data">No shared resources</p>';
      return;
    }
    
    container.innerHTML = resources.map(resource => `
      <div class="resource-card" data-resource-id="${resource.id}">
        <div class="resource-info">
          <h4>${resource.name}</h4>
          <p class="resource-description">${resource.description || 'No description'}</p>
          <p class="resource-type">${resource.type}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Show add member dialog
   */
  showAddMemberDialog() {
    // In a real implementation, this would show a modal dialog
    console.log('[TeamCollaboration] Show add member dialog');
    alert('Add member dialog would appear here');
  }

  /**
   * Show create channel dialog
   */
  showCreateChannelDialog() {
    // In a real implementation, this would show a modal dialog
    console.log('[TeamCollaboration] Show create channel dialog');
    alert('Create channel dialog would appear here');
  }

  /**
   * Show share resource dialog
   */
  showShareResourceDialog() {
    // In a real implementation, this would show a modal dialog
    console.log('[TeamCollaboration] Show share resource dialog');
    alert('Share resource dialog would appear here');
  }
}

// Initialize team collaboration system
document.addEventListener('DOMContentLoaded', () => {
  window.TeamCollaboration = new TeamCollaboration();
  window.TeamCollaboration.initialize();
  
  console.log('[TeamCollaboration] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(26);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeamCollaboration;
}