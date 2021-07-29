import {SvgPlus, SvgPath, Vector} from '../3.5.js'

class DstBuffer{
  constructor(name = "myCam"){
    this._pointBuffer = []
    this._maxX = 0;
    this._maxY = 0;
    this._minX = 0;
    this._minY = 0;
    this._stitchCount = 0;
    this._colorChanges = 0;
    this._lastPoint = new Vector(0,0);
    this._ended = false;

    this.label = name;
    this.name = name;
  }

  get downloadURL(){
    if (!this.ended) this.addPoint('end');

    let dst = this.buffer;

    let n = dst.length;
    let array = new Uint8Array(n)
    for (var i = 0; i < n; i++){
      if(typeof dst[i] == 'string'){
        array[i] = dst[i].charCodeAt(0)
      }else{
        array[i] = dst[i]
      }
    }

    let dst_blob = new Blob([array], {type: "application/octet-stream"})
    var url = window.URL.createObjectURL(dst_blob);
    return url
  }
  download(){
    let a = new SvgPlus("a");
    a.props = {download: this.filename, href: this.downloadURL};
    a.click();
  }

  set label(label){
    this._label = (`${label}`).slice(0, 5);
  }
  get label(){ return this._label }

  set name(value){
    this._name = `${value}`;
  }
  get name(){ return this._name;  }
  get filename(){ return this.name + '.dst'; }

  get ended(){ return this._ended }

  get minX(){ return this._minX }
  get maxX(){ return this._maxX }
  get minY(){ return this._minY }
  get minY(){ return this._minY }

  get stitchCount(){ return this._stitchCount}
  get lastPoint(){ return this._lastPoint}
  get color(){ return this._colorChanges}

  get header(){
    let buffer = []

    let pushString = (string) => {
      for (var i = 0; i < string.length; i++){
        buffer.push(string[i])
      }
    }

    let push = (value) => {
      if(typeof value == 'string'){
        pushString(value)
      }else{
        buffer.push(value)
      }
    }

    let pad = (value, n) => {
      for(var i = 0; i < n; i++){
        buffer.push(value)
      }
    }

    let add = (info) => {
      info.label = `${info.label}`
      info.value = `${info.value}`
      push(info.label)
      if (info.trail != undefined){
        push(info.value)
        pad(info.trail, info.size - info.value.length)
      }else if(info.lead != undefined){
        pad(info.lead, info.size - info.value.length)
        push(info.value)
      }
      push(0x0D)
    }

    //['LA:', 'ST:', 'CO:', '+X:','-X:', '+Y:', '+Y:', 'AX:', 'AY:', 'MX:', 'MY:', 'PD:']
    add({label: 'LA:', trail: 0x20, value: this.label, size: 16})

    add({label: 'ST:', lead: 0, value: this.stitchCount, size: 7})

    add({label: 'CO:', lead: 0, value: this.colorChanges, size: 3})

    add({label: '+X:', lead: 0, value: this.maxX, size: 5})
    add({label: '-X:', lead: 0, value: this.minX, size: 5})
    add({label: '+Y:', lead: 0, value: this.maxY, size: 5})
    add({label: '-Y:', lead: 0, value: this.minY, size: 5})
    add({label: '+X:', lead: 0, value: this.maxX, size: 5})
    add({label: '-X:', lead: 0, value: this.minX, size: 5})
    add({label: '+Y:', lead: 0, value: this.maxY, size: 5})
    add({label: '-Y:', lead: 0, value: this.minY, size: 5})

    push('AX:+')
    pad(0, 4)
    push('0')
    push(0x0D)

    push('AY:+')
    pad(0, 4)
    push('0')
    push(0x0D)

    push('MX:+')
    pad(0, 4)
    push('0')
    push(0x0D)

    push('MY:+')
    pad(0, 4)
    push('0')
    push(0x0D)

    push('PD:******')
    pad(0x0D, 3)

    pad(0x20, 512 - buffer.length)
    return buffer
  }
  get buffer(){
    return this.header.concat(this._pointBuffer);
  }

