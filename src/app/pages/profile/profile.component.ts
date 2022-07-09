import { ProfileSettingsService } from 'src/app/services/profile-settings.service';
import { ProfileModel } from 'src/app/model/profile.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: ProfileModel;
  profileChangeSubscription: Subscription;

  constructor(
    private profileSettingsService: ProfileSettingsService,
  ) { }

  ngOnInit(): void {
    this.profile = this.profileSettingsService.loadSettings();
    this.profileChangeSubscription = this.profileSettingsService.profileChanged.subscribe(profile => {
      this.profile = profile;
    })
  }

  ngOnDestroy(): void {
    this.profileChangeSubscription.unsubscribe();
  }

  hasProfileData(): boolean {
    return this.profile && !!this.profile.name && !!this.profile.avatar;
  }

}
