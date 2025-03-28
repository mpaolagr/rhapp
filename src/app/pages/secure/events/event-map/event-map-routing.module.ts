import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventMapPage } from './event-map.page';

const routes: Routes = [
  {
    path: '',
    component: EventMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventMapPageRoutingModule {}
