import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/secure/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'staff',
        loadChildren: () => import('../pages/secure/staff/staff.module').then(m => m.StaffPageModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('../pages/secure/notifications/notifications.module').then( m => m.NotificationsPageModule)
      },
      {
        path: 'staff-skills',
        loadChildren: () => import('../pages/secure/staff-skills/staff-skills.module').then(m => m.StaffSkillsPageModule)
      },
      {
        path: 'staff-profile',
        loadChildren: () => import('../pages/secure/staff-profile/staff-profile.module').then(m => m.StaffProfilePageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../pages/secure/settings/settings.module').then(m => m.SettingsPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
