import { Component, OnInit } from '@angular/core';
import { ProfileModel } from 'src/app/model/profile.model';
import { ProfileSettingsService } from 'src/app/services/profile-settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  public profile: ProfileModel;

  constructor(
    private profileSettingsService: ProfileSettingsService
    ) { 
  }

  ngOnInit(): void {
    this.profile = this.profileSettingsService.loadSettings();
  }

  save() {
    this.profileSettingsService.saveSettings(this.profile);
  }

}
