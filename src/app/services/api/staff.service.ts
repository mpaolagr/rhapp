import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {DataService} from 'src/services/data.services';
import {StorageService} from 'src/app/services/data/storage.service';
import {Observable, throwError} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(
    private navCtrl: NavController,
    private storageService: StorageService,
    private dataService: DataService,
    private router: Router
  ) { }

  getList(): Observable<any> {
    return this.dataService.staffList();
  }

  getInfo(userid: string): Observable<any> {
    return this.dataService.staffDetails(userid);
  }

  staffSkills(): Observable<any> {
    return this.dataService.staffSkills();
  }

  getAdditional(userid: string): Observable<any> {
    return this.dataService.staffAdditionals(userid);
  }

  updateSkills(userid: string, skillid: number, url: string): Observable<any> {
    // let objAdditional = {
    //   staffId: userid,
    //   parameterId: additionalid,
    //   fileUrl: url,
    //   status: 'ENABLED'
    // };
    let objSkill = {
      staffId: userid,
      fileUrl: url,
      parameterId: skillid,
      status: 'ENABLED'
    };
    // this.dataService.addSkill(objAdditional);
    return this.dataService.addSkill(objSkill);
  }

  enable(accept, item){
    let objUpdate = {
      status: (accept ? 'ENABLED' : 'DISABLED')
    };
    return this.dataService.updateStaff(item.id, objUpdate);
  }
}
