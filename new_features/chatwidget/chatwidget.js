class ChatWidget {
    constructor(containerSelector, sdk) {
        this.container = document.querySelector(containerSelector);
        this.sdk = sdk;

        // Define the HTML code with Tailwind CSS classes.
        const html = `
        <div class="chat-widget my-bg-dark my-padding-6 my-rounded-lg my-shadow-lg my-transition-shadow my-hover-shadow-xl" id="interactive-demo-card">
            <i class="fas fa-comments chat-widget-icon my-text-white"></i>
            <div class="chat-content">
                <!-- Here is where the original HTML goes -->
                <section class="my-text-white my-py-6 my-px-4 my-flex my-flex-col my-items-center my-space-y-6" id="interactive-live-demo">
                    <div class="my-w-full my-max-w-2xl">
                        <h2 class="my-text-3xl my-font-bold my-text-center my-mb-2 my-text-accent">Interactive Live Demo</h2>
                        <p class="my-text-center my-mb-4">Experience the power of our AI-Powered Digital Assistants through this interactive live demo.</p>
                        <div class="my-flex my-justify-center">
                            <div class="my-w-full my-max-w-2xl my-mx-auto">
                                <div class="my-p-6 my-rounded-lg my-shadow-lg my-transition-shadow my-hover-shadow-xl" id="demo-card">
                                    <div class="card">
                                        <h3 class="my-text-lg my-font-semibold my-mb-2 my-text-accent">Usage Notes:</h3>
                                        <p class="my-text-sm">Only accepts '.txt' files right now.</p>
                                        <p class="my-text-sm my-mb-4">Session data is stored for 500 seconds, after that, you will need to re-upload.</p>
                                        <form id="upload-form" class="my-space-y-3">
                                            <div id="file-and-upload" class="my-flex my-items-center my-space-x-3">
                                                <input type="file" name="file" id="file" class="hidden" required />
                                                <label for="file" class="cursor-pointer my-bg-dark my-text-white my-px-4 my-py-2 my-rounded-lg my-transition-colors my-hover-bg-dark-light">Choose file</label>
                                                <input type="submit" value="Upload" class="my-px-4 my-py-2 my-rounded-lg my-bg-dark my-text-white cursor-pointer my-transition-colors my-hover-bg-dark-light" />
                                            </div>
                                        </form>
                                        <div id="spinner" class="spinner hidden"></div>
                                        <div id="still-working-text" class="still-working">
                                            <p>Still working...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="query-container" class="my-mt-6 hidden">
                            <div class="my-flex my-justify-center">
                                <div class="my-w-full my-max-w-2xl my-mx-auto">
                                    <div id="terminal" class="my-bg-dark my-p-6 my-rounded-lg my-transition-shadow my-hover-shadow-xl">
                                        <div class="messages"></div>
                                        <form id="query-form" class="my-mt-4">
                                            <div class="input-container my-flex my-items-center my-space-x-3">
                                                <input type="text" id="prompt" name="prompt" class="my-flex-grow my-py-2 my-px-4 my-rounded-lg my-bg-dark-light my-text-white" required maxlength="4000"/>
                                                <button type="submit" id="submit-btn" class="my-px-4 my-py-2 my-rounded-lg my-bg-accent my-text-white my-transition-colors my-hover-bg-accent-dark">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                            </div>
                                        </form>
                                        <div id="loading-container" style="display: none;">
                                            <div class="spinner-query"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        `;

        // Include the HTML code in the container.
        this.container.innerHTML = html;

        // Create a reference to the messages container.
        this.messagesContainer = this.container.querySelector('.messages');

        this.uploadForm = this.container.querySelector('#upload-form');
        this.fileInput = this.container.querySelector('#file');
        this.queryForm = this.container.querySelector('#query-form');
        this.promptInput = this.container.querySelector('#prompt');

        this.fileInput.addEventListener('change', this.onFileInputChange.bind(this));
        this.uploadForm.addEventListener('submit', this.onUploadFormSubmit.bind(this));
        this.queryForm.addEventListener('submit', this.onQueryFormSubmit.bind(this));

        this.container.querySelector('.chat-widget').addEventListener('click', this.toggleChat.bind(this));
    }

    onFileInputChange() {
        this.container.querySelector('label[for="file"]').textContent = this.fileInput.files[0].name;
    }

    async onUploadFormSubmit(event) {
        event.preventDefault();

        const file = this.fileInput.files[0];

        if (file.type !== 'text/plain') {
            alert('Only .txt files are allowed.');
            location.reload();
            return;
        }

        this.container.querySelector('#file-and-upload').style.display = 'none';
        this.container.querySelector('#spinner').style.display = 'block';

        try {
            const jobId = await this.sdk.uploadFile(file);

            // Start checking job status
            this.checkJobStatus(jobId);
        } catch (error) {
            this.container.querySelector('#spinner').classList.add('hidden');
            this.container.querySelector('#file-and-upload').classList.remove('hidden');
            alert('File not uploaded.');
        }
    }

    async onQueryFormSubmit(event) {
        event.preventDefault();

        const prompt = this.promptInput.value;
        this.addMessage('human', prompt);
        this.promptInput.value = '';

        const inputContainer = this.container.querySelector('.input-container');
        const loadingContainer = this.container.querySelector('#loading-container');
        inputContainer.style.display = 'none';
        loadingContainer.style.display = 'flex';

        try {
            const result = await this.sdk.queryLLM(prompt);

            inputContainer.style.display = 'block';
            loadingContainer.style.display = 'none';

            this.addMessage('ai', result.result);
        } catch (error) {
            alert('Error: ' + error);
        }
    }

    addMessage(role, text) {
        const message = document.createElement('div');
        message.classList.add('message');
        message.innerHTML = `<span class="${role}">${role === 'ai' ? 'AI' : 'Human'}:</span> ${text}`;
        this.messagesContainer.appendChild(message);
        this.container.querySelector('#terminal').scrollTop = this.container.querySelector('#terminal').scrollHeight;
    }

    async checkJobStatus(jobId) {
        const statusResponse = await this.sdk.checkJobStatus(jobId);

        if (statusResponse.status === 'finished') {
            this.container.querySelector('#spinner').style.display = 'none';
            this.container.querySelector('#demo-card').style.display = 'none';

            const stillWorkingText = this.container.querySelector('#still-working-text');
            stillWorkingText.classList.add('hidden');
            stillWorkingText.classList.remove('show');

            const outputKey = statusResponse.result;

            this.container.querySelector('#query-container').classList.remove('hidden');
            this.container.querySelector('#upload-form').classList.add('hidden');
            this.addMessage('ai', 'Hello, I am your intelligent digital assistant. What would you like to know?');

        } else if (statusResponse.status === 'failed') {
            this.container.querySelector('#spinner').classList.add('hidden');
            this.container.querySelector('#file-and-upload').classList.remove('hidden');

            const stillWorkingText = this.container.querySelector('#still-working-text');
            stillWorkingText.classList.add('hidden');
            stillWorkingText.classList.remove('show');

            alert('File processing failed.');
        } else {
            setTimeout(() => {
                this.showStillWorkingMessage();
                this.checkJobStatus(jobId);
            }, 7000);
        }
    }

    showStillWorkingMessage() {
        const stillWorkingText = this.container.querySelector('#still-working-text');
        stillWorkingText.classList.remove('hidden');
        setTimeout(() => {
            stillWorkingText.classList.add('show');
        }, 100);
    }

    toggleChat(e) {
        // We're only interested in clicks directly on the .chat-widget, not its children
        if (e.target !== e.currentTarget) return;
        this.container.querySelector('.chat-widget').classList.toggle('expanded');
    }    
}