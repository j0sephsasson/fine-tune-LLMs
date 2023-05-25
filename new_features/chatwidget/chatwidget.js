class ChatWidget {
    constructor(containerSelector, sdk) {
        this.container = document.querySelector(containerSelector);
        this.sdk = sdk;

        // Define the HTML code with Tailwind CSS classes.
        const html = `
        <style>
            /* Import Google Font */
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        
            /* General Styles */
            * {
                box-sizing: border-box;
                font-family: 'Roboto', sans-serif;
            }
        
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 90px;
                height: 90px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
                background: linear-gradient(145deg, #000000, #1a1a1a);
                box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
                overflow: hidden;
            }

            .chat-widget.expanded {
                width: 800px;
                height: 600px;
                border-radius: 20px;
                padding: 20px;
                background-color: #1F2937;
            }

            .chat-content {
                display: none;
                overflow: auto;
                height: 90%;
            }

            .chat-widget.expanded .chat-content {
                display: block;
            }

            .chat-widget-icon {
                display: block;
            }

            .chat-widget.expanded .chat-widget-icon {
                display: none;
            }

            .spinner-query {
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-left-color: #fff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin-query 1s linear infinite;
            }

            @keyframes spin-query {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }

            .spinner {
                border: 6px solid rgba(255, 255, 255, 0.1);
                border-left-color: #fff;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
                transition: all 0.3s ease-in-out;
            }

            @keyframes spin {
                100% {
                    transform: rotate(360deg);
                }
            }

            #still-working-text p {
                font-size: 22px;
                color: #ffffff;
                font-weight: bold;
            }

            #still-working-text {
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease-in;
            }

            #still-working-text.show {
                opacity: 1;
            }
        </style>
        <div class="chat-widget bg-gray-900 p-6 rounded-lg shadow-lg transition-shadow hover:shadow-xl" id="interactive-demo-card">
            <i class="fas fa-comments chat-widget-icon text-white"></i>
            <div class="chat-content">
                <!-- Here is where the original HTML goes -->
                <section class="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-6 px-4 flex flex-col items-center space-y-6" id="interactive-live-demo">
                    <div class="w-full max-w-2xl">
                        <h2 class="text-3xl font-bold text-center mb-2">Interactive Live Demo</h2>
                        <p class="text-center mb-4">Experience the power of our AI-Powered Digital Assistants through this interactive live demo.</p>
                        <div class="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg transition-shadow hover:shadow-xl" id="demo-card">
                            <div class="card">
                                <h3 class="text-lg font-semibold mb-2">Usage Notes:</h3>
                                <p class="text-sm">Only accepts '.txt' files right now.</p>
                                <p class="text-sm mb-4">Session data is stored for 500 seconds, after that, you will need to re-upload.</p>
                                <form id="upload-form" class="space-y-3">
                                    <div id="file-and-upload" class="flex items-center space-x-3">
                                        <input type="file" name="file" id="file" class="hidden" required />
                                        <label for="file" class="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors hover:bg-gray-700">Choose file</label>
                                        <input type="submit" value="Upload" class="px-4 py-2 rounded-lg bg-gray-800 text-white cursor-pointer transition-colors hover:bg-gray-700" />
                                    </div>
                                </form>
                                <div id="spinner" class="spinner hidden"></div>
                                <div id="still-working-text" class="still-working">
                                    <p>Still working...</p>
                                </div>
                            </div>
                        </div>
                        <div id="query-container" class="mt-6 hidden">
                            <div id="terminal" class="bg-gray-800 p-6 rounded-lg transition-shadow hover:shadow-xl">
                                <div class="messages"></div>
                                <form id="query-form" class="mt-4">
                                    <div class="input-container flex items-center space-x-3">
                                        <input type="text" id="prompt" name="prompt" class="flex-grow py-2 px-4 rounded-lg bg-gray-700 text-white" required maxlength="4000"/>
                                        <button type="submit" id="submit-btn" class="px-4 py-2 rounded-lg bg-green-500 text-white transition-colors hover:bg-green-600">
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