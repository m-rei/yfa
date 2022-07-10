import { Injectable } from '@angular/core';
import { Video } from '../model/video.model';
import { FormatUtil } from '../util/format';
import { CompressorService } from './compressor.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private static LS_VIDEOS_KEY = 'videos';

  constructor(private compressorService: CompressorService) { }

  public loadVideos(): Video[] {
    let videos = localStorage.getItem(VideoService.LS_VIDEOS_KEY);
    if (!videos) {
      return [];
    }
    let ret: any = [];
    const data = videos.split('|');
    for (let i = 0; i < data.length; i+=4) {
      ret.push(new Video(data[i+0], data[i+1], FormatUtil.unescape(data[i+2], '|'), data[i+3]));
    }
    return ret;
  }

  public saveVideos(videos: Video[]) {
    const data = videos
      .map(v => v.channelId + '|' + v.videoId + '|' + FormatUtil.escape(v.title,'|') + '|' + v.date)
      .join('|');
    localStorage.setItem(VideoService.LS_VIDEOS_KEY, data);
  }
}
