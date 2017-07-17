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
  };

  interface IGetTransactionReturn {
    transactionId: string,
    posId: string,
    responseCode: string,
    state: 'VEVOOLDAL_INPUTVARAKOZAS' | 'FELDOLGOZAS_ALATT' | 'FELDOLGOZVA' | 'VEVOOLDAL_VISSZAVONT' |
      'VEVOOLDAL_TIMEOUT' | 'BOLTOLDAL_LEZARASVARAKOZAS' | 'LEZARAS_ALATT' | 'BOLTOLDAL_TIMEOUT',
    startDate: Date,
    endDate: Date,
    authorizationCode: string,
  }

  interface IStartTransactionReturn {
    transactionId: string,
    posId: string,
    message: 'SIKERESWEBSHOPFIZETESINDITAS',
  }

  class Otpbank {
    constructor(posId: string, privateKey: string);
    static generateTransactionId(): string;
    
    getOtpRedirectUrl(transactionId: string): string;
    getTransaction(transactionId: string): Promise<IGetTransactionReturn>;
    startTransaction(
      transactionId: string,
      callbackUrl: string,
      amount: number,
      currency: 'HUF' | 'EUR' | 'USD',
      shopComment: string,
      optionals: IWorkflowSynchOptionals
    ): Promise<IStartTransactionReturn>;
  }
}

export = otpbank.Otpbank