  decToDst(p, mode = 'stitch'){
    let x = 0;
    let y = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = (1<<0)|(1<<1);

    if (p instanceof Vector){
      x = p.x;
      y = p.y;
    }else if (p == 'color'){
      b3 |= (1<<7)|(1<<6)
      return [b1, b2, b3]
    }else if (p == 'end') {
      b3 = 243;
      return [b1, b2, b3]
    }

    if(mode == 'jump'){
      b3 |= (1<<7)
    }

    let y_sign = y/Math.abs(y);
    y = Math.abs(y)

    //Set Y +-1
    let t1 = y%3;
    if(t1 == 1){
      if(y_sign > 0){
        b1 |= (1<<7)
      }else{
        b1 |= (1<<6)
      }
    }else if(t1 == 2){
      if(y_sign > 0){
        b1 |= (1<<6)
      }else{
        b1 |= (1<<7)
      }
    }

    //Set Y +- 9
    let t9 = Math.ceil(((y - 4)%27)/9);
    if(t9 == 1){
      if(y_sign > 0){
        b1 |= (1<<5)
      }else{
        b1 |= (1<<4)
      }
    }else if(t9 == 2){
      if(y_sign > 0){
        b1 |= (1<<4)
      }else{
        b1 |= (1<<5)
      }
    }

    //Set Y +- 3
    let t3 = Math.ceil(((y - 1)%9)/3);
    if(t3 == 1){
      if(y_sign > 0){
        b2 |= (1<<7)
      }else{
        b2 |= (1<<6)
      }
    }else if(t3 == 2){
      if(y_sign > 0){
        b2 |= (1<<6)
      }else{
        b2 |= (1<<7)
      }
    }

    //Set Y +- 27
    let t27 = Math.ceil(((y - 13)%81)/27);
    if(t27 == 1){
      if(y_sign > 0){
        b2 |= (1<<5)
      }else{
        b2 |= (1<<4)
      }
    }else if(t27 == 2){
      if(y_sign > 0){
        b2 |= (1<<4)
      }else{
        b2 |= (1<<5)
      }
    }

    //Set Y +- 81
    let t81 = Math.ceil(((y - 40)%243)/81);
    if(t81 == 1){
      if(y_sign > 0){
        b3 |= (1<<5)
      }else{
        b3 |= (1<<4)
      }
    }else if(t81 == 2){
      if(y_sign > 0){
        b3 |= (1<<4)
      }else{
        b3 |= (1<<5)
      }
    }


    let x_sign = x/Math.abs(x);
    x = Math.abs(x)

    //Set Y +-1
    t1 = x%3;
    if(t1 == 1){
      if(x_sign > 0){
        b1 |= (1<<0)
      }else{
        b1 |= (1<<1)
      }
    }else if(t1 == 2){
      if(x_sign > 0){
        b1 |= (1<<1)
      }else{
        b1 |= (1<<0)
      }
    }

    //Set Y +- 9
    t9 = Math.ceil(((x - 4)%27)/9);
    if(t9 == 1){
      if(x_sign > 0){
        b1 |= (1<<2)
      }else{
        b1 |= (1<<3)
      }
    }else if(t9 == 2){
      if(x_sign > 0){
        b1 |= (1<<3)
      }else{
        b1 |= (1<<2)
      }
    }

    //Set Y +- 3
    t3 = Math.ceil(((x - 1)%9)/3);
    if(t3 == 1){
      if(x_sign > 0){
        b2 |= (1<<0)
      }else{
        b2 |= (1<<1)
      }
    }else if(t3 == 2){
      if(x_sign > 0){
        b2 |= (1<<1)
      }else{
        b2 |= (1<<0)
      }
    }

    //Set Y +- 27
    t27 = Math.ceil(((x - 13)%81)/27);
    if(t27 == 1){
      if(x_sign > 0){
        b2 |= (1<<2)
      }else{
        b2 |= (1<<3)
      }
    }else if(t27 == 2){
      if(x_sign > 0){
        b2 |= (1<<3)
      }else{
        b2 |= (1<<2)
      }
    }

    //Set Y +- 81
    t81 = Math.ceil(((x - 40)%243)/81);
    if(t81 == 1){
      if(x_sign > 0){
        b3 |= (1<<2)
      }else{
        b3 |= (1<<3)
      }
    }else if(t81 == 2){
      if(x_sign > 0){
        b3 |= (1<<3)
      }else{
        b3 |= (1<<2)
      }
    }

    return [b1, b2, b3]
  }
  dstToDec(b1, b2, b3){
    let b = (b, c) => {
      return ((b>>c)&1)
    }
    let x = b(b1, 0) - b(b1, 1) + 9*b(b1, 2) - 9*b(b1, 3) + 3*b(b2, 0) -3*b(b2, 1)
    x +=   27*b(b2, 2) - 27*b(b2, 3) + 81*b(b3, 2) - 81*b(b3, 3);
    let y = b(b1, 7) - b(b1, 6) + 9*b(b1, 5) - 9*b(b1, 4) + 3*b(b2, 7) -3*b(b2, 6)
    y += 27*b(b2, 5) - 27*b(b2, 4) + 81*b(b3, 5) -81*b(b3, 4);
    return {x: x, y: y}
  }

