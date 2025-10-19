// Zantara Dashboard - Real-time Monitoring & AI Intelligence

// Initialize Socket.IO connection
let socket = null;
let activityFeedPaused = false;

// Chart instances
let conversationChart = null;
let anomalyChart = null;
let performanceChart = null;

// Metrics data storage
const metricsHistory = {
    conversations: [],
    actions: [],
    revenue: [],
    performance: []
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    initializeRealTimeData();
    initializeEventListeners();
    startMetricsPolling();
    initializeAIAssistant();
});

// Initialize Charts
function initializeCharts() {
    // Conversation Flow Chart
    const convCtx = document.getElementById('conversation-flow-chart').getContext('2d');
    conversationChart = new Chart(convCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(20),
            datasets: [{
                label: 'Active Conversations',
                data: generateRandomData(20, 30, 60),
                borderColor: '#00ffcc',
                backgroundColor: 'rgba(0, 255, 204, 0.1)',
                tension: 0.4
            }, {
                label: 'Actions/Min',
                data: generateRandomData(20, 80, 150),
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 255, 204, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(0, 255, 204, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });

    // Anomaly Detection Chart
    const anomalyCtx = document.getElementById('anomaly-chart').getContext('2d');
    anomalyChart = new Chart(anomalyCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Normal',
                data: generateScatterData(50, 0, 100, 0, 100),
                backgroundColor: 'rgba(16, 185, 129, 0.6)'
            }, {
                label: 'Anomaly',
                data: generateScatterData(5, 0, 100, 0, 100),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                pointRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 255, 204, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(0, 255, 204, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });

    // Performance Timeline
    const perfCtx = document.getElementById('performance-timeline').getContext('2d');
    performanceChart = new Chart(perfCtx, {
        type: 'bar',
        data: {
            labels: ['API', 'Cache', 'Database', 'External', 'Processing'],
            datasets: [{
                label: 'Response Time (ms)',
                data: [42, 8, 125, 234, 67],
                backgroundColor: [
                    'rgba(0, 255, 204, 0.6)',
                    'rgba(124, 58, 237, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(59, 130, 246, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 255, 204, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(0, 255, 204, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Real-time Data Simulation
function initializeRealTimeData() {
    // Simulate WebSocket connection
    simulateRealtimeUpdates();

    // Update metrics every 2 seconds
    setInterval(updateMetrics, 2000);

    // Update activity feed
    setInterval(addActivityItem, 3000);
}

function simulateRealtimeUpdates() {
    // Simulate conversation updates
    setInterval(() => {
        const conversations = document.getElementById('active-conversations');
        const current = parseInt(conversations.textContent);
        const change = Math.floor(Math.random() * 5) - 2;
        conversations.textContent = Math.max(0, current + change);
    }, 5000);

    // Simulate actions per minute
    setInterval(() => {
        const actions = document.getElementById('actions-minute');
        const newValue = 100 + Math.floor(Math.random() * 50);
        actions.textContent = newValue;
    }, 4000);

    // Simulate success rate
    setInterval(() => {
        const success = document.getElementById('success-rate');
        const newValue = (97 + Math.random() * 2).toFixed(1);
        success.textContent = newValue + '%';
    }, 6000);
}

function updateMetrics() {
    // Update charts with new data
    if (conversationChart) {
        conversationChart.data.labels.push(getCurrentTime());
        conversationChart.data.labels.shift();

        conversationChart.data.datasets[0].data.push(
            30 + Math.floor(Math.random() * 30)
        );
        conversationChart.data.datasets[0].data.shift();

        conversationChart.data.datasets[1].data.push(
            80 + Math.floor(Math.random() * 70)
        );
        conversationChart.data.datasets[1].data.shift();

        conversationChart.update('none');
    }

    // Update performance bars
    updatePerformanceBars();
}

function updatePerformanceBars() {
    const perfBars = document.querySelectorAll('.perf-bar .bar-progress');
    perfBars.forEach(bar => {
        const currentWidth = parseFloat(bar.style.width);
        const change = (Math.random() - 0.5) * 10;
        const newWidth = Math.max(0, Math.min(100, currentWidth + change));
        bar.style.width = newWidth + '%';
    });
}

// Activity Feed
function addActivityItem() {
    if (activityFeedPaused) return;

    const feed = document.getElementById('activity-feed');
    const activities = [
        {
            type: 'success',
            icon: '✅',
            title: 'Lead Saved Successfully',
            desc: 'New visa inquiry from ChatGPT',
            time: 'Just now'
        },
        {
            type: 'warning',
            icon: '⚠️',
            title: 'High API Usage',
            desc: 'Rate limit approaching (85%)',
            time: '2 min ago'
        },
        {
            type: 'success',
            icon: '💰',
            title: 'Payment Received',
            desc: 'C2 Visa service - $3,600',
            time: '5 min ago'
        },
        {
            type: 'info',
            icon: '📊',
            title: 'Report Generated',
            desc: 'Monthly analytics ready',
            time: '10 min ago'
        }
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    const feedItem = createFeedItem(activity);

    feed.insertBefore(feedItem, feed.firstChild);

    // Remove old items
    while (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
    }
}

function createFeedItem(activity) {
    const item = document.createElement('div');
    item.className = `feed-item ${activity.type}`;
    item.innerHTML = `
        <span class="feed-icon">${activity.icon}</span>
        <div class="feed-content">
            <div class="feed-title">${activity.title}</div>
            <div class="feed-desc">${activity.desc}</div>
        </div>
        <span class="feed-time">${activity.time}</span>
    `;
    return item;
}

// Event Listeners
function initializeEventListeners() {
    // Pause/Resume Activity Feed
    document.getElementById('pause-feed').addEventListener('click', () => {
        activityFeedPaused = !activityFeedPaused;
        document.getElementById('pause-feed').textContent =
            activityFeedPaused ? '▶️' : '⏸️';
    });

    // AI Assistant
    document.querySelector('.ai-assistant-btn').addEventListener('click', () => {
        document.getElementById('ai-assistant-modal').classList.add('active');
    });

    // Time selectors
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-btn').forEach(b =>
                b.classList.remove('active'));
            e.target.classList.add('active');
            updateRevenueData(e.target.textContent);
        });
    });
}

// AI Assistant Functions
function initializeAIAssistant() {
    const input = document.getElementById('ai-input');
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendAIMessage();
        }
    });
}

window.closeAIAssistant = function() {
    document.getElementById('ai-assistant-modal').classList.remove('active');
}

window.sendAIMessage = function() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById('chat-messages');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = `
        <div style="margin-bottom: 10px; padding: 10px; background: rgba(124, 58, 237, 0.2);
                    border-radius: 10px; border-left: 3px solid #7c3aed;">
            <strong>You:</strong> ${message}
        </div>
    `;
    chatMessages.appendChild(userMsg);

    // Clear input
    input.value = '';

    // Simulate AI response
    setTimeout(() => {
        const responses = [
            'I\'ve analyzed the pattern. Your visa inquiries peak on Monday mornings. Consider adding more support during these hours.',
            'The ChatGPT integration is performing excellently with a 98.3% success rate. No optimization needed.',
            'I recommend implementing rate limiting for the quote.generate endpoint - it\'s receiving 3x normal traffic.',
            'Your revenue is up 45% since implementing the custom GPT. The highest converting action is lead.save.',
            'I\'ve detected an anomaly in the Firebase connection. Investigating and will auto-heal if possible.'
        ];

        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        aiMsg.innerHTML = `
            <div style="margin-bottom: 10px; padding: 10px; background: rgba(0, 255, 204, 0.1);
                        border-radius: 10px; border-left: 3px solid #00ffcc;">
                <strong>AI Assistant:</strong> ${responses[Math.floor(Math.random() * responses.length)]}
            </div>
        `;
        chatMessages.appendChild(aiMsg);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

// Metrics Polling
function startMetricsPolling() {
    // Poll server for real metrics
    setInterval(async () => {
        try {
            const response = await fetch('/api/dashboard/metrics', {
                headers: {
                    'X-API-Key': 'zantara-internal-dev-key-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                updateDashboardWithRealData(data);
            }
        } catch (error) {
            console.log('Metrics endpoint not available, using simulated data');
        }
    }, 5000);
}

function updateDashboardWithRealData(data) {
    // Update real metrics if endpoint is available
    if (data.conversations) {
        document.getElementById('active-conversations').textContent = data.conversations;
    }
    if (data.actionsPerMinute) {
        document.getElementById('actions-minute').textContent = data.actionsPerMinute;
    }
    if (data.successRate) {
        document.getElementById('success-rate').textContent = data.successRate + '%';
    }
}

// Helper Functions
function generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * 60000);
        labels.push(time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }));
    }
    return labels;
}

function generateRandomData(count, min, max) {
    return Array(count).fill().map(() =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function generateScatterData(count, xMin, xMax, yMin, yMax) {
    return Array(count).fill().map(() => ({
        x: Math.random() * (xMax - xMin) + xMin,
        y: Math.random() * (yMax - yMin) + yMin
    }));
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateRevenueData(period) {
    const revenueElement = document.querySelector('.revenue-value');
    const revenues = {
        'Today': '$12,847',
        'Week': '$76,234',
        'Month': '$342,891'
    };
    revenueElement.textContent = revenues[period] || '$12,847';
}

// Initialize on load
console.log('🚀 Zantara Dashboard v5.2.0 - AI Ops Initialized');