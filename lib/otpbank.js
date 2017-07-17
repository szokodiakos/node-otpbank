const crypto = require('crypto');
const https = require('https');

const _ = require('lodash');
const xml2js = require('xml2js');
const bson = require('bson');

const xmls = require('./xmls');

const MESSAGE_TYPES = {
  SUCCESS_START_TRANSACTION: 'SIKERESWEBSHOPFIZETESINDITAS',
  SUCCESS_GET_TRANSACTIONS: 'SIKER',
};

const OTP_URL_BASE = 'https://www.otpbankdirekt.hu/webshop/do/webShopVasarlasInditas';

class Otpbank {
  constructor(posId, privateKey) {
    this._posId = posId;
    this._privateKey = privateKey;
  }

  static get transactionResults() {
    return Object.freeze({
      SUCCESS: 'success',
      CARD_BLOCKED: 'cardBlocked',
      INVALID_CARD_NUMBER: 'invalidCardNumber',
      INVALID_CARD_BIN: 'invalidCardBin',
      CARD_EXPIRED: 'cardExpired',
      CARD_RESTRICTED: 'cardRestricted',
      CARD_LOST: 'cardLost',
      CARD_NOT_ACTIVE: 'cardNotActive',
      INCORRECT_CARD_CREDENTIALS: 'incorrectCardCredentials',
      INSUFFICIENT_FUNDS: 'insufficientFunds',
      CARD_DOES_NOT_COMPLY_WITH_INDUSTRY: 'cardDoesNotComplyWithIndustry',
      UNKNOWN_CARD_NUMBER: 'cardUnknown',
      CANNOT_CHARGE_CARD: 'cannotChargeCard',
      CANNOT_CHARGE_CARD_WITH_GIVEN_AMOUNT: 'cannotChargeCardWithGivenAmount',
      ERROR: 'error',
      INVALID_AMOUNT: 'invalidAmount',
    });
  }

  static get cardPocketIds() {
    return Object.freeze({
      FOOD_VOUCHER: '01',
      WARM_MEAL_VOUCHER: '02',
      BACK_TO_SCHOOL_VOUCHER: '03',
      CULTURAL_VOUCHER: '04',
      GIFT_VOUCHER: '05',
      INTERNET_VOUCHER: '06',
      SZEP_HOSPITALITY_CARD: '07',
      SZEP_LEISURE_CARD: '08',
      SZEP_ACCOMMODATION_CARD: '09',
    });
  }

  static _decodeResultCode(code) {
    const transactionResults = Otpbank.transactionResults;
    switch (code) {
      case '000': return transactionResults.SUCCESS;
      case '058': return transactionResults.INVALID_CARD_NUMBER;
      case '070': return transactionResults.INVALID_CARD_BIN;
      case '901':
      case '051': return transactionResults.CARD_EXPIRED;
      case '902':
      case '059':
      case '072': return transactionResults.CARD_BLOCKED;
      case '057': return transactionResults.CARD_LOST;
      case '903': return transactionResults.CARD_NOT_ACTIVE;
      case '097':
      case '069': return transactionResults.INCORRECT_CARD_CREDENTIALS;
      case '074':
      case '076':
      case '050':
      case '200':
      case '089': return transactionResults.INSUFFICIENT_FUNDS;
      case '206': return transactionResults.CARD_DOES_NOT_COMPLY_WITH_INDUSTRY;
      case '056': return transactionResults.UNKNOWN_CARD_NUMBER;
      case '909': return transactionResults.CANNOT_CHARGE_CARD;
      case '204': return transactionResults.CANNOT_CHARGE_CARD_WITH_GIVEN_AMOUNT;
      case '205': return transactionResults.INVALID_AMOUNT;
      default: return transactionResults.ERROR;
    }
  }

