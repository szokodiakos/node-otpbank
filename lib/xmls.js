const entities = require('entities');
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
      xmlns:xsd="http://www.w3.org/2001/XMLSchema"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <soapenv:Body>
        <ns1:startWorkflowSynch xmlns:ns1="urn:MWAccess">
          <arg0>${templateName}</arg0>
          <arg1>
            ${entities.encodeXML(xml)}
          </arg1>
        </ns1:startWorkflowSynch>
      </soapenv:Body>
    </soapenv:Envelope>`;

const getGetTransactionsSoap = (posId, transactionId, signature) => {
  // const xmlMaxRecords = maxRecords ? `<isMaxRecords>${maxRecords}</isMaxRecords>` : '<isMaxRecords/>';
  // const xmlStartDate = startDate ? `<isStartDate>${startDate}</isStartDate>` : '<isStartDate/>';
  // const xmlEndDate = startDate ? `<isEndDate>${endDate}</isEndDate>` : '<isEndDate/>';

  const innerXml = `<?xml version="1.0" encoding="utf-8"?>
    <StartWorkflow>
      <TemplateName>WEBSHOPTRANZAKCIOLEKERDEZES</TemplateName>
      <Variables>
        <isClientCode>WEBSHOP</isClientCode>
        <isPOSID>${posId}</isPOSID>
        <isTransactionID></isTransactionID>
        <isClientSignature>${signature}</isClientSignature>
        <isMaxRecords>1</isMaxRecords>
        <isStartDate></isStartDate>
        <isEndDate></isEndDate>
      </Variables>
    </StartWorkflow>`;

  return getSoapWrap('WEBSHOPTRANZAKCIOLEKERDEZES', innerXml);
};

const getStartTransactionSoap = (
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

  const innerXml = `<?xml version="1.0" encoding="utf-8"?>
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
        <isCardPocketId>${cardPocketId}</isCardPocketId>
        <isConsumerRegistrationID>${consumerRegistrationId}</isConsumerRegistrationID>
      </Variables>
    </StartWorkflow>`;

  return getSoapWrap(TEMPLATE_NAMES.START_TRANSACTION, innerXml);
};

module.exports = {
  getStartTransactionSoap,
  getGetTransactionsSoap
};
