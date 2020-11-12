import { LightningElement, api, wire, track } from 'lwc';
import getStateSalesTaxes from "@salesforce/apex/AppHelper.getStateSalesTaxes";
// import { publish, subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext} from "lightning/messageService";
// import CAT_CART_MESSAGE from '@salesforce/messageChannel/CatCartMessageChannel__c';
import { fireEvent, registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

const FIRST_NAME_MIN   = 2;
const LAST_NAME_MIN    = 2;
const PHONE_MIN        = 10;
const EMAIL_MIN        = 7;
const STREET_MIN       = 7;
const CITY_MIN         = 4;
const ZIP_MIN          = 5;

export default class Addresses extends LightningElement {

  @wire(CurrentPageReference) pageRef;
  @api addressType;
  isBilling;
  haveShipping = false; 
  haveBilling  = false; 
  shipping;
  billing;

//  @wire(MessageContext)
//  messageContext;

  firstName         = 'Graham';
  firstNameCount    = 6;
  firstNameCopy     = this.firstName;
  lastName          = 'Smith';
  lastNameCount     = 5;
  lastNameCopy      = this.lastName;
  phone             = '510-967-4557';
  phoneCopy         = this.phone;
  phoneCount        = 12;
  email             = 'sfjazzcat@gmail.com'; 
  emailCopy         = this.email;
  emailCount        = 19;
  street            = '1128 Glendora Ave'; 
  streetCount       = 17;
  streetCopy        = this.street;
  city              = 'Oakland';
  cityCount         = 7;
  cityCopy          = this.city;
  state             = 'CA'; 
  stateCount        = 2;
  stateCopy         = this.state;
  zip               = '94602';
  zipCount          = 5;
  zipCopy           = this.zip;
  passedValidation  = false;
  useShippingToggle = false;
  error;
  @track stateData  = [];
  stateTaxMap       = {};
  stateSelected     = false;
  taxRate;

  async loadStateTaxRates() {
    console.log('loadStateTaxRates()');
    await getStateSalesTaxes()
    .then(result => {
      result.forEach(rec => {
        const state = rec.Label;
        const code  = rec.DeveloperName;
        const rate  = rec.Rate__c;
        this.stateTaxMap[code] = {Code: code, State: state, Rate: rate};
        this.stateData.push({State:state, Code:code});
      });
      console.log('stateTaxMap:',this.stateTaxMap);  
    });
  }

  connectedCallback() {
    this.isBilling = this.addressType === 'Billing' ? true: false;
    this.loadStateTaxRates();
//    this.subscribToCatMessages();  
    registerListener('CatMessage', this.handleMessage, this);
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

  unsubscribeFromCatMessages() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
*/

  handleSelectState(event) {
    console.log(event.target.value);
    if(event.target.value === '0') {
      this.stateSelected = false;
      this.state   = '';
      this.taxRate = null;
    } else {
      this.stateSelected = true;
      this.state   = event.target.value;
      this.taxRate = this.stateTaxMap[this.state].Rate;
    }
    this.allInputFieldsPopulated();
  }

  populateFieldWithShippingDetails() {
    console.log('populateFieldWithShippingDetails()');
    console.log('this.shipping',this.shipping);
    this.firstName = this.shipping.FirstName;
    this.lastName  = this.shipping.LastName;
    this.phone     = this.shipping.Phone;
    this.email     = this.shipping.Email;
    this.street    = this.shipping.Street;
    this.city      = this.shipping.City;
    this.state     = this.shipping.State;
    this.zip       = this.shipping.Zip;
  }

  revertField() {
    console.log('populateFieldWithShippingDetails()');
    console.log('this.shipping',this.shipping);
    this.firstName = this.firstNameCopy;
    this.lastName  = this.lastNameCopy
    this.phone     = this.phoneCopy;
    this.email     = this.emailCopy;
    this.street    = this.streetCopy;
    this.city      = this.cityCopy;
    this.state     = this.stateCopy;
    this.zip       = this.zipCopy;
  }

  handleChange(event) {
    const field = event.target.name;
    switch(field) {
      case 'use-shipping-toggle' :
        this.useShippingToggle = event.target.checked;
        if(this.useShippingToggle) {
          this.populateFieldWithShippingDetails();
        } else {
          this.revertField();
        }
        break;

      case 'inp-first-name' :
        this.firstName      = event.target.value;
        this.firstNameCount = event.target.value.length;
        this.firstNameCopy  = this.firstName;
        break;
        
      case 'inp-last-name' :
        this.lastName      = event.target.value;
        this.lastNameCount = event.target.value.length;
        this.lastNameCopy  = this.lastName;
        break;
  
      case 'inp-phone' : 
        this.phone      = event.target.value;
        this.phoneCount = event.target.value.length;
        this.phoneCopy  = this.phone;
        break;
  
      case 'inp-email' :
        this.email      = event.target.value;
        this.emailCount = event.target.value.length;
        this.emailCopy  = this.email;
        break;        
      
      case 'inp-street' : 
        this.street      = event.target.value;
        this.streetCount = event.target.value.length;
        this.streetCopy  = this.street;
        break;
  
      case 'inp-city' : 
        this.city        = event.target.value;
        this.cityCount   = event.target.value.length;
        this.cityCopy    = this.city;
        break;
  
      case 'inp-state' : 
        this.state       = event.target.value;
        this.stateCount  = event.target.value.length;
        this.stateCopy   = this.state;
        break;
  
      case 'inp-zip' : 
        this.zip      = event.target.value;
        this.zipCount = event.target.value.length;
        this.zipCopy  = this.zip;
        break;     
      default:
    }
    this.allInputFieldsPopulated();
  }

  allInputFieldsPopulated() {
    this.passedValidation = false;
    if(
      this.firstNameCount   >= FIRST_NAME_MIN &&
      this.lastNameCount    >= LAST_NAME_MIN  &&
      this.phoneCount       >= PHONE_MIN      && 
      this.emailCount       >= EMAIL_MIN      && 
      this.streetCount      >= STREET_MIN     && 
      this.cityCount        >= CITY_MIN       && 
      this.zipCount         >= ZIP_MIN && 
      this.stateSelected) {
      this.passedValidation = true;
    }
    this.sendMessage();
    return this.passedValidation;
  }

  handleMessage(message) {
    if(message) {
      if(this.isBilling) {
        // Selectivly listen for messages so that we don't listen to our own.
        switch(message.type) {
          case 'CatShippingComplete' :
            console.log('RevCultApp: handleMessage','CatShippingComplete');
            this.haveShipping = true;
            this.shipping     = message.payload;
            break;
          case 'CatShippingIncomplete' :
            console.log('RevCultApp: handleMessage','CatShippingIncomplete');
            this.haveShipping = false;
            break;
        }
      } else {
        switch(message.type) {
          case 'CatBillingComplete' :
            console.log('RevCultApp: handleMessage','CatBillingComplete');
            this.haveBilling = true;
            this.billing   = message.payload;
            break;
          case 'CatBillingIncomplete' :
            console.log('RevCultApp: handleMessage','CatBillingIncomplete');
            this.haveBilling = false;
            break;          
          default :
        }
      }
    } 
    this.useShippingCheck();
  }

  useShippingCheck() {
    this.useShipping = false;
    if(this.isBilling && this.haveShipping) {
      this.useShipping = true;
    }
  }

  sendMessage() {
    const now       = new Date();
    const options   = { year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'};
    const nowString = now.toLocaleDateString('en-US',options);
    let data,message;
    if(this.passedValidation) {
      data    = {FirstName: this.firstName, LastName:this.lastName, Phone:this.phone, Email:this.email,  Street:this.street, City:this.city,  State:this.state,  Zip:this.zip, TaxRate:this.taxRate};
      if(this.addressType==="Shipping") {
        message  = {type: 'CatShippingComplete',message : `Shipping Details - ${nowString}`,source: 'addresses',payload: data};
        this.shipping = message;
        this.haveShipping = true;
      } else {
        message = {type: 'CatBillingComplete',message : `Billing Details - ${nowString}`,source: 'addresses',payload: data};
        this.billing  = message;
        this.haveBilling = true;
      }
    } else {
      data    = null;
      if(this.addressType==="Shipping") {
        this.haveShipping = false;
        message = {type: 'CatShippingIncomplete',message : `Shipping Details - ${nowString}`,source: 'addresses',payload: data};
      } else {
        this.haveBilling = false;
        message = {type: 'CatBillingIncomplete',message : `Billing Details - ${nowString}`,source: 'addresses',payload: data};
      }
    }
    //publish(this.messageContext, CAT_CART_MESSAGE, message);
    fireEvent(this.pageRef, 'CatMessage', message);
  }

}
