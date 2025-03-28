import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/api/auth.service';

//my plugins
import { ROL_STAFF } from 'src/config/rhapp.config';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from 'src/app/services/toast/toast.service';
import {StorageService} from 'src/app/services/data/storage.service';
import {LogService} from 'src/services/log.services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  profile: string = 'admin';
  lang: string = 'en';

  myUserId: string = '';
  myemail: string = '';
  newPass: string = '';
  repeatPass: string = '';

  isStaff: boolean = false;

  //SI ES STAFF OCULTAR EL BOTON DE LOGOUT

  constructor(
    private logging: LogService,
    private toastService: ToastService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private storageService: StorageService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.lang = <string>await this.storageService.get('config.language', 'en');

    let aux = <string>await this.storageService.get('auth.profile', '');
    let objAuth = JSON.parse(aux);
    this.myUserId = objAuth.id;
    this.myemail = objAuth.username;

    let profile:string = <string>await this.storageService.get('auth.profile.rol', '');
    this.isStaff = (profile == ROL_STAFF);
  }

  changeLang(alang){
    this.lang = alang;
    this.translate.use(alang);
    this.storageService.set('config.language', this.lang);
    this.logging.print(false, 'change', 'lang: ' + this.lang, undefined);
  }

  async updatePass() {
    if(this.newPass.length < 8){
      this.toastService.presentToast('Error', 'Please input a valid password (more than 8 characters)', 'top', 'danger', 4000);
      return;
    }
    if(this.repeatPass != this.newPass){
      this.toastService.presentToast('Error', 'Your passwords dont match', 'top', 'danger', 2000);
      return;
    }

    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Password...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    await this.authService.updatePass(this.myUserId, this.newPass)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'updatePass', resp, undefined);
        loading.dismiss();
        this.toastService.presentToast('Saved', 'The new pass was saved', 'top', 'success', 2000);
        this.newPass = '';
        this.repeatPass = '';
      },
      (error) => {
        loading.dismiss();
        this.toastService.presentToast('Error!', 'The new pass could not be saved, please try again', 'top', 'danger', 3000);
      });
  }

  // Sign out
  signOut() {
    this.authService.signOut();
  }

  async clearData(){
    let title: string = 'Are you sure to want to delete your data permanently?';
    let amessage: string = 'Yes, delete it';
    let aclass: string = 'danger';

    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: title,
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: amessage,
          cssClass: aclass,
          handler: async () => {
            alert.dismiss();
            setTimeout(() => {
              this.toastService.presentToast('Sent', 'Your request was received, we will process in the next 7 days', 'top', 'success', 3000);
            }, 1000);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel'
        }
      ]
    });

    await alert.present();
  }

}
