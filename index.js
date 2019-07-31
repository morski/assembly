var app = require('express')();
var http = require('https').createServer(app);
var io = require('socket.io')(http);

let connectedUsers = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin/index.html');
});

app.get('/users', (req, res) => {
    res.send(connectedUsers);
});



io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter((user) => user.id != socket.id);
        console.log(`${socket.id} disconnected`);
        sendUpdatedUsers();
    });

    socket.on('nickname', (nickname) => {
        connectedUsers.push({name: nickname, id: socket.id, url: ""});
        sendUpdatedUsers();
    });

    socket.on('mediaUpdate', (msg) => {
        console.log(msg);
        if (msg.id === 'all') {
            io.emit('mediaUpdate', msg)
            connectedUsers.forEach((user) => {
                user.url = msg.url;
            });
        } else {
            const index = connectedUsers.findIndex((user) => user.id === msg.id);

            if (index !== -1) {
                connectedUsers[index].url = msg.url;
            }
            io.to(msg.id).emit('mediaUpdate', msg)
        }
    });

    socket.on('epilepsy', (begin) => {
        io.emit('epilepsyMode', begin);
    });
});

const sendUpdatedUsers = () => {
    io.emit('usersUpdated', connectedUsers);
}

http.listen(1337, () => {
    console.log('listening on *:1337');
});