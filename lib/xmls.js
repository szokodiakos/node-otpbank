const _ = require('lodash');

const transformOptionals = (optionals) =>
  _.mapValues(optionals, (value) => {
    if (_.isBoolean(value)) {
      return value ? 'TRUE' : 'FALSE';
    }
    return value;
  });

const TEMPLATE_NAMES = {
  GENERATE_TRANSACTION_ID: 'WEBSHOPTRANZAZONGENERALAS',
  START_TRANSACTION: 'WEBSHOPFIZETESINDITAS',
  GET_TRANSACTIONS: 'WEBSHOPTRANZAKCIOLEKERDEZES',
};

const getSoapWrap = (templateName, xml) =>
  `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope
      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:tns="java:hu.iqsoft.otp.mw.access"
      xmlns:wsr="http://www.openuri.org/2002/10/soap/reliability/"
      xmlns:conv="http://www.openuri.org/2002/04/wsdl/conversation/"
      xmlns:stns="java:hu.iqsoft.otp.mw.access">
      <soapenv:Body>
        <tns:startWorkflowSynch>
        <arg0>${templateName}</arg0>
        <arg1><![CDATA[${xml}]]></arg1>
        </tns:startWorkflowSynch>
      </soapenv:Body>
    </soapenv:Envelope>`;

const getTransactionSoapBody = (posId, transactionId, signature) => {
  const template = TEMPLATE_NAMES.GET_TRANSACTIONS;

  const innerXml = `<?xml version="1.0" encoding="utf-8"?>
    <StartWorkflow>
      <TemplateName>${template}</TemplateName>
      <Variables>
        <isClientCode>WEBSHOP</isClientCode>
        <isPOSID>${posId}</isPOSID>
        <isTransactionID>${transactionId}</isTransactionID>
        <isClientSignature algorithm="SHA512">${signature}</isClientSignature>
        <isMaxRecords>1</isMaxRecords>
        <isStartDate></isStartDate>
        <isEndDate></isEndDate>
      </Variables>
    </StartWorkflow>`;

  return getSoapWrap(template, innerXml);
};

const getTransactionIdSoapBody = (posId, signature) => {
  const template = TEMPLATE_NAMES.GENERATE_TRANSACTION_ID;

  const innerXml = `<?xml version="1.0" encoding="utf-8"?>
    <StartWorkflow>
      <TemplateName>${template}</TemplateName>
      <Variables>
        <isClientCode>WEBSHOP</isClientCode>
        <isPOSID>${posId}</isPOSID>
        <isClientSignature algorithm="SHA512">${signature}</isClientSignature>
      </Variables>
    </StartWorkflow>`;

  return getSoapWrap(template, innerXml);
};

const startTransactionSoapBody = (
  posId, transactionId, amount, currency, callbackUrl, signature, shopComment, optionals
) => {
  const {
    languageCode = 'hu',
    nameNeeded = 'FALSE',
    cardPocketId = '',
    countryNeeded = 'FALSE',
    countyNeeded = 'FALSE',
    settlementNeeded = 'FALSE',
    zipcodeNeeded = 'FALSE',
    streetNeeded = 'FALSE',
    mailAddressNeeded = 'FALSE',
    narrationNeeded = 'FALSE',
    consumerReceiptNeeded = 'FALSE',
    consumerRegistrationNeeded = 'FALSE',
    consumerRegistrationId = '',
  } = transformOptionals(optionals);
  const template = TEMPLATE_NAMES.START_TRANSACTION;

  const innerXml = `<?xml version="1.0" encoding="utf-8"?>
    <StartWorkflow>
      <TemplateName>${template}</TemplateName>
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
        <isCardPocketId>${cardPocketId}</isCardPocketId>
        <isConsumerRegistrationID>${consumerRegistrationId}</isConsumerRegistrationID>
        <isClientSignature algorithm="SHA512">${signature}</isClientSignature>
      </Variables>
    </StartWorkflow>`;

  return getSoapWrap(template, innerXml);
};

module.exports = {
  startTransactionSoapBody,
  getTransactionSoapBody,
  getTransactionIdSoapBody,
};
