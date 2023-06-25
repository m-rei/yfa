import { EventEmitter, Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Account } from '../model/account.model';
import { Channel } from '../model/channel.model';
import { Profile } from '../model/profile.model';
import { Video } from '../model/video.model';
import { FormatUtil } from '../util/format';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private static LS_SELECTED_ACCOUNT_KEY = 'selected-account';
  private static LS_ACCOUNTS_KEY = 'accounts';
  private static LS_CHANNELS_KEY = 'channels';
  private static LS_PROFILE_KEY = 'profile';
  private static LS_VIDEOS_KEY = 'videos';
  private static LS_LAST_SYNC_KEY = 'last_sync';

  profileChanged: EventEmitter<Profile> = new EventEmitter();

  constructor() { }

  public loadAccounts(): Account[] {
    let accounts = localStorage.getItem(PersistenceService.LS_ACCOUNTS_KEY);
    if (!accounts) {
      return [];
    }
    return (JSON.parse(accounts) as Account[]).sort((a,b) => a.order - b.order);
  }

  public saveAccounts(accounts: Account[]) {
    const accountsStringified = JSON.stringify(accounts);
    localStorage.setItem(PersistenceService.LS_ACCOUNTS_KEY, accountsStringified);
  }

  public loadSelectedAccount(loadedAccounts: Account[]) {
    let selectedAccountName = localStorage.getItem(PersistenceService.LS_SELECTED_ACCOUNT_KEY);
    if (!selectedAccountName) {
      return null;
    }
    return loadedAccounts.find(a => a.name === selectedAccountName);
  }

  public saveSelectedAccount(account: Account) {
    if (!account) {
      return;
    }
    localStorage.setItem(PersistenceService.LS_SELECTED_ACCOUNT_KEY, account.name);
  }

  public loadChannels(): Channel[] {
    let channels = localStorage.getItem(PersistenceService.LS_CHANNELS_KEY);
    if (!channels) {
      return [];
    }
    let ret: any = [];
    const data = channels.split('|');
    for (let i = 0; i < data.length; i+=3) {
      ret.push(new Channel(FormatUtil.unescape(data[i+0], '|'), data[i+1], data[i+2]));
    }
    return ret;
  }

  public saveChannels(channels: Channel[]) {
    const data = channels
      .map(v => FormatUtil.escape(v.account, '|') + '|' + v.id + '|' + v.name)
      .join('|');
    localStorage.setItem(PersistenceService.LS_CHANNELS_KEY, data);
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

  public loadProfile(): Profile {
    let profile = localStorage.getItem(PersistenceService.LS_PROFILE_KEY);
    if (!profile) {
      return new Profile(null, null, 0);
    }
    return JSON.parse(profile);
  }

  public saveProfile(profile: Profile) {
    const profileStringified = JSON.stringify(profile);
    localStorage.setItem(PersistenceService.LS_PROFILE_KEY, profileStringified);
    this.profileChanged.next(JSON.parse(profileStringified));
  }

  public loadVideos(): Video[] {
    let videos = localStorage.getItem(PersistenceService.LS_VIDEOS_KEY);
    if (!videos) {
      return [];
    }
    let ret: any = [];
    const data = videos.split('|');
    for (let i = 0; i < data.length; i+=4) {
      ret.push(new Video(data[i+0], data[i+1], FormatUtil.unescape(data[i+2], '|'), data[i+3]));
    }
    return ret;
  }

  public saveVideos(videos: Video[]) {
    const data = videos
      .map(v => v.channelId + '|' + v.videoId + '|' + FormatUtil.escape(v.title,'|') + '|' + v.date)
      .join('|');
    localStorage.setItem(PersistenceService.LS_VIDEOS_KEY, data);
  }

  public loadLastSync(): Moment {
    return moment(localStorage.getItem(PersistenceService.LS_LAST_SYNC_KEY));
  }

  public saveLastSync(m: Moment) {
    localStorage.setItem(PersistenceService.LS_LAST_SYNC_KEY, m.toString());
  }
}
