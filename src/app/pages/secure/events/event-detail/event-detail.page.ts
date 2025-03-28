import { Component, OnInit } from '@angular/core';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LogService } from 'src/services/log.services';
import { ToastService } from 'src/app/services/toast/toast.service';
import { StorageService } from 'src/app/services/data/storage.service';
import { SenderService } from 'src/app/services/api/sender.service';
import { ParamsService } from 'src/app/services/api/params.service';
import { EventService } from 'src/app/services/api/event.service';
import { MessageService } from 'src/app/services/api/message.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ROL_SUPERADMIN, ROL_ADMIN, ROL_MANAGER, ROL_STAFF } from 'src/config/rhapp.config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit {

  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isManager: boolean = false;
  isStaff: boolean = false;

  staff: any;
  event: any;
  eventId: any;
  totalHours: string = '';
  workedHours: string = '';
  status: string = '';
  skillInvited: string;

  myUserId: any;
  staffs: any[] = [];
  invitedStaff: any[] = [];
  pendingStaff: any[] = [];
  deniedStaff: any[] = [];
  acceptedStaff: any[] = [];
  rejectedStaff: any[] = [];
  confirmedStaff: any[] = [];
  cancelledStaff: any[] = [];

  eventSkills: any[] = [];
  notifications: any[] = [];
  allskills: any[] = [];
  notificationsBackup: string;

  paramEventCancelled: any;
  paramStaffCancelled: any;
  paramReasons: any[] = [];
  reasonSelected: string = '';
  otherReason: string = '';

  constructor(
    private platform: Platform,
    private iabrowser: InAppBrowser,
    private logging: LogService,
    private alertController: AlertController,
    private paramsService: ParamsService,
    private senderService: SenderService,
    private eventService: EventService,
    private messageService: MessageService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.init();
  }

  async init(){
    let profile: string = <string>await this.storageService.get('auth.profile.rol', '');
    let aux = <string>await this.storageService.get('auth.profile', '');
    this.myUserId = JSON.parse(aux).account.id;

    this.isAdmin = (profile == ROL_ADMIN);
    this.isSuperAdmin = (profile == ROL_SUPERADMIN);
    this.isManager = (profile == ROL_MANAGER);
    this.isStaff = (profile == ROL_STAFF);

    this.eventId = this.activatedRoute.snapshot.paramMap.get('eventid');
    this.loadParams();
    this.loadEventDetails();
    this.loadEventSkills();
    this.loadNotifications();
  }

  longToDate(millis){
    return new Date(millis);
  }

  loadParams(){
    this.paramsService.getAll()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadParams', resp, undefined);
        this.paramReasons = resp.filter(item => item.paramKey == "REASONS_TO_CANCEL_STAFF");
        this.paramEventCancelled = resp.filter(item => item.paramKey == "EVENT_CANCELLED_MESSAGE")[0];
        this.paramStaffCancelled = resp.filter(item => item.paramKey == "CANCELLATION_MESSAGE_ACCEPTED")[0];
        this.allskills = resp.filter(item => item.paramKey == "SKILLS");
        if(this.isStaff){
          this.loadEventStatus();
        }
      },
      (error) => {
        if(this.isStaff){
          this.loadEventStatus();
        }
        //just in case of errors
        this.paramEventCancelled = {valueEn: 'Unfortunately the event was cancelled'};
        this.paramStaffCancelled = {valueEn: 'Staff cancelled event participation'};
      });
  }

  loadNotifications(){
    this.messageService.getListByEvent(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadNotifications', resp, undefined);
        this.processNotifications(false, resp);
      },
      (error) => {
        this.processNotifications(true, error);
      });
  }

  loadEventSkills(){
    this.eventService.getEventSkills(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadSkills', resp, undefined);
        this.eventSkills = resp;
      },
      (error) => {
        this.logging.print(true, 'loadEventSkills', '', error);
      });
  }

  async loadEventStatus(){
    await this.eventService.getStaffByEvent(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadEventStatus', resp, undefined);
        this.processMyStatus(false, resp);
      },
      (error) => {
        this.processMyStatus(true, error);
      });
  }

  async loadEventDetails(){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Details...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    await this.eventService.getEvent(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadEventDetails', resp, undefined);
        this.processEvents(false, resp);
        loading.dismiss();
        if(!this.isStaff){
          this.loadStaffEvent();
        }
      },
      (error) => {
        loading.dismiss();
        this.processEvents(true, error);
      });
  }

  async cancelEvent(){
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: ('Sure to cancel this event?'),
      message: 'Staff and Managers will be notified.',
      buttons: [
        {
          text: ('Yes, cancel event'),
          cssClass: 'danger',
          handler: async () => {
            alert.dismiss();
            this.cancelEventStatus();
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

  async cancelEventStatus(){
    let notification = this.paramEventCancelled.valueEn;

    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Event Status...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();
    let obj = { status: 'DISABLED' };
    this.eventService.updateEventStatus(this.eventId, obj)
      .subscribe(
      (resp) => {
        this.senderService.notifyEvent(this.eventId, 'ALL', notification).subscribe((resp) => {},(error) => {});
        this.logging.print(false, 'updateEventStatus', resp, undefined);
        loading.dismiss();
        this.toastService.presentToast('Success', 'Event cancelled succesfully!', 'top', 'success', 2000);
        this.init();
      },
      (error) => {
        loading.dismiss();
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  async loadStaffEvent(){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Staff...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    await this.eventService.getStaffByEvent(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getStaffByEvent', resp, undefined);
        loading.dismiss();
        this.processStaff(false, resp);
      },
      (error) => {
        loading.dismiss();
        this.processStaff(true, error);
      });
  }

  openMap(pickup){
    console.log('this.event', this.event);
    this.logging.print(false, 'openMap', 'opening map link', undefined);
    if(this.platform && this.platform.is('ios')){
      let iosUrl = pickup ? ('maps://?q=' + this.event.pickUpLat + ',' + this.event.pickUpLng) :
                            ('maps://?q=' + this.event.eventLat + ',' + this.event.eventLng);
      this.logging.print(false, 'openMap', 'opening IOS: ' + iosUrl, undefined);
      this.iabrowser.create(iosUrl,'_system');
      return;
    }
    if(this.platform && this.platform.is('android')){
      let androidUrl = "https://www.google.com/maps/dir/?api=1";
      androidUrl += pickup ? ("&destination=" + this.event.pickUpLat + "%2C" + this.event.pickUpLng) :
                             ("&destination=" + this.event.eventLat + "%2C" + this.event.eventLng);
      androidUrl += "&travelmode=driving&dir_action=navigate&optimize=timeWithTraffic";

      this.logging.print(false, 'openMap', 'opening ANDROID: ' + androidUrl, undefined);
      this.iabrowser.create(androidUrl,'_system');
    }
  }

  openClockMap(clockin){
    this.logging.print(false, 'openClockMap', 'opening map link', undefined);
    if(this.platform && this.platform.is('ios')){
      let iosUrl = clockin ? ('maps://?q=' + this.staff.clockInLat + ',' + this.staff.clockInLng) :
                            ('maps://?q=' + this.staff.clockOutLat + ',' + this.staff.clockOutLng);
      this.logging.print(false, 'openClockMap', 'opening IOS: ' + iosUrl, undefined);
      this.iabrowser.create(iosUrl,'_system');
      return;
    }
    if(this.platform && this.platform.is('android')){
      let androidUrl = "https://www.google.com/maps/dir/?api=1";
      androidUrl += clockin ? ("&destination=" + this.staff.clockInLat + "%2C" + this.staff.clockInLng) :
                             ("&destination=" + this.staff.clockOutLat + "%2C" + this.staff.clockOutLng);
      androidUrl += "&travelmode=driving&dir_action=navigate&optimize=timeWithTraffic";

      this.logging.print(false, 'openClockMap', 'opening ANDROID: ' + androidUrl, undefined);
      this.iabrowser.create(androidUrl,'_system');
    }
  }

  processMyStatus(isError, resp){
    if(isError){
      return;
    }
    this.staff = resp.filter(a => a.staffId == this.myUserId )[0];
    this.workedHours = ((this.staff.clockOut - this.staff.clockIn) / 3600000).toFixed(0);
    this.setSkillInvited();
    this.setCancellableStaff();
    this.filterNotifications();
    if(this.staff){
      this.parseStatusStaff();
    }
  }

  setSkillInvited(){
    try{
      if(this.staff && this.staff.paramSkillId){
        let aux = this.staff.paramSkillId;
        let skill = this.allskills.filter(a => a.id == aux)[0];
        this.skillInvited = skill.valueEn;
      }
    }catch(e){}
  }

  setCancellableStaff(){
    if(!this.staff){
      return;
    }
    this.staff.canCancel = this.canCancelThisEventStaff();
  }

  canCancelThisEventStaff(){
    let today = new Date().getTime();
    let confirmed = (this.staff.status == 'CONFIRMED' && this.event && this.event.initDate > today);
    let approved = confirmed || (this.staff.status == 'APPROVED' && this.event && this.event.confirmationEndDateStaff > today);
    return approved || confirmed;
  }

  async cancelStaff(){
    let today = new Date().getTime();
    let lessThan24Hours = (this.event.initDate - today > 86400000) ? '' : 'PENALTY FEES APPLY (LESS THAN 24 HOURS FOR EVENT)!';
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: ('Sure to cancel your invitation?'),
      message: (lessThan24Hours != '' ? lessThan24Hours : 'This action can not be undone.'),
      buttons: [
        {
          text: ('Yes, cancel'),
          cssClass: 'danger',
          handler: async () => {
            alert.dismiss();
            this.cancelEventStaff();
          }
        },
        {
          text: 'Back',
          role: 'cancel',
          cssClass: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async cancelEventStaff(){
    let notification = this.paramStaffCancelled.valueEn;

    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Event Status...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();
    let obj = { status: 'CANCELLED', rejectedReason: (this.reasonSelected != 'other' ? this.reasonSelected : this.otherReason) };
    this.eventService.updateEventStaff(this.staff.id, obj)
      .subscribe(
      (resp) => {
        this.senderService.notifyEvent(this.eventId, 'ADMIN', notification).subscribe((resp) => {},(error) => {});
        this.logging.print(false, 'cancelEventStaff', resp, undefined);
        loading.dismiss();
        this.toastService.presentToast('Success', 'Event invitation cancelled succesfully!', 'top', 'success', 2000);
        this.init();
      },
      (error) => {
        loading.dismiss();
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  processEvents(isError, resp){
    if(isError){
      this.toastService.presentToast('Error', 'Could not load event details', 'top', 'warning', 1000);
      return;
    }
    this.event = resp;
    this.event.totalHours = ((this.event.endDate - this.event.initDate) / 3600000).toFixed(0);
    this.event.initDateObj = new Date(this.event.initDate);
    this.event.endDateObj = new Date(this.event.endDate);

    this.event.confirmationStartDateStaffObj = this.event.confirmationStartDateStaff ? new Date(this.event.confirmationStartDateStaff) : undefined;
    this.event.confirmationEndDateStaffObj = this.event.confirmationEndDateStaff ? new Date(this.event.confirmationEndDateStaff) : undefined;
    this.event.eventCloseDateObj = this.event.eventCloseDate ? new Date(this.event.eventCloseDate) : undefined;
    this.event.pickUpDateObj = this.event.pickUpDate ? new Date(this.event.pickUpDate) : undefined;
    this.event.canBeCancelled = (this.event.status == 'ENABLED' && this.event.initDate > new Date().getTime());
    this.storageService.set('selected.event', JSON.stringify(resp));
    this.setCancellableStaff();
    this.parseStatus();
  }

  processNotifications(isError, resp){
    if(isError){
      this.logging.print(true, 'processNotifications', '', resp);
      return;
    }
    this.notifications = resp.sort( (b,a) => {return a.createdDate - b.createdDate; });
    this.notificationsBackup = JSON.stringify(this.notifications);
    this.filterNotifications();
  }

  filterNotifications(){
    if(!this.notificationsBackup){
      return;
    }
    let aux = JSON.parse(this.notificationsBackup);
    this.notifications = aux.filter(a => this.validForThisStaff(a));
  }

  validForThisStaff(a){
    if(!a.subject || a.subject == 'ALL'){ return true; }
    if(!this.isStaff){ return true; }
    if(!this.staff){ return false; }
    switch(this.staff.status){
      case 'INVITED':{ return (!a.subject || 'INVITED'.includes(a.subject)); }
      case 'PENDING':{ return (!a.subject || 'INVITED,PENDING'.includes(a.subject)); }
      case 'APPROVED':{ return (!a.subject || 'INVITED,PENDING,APPROVED'.includes(a.subject)); }
      case 'CONFIRMED':{ return (!a.subject || 'INVITED,PENDING,APPROVED,CONFIRMED'.includes(a.subject)); }
    }
    return false;
  }

  processStaff(isError, resp){
    if(isError){
      this.toastService.presentToast('Error', 'Could not load staff list', 'top', 'warning', 1000);
      return;
    }
    this.staffs = resp;
    // INITIAL STATUS FOR INVITED STAFF
    this.invitedStaff = this.staffs.filter(a=>a.status == 'INVITED' || a.status == 'ENABLED');
    // STAFF RESPONSE TO AN INVITATION
    this.pendingStaff = this.staffs.filter(a=>a.status == 'PENDING');//STAFF ACCEPTED
    this.deniedStaff = this.staffs.filter(a=>a.status == 'DENIED');//STAFF DENIED
    // INVITATION RESPONSE FROM MANAGER/ADMIN
    this.acceptedStaff = this.staffs.filter(a=>a.status == 'APPROVED');//ADMIN ACCEPT STAFF CONFIRMATION
    this.rejectedStaff = this.staffs.filter(a=>a.status == 'REJECTED');//ADMIN REJECT STAFF CONFIRMATION
    // 3 DAYS CONFIRMATION
    this.confirmedStaff = this.staffs.filter(a=>a.status == 'CONFIRMED');//STAFF CONFIRM PARTICIPATION
    this.cancelledStaff = this.staffs.filter(a=>a.status == 'CANCELLED');//STAFF CANCEL PARTICIPATION
  }

  parseStatus(){
    let today = new Date().getTime();
    switch (this.event.status) {
      case 'ENABLED':
      case 'PENDING':{
        if(this.event.initDate > today){
          this.event.statusColor = 'success';
          this.event.statusVisual = 'Scheduled';
        }else{
          if(this.event.endDate > today){
            this.event.statusColor = 'success';
            this.event.statusVisual = 'OnGoing';
          }else{
            this.event.statusColor = 'success';
            this.event.statusVisual = 'Ended';
          }
        }
        return;
      }
      case 'ACTIVE':{
        if(this.event.initDate > today){
          this.event.statusColor = 'success';
          this.event.statusVisual = 'Scheduled';
        }else{
          if(this.event.endDate > today){
            this.event.statusColor = 'success';
            this.event.statusVisual = 'OnGoing';
          }else{
            this.event.statusColor = 'success';
            this.event.statusVisual = 'Ended';
          }
        }
        return;
      }
      case 'DISABLED':{
        this.event.statusColor = 'danger';
        this.event.statusVisual = 'Canceled';
        return;
      }
    }
  }

  parseStatusStaff(){
    let today = new Date().getTime();
    switch (this.staff.status) {
      case 'ENABLED':
      case 'INVITED':{
        this.staff.statusColor = 'success';
        this.staff.statusVisual = 'You were Invited, ';
        this.staff.statusVisual += (this.staff.rhEvent.eventCloseDate <= today ? 'but you did not respond on time' : 'do not forget to  respond!');
        return;
      }
      case 'PENDING':{
        this.staff.statusColor = 'warning';
        this.staff.statusVisual = (this.staff.rhEvent.confirmationEndDateStaff < today ? 'Unfortunately, vacancies were filled' : 'Waiting for admin acceptance...');
        return;
      }
      case 'DENIED':{
        this.staff.statusColor = 'danger';
        this.staff.statusVisual = 'You rejected this event';
        return;
      }
      case 'APPROVED':{
        this.staff.statusColor = (this.staff.rhEvent.confirmationEndDateStaff < today ? 'danger' : 'success');
        this.staff.statusVisual = (this.staff.rhEvent.confirmationEndDateStaff < today ? 'Unfortunately you did not confirm on time!' : 'You were accepted to work at this event, do not forget to confirm!');
        return;
      }
      case 'REJECTED':{
        this.staff.statusColor = 'danger';
        this.staff.statusVisual = 'Unfortunately, vacancies were filled';
        return;
      }
      case 'CONFIRMED':{
        this.staff.statusColor = 'success';
        this.staff.statusVisual = 'You confirmed your participation at this event, we count on you!';
        return;
      }
      case 'CANCELLED':{
        this.staff.statusColor = 'danger';
        this.staff.statusVisual = 'You cancelled this event';
        return;
      }
    }
  }

}
