import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventsPageRoutingModule } from './events-routing.module';
import { NgCalendarModule  } from 'ionic2-calendar';
import { EventsPage } from './events.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventsPageRoutingModule,
    NgCalendarModule,
    TranslateModule
  ],
  declarations: [EventsPage]
})
export class EventsPageModule {}
