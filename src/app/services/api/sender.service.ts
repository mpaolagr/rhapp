import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {DataService} from 'src/services/data.services';
import {StorageService} from 'src/app/services/data/storage.service';
import {Observable, throwError} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SenderService {

  constructor(
    private navCtrl: NavController,
    private storageService: StorageService,
    private dataService: DataService,
    private router: Router
  ) { }

  notifyUser(userid, message): Observable<any> {
    const encodedmessage = ('deviceid=' + userid + '&message=' + message);
    return this.dataService.sendPush(encodedmessage);
  }

  notifyEvent(eventid, status, message): Observable<any> {
    const encodedmessage = ('status=' + status + '&eventid=' + eventid + '&message=' + message);
    return this.dataService.sendPush(encodedmessage);
  }

  notifyAll(message): Observable<any> {
    const encodedmessage = ('status=ALL&message=' + message);
    return this.dataService.sendPush(encodedmessage);
  }

  programUser(staffId, reminderDate, confirmation): Observable<any> {
    const encodedmessage = ('reminder=' + reminderDate + '&deviceid=' + staffId + '&message=' + confirmation);
    return this.dataService.sendPush(encodedmessage);
  }
}
