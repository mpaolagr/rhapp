import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordResetPageRoutingModule } from './password-reset-routing.module';

import { PasswordResetPage } from './password-reset.page';

//my plugins
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordResetPageRoutingModule,

    TranslateModule
  ],
  declarations: [PasswordResetPage]
})
export class PasswordResetPageModule {}
