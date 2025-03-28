import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { LogService } from 'src/services/log.services';
import { StaffService } from 'src/app/services/api/staff.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-staff-detail',
  templateUrl: './staff-detail.page.html',
  styleUrls: ['./staff-detail.page.scss'],
})
export class StaffDetailPage implements OnInit {

  staffId: any;
  staff: any;
  additionals: any[];

  skills: any[] = [];
  languages: any[] = [];
  workPlaces: any[] = [];
  maritalStatus: any;
  profilePicture: any;

  legalDocs: any[] = [];

  constructor(
    private logging: LogService,
    private staffService: StaffService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.staffId = this.activatedRoute.snapshot.paramMap.get('staffid');
    this.loadDetails();
  }

  async loadDetails(){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Details...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    await this.staffService.getInfo(this.staffId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadDetails', resp, undefined);
        this.processStaff(false, resp);
        loading.dismiss();
        this.loadAdditionals();
      },
      (error) => {
        loading.dismiss();
        this.processStaff(true, error);
      });
  }

  async loadAdditionals(){
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Loading Positions...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    await this.staffService.getAdditional(this.staffId)
      .subscribe(
      (resp) => {
        this.logging.print(false, 'loadAdditionals', resp, undefined);
        loading.dismiss();
        this.processAdditionals(false, resp);
      },
      (error) => {
        loading.dismiss();
        this.processAdditionals(true, error);
      });
  }

  processStaff(isError, resp){
    if(isError){
      this.toastService.presentToast('Error', 'Could not load staff details', 'top', 'warning', 1000);
      return;
    }
    this.staff = resp;
  }

  processAdditionals(isError, resp){
    if(isError){
      this.toastService.presentToast('Error', 'Could not load staff positions', 'top', 'warning', 1000);
      return;
    }
    this.additionals = resp;
    this.skills = resp.filter( a => a.rhParameter.paramKey == 'SKILLS');
    this.languages = resp.filter( a => a.rhParameter.paramKey == 'LANGUAGES');
    this.workPlaces = resp.filter( a => a.rhParameter.paramKey == 'STATES');
    this.maritalStatus = resp.filter( a => a.rhParameter.paramKey == 'MARITAL_STATUS')[0];
    this.profilePicture = resp.filter( a => a.rhParameter.paramKey == 'STAFF_PROFILE_PICTURE')[0];
    this.legalDocs = resp.filter( a => a.rhParameter.paramKey == 'STAFF_ADDITIONAL_FILES');
  }

  getSkills(){
    let result: any[] = [];
    for(let item of this.skills){
      result.push(item.rhParameter.valueEn);
    }
    return result.toString();
  }

  getLanguages(){
    let result: any[] = [];
    for(let item of this.languages){
      result.push(item.rhParameter.valueEn);
    }
    return result.toString();
  }

  getPlaces(){
    let result: any[] = [];
    for(let item of this.workPlaces){
      result.push(item.rhParameter.valueEn);
    }
    return result.toString();
  }

  longToDate(item){
    return new Date(item);
  }

  getAge(){
    return ((new Date().getTime() - this.staff.birthday)/31536000000).toFixed(0) + ' años ';
  }

  parseDocName(item){
    switch(item){
      case 'greenCardPicture':{ return 'Green Card';}
      case 'dniPicture':{ return 'Government Issued ID';}
      case 'formi9Picture':{ return 'Form i9';}
      case 'socialSecurityPicture':{ return 'Social Security';}
    }
    return item;
  }

}
