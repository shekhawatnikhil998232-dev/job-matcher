// LOGIN SYSTEM
function login() {
    const username = document.getElementById("username").value;

    if (username === "") {
        alert("Enter username!");
        return;
    }

    localStorage.setItem("user", username);

    document.getElementById("auth-section").style.display = "none";
    document.getElementById("main-app").style.display = "block";
}

// Auto login if already saved
window.onload = function () {
    const user = localStorage.getItem("user");

    if (user) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("main-app").style.display = "block";
    }

    loadChatHistory();
};
// Load chat history when page loads
function loadChatHistory() {
    const chatBox = document.getElementById("chat-box");
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

    history.forEach(msg => {
        chatBox.innerHTML += msg;
    });
}

// Send message
async function sendMessage() {
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const userText = input.value;
    if (userText === "") return;

    // User message
    const userMsg = `<div class="message user">You: ${userText}</div>`;
    chatBox.innerHTML += userMsg;

    saveMessage(userMsg);

    const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
    });

    const data = await response.json();

    // AI message
    const botMsg = `<div class="message bot">AI: ${data.reply}</div>`;
    chatBox.innerHTML += botMsg;

    saveMessage(botMsg);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
    updateDashboard(userText);function updateDashboard(text) {
    let skills = [];

    if (text.toLowerCase().includes("java")) skills.push("Java");
    if (text.toLowerCase().includes("html")) skills.push("HTML");
    if (text.toLowerCase().includes("css")) skills.push("CSS");
    if (text.toLowerCase().includes("python")) skills.push("Python");

    if (skills.length > 0) {
        document.getElementById("skills-output").innerText =
            "Detected Skills: " + skills.join(", ");
    }
}
}

// Save to localStorage
function saveMessage(message) {
    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.push(message);
    localStorage.setItem("chatHistory", JSON.stringify(history));
}
// Enter key support
document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// Clear chat
function clearChat() {
    localStorage.removeItem("chatHistory");
    document.getElementById("chat-box").innerHTML = "";
}