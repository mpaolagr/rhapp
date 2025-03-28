import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsPage } from './events.page';

const routes: Routes = [
  {
    path: '',
    component: EventsPage
  },
  {
    path: 'filter',
    loadChildren: () => import('./filter/filter.module').then( m => m.FilterPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsPageRoutingModule {}