  static _getHttpOptions(messageLength) {
    return {
      hostname: 'www.otpbankdirekt.hu',
      port: 443,
      path: '/mwaccesspublic/mwaccess',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'Connection': 'keep-alive',
        'Content-length': messageLength,
      },
    };
  }

  static _postRequest(message) {
    return new Promise((resolve, reject) => {
      const options = Otpbank._getHttpOptions(message.length);
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => resolve(responseBody));
      });
      req.on('error', reject);
      req.write(message);
      req.end();
    });
  }

  static _extractFromResponse(response) {
    return new Promise((resolve, reject) => xml2js.parseString(response, (err, result) => {
      if (err) {
        return reject(err);
      }
      const encodedResult = _.get(result, [
        'env:Envelope', 'env:Body', '0', 'm:startWorkflowSynchResponse', '0', 'return', '0', 'result', '0', '_',
      ], '');
      if (!encodedResult) {
        return reject(new Error(JSON.stringify({ message: 'No encoded result', result })));
      }

      return resolve(new Buffer(encodedResult, 'base64').toString());
    }));
  }

  static _extractFromResultXml(resultXml) {
    return new Promise((resolve, reject) => xml2js.parseString(resultXml, (err, result) => {
      if (err) {
        return reject(err);
      }

      const message = _.get(result, 'answer');
      if (!message) {
        return reject(new Error(JSON.stringify({ message: 'No valid message', result })));
      }

      return resolve(message);
    }));
  }

  static generateTransactionId() {
    const objectId = new bson.ObjectId().toString('hex');
    const randomBytes = crypto.randomBytes(4).toString('hex');
    return `${objectId}${randomBytes}`;
  }

  static _parseDate(string) {
    const year = string.substr(0, 4);
    const month = string.substr(4, 2);
    const date = string.substr(6, 2);

    const hours = string.substr(8, 2);
    const minutes = string.substr(10, 2);
    const seconds = string.substr(12, 2);

    return new Date(year, month, date, hours, minutes, seconds);
  }

  _sign(string) {
    const createdSign = crypto.createSign('SHA512');
    createdSign.write(string);
    createdSign.end();
    return createdSign.sign(this._privateKey, 'hex');
  }

  getOtpRedirectUrl(transactionId) {
    return `${OTP_URL_BASE}?posId=${encodeURIComponent(this._posId)}&azonosito=${transactionId}&version=5`;
  }

  getTransaction(transactionId) {
    const stringToSign = `${this._posId}|${transactionId}|1||`;
    const signature = this._sign(stringToSign);

    const message = xmls.getTransactionSoapBody(this._posId, transactionId, signature);

    return Otpbank._postRequest(message)
      .then((response) => Otpbank._extractFromResponse(response))
      .then((resultXml) => Otpbank._extractFromResultXml(resultXml))
      .then((resultMessage) => {
        const messageType = _.get(resultMessage, ['messagelist', '0', 'message', '0']);
        if (messageType !== MESSAGE_TYPES.SUCCESS_GET_TRANSACTIONS) {
          throw new Error(JSON.stringify(resultMessage));
        }
        const result = _.get(resultMessage, 'resultset[0].record[0]');
        return {
          transactionId: _.get(result, 'transactionid[0]'),
          posId: _.get(result, 'posid[0]'),
          responseCode: _.get(result, 'responsecode[0]'),
          transactionResult: Otpbank._decodeResultCode(_.get(result, 'responsecode[0]')),
          state: _.get(result, 'state[0]'),
          startDate: Otpbank._parseDate(_.get(result, 'startdate[0]')),
          endDate: Otpbank._parseDate(_.get(result, 'enddate[0]')),
          authorizationCode: _.get(result, 'params[0].output[0].authorizationcode[0]'),
          message: messageType,
          exchange: _.get(result, 'params[0].input[0].exchange[0]'),
          amount: _.get(result, 'params[0].input[0].amount[0]'),
        };
      });
  }

  startTransaction(transactionId, callbackUrl, amount, currency, shopComment, optionals) {
    const opionalConsumerId = optionals && optionals.consumerRegistrationId ? optionals.consumerRegistrationId : '';
    const stringToSign = `${this._posId}|${transactionId}|${amount}|${currency}|${opionalConsumerId}`;
    const signature = this._sign(stringToSign);

    const message = xmls.startTransactionSoapBody(
      this._posId, transactionId, amount, currency, callbackUrl, signature, shopComment, optionals
    );

    return Otpbank._postRequest(message)
      .then((response) => Otpbank._extractFromResponse(response))
      .then((resultXml) => Otpbank._extractFromResultXml(resultXml))
      .then((resultMessage) => {
        const messageType = _.get(resultMessage, ['messagelist', '0', 'message', '0']);
        if (messageType !== MESSAGE_TYPES.SUCCESS_START_TRANSACTION) {
          throw new Error(JSON.stringify(resultMessage));
        }

        const result = _.get(resultMessage, 'resultset[0].record[0]');
        return {
          transactionId: _.get(result, 'transactionid[0]'),
          posId: _.get(result, 'posid[0]'),
          message: messageType,
        };
      });
  }
}

module.exports = Otpbank;
