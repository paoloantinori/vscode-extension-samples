// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {

    // due to security model issue cannot inline script with "onclick" attribute, so I have to attach event handlers programmatically
    console.log("my script loaded");
    document.addEventListener("DOMContentLoaded", function(event) { 
        console.log("my document event handler ready loaded");
        const addEventListenerForSendButton = () => {
            console.log("my click event handler ready loaded");
            var el = document.getElementById("sendButton");
            if (el !== null) {
                el.addEventListener('click', clickHandler);
            }
        };
        const clickHandler = () => {
            console.log("doSubmit invoked");
            var el = document.getElementById("my_input");
            // Send a message back to the extension
            vscode.postMessage({
                command: 'apicurito',
                text: el.value
            });
        }

        addEventListenerForSendButton();
      });

    //connect to the vscode api
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState();

    const counter = document.getElementById('lines-of-code-counter');
    console.log("############" + oldState);
    let currentCount = (oldState && oldState.count) || 0;
    counter.textContent = currentCount;

    setInterval(() => {
        counter.textContent = currentCount++;

        // Update state
        vscode.setState({ count: currentCount });

        // Alert the extension when the cat introduces a bug
        if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
            // Send a message back to the extension
            vscode.postMessage({
                command: 'alert',
                text: '🐛  on line ' + currentCount
            });
        }
    }, 100);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'refactor':
                currentCount = Math.ceil(currentCount * 0.5);
                counter.textContent = currentCount;
                break;
        }
    });
}());