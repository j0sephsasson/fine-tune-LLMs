document.querySelector('#file').onchange = function() {
    document.querySelector('label[for="file"]').textContent = this.files[0].name;
};

async function checkJobStatus(jobId) {
    const statusResponse = await fetch(`/job_status/${jobId}`);
    const statusResult = await statusResponse.json();

    if (statusResult.status === 'finished') {
        // Hide the spinner
        document.querySelector('#spinner').style.display = 'none';
        
        const outputKey = statusResult.result;

        document.querySelector('#query-container').style.display = 'block';
        document.querySelector('#upload-form').classList.add('hidden');
        addMessage('ai', 'Hello, I am your intelligent digital assistant. What would you like to know?');

    } else if (statusResult.status === 'failed') {
        // Hide the spinner and show the buttons
        document.querySelector('#spinner').classList.add('hidden');
        document.querySelector('#file-and-upload').classList.remove('hidden');
        alert('File processing failed.');
    } else {
        setTimeout(() => checkJobStatus(jobId), 1000);  // Check again after 1 second
    }
}

document.querySelector('#upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.querySelector('#file');
    const file = fileInput.files[0];
    
    // Check if the file is a .txt file
    if (file.type !== 'text/plain') {
        alert('Only .txt files are allowed.');
        location.reload();
        return;
    }

    // Hide the buttons and show the spinner
    document.querySelector('#file-and-upload').style.display = 'none';
    document.querySelector('#spinner').style.display = 'block';

    const formData = new FormData(event.target);
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();

    if (result.success) {
        // Start checking job status
        checkJobStatus(result.job_id);
    } else {
        // Hide the spinner and show the buttons
        document.querySelector('#spinner').classList.add('hidden');
        document.querySelector('#file-and-upload').classList.remove('hidden');
        alert('File not uploaded.');
    }
});


document.querySelector('#query-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = document.querySelector('#prompt').value;
    addMessage('human', prompt);
    document.querySelector('#prompt').value = '';

    const inputContainer = document.querySelector('.input-container');
    const loadingContainer = document.querySelector('#loading-container');
    inputContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    const response = await fetch('/query_llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `prompt=${encodeURIComponent(prompt)}`
    });
    const result = await response.json();

    inputContainer.style.display = 'block';
    loadingContainer.style.display = 'none';

    if (result.success) {
        addMessage('ai', result.result);
    } else {
        alert('Error: ' + result.error);
    }
});

function addMessage(role, text) {
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = `<span class="${role}">${role === 'ai' ? 'AI' : 'Human'}:</span> ${text}`;
    document.querySelector('.messages').appendChild(message);
    document.querySelector('#terminal').scrollTop = document.querySelector('#terminal').scrollHeight;
}