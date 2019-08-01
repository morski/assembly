$(function () {
    String.prototype.splice = function(idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };
    var socket = io();
    let userName = "";

    $("#joinButton").click(() => {
        userName = $("#nickName").val();
        if (userName != "") {
            socket.emit('nickname', userName);
            $(".userNameContainer").addClass("hidden");
            $(".media-container").removeClass("hidden");
        }
    });
    
    socket.on('getUserName', () => {
        socket.emit('nickname', userName);
    });

    socket.on('mediaUpdate', (msg) => {
        $('.media-container').html(convertUrlToElement(msg.url, msg.mediaType));
    });

    socket.on('epilepsyMode', (begin) => {
        if (begin) {
            epilepsyMode();
        } else {
            stopEpilepsyMode();
        }
    });

    const convertUrlToElement = (url, mediaType) => {
        switch(mediaType){
            case 'image':
                return `<img src="${url}">`;
                break;
            case 'video':
                return `<video width="${$(window).width()}" autoplay loop><source src="${url}"></video>`;
                break;
            case 'youtube':
                const videoId = url.split('=')[1];
                return `<iframe width="${$(window).width()}" height="${$(window).height()}" src="https://www.youtube.com/embed/${videoId}?controls=0&versiion=3&loop=1&playlist=${videoId}&autoplay=1" frameborder="0"></iframe>`;
                break;
            default:
                return "";
                break;
        }
    };

    const epilepsyMode = () => {
        $('.media-container').html("");
        $('.media-container').css('animation', 'rainbow .5s infinite');
    };

    const stopEpilepsyMode = () => {
        $('.media-container').html("");
        $('.media-container').css('animation', '');
    };
});