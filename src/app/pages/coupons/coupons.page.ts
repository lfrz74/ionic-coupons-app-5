import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, NavParams } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

import { Coupon } from '../../models/coupon';
import { CouponsService } from '../../services/coupons.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.page.html',
  styleUrls: ['./coupons.page.scss'],
})
export class CouponsPage implements OnInit {
  coupons: Coupon[] | undefined;
  isCouponsActive: boolean = true;
  showCamera = false;

  constructor(
    private couponService: CouponsService,
    private navParams: NavParams,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.coupons = [];
    this.couponService.getCoupons().then((coupons: Coupon[]) => {
      this.coupons = coupons;
    });
  }

  changeActive(coupon: Coupon) {
    coupon.active = !coupon.active;
    // Disable ion-fab-button if there are no actives coupons
    this.isCouponsActive = (this.coupons as Coupon[]).some((c) => c.active);
  }

  goToCard() {
    this.navParams.data['coupons'] = this.coupons?.filter((c) => c.active);
    this.navController.navigateForward('card-coupon');
  }

  async startCamera() {
    this.showCamera = true;
    // Check camera permission
    // This is just a simple example, check out the better checks below
    const permission = await BarcodeScanner.checkPermission({ force: true });

    if (permission.granted) {
      // make background of WebView transparent
      // note: if you are using ionic this might not be enough, check below
      // BarcodeScanner.hideBackground();
      this.showCamera = true; // esto hace en vez de la linea de arriba v

      const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

      // if the result has content
      if (result.hasContent) {
        console.log(result.content); // log the raw scanned content

        try {
          let coupon: Coupon = JSON.parse(result.content);

          if (this.isCouponValid(coupon)) {
            this.toastService.presentToast(
              'top',
              'QR scanned successfully!',
              'success'
            );
            this.coupons?.push(coupon);
          } else {
            this.toastService.presentToast('bottom', 'QR error', 'danger');
          }
        } catch (error) {
          console.error(error);
          this.toastService.presentToast('bottom', 'QR error', 'warning');
        }
      }
      this.closeCamera();
    } else {
      const alert = await this.alertController.create({
        message: 'This app needs permissions for camera in order to work v!',
      });
      await alert.present();
    }
  }

  closeCamera() {
    this.showCamera = false;
    BarcodeScanner.stopScan();
  }

  private isCouponValid(coupon: Coupon) {
    return (
      coupon &&
      coupon.discount &&
      coupon.id_product &&
      coupon.img &&
      coupon.name
    );
  }
}
