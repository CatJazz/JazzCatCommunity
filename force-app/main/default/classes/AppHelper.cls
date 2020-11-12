public without sharing class AppHelper {

  @AuraEnabled(cacheable=true)
  public static string accessTest() {
    System.debug('accessTest()');  
    return 'This is a test of Apex permissions';
  }

  @AuraEnabled(cacheable=true)
  public static List<Account> getAccounts() {
    System.debug('getAccounts()');  
    List<Account> data = [Select Id,Name From Account LIMIT 6];
    return data;
  }

  @AuraEnabled(cacheable=true)
  public static List<StateSalesTax__mdt> getStateSalesTaxes() {
    List<StateSalesTax__mdt> data = [SELECT DeveloperName,Label,Rate__c FROM StateSalesTax__mdt ORDER BY Label];
    return data;
  }

 @AuraEnabled(cacheable=true)
 public static List<Product2> getCatProducts(Boolean carouselRequest) {
  System.debug('getCatProducts');
  List<Product2> data;
  if(carouselRequest) {
    data = [
      SELECT Id,Name,Description,ProductCode,LwcImageSmall__c,LwcImageMedium__c,LwcImageLarge__c,ImageAltText__c,StartingInventory__c,CurrentInventory__c,(SELECT UnitPrice FROM PricebookEntries)
      FROM  Product2 
      WHERE Family = 'Cats' AND IsActive = true
      ORDER BY Name ASC NULLS FIRST LIMIT 5
   ];
  } else {
    data = [
      SELECT Id,Name,Description,ProductCode,LwcImageSmall__c,LwcImageMedium__c,LwcImageLarge__c,ImageAltText__c,StartingInventory__c,CurrentInventory__c,(SELECT UnitPrice FROM PricebookEntries)
      FROM  Product2 
      WHERE Family = 'Cats' AND IsActive = true
      ORDER BY Name ASC NULLS FIRST
   ];
  }
  System.debug('data size: ' + data.size());
  return data;
}

private static Id CreateAccount(AppShippingWrapper shipping, AppBillingWrapper billing) {
  Id id = null;
  Account tmpAccount = new Account();
  tmpAccount.Name              = 'Account for ' + billing.FirstName + ' ' + billing.LastName;
  tmpAccount.BillingStreet     = billing.Street;
  tmpAccount.BillingCity       = billing.City;
  tmpAccount.BillingState      = billing.State;
  tmpAccount.BillingPostalCode = billing.Zip;
  tmpAccount.ShippingStreet     = shipping.Street;
  tmpAccount.ShippingCity       = shipping.City;
  tmpAccount.ShippingState      = shipping.State;
  tmpAccount.ShippingPostalCode = shipping.Zip;
  try {
    insert tmpAccount;
    id = tmpAccount.Id;
  } catch(DmlException e) {
    System.debug('Error has occurred inserting new Account: ' + e.getMessage());
  }
  return id;
}

private static Id CreateContact(AppShippingWrapper shipping, AppBillingWrapper billing, AppPaymentWrapper payment, Id accountId) {
  Id id = null;
  Contact tmpContact = new Contact();
  tmpContact.AccountId            = accountId;
  tmpContact.FirstName            = billing.FirstName;
  tmpContact.LastName             = billing.LastName;
  tmpContact.Email                = billing.Email;
  tmpContact.Phone                = billing.Phone;
  tmpContact.ShippingFirstName__c = shipping.FirstName;
  tmpContact.ShippingLastName__c  = shipping.LastName;
  tmpContact.ShippingEmail__c     = shipping.Email;
  tmpContact.ShippingPhone__c     = shipping.Phone;
  tmpContact.CreditCard__c        = payment.CreditCard;
  tmpContact.CreditCcv__c         = payment.CreditCcv;
  tmpContact.CreditExpire__c      = payment.CreditExpire;
  try {
    insert tmpContact;
    id = tmpContact.Id;
  } catch(DmlException e) {
    System.debug('Error has occurred inserting new Contact: ' + e.getMessage());
  }
  return id;
}

private static Id CreateCatOrderMaster(AppBillingWrapper billing, AppOrderMasterWrapper summary, Id accountId, Id contactId) {
  Id id = null;
  Decimal DEFAULT_SHIPPING = 14.99;
  CatOrderMaster__c tmpCatOrderMaster = new CatOrderMaster__c();
  tmpCatOrderMaster.Account__c    = accountId;
  tmpCatOrderMaster.Contact__c    = contactId;
  tmpCatOrderMaster.Shipping__c   = DEFAULT_SHIPPING;
  tmpCatOrderMaster.SubTotal__c   = summary.SubTotal;
  tmpCatOrderMaster.GrandTotal__c = summary.GrandTotal;
  tmpCatOrderMaster.TaxAmount__c  = summary.TaxAmount;
  tmpCatOrderMaster.TaxLabel__c   = 'Tax ' + billing.State + ' (' + billing.TaxRate + '%)';
  try {
    insert tmpCatOrderMaster;
    id = tmpCatOrderMaster.Id;
  } catch(DmlException e) {
    System.debug('Error has occurred inserting new CatOrderMaster: ' + e.getMessage());
  }
  return id;
}

private static String CreateCatOrderDetail(List<AppOrderWrapper> orders, Id catOrderMasterId) { 
  List<CatOrder__c> catOrderList = new List<CatOrder__c>();
  CatOrder__c catOrder;
  Integer productQty;
  Integer orderCnt     = 0;
  Integer orderItemCnt = 0;
  Decimal orderTot     = 0.0;
  Map<String,Integer> productQuantityMap = new Map<String,Integer>();

  String htmlTableHead = '<table><thead><tr><th><div>Item</div></th><th><div>Produt Code</div></th><th><div>Quantity</div></th><th><div>Price</div></th><th><div>Total</div></th></tr></thead><tbody>';
  String htmlTableRows  = '';
  List<Id> idList = new List<Id>(); 
  
  for(AppOrderWrapper order : orders) {
    catOrder = new CatOrder__c();
    catOrder.Cat_Order_Master__c = catOrderMasterId;
    catOrder.Name                = order.Name;
    catOrder.Description__c      = order.Description;
    catOrder.OrderQuantity__c    = order.OrderQuantity;
    catOrder.Product__c          = order.ProductId;
    catOrder.ProductCode__c      = order.ProductCode;
    catOrder.UnitPrice__c          = order.UnitPrice;
    catOrderList.add(catOrder);
    String tableRow = '<tr><td>' + order.Name + '</td><td>' + order.ProductCode + '</td><td>' + order.OrderQuantity + '</td><td>' + order.UnitPrice + '</td><td>' + (order.UnitPrice * order.OrderQuantity) + '</td></tr>';
    htmlTableRows += tableRow;
    productQuantityMap.put(order.ProductId, order.OrderQuantity);
    idList.add(order.ProductId);
  }

  List<Product2> productUpdateList = new List<Product2>();
  // Get most recent quantities
  Map<ID, Product2> m = new Map<ID, Product2>([SELECT Id,CurrentInventory__c FROM Product2 WHERE Id In :IdList]);
  for (ID idKey : m.keyset()) {
    Product2 product = m.get(idKey);
    productQty =  productQuantityMap.get(idKey);
    product.CurrentInventory__c =  product.CurrentInventory__c - productQty;
    productUpdateList.add(product);
  }

  htmlTableRows += '<tbody></table></body></html>';
  String html = htmlTableHead + htmlTableRows;
  try {
    insert catOrderList;
    update productUpdateList;
  } catch(DmlException e) {
    System.debug('Error has occurred inserting new CatOrderDetail or updating Product:' + e.getMessage());
  }
  return html;
}

@AuraEnabled
public static Boolean order(AppShippingWrapper shipping, AppBillingWrapper billing,  AppPaymentWrapper payment, List<AppOrderWrapper> orders, AppOrderMasterWrapper summary) {
  
  Boolean retVal = false;
  id newContactId;
  id newAccountId;
  id newCatOrderMasterId;
  String htmlTable;

  // Step 1. Create an Account
  newAccountId = AppHelper.CreateAccount(shipping, billing);

  // Step 2. Create a Contact
  newContactId = AppHelper.CreateContact(shipping, billing, payment, newAccountId);

  // Step 3a.  Create Cat Order Master record
  newCatOrderMasterId = AppHelper.CreateCatOrderMaster(billing, summary, newAccountId,  newContactId);

  // Step 3b.  Create Cat Order detail records and update Product currentInventory counts.
  htmlTable = AppHelper.CreateCatOrderDetail(orders, newCatOrderMasterId);

  // Step 5a. Quick customer email.  We have the data already, so seems silly not to use it.
  String html1 = '<html><body><div>Dear ' + billing.FirstName + ' ' + billing.LastName + '</div';
  String html2 = '<div> Thank you for your order</div>';
  String htmlFinal = html1 + html2 + htmlTable;

  Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
  email.setReplyTo('dr.paws@pawsters.com');    
  email.setSubject('Order confirmation');
  email.toAddresses = new String[] { billing.Email };
  email.HtmlBody = htmlFinal;
  Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {email};
  Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);

  // Step 5b.  Assume a dupliacte of the above for the wherehouse person.

  // If we reacheed this point, no exceptions have been thrown, so all inserts/updated worked.
  // Using email status as the final return result.
  if (results[0].success) {
    retVal = true;
  }

  return retVal;
}

}