const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const quickPrompts = document.getElementById('quickPrompts');

const initialSystemPrompt = {
  role: 'system',
  content: 'Kamu adalah asisten AI yang ramah, membantu, dan menjawab dalam Bahasa Indonesia secara ringkas dan jelas.'
};

let chatHistory = [initialSystemPrompt];

function appendMessage(text, isUser, isLoading = false) {
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('message-row', isUser ? 'user-row' : 'bot-row');

  if (!isUser) {
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('msg-avatar');
    avatarDiv.textContent = '✦';
    rowDiv.appendChild(avatarDiv);
  }

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');

  if (isLoading) {
    msgDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  } else {
    msgDiv.textContent = text;
  }

  rowDiv.appendChild(msgDiv);
  chatMessages.appendChild(rowDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgDiv;
}

async function sendMessage(text) {
  if (!text) return;

  // Sembunyikan quick prompts setelah chat pertama dimulai agar layar lebih lega
  

// Event untuk tombol saran cepat (Quick Prompts)
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const promptText = chip.getAttribute('data-prompt');
    sendMessage(promptText);
  });
});

// Event untuk tombol hapus riwayat chat
clearBtn.addEventListener('click', () => {
  chatHistory = [initialSystemPrompt];
  chatMessages.innerHTML = '';
  appendMessage('Halo! Ada yang bisa saya bantu hari ini?', false);
  if (quickPrompts) {
    quickPrompts.style.display = 'flex';
  }
});