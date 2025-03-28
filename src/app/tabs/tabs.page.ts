import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

//my plugins
import {TranslateService} from '@ngx-translate/core';
import {StorageService} from 'src/app/services/data/storage.service';
import {AuthService} from 'src/app/services/api/auth.service';
import {ROL_SUPERADMIN, ROL_ADMIN, ROL_MANAGER, ROL_STAFF} from 'src/config/rhapp.config';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isManager: boolean = false;
  isStaff: boolean = false;

  constructor(
    private translate: TranslateService,
    private actionSheetController: ActionSheetController,
    private storageService: StorageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.init();
  }

  async init(){
    let profile: string = <string>await this.storageService.get('auth.profile.rol', '');
    switch(profile){
      case ROL_SUPERADMIN:{ this.isSuperAdmin = true; break; }
      case ROL_ADMIN:{ this.isAdmin = true; break; }
      case ROL_MANAGER:{ this.isManager = true; break; }
      case ROL_STAFF:{ this.isStaff = true; break; }
      default: {
        this.authService.signOut();
      }
    }
  }

  // async selectAction() {
  //
  //   const actionSheet = await this.actionSheetController.create({
  //     header: 'Choose an action',
  //     cssClass: 'custom-action-sheet',
  //     buttons: [
  //       {
  //         text: 'Add account',
  //         icon: 'wallet',
  //         handler: () => {
  //           // Put in logic ...
  //         }
  //       },
  //       {
  //         text: 'Add transaction',
  //         icon: 'code-outline',
  //         handler: () => {
  //           // Put in logic ...
  //         }
  //       },
  //       {
  //         text: 'Set budget',
  //         icon: 'calculator',
  //         handler: () => {
  //           // Put in logic ...
  //         }
  //       }, {
  //         text: 'Cancel',
  //         icon: 'close',
  //         role: 'cancel'
  //       }]
  //   });
  //   await actionSheet.present();
  // }
}
