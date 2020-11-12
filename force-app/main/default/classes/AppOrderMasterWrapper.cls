public class AppOrderMasterWrapper {

  @AuraEnabled public Decimal TaxAmount  {get;set;}
  @AuraEnabled public Decimal TaxRate    {get;set;}
  @AuraEnabled public Decimal SubTotal   {get;set;}
  @AuraEnabled public Decimal GrandTotal {get;set;}

}