  addPoint(p, mode){
    let dp = new Vector;
    if (p == 'color') {
      dp = p;
      this._colorChanges++;
    }else if (p == 'end') {
      this._ended = true;
      dp = p;
    } else if (p instanceof Vector){
      dp = p.sub(this.lastPoint).round(0);

      if (Math.abs(dp.x) > 118 || Math.abs(dp.y) > 118) {
        throw 'Point exceeds maximum distance ' + p
      }
      this._stitschCount++;
      this._lastPoint = this.lastPoint.add(dp);
      this._minX = this.lastPoint.x<this._minX?this.lastPoint.x:this._minX;
      this._minY = this.lastPoint.y<this._minY?this.lastPoint.y:this._minY;
      this._maxX = this.lastPoint.x>this._maxX?this.lastPoint.x:this._maxX;
      this._maxY = this.lastPoint.y>this._maxY?this.lastPoint.y:this._maxY;
    }
    let b = this.decToDst(dp, mode)
    this._pointBuffer.push(b[0]);
    this._pointBuffer.push(b[1]);
    this._pointBuffer.push(b[2]);
  }

  jumpTo(point2){
    let point1 = this.lastPoint;
    let m = Math.abs(point1.grad(point2));
    let inc = new Vector();
    if (m < 1){
      inc.x = 118*(point2.x - point1.x)/Math.abs(point2.x - point1.x);
      inc.y = 118*m*(point2.y - point1.y)/Math.abs(point2.y - point1.y);
    }else{
      inc.x = 118*(point2.x - point1.x)/Math.abs(point2.x - point1.x)/m;
      inc.y = 118*(point2.y - point1.y)/Math.abs(point2.y - point1.y);
    }

    let inc_dist = inc.norm();
    let move_dist = point1.distance(point2);
    let n = Math.floor(move_dist/inc_dist);

    for (var i = 0; i < n+1; i++){
      this.addPoint(point1, 'jump');
      point1 = point1.add(inc);
    }
    this.addPoint(point2, 'jump');
  }
}

class SvgToDst extends DstBuffer{
  constructor(name){
    super(name);
    this.lastColor = null;
  }

  encode(element) {
    if (element instanceof SVGSVGElement) {
      let g = new SvgPlus("g");
      g.innerHTML = element.innerHTML;
      element.innerHTML = "";
      element.appendChild(g);
      element = g;
    }
    if (element instanceof SVGGElement){
      let bb = element.getBBox();
      let cx = bb.x + bb.width/2;
      let cy = bb.y + bb.height/2;
      this._center = new Vector(cx, cy);
      this._encodeGroup(element);
    }
  }

  get center(){
    return this._center;
  }

  _encodeGroup(element){
    if (element instanceof SVGGElement) {
      for (var child of element.children) {
        this._encodeGroup(child);
      }
    }else if (element instanceof SVGPathElement) {
      if (SvgPlus.is(element, SvgPath)) {
        this._encodePath(element);
      }else{
        this._encodePath(new SvgPath(element));
      }
    }
  }

  _encodePath(path) {
    if (!SvgPlus.is(path, SvgPath)) return;

    console.log(path);
    let loop = parseInt(path.loop);
    if (Number.isNaN(loop) || typeof loop !== 'number') loop = 1;


    //Watch for color changes
    let stroke = window.getComputedStyle(path ,null).getPropertyValue('stroke');
    if (this.lastColor !== stroke && this.lastColor !== null){
      this.addPoint('color');
    }
    this.lastColor = stroke;

    //start path of
    path.makeAbsolute();
    let start = path.d.start.p.sub(this.center).mul(new Vector(1, -1));
    if (start.dist(this.lastPoint) > 10) {
      this.jumpTo(start);
    }

    for (let i = 0; i < loop; i++) {

      let cur = i % 2 == 0 ? path.d.start : path.d.end;
      while(cur != null) {
        //reflect and subtract center
        let p = cur.p.sub(this.center).mul(new Vector(1, -1));

        this.addPoint(p);
        cur = i % 2 == 0 ? cur.next : cur.last;
      }
    }
  }
}


export {DstBuffer, SvgToDst, SvgPath}
