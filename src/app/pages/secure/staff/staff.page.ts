import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { LogService } from 'src/services/log.services';
import { StorageService } from 'src/app/services/data/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { EventService } from 'src/app/services/api/event.service';
import { StaffService } from 'src/app/services/api/staff.service';
import { SenderService } from 'src/app/services/api/sender.service';
import { ParamsService } from 'src/app/services/api/params.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPage implements OnInit {

  content_loaded: boolean = false;

  staffs: any[] = [];
  registeredStaff: any[] = [];
  enabledStaff: any[] = [];
  disabledStaff: any[] = [];

  messageAccepted: any;
  messageRejected: any;

  constructor(
    private logging: LogService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private paramsService: ParamsService,
    private eventService: EventService,
    private staffService: StaffService,
    private senderService: SenderService,
    private toastService: ToastService,
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadStaff();
    this.loadParams();
  }

  async loadStaff(){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Staff...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    this.staffService.getList()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadStaff', resp, undefined);
        loading.dismiss();
        this.processStaff(false, resp);
      },
      (error) => {
        loading.dismiss();
        this.content_loaded = true;
        this.processStaff(true, error);
      });
  }

  loadParams(){
    this.paramsService.getAll()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadParams', resp, undefined);
        this.messageAccepted = resp.filter(item => item.paramKey == "STAFF_MESSAGE_ACCEPTED")[0];
        this.messageRejected = resp.filter(item => item.paramKey == "STAFF_MESSAGE_REJECTED")[0];
      },
      (error) => {
        //just in case of errors
        this.messageAccepted = {valueEn: 'Your application was accepted!'};
        this.messageRejected = {valueEn: 'Your application was not accepted at this moment!'};
      });
  }

  processStaff(isError, resp){
    if(isError){
      this.content_loaded = true;
      this.toastService.presentToast('Error', 'Could not load staff list', 'top', 'warning', 1000);
      return;
    }
    this.staffs = resp;
    this.content_loaded = true;
    this.registeredStaff = resp.filter(a=>a.status == 'PENDING');
    this.enabledStaff = resp.filter(a=>a.status == 'ENABLED');
    this.disabledStaff = resp.filter(a=>a.status == 'DISABLED');
  }

  longToDate(millis){
    return new Date(millis);
  }

  //PENDING STAFF STATUS
  async registered(accept, item){
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: ('Sure to ' + (accept ? 'accept ' : 'reject ') + 'this staff?'),
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: ('Yes, ' + (accept ? 'Accept ' : 'Reject ')),
          cssClass: (accept ? 'success' : 'danger'),
          handler: async () => {
            this.enableStaff(accept, item);
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

  async enableStaff(accept, item){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Application...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    this.staffService.enable(accept, item)
      .subscribe(
      (resp) => {
        loading.dismiss();
        this.processEnable(false, resp, accept, item);
      },
      (error) => {
        loading.dismiss();
        this.content_loaded = true;
        this.processEnable(true, error, accept, item);
      });
  }

  processEnable(isError, resp, accept, item){
    this.logging.print(isError, 'processEnable', resp, resp);
    if(isError){
      return;
    }
    let message = accept ? this.messageAccepted.valueEn : this.messageRejected.valueEn;
    this.senderService.notifyUser(item.id, message).subscribe((resp) => {},(err) => {});
    this.toastService.presentToast('Success', (accept ? 'Accepted' : 'Rejected') + ' successfully', 'top', 'success', 2000);
    this.loadStaff();
  }

}
