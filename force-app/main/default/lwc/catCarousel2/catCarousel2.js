import { LightningElement} from 'lwc';

export default class CatCarousel extends LightningElement {

  carouselData;
  images;
  tabIndex;

  connectedCallback() {
    let localData = [];
    localData.push({
      Id:'1234567890',
      Name:'Tree kitten',
      Description:'Kitten in a tree',
      LwcSmallImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Tree_kitten_200__100?v=1',
      LwcMediumImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Tree_kitten_400_300?v=1',
      ImageAltText:'Kitten'}
    );

    localData.push({
      Id:'2345678901',
      Name:'Christmas kitten',
      Description:'Christmas tree kitten',
      LwcSmallImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Christmas_kitten_200_100?v=1',
      LwcMediumImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Christmas_kitten_400_300?v=1',
      ImageAltText:'Kitten'}
    );

    localData.push({
      Id:'2345678902',
      Name:'Ducky kitten',
      Description:'Rubber duck kitten',
      LwcSmallImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Ducky_kitten_200_100?v=1',
      LwcMediumImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Ducky_kitten_400_300?v=1',
      ImageAltText:'Kitten'}
    );

    localData.push({
      Id:'2345678903',
      Name:'Blue eyed kitten',
      Description:'Kitten with blue eyes',
      LwcSmallImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Blue_eye_kitten_200_100?v=1',
      LwcMediumImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Blue_eye_kitten_400_300?v=1',
      ImageAltText:'Kitten'}
    );

    localData.push({
      Id:'2345678904',
      Name:'Sunflower kitten',
      Description:'Sunflower sniffing kitten',
      LwcSmallImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Sunflower_kitten_200_100?v=1',
      LwcMediumImageUrl:'https://sfjazzcat-developer-edition.na158.force.com/Demo2/s/sfsites/c/file-asset/Sunflower_kitten_400_300?v=1',
      ImageAltText:'Kitten'}
    );

    this.images = [...localData];
  }

}
