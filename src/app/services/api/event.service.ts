import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {DataService} from 'src/services/data.services';
import {StorageService} from 'src/app/services/data/storage.service';
import {Observable, throwError} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(
    private navCtrl: NavController,
    private storageService: StorageService,
    private dataService: DataService,
    private router: Router
  ) { }

  getEvents(): Observable<any> {
    return this.dataService.getEvents();
  }

  getEvent(eventId): Observable<any> {
    return this.dataService.getEvent(eventId);
  }

  getEventSkills(eventid): Observable<any> {
    return this.dataService.getEventSkills(eventid);
  }

  getEventsByManager(userid: string): Observable<any> {
    return this.dataService.getEventsByManager(userid);
  }

  getStaffByEvent(eventid: string): Observable<any> {
    return this.dataService.getStaffByEvent(eventid);
  }

  getEventByStaff(staffid, eventid): Observable<any> {
    return this.dataService.getEventByStaff(staffid, eventid);
  }

  getEventsByStaff(userid: string): Observable<any> {
    return this.dataService.getEventsByStaff(userid);
  }

  getClientAdmin(adminid): Observable<any> {
    return this.dataService.getClientAdmin(adminid);
  }

  updateEventStatus(eventId: string, obj): Observable<any> {
    return this.dataService.updateEventStatus(eventId, obj);
  }

  updateEventStaff(eventStaffId: string, obj): Observable<any> {
    return this.dataService.updateEventStaffStatus(eventStaffId, obj);
  }

  // signIn(username: string, password: string): Observable<any> {
  //   let authObj = {
  //     username: username,
  //     password: password
  //   };
  //   return this.dataService.login(authObj);
  // }
  //
  // async signOut() {
  //   await this.storageService.clear();
  //   this.navCtrl.setDirection('root');
  //   this.router.navigateByUrl('/signin');
  // }
}
