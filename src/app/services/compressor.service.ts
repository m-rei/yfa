import { Injectable } from '@angular/core';

declare var require: any;
const pako = require('pako');

@Injectable({
  providedIn: 'root'
})
export class CompressorService {

  constructor() {
    console.log(this.compress('ABC'));
    console.log(this.decompress(this.compress('ABC')));
  }

  // TODO this does not compress at all for whatever reason... the 33% size increase due to b64 may be impeding any gains, who knows...
  public compress(str: string): string {
    return btoa(pako.deflate(str));
  }

  public decompress(compressed: string): string {
    return new TextDecoder().decode(pako.inflate(new Uint8Array(atob(compressed).split(',').map(s => parseInt(s)))));
  }
}
