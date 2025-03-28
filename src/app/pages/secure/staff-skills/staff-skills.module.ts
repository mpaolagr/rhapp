import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffSkillsPageRoutingModule } from './staff-skills-routing.module';

import { StaffSkillsPage } from './staff-skills.page';

//my plugins
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffSkillsPageRoutingModule,
    ReactiveFormsModule,

    TranslateModule
  ],
  declarations: [StaffSkillsPage]
})
export class StaffSkillsPageModule {}
