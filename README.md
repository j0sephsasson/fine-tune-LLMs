# Pathway.AI

Pathway.AI is an application that enables companies or individuals to quickly and easily create and deploy intelligent digital assistants. Using state-of-the-art machine learning techniques and open-source tools such as llama_index and langchain, Pathway.AI fine-tunes the chatGPT (gpt-3.5-turbo) model on the user's unique domain-specific data, creating a powerful expert digital AI bot.

## Features

* Fine-tunes chatGPT (gpt-3.5-turbo) on the user's unique domain-specific data to create a powerful expert digital AI bot.
* Uses open-source tools such as llama_index and langchain to compute embeddings and store the data in chunks in the vector space, making it highly efficient to query.
* Incorporates retrieved information into the prompt sent to GPT, providing it with the necessary context to answer questions.
* Backend is built with Flask (Python) and AWS Lambda functions.

## Getting Started

1. Clone the repository git clone https://github.com/j0sephsasson/fine-tune-LLMs.git
2. Install the dependencies pip install -r requirements.txt
3. Start the backend server python app.py

## Usage

1. Upload your domain-specific data to the application.
2. Fine-tune the chatGPT model on your data.
3. Deploy your expert digital AI bot.


## Contributing

We welcome contributions from the community! Please read CONTRIBUTING.md for details on how to contribute to this project.

## License

This project is licensed under the GNU General Public License v3.0.