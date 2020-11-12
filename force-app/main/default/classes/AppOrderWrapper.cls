public class AppOrderWrapper {

  @AuraEnabled public String  ProductId     {get;set;}
  @AuraEnabled public String  Name          {get;set;}
  @AuraEnabled public String  Description   {get;set;}
  @AuraEnabled public String  ProductCode   {get;set;}
  @AuraEnabled public Integer OrderQuantity {get;set;}
  @AuraEnabled public Decimal UnitPrice     {get;set;}

}
