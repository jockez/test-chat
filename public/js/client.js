const socket = io();

let doList = true;

// Get all element references
const message = document.getElementById('message');
const btnSend = document.getElementById('btn-send');
const btnUpdateName = document.getElementById('btn-update-name');
const messages = document.getElementById('chat');
const name = document.getElementById('name');
const onlineList = document.getElementById('online-list');

btnSend.addEventListener('click', () => {

    if (!message.value)
        return false;

    const time = new Date().toUTCString();

    socket.emit('message', {
        username: name.value,
        message: message.value,
        timestamp: time
    });
    message.value = '';
});

btnUpdateName.addEventListener('click', () => {

    if (!name.value)
        return false;

    socket.emit('update-name', name.value);
});

message.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        btnSend.click();
    }
});

// Keeps the scrolling at the bottom when new messages arrive
const scrollToBottom = () => {
    messages.scrollTop = messages.scrollHeight;
}

// Show the list of messages from the server on connect
socket.on('messagelist', function (data) {
    if (!doList)
        return false;

    let i;
    let html = "";

    for (i = 0; i < data.length; i++) {
        // Add the html to the variable
        html += `<div class="chat-msg">
            <b>${data[i].username}</b> <span class="timestamp">${data[i].timestamp}</span>
            <p>${data[i].message}</p>
        </div>`;
    }

    // Add the messages to the chat div
    messages.innerHTML = html;
    doList = false;
    scrollToBottom();
});

// Update the chat on new messages
socket.on('message', function (data) {

    // Create the message div and add the data inside it
    const msgDiv = document.createElement('div');
    msgDiv.classList.add("chat-msg");

    msgDiv.innerHTML = `<b>${data.username}</b> <span class="timestamp">${data.timestamp}</span>
    <p>${data.message}</p>`;

    // Append the new message
    messages.appendChild(msgDiv);
    scrollToBottom();
});

socket.on('set-username', function (data) {

    // Set initial username
    name.value = data;
});

socket.on('update-online', function (data) {

    // Reset users list
    onlineList.innerHTML = "";

    let i;
    for (i = 0; i < data.length; i++) {
        const user = document.createElement("p");
        const p = document.createTextNode(data[i].username);
        user.appendChild(p);
        onlineList.appendChild(user);
    }
});

// User joins or leaves
socket.on('user-event', function (data) {

    // Create the message div and add the data inside it
    const msgDiv = document.createElement('div');
    msgDiv.classList.add("chat-msg");
    msgDiv.classList.add("msg-event");

    if (data.action === 'changed username')
        msgDiv.innerHTML = `${data.optional} has ${data.action} to <b>${data.username}</b>.`;
    else
        msgDiv.innerHTML = `<b>${data.username}</b> has ${data.action} the chat.`;

    // Append the new message
    messages.appendChild(msgDiv);
    scrollToBottom();
});