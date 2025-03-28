import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffSkillsPage } from './staff-skills.page';

const routes: Routes = [
  {
    path: '',
    component: StaffSkillsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffSkillsPageRoutingModule {}
