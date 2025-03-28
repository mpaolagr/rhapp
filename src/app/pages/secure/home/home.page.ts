import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';
// const { App } = Plugins;

import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';

import {TranslateService} from '@ngx-translate/core';
import {EventService} from 'src/app/services/api/event.service';
import {ParamsService} from 'src/app/services/api/params.service';
import {LogService} from 'src/services/log.services';
import {HelperService} from 'src/app/services/helper/helper.service';
import {StorageService} from 'src/app/services/data/storage.service';
import {PushService} from 'src/services/push.service';
import {SenderService} from 'src/app/services/api/sender.service';
import {ToastService} from 'src/app/services/toast/toast.service';
import {ROL_SUPERADMIN, ROL_ADMIN, ROL_MANAGER, ROL_STAFF} from 'src/config/rhapp.config';
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
SwiperCore.use([Pagination]);
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NgZone } from "@angular/core";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  VERSION_IOS = "0.2.5";
  VERSION_ANDROID = "0.2.5";

  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isManager: boolean = false;
  isStaff: boolean = false;

  myUserId: string = '';
  events: any[] = [];
  eventsComing: any[] = [];
  eventsPast: any[] = [];
  eventsOriginal: any[] = [];
  soonList: any[] = [];
  clientsAdmin: any[] = [];

  subscribedLocation: any;
  currentLocation: any;

  paramsClockin: any;
  paramsClockout: any;
  paramsGeofence: any;
  paramInvitationAccept: any;
  paramInvitationReject: any;
  paramConfirmationAccept: any;
  paramConfirmationReject: any;

  loading: any;
  zone = new NgZone({ enableLongStackTrace: false });
  @ViewChild('swiper') swiper: SwiperComponent;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined

  // Swiper config
  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: { clickable: false },
    allowTouchMove: true
  }

  thisWeek: number = 0;
  lastWeek: number = 0;
  thisMonth: number = 0;

  bar_chart_data_1: any = {labels: [],datasets: []};
  bar_chart_data_2: any = {labels: [],datasets: []};
  bar_chart_data_3: any = {labels: [],datasets: []};

  bar_chart_option: any = {
    cutout: '90%',
    responsive: true,
    font: {family: 'Inter'},
    animation: {easing: 'easeInOutElastic',delay: 25},
    plugins: {legend: {display: false,},tooltip: {
        backgroundColor: this.helperService.getColorVariable('dark'),
        bodyColor: this.helperService.getColorVariable('light'),
        bodyFont: {
          size: 14,
          weight: 'bold'
        },
        padding: 2,
        boxWidth: 5,
        boxHeight: 5,
        boxPadding: 1,
        usePointStyle: true
      }}
  };
  bar_chart_type: ChartType = 'doughnut';
  content_loaded: boolean = false;

  lastBack = Date.now();
  lang: string = 'en';

  today = new Date().getTime();
  initWeek: number = 0;
  endWeek: number = 0;
  initMonth: number = 0;
  endMonth: number = 0;
  initLastWeek: number = 0;
  endLastWeek: number = 0;

  newVersion: string = '';
  currentVersion: string = '';
  iosUrl: string = 'https://apps.apple.com/us/app/rh-staffing/id1630701548';
  androidUrl: string = 'https://play.google.com/store/apps/details?id=io.rhstaffing.app';

  constructor(
    private iabrowser: InAppBrowser,
    private translate: TranslateService,
    private loadingController: LoadingController,
    private afdatabase: AngularFireDatabase,
    private logging: LogService,
    private platform: Platform,
    private senderService: SenderService,
    private paramsService: ParamsService,
    private eventService: EventService,
    private storageService: StorageService,
    private pushService: PushService,
    private helperService: HelperService,
    private alertController: AlertController,
    private toastService: ToastService,
    private router: Router,
    private geolocation: Geolocation
  ) {
    this.setInitEndWeek();
    this.subscribeBackPressed();
    this.initFirebase();
    this.pushService.init_notifications();
  }

  initFirebase(){
    try{
      let refFirebase = this.afdatabase.object('/validation');
      refFirebase.valueChanges().subscribe(res => {
        if(this.platform && this.platform.is('ios')){
          this.newVersion = res['version'];
          this.currentVersion = this.VERSION_IOS;
        }
        if(this.platform && this.platform.is('android')){
          this.newVersion = res['version-android'];
          this.currentVersion = this.VERSION_ANDROID;
        }
        this.iosUrl = res['ios-url'];
        this.androidUrl = res['android-url'];
      });
    }catch(e){
      this.logging.print(true, 'initFirebase', '', e);
    }
  }

  openMarket(){
    this.logging.print(false, 'openMarket', 'opening market new version available', undefined);
    if(this.platform && this.platform.is('ios')){
      this.logging.print(false, 'openMarket', 'opening IOS: ' + this.iosUrl, undefined);
      this.iabrowser.create(this.iosUrl,'_system');
      return;
    }
    if(this.platform && this.platform.is('android')){
      this.logging.print(false, 'openMarket', 'opening ANDROID: ' + this.androidUrl, undefined);
      this.iabrowser.create(this.androidUrl,'_system');
    }
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

  validAccuracy(){
    if(!this.currentLocation){
      return false;
    }
    return Number(this.currentLocation['accuracy']) <= Number(this.paramsGeofence.valueEs);
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

  async init(){
    this.lang = <string>await this.storageService.get('config.language', 'en');
    let aux = <string>await this.storageService.get('auth.profile', '');
    this.myUserId = JSON.parse(aux).account.id;

    let profile:string = <string>await this.storageService.get('auth.profile.rol', '');
    this.isSuperAdmin = (profile == ROL_SUPERADMIN);
    this.isAdmin = (profile == ROL_ADMIN);
    this.isManager = (profile == ROL_MANAGER);
    this.isStaff = (profile == ROL_STAFF);

    this.loadParams();

    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
  }

  searchValue: string = '';
  filterEvents(){
    this.events = [...this.eventsOriginal];
    if(this.isAdmin || this.isSuperAdmin){
      this.events = this.events.filter(
        a => a.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
             a.description.toLowerCase().includes(this.searchValue.toLowerCase()) ||
             (a.client && a.client.company.toLowerCase().includes(this.searchValue.toLowerCase()))
      );
      return;
    }
    this.events = this.events.filter(
      a => a.rhEvent.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
           a.rhEvent.description.toLowerCase().includes(this.searchValue.toLowerCase()) ||
           (a.rhEvent.client && a.rhEvent.client.company.toLowerCase().includes(this.searchValue.toLowerCase()))
    );
  }

  loadParams(){
    this.paramsService.getAll()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadParams', resp, undefined);

        this.paramInvitationAccept = resp.filter(item => item.paramKey == "INVITATION_MESSAGE_ACCEPTED")[0];
        this.paramInvitationReject = resp.filter(item => item.paramKey == "INVITATION_MESSAGE_REJECTED")[0];
        this.paramConfirmationAccept = resp.filter(item => item.paramKey == "CONFIRMATION_MESSAGE_ACCEPTED")[0];
        this.paramConfirmationReject = resp.filter(item => item.paramKey == "CANCELLATION_MESSAGE_ACCEPTED")[0];

        this.paramsClockin = resp.filter(item => item.paramKey == "STAFF_CLOCKIN_HOURS")[0];
        this.paramsClockout = resp.filter(item => item.paramKey == "STAFF_CLOCKOUT_HOURS")[0];
        this.paramsGeofence = resp.filter(item => item.paramKey == "STAFF_GEOFENCE_METERS")[0];
        this.loadEvents();
      },
      (error) => {
        //just in case of errors
        this.defaultValues();
        this.loadEvents();
      });
  }

  defaultValues(){
    this.paramsClockin = {
      valueEs: '1', // HOURS BEFORE INIT EVENT
      valueEn: '0'  // HOURS AFTER END EVENT
    };
    this.paramsClockout = {
      valueEs: '0', // HOURS BEFORE INIT EVENT
      valueEn: '1'  // HOURS AFTER END EVENT
    };
    this.paramsGeofence = {
      valueEs: '20',// ACCURACY
      valueEn: '50' // GEOFENCE RADIUS
    };
    this.paramInvitationAccept = {valueEn: 'Staff accepted event invitation!'};
    this.paramInvitationReject = {valueEn: 'Staff rejected event invitation!'};
    this.paramConfirmationAccept = {valueEn: 'Staff confirmed event participation!'};
    this.paramConfirmationReject = {valueEn: 'Staff cancelled event participation!'};
  }

  loadingEvents: boolean = false;
  async loadEvents(){
    // this.loading = await this.loadingController.create({
    //   cssClass: 'default-loading',
    //   message: '<p>Loading Events...</p><span>Please be patient.</span>',
    //   spinner: 'crescent'
    // });
    // await this.loading.present();
    this.loadingEvents = true;
    if(this.isSuperAdmin){
      this.getAdminEvents();
      return;
    }
    if(this.isAdmin){
      this.getClientAdmin();
      return;
    }
    if(this.isManager){
      this.getManagerEvents();
      return;
    }
    this.getStaffEvents();
  }

  setTags(){
    var obj = {};
    obj['deviceid'] = this.myUserId;
    let addTags = [obj];
    let deleteTags = [obj];
    let prefix = (this.isStaff ? 'staff' : 'admin');
    for(let item of this.events){
      let akey = prefix + '-event-' + item.id;
      let avalue = item.id;
      deleteTags.push( { [akey]: avalue } );
    }
    for(let item of this.eventsComing){
      let akey = prefix + '-event-' + item.id;
      let avalue = (this.isStaff ? item.status : 'ADMIN');
      addTags.push( { [akey]: avalue } );
    }
    this.pushService.setTags(deleteTags, addTags);
  }

  getClientAdmin(){
    this.eventService.getClientAdmin(this.myUserId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getClientAdmin', resp, undefined);
        this.clientsAdmin = resp;
        this.getAdminEvents();
      },
      (error) => {
        this.loadingEvents = false;
        this.logging.print(true, 'getClientAdmin', '', error);
      });
  }

  getAdminEvents(){
    let athis = this;
    this.eventService.getEvents()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getAdminEvents', resp, undefined);
        // this.loading.dismiss();
        this.loadingEvents = false;
        this.processEvents(false, resp);
      },
      (error) => {
        // this.loading.dismiss();
        this.loadingEvents = false;
        this.processEvents(true, error);
      });
  }

  getStaffEvents(){
    this.eventService.getEventsByStaff(this.myUserId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getStaffEvents', resp, undefined);
        // this.loading.dismiss();
        this.loadingEvents = false;
        this.processEvents(false, resp);
      },
      (error) => {
        // this.loading.dismiss();
        this.loadingEvents = false;
        this.processEvents(true, error);
      });
  }

  getManagerEvents(){
    this.eventService.getEventsByManager(this.myUserId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getManagerEvents', resp, undefined);
        // this.loading.dismiss();
        this.loadingEvents = false;
        this.processEvents(false, resp);
      },
      (error) => {
        // this.loading.dismiss();
        this.loadingEvents = false;
        this.processEvents(true, error);
      });
  }

  enabledCustomer(item){
    return (this.clientsAdmin.filter(b => b.clientId == item.clientId).length > 0);
  }

  processEvents(isError, resp){
    if(isError){
      this.content_loaded = true;
      this.toastService.presentToast('Error', 'Could not load events', 'top', 'warning', 1000);
      return;
    }
    if(this.isAdmin){
      resp = resp.filter(a => this.enabledCustomer(a));
    }
    this.events = resp;
    this.eventsOriginal = [...resp];
    if(this.isStaff){
      console.log('resp', resp);

      let hrsAfter = 3600000 * Number(this.paramsClockout.valueEn);
      this.eventsComing = resp.filter( a => (a.rhEvent.initDate > this.today || (a.rhEvent.endDate + hrsAfter) > this.today) );
      this.eventsComing = this.eventsComing.filter(a => 'INVITED,PENDING,APPROVED,CONFIRMED'.includes(a.status));                               //QUITAR LOS QUE NO TIENEN UN ESTADO ACEPTABLE
      this.eventsComing = this.eventsComing.filter(a => !(a.status == 'INVITED' && a.rhEvent.eventCloseDate < this.today));                     //QUITAR LOS QUE NO ACEPTARON A TIEMPO
      this.eventsComing = this.eventsComing.filter(a => !(a.status == 'APPROVED' && a.rhEvent.confirmationEndDateStaff < this.today));     //QUITAR LOS QUE NO CONFIRMARON A TIEMPO
      this.eventsComing = this.eventsComing.sort((a,b) => {return a.rhEvent.initDate - b.rhEvent.initDate;});

      this.eventsPast = resp.filter( a => (a.rhEvent.endDate < this.today) );
      this.eventsPast = this.eventsPast.filter(a => a.status == 'CONFIRMED' && a.clockOut);                                     //EVENTOS PASADOS SOLO MOSTRAR LOS QUE TRABAJARON
      this.eventsPast = this.eventsPast.sort((b,a) => {return a.rhEvent.initDate - b.rhEvent.initDate;});

      for(let item of this.eventsPast){
        item.workedHours = item.clockOut ? (((item.clockOut - item.clockIn) / 3600000).toFixed(0)) : undefined;
        item.busHours = (item.rhEvent.transportHoursPayment && item.rhEvent.transportHoursPayment > 0 && item.rhEvent.transportHoursPayment < 100 ? item.rhEvent.transportHoursPayment : undefined);
      }

      this.soonList = this.events.filter( item => this.isSoon(item));
      console.log('RHSTAFF SOON LIST', this.soonList.length);
      this.content_loaded = true;
      this.setTags();
    }else{
      this.eventsComing = resp.filter( a => (a.initDate > this.today || a.endDate > this.today) );
      this.eventsComing = this.eventsComing.sort((a,b) => {return a.initDate - b.initDate;});
      this.eventsPast = resp.filter( a => (a.endDate < this.today) );
      this.eventsPast = this.eventsPast.sort((b,a) => {return a.initDate - b.initDate;});
      this.content_loaded = true;
      this.setTags();
      return;
    }
    this.createBarChart();
    this.enableLocation();
    this.reloadRecurrent();
  }

  active: boolean = true;
  reloadRecurrent(){
    if(this.active){
      console.log('reloading after 10 seconds...');
      setTimeout(() => {
        this.loadParams();
      }, 10000);
    }else{
      console.log('reloading finished');
    }
  }

  ionViewWillEnter(){
    console.log('reloading ionViewWillEnter TRUE');
    this.active = true;
  }

  ionViewDidEnter(){
    console.log('reloading ionViewDidEnter TRUE');
    this.active = true;
  }

  ionViewWillLeave(){
    console.log('reloading ionViewWillLeave FALSE');
    this.active = false;
  }

  ionViewDidLeave(){
    console.log('reloading ionViewDidLeave FALSE');
    this.active = false;
  }

  statusEventText(item){
    if(item.initDate <= this.today && item.endDate >= this.today){
      return 'ON COURSE';
    }
    if(item.endDate > this.today){
      return 'ENDED';
    }
    if(item.initDate < this.today){
      return 'PROGRAMMED';
    }
  }

  ngOnInit() {
    this.init();
  }

  async respondInvitation(accept, event){
    if(accept && event.rhStaff.status != 'ENABLED'){
      this.toastService.presentToast('Status', 'Contact Administrator for further information', 'top', 'warning', 2000);
      return;
    }
    if(!this.isStaffAvailable(event)){
      this.toastService.presentToast('Error', 'You have an event on this same date/hour!', 'top', 'warning', 2000);
      return;
    }
    let action = (event.status=='INVITED' ? (accept?'accept':'reject') : (accept?'confirm':'cancel'));
    let title: string = 'Are you sure to ' + action + ' this event?';
    let amessage: string = 'Yes, ' + action + ' this event';
    let aclass: string = accept? 'success' : 'danger';

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
            this.updateEventStaffStatus(accept, event);
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

  isStaffAvailable(event){
    let busyEvents = this.eventsComing.filter(a => 'APPROVED,CONFIRMED'.includes(a.status) && event.eventId != a.eventId);
    return busyEvents.filter(a => this.hasConflict(a.rhEvent, event.rhEvent)).length == 0;
  }

  hasConflict(busyEvent, newEvent){
    if(newEvent.endDate >= busyEvent.initDate && newEvent.endDate <= busyEvent.endDate){
      // THIS EVENT ENDS WHEN THE BUSY EVENT IS ONGOING
      // console.log(newEvent, busyEvent);
      return true;
    }
    if(newEvent.initDate >= busyEvent.initDate && newEvent.initDate <= busyEvent.endDate){
      // THIS EVENT STARTS WHEN THE BUSY EVENT IS ONGOING
      // console.log(newEvent, busyEvent);
      return true;
    }
    if(newEvent.initDate <= busyEvent.initDate && newEvent.endDate >= busyEvent.endDate){
      // THIS EVENT CONTAINS THE BUSY EVENTS (STARTS BEFORE AND ENDS LATER)
      // console.log(newEvent, busyEvent);
      return true;
    }
    return false;
  }

  async updateEventStaffStatus(accept, event){
    let action = (event.status=='INVITED' ? (accept?'accepted':'rejected') : (accept?'confirmed':'cancelled'));
    let newStatus = (event.status=='INVITED' ? (accept?'PENDING':'DENIED') : (accept?'CONFIRMED':'CANCELLED'));
    let notification = (event.status=='INVITED' ? (accept ? this.paramInvitationAccept.valueEn : this.paramInvitationReject.valueEn) : (accept ? this.paramConfirmationAccept.valueEn : this.paramConfirmationReject.valueEn));

    this.loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Event...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await this.loading.present();
    let obj = { status: newStatus };
    this.eventService.updateEventStaff(event.id, obj)
      .subscribe(
      (resp) => {
        this.senderService.notifyEvent(event.eventId, 'ADMIN', notification).subscribe((resp) => {},(err) => {});
        this.logging.print(false, 'updateStatus', resp, undefined);
        this.loading.dismiss();
        this.toastService.presentToast('Success', 'Your event was ' + action + 'ed!', 'top', 'success', 2000);
        this.loadEvents();
      },
      (error) => {
        this.loading.dismiss();
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  async updateClockInOut(clockIn, event){
    let now = new Date().getTime();
    let objUpdate : any;
    if(clockIn){
      objUpdate = {
        clockIn: now,
        clockInLat: this.currentLocation['latitude'],
        clockInLng: this.currentLocation['longitude']
      }
    }else{
      objUpdate = {
        clockOut: now,
        clockOutLat: this.currentLocation['latitude'],
        clockOutLng: this.currentLocation['longitude']
      }
    }
    this.loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Event...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await this.loading.present();
    this.eventService.updateEventStaff(event.id, objUpdate)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'updateStatus', resp, undefined);
        this.loading.dismiss();
        this.toastService.presentToast('Success', 'Clock ' + (clockIn ? 'in' : 'out') + ' checked!', 'top', 'success', 2000);
        this.loadEvents();
      },
      (error) => {
        this.loading.dismiss();
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  gotoProfile(){
    this.router.navigateByUrl('/staff-profile');
  }

  longToDate(item){
    return new Date(item);
  }

  eventHours(item){
    return ((item.endDate - item.initDate) / 3600000).toFixed(1);
  }

  async confirmClock(item) {
    if(item.rhStaff.status != 'ENABLED'){
      this.toastService.presentToast('Status', 'Contact Administrator for further information', 'top', 'warning', 2000);
      return;
    }
    let title: string = 'Are you sure to check your clock ' + (!item.clockIn ? 'in?' : 'out?');
    let amessage: string = 'Yes, clock ' + (!item.clockIn ? 'in' : 'out');
    let aclass: string = (!item.clockIn ? 'success' : 'danger');

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
            this.updateClockInOut(!item.clockIn, item);
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

  enableLocation(){
    if(this.soonList.length == 0){
      if(this.subscribedLocation){
        console.log('GPS DISABLED');
        this.subscribedLocation.unsubscribe();
      }
      return;
    }
    console.log('GPS MUST BE ENABLED');
    this.getMyCurrentLocation();
  }

  getMyCurrentLocation(){
    if(this.subscribedLocation){
      console.log('GPS RESTARTED');
      this.subscribedLocation.unsubscribe();
    }
    console.log('GPS LISTENING LOCATIONS');
    this.subscribedLocation = this.geolocation.watchPosition().subscribe((data) => {
      this.zone.run(() => {
        this.logging.print(false, 'watchPosition', (data && data['coords']) ? (data['coords']['latitude'] + ',' + data['coords']['longitude']) : 'NULL DATA', undefined);
        this.currentLocation = data['coords'];
        this.soonList = this.events.filter( item => this.isSoon(item));
        this.recalcShowClockIn();
      });
    });
  }

  recalcShowClockIn(){
    for(let item of this.eventsComing){
      this.zone.run(() => {
        this.isNearLocation(item);
        let soonEvent = this.soonList.filter(a => a.id == item.id)[0];
        item.showClockIn = (!item.clockIn || !item.clockOut) && soonEvent && item.isnear;
        this.logging.print(false, 'cumple1', (!item.clockIn || !item.clockOut), undefined);
        this.logging.print(false, 'cumple2', soonEvent, undefined);
        this.logging.print(false, 'cumple3', item.isnear, undefined);
        this.logging.print(false, 'cumple4', item, undefined);
      });
    }
  }

  async isNearLocation(item){
    if(!this.validAccuracy()){
      //accuracy is bigger than min param
      item.isnear = false;
      return;
    }

    let lat1 = this.currentLocation['latitude'];
    let lon1 = this.currentLocation['longitude'];
    let lat2 = item.rhEvent.eventLat;
    let lon2 = item.rhEvent.eventLng;
    let distance = await this.getDistance(lat1,lon1,lat2,lon2);
    item.isnear = distance <= Number(this.paramsGeofence.valueEn);
    item.distanceFromEvent = distance;
  }

  getDistance(lat1,lon1,lat2,lon2){
    const R = 6371e3; // metres
    const delta1 = Number(lat1) * Math.PI/180;
    const delta2 = Number(lat2) * Math.PI/180;
    const p1 = (Number(lat2)-Number(lat1)) * Math.PI/180;
    const p2 = (Number(lon2)-Number(lon1)) * Math.PI/180;

    const a = Math.sin(p1/2) * Math.sin(p1/2) +
              Math.cos(delta1) * Math.cos(delta2) *
              Math.sin(p2/2) * Math.sin(p2/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Number((R * c).toFixed(0));
  }

  calcThisWeek(){
    let list = this.events.filter( a => a.clockIn && a.clockOut && this.isThisWeek(a.rhEvent));
    let horas = list.map(a => (a.clockOut-a.clockIn)/3600000).reduce((sum, current) => sum + current, 0);
    return horas.toFixed(0);
  }

  calcLastWeek(){
    let list = this.events.filter( a => a.clockIn && a.clockOut && this.isLastWeek(a.rhEvent));
    let horas = list.map(a => (a.clockOut-a.clockIn)/3600000).reduce((sum, current) => sum + current, 0);
    return horas.toFixed(0);
  }

  calcThisMonth(){
    let list = this.events.filter( a => a.clockIn && a.clockOut && this.isThisMonth(a.rhEvent));
    let horas = list.map(a => (a.clockOut-a.clockIn)/3600000).reduce((sum, current) => sum + current, 0);
    return horas.toFixed(0);
  }

  isThisWeek(a){
    //deberia ser (7-d), pero mejor tomar las cero horas del dia siguiente
    return a && this.initWeek && ((a.initDate >= this.initWeek && a.initDate < this.endWeek) ||
           (a.endDate >= this.initWeek && a.endDate < this.endWeek));
  }

  isLastWeek(a){
    return a && this.initLastWeek && ((a.initDate >= this.initLastWeek && a.initDate < this.endLastWeek) ||
           (a.endDate >= this.initLastWeek && a.endDate < this.endLastWeek));
  }

  isThisMonth(a){
    return a && this.initMonth && ((a.initDate >= this.initMonth && a.initDate < this.endMonth) ||
           (a.endDate >= this.initMonth && a.endDate < this.endMonth));
  }

  disabledEvent(item){
    return (item.status=='INVITED' && item.rhEvent.eventCloseDate < this.today) ||
           (item.status=='APPROVED' && (item.rhEvent.confirmationStartDateStaff > this.today || item.rhEvent.confirmationEndDateStaff < this.today));
  }

  isSoon(item){
    let isClockIn = !item.clockIn;
    let inBefore = 3600000 * Number(this.paramsClockin.valueEs);
    let inAfter = 3600000 * Number(this.paramsClockin.valueEn);
    let outBefore = 3600000 * Number(this.paramsClockout.valueEs);
    let outAfter = 3600000 * Number(this.paramsClockout.valueEn);

    return (isClockIn ? (
      (item.rhEvent.initDate - this.today) <= inBefore    // PUEDEN MARCAR ENTRADA DESDE X HORAS ANTES DEL INICIO DEL EVENTO
      && (this.today - item.rhEvent.endDate) <= inAfter   // HASTA X HORAS DESPUES DE FINALIZADO EL EVENTO
    ) : (
      (item.rhEvent.initDate - this.today) <= outBefore   // PUEDEN MARCAR SALIDA DESDE X HORAS ANTES DEL INICIO DEL EVENTO
      && (this.today - item.rhEvent.endDate) <= outAfter  // HASTA X HORAS DESPUES DE FINALIZADO EL EVENTO
    ));
  }

  setInitEndWeek(){
    let td = new Date(this.today);
    td.setHours(0);
    td.setMinutes(0);
    td.setSeconds(0);
    td.setMilliseconds(0);

    let d = td.getDay();
    d = (d == 0 ? 7 : d);

    this.initWeek = td.getTime() - ((d - 1) * 86400000);
    this.endWeek = td.getTime() + ((8 - d) * 86400000);

    this.initLastWeek = (td.getTime()-604800000) - ((d - 1) * 86400000);
    this.endLastWeek = (td.getTime()-604800000) + ((8 - d) * 86400000);

    let dm = new Date(this.today);
    dm.setHours(0);
    dm.setMinutes(0);
    dm.setSeconds(0);
    dm.setMilliseconds(0);
    dm.setDate(1);
    let em = new Date(dm.getTime());
    em.setMonth(dm.getMonth() < 11 ? (dm.getMonth() + 1) : 1);

    this.initMonth = dm.getTime();
    this.endMonth = em.getTime();
  }

  createBarChart() {
    this.thisWeek = Number(this.calcThisWeek());
    this.lastWeek = Number(this.calcLastWeek());
    this.thisMonth = Number(this.calcThisMonth());

    //CHART 1
    this.bar_chart_data_1.labels = ['hours','total'];
    this.bar_chart_data_1.datasets = [{
        data: [this.thisWeek, 100 - ((this.thisWeek/84) * 100)],
        backgroundColor: ['rgba(178, 189, 102, 1)','rgba(191,194,199, 0.1)'],
        borderColor: ['rgba(178, 189, 102, 1)','rgba(191,194,199, 0.1)'],
        borderWidth: 3
    }];

    //CHART 2
    this.bar_chart_data_2.labels = ['hours','total'];
    this.bar_chart_data_2.datasets = [{
        data: [this.lastWeek, 100 - ((this.lastWeek/84) * 100)],
        backgroundColor: ['rgba(199, 203, 170, 1)','rgba(191,194,199, 0.1)'],
        borderColor: ['rgba(199, 203, 170, 1)','rgba(191,194,199, 0.1)'],
        borderWidth: 3
    }];

    //CHART 3
    this.bar_chart_data_3.labels = ['hours','total'];
    this.bar_chart_data_3.datasets = [{
        data: [this.thisMonth, 100 - ((this.thisMonth/350) * 100)],
        backgroundColor: ['rgba(217, 194, 96, 1)','rgba(191,194,199, 0.1)'],
        borderColor: ['rgba(217, 194, 96, 1)','rgba(191,194,199, 0.1)'],
        borderWidth: 3
    }];
    this.content_loaded = true;
  }

}
