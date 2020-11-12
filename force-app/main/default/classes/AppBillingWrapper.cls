public class AppBillingWrapper {

  @AuraEnabled public String  FirstName    {get;set;}
  @AuraEnabled public String  LastName     {get;set;}
  @AuraEnabled public String  Email        {get;set;}
  @AuraEnabled public String  Phone        {get;set;}
  @AuraEnabled public String  Street       {get;set;}
  @AuraEnabled public String  City         {get;set;}
  @AuraEnabled public String  State        {get;set;}
  @AuraEnabled public String  Zip          {get;set;}
  @AuraEnabled public Decimal TaxRate      {get;set;}

}
