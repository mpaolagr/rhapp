import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// My plugins
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader, MissingTranslationHandler} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {IonicStorageModule} from '@ionic/storage-angular';
import {Drivers} from '@ionic/storage';
import {firebaseConfig} from '../config/firebase.config';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { AgmCoreModule } from '@agm/core';
import { NgCalendarModule  } from 'ionic2-calendar';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

//My Services
import {DataService} from '../services/data.services';
import {LogService} from '../services/log.services';
import {TranslateUniversalLoader} from '../services/translate.service';
import {PushService} from '../services/push.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'ios' }),
    ReactiveFormsModule,
    AppRoutingModule,
    NgChartsModule,
    IonicStorageModule.forRoot({
        name: '__rhstaffingapp',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]//'indexeddb', 'sqlite', 'websql']
    }),

    HttpClientModule,
    TranslateModule.forRoot({
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useClass: TranslateUniversalLoader
        },
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkBOeoEIr5THk23hwNvwsK7URW9n_KAzg'
    }),
    NgCalendarModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DataService,
    LogService,
    Geolocation,
    OneSignal,
    InAppBrowser,
    PushService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
