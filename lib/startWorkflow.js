const entities = require('entities');
const _ = require('lodash');

const transformOptionals = (optionals) =>
  _.mapValues(optionals, (value) => {
    if (_.isBoolean(value)) {
      return value ? 'TRUE' : 'FALSE';
    }
    return value;
  });

const getStartWorkflowSoap = (
  posId, transactionId, amount, currency, callbackUrl, signature, shopComment, optionals
) => {
  const {
    languageCode = 'hu',
    nameNeeded = 'FALSE',
    cardPocketId,
    countryNeeded = 'FALSE',
    countyNeeded = 'FALSE',
    settlementNeeded = 'FALSE',
    zipcodeNeeded = 'FALSE',
    streetNeeded = 'FALSE',
    mailAddressNeeded = 'FALSE',
    narrationNeeded = 'FALSE',
    consumerReceiptNeeded = 'FALSE',
    consumerRegistrationNeeded = 'FALSE',
    consumerRegistrationId,
  } = transformOptionals(optionals);

  const xmlCardPocketId = cardPocketId ? `<isCardPocketId>${cardPocketId}</isCardPocketId>` : '<isCardPocketId/>';
  const xmlConsumerRegistrationId = consumerRegistrationId ?
    `<isConsumerRegistrationID>${consumerRegistrationId}</isConsumerRegistrationID>` :
    '<isConsumerRegistrationID/>';

  return `<?xml version="1.0" encoding="utf-8"?>
    <StartWorkflow>
      <TemplateName>WEBSHOPFIZETESINDITAS</TemplateName>
      <Variables>
        <isClientCode>WEBSHOP</isClientCode>
        <isPOSID>${posId}</isPOSID>
        <isTransactionID>${transactionId}</isTransactionID>
        <isAmount>${amount}</isAmount>
        <isExchange>${currency}</isExchange>
        <isLanguageCode>${languageCode}</isLanguageCode>
        <isNameNeeded>${nameNeeded}</isNameNeeded>
        <isCountryNeeded>${countryNeeded}</isCountryNeeded>
        <isCountyNeeded>${countyNeeded}</isCountyNeeded>
        <isSettlementNeeded>${settlementNeeded}</isSettlementNeeded>
        <isZipcodeNeeded>${zipcodeNeeded}</isZipcodeNeeded>
        <isStreetNeeded>${streetNeeded}</isStreetNeeded>
        <isMailAddressNeeded>${mailAddressNeeded}</isMailAddressNeeded>
        <isNarrationNeeded>${narrationNeeded}</isNarrationNeeded>
        <isConsumerReceiptNeeded>${consumerReceiptNeeded}</isConsumerReceiptNeeded>
        <isBackURL>${callbackUrl}</isBackURL>
        <isShopComment>${shopComment}</isShopComment>
        <isConsumerRegistrationNeeded>${consumerRegistrationNeeded}</isConsumerRegistrationNeeded>
        <isClientSignature>${signature}</isClientSignature>
        ${xmlCardPocketId}
        ${xmlConsumerRegistrationId}
      </Variables>
    </StartWorkflow>`;
};

const startWorkflow = (
  posId,
  transactionId,
  amount,
  currency,
  callbackUrl,
  signature,
  shopComment,
  optionals
) => {
  const innerSoap = getStartWorkflowSoap(
    posId,
    transactionId,
    amount,
    currency,
    callbackUrl,
    signature,
    shopComment,
    optionals
  );

  return `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope
      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:tns="java:hu.iqsoft.otp.mw.access"
      xmlns:wsr="http://www.openuri.org/2002/10/soap/reliability/"
      xmlns:conv="http://www.openuri.org/2002/04/wsdl/conversation/"
      xmlns:stns="java:hu.iqsoft.otp.mw.access">
      <soapenv:Body>
        <tns:StartWorkflowSynch>
        <arg0>WEBSHOPFIZETES</arg0>
        <arg1>
          ${entities.encodeXML(innerSoap)}
        </arg1>
        </tns:StartWorkflowSynch>
      </soapenv:Body>
    </soapenv:Envelope>`;
};

module.exports = {
  startWorkflow
};
