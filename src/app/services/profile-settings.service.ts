import { ProfileModel } from './../model/profile.model';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileSettingsService {
  private static LS_PROFILE_KEY = 'profile';

  profileChanged: EventEmitter<ProfileModel> = new EventEmitter();

  constructor() {}

  public loadSettings(): ProfileModel {
    let profile = localStorage.getItem(ProfileSettingsService.LS_PROFILE_KEY);
    if (!profile) {
      return new ProfileModel(null, null);
    }
    return JSON.parse(profile);
  }

  public saveSettings(profile: ProfileModel) {
    const profileStringified = JSON.stringify(profile);
    localStorage.setItem(ProfileSettingsService.LS_PROFILE_KEY, profileStringified);
    this.profileChanged.next(JSON.parse(profileStringified));
  }
}
