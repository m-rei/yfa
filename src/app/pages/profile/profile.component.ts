import { Profile } from 'src/app/model/profile.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PersistenceService } from 'src/app/services/persistence.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: Profile;
  profileChangeSubscription: Subscription;

  constructor(
    private persistenceService: PersistenceService,
  ) { }

  ngOnInit(): void {
    this.profile = this.persistenceService.loadProfile();
    this.profileChangeSubscription = this.persistenceService.profileChanged.subscribe(profile => {
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
