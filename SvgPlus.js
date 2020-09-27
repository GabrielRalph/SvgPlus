let SVGPlus = {
  getElementById: function(id){
    let el = document.getElementById(id);
    return this.SVGElementToSVGPlusElement(el);
  },

  is_getter: function(obj, key) {
    let instance = Object.getOwnPropertyDescriptor(obj, key);
    let proto = Object.getOwnPropertyDescriptor(obj.__proto__, key);
    if (typeof instance !== 'undefined' && typeof proto !== 'undefined'){
      let mix = Object.assign(proto, instance);
      return ('get' in mix && typeof mix.get !== "undefined") || 'value' in mix
    }else if(typeof instance !== 'undefined'){
      return 'value' in instance
    }else if (typeof proto !== 'undefined'){
      return ('get' in proto && typeof proto.get !== "undefined")
    }
    return false
  },

  is_setter: function(obj, key) {
    let instance = Object.getOwnPropertyDescriptor(obj, key);
    let proto = Object.getOwnPropertyDescriptor(obj.__proto__, key);
    if (typeof instance !== 'undefined' && typeof proto !== 'undefined'){
      let mix = Object.assign(proto, instance);
      return ('set' in mix && typeof mix.set !== "undefined") || 'value' in mix
    }else if(typeof instance !== 'undefined'){
      return 'value' in instance
    }else if (typeof proto !== 'undefined'){
      return ('set' in proto && typeof proto.set !== "undefined")
    }
    return false
  },

  is_method: function(obj, key) {
    return (typeof obj[key] !== 'undefined' && obj[key] instanceof Function)
  },

  proxy_handlers: {
    get: (target, prop, receiver) => {
      if (SVGPlus.is_getter(target, prop)){
        return target[prop];
      }else if (SVGPlus.is_getter(target.el, prop)){
        return target.el[prop]
      }
    },
    set: (target, prop, value) => {
      if (SVGPlus.is_setter(target, prop)){
        target[prop] = value;
      }else if (SVGPlus.is_setter(target.el, prop)){
        return target.el[prop] = value;
      }
    },
    apply: (target, method, args) => {
      console.log(method);
      if (SVGPlus.is_method(target, method)){
        target.apply(method, args)
      }else if(SVGPlus.is_method(target.el, method)){
        target.el.apply(method, args);
      }
    }
  },


  SVGElementToSVGPlusElement: function(el){
    if (el instanceof SVGElement || ((`${el}`).indexOf('SVG') != -1)){

      if (el instanceof SVGPathElement || ((`${el}`).indexOf('SVGPathElement') != -1)){
        let svgPlus =  new SvgPath(el);
        return svgPlus;
      }else{
        let svgPlus = new SvgElement(el);
        return svgPlus;
      }

    }else{
      throw 'el not svg'
    }
    return null
  },
  create: function(name, props = null) {
    if(props == null){
      let el = document.createElementNS("http://www.w3.org/2000/svg", name);
      return this.SVGElementToSVGPlusElement(el)
    }else{
      let el = document.createElementNS("http://www.w3.org/2000/svg", name);
      el = this.SVGElementToSVGPlusElement(el)
      el.props = props;
      return el
    }
  },
  make: function(name){ return document.createElementNS("http://www.w3.org/2000/svg", name) },
  parseElement: function(elem = null) {
    if (elem == null){
      return null
    }
    if (typeof elem === 'string'){
      return this.parseElement(document.getElementById(elem))
    }else if (elem instanceof Element){
      return elem
    }else{
      return null
      throw 'invalid element'
    }
  },
  importFromObject: function(el, callback){
    el = this.parseElement(el);
    console.log(`${el}`);
    let id = el.id;
    el.onload = () => {
      let svg = el.contentDocument.all[0];
      svg.setAttribute('id', id)
      let parent = el.parentNode;
      parent.removeChild(el);
      parent.appendChild(svg)
      if ((`${svg}`).indexOf('SVGSVGElement') != -1){
        let svgplus = new SvgSvgElement(svg)
        if (callback instanceof Function){
          callback(svgplus)
        }
      }
    }
  }
}

class SvgElement{
  constructor(el){
    this.el = SVGPlus.parseElement(el);
    this.el.svgPlus = this;
    this.__add_svgPlus_to_children(this.el);
  }

