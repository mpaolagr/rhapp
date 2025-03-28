import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetpassPage } from './setpass.page';

const routes: Routes = [
  {
    path: '',
    component: SetpassPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetpassPageRoutingModule {}
