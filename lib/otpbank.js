const crypto = require('crypto');
const https = require('https');

const _ = require('lodash');
const xml2js = require('xml2js');
const bson = require('bson');

const xmls = require('./xmls');

const SOAP_ACTIONS = {
  START_WORKFLOW_SYNCH: 'startWorkflowSync',
};

const MESSAGE_TYPES = {
  SUCCESS: 'SIKER',
};

const OTP_URL_BASE = 'https://www.otpbankdirekt.hu/webshop/do/webShopVasarlasInditas';

class Otpbank {
  constructor(posId, privateKey) {
    this._posId = posId;
    this._privateKey = privateKey;
  }

  static _getHttpOptions(action, messageLength) {
    return {
      hostname: 'www.otpbankdirekt.hu',
      port: 443,
      path: '/mwaccesspublic/mwaccess',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': action,
        'Connection': 'keep-alive',
        'Content-length': messageLength,
      },
    };
  }

  static _postRequest(action, message) {
    return new Promise((resolve, reject) => {
      const options = Otpbank._getHttpOptions(action, message.length);
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

      const message = _.get(result, ['answer', 'messagelist', '0', 'message', '0'], '');
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

  _sign(transactionId, amount, currency) {
    const stringToSign = `${this._posId}|${transactionId}|${amount}|${currency}|`;
    const createdSign = crypto.createSign('RSA-MD5');
    createdSign.write(stringToSign);
    createdSign.end();
    return createdSign.sign(this._privateKey, 'hex');
  }

  getOtpRedirectUrl(transactionId) {
    return `${OTP_URL_BASE}?posId=${encodeURIComponent(this._posId)}&azonosito=${transactionId}`;
  }

  startWorkflowSynch(transactionId, callbackUrl, amount, currency, shopComment) {
    const signature = this._sign(transactionId, amount, currency);
    const message = xmls.getStartWorkflowSynchSoap(
      this._posId, transactionId, amount, currency, callbackUrl, signature, shopComment
    );

    return Otpbank._postRequest(SOAP_ACTIONS.START_WORKFLOW_SYNCH, message)
      .then((response) => Otpbank._extractFromResponse(response))
      .then((resultXml) => Otpbank._extractFromResultXml(resultXml))
      .then((resultMessage) => {
        if (resultMessage !== MESSAGE_TYPES.SUCCESS) {
          throw new Error(resultMessage);
        }
        return resultMessage;
      });
  }
}

module.exports = Otpbank;