  set innerHTML(val){
    this.el.innerHTML = val;
  }
  get innerHTML(){
    return this.el.innerHTML
  }

  get x(){
    return this._x;
  }
  get y(){
    return this._y;
  }
  set x(val){
    if (typeof val === 'number'){
      this._x = val;
      this.setAttribute('x', val)
    }
  }
  set y(val){
    if (typeof val === 'number'){
      this._y = val;
      this.setAttribute('y', val)
    }
  }

  get pos(){
    return new Vector(this);
  }
  set pos(val){
    if (val instanceof Vector){
      this.x = val.x;
      this.y = val.y;
    }
  }

  get children(){
    let children = []
    for (var i = 0; i < this.el.children.length; i++){
      if (this.el.children[i].svgPlus){
        children.push(this.el.children[i].svgPlus)
      }
    }
    return children;
  }
  get parent(){
    if (this.el.parentNode.svgPlus){
      return this.el.parentNode.svgPlus
    }else{
      throw 'The parent of this node is not a SvgPlus'
      return null;
    }
  }

  appendChild(child){
    try{
      if (child instanceof SvgElement){
        this.el.appendChild(child.el)
      }else{
        this.el.appendChild(child)
      }
    }catch(e){
      throw `Error appending child:\n${err}`
    }
  }
  removeChild(child){
    try{
      if (child instanceof SvgElement){
        this.el.removeChild(child.el)
      }else{
        this.el.removeChild(child)
      }
    }catch(e){
      throw `Error removing child:\n${err}`
    }
  }

  getAttribute(name){
    return this.el.getAttribute(name)
  }
  setAttribute(name,value){
    this.el.setAttribute(name,value)
  }

  setProperty(name, value){
    this.el.style.setProperty(name, value)
  }
  getProperty(name){
    this.el.style.getProperty(name)
  }

  set onclick(val) {this.el.onclick = val}
  get onclick() { return this.el.onclick }
  addEventListener(name, callback){
    this.el.addEventListener(name, callback);
  }

  set styles(styles){
    if (typeof styles !== 'object'){
      throw `Error setting styles:\nstyles must be set using an object, not ${typeof styles}`
      return
    }
    for (style in styles){
      value = `${styles[style]}`
      if (value != null){
        this.el.setProperty(style, value)
      }
    }
  }
  set props (props){
    if (typeof props !== 'object'){
      throw `Error setting styles:\nstyles must be set using an object, not ${typeof props}`
      return
    }
    for (var prop in props){
      var value = props[prop]
      if (prop == 'style'){
        this.styles = value
      }else if (value != null){
        this.el.setAttribute(prop,value);
      }
    }
  }
  createChild(name, props = null){
    let child = SVGPlus.create(name, props);
    this.appendChild(child);
    return child;
  }
  setStroke(color, width){
    if (typeof color === 'string'){
      this.setAttribute('stroke',color)
    }else{
      throw `Error calling setStroke:\nThe color property must be a string, not ${typeof color}`
    }
    if(typeof width === 'string' || typeof width === 'number'){
      this.setAttribute('stroke-width', width)
    }else{
      throw `Error calling setStroke:\nThe width property must be a string or number, not ${typeof color}`
    }
  }
  setFill(color){
    if (typeof color === 'string'){
      this.setAttribute('stroke',color)
    }
  }

  __add_svgPlus_to_children(el){
    for (var i = 0; i < el.children.length; i++){
      let child = el.children[i]
      if(!child.svgPlus){
        let plusel = SVGPlus.SVGElementToSVGPlusElement(child)
        if (child.children.length > 0){
          this.__add_svgPlus_to_children(child)
        }
      }
    }
  }
}

class SvgSvgElement extends SvgElement{
  constructor(el){
    super(el)

  }


}

class SvgGeometry extends SvgElement{
  constructor(el){
    super(el);
  }


  get length(){
    return this.getTotalLength();
  }

  getTotalLength(){
    return this.el.getTotalLength();
  }

  getPointAtLength(length){
    return new Vector(this.el.getPointAtLength(length))
  }
}

