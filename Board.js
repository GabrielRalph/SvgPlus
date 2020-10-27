
class Board extends SvgElement{
  constructor(el){
    super(el)
    this.zoom = new ZoomAndPan(this);
    this.unit = 'mm';
    this.P_A = new Vector(0,0);


    this.bb_width = 165;
    this.bb_height = 100;
    this.pic_width = 58;
    this.pic_height = 70;

    this.bb_i_1 = 13;
    this.bb_i_2 = 80.5;
    this.bb_i_3 = 148;

    this.i_width = 4;
    this.i_height = 1.5;

    this.hole_r = 3.5/2;
    this.hole_offset = 3;

    this.border = 5;

    this.draw();
  }

  set bb_height(val){
    this._bb_height = parseFloat(val);
  }
  get bb_height(){return this._bb_height}

  set bb_width(val){
    this._bb_width = parseFloat(val);
  }
  get bb_width(){return this._bb_width}

  set pic_height(val){
    this._pic_height = parseFloat(val);
  }
  get pic_height(){return this._pic_height}

  set pic_width(val){
    this._pic_width = parseFloat(val);
  }
  get pic_width(){return this._pic_width}

  set i_height(val){
    this._i_height = parseFloat(val);
  }
  get i_height(){return this._i_height}

  set i_width(val){
    this._i_width = parseFloat(val);
  }
  get i_width(){return this._i_width}

  set bb_i_1(val){
    this._bb_i_1 = parseFloat(val);
  }
  get bb_i_1(){return this._bb_i_1}
  set bb_i_2(val){
    this._bb_i_2 = parseFloat(val);
  }
  get bb_i_2(){return this._bb_i_2}
  set bb_i_3(val){
    this._bb_i_3 = parseFloat(val);
  }
  get bb_i_3(){return this._bb_i_3}


  get P_B(){return this.P_A.addH(this.bb_width)}
  get P_C(){return this.P_B.addH(this.pic_width)}
  get P_D(){return this.P_C.addV(this.pic_height)}
  get P_E(){return new Vector(this.P_B.x, this.P_D.y)}
  get P_F(){return this.P_B.addV(this.bb_height)}
  get P_G(){return new Vector(this.P_A.x, this.P_F.y)}

  get P_AB1(){return this.P_A.addH(this.bb_i_1)}
  get P_AB2(){return this.P_A.addH(this.bb_i_2)}
  get P_AB3(){return this.P_A.addH(this.bb_i_3)}

  get P_GF1(){return new Vector(this.P_AB1.x+this.i_width, this.P_F.y)}
  get P_GF2(){return new Vector(this.P_AB2.x+this.i_width, this.P_F.y)}
  get P_GF3(){return new Vector(this.P_AB3.x+this.i_width, this.P_F.y)}

  get I_a(){return new Vector(0, -this.i_height)}
  get I_b(){return new Vector(this.i_width, 0)}
  get I_c(){return new Vector(0, this.i_height)}
  get I_path(){
    let p = new DPath();
    return p.l(this.I_a).l(this.I_b).l(this.I_c)
  }
  get I_path_r(){
    let p = new DPath();
    return p.l(this.I_a).l(this.I_b.mul(-1)).l(this.I_c)
  }
  get b_r(){return new Vector(this.border, this.border)}

  draw_inner(){
    let inner = this.createChild('path')

    inner.M(this.P_A)
    .L(this.P_AB1)
    .push(this.I_path)
    .L(this.P_AB2)
    .push(this.I_path)
    .L(this.P_AB3)
    .push(this.I_path)
    .L(this.P_B)
    .L(this.P_C)
    .L(this.P_D)
    .L(this.P_E)
    .L(this.P_F)
    .L(this.P_GF3)
    .push(this.I_path_r)
    .L(this.P_GF2)
    .push(this.I_path_r)
    .L(this.P_GF1)
    .push(this.I_path_r)
    .L(this.P_G).Z()
  }

  draw_outer(){
    let outer = this.createChild('path');
    outer.M(this.P_A.addH(-this.border))
    .A(this.b_r, 0, 0, 1, this.P_A.addV(-this.border))
    .L(this.P_C.addV(-this.border))
    .A(this.b_r, 0, 0, 1, this.P_C.addH(this.border))
    .L(this.P_D.addH(this.border))
    .A(this.b_r, 0, 0, 1, this.P_D.addV(this.border))
    .L(this.P_E.add(this.b_r))
    .L(this.P_F.addH(this.border))
    .A(this.b_r, 0, 0, 1, this.P_F.addV(this.border))
    .L(this.P_G.addV(this.border))
    .A(this.b_r, 0, 0, 1, this.P_G.addH(-this.border))
    .Z()
    outer.splitAtLength(33)
  }

  draw_holes(){
    this.createChild('ellipse', {cx: this.P_C.x - this.hole_offset, cy: this.P_C.y + this.hole_offset, rx: this.hole_r, ry: this.hole_r})
    this.createChild('ellipse', {cx: this.P_D.x - this.hole_offset, cy: this.P_D.y - this.hole_offset, rx: this.hole_r, ry: this.hole_r})
    this.createChild('ellipse', {cx: this.P_E.x + this.hole_offset, cy: this.P_E.y - this.hole_offset, rx: this.hole_r, ry: this.hole_r})
    this.createChild('ellipse', {cx: this.P_B.x + this.hole_offset, cy: this.P_B.y + this.hole_offset, rx: this.hole_r, ry: this.hole_r})
  }

  draw(){
    this.innerHTML = ''
    this.draw_inner();
    this.draw_outer();
    this.draw_holes();
  }
}
