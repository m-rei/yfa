import { CompressorService } from './compressor.service';
import { Channel } from './../model/channel.model';
import { Injectable } from '@angular/core';
import { Account } from '../model/account.model';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private static LS_CHANNELS_KEY = 'channels';

  constructor(private compressorService: CompressorService) { }

  public loadChannels(): Channel[] {
    let channels = localStorage.getItem(ChannelService.LS_CHANNELS_KEY);
    if (!channels) {
      return [];
    }
    let ret: any = [];
    const data = channels.split('|');
    for (let i = 0; i < data.length; i+=3) {
      ret.push(new Channel(data[i+0], data[i+1], data[i+2]));
    }
    return ret;
  }

  public saveChannels(channels: Channel[]) {
    const data = channels
      .map(v => v.account + '|' + v.id + '|' + v.name)
      .join('|');
    localStorage.setItem(ChannelService.LS_CHANNELS_KEY, data);
  }

  public adjustOrphanedChannels(accounts: Account[]) {
    let channels = this.loadChannels();
    channels.forEach(c => {
      if (!accounts.find(a => a.name == c.account)) {
        c.account = '';
      }
    })
    this.saveChannels(channels);
  }
}
