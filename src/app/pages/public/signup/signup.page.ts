import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/api/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Router } from '@angular/router';

//my plugins
import {TranslateService} from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import {StorageService} from 'src/app/services/data/storage.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  current_year: number = new Date().getFullYear();
  current_month: number = new Date().getMonth();
  current_date: number = new Date().getDate();

  signup_form: FormGroup;
  submit_attempt: boolean = false;

  birthdate: any;
  birth_active: boolean = false;

  lang: string;
  defaultAge: string = "";
  minAge: string = (this.current_year - 99) + '-' + (this.current_month<9?('0' + (this.current_month+1)):this.current_month+1) + '-' + this.current_date;
  maxAge: string = (this.current_year - 18) + '-' + (this.current_month<9?('0' + (this.current_month+1)):this.current_month+1) + '-' + this.current_date;

  accepted: boolean = false;

  constructor(
    private translate: TranslateService,
    private storageService: StorageService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router
  ) {
    this.init();
    // this.defaultAge = new Date(new Date().getTime()-631152000000).toISOString();//20 años por defecto
    this.defaultAge = new Date(new Date().getTime()-788940000000).toISOString();//25 años por defecto
    // this.defaultAge = new Date(new Date().getTime()-946728000000).toISOString();//30 años por defecto
    // this.defaultAge = new Date(new Date().getTime()-1104516000000).toISOString();//35 años por defecto
  }

  async init(){
    this.lang = <string>await this.storageService.get('config.language', 'en');
    this.translate.use(this.lang);
  }

  changeLang(evt){
    this.lang = evt.target.value;
    this.translate.use(this.lang);
    this.storageService.set('config.language', this.lang);
  }

  acceptConditions(){
    this.accepted = !this.accepted;
  }

  ngOnInit() {

    // Setup form
    this.signup_form = this.formBuilder.group({
      lastname: ['', Validators.compose([Validators.required])],
      firstname: ['', Validators.compose([Validators.required])],
      socialsecurity: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.email, Validators.required])],
      phone: ['', Validators.compose([Validators.required])],
      birth: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.required])],
      status: ['', Validators.compose([Validators.required])],
      languages: ['', Validators.compose([Validators.required])],
      emergname: ['', Validators.compose([Validators.required])],
      emergphone: ['', Validators.compose([Validators.required])],

      addressstreet: ['', Validators.compose([Validators.required])],
      addressaptno: ['', Validators.compose([Validators.required])],
      addresscity: ['', Validators.compose([Validators.required])],
      addressstate: ['', Validators.compose([Validators.required])],
      addresszipcode: ['', Validators.compose([Validators.required])],

      depfederal: ['', Validators.compose([Validators.required])],
      depstate: ['', Validators.compose([Validators.required])],
      uscitizen: ['', Validators.compose([Validators.required])],
      convicted: ['', Validators.compose([Validators.required])],
      driver: ['', Validators.compose([Validators.required])],
      skills: ['', Validators.compose([Validators.required])]

    });
  }

  toggleBirth(){
    this.birth_active = true;
  }

  onBirthSelect(evt){
    this.birthdate = format(parseISO(evt.detail.value), 'MMM d, yyyy');
    this.birth_active = false;
  }

  // Sign up
  async signUp() {

    this.submit_attempt = true;

    // If email or password empty
    // if (this.signup_form.value.email == '' || this.signup_form.value.password == '' || this.signup_form.value.password_repeat == '') {
    //   this.toastService.presentToast('Error', 'Please fill in all fields', 'top', 'danger', 4000);
    //
    //   // If passwords do not match
    // } else if (this.signup_form.value.password != this.signup_form.value.password_repeat) {
    //   this.toastService.presentToast('Error', 'Passwords must match', 'top', 'danger', 4000);
    //
    // } else {
    //
    //   // Proceed with loading overlay
    //   const loading = await this.loadingController.create({
    //     cssClass: 'default-loading',
    //     message: '<p>Signing up...</p><span>Please be patient.</span>',
    //     spinner: 'crescent'
    //   });
    //   await loading.present();
    //
    //   // TODO: Add your sign up logic
    //   // ...
    //
    //   // Success messages + routing
      this.toastService.presentToast('Welcome!', 'Lorem ipsum', 'top', 'success', 2000);
      await this.router.navigate(['/home']);
      // loading.dismiss();
    // }

  }

}
