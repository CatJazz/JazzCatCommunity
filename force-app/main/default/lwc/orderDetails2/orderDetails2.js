/* eslint-disable no-console */
import { LightningElement, track, wire } from 'lwc';
// import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext} from "lightning/messageService";
// import CAT_CART_MESSAGE from '@salesforce/messageChannel/CatCartMessageChannel__c';
import { fireEvent, registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

const DEFAULT_SHIPPING = 14.99;

export default class OrderDetails extends LightningElement {

  // @wire(MessageContext)
  // messageContext;

  @wire(CurrentPageReference) pageRef;
  
  subscription     = null;
  error;
  cartNotEmpty     = false;
  showTaxAmount    = false;
  haveShipping     = false;
  haveBilling      = false;
  taxAmount;
  taxLabel
  shippingTaxState;
  shippingTaxRate; 
  billingTaxState;
  billingTaxRate;
  subTotal;
  grandTotal;
  @track cartCopy; 
  
  processCartPopulated(payload) {
    let cartCnt,cartTot,cartItemCnt,localData = [];
    cartCnt     = 0;
    cartItemCnt = 0;
    cartTot     = 0;
    payload.forEach(cartRec => {
      if(cartRec.OrderQuantity > 0) {
        cartItemCnt ++;
        cartCnt += cartRec.OrderQuantity;
        cartTot += (cartRec.UnitPrice * cartRec.OrderQuantity);
      }      
      localData.push(cartRec);
    });
    this.cartCopy = [...localData];
    this.subTotal = cartTot + DEFAULT_SHIPPING;
    this.cartNotEmpty = localData.length > 0 ? true : false;
    this.calculateCartGrandTotal();
    console.log('OrderDetails:processCartPopulated() just ended');
  }

  processCartUnpopulated() {
    this.cartNotEmpty = false;
    this.calculateCartGrandTotal();
    console.log('OrderDetails:processCartUnpopulated() just ended');
  }

  processShippingCompletePayload(payload) {
    this.haveShipping     = true;
    this.shippingTaxState = payload.State;
    this.shippingTaxRate  = payload.TaxRate;
    this.calculateCartGrandTotal();
  }

  processShippingIncompletePayload(payload) {
    this.haveShipping = false;
    this.calculateCartGrandTotal();
  }

  processBillingCompletePayload(payload) {
    // Billing info has been filled in, so this takes precedence for sales tax purposes.
    this.haveBilling     = true;
    this.billingTaxState = payload.State;
    this.billingTaxRate  = payload.TaxRate;
    this.calculateCartGrandTotal();
  }

  processBillingIncompletePayload(payload) {
    this.haveBilling = false;
    this.calculateCartGrandTotal();
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
  */

  handleMessage(message) {
    debugger;
    if(message) {
      switch(message.type) {
        case 'CatCartPopulated' :
          console.log('handleMessage',message);
          this.processCartPopulated(message.payload);
          break;   
        case 'CatCartUnpopulated' :
            console.log('handleMessage',message);
            this.processCartUnpopulated(message.payload);
            break;   
        case 'CatShippingComplete' :
            console.log('handleMessage',message);
            this.processShippingCompletePayload(message.payload);
            break;
        case 'CatShippingIncomplete' :
            console.log('handleMessage',message);
            this.processShippingIncompletePayload(message.payload);
            break;                
        case 'CatBillingComplete' :
          console.log('handleMessage',message);
          this.processBillingCompletePayload(message.payload);
          break;
        case 'CatBillingIncomplete' :
          console.log('handleMessage',message);
          this.processBillingIncompletePayload(message.payload);
          break;          
        default :
      }
    } 
  }

  unsubscribeFromCatMessages() {
    // unsubscribe(this.subscription);
    // this.subscription = null;
  }

  connectedCallback() {
    // this.subscribToCatMessages();
    registerListener('CatMessage', this.handleMessage, this);
  }

  disconnectedCallback() {
    // this.unsubscribeFromCatMessages()    
  }

}
