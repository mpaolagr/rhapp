import { Component } from '@angular/core';
// import { SplashScreen } from '@capacitor/splash-screen';
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

//my plugins
import {TranslateService} from '@ngx-translate/core';
import {StorageService} from 'src/app/services/data/storage.service';
import {PushService} from 'src/services/push.service';
import {LogService} from 'src/services/log.services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private logging: LogService,
    private translate: TranslateService,
    private storageService: StorageService,
    private pushService: PushService,
    private platform: Platform
  ) {
    this.logging.print(false, 'APP COMPONENT', 'CONSTRUCTOR', undefined);
    this.initializeApp();
  }

  async ngOnInit() {
    await this.storageService.create();
  }

  initializeApp() {
    //CAMBIAR IDIOMA
    this.translate.setDefaultLang('en');

    this.platform.ready().then(async () => {
      this.logging.print(false, 'APP COMPONENT', 'PLATFORM READY', undefined);
      this.pushService.init_notifications();
    });
  }
}
