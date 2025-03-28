import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { LogService } from 'src/services/log.services';
import { StorageService } from 'src/app/services/data/storage.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from '@angular/router';
import { MAPSTYLE } from 'src/config/mapstyle.config';

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.page.html',
  styleUrls: ['./event-map.page.scss'],
})
export class EventMapPage implements OnInit {

  map: any;
  styles: any = MAPSTYLE;
  event: any;

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  zone = new NgZone({ enableLongStackTrace: false });

  loading: boolean = false;
  zoom:number = 13;

  busIconURL = {
    url: 'assets/bus.png',
    // url: 'https://www.freeiconspng.com/thumbs/bus-png/bus-png-4.png',
    scaledSize: {
        width: 30,
        height: 20
    }
  };
  eventIconURL = {
    url: 'assets/pin.png',
    // url: 'https://png.monster/wp-content/uploads/2021/06/png.monster-10-476x700.png',
    scaledSize: {
        width: 35,
        height: 35
    }
  };

  constructor(
    private logging: LogService,
    private geolocation: Geolocation,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.loadEvent();
  }

  async loadEvent(){
    this.loading = true;
    let aux: string = <string>await this.storageService.get('selected.event', '');
    this.event = JSON.parse(aux);
    this.loading = false;
    this.adjustZoomMarker();
  }

  adjustZoomMarker(){
    this.busIconURL = {
      url: 'assets/bus.png',
      // url: 'https://www.freeiconspng.com/thumbs/bus-png/bus-png-4.png',
      scaledSize: {
          width: 30,
          height: 20
      }
    };
    this.eventIconURL = {
      url: 'assets/pin.png',
      // url: 'https://png.monster/wp-content/uploads/2021/06/png.monster-10-476x700.png',
      scaledSize: {
          width: 35,
          height: 35
      }
    };
  }

}
