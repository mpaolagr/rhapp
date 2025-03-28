import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventStaffPage } from './event-staff.page';

const routes: Routes = [
  {
    path: '',
    component: EventStaffPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventStaffPageRoutingModule {}
