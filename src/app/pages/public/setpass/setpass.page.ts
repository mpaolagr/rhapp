import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/api/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ROL_STAFF } from 'src/config/rhapp.config';
import { Router } from '@angular/router';

//my plugins
import {TranslateService} from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import {StorageService} from 'src/app/services/data/storage.service';
import {LogService} from 'src/services/log.services';

@Component({
  selector: 'app-setpass',
  templateUrl: './setpass.page.html',
  styleUrls: ['./setpass.page.scss'],
})
export class SetpassPage implements OnInit {

  current_year: number = new Date().getFullYear();

  signup_form: FormGroup;

  myUserId: string = '';
  myemail: string = '';
  newPass: string = '';
  repeatPass: string = '';

  constructor(
    private logging: LogService,
    private storageService: StorageService,
    private translate: TranslateService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router
  ) {
    this.init();
  }

  async init(){
    this.myemail = <string>await this.storageService.get('register.approved', '');
    this.myUserId = <string>await this.storageService.get('register.userid', '');
    let lang: string = <string>await this.storageService.get('config.language', 'en');
    this.translate.use(lang);
  }

  ngOnInit() {
    this.signup_form = this.formBuilder.group({
      myemail: ['', Validators.compose([Validators.email, Validators.required])],
      newPass: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      repeatPass: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  // Sign up
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
        //validate saved pass
        loading.dismiss();
        this.signIn();
      },
      (error) => {
        loading.dismiss();
        this.toastService.presentToast('Error!', 'The pass could not be saved, please try again', 'top', 'danger', 3000);
      });
  }

  async signIn() {
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Signing in...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    await this.authService.signIn(this.myemail, this.newPass)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'signIn', resp, undefined);
        loading.dismiss();
        this.goToHome(resp);
      },
      (error) => {
        loading.dismiss();
        this.toastService.presentToast('Error!', 'The pass could not be saved, please try again', 'top', 'danger', 3000);
      });
  }

  async goToHome(auth){
    let myrol = this.getRol(auth);
    this.toastService.presentToast('RH Staffing', 'Bienvenido ' + auth.account.name + '!', 'top', 'success', 2000);
    this.storageService.set('auth.profile.rol', myrol);
    this.storageService.set('auth.profile', JSON.stringify(auth));
    await this.router.navigate(['/home']);
  }

  getRol(auth){
    let isStaff = auth && auth.roles && auth.roles.filter( item => item.name == ROL_STAFF)[0];
    return (isStaff ? auth.roles[0].name : '');
  }

}
