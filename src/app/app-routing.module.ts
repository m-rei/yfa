import { BackupComponent } from './pages/backup/backup.component';
import { SettingsComponent } from './pages/profile/settings/settings.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'accounts', component: AccountsComponent},
  {path: 'subscriptions', component: SubscriptionsComponent},
  {path: 'profile-settings', component: SettingsComponent},
  {path: 'backup', component: BackupComponent},
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
