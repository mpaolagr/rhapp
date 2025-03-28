import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { LogService } from 'src/services/log.services';
import { StorageService } from 'src/app/services/data/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ParamsService } from 'src/app/services/api/params.service';
import { EventService } from 'src/app/services/api/event.service';
import { SenderService } from 'src/app/services/api/sender.service';
import { StaffService } from 'src/app/services/api/staff.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-staff',
  templateUrl: './event-staff.page.html',
  styleUrls: ['./event-staff.page.scss'],
})
export class EventStaffPage implements OnInit {

  content_loaded: boolean = false;
  eventId: any = 0;

  invitedStaff: any[] = [];
  pendingStaff: any[] = [];
  deniedStaff: any[] = [];
  acceptedStaff: any[] = [];
  rejectedStaff: any[] = [];
  confirmedStaff: any[] = [];
  cancelledStaff: any[] = [];

  staffSkills: any[] = [];
  eventSkills: any[] = [];

  paramPendingAccepted: any;
  paramPendingRejected: any;
  paramConfirmation: any;
  paramReminder: any;

  validDate: boolean = false;

  constructor(
    private logging: LogService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private paramsService: ParamsService,
    private senderService: SenderService,
    private eventService: EventService,
    private staffService: StaffService,
    private toastService: ToastService,
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('eventid');
    this.loadParams();
    this.loadStaffSkills();
    this.loadEventSkills();
  }

