# node-otpbank

Hungarian OTP Bank easy-to-integrate Node payment module, demo app included.

## Features

* Three-party Scheme: your app redirects to OTP Bank's site where you can enter the card information. After verification, OTP Bank redirects the user back to your app.


## Requirements

* Node 4+

## Install

`npm install node-otpbank -S`

## Usage

### Setup
```javascript
const Otpbank = require('node-otpbank');
const otpbank = new Otpbank(yourPosId, yourPrivateKey);
```

### In your endpoint
```javascript
const amount = req.body.amount;

// you can create your own logic, but the library ships with a default
const transactionId = Otpbank.generateTransactionId();

// this will be the OTP Bank's URL, where the client must navigate
const redirectUrl = otpbank.getOtpRedirectUrl(transactionId);

// return the URL
// this is an early response as the startWorkflowSynch method resolves only when
// the user completes the payment form on OTP Bank's website
res.send({redirectUrl);

// this will be called by OTP Bank after they verified your payment
const callbackUrl = `http://yourwebshop.com/app?transaction=${transactionId}`;

// initiates a SOAP message to OTP Bank
// (meanwhile the user fills out the form at OTP Bank's website)
otpbank.startWorkflowSynch(
  transactionId,
  callbackUrl,
  amount,
  'HUF',
  `A shop comment which will appear on the OTP Bank's site`
)
  .then((result) => /* payment succeeded, yay */)
  .catch((error) => /* payment was unsuccessful */);
```

## API

### `Otpbank` class

This is default export of the module.

#### `static generateTransactionId()`

Returns a unique ID, that can be passed to the payment method.

The transaction ID must be exactly 32 characters long. This method creates an Object ID (using `bson` package) and concats enough random bytes in order to reach the 32 characters length.

This is the default strategy and can be ignored, so you can ship your own ID generation algorithm.

#### `getOtpRedirectUrl(transactionId)`

Returns a URL which will redirect the user to the OTP Bank's website. This URL contains the POS ID (which is received when making  a contract with OTP), and the current transaction ID.

#### `startWorkflowSynch(transactionId, callbackUrl, amount, currency, shopComment)`

Creates a SOAP request to the OTP Bank's payment server. Returns a `Promise` which will resolve when the user completes the payment form on the bank's website.

This is the reason why the API endpoint implementing the payment must early respond to the client with the redirect URL.

## Demo

The lib ships with a demo application. When running `npm start` an Express backend initializes, and a small frontend opens in your default browser.

In the demo app you can enter an arbitrary amount and click the Pay button. This will initiate a request to the OTP Bank's website through the Express backend.

When at the OTP Bank's website, you can fill out the payment form by using the dummy card data provided by OTP Bank on their [website]((https://www.otpbank.hu/portal/hu/Kartyaelfogadas/Webshop)). These card informations can be seen on the console when the Express backend initializes.

After the payment form is submitted, the bank redirects the user to the frontend, where details can be seen about the transaction.

The sequence diagram of the demo flow:

![Alt Sequence diagram](https://cdn.rawgit.com/szokodiakos/node-otpbank/b9bd4086/3ps.svg)

## Notes
All used resources (always-working & always-failing bank card infos, dummy private keys, dummy POS number, documentations) are available at the [OTP Bank website](https://www.otpbank.hu/portal/hu/Kartyaelfogadas/Webshop).

In order to integrate OTP Bank's payment system, you must first make a contract with OTP, then you will receive your own POS number, which can be configured through the module.

## Improvements
* Implement two-party scheme
* Add tests
