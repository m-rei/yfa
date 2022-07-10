import { Component, OnInit } from '@angular/core';
import { Profile } from 'src/app/model/profile.model';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  public profile: Profile;

  constructor(
    private profileService: ProfileService
    ) { 
  }

  ngOnInit(): void {
    this.profile = this.profileService.loadProfile();
  }

  save() {
    this.profileService.saveProfile(this.profile);
  }

}
