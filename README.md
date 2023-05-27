# Pathway.AI Widget

Pathway.AI widget is an exciting feature enabling seamless integration of AI technology into your websites. With the widget, you can create a "custom-trained" language model for your users, leveraging your own unique domain-specific data to enhance the conversational AI experience.

## Widget Features

* Embed a powerful AI chatbot, tailored to your domain-specific data, onto your website. 
* Employs leading open-source tools such as llama_index and langchain to efficiently store and query your data.
* Gives GPT-3.5-turbo the necessary context to answer questions by incorporating the retrieved information into the prompt.
* Built with a lightweight and efficient backend using Flask (Python) and AWS Lambda functions.

![Chat Widget Example](https://github.com/j0sephsasson/fine-tune-LLMs/blob/main/ezgif-4-72e940e1b9.gif)


## How it Works

The widget works in two main steps:

1. **Data Processing**: When a file is uploaded, it is offloaded to a Redis worker for processing. 
2. **Lambda Function Call**: After the data is processed, a Lambda function is called via an API Gateway trigger to compute embeddings and store the data in a vector store.

## Data Storage

Computed embeddings for the vector store are safely and securely saved in Amazon S3.

## How to Embed the Pathway.AI Widget

The Pathway.AI widget can be effortlessly added to your webpage with just a few lines of code.

### Step-by-step Guide

1. **Add CSS for Styles and Icons**

    Add the following lines to your webpage's `<head>` section to link to our CSS for styling and Font Awesome icons.

    ```html
    <link rel="stylesheet" type="text/css" href="https://d39ca5zn8smvpd.cloudfront.net/styles.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    ```

2. **Add the Widget Container**

    Add the following `<div>` where you want the chat widget to appear in your webpage's `<body>` section.

    ```html
    <div id="my-chat-widget"></div>
    ```

3. **Include JavaScript Files**

    Include the following script tags in your webpage's `<body>` section to link to our JavaScript SDK and the chat widget script.

    ```html
    <script src="https://d39ca5zn8smvpd.cloudfront.net/sdk.min.js"></script>
    <script src="https://d39ca5zn8smvpd.cloudfront.net/chatwidget_v2.min.js"></script>
    ```

4. **Initialize the SDK and Chat Widget**

    Finally, initialize our SDK and the Chat Widget using the following script in your webpage's `<body>` section.

    ```html
    <script>
    const sdk = new MySDK('https://www.pathway-ai.io');
    const widget = new ChatWidget('#my-chat-widget', sdk);
    </script>
    ```

That's it! The Pathway.AI chat widget is now ready to go on your website, offering your users a unique, custom AI chatbot experience.

## Contributing

We value and welcome contributions from our community! Please consult CONTRIBUTING.md for details on how you can contribute to this project.

## License

This project operates under the GNU General Public License v3.0.
