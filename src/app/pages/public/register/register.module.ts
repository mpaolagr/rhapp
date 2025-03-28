import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';

// Swiper
import { SwiperModule } from 'swiper/angular';

//my plugins
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    SwiperModule,
    ReactiveFormsModule,

    TranslateModule
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}
