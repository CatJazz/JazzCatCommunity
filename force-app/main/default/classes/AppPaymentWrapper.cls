public class AppPaymentWrapper {
  @AuraEnabled public String  CreditCard   {get;set;}
  @AuraEnabled public String  CreditCcv    {get;set;} 
  @AuraEnabled public String  CreditExpire {get;set;}
}
