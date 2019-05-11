// How many messages will be stored before starting to shift off the oldest
const MSG_MAX_COUNT = 50;

// Array for all messages missed since the server started
let messages = [];
let users = [];
let userCount = 1;

// Start the Express server and Sockets.io
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const path = require('path');

// Serve the public folder for easy access to css and js
app.use(express.static('public'));

// Return index.html on all requests
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
// Below had to be on the .get(). to use static but works now
//.use(express.static(path.join(__dirname, '/public')));

// Connect to the socket
io.on('connection', function (socket) {
    console.log('user connected');

    let username = 'Coolboi-' + userCount;
    users.push({
        id: socket.id,
        username: username
    });
    userCount++;

    // Send the new username to the client
    socket.emit('set-username', username);

    // No need to broadcast, update list for everyone
    io.emit('update-online', users);

    // Add joined event to the chat
    io.emit('user-event', {
        username: username,
        action: 'joined'
    });

    // Send all missed messages on connection
    io.emit('messagelist', messages);

    /* On disconnect */
    socket.on('disconnect', function () {
        console.log('user disconnected');

        const index = users.map(function (e) {
            return e.id;
        }).indexOf(socket.id);

        if (index > -1) {
            // Get username before deleted to emit it to the chat
            const username = users[index].username;

            users.splice(index, 1);
            io.emit('update-online', users);
            io.emit('user-event', {
                username: username,
                action: 'left'
            });
        }
    });

    /* On update name */
    socket.on('update-name', function (data) {
        //console.log("new name", data);

        // Find the socket requesting the name change
        const index = users.map(function (e) {
            return e.id;
        }).indexOf(socket.id);

        // If found send the updated name to everyone
        if (index > -1) {
            // If the name didn't change there's no need to update it
            if (users[index].username !== data) {
                // Get old username
                const oldUsername = users[index].username;

                // Update to new username and emit to update online list and send the name change to chat
                users[index].username = data;
                io.emit('update-online', users);
                io.emit('user-event', {
                    username: data,
                    action: 'changed username',
                    optional: oldUsername
                });
            }
        }
    });

    /* On message sent */
    socket.on('message', function (data) {
        messages.push({
            username: data.username,
            message: data.message,
            timestamp: data.timestamp
        });

        // If more than max count, we remove one message from the array
        if (messages.length > MSG_MAX_COUNT)
            messages.shift();

        io.emit('message', {
            username: data.username,
            message: data.message,
            timestamp: data.timestamp
        });
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});



// To broadcast to everyone but the client itself, use room and broadcast
//socket.join('hest');
//socket.broadcast.to('hest').emit('update-online', users);