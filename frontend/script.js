const API_URL = "http://localhost:3000/api";

/* ======================================================
    🔐 Authentication UI + Dropdown Menu
====================================================== */
async function initializeAuthUI() {
    const nav = document.querySelector('.nav-menu');
    if (!nav) return;

    const loginNav = document.getElementById('loginNav'); 

    let userMenu = document.getElementById('userMenu');
    if (!userMenu) {
        userMenu = document.createElement('li');
        userMenu.id = 'userMenu';
        userMenu.className = 'user-menu hidden'; 
        userMenu.innerHTML = `
            <button id="userIcon" class="btn user-icon" title="Account">👤</button>
            <div id="dropdown" class="dropdown hidden">
                <a href="#" id="viewProfile">Profile</a>
                <a href="chat.html" id="chatHistory">Chat History</a>
                <a href="#" id="logoutBtn">Logout</a>
            </div>
        `;
        nav.appendChild(userMenu);
    }

    const userIcon = userMenu.querySelector('#userIcon');
    const dropdown = userMenu.querySelector('#dropdown');
    const logoutBtn = userMenu.querySelector('#logoutBtn');
    const viewProfile = userMenu.querySelector('#viewProfile');

    userIcon.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    };

    document.onclick = (e) => {
        if (!userMenu.contains(e.target)) dropdown.classList.add('hidden');
    };

    logoutBtn.onclick = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/auth/logout`, { credentials: 'include' });
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    };

    viewProfile.onclick = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) {
            const user = await res.json();
            alert(`Logged in as ${user.username} (${user.email})`);
        }
    };

    // Check Login Status on Load
    try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) {
            userMenu.classList.remove('hidden');
            if (loginNav) loginNav.style.display = 'none';
        } else {
            userMenu.classList.add('hidden');
            if (loginNav) loginNav.style.display = 'block';
        }
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

/* ======================================================
    💬 Chatbot Logic (Backend Integration)
====================================================== */
let chatContext = [
    { role: "user", parts: [{ text: "You are MindMate, an empathetic wellness assistant. ALWAYS start your reply with one tag: [HAPPY], [SAD], [ANGRY], or [NEUTRAL] based on my mood." }] }
];

async function initializeChat() {
    await initializeAuthUI();

    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const typingIndicator = document.getElementById("typingIndicator");

    if (!chatMessages) return;

    // Load History
    await loadChatHistory();

    sendButton.onclick = async () => {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage("user", message);
        messageInput.value = "";
        if (typingIndicator) typingIndicator.style.display = "flex";

        try {
            // 1. Get Response from BACKEND
            const res = await fetch(`${API_URL}/chat/message`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: chatContext, message: message }),
            });

            const data = await res.json();
            const fullAiReply = data.reply;

            // 2. Extract Mood Tag
            const moodMatch = fullAiReply.match(/\[(HAPPY|SAD|ANGRY|NEUTRAL)\]/);
            const moodTag = moodMatch ? moodMatch[0] : "[NEUTRAL]";
            const botReply = fullAiReply.replace(moodTag, "").trim();
            const moodName = moodTag.replace(/[\[\]]/g, "").toLowerCase();

            // 3. Update UI
            updateSentimentUI(moodTag);
            addMessage("bot", botReply);

            // 4. Save Mood to Database (Fixes 0 on tracker)
            await fetch(`${API_URL}/mood/save`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood: moodName, message: message }),
            });

            // 5. Update Local History
            chatContext.push({ role: "user", parts: [{ text: message }] });
            chatContext.push({ role: "model", parts: [{ text: botReply }] });

        } catch (error) {
            console.error("Chat Error:", error);
            addMessage("bot", "I'm having trouble connecting to my brain. 💙");
        } finally {
            if (typingIndicator) typingIndicator.style.display = "none";
        }
    };
}

async function loadChatHistory() {
    const res = await fetch(`${API_URL}/chat/messages`, { credentials: 'include' });
    if (res.ok) {
        const data = await res.json();
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";
        data.forEach(msg => addMessage(msg.sender, msg.message));
    }
}

function updateSentimentUI(tag) {
    const emojiEl = document.getElementById("sentimentEmoji");
    const textEl = document.getElementById("sentimentText");
    if (!emojiEl || !textEl) return;

    const moods = {
        "[HAPPY]": { emoji: "😊", text: "Positive mood" },
        "[SAD]": { emoji: "😢", text: "Sad mood" },
        "[ANGRY]": { emoji: "😡", text: "Angry mood" },
        "[NEUTRAL]": { emoji: "😐", text: "Neutral mood" }
    };
    const current = moods[tag.toUpperCase()] || moods["[NEUTRAL]"];
    emojiEl.textContent = current.emoji;
    textEl.textContent = current.text;
}

function addMessage(sender, message) {
    const chatMessages = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    div.innerHTML = `
        <div class="message-avatar">${sender === "user" ? "🧑" : "🤖"}</div>
        <div class="message-content">
            <div class="message-bubble">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ======================================================
    📊 Mood Tracker Logic (Database Integration)
====================================================== */
async function initializeMoodTracker() {
    await initializeAuthUI();

    try {
        const res = await fetch(`${API_URL}/mood/summary`, { credentials: 'include' });
        const data = await res.json();

        // Update Summary Cards
        document.getElementById("happyCount").textContent = data.happy || 0;
        document.getElementById("sadCount").textContent = data.sad || 0;
        document.getElementById("angryCount").textContent = data.angry || 0;
        document.getElementById("neutralCount").textContent = data.neutral || 0;

        // Render Chart
        const ctx = document.getElementById('moodChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Happy', 'Sad', 'Angry', 'Neutral'],
                datasets: [{
                    label: 'Mood Frequency',
                    data: [data.happy, data.sad, data.angry, data.neutral],
                    backgroundColor: ['#4cc9f0', '#4895ef', '#f72585', '#7209b7'],
                    borderRadius: 8
                }]
            },
            options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
    } catch (err) {
        console.error("Mood Tracker Error:", err);
    }
}

/* ======================================================
    🚀 Page Init
====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('messageInput')) {
        initializeChat();
    } else if (document.getElementById('moodChart')) {
        initializeMoodTracker();
    } else {
        initializeAuthUI();
    }
});