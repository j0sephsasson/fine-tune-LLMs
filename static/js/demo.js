document.querySelector('#file').onchange = function() {
    document.querySelector('label[for="file"]').textContent = this.files[0].name;
};

document.querySelector('#upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (result.success) {
        document.querySelector('#query-container').style.display = 'block';
        document.querySelector('#upload-form').classList.add('hidden');
        addMessage('ai', 'Hello, I am your intelligent digital assistant. What would you like to know?');
    } else {
        alert('File not uploaded.');
    }
});

document.querySelector('#query-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = document.querySelector('#prompt').value;
    addMessage('human', prompt);
    document.querySelector('#prompt').value = '';

    const response = await fetch('/query_llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `prompt=${encodeURIComponent(prompt)}`
    });
    const result = await response.json();
    addMessage('ai', result.result.response);
});

function addMessage(role, text) {
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = `<span class="${role}">${role === 'ai' ? 'AI' : 'Human'}:</span> ${text}`;
    document.querySelector('.messages').appendChild(message);
    document.querySelector('#terminal').scrollTop = document.querySelector('#terminal').scrollHeight;
}