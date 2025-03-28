import { Component } from '@angular/core';
import { AlertController, IonRouterOutlet, ModalController, LoadingController } from '@ionic/angular';
import {ROL_SUPERADMIN, ROL_ADMIN, ROL_MANAGER, ROL_STAFF} from 'src/config/rhapp.config';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MessageService } from 'src/app/services/api/message.service';
import { EventService } from 'src/app/services/api/event.service';
import { StaffService } from 'src/app/services/api/staff.service';
import { SenderService } from 'src/app/services/api/sender.service';
import { StorageService } from 'src/app/services/data/storage.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage {

  messages: any[];
  content_loaded: boolean = false;

  staffs: any[];
  events: any[];
  customers: any[];
  isSuperAdmin: boolean = false;

  newmessage: any = {
    content: '',
    eventId: 0,
    accountId: undefined,
    subject: 'ALL'
  };

  account: any;
  loading: any;

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastService: ToastService,
    private messageService: MessageService,
    private staffService: StaffService,
    private eventService: EventService,
    private senderService: SenderService,
    private storageService: StorageService,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet
  ) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.newmessage = { content: '', eventId: 0, accountId: undefined, subject: 'ALL' };
    let aux = <string>await this.storageService.get('auth.profile', '');
    this.account = JSON.parse(aux).account;

    let profile:string = <string>await this.storageService.get('auth.profile.rol', '');
    this.isSuperAdmin = (profile == ROL_SUPERADMIN);

    this.getMessages();
    if(this.isSuperAdmin){
      this.loadEvents();
    }else{
      this.loadCustomers();
    }
    this.loadStaff();
  }

  async getMessages(){
    this.messageService.getList()
      .subscribe(
      (resp) => {
        this.messages = resp.sort( (b,a) => {return a.createdDate - b.createdDate; });
        this.content_loaded = true;
      },
      (error) => {
        this.content_loaded = true;
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  loadStaff(){
    this.staffService.getList().subscribe(
      (resp) => { this.staffs = resp; },
      (error) => {});
  }

  loadCustomers(){
    this.eventService.getClientAdmin(this.account.id).subscribe(
      (resp) => {
        this.customers = resp;
        this.loadEvents();
      },
      (error) => {});
  }

  loadEvents(){
    this.eventService.getEvents().subscribe(
      (resp) => {
        if(!this.isSuperAdmin){
          resp = resp.filter(a => this.customers.filter(b => b.clientId == a.clientId).length > 0);
        }
        this.events = resp;
      },
      (error) => {});
  }

  longToDate(millis){
    return new Date(millis);
  }

  selectStaff(item){
    this.newmessage.accountId = item.target['value'];
  }

  selectEvent(item){
    this.newmessage.eventId = item.target['value'];
  }

  selectSubject(item){
    this.newmessage.subject = item.target['value'];
  }

  async save() {
    if (this.validateData()) {
      this.loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: '<p>Sending message...</p><span>Please be patient.</span>',
        spinner: 'crescent'
      });
      await this.loading.present();
      this.sendMessage();
    }
  }

  sendMessage(){
    this.newmessage.eventId = (this.newmessage.eventId != 0 ? this.newmessage.eventId : undefined);
    this.newmessage.fromName = this.account.name;
    this.newmessage.fromAddress = 'Mobile App';
    this.loading.dismiss();
    this.sendPushNotification();
    this.messageService.send(this.newmessage)
      .subscribe(
      (resp) => {
        this.toastService.presentToast('Message sent', 'Message sent successfully', 'top', 'success', 2000);
        this.loading.dismiss();
        this.init();
      },
      (error) => {
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  sendPushNotification(){
    if(this.newmessage.eventId){
      this.senderService.notifyEvent(this.newmessage.eventId, this.newmessage.subject, this.newmessage.content).subscribe((resp) => {},(err) => {});
    }else{
      this.senderService.notifyAll(this.newmessage.content).subscribe((resp) => {},(err) => {});
    }
  }

  validateData(){
    if(this.newmessage.content.length < 5){
      this.toastService.presentToast('Error', 'Type a valid message to send', 'top', 'warning', 2000);
      return false;
    }
    return true;
  }

}
