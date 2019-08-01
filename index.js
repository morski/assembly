var express = require('express'),
    app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require("fs");

let connectedUsers = [];

app.use("/admin", express.static(__dirname + "/admin"));
app.use("/", express.static(__dirname + "/client"))

app.get('/users', (req, res) => {
    res.send(connectedUsers);
});

app.get('/presets', (req, res) => {
    fs.readFile("presets.json", function(err, buf) {
        res.send(JSON.parse(buf));
    });
});

const savePreset = (preset) => {
    fs.readFile("presets.json", function(err, buf) {
        const presets = JSON.parse(buf);
        presets.push(preset);
        fs.writeFile("presets.json", JSON.stringify(presets), (err) => {
            if (err) console.log(err);
            io.emit('presets-updated');
          });
    });
}

io.on('connection', (socket) => {
    socket.emit('getUserName');
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter((user) => user.id != socket.id);
        console.log(connectedUsers);
        sendUpdatedUsers();
    });

    socket.on('nickname', (nickname) => {
        if (!nickname) return; 
        var user = connectedUsers.find(user => user.id === socket.id);
        if (user) {
            user.name = nickname;
        }
        else {
            connectedUsers.push({name: nickname, id: socket.id, url: ""});
        }
        console.log(connectedUsers);
        sendUpdatedUsers();
    });

    socket.on('mediaUpdate', (msg) => {
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

    socket.on('save-preset', (preset) => {
        savePreset(preset);
    });

    socket.on('get-presets', () => {

    });
});

const sendUpdatedUsers = () => {
    io.emit('usersUpdated', connectedUsers);
}

http.listen(1337, () => {
    console.log("Server started");
});