class LinkItem{
  constructor(){
    this.last = null;
    this.next = null;
    this.length = 0;
  }
  link(l2){
    if (l2 instanceof LinkItem){
      this.next = l2;
      l2.last = this
    }
  }
  break(dir = 'both'){
    if (dir === 'next'){
      if (this.next != null){
        this.next.last = null;
        this.next = null;
      }
    }else if (dir === 'last'){
      if (this.last != null){
        this.last.next = null;
        this.last = null;
      }
    }else if(dir === 'both'){
      if (this.last != null){
        this.last.next = null;
        this.last = null;
      }
      if (this.next != null){
        this.next.last = null;
        this.next = null;
      }
    }
  }
}
class LinkList{
  constructor(){
    this.start = null;
    this.end = null;
    this.length = 0;
    this._onupdate = [];
  }

  addUpdateListener(callback){
    if (callback instanceof Function){
      this._onupdate.push(callback)
    }else{
      throw 'addUpdateListener expects a Function as its only parameter'
    }
  }

  _update(){
    this._onupdate.forEach((callback) => {
      callback()
    });
  }

  // Pushes LinkItem or LinkList at the end of this list
  push(item){
    if (item instanceof LinkItem){
      if ( this.contains(item) ){
        throw 'The given item is already contained within this list'
        return
      }

      this.length ++;

      //if the node was unset <start> => item <= <end>
      if (this.end == null || this.start == null){
        this.start = item; // <start> => item
        this.end = item;   // <end> => end

        //Otherwise end refers to <end> <=> <item>
        //                        <end> => <item>
      }else{
        this.end.link(item)
        this.end = item;
      }
    }else if(item instanceof LinkList){
      if ( this.contains(item) ){
        throw 'The given list contains elements already contained within this list\nELEMENTS SHOULD NOT BE CONTAINED IN MULTIPLY LISTS'
        return
      }

      this.length += item.length
      //if node not set <start> => <item.start>  <item.end> <= <end>
      if (this.end == null || this.start == null){
        this.start = item.start;
        this.end = item.end;

        //Else      <end> <=> item
        //          item <= <end>
      }else{
        this.end.link(item.start)
        this.end = item.end;
      }
    }
    this._update();
  }

  // Pop linked item from the end of the list
  pop(){
    if (this.end == null || this.start == null){
      return null
    }else if (this.end == this.start){
      let temp = this.end;
      thid.end = null;
      this.start = null;
      return temp;
    }else{
      let oldl = this.end;
      let newl = this.end.last
      oldl.break();
      this.end = newl;
      return oldl
    }
    this._update();
  }

  // Dequeue linked item from the start of the list
  dequeue(){
    if (this.end == null || this.start == null){
      return null
    }else if (this.end == this.start){
      let temp = this.start;
      this.end = null;
      this.start = null;
      return temp;
    }else{
      let oldl = this.start;
      let newl = this.start.next;
      oldl.break();
      this.start = newl;
      return oldl
    }
    this._update()
  }

  // Puts LinkList or LinkItem at start of this list
  queue(item){
    if (item instanceof LinkItem){
      if ( this.contains(item) ){
        throw 'The given item is already contained within this list'
        return
      }

      this.length ++;

      //not set:  <start> => item <= <end>
      if (this.end == null || this.start == null){
        this.start = item;
        this.end = item;

        // else: <item> <=> <start> | <start> => <item>
      }else{
        item.link(this.start);
        this.start = item;
      }


    }else if(item instanceof LinkList){
      if ( this.contains(item) ){
        throw 'The given list contains elements already contained within this list\nELEMENTS SHOULD NOT BE CONTAINED IN MULTIPLY LISTS'
        return
      }

      this.length += item.length;

      // <start> => item <= <end>
      if (this.start == null){
        this.start = item.start;
        this.end = item.end;

        // item <=> <start> | <start> => item
      }else{
        item.end.link(start)
        this.start = item.start;
      }
    }
    this._update();
  }

  forEach(visit){
    if (!(visit instanceof Function)){
      throw 'forEach expects a function as its first parameter'
      return
    }

    let cur = this.start;
    let i = 0;
    visit(cur, i);
    while (cur != this.end){
      if (cur.next == null){
        throw 'List is disjointed'
        return
      }else{
        cur = cur.next;
        i++;
        visit(cur, i);
      }
    }
  }

