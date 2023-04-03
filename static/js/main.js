document.querySelector("form[action$='/subscribe']").addEventListener("submit", function(event) {
    event.preventDefault();
    let emailInput = this.querySelector("input[type='email']");
    let button = this.querySelector("button[type='submit']");
    let spinner = document.getElementById("subscription_spinner");
    let message = document.getElementById("subscription_message");

    emailInput.style.display = "none";
    button.style.display = "none";
    spinner.style.display = "block";

    fetch("/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(emailInput.value)}`
    }).then(response => response.json())
    .then(data => {
        spinner.style.display = "none";
        if (data.success) {
            message.innerHTML = "Successfully subscribed!";
        } else {
            message.innerHTML = "Could not subscribe at this time. Try again later.";
        }
        message.style.display = "block";
        setTimeout(function() {
            message.style.display = "none";
            emailInput.value = ""; // Clear the input field
            emailInput.style.display = "block";
            button.style.display = "block";
        }, 6000);
    });
});

document.querySelector("form[action$='/submit_feedback']").addEventListener("submit", function(event) {
    event.preventDefault();
    let emailInput = this.querySelector("input[type='email']");
    let textarea = this.querySelector("textarea");
    let button = this.querySelector("button[type='submit']");
    let spinner = document.getElementById("feedback_spinner");
    let message = document.getElementById("feedback_message");

    emailInput.style.display = "none";
    textarea.style.display = "none";
    button.style.display = "none";
    spinner.style.display = "block";

    fetch("/submit_feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(emailInput.value)}&feedback=${encodeURIComponent(textarea.value)}`
    }).then(response => response.json())
    .then(data => {
        spinner.style.display = "none";
        if (data.success) {
            message.innerHTML = "Thank you for providing your valuable feedback!";
        } else {
            message.innerHTML = "Could not send your message at this time. Try again later.";
        }
        message.style.display = "block";
        setTimeout(function() {
            message.style.display = "none";
            emailInput.value = ""; // Clear the input field
            textarea.value = ""; // Clear the textarea
            emailInput.style.display = "block";
            textarea.style.display = "block";
            button.style.display = "block";
        }, 6000);
    });
});