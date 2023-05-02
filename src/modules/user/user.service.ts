/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/models/repositories/user.repository';
import * as moment from 'moment';
import { DepositDto } from './dtos/deposit.dto';
import { vnPayConfig } from 'src/configs/vnpay.config';
import * as queryString from 'qs';
import * as crypto from 'crypto';
import * as VNPay from 'node-vnpay';
import { promisify } from 'util';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getIP = promisify(require('external-ip')());
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // async getAllCourses() {
  //   const data = await this.courseRepository.find();
  //   return { ...httpResponse.GET_SUCCES, data };
  // }
  async getUserByIdAndEmail(id: number, email: string) {
    return this.userRepository.findOne({
      where: {
        id,
        email,
      },
    });
  }

  sortObject(obj) {
    const sorted = {};
    const keys = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    keys.sort();
    const keysLength = keys.length;
    for (let i = 0; i < keysLength; i++) {
      sorted[keys[i]] = obj[keys[i]];
    }

    return sorted;
  }

  async test(req) {
    // }
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const tmnCode = vnPayConfig.TMN_CODE;
    const secretKey = vnPayConfig.HASH_SECRET;
    let vnpUrl = vnPayConfig.URL;
    const returnUrl = vnPayConfig.RETURN_URL;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('HHmmss');
    const amount = 100000;
    const bankCode = 'NCB';

    const orderInfo = '213';
    const locale = 'vn';
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_BankCode'] = bankCode;

    vnp_Params = this.sortObject(vnp_Params);
    console.log(vnp_Params);

    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);
  }

  async deposit(body: DepositDto, req) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const ipAddr = await getIP();
    const tmnCode = vnPayConfig.TMN_CODE;
    const secretKey = vnPayConfig.HASH_SECRET;
    let vnpUrl = vnPayConfig.URL;
    const returnUrl = vnPayConfig.RETURN_URL;
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const expiredDate = `${+createDate + 15000}`;
    const orderId = moment(date).format('DDHHmmss');
    const amount = body.amount;
    const bankCode = 'NCB';
    const orderInfo = '213213123213';
    const locale = 'vn';
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = +createDate;
    // if (bankCode !== null && bankCode !== '') {
    // vnp_Params['vnp_BankCode'] = bankCode;
    // vnp_Params['vnp_ExpireDate'] = expiredDate;
    // }
    vnp_Params = this.sortObject(vnp_Params);
    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    console.log(signData);
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);
    // res.redirect(vnpUrl);
    return vnpUrl;
    // const vnpay = new VNPay({
    //   secretKey: vnPayConfig.HASH_SECRET,
    //   returnUrl: vnPayConfig.RETURN_URL,
    //   merchantCode: vnPayConfig.TMN_CODE,
    //   hashAlgorithm: 'sha512', // optional
    // });
    // // require pay 10000 VND.
    // const payURL = await vnpay.genPayURL({
    //   transactionRef: 'PT20200520103101_007',
    //   orderInfo: 'Thanh toan hoa don dich vu',
    //   orderType: '100000',
    //   amount: 100000,
    //   bankCode: 'NCB',
    // });
    // console.log(payURL);
  }
}
