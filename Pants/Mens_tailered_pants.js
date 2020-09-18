
class Front extends SvgPath{
  constructor(id){
    super(id);
    this.Stpr = 0.5;
    this.P1P4 = 0.5;
    this.K1K3 = 1.7;
    this.A = this.parent.A;
  }

  get V() {  return this.A.addV(this.parent.Sl)             }
  get K() {  return this.A.addV(this.parent.Kh)             }
  get _S() {  return this.A.addV(this.parent.Ins)            }
  get P() {  return this._S.addV(this.parent.Hh)             }
  get P1(){  return this.P.addH(this.parent.Frw)            }
  get V1(){  return new Vector(this.P1.x, this.V.y)  }
  get S3(){  return new Vector(this.P1.x, this._S.y)  }
  get P2(){  return this.P1.addH(this.parent.FrSw)          }
  get P3(){  return this.P2.addH(-0.5*(this.parent.FrSw + this.parent.Frw))}
  get V4(){  return new Vector(this.P3.x, this.V.y)  }
  get A1(){  return new Vector(this.P3.x, this.A.y)  }
  get A2(){  return this.A1.addH(1 - (1/4)*this.parent.Hw)  }
  get A3(){  return this.A1.addH((1/4)*this.parent.Hw - 1)  }
  get A4(){  return this.A2.addH(this.Stpr)          }
  get A5(){  return this.A3.addH(-this.Stpr)         }
  get K1(){  return new Vector(this.P.x + (this.A4.x - this.P.x)*(this.K.y - this.P.y)/(this.A4.y - this.P.y), this.K.y)}
  get K2(){  return new Vector(this.P2.x + (this.A5.x - this.P2.x)*(this.K.y - this.P2.y)/(this.A5.y - this.P2.y), this.K.y)}
  get S2(){  return new Vector(this.P2.x + (this.A5.x - this.P2.x)*(this._S.y - this.P2.y)/(this.A5.y - this.P2.y), this._S.y)}
  get K3(){  return this.K1.addH(this.K1K3)          }
  get K4(){  return this.K2.addH(-this.K1K3)         }
  get S4(){  return this.S3.addV((this.S2.x - this.S3.x)/2)}
  get P4(){  return this.P1.addH(this.P1P4)          }
  get V2(){  return this.V1.addH(-this.parent.Wbc/4 - 0.5)  }
  get V3(){  return this.V2.addV(0.7)                }

  // draw_markers(){
  //   // Place construction points
  //   let v = "A V K S P P1 V1 S3 P2 P3 V4 A1 A2 A3 K3 K4 S2 S4 V3";
  //   v = v.split(" ");
  //   v.forEach((vec) => {
  //     this.pathB.M(this[vec]).L(this[vec]);
  //     let text = this.createChild('text');
  //     text.setAttribute('transform', 'scale(1, -1)')
  //     text.pos = this[vec].add(0.6, -0.4);
  //     let o = text.pos.div(new Vector(55, 125)).mul(100)
  //     text.setAttribute('transform-origin', `${o.x}% ${o.y}%`)
  //     text.el.innerHTML = vec;
  //   });
  // }
  draw(){
    let t = 70;
    this.clear();
    this.M(this.A2).
    C(this.A2.addV(t), this.P.addV(-t/6), this.P).
    S(this.V3, this.V3).C(this.V3, this.V4.addH(-5), this.V4).
    C(this.V4.addH(5), this.V1, this.V1).
    L(this.P4).
    Q(this.S4, this.S2).
    C(this.S2, this.A3.addV(t), this.A3).
    Z()
  }
}
class Back extends SvgPath{
  constructor(id){
    super(id);
    this.Tol = 21.7;
    this.Tosml = 21.7;
  }

  get A1(){ return this.A.addH(this.parent.Hw/2 - 2)}
  get A2(){ return this.A.addH(-2)}
  get A3(){ return this.A1.addH(2)}
  get K(){  return this.K2.addH(-2)}
  get K3(){ return this.K1.addH(2)}
  get P1(){ return this.P.addH(1)}
  get P2(){ return this.P1.addH(-0.5*(this.Tol + this.Tosml))}
  get S2(){ return this.P2.addH(this.parent.Bkw)}
  get P4(){ return this.S2.addH(this.parent.BkSw)}
  get S3(){ return this.A3.addV}
  get V(){  return new Vector(this.P2.x + (this.K.x - this.P2.x)*((this.parent.Sl + 0.7) - this.P2.y)/(this.K.y - this.P2.y), (this.parent.Sl + 0.7))}
  get S3(){ return new Vector(this.K3.x + (this.P4.x - this.K3.x)*((this.parent.Ins - 0.7) - this.K3.y)/(this.P4.y - this.K3.y), (this.parent.Ins - 0.7))}
  get P5(){
    let n = this.P2.sub(this.K);
    n = n.rotate(3*Math.PI/2);
    n = n.div(n.norm()).mul(this.parent.Hc/4 + 2.5);
    return this.P2.add(n)
  }
  get V1(){ return this.V.add(this.P5.sub(this.P2))}
  get V2(){
    let n = this.V1.sub(this.V);
    n = n.div(n.norm()).mul(this.parent.Frw - 2);
    return this.V1.add(n);
  }
  get V3(){
    let n = this.V1.sub(this.V2);
    n = n.div(n.norm()).mul(this.parent.Wbc/2 + 3);
    return this.V2.add(n);
  }

