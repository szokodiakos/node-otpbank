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

  class Otpbank {
    constructor(posId: string, privateKey: string);
    static generateTransactionId(): string;
    
    getOtpRedirectUrl(transactionId: string): string;
    startWorkflowSynch(
      transactionId: string,
      callbackUrl: string,
      amount: number,
      currency: 'HUF' | 'EUR' | 'USD',
      shopComment: string,
      optionals: IWorkflowSynchOptionals
    ): Promise<string>;
  }
}

export = otpbank.Otpbank
