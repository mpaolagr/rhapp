import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, ModalController, LoadingController } from '@ionic/angular';
import { FilterPage } from './filter/filter.page';
import { EventService } from 'src/app/services/api/event.service';
import { StorageService } from 'src/app/services/data/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ROL_SUPERADMIN, ROL_ADMIN, ROL_MANAGER, ROL_STAFF } from 'src/config/rhapp.config';
import { CalendarMode, Step } from 'ionic2-calendar/calendar';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'src/services/log.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {

  lang: string = 'en';
  loading: any;
  content_loaded: boolean = false;

  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isManager: boolean = false;
  isStaff: boolean = false;

  myUserId: string = '';
  eventSource: any[] = [];
  clientsAdmin: any[] = [];

  viewTitle: string = '';
  calendar = {
      mode: 'month' as CalendarMode,
      scrollToHour: 1,
      locale: 'en-EN',
      preserveScrollPosition:true,
      step: 30 as Step,
      currentDate: new Date(),
      dateFormatter: {
          formatMonthViewDay: function(date:Date) {
              return date.getDate().toString();
          },
          formatMonthViewDayHeader: function(date:Date) {
              return 'MonMH';
          },
          formatMonthViewTitle: function(date:Date) {
              return 'testMT';
          },
          formatWeekViewDayHeader: function(date:Date) {
              return 'MonWH';
          },
          formatWeekViewTitle: function(date:Date) {
              return 'testWT';
          },
          formatWeekViewHourColumn: function(date:Date) {
              return 'testWH';
          },
          formatDayViewHourColumn: function(date:Date) {
              return 'testDH';
          },
          formatDayViewTitle: function(date:Date) {
              return 'testDT';
          }
      }
  };

  constructor(
    private router: Router,
    private logging: LogService,
    private eventService: EventService,
    private translate: TranslateService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.init();
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

    this.loadEvents();
  }

  async loadEvents(){
    this.loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Events...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await this.loading.present();
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

  getClientAdmin(){
    this.eventService.getClientAdmin(this.myUserId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getClientAdmin', resp, undefined);
        this.clientsAdmin = resp;
        this.getAdminEvents();
      },
      (error) => {
        this.logging.print(true, 'getClientAdmin', '', error);
      });
  }

  getAdminEvents(){
    let athis = this;
    this.eventService.getEvents()
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getAdminEvents', resp, undefined);
        this.loading.dismiss();
        this.processEvents(false, resp);
      },
      (error) => {
        this.loading.dismiss();
        this.processEvents(true, error);
      });
  }

  getStaffEvents(){
    this.eventService.getEventsByStaff(this.myUserId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getStaffEvents', resp, undefined);
        this.loading.dismiss();
        this.processEvents(false, resp);
      },
      (error) => {
        this.loading.dismiss();
        this.processEvents(true, error);
      });
  }

  getManagerEvents(){
    this.eventService.getEventsByManager(this.myUserId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'getManagerEvents', resp, undefined);
        this.loading.dismiss();
        this.processEvents(false, resp);
      },
      (error) => {
        this.loading.dismiss();
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
    this.eventSource = [];
    for(let aux of resp){
      let item = ((this.isAdmin || this.isSuperAdmin) ? aux : aux.rhEvent);
      this.eventSource.push({
        eventId: item.id,
        title: item.name,
        startTime: new Date(item.initDate),
        endTime: new Date(item.endDate),
        description: item.description,
        location: item.eventLat + ',' + item.eventLng,
        owner: (item.client? item.client.company : ''),
        allDay: false
      });
    }
    this.content_loaded = true;
  }

  changeLang(alang){
    this.lang = alang;
    this.translate.use(alang);
    this.storageService.set('config.language', this.lang);
    this.logging.print(false, 'change', 'lang: ' + this.lang, undefined);
  }

  // async filter() {
  //   const modal = await this.modalController.create({
  //     component: FilterPage,
  //     swipeToClose: true,
  //     presentingElement: this.routerOutlet.nativeEl
  //   });
  //
  //   await modal.present();
  //   let { data } = await modal.onWillDismiss();
  //   if (data) {
  //     this.content_loaded = false;
  //     setTimeout(() => {
  //       this.content_loaded = true;
  //     }, 2000);
  //   }
  // }

    onViewTitleChanged(title) {
        this.viewTitle = title;
    }

    onEventSelected(event) {
      this.logging.print(false, 'onEventSelected', 'Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title, undefined);
      this.router.navigateByUrl('/events/detail/' + event.eventId);
    }

    changeMode(mode) {
        this.calendar.mode = mode;
    }

    today() {
        this.calendar.currentDate = new Date();
    }

    onTimeSelected(ev) {
      // this.logging.print(false, 'onTimeSelected', ev, undefined);
    }

    onCurrentDateChanged(ev: Date) {
        //ON DATE CHANGE
        switch(this.calendar.mode){
          case 'month':{
            //RELOAD MONTH EVENTS
            this.logging.print(false, 'onChangedDate MONTH', ev, undefined);
            break;
          }
          case 'week':{
            //RELOAD WEEK EVENTS
            this.logging.print(false, 'onChangedDate WEEK', ev, undefined);
            break;
          }
          case 'day':{
            //RELOAD DAY EVENTS
            this.logging.print(false, 'onChangedDate DAY', ev, undefined);
            break;
          }
        }
    }

    createRandomEvents() {
        var events = [];
        for (var i = 0; i < 50; i += 1) {
            var date = new Date();
            var eventType = Math.floor(Math.random() * 2);
            var startDay = Math.floor(Math.random() * 90) - 45;
            var endDay = Math.floor(Math.random() * 2) + startDay;
            var startTime;
            var endTime;
            if (eventType === 0) {
                startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
                if (endDay === startDay) {
                    endDay += 1;
                }
                endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
                events.push({
                    title: 'Chatolic University Event',
                    startTime: startTime,
                    endTime: endTime,
                    allDay: true
                });
            } else {
                var startMinute = Math.floor(Math.random() * 24 * 60);
                var endMinute = Math.floor(Math.random() * 180) + startMinute;
                startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
                endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
                events.push({
                    title: 'Chatolic University Event',
                    startTime: startTime,
                    endTime: endTime,
                    allDay: false
                });
            }
        }
        return events;

        // events.push({
        //          eventId: doc.id,
        //          title: doc.data().title,
        //          startTime: doc.data().startTime.toDate(),
        //          endTime: doc.data().endTime.toDate(),
        //          description: doc.data().description,
        //          location: doc.data().location,
        //          owner: doc.data().owner,
        //          allDay: false,
        // this.eventSource = events;
    }

    markDisabled = (date:Date) => {
        var current = new Date();
        current.setHours(0, 0, 0);
        return date < current;
    };

}
