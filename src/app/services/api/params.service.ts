import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {DataService} from 'src/services/data.services';
import {StorageService} from 'src/app/services/data/storage.service';
import {Observable, throwError} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ParamsService {

  constructor(
    private navCtrl: NavController,
    private storageService: StorageService,
    private dataService: DataService,
    private router: Router
  ) { }

  getAll(): Observable<any> {
    return this.dataService.getParams();
  }

  get(key: string): Observable<any> {
    return this.dataService.getParamsByKey(key);
  }
}
