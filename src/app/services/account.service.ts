import { Injectable } from '@angular/core';
import { Account } from '../model/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private static LS_ACCOUNTS_KEY = 'accounts';

  constructor() { }

  public loadAccounts(): Account[] {
    let accounts = localStorage.getItem(AccountService.LS_ACCOUNTS_KEY);
    if (!accounts) {
      return [];
    }
    return (JSON.parse(accounts) as Account[]).sort((a,b) => a.order - b.order);
  }

  public saveAccounts(accounts: Account[]) {
    const accountsStringified = JSON.stringify(accounts);
    localStorage.setItem(AccountService.LS_ACCOUNTS_KEY, accountsStringified);
  }
}
