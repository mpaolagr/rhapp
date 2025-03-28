import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffDetailPageRoutingModule } from './staff-detail-routing.module';

import { StaffDetailPage } from './staff-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffDetailPageRoutingModule
  ],
  declarations: [StaffDetailPage]
})
export class StaffDetailPageModule {}
