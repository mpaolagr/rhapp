import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetpassPageRoutingModule } from './setpass-routing.module';

import { SetpassPage } from './setpass.page';

//my plugins
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetpassPageRoutingModule,
    ReactiveFormsModule,

    TranslateModule
  ],
  declarations: [SetpassPage]
})
export class SetpassPageModule {}
