import { Channel } from './../model/channel.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private static LS_CHANNELS_KEY = 'channels';

  constructor() { }

  public loadChannels(): Channel[] {
    let channels = localStorage.getItem(ChannelService.LS_CHANNELS_KEY);
    if (!channels) {
      return [];
    }
    return JSON.parse(channels);
  }

  public saveChannels(channels: Channel[]) {
    const channelsStringified = JSON.stringify(channels);
    localStorage.setItem(ChannelService.LS_CHANNELS_KEY, channelsStringified);
  }
}
