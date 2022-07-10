import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/model/profile.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: Profile;
  profileChangeSubscription: Subscription;

  constructor(
    private profileService: ProfileService,
  ) { }

  ngOnInit(): void {
    this.profile = this.profileService.loadProfile();
    this.profileChangeSubscription = this.profileService.profileChanged.subscribe(profile => {
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
