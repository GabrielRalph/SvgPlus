class Hat extends SvgPlus{
  build(){
    this.rt = 170/2;
    this.rb = 190/2;
    this.h = 80;
    this.bh = this.h*Math.cos(this.b_angle);
    this.b_angle = Math.PI/4;
    // this.draw_top();

    this.cone_rim = new ConeNet('path');
    this.cone_rim.set_dims(this.rt, this.rb, this.h);
    let a = this.cone_rim.side_angle;
    this.cone_rim.set_dims(this.rb, this.rb + this.h*Math.sin(this.b_angle), this.h*Math.sin(this.b_angle));


    this.appendChild(this.cone_rim)

    // this.cone_rim = new Cone(this.rb*this.h/(this.rb - this.rt), this.rb);
    // this.cone_brim = new Cone(this.h + this.rb/Math.cos(this.b_angle), this.rb + this.bh);

    // this.draw_brim();
    // this.draw_rim();
    this.draw_top();
  }

  // get hb(){
  //   return this.h/Math.sin(this.b_anlge);
  // }
  // get c_rr(){
  //   return ;
  // }
  //
  // get cone_1(){
  //   return this.rb*this.h/(this.rb - this.rt);
  // }
  //
  // get c_rb(){
  //   return
  // }


  draw_rim(){
    let rim = new SvgPath('path');
    rim.props = {stroke: 'green', fill: 'none'};
    this.appendChild(rim);

    let s = new Vector(this.cone_rim.r, 0);

    rim.M(s).A(new Vector(this.cone_rim.r), 0, 0, 1, s.rotate(this.cone_rim.flat_a));

    let r2 = this.cone_rim.radius_at(this.h);
    console.log(r2);
    let s2 = new Vector(r2, 0);

    rim.L(s2.rotate(this.cone_rim.flat_a));
    rim.A(new Vector(r2), 0, 0, 0, s2).Z();
  }

  draw_brim_top(){
    let brim_top = new SvgPath('path');
    brim_top.props = {stroke: 'green', fill: 'none'};
    this.appendChild(brim_top);

  }
  //
  draw_top(){
    let top = this.makeChild('ellipse');
    top.props = {
      stroke: 'green',
      fill: 'none',
      rx: this.rt,
      ry: this.rt,
      cx: 0,
      cy: 0,
    }
  }

  draw_brim(){
    console.log(this.c_rb);
    let brim = new SvgPath('path');
    brim.props = {stroke: 'green', fill: 'none'};
    this.appendChild(brim);

    let s = new Vector(this.cone_brim.r, 0);

    brim.M(s).A(new Vector(this.cone_brim.r), 0, 1, 1, s.rotate(this.cone_brim.flat_a));

    let r2 = this.cone_brim.radius_at(this.bh);
    console.log(r2);
    let s2 = new Vector(r2, 0);

    brim.L(s2.rotate(this.cone_brim.flat_a));
    brim.A(new Vector(r2), 0, 1, 0, s2).Z();
  }
}

class Cone{
  constructor(r, br){
    this.radius = r;
    this.base_radius = br;
  }
  get a(){
    return Math.asin(this.br/this.r);
  }
  get flat_a(){
    return this.a*Math.PI*2;
  }

  get r(){
    return this.radius;
  }
  get br(){
    return this.base_radius;
  }

  base_radius_at(y){
    return this.br - y/Math.tan(this.a);
  }

  radius_at(y){
    return this.r - y / Math.cos(this.a);
  }
}

class ConeNet extends SvgPath{
  build(){
    this.props = {
      stroke: 'green',
      fill: 'none'
    }
  }
  set_dims(r1, r2, h){
    this.r_top = r1;
    this.r_bot = r2;
    this.h = h;

    this.r_dif = this.r_bot - this.r_top;
    this.side_angle = Math.atan( this.h / this.r_dif );

    this.l_diff = this.h / Math.sin(this.side_angle);
    this.l_bot = this.r_bot / Math.cos(this.side_angle);
    this.l_top = this.l_bot - this.l_diff;

    this.flat_angle = Math.PI * 2 * this.r_bot / this.l_bot / 4;

    let dir = this.flat_angle > Math.PI ? 1 : 0;

    let l_bot_vec = new Vector(this.l_bot, 0);
    this.M(l_bot_vec);
    this.A(new Vector(this.l_bot), 0, dir, 1, l_bot_vec.rotate(this.flat_angle));

    let l_top_vec = new Vector(this.l_top, 0);
    this.L(l_top_vec.rotate(this.flat_angle));
    this.A(new Vector(this.l_top), 0, dir, 0, l_top_vec).Z();
  }
}
