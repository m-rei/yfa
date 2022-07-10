import { Component, Input, OnInit } from '@angular/core';
import { Account } from '../model/account.model';
import { Channel } from '../model/channel.model';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-account-toolbar',
  templateUrl: './account-toolbar.component.html',
  styleUrls: ['./account-toolbar.component.sass']
})
export class AccountToolbarComponent implements OnInit {

  @Input() showChannelCounts: boolean = false;
  @Input() channels: Channel[] = [];

  accounts: Account[] = [];
  allAccounts: Account = new Account("*", 0);
  lackingAccounts: Account = new Account("-", 0);
  selectedAccount: Account = this.allAccounts;
  
  constructor(
    private accountService: AccountService,
  ) {}

  ngOnInit(): void {
    this.accounts = this.accountService.loadAccounts();
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

}
