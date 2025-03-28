import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {DataService} from 'src/services/data.services';
import {PushService} from 'src/services/push.service';
import {StorageService} from 'src/app/services/data/storage.service';
import {Observable, throwError} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private navCtrl: NavController,
    private pushService: PushService,
    private storageService: StorageService,
    private dataService: DataService,
    private router: Router
  ) { }

  async isLogged() {
    let strprofile: string = <string>await this.storageService.get('auth.profile', '');
    // console.log(strprofile);
    return (strprofile && strprofile != '');
  }

  validate(anEmail): Observable<any> {
    return this.dataService.validate(anEmail);
  }

  getEmails(): Observable<any> {
    return this.dataService.getEmails();
  }

  public forgotPassword(body): Observable<any> {
    return this.dataService.forgotPassword(body);
  }

  updatePass(userid: string, pass: string): Observable<any> {
    let authObj = {
      password: pass
    };
    return this.dataService.updatePass(userid, authObj);
  }

  signIn(username: string, password: string): Observable<any> {
    let authObj = {
      username: username,
      password: password
    };
    return this.dataService.login(authObj);
  }

  async signOut() {
    this.pushService.clearTags();
    await this.storageService.clear();
    this.navCtrl.setDirection('root');
    this.router.navigateByUrl('/signin');
  }

  signUp(wizard, idsDocs, loadedFiles) {
    let request = {
      "firstName": wizard.firstName,
      "lastName": wizard.lastName,
      "alias": wizard.alias,
      "socialSecurity": wizard.socialSecurity,
      "phoneNumber": wizard.phoneNumber,
      "email": wizard.email,
      "birthday": wizard.birthday,
      "gender": wizard.gender,
      "street": wizard.street,
      "apartment": wizard.apartment,
      "city": wizard.city,
      "state": wizard.state,
      "zipCode": wizard.zipCode,
      "federal": wizard.federal,
      "depState": wizard.depState,
      "usCitizen": wizard.usCitizen,
      "noUSWorkPermission": wizard.noUSWorkPermission,
      "convicted": wizard.convicted,
      "convictedExplain": wizard.convictedExplain ? wizard.convictedExplain : '',
      "hasDriverLicense": wizard.hasDriverLicense,
      "driverLicenseNumber": wizard.driverLicenseNumber ? wizard.driverLicenseNumber : '',
      "emergencyName": wizard.emergencyName,
      "emergencyNumber": wizard.emergencyNumber,
      "maritalStatus": wizard.status,
      "languages": wizard.languages.toString(),
      "placesWork": wizard.places.toString(),
      "skills": wizard.skills.toString(),
      "bankName": wizard.bankName,
      "bankAccount": wizard.bankAccount,
      "routingNumber": wizard.routingNumber,
      "additionalFile": idsDocs,
      "additionalFileUrls": loadedFiles
    };
    return this.dataService.register(request);
  }
}
