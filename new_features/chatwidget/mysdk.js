class MySDK {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this._fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        return response.job_id;
    }

    async checkJobStatus(jobId) {
        const response = await this._fetch('/job_status/' + jobId);

        if (response.status === 'finished') {
            this.token = response.token; // Set token when job is finished
        }

        return response;
    }

    async queryLLM(prompt) {
        // Add check if token is not null
        if (this.token === null) {
            throw new Error("Token is null. Make sure job is finished before querying LLM.");
        }

        const response = await this._fetch('/query_llm', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `prompt=${encodeURIComponent(prompt)}&token=${encodeURIComponent(this.token)}`
        });
    
        return response;
    }

    async _fetch(endpoint, options) {
        try {
            const response = await fetch(this.baseUrl + endpoint, options);

            if (!response.ok) {
                throw new Error(`Request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('An error occurred:', error);
            throw error;  // Propagate the error to the caller.
        }
    }
}