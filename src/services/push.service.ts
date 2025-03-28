import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { LogService } from 'src/services/log.services';

@Injectable()
export class PushService{

    constructor(
      private logging: LogService,
      private oneSignal: OneSignal,
      private http: HttpClient,
      private platform: Platform
    ){
    }

    init_notifications(){
        if(this.platform.is('cordova')){
            try {
                this.startOneSignal();
            } catch(e) {
                this.logging.print(true, 'init_notifications', '', e);
            }
        }else{
            this.logging.print(false, 'init_notifications', 'navegador omitido', undefined);
        }
    }

    startOneSignal(){
      new Promise ( (resolve, reject) => {
        this.oneSignal.setLogLevel({logLevel: 6, visualLevel: 0});
        this.oneSignal.startInit('6a375a39-b151-480f-aacd-722f33c2b28d', '960907317163');
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
        this.oneSignal.handleNotificationReceived().subscribe(() => {
            this.logging.print(false, 'handleNotificationReceived', 'Notificación recibida', undefined);
        });
        this.oneSignal.handleNotificationOpened().subscribe(() => {
          this.logging.print(false, 'handleNotificationReceived', 'Notificación abierta', undefined);
        });
        this.oneSignal.endInit();
        this.logging.print(false, 'startOneSignal', 'called to start onesignal endinit', undefined);
      }).catch (error =>{
        this.logging.print(true, 'startOneSignal', '', error);
      });
    }

    setTag(akey: string, avalue: string){
      try{
        if(this.platform.is('cordova')){
          new Promise ( (resolve, reject) => {
            this.oneSignal.deleteTag(akey);
            this.oneSignal.sendTag(akey, avalue);
            this.logging.print(false, 'setTag', 'Tag sent!', undefined);
          }).catch (error =>{});
        }
      }catch(e){
        this.logging.print(true, 'setTag', '', e);
      }
    }

    setTags(deleteTags: any[], addTags: any[]){
      try{
        if(this.platform.is('cordova')){
          const tagsToAdd = {};
          addTags.forEach((element, index) => {
            tagsToAdd[Object.keys(element)[0]] = element[Object.keys(element)[0]];
          });
          const tagsToDelete = deleteTags.map(a => Object.keys(a)[0]);
          new Promise ( (resolve, reject) => {
            this.oneSignal.deleteTags(tagsToDelete);
            this.oneSignal.sendTags(tagsToAdd);
            this.logging.print(false, 'setTags', 'Tags sent!', undefined);
          }).catch (error =>{});
        }
      }catch(e){
        this.logging.print(true, 'setTags', '', e);
      }
    }

    deleteTags(keyArray){
      if(this.platform.is('cordova')){
        new Promise ( (resolve, reject) => {
          this.oneSignal.deleteTags(keyArray);
          this.logging.print(false, 'deleteTag', 'Tag deleted', undefined);
        }).catch (error =>{
          this.logging.print(true, 'deleteTag', '', error);
        });
      }
    }

    clearTags(){
      if(this.platform.is('cordova')){
        new Promise ( (resolve, reject) => {
          this.oneSignal.getTags().then(function(tags) {
            this.oneSignal.deleteTags(tags);
          });
          this.logging.print(false, 'clearTags', 'Tags cleared', undefined);
        }).catch (error =>{
          this.logging.print(true, 'clearTags', '', error);
        });
      }
    }
}
