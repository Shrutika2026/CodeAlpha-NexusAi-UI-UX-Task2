const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendAction = document.getElementById('sendAction');
const dropdownMenu = document.getElementById('dropdownMenu');
const historyBox = document.getElementById('historyBox');

window.onload = () => {
    localStorage.removeItem('nexus_chat_v3');
    chatBox.innerHTML = ''; 
    const hours = new Date().getHours();
    let greeting = "Good Night";
    if (hours >= 5 && hours < 12) greeting = "Good Morning";
    else if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
    else if (hours >= 17 && hours < 21) greeting = "Good Evening";

    const welcomeHTML = `
        <div style="text-align: center; margin-top: 20px; padding: 20px; border: 1px dashed var(--border); border-radius: 15px; background: rgba(74, 222, 128, 0.05);">
            <h3 class="welcome-text" style="color: var(--accent-green); margin-bottom: 10px;">✨ ${greeting}, Explorer!</h3>
            <p class="welcome-desc" style="font-size: 0.85rem; color: var(--text-muted);">
                I am <b>Nexus AI</b>, your advanced digital companion. <br>
                Ready to process data, track markets, or just chat. 
                <br><br>
                <i>How can I assist you in this session?</i>
            </p>
        </div>`;
    appendMsg(welcomeHTML, false, false);
};

document.getElementById('menuToggle').addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
document.addEventListener('click', () => dropdownMenu.classList.remove('show'));

function appendMsg(text, isUser, save = true) {
    const msg = document.createElement('div');
    msg.className = isUser ? 'message user-msg' : 'message bot-msg';
    if(!isUser && text.includes("<div")) {
        msg.innerHTML = text;
    } else {
        msg.innerHTML = text.replace(/\n/g, '<br>');
    }
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    if(save) {
        const saved = JSON.parse(localStorage.getItem('nexus_chat_v3')) || [];
        saved.push({text, isUser, isImage: false});
        localStorage.setItem('nexus_chat_v3', JSON.stringify(saved));
    }
}

function appendImageMsg(src, isUser, save = true) {
    const msg = document.createElement('div');
    msg.className = isUser ? 'message user-msg' : 'message bot-msg';
    msg.innerHTML = `<img src="${src}" alt="Uploaded Attachment">`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    if(save) {
        const saved = JSON.parse(localStorage.getItem('nexus_chat_v3')) || [];
        saved.push({text: src, isUser, isImage: true});
        localStorage.setItem('nexus_chat_v3', JSON.stringify(saved));
    }
}

function processFile(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type.startsWith('image/')) appendImageMsg(e.target.result, true);
            else appendMsg(`📎 Attached file: ${file.name}`, true);
            setTimeout(() => appendMsg(`I've received "${file.name}" from your storage. How should I process it?`, false), 800);
        };
        if (file.type.startsWith('image/')) reader.readAsDataURL(file);
        else reader.readAsText(file.slice(0, 100));
    }
}

function getChatText() {
    const saved = JSON.parse(localStorage.getItem('nexus_chat_v3')) || [];
    if(saved.length === 0) return "Nexus AI Chat Session";
    return saved.slice(-5).map(m => `${m.isUser ? 'You' : 'Nexus'}: ${m.isImage ? '[Image]' : m.text.replace(/<[^>]*>?/gm, '')}`).join('\n');
}

function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent("Check my chat with Nexus AI:\n\n" + getChatText())}`, '_blank'); }
function shareInstagram() { window.open('https://www.instagram.com/direct/inbox/', '_blank'); }
function shareSMS() { 
    const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    window.location.href = isApple ? `sms:&body=${encodeURIComponent(getChatText())}` : `sms:?body=${encodeURIComponent(getChatText())}`;
}
function copyCurrentLink() { navigator.clipboard.writeText(window.location.href).then(() => showToast()); }
function showToast() { const x = document.getElementById("toast"); x.style.visibility = "visible"; setTimeout(() => { x.style.visibility = "hidden"; }, 3000); }
function toggleLightMode() { document.body.classList.toggle('light-mode'); document.getElementById('histTitle').style.color = document.body.classList.contains('light-mode') ? "#2563eb" : "var(--accent-green)"; }
function clearChat() { chatBox.innerHTML = ''; localStorage.removeItem('nexus_chat_v3'); appendMsg("Chat cleared.", false, true); }
function showHistory() {
    const saved = JSON.parse(localStorage.getItem('nexus_chat_v3')) || [];
    document.getElementById('historyContent').innerHTML = saved.length === 0 ? "No history." : saved.map(m => `<div style="margin-bottom:10px; border-bottom:1px solid #333; padding:5px;"><small>${m.isUser?'YOU':'NEXUS'}:</small><br>${m.isImage ? '[Image Attachment]' : m.text.replace(/<[^>]*>?/gm, '')}</div>`).join('');
    historyBox.style.display = 'flex';
}
function closeHistory() { historyBox.style.display = 'none'; }
function pillReply(val) { userInput.value = val; handleChat(); }

function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMsg(text, true);
    userInput.value = "";
    setTimeout(() => {
        let r = "I've analyzed that. Ask me about Stock, Movies, Weather, or the Time!";
        const lowerText = text.toLowerCase();

        if(lowerText.includes("currency converter")) {
            r = `💱 Currency Exchange Rates (Today):
1 USD = 83.42 INR
1 EUR = 90.15 INR
1 GBP = 105.30 INR
1 AED = 22.71 INR
Note: Rates fluctuate based on market conditions.`;
        }
        else if(lowerText.includes("weather")) {
            r = `⛅ Today's Weather Update:
Temperature: 32°C (Feels like 35°C)
Condition: Mostly Sunny & Hot
Rain Chance: 5% (Very Low)
Sunlight: Very Powerful (High UV Index)
Humidity: 45%
Wind: 12 km/h`;
        }
        else if(lowerText.includes("date") || lowerText.includes("time")) {
            r = "🕒 Current Date & Time: " + new Date().toLocaleString();
        }
        else if(lowerText.includes("stock market")) {
            r = `📈 Current Market Status:
Nifty 50: 22,410.20 (+0.45%)
Sensex: 73,806.15 (+0.38%)
Market Sentiment: Bullish
Most Active: Reliance, HDFC Bank.`;
        }
        else if(lowerText.includes("movie recommender")) {
            r = `🎬 Recommended:
1. Dune: Part Two (2024) - BookMyShow / Prime Video
2. Oppenheimer (2023) - JioCinema / Apple TV
3. Animal (2023) - Netflix
4. The Batman (2022) - Prime Video / JioCinema
5. Interstellar (2014) - Netflix / Prime Video`;
        }
        else if(lowerText.includes("quote")) {
            r = `📜 Top Quotes for Today:
1. "The only way to do great work is to love what you do." – Steve Jobs
2. "Innovation distinguishes between a leader and a follower." – Steve Jobs
3. "Stay hungry, stay foolish." – Steve Jobs
4. "The future belongs to those who believe in the beauty of their dreams." – Eleanor Roosevelt
5. "Do not go where the path may lead, go instead where there is no path and leave a trail." – Ralph Waldo Emerson
6. "Success is not final, failure is not fatal: it is the courage to continue that counts." – Winston Churchill
7. "It always seems impossible until it's done." – Nelson Mandela
8. "The best way to predict the future is to create it." – Peter Drucker
9. "Believe you can and you're halfway there." – Theodore Roosevelt
10. "Your time is limited, so don't waste it living someone else's life." – Steve Jobs`;
        }
        appendMsg(r, false);
    }, 800);
}
sendAction.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => { if(e.key==='Enter') handleChat(); });