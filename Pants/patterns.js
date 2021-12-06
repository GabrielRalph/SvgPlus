import {SvgPlus, SvgPath, Vector} from "../3.5.js";
import {DotNote} from "../SvgComponents/DotNote.js"

const back_neck_depth = 1.5;
const size12 = {
  bust: 87,
  waist: 65,
  high_hip: 86,
  hip: 97,
  half_across_back: 16.2,
  armhole_width: 11,
  armhole: 42.6,
  neck_base: 37,
  shoulder_length: 11.5,
  bicep_width: 27,
  elbow: 25.8,
  hieght: 162.5,
  dress_length: 98,
  waist_to_knee: 57.6,
  armhole_depth: 18,
  nap_to_waist: 40.4,
  underarm_length: 46.5,
  waist_to_hip: 22,
  nap_to_bust_point: 24,
  skirt_length: 30,
  outside_leg: 102,
  body_rise: 29
}



// for (let dot of dots) dots_el.appendChild(dot.el);
// for (let dot of skirt) dots_el.appendChild(dot.el);

let dir = 0.5;
class Dot extends Vector{
  constructor(x=0, y=null, name){
    if (x instanceof Vector) {
      super(x);
      this.name = y;
    }else {
      super(x,y);
      this.name = name;
    }
    this.update();
  }


  update(){
    dir -= 0.5;
    if (dir == -1) dir = 0.5;
    let el = new DotNote({
      position: this,
      radius: 0.3,
      offset: new Vector(dir,-1),
      note: {
        align: "middle",
        content: this.name,
      }
    })

    el.class = dir == 0 ? "A" : dir < 0 ? "B" : "C";

    if (this.el&&this.el.parentNode) {
      this.el.parentNode.replaceChild(el, this.el);
    }else {
      this.el = el;
    }
  }
}

class PatternSvg extends SvgPlus {
  constructor(id){
    if (id) super(id);
    else super("svg");
    this.props = {viewBox:"0 0 84.1 118.8"};
  }

  drawPatternDots(pattern){
    let dots = this.createChild("g", {class: "dots"});
    if (pattern instanceof Pattern) {

      for (let i = 0; i < pattern.points; i++) {
        if (pattern[i] instanceof Vector)
          dots.appendChild(new Dot(pattern[i], i).el)
      }
    }
  }

  drawPatternPath(pattern){
    let path = this.createChild(SvgPath);
    pattern.setPath(path);
  }
}

class Pattern {
  get points(){
    return 100;
  }
}

class Bodice extends Pattern{
  constructor(m, zero = new Vector(0,0)) {
    super();
    let size_var = 0;
    if (m.bust > 87) size_var = (m.bust - 87)/5;

    this[0] = zero;
    this[1] = zero.addV(back_neck_depth);
    this[2] = this[1].addV(m.nap_to_waist);
    this[3] = this[1].addV(m.armhole_depth + 4);
    this[4] = this[1].add(this[3]).div(2);
    let width = m.bust/2 + 5;
    this[5] = this[3].addH(width);
    this[6] = this[0].addH(width);

    let drop = 1.3 + size_var;

    this[7] = this[2].addH(width).addV(1.3 + size_var);

    let half_back_neck_width = m.neck_base / 6 + 1.4;
    this[8] = this[0].addH(half_back_neck_width);

    this[9] = this[3].addH(m.half_across_back + 1.8);
    this[10] = this[9].addV(-(m.armhole + 2.5)/6);
    this[11] = this[10].addV(-(m.armhole + 2.5)/4);
    this[12] = this[9].addH(m.armhole_width);
    this[13] = this[12].addV(-(m.armhole + 2.5)/6);
    this[14] = this[13].addV(-(m.armhole + 2.5)/4);
    this[15] = this[3].add(this[5]).div(2);
    this[16] = this[15].addV(this[3].dist(this[2]) + 1 + size_var*0.3);
    this[17] = this[14].addV(0.5);
    this[18] = this[6].addV(m.neck_base/6 + 1.6)
    this[19] = this[6].addH(-(m.neck_base/6 + 0.5));
    this[20] = this[5].add(this[12]).div(2);

    this[21] = this[20].clone();
    this[21].y = this[2].y + 1.8 + size_var*0.7;

    this[22] = this[3].add(this[9]).div(2);

    this[23] = this[22].clone();
    this[23].y = this[2].y + 0.5;

    //proportion of neck base
    let d19_20 = this[19].dist(this[20]);
    let delta = m.nap_to_bust_point - half_back_neck_width - d19_20;
    this[24] = this[20].addV(delta);
    this[25] = this[24].addV(-1.5);
    this[26] = this[24].addV(1.5);

    let s35a = this[2].dist(this[7]);
    let s35b = m.waist/2 + 3.5;

    let fd = 5;
    let sd = 4;
    let bd = 3.5;

    let fd_r = this[26].dist(this[21]);
    let sd_r = this[15].dist(this[16]);
    let bd_r = this[22].dist(this[23]);

    let fd_y = fd_r - Math.sqrt(fd_r*fd_r - (fd/2)*(fd/2));
    let sd_y = sd_r - Math.sqrt(sd_r*sd_r - (sd/2)*(sd/2));
    let bd_y = bd_r - Math.sqrt(bd_r*bd_r - (bd/2)*(bd/2));

    this[28] = this[21].add(new Vector(fd/2, -fd_y));
    this[29] = this[21].add(new Vector(-fd/2, -fd_y));

    this[30] = this[16].add(new Vector(sd/2, -sd_y));
    this[31] = this[16].add(new Vector(-sd/2, -sd_y));

    this[32] = this[23].add(new Vector(bd/2, -bd_y));
    this[33] = this[23].add(new Vector(-bd/2, -bd_y));
  }
  setPath(){}
  get points() {return 100;}
}

