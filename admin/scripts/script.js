var socket = null;
let connectedUser = [];
let allPresets = [];

var refresh;

const giphy = {
    baseURL: "https://api.giphy.com/v1/gifs/",
    apiKey: "0UTRbFtkMxAplrohufYco5IY74U8hOes",
    type: "random",
    rating: "pg-13"
};

const getGiphyUrl = () => {
    const giphyTag = $("#gif-tag").val();
    const tagUrlPart = giphyTag ? `&tag=${giphyTag}` : "";
    return encodeURI(`${giphy.baseURL}${giphy.type}?api_key=${giphy.apiKey}${tagUrlPart}&rating=${giphy.rating}`);
};

$(function () {

    socket = io();

    socket.on('connect', () => {
        myId = socket.io.engine.id;
    });

    socket.on('usersUpdated', (users) => {
        populateUsersToList(users);
    });

    socket.on('presets-updated', () => {
        alert("Preset saved");
        getPresets();
    });

    getConnectedUsers();

    getPresets();

    $(".refreshUsers").click(() => {
        getConnectedUsers();
    });

    $("#allTitle").click(function(){
        
        
    });
});

const blankScreens = () => {
    socket.emit('mediaUpdate', {
        id: 'all',
        url: ''
    });
};

const getPresets = () => {
    $.get( "/presets", ( presets ) => {
        var options = $("#preset-selector");
        options.html("");
        presets.forEach((pre) => {
            options.append($("<option />").val(pre.name).text(pre.name));
        });
        allPresets = presets;
    });
};

const loadPreset = () => {
    const selectePrestName = $("#preset-selector").val();
    const selectedPrest = allPresets.find(x => x.name === selectePrestName);
    let index = 0;

    document.querySelectorAll('.client-url').forEach((clEle) => {
        clEle.value = selectedPrest.urls[index];
        index++;
    });
};

const toggleConnectedUser = (id) => {
    $(`#${id}Updater`).toggle(300);
};

const updateMedia = (id) => {
    const url = $(`input[name='${id}Url']`).val();
    const mediaType = $(`input[name='${id}MediaType']:checked`).val();
    socket.emit('mediaUpdate', {
        id,
        mediaType,
        url
    });
};

const getConnectedUsers = () => {
    $.get( "/users", ( users ) => {
        populateUsersToList(users);
    });
};

const populateUsersToList = (users) => {
    $(".userContent").empty();
    users.forEach(user => {
        $(".userContent").append(`<div class="client-container">
                                    <div class="info">
                                        <div class="date"></div>
                                        <div class="category">${user.name}</div>
                                    </div>
                                    <div class="content">
                                        <div class="media-update-container">
                                            <div class="url-type-container">
                                                <div class="media-url">
                                                    <input id="${user.id}" class="client-url" name="${user.id}Url" type="text" value="${user.url}">
                                                </div>
                                                <div class="media-type">
                                                    <div class="type">
                                                        <input id="${user.id}Image" type="radio" name="${user.id}MediaType" value="image" checked><label for="${user.id}Image">Image</label>
                                                    </div>
                                                    <div class="type">
                                                        <input id="${user.id}Video" type="radio" name="${user.id}MediaType" value="video"><label for="${user.id}Video">Video</label>
                                                    </div>
                                                    <div class="type">
                                                        <input id="${user.id}Youtube" type="radio" name="${user.id}MediaType" value="youtube"><label for="${user.id}Youtube">Youtube</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="media-update-button">
                                                <div class="button" onclick="updateMedia('${user.id}')">Update</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
    });
};

const startEpilepsy = () => {
    socket.emit('epilepsy', true);
};

const stopEpilepsy = () => {
    socket.emit('epilepsy', false);
};

const savePreset = () => {
    const presetName = $("#preset-name").val();
    var index = 0;
    const urls = $('.client-url').map(function() {
        return $(this).val();
    }).toArray();
    socket.emit('save-preset', {name: presetName, urls});
};

const startGifs = () => {
    getRandomGifsForAllUsers();
    refreshRate();
};

const stopGifs = () => {
    clearInterval(refresh);
    blankScreens();
};

const getRandomGifsForAllUsers = () => {
    $('.client-url').each((i, ele) => {
        $.getJSON(getGiphyUrl(), json => {
            $(ele).val(json.data.image_original_url);
            updateMedia(ele.id);
        });
    });
};

var refreshRate = () => {
     // Reset set intervals
     
     const duration = $("#gif-refresh-interval").val() * 1000;

     clearInterval(refresh);
     refresh = setInterval(() => {
         // Call Giphy API for new gif
         getRandomGifsForAllUsers();
     }, duration);
};