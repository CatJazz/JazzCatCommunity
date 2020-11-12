import { LightningElement, track } from 'lwc';

export default class Introduction extends LightningElement {
  connected    = false; 
  rendered     = false;
  connectedCnt = 0;
  renderedCnt  = 0;
  targetArray  = [];
  paragraphArray = ['graham Smith','Certified Salesforce Developer I','Certified Salesforce Administrator','Skilled with Apex (triggers, remote, batch, queable, schedulable, future)',
  'Skilled with Javascript (Visualforce, Aura and Lightning Web Components)','Skilled with Data (soql, sql, sql-server, stored proceduers)', 'Skilled with Web (html, css, http, rest, soap, rpc, json, xml)'];
    
  connectedCallback() {
    if(!this.connected) {
      console.log('connectedCallback(introduction)')
    }
    console.log('connectedCnt', this.connectedCnt++);
  }

  initialize() {
    console.log('initialize()');
    let paraArray = [];
    let className;
    let i=0;
    this.paragraphArray.forEach(para => {
      className = `my-pclass${i}`;
      paraArray.push({paragraph:para, class:className});
      i++;
    });
    console.log('paraArray');
    console.log(paraArray);
    this.targetArray = [...paraArray];
  }

  renderedCallback() {
    if(!this.rendered) {
      this.rendered = true;
      console.log('renderedCallback(introduction)')
      this.initialize();
    }
    console.log('renderedCnt', this.renderedCnt++);
  }

}
