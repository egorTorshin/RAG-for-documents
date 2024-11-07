document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');


    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendBtn.click();
        }
    });


    function sendMessage(message, isUser, isHTML = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        const now = new Date();
        timeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeSpan.style.fontSize = '0.8em';
        timeSpan.style.marginTop = '5px';
        timeSpan.style.display = 'block';

        if (isHTML) {
            messageContent.innerHTML = message;
        } else {
            messageContent.textContent = message;
        }

        messageElement.appendChild(messageContent);
        messageElement.appendChild(timeSpan);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function greetUser() {
        const botGreeting = "Здравствуйте, чем могу быть полезен?";
        sendMessage(botGreeting, false);
    }

    greetUser();

    sendBtn.addEventListener('click', () => {
        const userMessage = userInput.value;
        if (userMessage.trim() !== '') {
            sendMessage(userMessage, true);
            userInput.value = '';

            fetch('http://127.0.0.1:5000/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: userMessage })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    sendMessage(data.error, false);
                } else {
                    sendMessage(data.answer, false);

                    if (data.download_url) {
                        const downloadLink = `<a href="${data.download_url}" target="_blank" download="ответ.txt">Скачать файл</a>`;
                        sendMessage(downloadLink, false, true);
                    }

                    // Если хотите также добавить ссылку на Google Drive
                    if (data.google_drive_url) {
                        const googleDriveLink = `<a href="${data.google_drive_url}" target="_blank">Скачать с Google Drive</a>`;
                        sendMessage(googleDriveLink, false, true);
                    }
                }

            })
            .catch(error => {
                console.error('Ошибка:', error);
                sendMessage("Ошибка при обработке запроса.", false);
            });
        }
    });
});
