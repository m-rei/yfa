var CORS_PROXY = 'https://corsproxy.io/?';
const FEEDS_URL = 'https://www.youtube.com/feeds/videos.xml?';

function disableConsentRedirect(channelURL) {
    if (channelURL.indexOf('?') == -1) {
        return channelURL + '?ucbcb=1'
    } else {
        return channelURL + '&ucbcb=1'
    }
}

function extractChannelID(channelURL, successHandler, errorHandler) {
    const consentRedirectDisabledChannelURL = disableConsentRedirect(channelURL);

    const URL_CONTAINS_CHANNEL_ID_RE = /com\/channel\/([^?"\/]+)/g;
    let urlContainsChannelID = [...consentRedirectDisabledChannelURL.matchAll(URL_CONTAINS_CHANNEL_ID_RE)];
    if (urlContainsChannelID && urlContainsChannelID.length == 1 && urlContainsChannelID[0].length == 2) {
        successHandler(urlContainsChannelID[0][1]);
        return;
    }

    fetch(CORS_PROXY + consentRedirectDisabledChannelURL)
        .then(resp => resp.text())
        .then(resp => {
            const EXTRACT_CHANNEL_FROM_YOUTUBE_BODY_META_DATA_RE = /href="ios-app[^"]*/g;
            const extractedChannelIDBlock = resp.match(EXTRACT_CHANNEL_FROM_YOUTUBE_BODY_META_DATA_RE);
            if (extractedChannelIDBlock && extractedChannelIDBlock.length == 1) {
                urlContainsChannelID = [...extractedChannelIDBlock[0].matchAll(URL_CONTAINS_CHANNEL_ID_RE)];
                if (urlContainsChannelID && urlContainsChannelID.length == 1 && urlContainsChannelID[0].length == 2) {
                    successHandler(urlContainsChannelID[0][1]);
                }
            }
        })
        .catch(err => {
            errorHandler('CORS must be disabled for this to work -> use addons to disable it! Check if the URL is correct. Error message: ' + err.message);
        });
}

function getFeedsByChannelID(channelID) {
    const url = FEEDS_URL + 'channel_id=' + channelID;
    return fetch(CORS_PROXY + url)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(resp.status);
            }
            return resp.text()
        });
}

function getAuthorFromFeed(xmlFeeds) {
    const xmlDoc = new DOMParser().parseFromString(xmlFeeds, "text/xml");
    return xmlDoc.querySelector('feed author name').textContent;
}

function getChannelIdFromFeed(xmlFeeds) {
    const xmlDoc = new DOMParser().parseFromString(xmlFeeds, "text/xml");
    const ret = xmlDoc.querySelector('feed id').textContent.split(':');
    if (ret.length == 0) return '';
    return ret[ret.length - 1];
}

function getVideosFromFeed(xmlFeed, channelID, latestNVideos = 5) {
    const xmlDoc = new DOMParser().parseFromString(xmlFeed, "text/xml");
    const author = xmlDoc.querySelector('feed author name').textContent;
    const entries = xmlDoc.querySelectorAll('feed entry');
    let ret = [];
    for (let i = 0; i < Math.min(entries.length, latestNVideos); i++) {
        const entry = entries[i];
        const idArr = entry.querySelector('id').textContent.split(':');
        if (idArr.length == 0) continue;
        ret.push({
            "id": channelID,
            "videoId": idArr[idArr.length - 1],
            "title": entry.querySelector('title').textContent,
            "author": author,
            "date": entry.querySelector('published').textContent,
        });
    }
    return ret;
} 
