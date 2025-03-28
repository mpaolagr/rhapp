import { Injectable } from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import {Platform} from '@ionic/angular';

import {LogService} from 'src/services/log.services';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private logging: LogService,
    private platform: Platform,
    private storage: Storage
  ) {
  }

  public create(){
    try{
      this.storage.create();
      this.logging.print(false, 'storage', 'created', undefined);
    }catch(e){
      this.logging.print(true, 'storage', '', e);
    }
  }

  public clear() {
    return new Promise(resolve => {
      if( this.platform.is("cordova")){
        this.storage.clear();
        this.logging.print(false, 'storage', 'cordova cleared', undefined);
        resolve(true);
      }else{
        localStorage.clear();
        this.logging.print(false, 'storage', 'localStorage cleared', undefined);
        resolve(true);
      }
    });
  }

  public set(key: string, value: any){
    if( this.platform.is("cordova")){
      this.storage.set(key, value);
      this.logging.print(false, 'storage', 'cordova set for ' + key + ' with value ' + value, undefined);
    }else{
      localStorage.setItem(key, value);
      this.logging.print(false, 'storage', 'localStorage set for ' + key + ' with value ' + value, undefined);
    }
  }

  public get(key: string, defval: string) {
    return new Promise(resolve => {
      if( this.platform.is("cordova")){
        this.storage.get(key).then((val) => {
          if(val){
            this.logging.print(false, 'storage', 'cordova get for ' + key + ' with defval ' + defval + ' is value ' + val, undefined);
            resolve(val);
          }else{
            this.logging.print(false, 'storage', 'cordova get for ' + key + ' with defval ' + defval + ' (value is undefined) ', undefined);
            resolve(defval);
          }
        });
      }else{
        let val = localStorage.getItem(key);
        if(val){
          // this.logging.print(false, 'storage', 'localStorage get for ' + key + ' with defval ' + defval + ' is value ' + val, undefined);
          resolve(val);
        }else{
          // this.logging.print(false, 'storage', 'localStorage get for ' + key + ' with defval ' + defval + ' (value is undefined) ', undefined);
          resolve(defval);
        }
      }
    });
  }

}
