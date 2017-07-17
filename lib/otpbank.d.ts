declare namespace otpbank {
  interface IWorkflowSynchOptionals {
    languageCode?: 'hu' | 'en';
    nameNeeded?: boolean;
    cardPocketId?: string;
    countryNeeded?: boolean;
    countyNeeded?: boolean;
    settlementNeeded?: boolean;
    zipcodeNeeded?: boolean;
    streetNeeded?: boolean;
    mailAddressNeeded?: boolean;
    narrationNeeded?: boolean;
    consumerReceiptNeeded?: boolean;
    consumerRegistrationNeeded?: boolean;
    consumerRegistrationId?: string;
  }

  type TTransactionResult = 'success' | 'cardBlocked' | 'invalidCardNumber' | 'invalidCardBin' | 'cardExpired' |
    'cardRestricted' | 'cardLost' | 'cardNotActive' | 'incorrectCardCredentials' | 'insufficientFunds' |
    'cardDoesNotComplyWithIndustry' | 'cardUnknown' | 'cannotChargeCard' | 'cannotChargeCardWithGivenAmount' |
    'error' | 'invalidAmount';

  interface IGetTransactionReturn {
    transactionId: string;
    posId: string;
    responseCode: string;
    transactionResult: TTransactionResult;
    state: 'VEVOOLDAL_INPUTVARAKOZAS' | 'FELDOLGOZAS_ALATT' | 'FELDOLGOZVA' | 'VEVOOLDAL_VISSZAVONT' |
      'VEVOOLDAL_TIMEOUT' | 'BOLTOLDAL_LEZARASVARAKOZAS' | 'LEZARAS_ALATT' | 'BOLTOLDAL_TIMEOUT';
    startDate: Date;
    endDate: Date;
    authorizationCode: string;
    message: 'SIKER';
    exchange: 'HUF' | 'EUR' | 'USD';
    amount: string;
  }

  interface ITransactionResult {
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
  }

  interface ICardPocketIds {
    FOOD_VOUCHER: '01',
    WARM_MEAL_VOUCHER: '02',
    BACK_TO_SCHOOL_VOUCHER: '03',
    CULTURAL_VOUCHER: '04',
    GIFT_VOUCHER: '05',
    INTERNET_VOUCHER: '06',
    SZEP_HOSPITALITY_CARD: '07',
    SZEP_LEISURE_CARD: '08',
    SZEP_ACCOMMODATION_CARD: '09',
  }

  interface IStartTransactionReturn {
    transactionId: string;
    posId: string;
    message: 'SIKERESWEBSHOPFIZETESINDITAS';
  }

  class Otpbank {
    constructor(posId: string, privateKey: string);
    static generateTransactionId(): string;
    static transactionResults: Readonly<ITransactionResult>;
    static cardPocketIds: Readonly<ICardPocketIds>;

    getOtpRedirectUrl(transactionId: string): string;
    getTransaction(transactionId: string): Promise<IGetTransactionReturn>;
    startTransaction(
      transactionId: string,
      callbackUrl: string,
      amount: number,
      currency: 'HUF' | 'EUR' | 'USD',
      shopComment: string,
      optionals?: IWorkflowSynchOptionals
    ): Promise<IStartTransactionReturn>;
  }
}

export = otpbank.Otpbank
