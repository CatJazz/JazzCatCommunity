import { LightningElement, wire } from 'lwc';
// import { publish, MessageContext} from "lightning/messageService";
// import CAT_CART_MESSAGE from '@salesforce/messageChannel/CatCartMessageChannel__c';
import { fireEvent, registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

const CC_LEN   = 16;
const CCV_LEN  = 3;

export default class Payment extends LightningElement {

//  @wire(MessageContext)
//  messageContext;

  @wire(CurrentPageReference) pageRef;
  subscription  = null;
  months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  years  = ['20','21','22','23','24','25','26','27','28','29','30'];

  ccInputType    = "password";
  ccvInputType   = "password";
  
  creditCard      = '1234567890123456';
  creditCardCount = 16;
  creditCcv       = '456';
  creditCcvCount  = 3;
  creditMonth     = '0';
  creditYear      = '0';
  showDateWarning = false;

  handleCcMask(event) {
    this.ccInputType   = event.target.checked ? "password" : "text";
  }

  handleCcvMask(event) {
    this.ccvInputType   = event.target.checked ? "password" : "text";
  }

  handleMonthSelect(event) {
    this.creditMonth = event.target.value;
    this.allInputFieldsPopulated();
  }

  handleYearSelect(event) {
    this.creditYear = event.target.value;
    this.allInputFieldsPopulated();
  }

  allInputFieldsPopulated() {
    if(this.ccCheck()) {
      this.sendMessage('PAYMENT-COMPLETE');
    } else {
      this.sendMessage('PAYMENT-INCOMPLETE');
    }
  }

  handleChange(event) {
    const field = event.target.name;
    switch(field) {
      case 'inp-ccv' : 
        this.creditCcvCount = event.target.value.length;
        break;  
      case 'inp-credit-card' : 
        this.creditCardCount = event.target.value.length;          
        break;
      default:
    }
    this.allInputFieldsPopulated();
  }

  ccCheck() {
    console.log(`ccCheck month: ${this.creditMonth} year: ${this.creditYear}`);
    let retVal;
    if(this.creditMonth === "0" || this.creditYear === "0" || this.creditCardCount != CC_LEN || this.creditCcvCount != CCV_LEN) {
      retVal = false;
    }  else {
      const ccExpireYear  = parseInt(`20${this.creditYear}`);
      const ccExpireMonth = parseInt(this.creditMonth)-1;
      const ccExpireDate  = new Date(ccExpireYear,ccExpireMonth,1);
      const today = new Date();
      console.log(`ccExpireDate: ${ccExpireDate} - Today: ${today}`);
      if(ccExpireDate > today) {
        this.showDateWarning = false;
        console.log('Expire date is in the future');
        retVal = true;
      } else {
        this.showDateWarning = true;
        console.log('Expire date is in the past');
        retVal = false
      }
    }
    return retVal;
  }

  sendMessage(msgType) {
    const now       = new Date();
    const options   = { year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'};
    const nowString = now.toLocaleDateString('en-US',options);
    let data,message;
    switch(msgType) {
      case 'PAYMENT-INCOMPLETE' :
        data = null;
        message = {type: 'CatPaymentIncomplete',message : `Payment Details - ${nowString}`,source: 'billing',payload: data};
        // publish(this.messageContext, CAT_CART_MESSAGE, message);
        fireEvent(this.pageRef, 'CatMessage', message);
        break;
      case 'PAYMENT-COMPLETE' :
        data = {CreditCard:this.creditCard,CreditCcv:this.creditCcv,CreditMonth:this.creditMonth,CreditYear:this.creditYear};          
        message = {type: 'CatPaymentComplete',message : `Payment Details - ${nowString}`,source: 'billing',payload: data};
        // publish(this.messageContext, CAT_CART_MESSAGE, message);
        fireEvent(this.pageRef, 'CatMessage', message);
        break;
      default :  
    }
  }

}