  contains(val){
    let res = false;
    if (val instanceof LinkItem){
      this.forEach((item) => {
        res |= (item == val);
      });
    }else if (val instanceof LinkList){
      this.forEach((item) => {
        val.forEach((val_item) => {
          res |= (item == val_item);
        })
      })
    }
    return res
  }

  clear(){
    this.end = null;
    this.start = null;
    this.length = 0;
    this._update();
  }
}

class CPoint extends LinkItem{
  constructor(string){
    super()
    this.cmd_type = 'L';
    //p => x, y
    this.p = new Vector(0, 0);
    //c1 => x1, y1
    this.c1 = new Vector(0, 0);
    //c2 => x2, y2
    this.c2 = new Vector(0, 0);

    //r => rx, ry
    this.r = new Vector(0, 0);
    this.x_axis_rotation = 0;
    this.large_arc_flag = 0;
    this.sweep_flag = 0;

    this.cmd = string
  }

  /* Set Svg Command Point
  svg-path-command: String
  String Format:
  'M x, y' or 'm dx, dy'
  'L x, y' or 'l dx, dy'
  'H x' or 'h dx'
  'V y' or 'v dy'
  'C x1, y1, x2, y2, x, y' or 'c dx1, dy1, dx2, dy2, dx, dy'
  'Q x1, y1, x, y' or 'q dx1 dy1, dx dy'
  'S x, y' or 's dx, dy'
  'T x, y' or 't dx, dy'
  'A rx ry x-axis-rotation large-arc-flag sweep-flag x y' or 'a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy' */
  set cmd(string){
    if (string == null){
      return
    }

    if (typeof string != 'string'){
      this.cmd_type = null;
      throw `Error setting cmd:\ncmd must be set a string, not ${typeof string}`
      return
    }

    //Get command type
    let type = string[0];


    //If z, then set cmd_type and return
    if (type == 'z'|| type == 'Z'){
      this.cmd_type = type;
      return
    }
    if (('MmLlHhVvCcSsQqTtAa').indexOf(type) == -1){
      this.cmd_type = null;
      throw `Error setting cmd:\n${type} is not a valid type`
      return
    }

    //Get numbers
    let param_string = string.slice(1);
    let param_floats = [];
    try{
      param_string.replace(/(-?\d*\.?\d+)/g, (num) => {
        param_floats.push(parseFloat(num))
      })
    }catch (err){
      throw `Error setting cmd:\nError parsing params\n${err}`
      return
    }

    //Check if input is valid according to command type
    let error = (num, form) => {return `Error setting cmd:\n${string} is of command type: ${type} which requires ${num} number parameters ${form} but ${param_floats.length} where given ${param_floats}`}
    if (('M|m||L|l||T|t').indexOf(type) != -1){
      if (param_floats.length != 2){
        throw error(2, 'x, y');
        return
      }
      this.p = new Vector(param_floats);
    }else if(type == 'C' || type == 'c'){
      if (param_floats.length != 6){
        throw error(6, '(x1, y1, x2, y2, x, y)')
        return
      }
      this.c1 = new Vector(param_floats)
      this.c2 = new Vector(param_floats, 2)
      this.p = new Vector(param_floats, 4)
    }else if(type == 'H' || type == 'h'){
      if (param_floats.length != 1){
        throw error(1, '(x)')
        return
      }
      this.x = param_floats[0]
    }else if(type == 'V' || type == 'v'){
      if (param_floats.length != 1){
        throw error(1, '(y)')
        return
      }
      this.y = param_floats[0]
    }else if(type == 'S' || type == 's'){
      if (param_floats.length != 4){
        throw error(4, '(x2, y2, x, y)')
        return
      }
      this.c2 = new Vector(param_floats)
      this.p = new Vector(param_floats, 2)
    }else if(type == 'Q' || type == 'q'){
      if (param_floats.length != 4){
        throw error(4, '(x1, y1, x, y)')
        return
      }
      this.c1 = new Vector(param_floats)
      this.p = new Vector(param_floats, 2)
    }else if(type == 'A' || type == 'a'){
      if (param_floats.length != 7){
        throw error(7, '(rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y)')
        return
      }
      this.r = new Vector(param_floats);
      this.x_axis_rotation = param_floats[2];
      this.large_arc_flag = param_floats[3];
      this.sweep_flag = param_floats[4];
      this.p = new Vector(param_floats, 5)
    }

    //If inputs where valid set cmd_type
    this.cmd_type = type;
  }

