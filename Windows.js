import {SvgPlus} from './3.js'

class Windows extends SvgPlus{
  constructor(){
    super('div');

    this.class = 'windows'


    this.windowPannel = this.createChild('div');
    this.windowPannel.styles = {
      position: 'relative',
      width: "100%",
      height: "100%"
    }

    this._center = new Frame();
    this._left = new Frame();
    this._right = new Frame();

    this.clear();

    this.windowPannel.appendChild(this.center);
    this.windowPannel.appendChild(this.left);
    this.windowPannel.appendChild(this.right);

    this.xPos = 0;
  }

  get center(){
    return this._center;
  }

  set center(val){
    this._center.window = val;
  }

  get left(){
    return this._left;
  }

  set left(val){
    this._left.window = val;
  }

  get right(){
    return this._right;
  }

  set right(val){
    this._right.window = val;
  }

  set xPos(x){
    this.center.xPos = x;
    this.left.xPos = x - 100;
    this.right.xPos = x + 100;
  }

  async moveTo(element, dir){
    this.scrollTo(0, 0);
    if (element instanceof Element){
      await this.waveTransistion(element, dir);
    }
  }

  clear(){
    this.center = null;
    this.left = null;
    this.right = null;
  }

  async moveInWaveTo(element, dir, duration = 400){
    if (dir){
      this.left = element;
    }else{
      this.right = element;
    }

    await this.waveTransistion((progress) => {
      this.xPos = 100 * progress * (dir ? -1 : 1);
    }, true, duration);

    this.xPos = 0;
    this.center = element;
  }
}

class Frame extends SvgPlus{
  constructor(){
    super('div');
    this.class = "window"
    this.styles = {
      inset: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: 'absolute',
    }
  }

  set xPos(val){
    this.styles = {
      transform: `translate(${val}%, 0)`
    }
  }

  set window(el){
    this.innerHTML = "";
    if (el instanceof Element){
      this.appendChild(el)
    }
  }
}
export {Windows}
