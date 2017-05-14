const entities = require('entities');

const getStartWorkflowSynchInnerSoap = (posId, transactionId, amount, currency, callbackUrl, signature, shopComment) =>
`<?xml version="1.0" encoding="utf-8"?>
<StartWorkflow>
  <TemplateName>WEBSHOPFIZETESINDITAS</TemplateName>
  <Variables>
    <isClientCode>WEBSHOP</isClientCode>
    <isPOSID>${posId}</isPOSID>
    <isTransactionID>${transactionId}</isTransactionID>
    <isAmount>${amount}</isAmount>
    <isExchange>${currency}</isExchange>
    <isLanguageCode>hu</isLanguageCode>
    <isNameNeeded>FALSE</isNameNeeded>
    <isCardPocketId/>
    <isCountryNeeded>FALSE</isCountryNeeded>
    <isCountyNeeded>FALSE</isCountyNeeded>
    <isSettlementNeeded>FALSE</isSettlementNeeded>
    <isZipcodeNeeded>FALSE</isZipcodeNeeded>
    <isStreetNeeded>FALSE</isStreetNeeded>
    <isMailAddressNeeded>FALSE</isMailAddressNeeded>
    <isNarrationNeeded>FALSE</isNarrationNeeded>
    <isConsumerReceiptNeeded>FALSE</isConsumerReceiptNeeded>
    <isBackURL>${callbackUrl}</isBackURL>
    <isShopComment>${shopComment}</isShopComment>
    <isConsumerRegistrationNeeded>FALSE</isConsumerRegistrationNeeded>
    <isClientSignature>${signature}</isClientSignature>
    <isConsumerRegistrationID/>
  </Variables>
</StartWorkflow>`;

const getStartWorkflowSynchSoap = (posId, transactionId, amount, currency, callbackUrl, signature, shopComment) =>
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
    <arg0>WEBSHOPFIZETES</arg0>
    <arg1>
      ${entities.encodeXML(
        getStartWorkflowSynchInnerSoap(posId, transactionId, amount, currency, callbackUrl, signature, shopComment)
      )}
    </arg1>
    </tns:startWorkflowSynch>
  </soapenv:Body>
</soapenv:Envelope>`;

module.exports = {
  getStartWorkflowSynchSoap
};
