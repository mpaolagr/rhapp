import { Component, OnInit } from '@angular/core';

//my plugins
import { AuthService } from 'src/app/services/api/auth.service';
import {TranslateService} from '@ngx-translate/core';
import { Router } from '@angular/router';
import {StorageService} from 'src/app/services/data/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import {LogService} from 'src/services/log.services';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {

  username: string = '';
  loading: boolean = false;
  current_year: number = new Date().getFullYear();

  constructor(
    private logging: LogService,
    private authService: AuthService,
    private translate: TranslateService,
    private toastService: ToastService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.init();
  }

  async init(){
    let lang: string = <string>await this.storageService.get('config.language', 'en');
    this.logging.print(false, 'pass-reset', 'language: ' + lang, undefined)
    this.translate.use(lang);
  }

  ngOnInit() {
  }

  validate() {
    this.loading = true;
    const body = {email: this.username};
    this.authService.forgotPassword(body).subscribe(data => {
      if (data) {
        const nombre = data['account'] ? data['account']['name'] : '';
        const correo = data['username'];
        const clave = atob(data['password']);
        this.sendMail(nombre, correo, clave);
      } else {
        this.loading = false;
        this.toastService.presentToast('', 'El correo ingresado no esta registrado, revise e intente nuevamente!', 'bottom', 'warning', 2000);
      }
    }, error => {
      this.loading = false;
      if(error.status == 404){
        this.toastService.presentToast('', 'No se ha encontrado una cuenta asociada a este correo, revise e intente nuevamente', 'bottom', 'warning', 2000);
        return;
      }
      this.toastService.presentToast('', JSON.stringify(error), 'bottom', 'warning', 2000);
    });
  }

  sendMail(nombre, correo, clave) {
    const serviceID = 'service_wm4ozdc';
    const templateID = 'template_nxq04bk';
    const userID = 'gW4zYYBx8J4JGA7cK';

    const templateParams = {
      nombre: nombre,
      usuario: correo,
      clave: clave
    };
    const athis = this;
    emailjs.send(serviceID, templateID, templateParams, userID).then(function (response) {
        athis.finalizar();
    }, function (error) {
        athis.loading = false;
        athis.toastService.presentToast('', 'En este momento no se pudo procesar su peticion, intente mas tarde!', 'bottom', 'warning', 1000);
    });
  }

  finalizar() {
    this.loading = false;
    this.toastService.presentToast('', 'Revise su bandeja de entrada de su correo electronico!', 'bottom', 'success', 1000);
    setTimeout(() => {
      this.router.navigate(['/signin']);
    }, 2000);
  }

}