class Pants extends Pattern{
  constructor(m, zero = new Vector(50, 0)){
    super();
    let scale = m.hip / 2;
    this[0] = zero.clone();
    let skirt = new Skirt(m, zero.addH(-scale - 1.6));
    this[31] = skirt[15];// let u1 = scale/2;
    this[32] = skirt[16];// let u1 = scale/2;
    this[33] = skirt[19];// let u1 = scale/2;
    this[34] = skirt[20];
    this[35] = skirt[14];
    this[36] = skirt[21];
    this[37] = skirt[17];

    this[1] = this[0].addH(-scale/6);
    this[4] = skirt[13];
    this[2] = this[0].addV(m.body_rise);
    this[3] = this[4].clone();
    this[3].y = this[2].y;
    this[5] = this[1].addV(m.outside_leg - 1);
    this[6] = this[1].addV(m.waist_to_knee);
    this[7] = this[2].addH(scale/5 - 1);

    let delta = (scale / 10 - 1)/Math.sqrt(2);
    delta = new Vector(delta, -delta);
    this[8] = this[2].add(delta);

    this[9] = this[6].addH(3*scale/10 - 1.5);
    this[10] = this[6].addH(-3*scale/10 + 1.5);

    this[12] = this[5].addH(scale/5 + 1.5);
    this[11] = this[5].addH(-scale/5 - 1.5);

    this[44] = new Vector;
    // this[0] = new Vector(0);
    let skirtb = new Skirt(m, this[44]);
    this[38] = skirtb[9];
    this[39] = skirtb[11];
    this[40] = skirtb[12];
    this[41] = skirtb[10];
    this[43] = skirtb[13];

    this[45] = this[4].clone();
    this[45].y = this[0].y + m.waist_to_hip;


    // this[13] = this[44].addH(scale/6);

    let actual_waist = this[44].dist(this[38]) +
                       this[41].dist(this[40]) +
                       this[35].dist(this[34]) +
                       this[33].dist(this[32]) +
                       this[31].dist(this[0]);
    alert(actual_waist*2)
    // alert(this[35].dist(this[0]))
  }

  setPath(path) {
    path.class = "pattern";
    let t1 = 8;
    let t2 = new Vector(2.3, 2.3);
    let t3 = 20;
    console.log(t2);
    path.M(this[0]).
    L(this[31]).
    L(this[37]).
    L(this[32]).
    L(this[33]).
    L(this[36]).
    L(this[34]).
    L(this[35]).
    C(this[35], this[4].addV(-t1), this[4]).
    C(this[4].addV(t1), this[10], this[10]).
    L(this[11]).
    L(this[12]).
    L(this[9]).
    L(this[7]).
    C(this[7], this[8].add(t2), this[8]).
    S(this[0].addV(t3), this[0])
  }

