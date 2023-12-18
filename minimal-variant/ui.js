let data = {
    CHANNEL_URL: 'https://youtube.com/channel/',
    VIDEO_URL: 'https://youtube.com/watch?v=',
    THUMBNAIL_URL: 'https://img.youtube.com/vi/%s/sddefault.jpg',
    feedVideos: [],
    channels: getChannelsFromLocalStorage(),
    progressBarWidth: null,
    tabs: [
        {
            name: 'feeds',
            active: true,
        },
        {
            name: 'setup',
            active: false,
        }
    ],
}

function addChannel(name, id) {
    if (data.channels.find(x => x.id === id)) {
        return false;
    }

    data.channels.push({
        "n": name,
        "id": id,
    });

    localStorage.setItem('channels', JSON.stringify(data.channels));
    return true;
}

function deleteChannel(id) {
    const idx = data.channels.findIndex(x => x.id === id);
    if (idx === -1) {
        return false;
    }

    data.channels.splice(idx, 1);
    localStorage.setItem('channels', JSON.stringify(data.channels));

    return true;
}

function tabClick(tabName) {
    for (let dataTab of data.tabs) {
        dataTab.active = dataTab.name === tabName;
    }
    renderTemplate(tplCtx);
}

async function reloadFeeds() {
    data.channels = getChannelsFromLocalStorage();
    data.progressBarWidth = 0;
    renderTemplate(tplCtx);

    const newFeedVideos = [];
    const errMsgs = [];
    for (let channel of data.channels) {
        const feed = await getFeedsByChannelID(channel.id)
            .catch(err => {
                errMsgs.push(`${err} - ${channel.n} (${channel.id}])`)
                return ''; 
            });
        if (feed) {
            const videos = getVideosFromFeed(feed, channel.id);
            newFeedVideos.push(...videos);
        }
        
        data.progressBarWidth++;
        renderTemplate(tplCtx);
    }
    if (errMsgs.length > 0) {
        alert(errMsgs.join('\n'));
    }
    newFeedVideos.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    data.progressBarWidth = 100;
    data.feedVideos = newFeedVideos;
    renderTemplate(tplCtx);

    setTimeout(_ => {
        data.progressBarWidth = null;
        renderTemplate(tplCtx);
    }, 250);
}

function addChannelClick() {
    let channelInput = document.querySelector('#channel-input');
    extractChannelID(channelInput.value,
        (channelID) => {
            getFeedsByChannelID(channelID)
                .then(feeds => {
                    const channelName = getAuthorFromFeed(feeds);

                    if (addChannel(channelName, channelID) && data.tabs[1].active) {
                        renderTemplate(tplCtx);
                    }
                });
        },
        (errorMsg) => {console.log(errorMsg)}
        );
    channelInput.value = '';
}

function deleteChannelClick(e, id) {
    e.preventDefault();
    if (deleteChannel(id) && data.tabs[1].active) {
        renderTemplate(tplCtx);
    }
}

let tplCtx = initTemplate('#app', data);
reloadFeeds();