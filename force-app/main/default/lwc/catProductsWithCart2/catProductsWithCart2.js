import { LightningElement, wire, track } from 'lwc';
import getCatProducts from "@salesforce/apex/AppHelper.getCatProducts";
// import { publish, MessageContext} from "lightning/messageService";
// import CAT_CART_MESSAGE from '@salesforce/messageChannel/CatCartMessageChannel__c';
import { fireEvent, registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class Products extends LightningElement {
  //@wire(MessageContext)
  //messageContext;

  @wire(CurrentPageReference) pageRef;
  @track componentData;
  @track cartData;
  cartItemCount = 0;
  cartCount   = 0;
  cartTotal   = 0;
  productMap  = {}
  cartMap     = {}
  initialized = false;

  async loadProducts() {
    console.log('loadProducts()');
    await getCatProducts({carouselRequest:false})
    .then(result => {
      let localData = [];
      let product,productRec,id,name,description,productCode,staticResourceName,lwcSmallImageUrl,lwcMediumImageUrl,lwcLargeImageUrl,imageAltText;
      let startingInventory,currentInventory,unitPrice;
      for(let i=0;i<result.length;i++) {
        id = name = description = productCode = staticResourceName = lwcSmallImageUrl = lwcMediumImageUrl = lwcLargeImageUrl = imageAltText = '';
        startingInventory = currentInventory = unitPrice = 0;
        product           = result[i];
        id                = product.Id;
        name              = product.Name;
        description       = product.Description;
        productCode       = product.ProductCode;
        unitPrice         = product.PricebookEntries[0].UnitPrice;
        startingInventory = parseInt(product.StartingInventory__c);
        currentInventory  = parseInt(product.CurrentInventory__c);
        imageAltText      = product.ImageAltText__c

        if(product.LwcImageSmall__c) {
          lwcSmallImageUrl = product.LwcImageSmall__c;
        }
        if(product.LwcImageMedium__c) {
          lwcMediumImageUrl = product.LwcImageMedium__c;
        }
        if(product.LwcImageLarge__c) {
          lwcLargeImageUrl = product.LwcImageLarge__c;
        }
        productRec = {
          Id:id,
          Name:name,
          Description:description,
          ProductCode:productCode,
          UnitPrice:unitPrice,
          OrderQuantity: 0,
          ButtonLabel: 'Add',
          AddedToCart:false,
          EnableAddButton: false,
          StartingInventory:startingInventory,
          CurrentInventory:currentInventory,
          OriginalCurrentInventory:currentInventory,
          LwcSmallImageUrl:lwcSmallImageUrl,
          LwcMediumImageUrl:lwcMediumImageUrl,
          LwcLargeImageUrl:lwcLargeImageUrl,
          ImageAltText:imageAltText
        };

        localData.push(productRec);
        this.productMap[id] = productRec;
      }
      this.componentData = [...localData];
      console.log('Cat Products');
      console.log(localData);
    })
    .catch(error => {
      this.error = error;
      this.compData = undefined;
    });
  }

  connectedCallback() {
    this.loadProducts();
  }

  handleRemoveClick(event) {
    const productId  = event.target.dataset.productid;
    console.log('Remove from cart:');
    console.log(this.productMap[productId]);
    this.removeFromCart(productId);
    this.updateCurrentInventory(productId);
  }

  handleAddClick(event) {
    const productId  = event.target.dataset.productid;
    this.productMap[productId].AddedToCart = true;
    this.productMap[productId].ButtonLabel = 'Update';
    this.addToCart(this.productMap[productId]);
  }

  handleChange(event) {
    const field = event.target.name;
    switch(field) {
      case 'quantity-input'  :
        const orderQuantity   = parseInt(event.target.value);
        const productId       = event.target.dataset.productid;
        const currentQuantity = this.productMap[productId].OriginalCurrentInventory;
        const updatedQuantity = currentQuantity - orderQuantity;
        this.productMap[productId].OrderQuantity = orderQuantity;
        this.productMap[productId].CurrentInventory = updatedQuantity;
        this.updateComponentData(productId,updatedQuantity,orderQuantity);
        break;
    }
  }

  updateCurrentInventory(productId) {
    const currentInventory = this.productMap[productId].OriginalCurrentInventory;
    this.productMap[productId].OrderQuantity    = 0;
    this.productMap[productId].AddedToCart      = false;
    this.productMap[productId].ButtonLabel      = 'Add',
    this.productMap[productId].CurrentInventory = currentInventory;
    this.updateComponentData(productId,currentInventory,0);
  }

  updateComponentData(productId,currentQuantity,orderQuantity) {
    let localData = [];
    for (let mapKey in this.productMap) {
      let rec = this.productMap[mapKey];
      if(rec.Id === productId) {
        rec.CurrentInventory = currentQuantity;
        if(orderQuantity > 0) {
          rec.EnableAddButton = true;
        } else {
          rec.EnableAddButton = false;
        }
      }
      localData.push(rec);
    }
    this.componentData = [...localData];
  }

  removeFromCart(productId) {
    let cartRec,cartCnt,cartTot,cartItemCnt,localData = [];
    delete this.cartMap[productId];
    cartCnt     = 0;
    cartItemCnt = 0;
    cartTot     = 0;
    for (let mapKey in this.cartMap) {
      cartRec = this.cartMap[mapKey];
      if(cartRec.OrderQuantity > 0) {
        cartItemCnt ++;
        cartCnt += cartRec.OrderQuantity;
        cartTot += (cartRec.UnitPrice * cartRec.OrderQuantity);
      }
      localData.push(cartRec);
    }
    localData.sort(this.sortBy('Name', 1));
    this.cartData  = [...localData];
    this.cartCount = cartCnt;
    this.cartTotal = cartTot
    this.cartItemCount = cartItemCnt;
    this.sendMessage(localData);
  }

  addToCart(product) {
    let cartRec,cartCnt,cartTot,cartItemCnt,localData = [];
    if(product.Id in this.cartMap) {
      cartRec = this.cartMap[product.Id];
      cartRec.OrderQuantity = product.OrderQuantity;
      cartRec.ProductTotal  = product.UnitPrice * product.OrderQuantity;
      console.log(this.cartMap[product.Id])
    } else {
      cartRec                  = {};
      cartRec.Id               = product.Id;
      cartRec.Name             = product.Name;
      cartRec.ProductCode      = product.ProductCode;
      cartRec.Description      = product.Description;
      cartRec.OrderQuantity    = product.OrderQuantity;
      cartRec.UnitPrice        = product.UnitPrice;
      cartRec.ProductTotal     = product.UnitPrice * product.OrderQuantity;
      cartRec.LwcSmallImageUrl = product.LwcSmallImageUrl;
      this.cartMap[product.Id] = cartRec;
    }
    cartCnt     = 0;
    cartItemCnt = 0;
    cartTot     = 0;
    for (let mapKey in this.cartMap) {
      cartRec = this.cartMap[mapKey];
      if(cartRec.OrderQuantity > 0) {
        cartItemCnt ++;
        cartCnt += cartRec.OrderQuantity;
        cartTot += (cartRec.UnitPrice * cartRec.OrderQuantity);
      }
      localData.push(cartRec);
    }
    localData.sort(this.sortBy('Name', 1));
    this.cartData  = [...localData];
    this.cartCount = cartCnt;
    this.cartTotal = cartTot
    this.cartItemCount = cartItemCnt;
    this.sendMessage(localData);
  }

  sortBy(field, reverse, primer) {
    const key = primer
      ? function(x) {
          return primer(x[field]);
      }
      : function(x) {
        return x[field];
      };
    return function(a, b) {
      a = key(a);
      b = key(b);
      return reverse * ((a > b) - (b > a));
    };
  }

  sendMessage(data) {
    const now       = new Date();
    const options   = { year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'};
    const nowString = now.toLocaleDateString('en-US',options);
    let message;
    if(this.cartItemCount > 0) {
      message = {type: 'CatCartPopulated',message : `Populated Cat Cart - ${nowString}`,source: 'catProductsWithCart',payload: data};
    } else {
      message = {type: 'CatCartUnpopulated',message : `Empty Cat Cart - ${nowString}`,source: 'catProductsWithCart',payload: data};
    }
    // publish(this.messageContext, CAT_CART_MESSAGE, message);
    fireEvent(this.pageRef, 'CatMessage', message);
  }

}