  get Q1(){  return new Vector(this.S2.x + (this.P5.x - this.S2.x)*(this.S3.y - this.S2.y)/(this.P5.y - this.S2.y), this.S3.y)}

  draw_markers(){
    // Place construction points
    let v = "A1 A2 A3 A K K1 K2 K3 P P1 P2 S2 P4 S3 V P5 V1 V2 V3 Q1";
    v = v.split(" ");
    v.forEach((vec) => {
      this.pathB.M(this[vec]).L(this[vec]);
      let text = this.createChild('text');
      text.setAttribute('transform', 'scale(1, -1)')
      text.pos = this[vec];
      let o = text.pos.div(new Vector(70, 140)).mul(100)
      text.setAttribute('transform-origin', `${o.x}% ${o.y}%`)
      text.el.innerHTML = vec;
    });
  }
  draw(){
    this.clear();
    let x = this.parent.Sl/20;
    let p_t = this.V.sub(this.P2);
    p_t = p_t.div(p_t.norm()).mul(x);
    this.M(this.A2).
    L(this.A3).
    L(this.K3).
    L(this.S3).
    // C(this.A3.addV(x), this.K3.add(-1, -x-2), this.K3).
    // S(this.S3, this.S3).
    Q(this.Q1, this.S2).
    L(this.V1).
    L(this.V3).
    L(this.P2).
    L(this.K).
    L(this.A2).Z()
    // S(this.P2.add(p_t), this.P2).
    // S(this.K.add(-1, x+2), this.K).
    // S(this.A2.addV(x), this.A2)
  }
}

class MensTaileredPants extends SvgElement{
  constructor(id, specs){
    super(id);

    this.unit = "cm";


    this.Swa =  1.5;  //Seem allowance
    this.Bh  =  183;  //Height
    this._Hc  =  102;  //Hip Circumference
    this._Wbc =  86;   //Waistband Circumference
    this._Sl  =  110.5;//Side length
    this._Ins =  83;   //Inseam
    this._Hw  =  40;

    this.A = new Vector();

    let front = SVGPlus.make('path')
    this.appendChild(front);
    this.front = new Front(front);

    let back = SVGPlus.make('path');
    this.appendChild(back);
    this.back = new Back(back);

    let x = 40

    // this.R   =  27.5; //Rise
    // this.Kc  =  35;   //Knee Circumference

    this.back.A = this.front.A2.addH(x);
    this.back.K2 = this.front.K3.addH(x);
    this.back.K1 = this.front.K4.addH(x);
    this.back.P = this.front.P3.addH(x);

    this.draw();
  }
  draw(){
    this.front.draw();
    this.back.draw();
  }
  get specs(){
    return {Hc: this.Hc, Hw: this.Hw, Wbc: this.Wbc, Sl: this.Sl, Ins:this.Ins};
  }
  set unit(val){
    if (val === 'cm'){

        this._unit = 1
    }else if(val == 'in'){

      this._unit = 1/2.54
    }
  }
  get unit() {return this._unit}
  get Hw() {return this.unit * this._Hw}
  set Hw(val) {
    if (typeof val === 'number'){
      this._Hw = val;
      this.draw();
    }else if (typeof val === 'string'){
      let num = 0;
      try{
        num = parseFloat(val);
      }catch(err){
        throw `Error${err}`
        return
      }
      this.Hw = num
    }
  }
  get Hc() {return this.unit * this._Hc}
  set Hc(val) {
    if (typeof val === 'number'){
      this._Hc = val;
      this.draw();
    }else if (typeof val === 'string'){
      let num = 0;
      try{
        num = parseFloat(val);
      }catch(err){
        throw `Error${err}`
        return
      }
      this.Hc = num
    }
  }
  get Wbc() {return this.unit * this._Wbc}
  set Wbc(val) {
    if (typeof val === 'number'){
      this._Wbc = val;
      this.draw();
    }else if (typeof val === 'string'){
      let num = 0;
      try{
        num = parseFloat(val);
      }catch(err){
        throw `Error${err}`
        return
      }
      this.Wbc = num
    }
  }
  get Sl() {return this.unit * this._Sl}
  set Sl(val) {
    if (typeof val === 'number'){
      this._Sl = val;
      this.draw();
    }else if (typeof val === 'string'){
      let num = 0;
      try{
        num = parseFloat(val);
      }catch(err){
        throw `Error${err}`
        return
      }
      this.Sl = num
    }
  }
  get Ins() {return this.unit * this._Ins}
  set Ins(val) {
    if (typeof val === 'number'){
      this._Ins = val;
      this.draw();
    }else if (typeof val === 'string'){
      let num = 0;
      try{
        num = parseFloat(val);
      }catch(err){
        throw `Error${err}`
        return
      }
      this.Ins = num
    }
  }
  get Frw() { return  (1/4)*this.Hc - 1.5  }//Front width
  get Sw()  { return  (1/4)*this.Hc - 5    }//Seat width
  get FrSw(){ return  (1/10)*this.Hc/2 + 1 }//Front seat width
  get BkSw(){ return  this.Sw - this.FrSw  }//Back seat width
  get Bkw(){  return  (1/4)*this.Hc + 3.5  }//Back seat width
  get OBkw(){ return  this.BKsw + this.Bkw }//Back seat width
  get Kh(){   return  (3/5)*this.Ins - 2   }//Knee height
  get Hh(){   return  (1/10)*this.Hc/2 + 3 } //Hip height
}
