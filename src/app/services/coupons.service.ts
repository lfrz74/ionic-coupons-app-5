import { Injectable } from '@angular/core';

import { Coupon } from '../models/coupon';

@Injectable({
  providedIn: 'root',
})
export class CouponsService {
  constructor() {}

  async getCoupons() {
    try {
      const res = await fetch('./assets/data/data.json');
      const coupons: Coupon[] = (await res.json()) as Coupon[];
      return await Promise.resolve(coupons);
    } catch (err) {
      return await Promise.reject([]);
    }
  }
}
