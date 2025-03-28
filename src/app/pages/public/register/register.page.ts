import { AfterContentChecked, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation, NgZone } from '@angular/core';
import { PickerController, LoadingController, ActionSheetController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

//my plugins
import { format, parseISO } from 'date-fns';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from 'src/app/services/toast/toast.service';
import {StorageService} from 'src/app/services/data/storage.service';
import {AuthService} from 'src/app/services/api/auth.service';
import {ParamsService} from 'src/app/services/api/params.service';
import {LogService} from 'src/services/log.services';
import {PushService} from 'src/services/push.service';
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser/ngx';

import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';

import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

export interface imgFile {
  name: string;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RegisterPage implements AfterContentChecked {

  FILE_ININE:string = "form_i9";
  FILE_POLICIES:string = "form_policies";
  FILE_DNI:string = "form_dni";
  FILE_SOCIAL:string = "form_social";
  FILE_GREENC:string = "form_green";
  FILE_ININE_BACK:string = "form_i9_back";
  FILE_DNI_BACK:string = "form_dni_back";
  FILE_SOCIAL_BACK:string = "form_social_back";
  FILE_GREENC_BACK:string = "form_green_back";
  FILE_PROFILEPIC:string = "profile_picture";

  currentStep: string = 'STEP_INTRO';
  STEP_INTRO: string = 'STEP_INTRO';
  STEP_PERSONAL: string = 'STEP_PERSONAL';
  STEP_ADDRESS: string = 'STEP_ADDRESS';
  STEP_LEGAL: string = 'STEP_LEGAL';
  STEP_DOCUMENTS: string = 'STEP_DOCUMENTS';

  actionTitle: string = "";
  actionGallery: string = "";
  actionCamera: string = "";
  actionCancel: string = "";

  lang: string;

  zone = new NgZone({ enableLongStackTrace: false });

  files: Observable<imgFile[]>;
  private filesCollection: AngularFirestoreCollection<imgFile>;

  todayDate = new Date();
  currentYear: number = this.todayDate.getFullYear();
  currentMonth: number = this.todayDate.getMonth();
  currentDate: number = this.todayDate.getDate();

  defaultAge: any = new Date(this.todayDate.getTime()-788940000000).toISOString();//25 años por defecto
  minAge: string = (this.currentYear - 99) + '-' + (this.currentMonth<9?('0' + (this.currentMonth+1)):this.currentMonth+1) + '-' + (this.currentDate < 10 ? '0' : '') + this.currentDate;
  maxAge: string = (this.currentYear - 18) + '-' + (this.currentMonth<9?('0' + (this.currentMonth+1)):this.currentMonth+1) + '-' + (this.currentDate < 10 ? '0' : '') + (this.currentDate);

  acceptedConditions: boolean = false;
  paramSkills: any[];
  paramStates: any[];
  paramGender: any[];
  paramStatus: any[];
  paramLanguages: any[];
  paramFiles: any[];
  profilePic: any;

  wizard: any = {};
  idAttachedDocs: string[] = [];
  completedForm: boolean = false;

  refFirebase: any;
  loadingForm: boolean = true;
  savingInfo: boolean = false;
  savedStaff: boolean = false;
  isTesting: boolean = true;
  skipdocuments: boolean = true;
  twosteps: boolean = false;

  yearValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  possibleYears = Array.from({length: new Date().getFullYear()-16}, (_, i) => i + 1).filter(a => a > new Date().getFullYear()-80);
  possibleDates = Array.from({length: 31}, (_, i) => i + 1);

  arrayYears: any[];
  arrayDates: any[];

  constructor(
    private pickerCtrl: PickerController,
    private logging: LogService,
    private iabrowser: InAppBrowser,
    private translate: TranslateService,
    private storageService: StorageService,
    private authService: AuthService,
    private paramsService: ParamsService,
    private pushService: PushService,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private router: Router,
    private changeDetectorRefs: ChangeDetectorRef,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private afdatabase: AngularFireDatabase,
  ) {
    this.init();
    this.arrayYears = [];
    for(let item of this.possibleYears){
      this.arrayYears.push({text: item, value: item})
    }
    this.arrayDates= [];
    for(let item of this.possibleDates){
      this.arrayDates.push({text: (item < 10 ? ('0' + item) : item), value: item})
    }
    this.pushService.init_notifications();
  }

  async selectBirth() {
    const picker = await this.pickerCtrl.create({
      columns: [
        {
          name: 'monthbirth',
          options: [
            {text: 'Jan',value: 0,},
            {text: 'Feb',value: 1,},
            {text: 'Mar',value: 2,},
            {text: 'Apr',value: 3,},
            {text: 'May',value: 4,},
            {text: 'Jun',value: 5,},
            {text: 'Jul',value: 6,},
            {text: 'Aug',value: 7,},
            {text: 'Sep',value: 8,},
            {text: 'Oct',value: 9,},
            {text: 'Nov',value: 10,},
            {text: 'Dec',value: 11,}
          ],
        },
        {
          name: 'daybirth',
          options: this.arrayDates,
        },
        {
          name: 'yearbirth',
          options: this.arrayYears,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (value) => {
            this.wizard.birthdaystr = value.monthbirth.text + ' ' + value.daybirth.text + ',' + value.yearbirth.text;
            let aux = new Date();
            aux.setDate(value.daybirth.value);
            aux.setMonth(value.monthbirth.value);
            aux.setFullYear(value.yearbirth.value);
            aux.setHours(0);
            aux.setMinutes(0);
            aux.setSeconds(0);
            aux.setMilliseconds(0);
            this.wizard.birthday = aux.getTime();
          },
        },
      ],
    });

    await picker.present();
  }

  async init(){
    this.initFirebase();
    this.lang = <string>await this.storageService.get('config.language', 'en');
    this.translate.use(this.lang);
    this.getTranslations();
    this.getParams();
    this.getEmails();

    this.filesCollection = this.afs.collection<imgFile>('users');
    this.files = this.filesCollection.valueChanges();
  }

  async continueLoading(){
    await this.validateSteps();
  }

  initFirebase(){
    try{
      this.refFirebase = this.afdatabase.object('/validation');
      this.refFirebase.valueChanges().subscribe(res => {
        this.isTesting = (res.apple || res.google);
        this.skipdocuments = res.skipdocuments;
        this.twosteps = res.twosteps;
        this.loadingForm = false;
        this.continueLoading();
      });
    }catch(e){
      this.loadingForm = false;
      this.continueLoading();
    }
  }

  testing(){
    let rand = this.randTime();
    this.savingInfo = true;
    setTimeout(() => {
      this.savingInfo = false;
      this.savedStaff = true;
    }, rand);
  }

  download(url){
    this.iabrowser.create(url,'_system');
  }

  randTime() {//some random numbers
    return Math.random() * (4506 - 3130) + 3130;
  }

  async validateSteps(){
    let aux = <string>await this.storageService.get('register.wizard', '');
    if(aux && aux != ''){
      this.wizard = JSON.parse(aux);
      this.logging.print(false, 'validateSteps', this.wizard, undefined);
      if(this.wizard.step != '' && this.wizard.birthdayStr != ''){
        this.defaultAge = new Date(this.wizard.birthday-14400000).toISOString();
      }
    }
  }

  async getTranslations(){
    this.actionTitle = await this.translate.get('StaffProfile-PicCamTitle').toPromise();
    this.actionGallery = await this.translate.get('StaffProfile-ChooseGallery').toPromise();
    this.actionCamera = await this.translate.get('StaffProfile-ChooseCamera').toPromise();
    this.actionCancel = await this.translate.get('StaffProfile-ActionCancel').toPromise();
  }

  async getParams(){
    await this.paramsService.getAll()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getParams', resp, undefined);
        this.paramSkills = resp.filter(item => item.paramKey == "SKILLS");
        this.paramStates = resp.filter(item => item.paramKey == "STATES");
        this.paramGender = resp.filter(item => item.paramKey == "GENDER");
        this.paramStatus = resp.filter(item => item.paramKey == "MARITAL_STATUS");
        this.paramLanguages = resp.filter(item => item.paramKey == "LANGUAGES");
        this.paramFiles = resp.filter(item => item.paramKey == "STAFF_ADDITIONAL_FILES");
        this.profilePic = resp.filter(item => item.paramKey == "STAFF_PROFILE_PICTURE")[0];
        this.updateLang();
        this.loadFilesIds();
      },
      (error) => {

      });
  }

  loadFilesIds(){
    let idformI9 = this.paramFiles.filter( a => a.valueEs == 'formi9Picture')[0];
    let idDni = this.paramFiles.filter( a => a.valueEs == 'dniPicture')[0];
    let idGreen = this.paramFiles.filter( a => a.valueEs == 'greenCardPicture')[0];
    let idSocial = this.paramFiles.filter( a => a.valueEs == 'socialSecurityPicture')[0];
    let idPolicies = this.paramFiles.filter( a => a.valueEs == 'policiesFormPicture')[0];

    this.idAttachedDocs = [];
    this.idAttachedDocs.push(idformI9 ? idformI9.id : 0);
    this.idAttachedDocs.push(idDni ? idDni.id : 0);
    this.idAttachedDocs.push(idGreen ? idGreen.id : 0);
    this.idAttachedDocs.push(idSocial ? idSocial.id : 0);
    this.idAttachedDocs.push(this.profilePic ? this.profilePic.id : 0);
    this.idAttachedDocs.push(idPolicies ? idPolicies.id : 0);
  }

  updateLang(){
    try{
      for(let item of this.paramSkills){
        item.actualLang = this.lang == 'en' ? item.valueEn : item.valueEs;
      }
      for(let item of this.paramStates){
        item.actualLang = this.lang == 'en' ? item.valueEn : item.valueEs;
      }
      for(let item of this.paramGender){
        item.actualLang = this.lang == 'en' ? item.valueEn : item.valueEs;
      }
      for(let item of this.paramStatus){
        item.actualLang = this.lang == 'en' ? item.valueEn : item.valueEs;
      }
      for(let item of this.paramLanguages){
        item.actualLang = this.lang == 'en' ? item.valueEn : item.valueEs;
      }
    }catch(e){
      this.logging.print(true, 'updateLang', '', e);
    }
  }

  changeLang(alang){
    this.lang = alang;
    this.translate.use(alang);
    this.storageService.set('config.language', this.lang);
    this.updateLang();
  }

  acceptConditions(){
    this.zone.run(() => {
      this.acceptedConditions = !this.acceptedConditions;
    });
  }

  onBirthSelect(evt){
    let somedate = evt.detail.value;
    this.wizard.birthdaystr = somedate.substring(0,10);
    this.wizard.birthday = new Date(somedate).getTime();
  }

  ngAfterContentChecked(): void {
  }

  backSlide(){
    switch(this.currentStep){
      case this.STEP_ADDRESS:{this.currentStep=this.STEP_PERSONAL; break;}
      case this.STEP_LEGAL:{this.currentStep=this.STEP_ADDRESS; break;}
      case this.STEP_DOCUMENTS:{this.currentStep=this.STEP_LEGAL; break;}
      default:{this.currentStep=this.STEP_INTRO; break;}
    }
  }

  nextSlide() {
    switch(this.currentStep){
      case this.STEP_INTRO:{this.currentStep=this.STEP_PERSONAL; break;}
      case this.STEP_PERSONAL:{this.currentStep=this.STEP_ADDRESS; break;}
      case this.STEP_ADDRESS:{this.currentStep=this.STEP_LEGAL; break;}
      default:{this.currentStep=this.STEP_DOCUMENTS; break;}
    }
  }

  async savePersonal(){
    //save locally the personal data and nextslide
    if(this.validPersonalData()){
      this.wizard.step='personal';
      this.logging.print(false, 'savePersonal', this.wizard, undefined);
      this.storageService.set('register.wizard', JSON.stringify(this.wizard));
      this.storageService.set('register.email', this.wizard.email);
      this.nextSlide();
    }
  }

  async saveAddress(){
    //save locally the address data and nextslide
    if(this.validAddressData()){
      this.wizard.step='address';
      this.logging.print(false, 'saveAddress', this.wizard, undefined);
      this.storageService.set('register.wizard', JSON.stringify(this.wizard));
      this.nextSlide();
    }
  }

  async saveLegal(){
    //save locally the legal data and nextslide
    if(this.validLegalData()){
      if(this.twosteps){
        this.wizard.step=this.FILE_ININE;
      }else{
        this.wizard.step='legal';
      }
      this.wizard.usCitizen = (this.wizard.usCitizenStr == '1');
      this.wizard.noUSWorkPermission = (this.wizard.noUSWorkPermissionStr == '1');
      this.wizard.convicted = (this.wizard.convictedStr == '1');
      this.wizard.hasDriverLicense = (this.wizard.hasDriverLicenseStr == '1');
      this.logging.print(false, 'saveLegal', this.wizard, undefined);
      this.storageService.set('register.wizard', JSON.stringify(this.wizard));
      this.nextSlide();
    }
  }

  async saveDocs(){
    if(!this.acceptedConditions){
      this.toastService.presentToast('Neccesary Documents!', 'You must accept agreement below to complete your application!', 'bottom', 'warning', 2500);
      return;
    }

    this.wizard.step='documents';
    this.logging.print(false, 'saveDocs', this.wizard, undefined);

    this.storageService.set('register.wizard', JSON.stringify(this.wizard));
    let loadedFiles = this.getLoadedFiles();
    await this.authService.signUp(this.wizard, loadedFiles.ids, loadedFiles.urls).subscribe( (resp) => {
        this.proceedRegister(!(resp && resp['id']), resp);
    },(error) => {
        this.proceedRegister(true, error);
    });
  }

  registeredEmails: any[];
  async getEmails(){
    await this.authService.getEmails().subscribe( (resp) => {
        this.registeredEmails = resp.filter(a => a.email != undefined);
    },(error) => {});
  }

  getLoadedFiles(){
    let ids = [];
    let urls = [];
    if(this.wizard.documentformi9){
      ids.push(this.idAttachedDocs[0]);
      urls.push(this.wizard.documentformi9);
    }
    if(this.wizard.documentformi9Back){
      ids.push(this.idAttachedDocs[0]);
      urls.push(this.wizard.documentformi9Back);
    }
    if(this.wizard.documentdni){
      ids.push(this.idAttachedDocs[1]);
      urls.push(this.wizard.documentdni);
    }
    if(this.wizard.documentdniBack){
      ids.push(this.idAttachedDocs[1]);
      urls.push(this.wizard.documentdniBack);
    }
    if(this.wizard.documentgreen){
      ids.push(this.idAttachedDocs[2]);
      urls.push(this.wizard.documentgreen);
    }
    if(this.wizard.documentgreenBack){
      ids.push(this.idAttachedDocs[2]);
      urls.push(this.wizard.documentgreenBack);
    }
    if(this.wizard.documentsocial){
      ids.push(this.idAttachedDocs[3]);
      urls.push(this.wizard.documentsocial);
    }
    if(this.wizard.documentsocialBack){
      ids.push(this.idAttachedDocs[3]);
      urls.push(this.wizard.documentsocialBack);
    }
    if(this.wizard.profilepic){
      ids.push(this.idAttachedDocs[4]);
      urls.push(this.wizard.profilepic);
    }
    if(this.wizard.documentpolicies){
      ids.push(this.idAttachedDocs[5]);
      urls.push(this.wizard.documentpolicies);
    }
    return { ids: ids.toString(), urls: urls.toString() };
  }

  proceedRegister(isError, data){
    if(isError){
      this.toastService.presentToast('Error!', 'An error has ocurred sending your application, please try again', 'bottom', 'warning', 3000);
      return;
    }
    this.pushService.setTag('deviceid', data['id']);
    this.storageService.set('register.response', JSON.stringify(data));
    this.logging.print(isError, 'proceedRegister', data, data);
    this.zone.run(() => {
      this.savedStaff = true;
    });
  }

  clearAll(){
    this.storageService.set('register.wizard', '');
  }

  registeredEmail(){
    if(!this.registeredEmails){
      return false;
    }
    let exists = this.registeredEmails.filter(a => a.email && a.email.toLowerCase() == this.wizard.email);
    return exists.length > 0;
  }

  validPersonalData(){
    if(!this.validText(this.wizard.lastName, 3, false, false)){
      this.toastService.presentToast('Personal Info!', 'Last Name', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.firstName, 3, false, false)){
      this.toastService.presentToast('Personal Info!', 'First Name', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.alias, 3, false, false)){
      this.toastService.presentToast('Personal Info!', 'Alias', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.socialSecurity, 9, false, false)){
      this.toastService.presentToast('Personal Info!', 'Social Security', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.phoneNumber, 5, true, false)){
      this.toastService.presentToast('Personal Info!', 'Phone Number', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.email, 6, false, true)){
      this.toastService.presentToast('Personal Info!', 'Email Address', 'bottom', 'warning', 1500);
      return false;
    }
    if(this.registeredEmail()){
      this.toastService.presentToast('Personal Info!', 'This email account is already registered', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.birthday, 3, true, false)){
      this.toastService.presentToast('Personal Info!', 'Birthday', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.gender, 1, false, false)){
      this.toastService.presentToast('Personal Info!', 'Gender', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.status, 3, false, false)){
      this.toastService.presentToast('Personal Info!', 'Marital Status', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validArray(this.wizard.languages)){
      this.toastService.presentToast('Personal Info!', 'Languages', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.bankName, 2, false, false)){
      this.toastService.presentToast('Personal Info!', 'Bank Name', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.bankAccount, 3, false, false)){
      this.toastService.presentToast('Personal Info!', 'Bank Account Number', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.routingNumber, 3, false, false)){
      this.toastService.presentToast('Personal Info!', 'Bank Routing Number', 'bottom', 'warning', 1500);
      return false;
    }
    return true;
  }

  validAddressData(){
    if(!this.validText(this.wizard.street, 3, false, false)){
      this.toastService.presentToast('Address Info', 'Street', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.city, 3, false, false)){
      this.toastService.presentToast('Address Info', 'City', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.state, 3, false, false)){
      this.toastService.presentToast('Address Info', 'State', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.zipCode, 3, false, false)){
      this.toastService.presentToast('Address Info', 'Zip Code', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validArray(this.wizard.places)){
      this.toastService.presentToast('Address Info', 'States to Work', 'bottom', 'warning', 1500);
      return false;
    }
    return true;
  }

  validLegalData(){
    if(!this.validText(this.wizard.usCitizenStr, 1, false, false)){
      this.toastService.presentToast('Legal Info!', 'U.S. Citizen', 'bottom', 'warning', 1500);
      return false;
    }
    if(this.wizard.usCitizenStr=='0'){
      if(!this.validText(this.wizard.noUSWorkPermissionStr, 1, false, false)){
        this.toastService.presentToast('Legal Info!', 'U.S. Working Permission', 'bottom', 'warning', 1500);
        return false;
      }
    }
    if(!this.validText(this.wizard.convictedStr, 1, false, false)){
      this.toastService.presentToast('Legal Info!', 'Convicted', 'bottom', 'warning', 1500);
      return false;
    }
    if(this.wizard.convictedStr == '1'){
      if(!this.validText(this.wizard.convictedExplain, 1, false, false)){
        this.toastService.presentToast('Legal Info!', 'Convicted Explanation', 'bottom', 'warning', 1500);
        return false;
      }
    }
    if(!this.validText(this.wizard.hasDriverLicenseStr, 1, false, false)){
      this.toastService.presentToast('Legal Info!', 'Have a Driver License?', 'bottom', 'warning', 1500);
      return false;
    }
    if(this.wizard.hasDriverLicenseStr == '1'){
      if(!this.validText(this.wizard.driverLicenseNumber, 1, false, false)){
        this.toastService.presentToast('Legal Info!', 'Driver License Number', 'bottom', 'warning', 1500);
        return false;
      }
    }
    if(!this.validText(this.wizard.skills, 1, false, false)){
      this.toastService.presentToast('Legal Info!', 'Positions', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.emergencyName, 3, false, false)){
      this.toastService.presentToast('Legal Info!', 'Emergency Name', 'bottom', 'warning', 1500);
      return false;
    }
    if(!this.validText(this.wizard.emergencyNumber, 5, true, false)){
      this.toastService.presentToast('Legal Info!', 'Emergency Number', 'bottom', 'warning', 1500);
      return false;
    }
    return true;
  }

  validArray(info){
    if(!info){ return false; }
    if(info.length <= 0){ return false; }
    return true;
  }

  validText(someText, min, isNumber, isEmail){
    if(!someText){ return false; }
    if(someText.length < min){ return false; }
    if(isNumber){ try{ Number(someText); }catch(e){ return false} }
    if(isEmail && someText.indexOf('@')<0){ return false; }
    return true;
  }


  isFileUploading: boolean = false;
  isFileUploaded: boolean = false;
  selectedImage: any = undefined;
  actualProgress: string = '';

  uploadImage(folder, type, event) {
    this.selectedImage = undefined;
    const file = event ? event.item(0) : undefined;
    if(!file){
      this.toastService.presentToast('Error!', 'There was an error, please try again', 'bottom', 'warning', 2500);
      return
    }
    this.logging.print(false, 'uploadImage', file, undefined);
    // Image validation
    if (file.type.split('/')[0] != 'image') {
      this.toastService.presentToast('Wrong File Type!', 'Image not valid, select another', 'bottom', 'warning', 1500);
      this.logging.print(false, 'uploadImage', 'File type is not supported!', undefined);
      return;
    }
    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.selectedImage = file;

    let sp = this.selectedImage.name.split('.');
    let ext = sp[sp.length-1];
    this.uploadFile(folder, type, ext);
  }

  uploadFile(folder, type, ext){
    let newDate = new Date().getTime();
    this.actualProgress = '';
    const fileStoragePath = `${folder}/${newDate}.${ext}`;
    const imageRef = this.afStorage.ref(fileStoragePath);
    let uploadTask = this.afStorage.upload(fileStoragePath, this.selectedImage);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        let uploadedImageURL = imageRef.getDownloadURL();
        uploadedImageURL.subscribe(
          (resp) => {
            this.storeFilesFirebase(
              type, resp,
              {
                name: this.selectedImage.name,
                filepath: resp,
                size: this.selectedImage.size,
              }
            );
          },
          (error) => {
            this.logging.print(true, 'storeFilesFirebase', '', error);
            this.isFileUploading = false;
            this.isFileUploaded = false;
            this.toastService.presentToast('Neccesary Documents!', 'Error uploading Image, try again', 'bottom', 'warning', 2500);
          }
        );
      }),
      tap((snap) => {
        try{
          this.actualProgress = (snap['_delegate']['bytesTransferred'] / snap['_delegate']['totalBytes'] * 100).toFixed(0) + '%';
        }catch(e){}
      })
    ).subscribe();
  }

  skipDocumentStep(){
    this.wizard.documentformi9 = (this.wizard.documentformi9 ? this.wizard.documentformi9 : '');
    this.wizard.documentpolicies = (this.wizard.documentpolicies ? this.wizard.documentpolicies : '');
    this.wizard.documentdni = (this.wizard.documentdni ? this.wizard.documentdni : '');
    this.wizard.documentsocial = (this.wizard.documentsocial ? this.wizard.documentsocial : '');
    this.wizard.documentgreen = (this.wizard.documentgreen ? this.wizard.documentgreen : '');

    this.wizard.documentformi9Back = (this.wizard.documentformi9Back ? this.wizard.documentformi9Back : '');
    this.wizard.documentdniBack = (this.wizard.documentdniBack ? this.wizard.documentdniBack : '');
    this.wizard.documentsocialBack = (this.wizard.documentsocialBack ? this.wizard.documentsocialBack : '');
    this.wizard.documentgreenBack = (this.wizard.documentgreenBack ? this.wizard.documentgreenBack : '');

    this.wizard.profilepic = (this.wizard.profilepic ? this.wizard.profilepic : '');
    this.nextStepImage(this.FILE_ININE);
  }

  openImage(anImageUrl){
    this.iabrowser.create(anImageUrl,'_system');
    return false;
  }

  storeFilesFirebase(type, url, image: imgFile) {
    this.logging.print(false, 'mark as done: ' + url, image, undefined);
    const fileId = this.afs.createId();
    this.filesCollection
      .doc(fileId)
      .set(image)
      .then((res) => {
        this.logging.print(false, 'filesCollection', res, undefined);
        this.markAsDone(type, url);
      })
      .catch((err) => {
        this.isFileUploading = false;
        this.isFileUploaded = false;
        this.logging.print(true, 'filesCollection', '', err);
      });
  }

  markAsDone(type, url){
    this.isFileUploading = false;
    this.isFileUploaded = true;
    this.logging.print(false, 'assign ', type + ' >>> ' + url, undefined);
    switch(type){
      case this.FILE_ININE:{
        this.zone.run(() => {
          this.wizard.documentformi9 = url;
        });
        return;
      }
      case this.FILE_POLICIES:{
        this.zone.run(() => {
          this.wizard.documentpolicies = url;
        });
        return;
      }
      case this.FILE_DNI:{
        this.zone.run(() => {
          this.wizard.documentdni = url;
        });
        return;
      }
      case this.FILE_SOCIAL:{
        this.zone.run(() => {
          this.wizard.documentsocial = url;
        });
        return;
      }
      case this.FILE_GREENC:{
        this.zone.run(() => {
          this.wizard.documentgreen = url;
        });
        return;
      }
      case this.FILE_ININE_BACK:{
        this.zone.run(() => {
          this.wizard.documentformi9Back = url;
        });
        return;
      }
      case this.FILE_DNI_BACK:{
        this.zone.run(() => {
          this.wizard.documentdniBack = url;
        });
        return;
      }
      case this.FILE_SOCIAL_BACK:{
        this.zone.run(() => {
          this.wizard.documentsocialBack = url;
        });
        return;
      }
      case this.FILE_GREENC_BACK:{
        this.zone.run(() => {
          this.wizard.documentgreenBack = url;
        });
        return;
      }
      case this.FILE_PROFILEPIC:{
        this.zone.run(() => {
          this.wizard.profilepic = url;
        });
        return;
      }
    }
  }

  loadingNextStep: boolean = false;
  nextStepImage(type){
    this.loadingNextStep = true;
    setTimeout(() => {
      this.wizard.step = type;
      this.storageService.set('register.wizard', JSON.stringify(this.wizard));
      this.selectedImage = undefined;
      this.changeDetectorRefs.detectChanges();
      this.loadingNextStep = false;
    }, 500);
  }

}