  get points() {return 46;}
}

class Skirt extends Pattern{
  constructor(m, zero = new Vector) {
    super();
    let reduced_hip = false;
    let bodice = new Bodice(m);
    let w = m.hip / 2 + 1.6;
    let hl = m.waist_to_hip;
    this[0] = zero.clone();
    this[1] = this[0].addV(hl);
    this[2] = this[1].addV(m.skirt_length);
    this[3] = this[1].addH(w);
    this[4] = this[0].addH(w);
    this[5] = this[2].addH(w);
    let s1_6 = bodice[15].dist(bodice[3]) + 1;
    this[6] = this[1].addH(s1_6);
    this[7] = this[2].addH(s1_6);
    this[8] = this[0].addH(s1_6).addV(-1);
    this[9] = this[0].addH(bodice[33].x - bodice[2].x).addV(-0.5);
    this[10] = this[9].addH(bodice[32].x - bodice[33].x);
    this[11] = this[9].add(this[10]).div(2);
    this[11].y = this[1].y - 6;
    this[12] = this[10].addH(bodice[31].x - bodice[32].x).addV(-0.5);
    this[13] = this[6].addV(-6);
    this[14] = this[8].addH(this[8].x - this[12].x);

    this[15] = this[4].addH(bodice[28].x - bodice[7].x).addV(-0.3)
    this[16] = this[15].addH(-1.3);
    this[17] = this[16].add(this[15]).div(2);
    this[17].y = this[1].y - 10;
    this[18] = this[14].add(this[16]).div(2);

    let diffd = this[14].dist(this[16]) - bodice[30].dist(bodice[29]);
    if (diffd < 0) diffd = 0;// diffd /= 2;
    this[20] = this[18].addH(-diffd);
    this[19] = this[18].addH(diffd);
    this[21] = this[18].clone();
    this[21].y = this[1].y - 11;

    if (reduced_hip) {
      this[12] = this[12].addV(-1).addH(-1)
      this[14] = this[14].addV(-1).addH(1)
    }
  }

  setPath(){}
  get points() {
    return 22;
  }
}


class FrontBlockPants extends Pattern {
  constructor(m, zero = new Vector){
    super();

    let scale = m.hip / 2;
    this.scale = scale;


    this[0] = zero.clone();
    this[1] = this[0].addH(-scale/6);
    this[2] = this[0].addV(m.body_rise);
    // this[3] = this[]
    this[5] = this[1].addV(m.outside_leg - 1);
    this[6] = this[1].addV(m.waist_to_knee);
    this[7] = this[2].addH(scale/5 - 1);

    let delta = (scale / 10 - 1)/Math.sqrt(2);
    delta = new Vector(delta, -delta);
    this[8] = this[2].add(delta);

    let knee_delta = 3*scale/10 - 1.5;
    let ankle_delta = scale/5 + 1.5;
    this[9] = this[6].addH(knee_delta);
    this[10] = this[6].addH(-knee_delta);
    this[11] = this[5].addH(-ankle_delta);
    this[12] = this[5].addH(ankle_delta);

    // TODO:
    let skirt  = new Skirt(m);
    let front_d1 = skirt[6].dist(skirt[3]);
    this[4] = this[0].addH(-front_d1).addV(m.waist_to_hip);

    this[3] = this[4].clone();
    this[3].y = this[2].y;

    // let d1 =
    // console.log(d1);
    this[14] = this[0].add(skirt[14].sub(skirt[4]));

  }

  setPath(path){
    let t0 = this[3].sub(this[4]);
    let t1 = this[9].sub(this[12]).div(2.5);
    let t2 = new Vector(-this.scale/20, 0);
    let t3 = t2.rotate(5.1*Math.PI/4).div(1);
    let t4 = new Vector(0, this[0].dist(this[2])*0.65);
    let t5 = this[10].sub(this[11]).div(3);

    path.class = "pattern"
    path.M(this[14]).
    S(this[4].sub(t0), this[4]).
    C(this[4].add(t0), this[10].add(t5), this[10]).
    S(this[11], this[11]).
    L(this[12]).
    S(this[9].sub(t1), this[9]).
    S(this[7], this[7]).
    C(this[7].add(t2), this[8].add(t3), this[8]).
    S(this[0].add(t4), this[0])
    // S(this[7].add(t2), this[7]).
  }
}