  //Return String svg-path-command
  get cmd(){
    return this.toString()
  }

  get x(){
    return this.p.x;
  }
  set x(val){
    this.p.x = val;
  }
  get y(){
    return this.p.y;
  }
  set y(val){
    this.p.y = val;
  }

  _v_s(val){
    return `${this[val].x}${this[val].y>=0?',':''}${this[val].y}`
  }

  isAbsolute(){
    return (this.cmd_type && (this.cmd_type == this.cmd_type.toUpperCase()))
  }

  add(v){
    this.p = this.p.add(v);
    this.c1 = this.c1.add(v);
    this.c2 = this.c2.add(v);
  }
  sub(v){
    this.p = this.p.sub(v);
    this.c1 = this.c1.sub(v);
    this.c2 = this.c2.sub(v);
  }
  div(v){
    this.p = this.p.div(v);
    this.c1 = this.c1.div(v);
    this.c2 = this.c2.div(v);
  }
  mul(v){
    this.p = this.p.mul(v);
    this.c1 = this.c1.mul(v);
    this.c2 = this.c2.mul(v);
  }

  grad(v){
    return this.p.grad(v);
  }

  dist(v){
    console.log(v);
    return this.p.dist(v);
  }

  distToLine(v){
    return this.p.dist(v);
  }

  toString(){
    let cmr = (v) =>{
      if (v.x >= 0){
        return ','
      }else{
        return ''
      }
    }

    switch (this.cmd_type.toUpperCase()) {
      //    Move: x, y
      case 'M': return `${this.cmd_type}${this._v_s('p')}`;

      //    Line: x, y
      case 'L': return `${this.cmd_type}${this._v_s('p')}`;

      //    Horizontal Line: x
      case 'H': return `${this.cmd_type}${this.x}`;

      //    Vertical Line: y
      case 'V': return `${this.cmd_type}${this.y}`;

      //    Bézier Curve: x1, y1, x2, y2, x, y
      case 'C': return `${this.cmd_type}${this._v_s('c1')}${cmr(this.c2)}${this._v_s('c2')}${cmr(this.p)}${this._v_s('p')}`;

      //    Reflection Bézier: x2, y2, x, y
      case 'S': return `${this.cmd_type}${this._v_s('c2')}${cmr(this.p)}${this._v_s('p')}`;

      //    Quadratic Curve: x1, y1, x, y
      case 'Q': return `${this.cmd_type}${this._v_s('c1')}${cmr(this.p)}${this._v_s('p')}`;

      //    Quadratic Curve String: x, y
      case 'T': return `${this.cmd_type}${this._v_s('c1')}${cmr(this.p)}${this._v_s('p')}`;

      //    Arc: rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y
      case 'A': return `${this.cmd_type}${this._v_s('r')},${this.x_axis_rotation},${this.large_arc_flag},${this.sweep_flag}${cmr(this.p)}${this._v_s('p')}`;

      //    Close:
      case 'Z': return `${this.cmd_type}`
    }
  }
}

class DPath extends LinkList{
  constructor(string = null){
    super();
    if (string != null && typeof string !== 'undefined' && string.length != 0){
      this.d_string = string;
    }
  }

  //Path push functions
    L(v){
      if (v instanceof Vector){
        this.push(new CPoint(`L${v}`))
        return this
      }else{
        throw 'Error:\nL takes a single vector parameter';
      }
    }
    l(v){
      if (v instanceof Vector){
        this.push(new CPoint(`l${v}`))
        return this
      }else{
        throw 'Error:\nl takes a single vector parameter';
      }
    }

    M(v){
      if (v instanceof Vector){
        this.push(new CPoint(`M${v}`))
        return this
      }else{
        throw 'Error:\nM takes a single vector parameter';
      }
    }

