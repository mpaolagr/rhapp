import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./../../tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule)
  },
  {
    path: 'events/detail/:eventid',
    loadChildren: () => import('./events/event-detail/event-detail.module').then( m => m.EventDetailPageModule)
  },
  {
    path: 'events/staff/:eventid',
    loadChildren: () => import('./events/event-staff/event-staff.module').then( m => m.EventStaffPageModule)
  },
  {
    path: 'events/map',
    loadChildren: () => import('./events/event-map/event-map.module').then( m => m.EventMapPageModule)
  },
  {
    path: 'staff/:staffid',
    loadChildren: () => import('./staff/staff-detail/staff-detail.module').then( m => m.StaffDetailPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecureRoutingModule { }
