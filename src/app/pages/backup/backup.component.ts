import { YoutubeService } from 'src/app/services/youtube.service';
import { SNACKBAR_DEFAULT_CONFIG } from './../../util/defaults';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersistenceService } from 'src/app/services/persistence.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Account } from 'src/app/model/account.model';
import { Channel } from 'src/app/model/channel.model';
import { zip } from 'rxjs';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.sass']
})
export class BackupComponent implements OnInit {

  @ViewChild('exportNode') exportNode: ElementRef;

  accounts: Account[] = [];
  allAccounts: Account = new Account("*", 0);
  lackingAccounts: Account = new Account("-", 0);
  importAccount: Account = this.allAccounts;
  exportAccount: Account = this.allAccounts;
  
  channels: Channel[] = [];

  importing: boolean = false;
  importOpmlFilename: string = null;
  importOpmlContent: string = null;

  constructor(
    private persistenceService: PersistenceService,
    private youtubeService: YoutubeService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.accounts = this.persistenceService.loadAccounts();
    this.channels = this.persistenceService.loadChannels();
  }

  onFileSeleced(event: any) {
    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.importOpmlFilename = event.target.value;
        this.importOpmlContent = e.target.result;
      }
      reader.readAsText(event.target.files[0]);
    } else {
      this.snackbar.open('Can not instantiate FileReader()', 'close', SNACKBAR_DEFAULT_CONFIG);
    }
  }

  importOPMLFile() {
    this.importing = true;
    const xmlDoc = new DOMParser().parseFromString(this.importOpmlContent, "text/xml");
    const channelNodes = xmlDoc.querySelectorAll('opml body outline outline');
    const account = this.importAccount == this.allAccounts ? null : this.importAccount.name;
    let promises: any[] = [];
    channelNodes.forEach(channelNode => {
      let channel = new Channel(account, null, channelNode.getAttribute('title'));
      const url = channelNode.getAttribute('xmlUrl');
      const channelIDIdx = url.indexOf('channel_id=');
      if (channelIDIdx != -1) {
        channel.id = url.substring(channelIDIdx + 11);
        if (!this.channels.find(c => c.id == channel.id)) {
          this.channels.push(channel);
        }
      } else {
        const userIdx = url.indexOf('user=');
        if (userIdx != -1) {
          const userName = url.substring(userIdx + 5);
          const successHandlerFeeds = (xmlFeeds: string) => {
            channel.id = this.youtubeService.getChannelIdFromFeed(xmlFeeds);
            if (!this.channels.find(c => c.id == channel.id)) {
              this.channels.push(channel);
            }
          }
          promises.push(
            this.youtubeService.getFeedsByUser(userName, successHandlerFeeds)
          );
        }
      }
    });
    const finishedHandler = () => {
      this.persistenceService.saveChannels(this.channels);
      this.snackbar.open("finished importing!", 'close', SNACKBAR_DEFAULT_CONFIG);
      this.importing = false;
    }
    if (promises.length == 0) {
      finishedHandler();
    } else {
      zip(...promises).subscribe(finishedHandler);
    }
  }

  exportOPMLFile() {
    this.exportNode.nativeElement.href = URL.createObjectURL(new Blob([this.buildOPMLFile()]));
    this.exportNode.nativeElement.download = 'subscription_manager';
    this.exportNode.nativeElement.click();
  }

  private buildOPMLFile(): string {
    let selectedChannels;
    if (this.exportAccount == this.allAccounts) {
      selectedChannels = this.channels;
    } else if (this.exportAccount == this.lackingAccounts) {
      selectedChannels = this.channels.filter(c => !c.account)
    } else {
      selectedChannels = this.channels.filter(c => c.account == this.exportAccount.name)
    }
    var opmlFile = `<opml version="1.1">
\t<body>
\t\t<outline text="YouTube Subscriptions" title="YouTube Subscriptions">`;
  for (let channel of selectedChannels) {
    let n = channel.name.replace("#", "%23").replace("&", "&amp;");
    opmlFile += `\n\t\t\t<outline text="${n}" title="${n}" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}" />`;
  }
  opmlFile += `
\t\t</outline>
\t</body>
</opml>`;
    
    return opmlFile;
  }

}
