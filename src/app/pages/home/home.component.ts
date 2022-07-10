import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/app/model/channel.model';
import { ChannelService } from 'src/app/services/channel.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  channels: Channel[] = [];

  constructor(
    private channelService: ChannelService,
    ) { }

  ngOnInit(): void {
    this.channels = this.channelService.loadChannels();
  }

}
