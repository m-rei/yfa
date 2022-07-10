import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private static CHANNEL_URL = 'https://www.youtube.com/channel/';
  private static FEEDS_URL = 'https://www.youtube.com/feeds/videos.xml?';

  constructor(
    private httpClient: HttpClient
    ) { }

  redirectToChannel(channelID: string) {
    document.location = 'https://youtube.com/channel/' + channelID;
  }

  extractChannelID(channelURL: string, successHandler: any, errorHandler: any) {
    const consentRedirectDisabledChannelURL = this.disableConsentRedirect(channelURL);

    const URL_CONTAINS_CHANNEL_ID_RE = /com\/channel\/([^?"\/]+)/g;
    let urlContainsChannelID = [...consentRedirectDisabledChannelURL.matchAll(URL_CONTAINS_CHANNEL_ID_RE)];
    if (urlContainsChannelID && urlContainsChannelID.length == 1 && urlContainsChannelID[0].length == 2) {
      successHandler(urlContainsChannelID[0][1]);
      return;
    }

    this.httpClient.get(consentRedirectDisabledChannelURL, {responseType: 'text'})
      .subscribe({
        next(resp) {
          const EXTRACT_CHANNEL_FROM_YOUTUBE_BODY_META_DATA_RE = /href="ios-app[^"]*/g;
          const extractedChannelIDBlock = resp.match(EXTRACT_CHANNEL_FROM_YOUTUBE_BODY_META_DATA_RE);
          if (extractedChannelIDBlock && extractedChannelIDBlock.length == 1) {
            urlContainsChannelID = [...extractedChannelIDBlock[0].matchAll(URL_CONTAINS_CHANNEL_ID_RE)];
            if (urlContainsChannelID && urlContainsChannelID.length == 1 && urlContainsChannelID[0].length == 2) {
              successHandler(urlContainsChannelID[0][1]);
            }
          }
        },
        error(err) {
          errorHandler('CORS must be disabled for this to work -> use addons to disable it! Check if the URL is correct. Error message: ' +
            err.message);
        }
      })
  }

  getFeedsByChannelID(channelID: string, successHandler?: any, errorHandler?: any) {
    const url = YoutubeService.FEEDS_URL + 'channel_id=' + channelID;
    this.getFeeds(url, successHandler, errorHandler);
  }

  getFeedsByUser(user: string, successHandler: any, errorHandler?: any) {
    const url = YoutubeService.FEEDS_URL + 'user=' + user;
    return this.getFeeds(url, successHandler, errorHandler);
  }

  private getFeeds(url: string, successHandler?: any, errorHandler?: any) {
    let ret = this.httpClient.get(url, {responseType: 'text'});
    ret.subscribe({
        next(resp) {
          if (successHandler) {
            successHandler(resp);
          }
        },
        error(err) {
          if (errorHandler) {
            errorHandler(err.message);
          }
        }
      });
    return ret;
  }

  getAuthorFromFeed(xmlFeeds: string): string {
    const xmlDoc = new DOMParser().parseFromString(xmlFeeds, "text/xml");
    return xmlDoc.querySelector('feed author name').textContent;
  }

  getChannelIdFromFeed(xmlFeeds: string): string {
    const xmlDoc = new DOMParser().parseFromString(xmlFeeds, "text/xml");
    const ret = xmlDoc.querySelector('feed id').textContent.split(':');
    if (ret.length == 0) return '';
    return ret[ret.length-1];
  }

  private disableConsentRedirect(channelURL: string): string {
    if (channelURL.indexOf('?') == -1) {
      return channelURL + '?ucbcb=1'
    } else {
      return channelURL + '&ucbcb=1'
    }
  }
}
