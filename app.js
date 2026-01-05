// ============================
// Configuration
// ============================
const CONFIG = {
    WORKFLOW_ID: 'wf_694cd55399788190aaa361dc76a0775c09027f6e886535b0',
    API_ENDPOINT: 'https://api.openai.com/v1/responses',
    STORAGE_KEY: 'openai_agent_chat_api_key',
    MODEL: 'gpt-4o'
};

// ============================
// State Management
// ============================
let state = {
    apiKey: null,
    conversationHistory: [],
    isLoading: false
};

// ============================
// DOM Elements
// ============================
const elements = {
    // API Key Screen
    apiKeyScreen: document.getElementById('api-key-screen'),
    apiKeyInput: document.getElementById('api-key-input'),
    toggleVisibility: document.getElementById('toggle-visibility'),
    eyeIcon: document.getElementById('eye-icon'),
    eyeOffIcon: document.getElementById('eye-off-icon'),
    saveApiKeyCheckbox: document.getElementById('save-api-key'),
    startChatBtn: document.getElementById('start-chat-btn'),
    
    // Chat Screen
    chatScreen: document.getElementById('chat-screen'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    logoutBtn: document.getElementById('logout-btn')
};

// ============================
// Utility Functions
// ============================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMessage(text) {
    // Convert markdown-like formatting to HTML
    let formatted = escapeHtml(text);
    
    // Code blocks
    formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ============================
// Storage Functions
// ============================
function saveApiKey(apiKey) {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, apiKey);
    } catch (e) {
        console.error('Failed to save API key:', e);
    }
}

function loadApiKey() {
    try {
        return localStorage.getItem(CONFIG.STORAGE_KEY);
    } catch (e) {
        console.error('Failed to load API key:', e);
        return null;
    }
}

function clearApiKey() {
    try {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear API key:', e);
    }
}

// ============================
// UI Functions
// ============================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function updateStartButtonState() {
    const hasApiKey = elements.apiKeyInput.value.trim().length > 0;
    elements.startChatBtn.disabled = !hasApiKey;
}

function updateSendButtonState() {
    const hasMessage = elements.messageInput.value.trim().length > 0;
    elements.sendBtn.disabled = !hasMessage || state.isLoading;
}

function clearWelcomeMessage() {
    const welcomeMsg = elements.chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
}

function addMessage(role, content) {
    clearWelcomeMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarIcon = role === 'user' 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarIcon}</div>
        <div class="message-content">${formatMessage(content)}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return messageDiv;
}

function addTypingIndicator() {
    clearWelcomeMessage();
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    elements.chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function addErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>${escapeHtml(message)}</span>
    `;
    
    elements.chatMessages.appendChild(errorDiv);
    scrollToBottom();
}

// ============================
// API Functions
// ============================
async function sendMessage(userMessage) {
    if (state.isLoading) return;
    
    state.isLoading = true;
    updateSendButtonState();
    
    // Add user message to history
    state.conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    // Show user message
    addMessage('user', userMessage);
    
    // Show typing indicator
    addTypingIndicator();
    
    try {
        // Build the input content with conversation history
        const messages = state.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        const requestBody = {
            model: CONFIG.MODEL,
            input: messages,
            metadata: {
                workflow_id: CONFIG.WORKFLOW_ID
            }
        };
        
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the assistant's response
        let assistantMessage = '';
        
        if (data.output) {
            // Handle different response formats
            if (Array.isArray(data.output)) {
                for (const item of data.output) {
                    if (item.type === 'message' && item.content) {
                        for (const content of item.content) {
                            if (content.type === 'output_text' || content.type === 'text') {
                                assistantMessage += content.text || '';
                            }
                        }
                    }
                }
            } else if (typeof data.output === 'string') {
                assistantMessage = data.output;
            }
        }
        
        // Fallback to other response formats
        if (!assistantMessage && data.choices && data.choices[0]) {
            assistantMessage = data.choices[0].message?.content || data.choices[0].text || '';
        }
        
        if (!assistantMessage && data.text) {
            assistantMessage = data.text;
        }
        
        if (!assistantMessage) {
            assistantMessage = 'レスポンスを処理できませんでした。';
            console.log('Unexpected response format:', data);
        }
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add assistant response to history
        state.conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });
        
        // Show assistant message
        addMessage('assistant', assistantMessage);
        
    } catch (error) {
        console.error('API Error:', error);
        removeTypingIndicator();
        
        // Remove the failed message from history
        state.conversationHistory.pop();
        
        addErrorMessage(error.message || 'メッセージの送信に失敗しました。');
    } finally {
        state.isLoading = false;
        updateSendButtonState();
    }
}

// ============================
// Event Handlers
// ============================
function handleApiKeyInput() {
    updateStartButtonState();
}

function handleToggleVisibility() {
    const isPassword = elements.apiKeyInput.type === 'password';
    elements.apiKeyInput.type = isPassword ? 'text' : 'password';
    elements.eyeIcon.classList.toggle('hidden', !isPassword);
    elements.eyeOffIcon.classList.toggle('hidden', isPassword);
}

function handleStartChat() {
    const apiKey = elements.apiKeyInput.value.trim();
    
    if (!apiKey) return;
    
    state.apiKey = apiKey;
    
    // Save API key if checkbox is checked
    if (elements.saveApiKeyCheckbox.checked) {
        saveApiKey(apiKey);
    }
    
    // Reset conversation
    state.conversationHistory = [];
    
    // Clear chat messages
    elements.chatMessages.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </div>
            <h3>こんにちは！</h3>
            <p>AIエージェントとの会話を始めましょう。何でもお気軽にお聞きください。</p>
        </div>
    `;
    
    // Switch to chat screen
    showScreen('chat-screen');
    
    // Focus message input
    elements.messageInput.focus();
}

function handleMessageInput() {
    autoResizeTextarea(elements.messageInput);
    updateSendButtonState();
}

function handleSendMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message || state.isLoading) return;
    
    // Clear input
    elements.messageInput.value = '';
    autoResizeTextarea(elements.messageInput);
    updateSendButtonState();
    
    // Send message
    sendMessage(message);
}

function handleMessageKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

function handleLogout() {
    // Clear state
    state.apiKey = null;
    state.conversationHistory = [];
    
    // Clear API key input but keep saved key
    elements.apiKeyInput.value = loadApiKey() || '';
    updateStartButtonState();
    
    // Switch to API key screen
    showScreen('api-key-screen');
}

// ============================
// Initialization
// ============================
function init() {
    // Load saved API key
    const savedApiKey = loadApiKey();
    if (savedApiKey) {
        elements.apiKeyInput.value = savedApiKey;
        elements.saveApiKeyCheckbox.checked = true;
        updateStartButtonState();
    }
    
    // Add event listeners
    elements.apiKeyInput.addEventListener('input', handleApiKeyInput);
    elements.toggleVisibility.addEventListener('click', handleToggleVisibility);
    elements.startChatBtn.addEventListener('click', handleStartChat);
    elements.messageInput.addEventListener('input', handleMessageInput);
    elements.sendBtn.addEventListener('click', handleSendMessage);
    elements.messageInput.addEventListener('keydown', handleMessageKeydown);
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Handle Enter key on API key input
    elements.apiKeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !elements.startChatBtn.disabled) {
            handleStartChat();
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
