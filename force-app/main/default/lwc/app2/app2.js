import { LightningElement, track, wire } from "lwc";
import order from "@salesforce/apex/AppHelper.order";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext} from "lightning/messageService";
// import CAT_CART_MESSAGE from '@salesforce/messageChannel/CatCartMessageChannel__c';
import { registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

const DEFAULT_SHIPPING = 14.99;
export default class App extends LightningElement {
//  @wire(MessageContext)
//  messageContext;

 
  @wire(CurrentPageReference) pageRef;
  @track cartCopy; 
//subscription      = null;
  haveOrder         = false;
  haveShipping      = false;
  haveBilling       = false;
  havePayment       = false;
  orderPlaced       = false;
  initialized       = false;
  enableOrderButton = false;
  currentTab; 
  currentOption; 
  welcomeOption;
  shoppingOption;
  shippingOption;
  billingOption; 
  checkoutOption;
  welcomeDiv;
  shoppingDiv;
  shippingDiv;
  billingDiv; 
  shipping;
  billing;
  payment;
  taxAmount;
  taxLabel
  shippingTaxState;
  shippingTaxRate; 
  billingTaxState;
  billingTaxRate;
  subTotal;
  grandTotal;
  
  /*
  subscribToCatMessages() {
    if (this.subscription) {
      return;
    }
    this.subscription = subscribe(
      this.messageContext,
      CAT_CART_MESSAGE,
      message => {
        this.handleMessage(message);
      },
      { scope: APPLICATION_SCOPE }
    );
  }

  unsubscribeFromCatMessages() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
*/

  handleClick(event) {
    // Set current menu item inactive
    this.currentOption.classList.remove('active');
    // Hide current content tab
    this.currentTab.classList.add('hide');

    const clicked = event.target.dataset.tabname;
    switch(clicked) {
      case 'Welcome' :
        this.currentTab    = this.welcomeDiv;
        this.currentOption = this.welcomeOption;
        break;
      case 'Shopping' :
        this.currentTab    = this.shoppingDiv;
        this.currentOption = this.shoppingOption
        break;
      case 'Shipping' :
        this.currentTab    = this.shippingDiv
        this.currentOption = this.shippingOption
        break;
      case 'Billing' :
        this.currentTab    = this.billingDiv
        this.currentOption = this.billingOption 
        break;
      default :
    }
    // Set selected menu item active
    this.currentOption.classList.add('active');
    // Show selected tab content
    this.currentTab.classList.remove('hide');
  }

  processCartPopulated(payload) {
    let localData = [];
    payload.forEach(cartRec => {
      localData.push(cartRec);
    });
    this.cartCopy = [...localData];
  }

  handleMessage(message) {
    if(message) {
      switch(message.type) {
        case 'CatPaymentComplete' :
          console.log('App: handleMessage','CatPaymentComplete');
          this.havePayment = true;
          this.payment     = message.payload;
          break;      
        case 'CatPaymentIncomplete' :
          console.log('App: handleMessage','CatPaymentIncomplete');
          this.havePayment = false;
          break;      
        case 'CatCartPopulated' :
          console.log('App: handleMessage','CatCartPopulated');
          this.processCartPopulated(message.payload);
          this.haveOrder = true;
          break;      
        case 'CatCartUnpopulated' :
          console.log('App: handleMessage','CatCartUnpopulated');
          this.haveOrder = false;
          break;          
        case 'CatShippingComplete' :
          console.log('App: handleMessage','CatShippingComplete');
          this.haveShipping = true;
          this.shipping     = message.payload;
          break;
        case 'CatShippingIncomplete' :
          console.log('App: handleMessage','CatShippingIncomplete');
          this.haveShipping = false;
          break;
        case 'CatBillingComplete' :
          console.log('App: handleMessage','CatBillingComplete');
          this.haveBilling = true;
          this.billing   = message.payload;
          break;
        case 'CatBillingIncomplete' :
          console.log('App: handleMessage','CatBillingIncomplete');
          this.haveBilling = false;
          break;          
        default :
      }
    } 
    this.orderButtonCheck();
  }

  orderButtonCheck() {
    this.enableOrderButton = false;
    if(this.havePayment && this.haveShipping && this.haveBilling ) {
      if(this.haveOrder) {
        this.enableOrderButton = true;
      }
    }
  }

  calculateCartGrandTotal() {
    this.showTaxAmount  = false;
    if(this.cartNotEmpty) {
      if(this.haveBilling) {
        this.showTaxAmount = true;
        this.taxLabel   = `Tax (${this.billingTaxState} - ${this.billingTaxRate}%)`;
        this.taxAmount  = this.subTotal * (this.billingTaxRate / 100);
        this.grandTotal = this.subTotal + this.taxAmount;
      } else {
        if(this.haveShipping) {
          this.showTaxAmount = true;
          this.taxLabel   = `Tax (${this.shippingTaxState} - ${this.shippingTaxRate}%)`;
          this.taxAmount  = this.subTotal * (this.shippingTaxRate / 100);
          this.grandTotal = this.subTotal + this.taxAmount;
        }
      }
    } 
  }

  placeOrder() {
    console.log('*** Place order ***');
    let cartCnt,cartTot,cartItemCnt,orderCart=[];
    cartCnt     = 0;
    cartItemCnt = 0;
    cartTot     = 0;
    const localData = [...this.cartCopy];
    localData.forEach(cartRec => {
      if(cartRec.OrderQuantity > 0) {
        cartItemCnt ++;
        cartCnt += cartRec.OrderQuantity;
        cartTot += (cartRec.UnitPrice * cartRec.OrderQuantity);
        orderCart.push({ProductId:cartRec.Id, Name:cartRec.Name, Description:cartRec.Description, ProductCode:cartRec.ProductCode, UnitPrice:cartRec.UnitPrice, OrderQuantity:cartRec.OrderQuantity});
      }
    });
    this.subTotal = cartTot + DEFAULT_SHIPPING;
    this.calculateCartGrandTotal();
    const summary = {TaxAmount:this.taxAmount, TaxRate:this.taxRate, SubTotal:this.subTotal, GrandTotal:this.grandTotal};

    let toastEvent;
    order({ shipping: this.shipping, billing: this.billing, payment: this.payment, orders: orderCart, summary: summary }) 
    .then(result => {
      if(result == true) {
        toastEvent = new ShowToastEvent({
          title: 'Success',
          message: 'Order placed Salesforce successfully',
          variant: 'success'
        });          
      } else {
        toastEvent = new ShowToastEvent({
          title: 'Error',
          message: 'Salesforce error ',
          variant: 'error'
        });
      }
      dispatchEvent(toastEvent);        
      this.error = undefined;
      console.log(result);
    })
    .catch(error => {
      this.error = error;
      console.log(error);
      toastEvent = new ShowToastEvent({
        title: 'Error',
        message: 'Salesforce error ',
        variant: 'error'
      });
      dispatchEvent(toastEvent);
    });
     
  }

  connectedCallback() {
    console.log('App: connectedCallback()');
    //this.subscribToCatMessages();   
    registerListener('CatMessage', this.handleMessage, this);
  }

  disconnectedCallback() {
//  this.unsubscribeFromCatMessages()    
  }

  renderedCallback() {
    if(!this.initialized) {
      this.initialized    = true;
      this.welcomeOption  = this.template.querySelector('.welcome-option');
      this.shoppingOption = this.template.querySelector('.shopping-option');
      this.shippingOption = this.template.querySelector('.shipping-option');
      this.billingOption  = this.template.querySelector('.billing-option');
      this.welcomeDiv     = this.template.querySelector('.welcome');
      this.shoppingDiv    = this.template.querySelector('.shopping');
      this.shippingDiv    = this.template.querySelector('.shipping');
      this.billingDiv     = this.template.querySelector('.billing');
      this.currentTab     = this.welcomeDiv;
      this.currentOption  = this.welcomeOption;
      console.log(`renderedCallback() - currentTab:`, )
    }
  }
  
}
