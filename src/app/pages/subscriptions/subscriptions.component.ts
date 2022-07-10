import { ChannelService } from './../../services/channel.service';
import { Component, OnInit, PACKAGE_ROOT_URL, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/app/model/channel.model';
import { YoutubeService } from 'src/app/services/youtube.service';
import { environment } from 'src/environments/environment';
import { SNACKBAR_DEFAULT_CONFIG } from 'src/app/util/defaults';
import { AccountToolbarComponent } from 'src/app/account-toolbar/account-toolbar.component';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.sass']
})
export class SubscriptionsComponent implements OnInit {

  @ViewChild(AccountToolbarComponent, {static: true}) accountToolbar: AccountToolbarComponent;

  channels: Channel[] = [];
  channelURL: string = '';

  constructor(
    private channelService: ChannelService,
    private youtubeService: YoutubeService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.channels = this.channelService.loadChannels();

    // TODO remove me#
    /*
    const jsonData = JSON.stringify(this.channels);
    console.log('JSON data in kb: ' + jsonData.length/1024);
    const csvData = this.channels
      .map(v => v.account + '|' + v.id + '|' + v.name)
      .join('|');
    console.log('CSV data in kb: ' + csvData.length/1024);
    
    const output = this.compress(csvData);
    console.log('CSV compressed in kb: ' + output.length/1024);
    console.log(this.decompress(output).length);
    console.log(csvData.length);
    console.log(this.decompress(output) === csvData);
    */
  }

  getChannelUrlExample() {
    return environment.channelURLExample;
  }

  hasChannels(): boolean {
    if (!this.channels || this.channels.length == 0) return false;

    let selectedChannels;
    
    if (this.accountToolbar.allAccountsSelected()) {
      selectedChannels = this.channels;
    } else if (this.accountToolbar.lackingAccountsSelected()) {
      selectedChannels = this.channels.filter(c => !c.account);
    } else {
      selectedChannels = this.channels.filter(c => c.account == this.accountToolbar.selectedAccount.name);
    }

    return selectedChannels.length > 0;
  }

  canRenderChannel(channel: Channel): boolean {
    if (this.accountToolbar.allAccountsSelected()) return true;
    if (this.accountToolbar.lackingAccountsSelected() && !channel.account) return true;
    return this.accountToolbar.selectedAccount.name == channel.account;
  }

  redirectToAccount(channel: Channel) {
    this.youtubeService.redirectToChannel(channel.id);
  }

  addChannel() {
    const successHandler = (channelID: string) => {
      const account = this.accountToolbar.allAccountsSelected() || this.accountToolbar.lackingAccountsSelected() ?
        '' : this.accountToolbar.selectedAccount.name;
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
      this.channelService.saveChannels(this.channels);
    }
    const errorHandlerFeeds = (errorMsg: string) => {
      this.snackbar.open(errorMsg, 'close', SNACKBAR_DEFAULT_CONFIG);
    }
    this.youtubeService.getFeedsByChannelID(channelID, successHandlerFeeds, errorHandlerFeeds);
  }

  channelAccountChanged() {
    this.channelService.saveChannels(this.channels);
  }

  deleteChannel(idx: number) {
    this.channels.splice(idx, 1);
    this.channelService.saveChannels(this.channels);
  }
}
