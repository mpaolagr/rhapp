import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    public toastController: ToastController
  ) { }

  async presentToast(header: string, message: string, position: any, color: string, duration: number, icon?: string) {

    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: duration,
      position: position,
      color: color
    });
    await toast.present();
  }
}
