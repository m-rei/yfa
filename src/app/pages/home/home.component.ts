import { PersistenceService } from './../../services/persistence.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { YoutubeService } from 'src/app/services/youtube.service';
import { AccountToolbarComponent } from 'src/app/account-toolbar/account-toolbar.component';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Channel } from 'src/app/model/channel.model';
import { Video } from 'src/app/model/video.model';
import { SNACKBAR_DEFAULT_CONFIG } from 'src/app/util/defaults';
import { zip } from 'rxjs';
import { Account } from 'src/app/model/account.model';
import * as moment from 'moment';
import { FormatUtil } from 'src/app/util/format';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild(AccountToolbarComponent, {static: true}) toolbar: AccountToolbarComponent;
  @ViewChild('p', {static: true}) paginator: MatPaginator;
  
  channels: Channel[] = [];
  videos: Video[] = [];

  filterText: string = '';
  filteredVideos: Video[] = [];

  accountVideos: Map<Account, Video[]> = new Map();

  constructor(
    private persistenceService: PersistenceService,
    private youtubeService: YoutubeService,
    private snackbar: MatSnackBar,
    ) { }

  ngOnInit(): void {
    this.channels = this.persistenceService.loadChannels();
    this.videos = this.persistenceService.loadVideos();
  }

  ngAfterViewInit(): void {
    this.doFilter();
    this.checkAutoSyncAndExecuteIfNecessary();
  }

  checkAutoSyncAndExecuteIfNecessary() {
    const profile = this.persistenceService.loadProfile();
    const lastSync = this.persistenceService.loadLastSync();
    if (profile.autoSyncMinutes && profile.autoSyncMinutes > 0) {
      if (!lastSync || moment().diff(lastSync, 'minutes') >= profile.autoSyncMinutes) {
        this.toolbar.sync();
      }
    }
  }

  onSyncClick() {
    let newVideos: Video[] = [];
    let promises: any[] = [];
    let finished = 0;
    for (let i = 0; i < this.channels.length; i++) {
      const channel = this.channels[i];

      const successHandler = (xmlFeeds: string) => {
        newVideos.push(...this.youtubeService.getVideosFromFeeds(xmlFeeds, channel.id));
        const f = ++finished;
        this.toolbar.progress100 = f * 100 / this.channels.length;
      }
      promises.push(
        this.youtubeService.getFeedsByChannelID(channel.id, successHandler)
      );
    }
    
    const finishedHandler = () => {
      this.videos = newVideos.sort((a,b) => {
        return moment(a.date).isAfter(b.date) ? -1 : 1;
      });
      this.persistenceService.saveVideos(this.videos);
      this.doFilter();
      this.snackbar.open("finished syncing!", 'close', SNACKBAR_DEFAULT_CONFIG);
      this.toolbar.syncing = false;
    }
    if (promises.length == 0) {
      finishedHandler();
    } else {
      zip(...promises).subscribe(finishedHandler);
    }
  }

  filterChanged() {
    this.doFilter();
  }

  doFilter() {
    if (!this.filterText) {
      this.filteredVideos = this.videos;
    } else {
      this.filteredVideos = this.videos.filter(v => {
        let account = this.channels.find(c => c.id == v.channelId);
        return (account.name + v.title).toLowerCase().indexOf(this.filterText.toLowerCase()) != -1
      });
    }
    this.processVideos();
  }

  private processVideos() {
    this.accountVideos = new Map();

    this.accountVideos.set(this.toolbar.lackingAccounts, []);
    this.toolbar.accounts.forEach(account => this.accountVideos.set(account, []));

    this.filteredVideos.forEach(video => {
      const channel = this.getChannelByChannelId(video.channelId);
      if (!channel) return;
      let account = this.toolbar.accounts.find(a => a.name == channel.account);
      if (!account) account = this.toolbar.lackingAccounts;
      this.accountVideos.get(account).push(video);
    });

  }

  getVideosForActiveAccount(): Video[] {
    if (this.toolbar.allAccountsSelected()) {
      return this.filteredVideos;
    }
    return this.accountVideos.get(this.toolbar.selectedAccount);
  }

  getChannelByChannelId(channelId: string) {
    return this.channels.find(c => c.id == channelId);
  }

  formattedDate(date: string): string {
    return FormatUtil.formatDate(date);
  }
  
  toolbarAccountChanged() {
    this.paginator.firstPage();
  }

  getYoutubeThumbnail(videoId: string) {
    return this.youtubeService.getYoutubeThumbnailURL(videoId);
  }

  getYoutubeVideoURL(videoId: string) {
    return this.youtubeService.getYoutubeVideoURL(videoId);
  }
}
