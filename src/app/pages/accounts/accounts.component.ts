import { MatSnackBar } from '@angular/material/snack-bar';
import { PersistenceService } from '../../services/persistence.service';
import { Component, OnInit } from '@angular/core';
import { Account } from 'src/app/model/account.model';
import { SNACKBAR_DEFAULT_CONFIG } from 'src/app/util/defaults';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.sass']
})
export class AccountsComponent implements OnInit {

  accounts: Account[] = [];
  accountName: string = '';

  constructor(
    private persistenceService: PersistenceService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.accounts = this.persistenceService.loadAccounts();
  }

  addAccount() {
    if (!this.accountName) return;
    this.accountName = this.accountName.trim();
    if (!this.accountName) return;
    if (this.accounts.find(a => a.name == this.accountName)) {
      this.snackbar.open("Account already exists", "close", SNACKBAR_DEFAULT_CONFIG)
      return;
    }
    this.accounts.push(new Account(this.accountName, 0));
    this.persistenceService.saveAccounts(this.accounts);
    this.accountName = '';
  }

  deleteAccount(idx: number) {
    this.accounts.splice(idx, 1);
    this.persistenceService.saveAccounts(this.accounts);
  }

  orderChanged() {
    this.accounts.sort((a,b) => a.order - b.order);
    this.persistenceService.saveAccounts(this.accounts);
  }
  
  nameChanged() {
    this.persistenceService.saveAccounts(this.accounts);
    this.persistenceService.adjustOrphanedChannels(this.accounts);
  }
}
