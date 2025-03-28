import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/api/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import {ROL_SUPERADMIN, ROL_ADMIN, ROL_MANAGER, ROL_STAFF} from 'src/config/rhapp.config';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Platform } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';
// const { App } = Plugins;

//my plugins
import {TranslateService} from '@ngx-translate/core';
import {StorageService} from 'src/app/services/data/storage.service';
import {LogService} from 'src/services/log.services';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  // username: string = 'admin@rhstaffing.com';
  // password: string = 'G8@chkdsk';
  username: string = '';
  password: string = '';
  userId: string = '';

  lang: string;
  current_year: number = new Date().getFullYear();

  signin_form: FormGroup;
  submit_attempt: boolean = false;

  lastBack = Date.now();
  // verifying: boolean = true;
  showApproved: boolean = false;
  showStillPending: boolean = false;

  constructor(
    private logging: LogService,
    private platform: Platform,
    private storageService: StorageService,
    private translate: TranslateService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router
  ) {
    this.init();
    this.subscribeBackPressed();
  }

  async init(){
    this.lang = <string>await this.storageService.get('config.language', 'en');
    let aux = <string>await this.storageService.get('register.email', '');
    this.username = (aux ? aux : '');
    this.translate.use(this.lang);
    this.logging.print(false, 'init', 'lang: ' + this.lang, undefined);
  }

  reset(){
    this.showApproved = false;
    this.showStillPending = false;
  }

  async goToPass(){
    this.logging.print(false, 'valid ', this.username, undefined);
    this.storageService.set('register.approved', this.username);
    this.storageService.set('register.userid', this.userId);
    this.reset();
    await this.router.navigate(['/setpass']);
  }

  unsubscribeBackEvent: any;
  subscribeBackPressed(){
    try{
      this.unsubscribeBackEvent = this.platform.backButton.subscribe(() => {
          if (Date.now() - this.lastBack < 1000) {
            try{
              // this.platform.exitApp();
              navigator['app'].exitApp();
              // App.exitApp();
            }catch(e){}
          }else{
            this.lastBack = Date.now();
            this.toastService.presentToast('', 'Press again to exit', 'bottom', 'warning', 1000);
          }
      });
    }catch(e){
      this.logging.print(true, 'onBack', '', e);
    }
  }

  ngOnDestroy() {
    if(this.unsubscribeBackEvent){
      this.unsubscribeBackEvent.unsubscribe();
    }
  }

  changeLang(alang){
    this.lang = alang;
    this.translate.use(alang);
    this.storageService.set('config.language', this.lang);
    this.logging.print(false, 'change', 'lang: ' + this.lang, undefined);
  }

  ngOnInit() {
    this.signin_form = this.formBuilder.group({
      email: ['', Validators.compose([Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  async signIn(getStatus) {
    this.submit_attempt = true;
    if ( (!this.showApproved && this.signin_form.value.email != '') || //FIRST STEP
         (this.showApproved && this.signin_form.value.password != '') //SECOND STEP
    ) {
      const loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: '<p>Validating credentials...</p><span>Please be patient.</span>',
        spinner: 'crescent'
      });
      await loading.present();

      if(getStatus){
        await this.authService.validate(this.username)
          .subscribe(
          (resp) => {
            this.logging.print(false, 'validate', resp, undefined);
            loading.dismiss();
            this.proceedLogin(getStatus, false, resp);
          },
          (error) => {
            loading.dismiss();
            this.proceedLogin(getStatus, true, error);
          });
      }else{
        await this.authService.signIn(this.username, this.password)
          .subscribe(
          (resp) => {
            this.logging.print(false, 'auth', resp, undefined);
            loading.dismiss();
            this.proceedLogin(getStatus, false, resp);
          },
          (error) => {
            loading.dismiss();
            this.proceedLogin(getStatus, true, error);
          });
      }
    }else{
      this.toastService.presentToast('Error', 'Please input ' + (this.showApproved? 'password' : 'email'), 'top', 'danger', 2000);
    }
  }

  async proceedLogin(getStatus, isError, auth){
    if(isError){
      // let msg = auth && auth.message ? auth.message : auth;
      let msg = 'User not identified, verify and try again!';
      this.toastService.presentToast('Error', msg, 'top', 'danger', 2000);
      return;
    }
    if(getStatus){
      let code = this.validStatus(auth);
      switch(code){
        case 1:{
          //admin or manager
          this.showApproved = true;
          return;
        }
        case 2:{
          //staff approved
          this.goToPass();
          return;
        }
        case 3:{
          //staff logged in another device
          let msg = 'This account is logged in another device, contact the admin to reset your account';
          this.toastService.presentToast('Error', msg, 'top', 'warning', 5000);
          return;
        }
        case 0:{
          //staff pending
          this.showStillPending = true;
          return;
        }
        case -1:{
          //admin disabled or account not found
          let msg = 'Your email is not registered, Register in below options';
          this.toastService.presentToast('Error', msg, 'top', 'danger', 4000);
          return;
        }
      }
    }else{
      let myrol = this.getRol(auth);
      this.toastService.presentToast('RH Staffing', 'Bienvenido ' + auth.account.name + '!', 'top', 'success', 2000);
      this.storageService.set('auth.profile.rol', myrol);
      this.storageService.set('auth.profile', JSON.stringify(auth));
      this.reset();
      await this.router.navigate(['/home']);
    }
  }

  validStatus(resp){
    if(!resp || resp.length == 0){
      //user not found
      return -1;
    }
    let item = resp[0];
    if(item.role.name == ROL_SUPERADMIN || item.role.name == ROL_ADMIN || item.role.name == ROL_MANAGER){
      //is admin or manager
      return (item.user.status == 'ENABLED' ? 1 : -1);
    }
    if(item.role.name == ROL_STAFF){
      this.userId = item.user.id;
      return (item.user.status == 'ENABLED' ? (item.user.isLogged ? 3 : 2) : 0);
      // return (item.user.status == 'ENABLED' ? 2 : 0);
    }
    return -1;
  }

  getRol(auth){
    let isAdmin = auth && auth.roles && auth.roles.filter( item => item.name == ROL_ADMIN)[0];
    let isSuperAdmin = auth && auth.roles && auth.roles.filter( item => item.name == ROL_SUPERADMIN)[0];
    let isManager = auth && auth.roles && auth.roles.filter( item => item.name == ROL_MANAGER)[0];
    let isStaff = auth && auth.roles && auth.roles.filter( item => item.name == ROL_STAFF)[0];
    return (isSuperAdmin || isAdmin || isManager || isStaff ? auth.roles[0].name : '');
  }

}
