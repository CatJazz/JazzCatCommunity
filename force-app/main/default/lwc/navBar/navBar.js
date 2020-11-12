import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavBar extends NavigationMixin(LightningElement) {

  url;
  homePageRef;
  aboutPageRef;
  cartPageRef;
  resumePageRef;
  cloudPageRef;

  handleClick(event) {
    const clicked = event.target.dataset.tabname;
    event.preventDefault();
    event.stopPropagation();
    switch(clicked) {
      case 'Home' :
        this[NavigationMixin.Navigate](this.homePageRef);
        break;
      case 'About' :
        this[NavigationMixin.Navigate](this.aboutPageRef);
        break;
      case 'Cart' :
        this[NavigationMixin.Navigate](this.cartPageRef);
        break;
      case 'Resume' :
        this[NavigationMixin.Navigate](this.resumePageRef);
        break;
      case 'Cloud' :
        this[NavigationMixin.Navigate](this.cloudPageRef);
        break;
      default :
    }
  }

  connectedCallback() {
    this.homePageRef   = {type: 'comm__namedPage',attributes: {name: 'Home'}};
    this.aboutPageRef  = {type: 'comm__namedPage',attributes: {name: 'About__c'}};
    this.cartPageRef   = {type: 'comm__namedPage',attributes: {name: 'Cart__c'}};
    this.resumePageRef = {type: 'comm__namedPage',attributes: {name: 'Resume__c'}};
    this.cloudPageRef  = {type: 'comm__namedPage',attributes: {name: 'cloud__c'}};
  }

}
