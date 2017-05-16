'use strict';

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const opn = require('opn');

const Otpbank = require('../');

const SHOP_COMMENT = 'A shop comment.';
const CURRENCY = 'HUF';
const PORT = process.env.PORT || 3000;
const CALLBACK_URL_BASE = process.env.CALLBACK_URL_BASE || 'http://localhost:3000';
const OPEN_IN_BROWSER = (process.env.OPEN_IN_BROWSER === 'true');

// available at https://www.otpbank.hu/portal/hu/Kartyaelfogadas/Webshop
const POS_ID = '#02299991';
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQCpRN6hb8pQaDen9Qjt18P2FqScF2uhjKfd0DZ1t0HWtvYMmJGf
M6+wgjQGDHHc4LAcLIHF1TQVLCYdbyLzsOTRUhi4UFsW18IBznoEAx2wxiTCyzxt
ONpIkr5HD2E273UbXvVKA2hig2BgpOA2Poil9xtOXIm63iVw6gjP2qDnNwIDAQAB
AoGBAKP1ctTbDRRPrsGBB3IjEsz3Z+FOilIEhcHE4kuqBBswRCs1SbD1BtQpeqz1
NwGlntDbh6SSfQ2ZIx5VvXxhN3G6lNC0Mb15ra3XMjyHVHG7c/q3rDzhxFE361NO
uIgPdN1kVDCKm+RNmTbyLhCCpfbNIv8UlT2XnlajdMnPOzCZAkEA2trOehgWMFnl
IDDYAu1MtoNPPXCLfa44oCwwUmWg2Q/DbFWYs5u2wlk4xfnv9qGbv0DBuGesTYT0
DzjP0nqBkwJBAMX/kyNJ4TBouRDDnSj99Sdx57aYbzC1Xikt6FJVpT4P1KiGSoj6
OYSF8hz5kG90Dbv6W8Q4TwMbiFIOy9pFGk0CQQDG1OWj7UAze2h8H4QQ3LDGXHPg
WOCSNXeCpcLdCTHiIr0kLnwGKaEX3uGClDlb86VBU77sH1xeLT1imvXMvrn7AkEA
iktDqz88EYLj2Gi5Cduv8vglPy1jZGMZvKt6/J8jhqCqCXea8efMatrfzAsoLiCi
QyzQEdK+pU4CvkXlbrQbdQJAdLTPLSakZaN47bijXY05v11aC5ydb2pOpLHGKneX
wOt1vzdPct1YSk88YMD9RUi/xk/VnJHQ7cq8ltAXK/QNYA==
-----END RSA PRIVATE KEY-----`;

const info = `
Test successful payment card:
- card number: 4908 3660 9990 0425
- exp: 10/14
- cvc: 823

Test unsuccessful payment card:
- card number: 1111 1111 1111 1117
- exp: 04/04
- cvc: 111
`;

const otpbank = new Otpbank(POS_ID, PRIVATE_KEY);
const app = express();

const transactions = {};
function saveTransaction(transactionId, success, amount) {
  transactions[transactionId] = { success, amount, date: new Date(), currency: CURRENCY };
}
function getTransaction(transactionId) {
  return transactions[transactionId];
}

app.use('/app', express.static(path.join(__dirname, 'app')));
app.use(bodyParser.json());

app.get('/', (req, res) => res.redirect('/app'));

app.post('/pay', (req, res) => {
  const amount = req.body.amount;

  const transactionId = Otpbank.generateTransactionId();
  res.send({ url: otpbank.getOtpRedirectUrl(transactionId) });

  const callbackUrl = `${CALLBACK_URL_BASE}/app?transaction=${transactionId}`;
  return otpbank.startWorkflowSynch(transactionId, callbackUrl, amount, CURRENCY, SHOP_COMMENT)
    .then((result) => saveTransaction(transactionId, true, amount))
    .catch((error) => saveTransaction(transactionId, false, amount));
});

app.get('/transactions/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;
  const transaction = getTransaction(transactionId);
  return res.send({ transaction });
});

app.listen(PORT, () => {
  console.info(`Demo started on port ${PORT}`);
  if (OPEN_IN_BROWSER) {
    opn(`http://localhost:${PORT}/app`);
  }
});

process.on('unhandledRejection', (reason) => {
  console.log('unhandledRejection Reason: ', reason);
});
