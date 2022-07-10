import { Component, OnInit } from '@angular/core';
import { Profile } from 'src/app/model/profile.model';
import { PersistenceService } from 'src/app/services/persistence.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  public profile: Profile;

  constructor(
    private persistenceService: PersistenceService
    ) { 
  }

  ngOnInit(): void {
    this.profile = this.persistenceService.loadProfile();
  }

  save() {
    this.persistenceService.saveProfile(this.profile);
  }

}
