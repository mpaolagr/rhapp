import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {DataService} from 'src/services/data.services';
import {StorageService} from 'src/app/services/data/storage.service';
import {Observable, throwError} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private navCtrl: NavController,
    private storageService: StorageService,
    private dataService: DataService,
    private router: Router
  ) { }

  getList(): Observable<any> {
    return this.dataService.getNotifications();
  }

  getListByEvent(eventid): Observable<any> {
    return this.dataService.getNotificationsByEvent(eventid);
  }

  send(message): Observable<any> {
    return this.dataService.createMessage(message);
  }
}
