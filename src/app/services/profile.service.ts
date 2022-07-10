import { Profile } from '../model/profile.model';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private static LS_PROFILE_KEY = 'profile';

  profileChanged: EventEmitter<Profile> = new EventEmitter();

  constructor() {}

  public loadProfile(): Profile {
    let profile = localStorage.getItem(ProfileService.LS_PROFILE_KEY);
    if (!profile) {
      return new Profile(null, null);
    }
    return JSON.parse(profile);
  }

  public saveProfile(profile: Profile) {
    const profileStringified = JSON.stringify(profile);
    localStorage.setItem(ProfileService.LS_PROFILE_KEY, profileStringified);
    this.profileChanged.next(JSON.parse(profileStringified));
  }
}
