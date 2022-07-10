import { BackupComponent } from './pages/backup/backup.component';
import { HomeComponent } from './pages/home/home.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModulesModule } from './common/app-common-modules.module';
import { MatIconRegistry } from '@angular/material/icon';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/profile/settings/settings.component';
import { AccountToolbarComponent } from './account-toolbar/account-toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AccountsComponent,
    SubscriptionsComponent,
    ProfileComponent,
    SettingsComponent,
    BackupComponent,
    AccountToolbarComponent
  ],
  imports: [
    AppCommonModulesModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [ MatIconRegistry ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }