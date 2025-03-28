import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventStaffPageRoutingModule } from './event-staff-routing.module';

import { EventStaffPage } from './event-staff.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventStaffPageRoutingModule
  ],
  declarations: [EventStaffPage]
})
export class EventStaffPageModule {}