    Q(v1, v2){
      if (v1 instanceof Vector && v2 instanceof Vector){
        this.push(new CPoint(`Q${v1},${v2}`))
        return this
      }else{
        throw 'Error:\nQ takes two vectors as its parameters';
      }
    }
    q(v1, v2){
      if (v1 instanceof Vector && v2 instanceof Vector){
        this.push(new CPoint(`q${v1},${v2}`))
        return this
      }else{
        throw 'Error:\nq takes two vectors as its parameters';
      }
    }

    S(v1, v2){
      if (v1 instanceof Vector && v2 instanceof Vector){
        this.push(new CPoint(`S${v1},${v2}`))
        return this
      }else{
        throw 'Error:\nS takes two vectors as its parameters';
      }
    }
    s(v1, v2){
      if (v1 instanceof Vector && v2 instanceof Vector){
        this.push(new CPoint(`s${v1},${v2}`))
        return this
      }else{
        throw 'Error:\ns takes two vectors as its parameters';
      }
    }

    T(v1, v2){
      if (v1 instanceof Vector && v2 instanceof Vector){
        this.push(new CPoint(`T${v1},${v2}`))
        return this
      }else{
        throw 'Error:\nT takes two vectors as its parameters';
      }
    }
    t(v1, v2){
      if (v1 instanceof Vector && v2 instanceof Vector){
        this.push(new CPoint(`t${v1},${v2}`))
        return this
      }else{
        throw 'Error:\nt takes two vectors as its parameters';
      }
    }

    __boolHelp(val){
      if (typeof val === 'number'){
        return val > 0 ? 1 : 0;
      }else if (typeof val === 'boolean'){
        return val ? 1 : 0;
      }else {
        return null
      }
    }

    A(r, xar, laf, sf, v1){
      xar = this.__boolHelp(xar);
      laf = this.__boolHelp(laf);
      sf = this.__boolHelp(sf);
      if (r instanceof Vector && v1 instanceof Vector && xar != null && laf != null && sf != null){
        this.push(new CPoint(`A${r},${xar},${laf},${sf},${v1}`))
        return this
      }else{
        throw 'Error:\nA takes the parameters:\nr: Vector\nx-axis-rotation: Boolean (1,0)/(true,false)\nlarge-arc-flag: Boolean\nsweep-flag: Boolean\nv: Vector';
      }
    }
    a(r, xar, laf, sf, v1){
      xar = this.__boolHelp(xar);
      laf = this.__boolHelp(laf);
      sf = this.__boolHelp(sf);
      if (r instanceof Vector && v1 instanceof Vector && xar != null && laf != null && sf != null){
        this.push(new CPoint(`a${r},${xar},${laf},${sf},${v1}`))
        return this
      }else{
        throw 'Error:\na takes the parameters:\nr: Vector\nx-axis-rotation: Boolean (1,0)/(true,false)\nlarge-arc-flag: Boolean\nsweep-flag: Boolean\nv: Vector';
      }
    }

    C(v1, v2, v3){
      if (v1 instanceof Vector && v2 instanceof Vector && v3 instanceof Vector){
        this.push(new CPoint(`C${v1},${v2},${v3}`))
        return this
      }else{
        throw 'Error:\nC takes three vectors as its parameters';
      }
    }
    c(v1, v2, v3){
      if (v1 instanceof Vector && v2 instanceof Vector && v3 instanceof Vector){
        this.push(new CPoint(`c${v1},${v2},${v3}`))
        return this
      }else{
        throw 'Error:\nc takes three vectors as its parameters';;
      }
    }

    Z(){
      this.push(new CPoint(`Z`))
      return this
    }

  set d_string(string){
    if (typeof string !== 'string'){
      throw `Error setting d:\nd must be set to a string, not ${typeof string}`
      return
    }
    //Remove white space
    let cmds = string.replace(/(\n|\t|\r)/g, '');

    //Add split markers
    cmds = cmds.replace(/(M|m|L|l|H|h|V|v|Z|z|C|c|S|s|Q|q|T|t|A|a)/g, '\n$&');
    cmds = cmds.slice(1);
    //Split
    cmds = cmds.split('\n');


    cmds.forEach((cmd) => {
      this.push(new CPoint(cmd));
    });
  }

