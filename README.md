# Pathway.AI

Pathway.AI is an application that enables companies or individuals to quickly and easily create and deploy intelligent digital assistants. Using state-of-the-art machine learning techniques and open-source tools such as llama_index and langchain, Pathway.AI fine-tunes the chatGPT (gpt-3.5-turbo) model on the user's unique domain-specific data, creating a powerful expert digital AI bot.

## Features

* Fine-tunes chatGPT (gpt-3.5-turbo) on the user's unique domain-specific data to create a powerful expert digital AI bot.
* Uses open-source tools such as llama_index and langchain to compute embeddings and store the data in chunks in the vector space, making it highly efficient to query.
* Incorporates retrieved information into the prompt sent to GPT, providing it with the necessary context to answer questions.
* Backend is built with Flask (Python) and AWS Lambda functions.

## Getting Started

Currently working on making it easier to set up and run the application locally. Please stay tuned for updates.

In the meantime, if you are interested in using the application, please be aware that the current version relies heavily on AWS Lambda and S3, and that there are several security considerations that need to be taken into account when setting up and running the application.

I recommend that you use the application in a production environment only after thoroughly understanding the security implications and taking appropriate measures to secure your AWS resources and data.

## Usage

1. Upload your domain-specific data to the application.
2. Fine-tune the chatGPT model on your data.
3. Deploy your expert digital AI bot.


## Contributing

We welcome contributions from the community! Please read CONTRIBUTING.md for details on how to contribute to this project.

## License

This project is licensed under the GNU General Public License v3.0.
