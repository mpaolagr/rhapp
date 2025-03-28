import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffProfilePageRoutingModule } from './staff-profile-routing.module';

import { StaffProfilePage } from './staff-profile.page';

//my plugins
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffProfilePageRoutingModule,
    ReactiveFormsModule,

    TranslateModule
  ],
  declarations: [StaffProfilePage]
})
export class StaffProfilePageModule {}
