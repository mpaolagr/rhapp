import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, NavController, LoadingController } from '@ionic/angular';
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ToastService } from 'src/app/services/toast/toast.service';
import { finalize, tap } from 'rxjs/operators';

//my plugins
import {ParamsService} from 'src/app/services/api/params.service';
import {StaffService} from 'src/app/services/api/staff.service';
import {TranslateService} from '@ngx-translate/core';
import {StorageService} from 'src/app/services/data/storage.service';
import {LogService} from 'src/services/log.services';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-staff-skills',
  templateUrl: './staff-skills.page.html',
  styleUrls: ['./staff-skills.page.scss'],
})
export class StaffSkillsPage implements OnInit {

  lang: string = 'en';
  allSkills: any[] = [];
  mySkills: any[] = [];
  myAccount: any;

  skillToAdd: number = 0;
  firebaseUrl: string = undefined;
  uploading: boolean = false;

  constructor(
    private iabrowser: InAppBrowser,
    private logging: LogService,
    private translate: TranslateService,
    private storageService: StorageService,
    private paramsService: ParamsService,
    private staffService: StaffService,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
  ) { }

  async ngOnInit() {
    this.lang = <string>await this.storageService.get('config.language', 'en');
    let aux = <string>await this.storageService.get('auth.profile', '');
    this.myAccount = JSON.parse(aux).account;

    this.loadParams();
  }

  changeLang(alang){
    this.lang = alang;
    this.translate.use(alang);
    this.storageService.set('config.language', this.lang);
    this.logging.print(false, 'change', 'lang: ' + this.lang, undefined);
  }

  async loadParams(){
    await this.paramsService.getAll()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadParams', resp, undefined);
        this.allSkills = resp.filter(item => item.paramKey == 'SKILLS');
        this.loadAdditional();
      },
      (error) => {
        this.logging.print(true, 'loadParams', '', error);
        this.loadAdditional();
      });
  }

  async loadAdditional(){
    this.mySkills = [];
    await this.staffService.getAdditional(this.myAccount.id)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadAdditional', resp, undefined);
        this.mySkills = resp.filter( a => a.rhParameter.paramKey == 'SKILLS');
        this.allSkills = this.allSkills.filter( a => this.mySkills.filter( b => b.rhParameter.id == a.id).length == 0);
      },
      (error) => {
        this.logging.print(true, 'loadAdditional', '', error);
      });
  }

  uploadFile(files){
    this.uploading = true;
    let sp = files[0].name.split('.');
    let ext = sp[sp.length-1];
    const fileStoragePath = `certificatesPicture/${new Date().getTime()}.${ext}`;
    const imageRef = this.afStorage.ref(fileStoragePath);
    let uploadTask = this.afStorage.upload(fileStoragePath, files[0]);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        let uploadedImageURL = imageRef.getDownloadURL();
        uploadedImageURL.subscribe(
          (resp) => {
            this.firebaseUrl = resp;
            this.uploading = false;
          },
          (error) => {
            this.uploading = false;
            this.logging.print(true, 'storeFilesFirebase', '', error);
            this.toastService.presentToast('Positions!', 'Error uploading Certificate, try again', 'bottom', 'warning', 2500);
          }
        );
      }),
      tap((snap) => {})
    ).subscribe();
  }

  async saveSkill(){
    await this.staffService.updateSkills(this.myAccount.id, this.skillToAdd, this.firebaseUrl)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'saveSkills', resp, undefined);
        this.toastService.presentToast('Positions', 'New position registered', 'top', 'success', 1000);
        this.reset();
      },
      (error) => {
        this.logging.print(true, 'saveSkill', '', error);
        this.uploading = false;
        this.toastService.presentToast('Error', 'Could not save your certificate, please try again', 'top', 'warning', 3000);
      });
  }

  openImage(anImageUrl){
    this.iabrowser.create(anImageUrl,'_system');
    return false;
  }

  reset(){
    this.skillToAdd = 0;
    this.uploading = false;
    this.firebaseUrl = undefined;
    this.loadAdditional();
  }

}
