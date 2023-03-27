document.querySelector('#file').onchange = function() {
    document.querySelector('label[for="file"]').textContent = this.files[0].name;
};

document.querySelector('form[action="/upload"]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (result.success) {
        document.querySelector('#query-container').style.display = 'block';
    } else {
        alert('File not uploaded.');
    }
});

document.querySelector('#query-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = document.querySelector('#prompt').value;
    const response = await fetch('/query_llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `prompt=${encodeURIComponent(prompt)}`
    });
    const result = await response.json();

    const messages = document.querySelector('.messages');
    const userMessage = document.createElement('div');
    userMessage.classList.add('message');
    userMessage.innerHTML = `<span class="human">Human:</span> ${prompt}`;
    messages.appendChild(userMessage);

    const aiMessage = document.createElement('div');
    aiMessage.classList.add('message');
    aiMessage.innerHTML = `<span class="ai">AI:</span> ${result.result.response}`;
    messages.appendChild(aiMessage);

    // Scroll to the bottom of the terminal.
    document.querySelector('#terminal').scrollTop = document.querySelector('#terminal').scrollHeight;
});