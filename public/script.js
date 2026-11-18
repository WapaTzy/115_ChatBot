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
  if (quickPrompts) {
    quickPrompts.style.display = 'none';
  }

  appendMessage(text, true);
  chatHistory.push({ role: 'user', content: text });

  userInput.value = '';
  userInput.disabled = true;
  sendBtn.disabled = true;

  const botMsgDiv = appendMessage('', false, true);
  let fullBotReply = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: chatHistory })
    });

    if (!response.ok) {
      const errorData = await response.json();
      botMsgDiv.textContent = 'Error: ' + (errorData.error || 'Gagal memproses pesan');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    botMsgDiv.textContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

        const data = trimmedLine.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullBotReply += parsed.content;
            botMsgDiv.textContent = fullBotReply;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (err) {
          console.error('Gagal parsing chunk:', err);
        }
      }
    }

    if (fullBotReply) {
      chatHistory.push({ role: 'assistant', content: fullBotReply });
    }

  } catch (error) {
    console.error('Fetch error:', error);
    botMsgDiv.textContent = 'Terjadi kesalahan koneksi ke server.';
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  sendMessage(text);
});

// Event untuk tombol saran cepat (Quick Prompts)

// Event untuk tombol hapus riwayat chat
clearBtn.addEventListener('click', () => {
  chatHistory = [initialSystemPrompt];
  chatMessages.innerHTML = '';
  appendMessage('Halo! Ada yang bisa saya bantu hari ini?', false);
  if (quickPrompts) {
    quickPrompts.style.display = 'flex';
  }
});