  async loadStaffEvent(){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Staff...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    this.eventService.getStaffByEvent(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadStaffEvent', resp, undefined);
        loading.dismiss();
        this.processStaffEvent(false, resp);
      },
      (error) => {
        loading.dismiss();
        this.content_loaded = true;
        this.processStaffEvent(true, error);
      });
  }

  loadStaffSkills(){
    this.staffService.staffSkills()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadStaffSkills', resp, undefined);
        this.staffSkills = resp;
        this.loadStaffEvent();
      },
      (error) => {
        this.loadStaffEvent();
        this.logging.print(true, 'loadStaffSkills', '', error);
      });
  }

  loadEventSkills(){
    this.eventService.getEventSkills(this.eventId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadEventSkills', resp, undefined);
        this.eventSkills = resp;
      },
      (error) => {
        this.logging.print(true, 'loadEventSkills', '', error);
      });
  }

  loadParams(){
    this.paramsService.getAll()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadParams', resp, undefined);

        this.paramPendingAccepted = resp.filter(item => item.paramKey == "PENDING_MESSAGE_ACCEPTED")[0];
        this.paramPendingRejected = resp.filter(item => item.paramKey == "PENDING_MESSAGE_REJECTED")[0];
        this.paramConfirmation = resp.filter(item => item.paramKey == "CONFIRMATION_MESSAGE_REMINDER")[0];
        this.paramReminder = resp.filter(item => item.paramKey == "BEFORE_24HOURS_MESSAGE_REMINDER")[0];
      },
      (error) => {
        //just in case of errors
        this.paramPendingAccepted = {valueEn: 'You were accepted for this event!'};
        this.paramPendingRejected = {valueEn: 'Unfortunately vacancies were filled for this event!'};
        this.paramConfirmation = {valueEn: 'Confirm your participation on the coming event!'};
        this.paramReminder = {valueEn: 'This is a reminder for your tomorrow event, we count on you!'};
      });
  }

  processStaffEvent(isError, resp){
    if(isError){
      this.content_loaded = true;
      this.toastService.presentToast('Error', 'Could not load staff list', 'top', 'warning', 1000);
      return;
    }
    if(resp[0]){
      let today = new Date().getTime();
      let aux = resp[0].rhEvent;
      this.validDate = (aux.initDate > today);
    }
    for(let item of resp){
      item.skills = this.getSkills(item);
    }
    // INITIAL STATUS FOR INVITED STAFF
    this.invitedStaff = resp.filter(a=>a.status == 'INVITED' || a.status == 'ENABLED');
    // STAFF RESPONSE TO AN INVITATION
    this.pendingStaff = resp.filter(a=>a.status == 'PENDING');//STAFF ACCEPTED
    this.deniedStaff = resp.filter(a=>a.status == 'DENIED');//STAFF DENIED
    // INVITATION RESPONSE FROM MANAGER/ADMIN
    this.acceptedStaff = resp.filter(a=>a.status == 'APPROVED');//ADMIN ACCEPT STAFF CONFIRMATION
    this.rejectedStaff = resp.filter(a=>a.status == 'REJECTED');//ADMIN REJECT STAFF CONFIRMATION
    // 3 DAYS CONFIRMATION
    this.confirmedStaff = resp.filter(a=>a.status == 'CONFIRMED');//STAFF CONFIRM PARTICIPATION
    this.confirmedStaff = this.confirmedStaff.sort( (b,a) => {return a.clockIn ? (b.clockIn ? (b.clockIn - a.clockIn) : 1) : -1; });
    this.cancelledStaff = resp.filter(a=>a.status == 'CANCELLED');//STAFF CANCEL PARTICIPATION
    this.content_loaded = true;
  }

  getSkills(item){
    let list = this.staffSkills.filter(a => a.parameterId == item.paramSkillId);
    if(list.length > 0){
      return list[0].rhParameter.valueEn;
    }
    return 'No skills set';
  }

  longToDate(millis){
    return new Date(millis);
  }

  // availableSkill: any;
  isVacancy(item){
    // this.availableSkill = undefined;
    // OBTENER LOS SKILL DEL EVENT-STAFF SELECCIONADO (ITEM)
    // let skills = this.staffSkills.filter(a => a.staffId == item.staffId);
    // for(let skill of skills){
      let skill = item.paramSkillId;
      //VALIDAR PARA CADA SKILL DE ESTE STAFF, SI ESTAN BUSCANDO PARA SU PUESTO
      let needed = this.eventSkills.filter(a => a.paramSkillId == skill)[0];
      let quantity = needed?.quantity;
      if(needed && quantity){
        // VALIDAR SI HAY CUPO, PRIMERO OBTENIENDO EL paramSkillId DE LOS ACEPTADOS/CONFIRMADOS
        let alreadyAccepted = this.acceptedStaff.filter(a => a.paramSkillId == skill).length;
        alreadyAccepted += this.confirmedStaff.filter(a => a.paramSkillId == skill).length;

        // VALIDAR SI HAY CUPO COMPARANDO LOS ACEPTADOS SEAN MENOR A LOS NECESITADOS
        if(alreadyAccepted < quantity){
          // this.availableSkill = skill.parameterId;
          return true;
        }
      }
    // }
    return false;
  }

  //INVITED STAFF-EVENT STATUS
  async pending(accept, item){
    if(accept && item.rhStaff.status != 'ENABLED'){
      this.toastService.presentToast('Status', 'Contact Administrator for further information', 'top', 'warning', 2000);
      return;
    }
    if(accept && !this.isVacancy(item)){
      this.toastService.presentToast('Vacancy', 'There is no space for this staff position', 'top', 'warning', 2000);
      return;
    }
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: ('Sure to ' + (accept ? 'accept ' : 'reject ') + 'this staff to the event?'),
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: ('Yes, ' + (accept ? 'Accept ' : 'Reject ')),
          cssClass: (accept ? 'success' : 'danger'),
          handler: async () => {
            alert.dismiss();
            this.updateEventStaffStatus(accept, item);
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

  async updateEventStaffStatus(accept, event){
    let action = (accept?'approved':'rejected');
    let approved = (event.rhEvent && event.rhEvent.isQuickEvent == true? 'CONFIRMED' : 'APPROVED');
    let newStatus = (accept?approved:'REJECTED');
    let notification = (accept ? this.paramPendingAccepted.valueEn : this.paramPendingRejected.valueEn);
    let confirmation = this.paramConfirmation.valueEn;
    let reminder24Hours = this.paramReminder.valueEn;

    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Updating Staff Status...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();
    // let objA = { status: newStatus, paramSkillId: this.availableSkill };
    let objR = { status: newStatus };
    // this.eventService.updateEventStaff(event.id, accept ? objA: objR)
    this.eventService.updateEventStaff(event.id, objR)
      .subscribe(
      (resp) => {
        let today = new Date().getTime();
        let reminder24HoursBefore = event.rhEvent.initDate - 86400000;//24 hours before event init
        reminder24HoursBefore = (reminder24HoursBefore < today ? (today + 600000) : reminder24HoursBefore);//if is past, notify in 10 minutes
        this.senderService.notifyUser(event.staffId, notification).subscribe((resp) => {},(err) => {});
        if(event.rhEvent.isQuickEvent != true){
          this.senderService.programUser(event.staffId, event.rhEvent.confirmationStartDateStaff, confirmation).subscribe((resp) => {},(err) => {});
        }
        this.senderService.programUser(event.staffId, reminder24HoursBefore, reminder24Hours).subscribe((resp) => {},(err) => {});
        this.logging.print(false, 'updateEventStaff', resp, undefined);
        loading.dismiss();
        this.toastService.presentToast('Success', 'Staff ' + action + ' succesfully!', 'top', 'success', 2000);
        this.loadStaffEvent();
      },
      (error) => {
        loading.dismiss();
        this.toastService.presentToast('Error', 'There was an error, please try again', 'top', 'warning', 2000);
      });
  }

  //INVITED STAFF-EVENT STATUS (MASSIVE OPTION)
  // async confirm(accept) {
  //   const alert = await this.alertController.create({
  //     cssClass: 'custom-alert',
  //     header: ('Sure to ' + (accept ? 'accept ' : 'reject ') + 'all invitations?'),
  //     message: 'This action cannot be undone.',
  //     buttons: [
  //       {
  //         text: ('Yes, ' + (accept ? 'Accept ' : 'Reject ')),
  //         cssClass: (accept ? 'success' : 'danger'),
  //         handler: async () => {
  //           //APPROVE/REJECT ALL PENDING STAFF-EVENT STATUS AND NOTIFY
  //           this.toastService.presentToast('Success', (accept ? 'Accepted' : 'Rejected') + ' successfully', 'top', 'success', 2000);
  //         }
  //       },
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         cssClass: 'cancel'
  //       }
  //     ]
  //   });
  //
  //   await alert.present();
  // }

}
