import { YoutubeService } from 'src/app/services/youtube.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/app/model/channel.model';
import { environment } from 'src/environments/environment';
import { SNACKBAR_DEFAULT_CONFIG } from 'src/app/util/defaults';
import { AccountToolbarComponent } from 'src/app/account-toolbar/account-toolbar.component';
import { PersistenceService } from 'src/app/services/persistence.service';
import { Account } from 'src/app/model/account.model';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.sass']
})
export class SubscriptionsComponent implements OnInit, AfterViewInit {

  @ViewChild(AccountToolbarComponent, {static: true}) toolbar: AccountToolbarComponent;
  @ViewChild('p', {static: true}) paginator: MatPaginator;

  channels: Channel[] = [];
  channelURL: string = '';

  filterText: string = '';
  filteredChannels: Channel[] = [];

  accountChannels: Map<Account, Channel[]> = new Map();

  constructor(
    private persistenceService: PersistenceService,
    private youtubeService: YoutubeService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.channels = this.persistenceService.loadChannels();
  }

  ngAfterViewInit(): void {
    this.doFilter();
  }

  getChannelUrlExample() {
    return environment.channelURLExample;
  }

  redirectToAccount(channel: Channel) {
    this.youtubeService.redirectToChannel(channel.id);
  }

  addChannel() {
    const successHandler = (channelID: string) => {
      const account = this.toolbar.allAccountsSelected() || this.toolbar.lackingAccountsSelected() ?
        '' : this.toolbar.selectedAccount.name;
      this.addChannelByID(account, channelID);
    }
    const errorHandler = (errorMsg: string) => {
      this.snackbar.open(errorMsg, 'close', SNACKBAR_DEFAULT_CONFIG);
    }
    this.youtubeService.extractChannelID(this.channelURL, successHandler, errorHandler);
    this.channelURL = '';
  }

  private addChannelByID(accountName: string, channelID: string) {
    let existingChannel = this.channels
      .find(c => c.id == channelID);
    if (existingChannel) {
      this.snackbar.open(`Channel "${existingChannel.name}" already exists!`, 'close', SNACKBAR_DEFAULT_CONFIG);
      return;
    }
    const successHandlerFeeds = (xmlFeeds: string) => {
      const author = this.youtubeService.getAuthorFromFeed(xmlFeeds);
      this.channels.push(new Channel(accountName, channelID, author));
      this.doFilter();
      this.persistenceService.saveChannels(this.channels);
    }
    const errorHandlerFeeds = (errorMsg: string) => {
      this.snackbar.open(errorMsg, 'close', SNACKBAR_DEFAULT_CONFIG);
    }
    this.youtubeService.getFeedsByChannelID(channelID, successHandlerFeeds, errorHandlerFeeds);
  }

  channelAccountChanged() {
    this.persistenceService.saveChannels(this.channels);
  }

  deleteChannel(idx: number) {
    idx = this.channels.indexOf(this.filteredChannels[idx]);
    this.channels.splice(idx, 1);
    this.persistenceService.saveChannels(this.channels);
    this.doFilter();
  }

  filterChanged() {
    this.doFilter();
  }

  doFilter() {
    if (!this.filterText) {
      this.filteredChannels = this.channels;
    } {
      this.filteredChannels = this.channels.filter(c => (c.account + c.name).toLowerCase().indexOf(this.filterText.toLowerCase()) != -1);
    }
    this.organizeChannelMap();
  }

  organizeChannelMap() {
    let newAccountChannels: Map<Account, Channel[]> = new Map();

    newAccountChannels.set(this.toolbar.lackingAccounts, []);
    this.toolbar.accounts.forEach(account => newAccountChannels.set(account, []));

    this.filteredChannels.forEach(channel => {
      let account = this.toolbar.accounts.find(a => a.name == channel.account);
      if (!account) account = this.toolbar.lackingAccounts;
      newAccountChannels.get(account).push(channel);
    })

    this.accountChannels = newAccountChannels;
    this.paginator.firstPage();
  }

  getChannelsForActiveAccount(): Channel[] {
    if (this.toolbar.allAccountsSelected()) {
      return this.filteredChannels;
    }
    return this.accountChannels.get(this.toolbar.selectedAccount);
  }

  toolbarAccountChanged() {
    this.paginator.firstPage();
  }
}
