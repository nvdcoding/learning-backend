/* eslint-disable @typescript-eslint/no-var-requires */
import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { UserRepository } from 'src/models/repositories/user.repository';
import * as moment from 'moment';
import { DepositDto } from './dtos/deposit.dto';
import { vnPayConfig } from 'src/configs/vnpay.config';
import { promisify } from 'util';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shares/enum/transaction.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { Response } from 'src/shares/response/response.interface';
import { httpResponse } from 'src/shares/response';
import { UserPreferDto } from './dtos/update-user-setting.dto';
import { UserPreferRepository } from 'src/models/repositories/user-prefer.repository';
import { UserPrefer } from 'src/models/entities/user-prefer.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getIP = promisify(require('external-ip')());
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly userPreferRepository: UserPreferRepository,
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
    const orderInfo = `${orderId}`;
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
      type: TransactionType.DEPOSIT,
    });
    return { ...httpResponse.GEN_LINK_SUCCESS, data: vnpUrl };
  }

  async IPNUrl(query) {
    const { vnp_Amount, vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef } =
      query;
    const secureHash = query['vnp_SecureHash'];
    console.log(query);

    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];
    query = this.sortObject(query);
    const secretKey = `${vnPayConfig.HASH_SECRET}`;
    const querystring = require('qs');
    const signData = querystring.stringify(query, { encode: true });
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    if (secureHash === signed) {
      const orderId = query['vnp_TxnRef'];
      const rspCode = query['vnp_ResponseCode'];
      //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
      const transaction = await this.transactionRepository.findOne({
        where: { transactionCode: orderId },
        relations: ['user'],
      });
      const user = await this.userRepository.findOne({
        where: { id: transaction.user.id, verifyStatus: UserStatus.ACTIVE },
      });
      if (rspCode == '00') {
        await Promise.all([
          this.transactionRepository.update(
            { id: transaction.id },
            {
              status: TransactionStatus.PROCESSED,
            },
          ),
          this.userRepository.update(
            { id: transaction.user.id },
            {
              coin: user.coin + +vnp_Amount / 100,
              coinAvailable: user.coinAvailable + +vnp_Amount / 100,
            },
          ),
        ]);
      } else {
        await this.transactionRepository.update(
          { id: transaction.id },
          {
            status: TransactionStatus.PROCESSED,
          },
        );
      }
    } else {
      console.log({
        hash: secureHash,
        signed,
      });

      console.log('Error');
    }
  }

  async getMe(userId: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        verifyStatus: UserStatus.ACTIVE,
      },
      relations: ['posts', 'transactions', 'userPrefer'],
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return { ...httpResponse.GET_SUCCES, data: user };
  }

  async updateUserPrefer(
    body: UserPreferDto,
    userId: number,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        verifyStatus: UserStatus.ACTIVE,
      },
      relations: ['userPrefer'],
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    console.log(user.userPrefer);

    if (user.userPrefer === null) {
      const userPrefer = await this.userPreferRepository.save({ ...body });
      await this.userRepository.update(
        { id: userId },
        { userPrefer, isSetup: true },
      );
    } else {
      await this.userPreferRepository.update(
        { id: user.userPrefer.id },
        { ...body },
      );
    }

    return httpResponse.UPDATE_COURSE_SUCCESS;
  }
}