  makeAbsolute(){
    let last = this.start.p;
    this.forEach((point) => {
      if (point.cmd_type == 'V'){
        point.x = last.x;
      }
      if (point.cmd_type == 'H'){
        point.y = last.y;
      }
      if (point.isAbsolute()){
        last = point.p;
      }else{
        point.add(last);
        point.cmd_type = point.cmd_type.toUpperCase();
        last = point.p;
      }
    });
  }

  makeRelative(){
    this.makeAbsolute();
    let cur = this.end;
    while (cur != this.start){
      cur.sub(cur.last.p);
      cur.cmd_type = cur.cmd_type.toLowerCase();
      cur = cur.last;
    }
  }

  toString(){
    let str = ''
    if (this.end == null) {return str}
    this.forEach((item) => {
      str += `${item}`
    });
    return str
  }
}

class SvgPath extends SvgGeometry{
  constructor(el){
    super(el)
    this.d = new DPath(this.getAttribute('d'));

    this.d.addUpdateListener(() => {
      this.update();
    })
  }

  update(){
    this.setAttribute('d', this.d_string);
  }

  set d_string(val){
    if (typeof val === 'string'){
      this.d.d_string = val;
    }
  }
  get d_string(){
    return `${this.d}`
  }

  _parse_CPoint(){
    let args = arguments[0]

    if (args[0] instanceof CPoint){
      return args[0];
    }
    if (args[0] instanceof DPath){
      return args[0];
    }

    let cmd = ''

    for (var i = 0; i < args.length; i++){
      if (typeof args[i] == 'string' || args[i] instanceof Vector || typeof args[i] === 'number'){
        cmd += (i > 0 && (args[i-1] instanceof Vector || typeof args[i-1] === 'number') )?',':'';
        cmd += `${args[i]}`;
      }
    }

    if (('MmLlHhVvCcSsQqTtAaZz').indexOf(cmd[0]) == -1){
      if (args.length == 1){
        if (args[0] instanceof Vector){
          cmd = 'L' + cmd;
        }else{
          cmd = 'H' + cmd;
        }
      }else if(args.length == 2){
        cmd = 'S' + cmd;
      }else if(args.length == 3){
        cmd = 'C' + cmd;
      }else if(args.length == 5){
        cmd = 'A' + cmd;
      }else if(args.length == 0){
        cmd = 'Z';
      }
    }

    return new CPoint(cmd);
  }



//Path push functions
  L(v){
    this.d.L(v)
    return this;
  }
  l(v){
    this.d.l(v)
    return this
  }

  M(v){
    this.d.M(v)
    return this
  }

  Q(v1, v2){
    this.d.Q(v1, v2)
    return this
  }
  q(v1, v2){
    this.d.q(v1, v2)
    return this
  }

  S(v1, v2){
    this.d.S(v1, v2)
    return this
  }
  s(v1, v2){
    this.d.s(v1, v2)
    return this
  }

  T(v1, v2){
    this.d.T(v1, v2)
    return this
  }
  t(v1, v2){
    this.d.t(v1, v2);
    return this
  }

  A(r, xar, laf, sf, v1){
    this.d.A(r, xar, laf, sf, v1)
    return this
  }
  a(r, xar, laf, sf, v1){
    this.d.a(r, xar, laf, sf, v1)
    return this
  }


  C(v1, v2, v3){
    this.d.C(v1, v2, v3)
    return this
  }
  c(v1, v2, v3){
    this.d.c(v1, v2, v3)
    return this
  }

  Z(){
    this.d.Z()
    return this
  }

  push(val){
    this.d.push(val);
    return this
  }
  queue(val){
    this.d.queue(val);
    return this
  }
  pop(){
    return this.d.pop();
  }
  dequeue(){
    return this.d.push();
  }
  clear(){
    this.d.clear();
  }

  makeAbsolute(){
    this.d.makeAbsolute();
    this.update();
  }

  makeRelative(){
    this.d.makeRelative();
    this.update();
  }

  closest(point){
    let d = Infinity;
    let p = null;
    this.d.forEach((cPoint) => {
      if ( cPoint.dist(point) < d ){
        d = cPoint.dist(point);
        p = cPoint;
      }
    });
    return p;
  }
}