class BackBlockPants extends Pattern {
  constructor(m, zero = new Vector){
    super();
    let front = new FrontBlockPants(m);
    let scale = m.hip / 2;
    this.scale = scale;
    let seat_angle_delta = 0.5;

    this[0] = zero.clone();
    this[13] = this[0].addH(scale / 6);
    this[14] = this[0].addV(m.body_rise);
    this[17] = this[13].addV(m.outside_leg - 1);
    this[18] = this[13].addV(front[1].dist(front[6]));
    this[19] = this[18].addH(-(front[10].dist(front[6]) + 1.5));
    this[20] = this[18].addH((front[6].dist(front[9]) + 1.5));
    this[21] = this[17].addH(-(front[11].dist(front[5]) + 1));
    this[22] = this[17].addH((front[5].dist(front[12]) + 1));
    this[24] = this[14].addH(-(3*scale/10 + 1.5));
    this[25] = this[14].addH(-seat_angle_delta);

    let hp = this[0].addV(m.waist_to_hip);
    let vec = hp.sub(this[25]);
    let y_pos = this[0].y - 1.5;

    this[26] = hp.add(vec.mul((y_pos - hp.y)/vec.y));

    let delta = (scale / 10 - 1)/Math.sqrt(2);
    delta = new Vector(-delta, -delta);
    this[31] = this[25].add(delta);

    let skirt = new Skirt(m);
    this[16] = this[0].add(skirt[6].sub(skirt[0]));
    this[15] = this[16].clone();
    this[15].y = this[14].y;
    this[29] = this[0].add(skirt[12].sub(skirt[0]));
    this[28] = this[29].addH(-1.5);

    let waist_front = front[14].dist(front[0]) - m.waist/4;
    // console.log(front[14].dist());
    let waist_back = this[26].dist(this[28]) - m.waist/4;
    let reductions = 2*(waist_front + waist_back);

    let fhp = front[0].addV(m.waist_to_hip);
    let back_hips = hp.dist(this[16]);
    let front_hips = fhp.dist(front[4]);
    console.log(`
      waist back delta: ${Math.round(waist_back)*10/10}
      waist front delta: ${Math.round(waist_front*10)/10}
      dart reductions: ${reductions}
      hips front: ${front_hips}
      hips back: ${back_hips}
      hips: ${2*(front_hips + back_hips)} vs actual ${m.hip}
      `);
  }

  setPath(path){
    let inside_leg_t_scale = 0.3;
    let outside_leg_t_scale = 0.3;
    let hips_side_t_scale = 1;

    let waist_normal_t_scale = 0.8;
    let crouch_t_scale = this.scale/20;
    let crouch_start_t_length = this.scale/30;

    let inside_leg_t = this[19].sub(this[21]).mul(inside_leg_t_scale);
    let outside_leg_t = this[20].sub(this[22]).mul(outside_leg_t_scale);

    let hips_side_t = this[15].sub(this[16]).mul(hips_side_t_scale);

    let hp = this[14];
    hp.y = this[16].y;
    let crouch_t = new Vector(-crouch_t_scale, crouch_t_scale);
    // crouch_t = crouch_t.rotate(5*Math.PI/4);

    let crouch_start_t = new Vector(crouch_start_t_length, 0)
    let waist_normal_t = this[25].sub(this[26]).mul(waist_normal_t_scale);


    path.class = "pattern"
    path.M(this[28]).
    S(this[16].sub(hips_side_t), this[16]).
    C(this[16].add(hips_side_t), this[20].add(outside_leg_t), this[20]).
    S(this[22], this[22]).
    L(this[21]).
    S(this[19].sub(inside_leg_t), this[19]).
    S(this[24], this[24]).
    C(this[24].add(crouch_start_t), this[31].add(crouch_t), this[31]).
    S(this[26].add(waist_normal_t), this[26])
    // S(this[7].add(t2), this[7]).
  }
}


export {PatternSvg, Bodice, Skirt, Pants, size12, FrontBlockPants, BackBlockPants, Vector}
