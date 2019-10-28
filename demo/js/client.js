// Get all element references
const message = document.getElementById('message');
const btnSend = document.getElementById('btn-send');
const btnUpdateName = document.getElementById('btn-update-name');
const chatContainer = document.getElementById('chat');
const name = document.getElementById('name');
const onlineList = document.getElementById('online-list');

// Init with standard username and update online list
let currentName = 'User';
updateList(currentName);

// Send message, append to body
btnSend.addEventListener('click', () => {

    if (!message.value || !currentName)
        return false;

    const time = new Date().toUTCString();

    // Create message object
    data = {
        username: currentName,
        message: message.value,
        timestamp: time
    }

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg');

    msgDiv.innerHTML = `<b>${data.username}</b> <span class="timestamp">${data.timestamp}</span>
    <p>${data.message}</p>`;
    chatContainer.appendChild(msgDiv);

    scrollToBottom();

    message.value = '';
});

btnUpdateName.addEventListener('click', () => {

    if (!name.value)
        return false;

    currentName = name.value;
    name.value = '';

    updateList(currentName);
});

function updateList(newName) {
    if (!newName)
        return false;

    const user = document.createElement("p");
    const p = document.createTextNode(newName + ' (you)');
    user.appendChild(p);
    onlineList.innerHTML = '';
    onlineList.appendChild(user);
}

// Keeps the scrolling at the bottom when new messages arrive
const scrollToBottom = () => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enter to send message
message.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        btnSend.click();
    }
});

// Enter to update name
name.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        btnUpdateName.click();
    }
});