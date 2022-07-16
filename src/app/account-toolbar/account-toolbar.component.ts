import { FormatUtil } from 'src/app/util/format';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { Account } from '../model/account.model';
import { Channel } from '../model/channel.model';
import { PersistenceService } from '../services/persistence.service';

@Component({
  selector: 'app-account-toolbar',
  templateUrl: './account-toolbar.component.html',
  styleUrls: ['./account-toolbar.component.sass']
})
export class AccountToolbarComponent implements OnInit {

  @Output() onAccountClick = new EventEmitter<Account>();

  @Input() showChannelCounts: boolean = false;
  @Input() channels: Channel[] = [];

  @Input() renderSyncButton: boolean = false;
  @Output() onSyncClick = new EventEmitter<any>();
  syncing: boolean = false;
  progress100 = 0;
  lastSync: moment.Moment = null

  accounts: Account[] = [];
  allAccounts: Account = new Account("*", 0);
  lackingAccounts: Account = new Account("-", 0);
  selectedAccount: Account = this.allAccounts;
  
  constructor(
    private persistenceService: PersistenceService,
  ) {}

  ngOnInit(): void {
    this.accounts = this.persistenceService.loadAccounts();
    this.lastSync = this.persistenceService.loadLastSync();
  }

  selectAllAccounts() {
    this.selectedAccount = this.allAccounts;
  }

  allAccountsSelected() {
    return this.selectedAccount == this.allAccounts;
  }
  
  selectLackingAccounts() {
    this.selectedAccount = this.lackingAccounts;
  }

  lackingAccountsSelected() {
    return this.selectedAccount == this.lackingAccounts;
  }

  selectAccount(account: Account) {
    this.selectedAccount = account;
    this.onAccountClick.next(account);
  }

  getAllAccountsTooltip(): string {
    if (!this.showChannelCounts) return '';
    return ' (' + this.channels.length + ')';
  }
  
  getLackingAccountsTooltip(): string {
    if (!this.showChannelCounts) return '';
    return ' (' + this.channels.filter(c => !c.account).length + ')';
  }
  
  getAccountsTooltip(account: Account): string {
    if (!this.showChannelCounts) return '';
    return ' (' + this.channels.filter(c => c.account == account.name).length + ')';
  }

  sync() {
    this.lastSync = moment();
    this.persistenceService.saveLastSync(this.lastSync);
    this.syncing = true;
    this.progress100 = 0;
    this.onSyncClick.next(null);
  }

  getLastSyncTooltip() {
    let ret;
    if (this.lastSync?.isValid()) {
      ret = FormatUtil.formatDate(this.lastSync.toString());
    } else {
      ret = 'never';
    }
    return 'Last sync: ' + ret;
  }

  formattedProgress(): string {
    return '' + Math.round(this.progress100*100)/100;
  }
}
