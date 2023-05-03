/* eslint-disable @typescript-eslint/no-var-requires */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/models/repositories/user.repository';
import * as moment from 'moment';
import { DepositDto } from './dtos/deposit.dto';
import { vnPayConfig } from 'src/configs/vnpay.config';
import * as queryString from 'qs';
import * as crypto from 'crypto';
import * as VNPay from 'node-vnpay';
import { promisify } from 'util';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { TransactionStatus } from 'src/shares/enum/transaction.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { Response } from 'src/shares/response/response.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getIP = promisify(require('external-ip')());
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

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

  async genUrlPay(body: DepositDto, userId: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        verifyStatus: UserStatus.ACTIVE,
      },
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const ipAddr = await getIP();
    const tmnCode = `${vnPayConfig.TMN_CODE}`;
    const secretKey = `${vnPayConfig.HASH_SECRET}`;
    let vnpUrl = vnPayConfig.URL;
    const returnUrl = vnPayConfig.RETURN_URL;
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('DDHHmmss');
    const amount = body.amount;
    const bankCode = 'NCB';
    const orderInfo = `Thanh toan cho don hang ma: ${orderId}`;
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
    vnp_Params['vnp_BankCode'] = bankCode;
    // vnp_Params['vnp_ExpireDate'] = expiredDate;
    // }
    vnp_Params = this.sortObject(vnp_Params);
    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: true });
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });
    await this.transactionRepository.insert({
      status: TransactionStatus.PENDING,
      amount,
      transactionCode: orderId,
      time: date,
      user,
    });
    return { http, data: vnpUr };
  }
}
