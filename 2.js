
class PlusError{
  constructor(message, class_name = "Object"){
    this.msg = message;
    this.cls = class_name;
    let stack = new Error('helloworld');
    this.stack = stack.stack

  }
  _parse_stack(){
    let stack = this.stack
    let lines = stack.split('at ');
    let message = '';
    let con = 0;
    let tab = "";
    for (var i = 2; i < lines.length-1; i++){
      let conf = false;

      let clas = null;
      let lctn = null;
      let mthd = null;

      let line = lines[i];
      line = lines[i].replace(/\t|\n|\[.*\] |  +/g, '').replace(/ \((.*)\)/g, (a,b) =>{
        b = b.split('/');
        b = b[b.length - 1];
        b = b.split(':')

        lctn = `${b[0]} line ${b[1]}`;
        return ''
      })
      let parts = line.split(/ |\./g);

      if (parts.length === 3 && parts[1] == "get" || parts[1] == "set"){
        mthd = `${parts[1]}ting ${parts[2]} of ${parts[0]}\t (${lctn})`
      }else if(parts.length == 2){
        mthd = `whilst calling ${parts[1]} of ${parts[0]}\t (${lctn})`
      }
      if (parts[0] === 'new'){
        con++;
        conf = true;
        mthd = `whilst constructing new ${parts[1]}\t (${lctn})`
        clas = parts[1];
      }else if(parts[0] === 'Object'){
        clas = this.cls;
      }else{
        clas = parts[0];
      }
      if ((conf && con == 1)||(!conf)){
        message = mthd + '\n' + tab + message;
      }
      tab += '\t'
      // stack_data.push(this._stack_line_parser(line))
    }
    return 'Error\n' + message + tab + this.msg
    // console.log(stack_data);
  }

  toString(){
    return this._parse_stack()
  }
}



class SvgPlus{
  constructor(el){
    el = SvgPlus.parseElement(el);
    let prototype = Object.getPrototypeOf(this);
    return SvgPlus.extend(el, prototype);
  }


  set styles(styles){
    if (typeof styles !== 'object'){
      throw `Error setting styles:\nstyles must be set using an object, not ${typeof styles}`
      return
    }
    this._style_set = typeof this._style_set != 'object' ? {} : this._style_set;
    for (var style in styles){
      var value = `${styles[style]}`
      if (value != null){
        this.style.setProperty(style, value);
        this._style_set[style] = value;
      }
    }
  }
  get styles(){
    return this._style_set;
  }
  set props (props){
    if (typeof props !== 'object'){
      throw `Error setting styles:\nstyles must be set using an object, not ${typeof props}`
      return
    }
    this._prop_set = typeof this._prop_set != 'object' ? {} : this._prop_set;
    for (var prop in props){
      var value = props[prop]
      if (prop == 'style' || prop == 'styles'){
        this.styles = value
      }else if (value != null){
        let set = true;
        try{
          this.setAttribute(prop,value);
        }catch(e){
          set = false;
          throw e
        }
        if (set){
          this._prop_set[style] = value;
        }
      }
    }
  }
  get props(){
    return this._prop_set;
  }
  makeChild(name, props = null){
    let child = new SvgPlus(name)
    this.appendChild(child);
    return child;
  }

  AnimateAlgorithm(algorithm){
    try{
      if (!(algorithm.begin instanceof Function)) throw '' + new PlusError(`Aglorithm's must contain a begin function`);
      if (!(algorithm.next instanceof Function)) throw '' + new PlusError(`Aglorithm's must contain a next function`);
      if (!(algorithm.end instanceof Function)) throw '' + new PlusError(`Aglorithm's must contain a end function`);
    }catch(e){
      throw e;
      return;
    }


    try{
      algorithm.begin(this);
    }catch(e){
      throw e;
      return;
    }

    let nextFrame = (t) => {
      let continue = algorithm.next(t);
      if (continue === true){
        window.requestAnimationFrame(nextFrame);
      }else{
        algorithm.end();
      }
    }
  }

  static make(name){
    if (`animate animateMotion animateTransform circle clipPath
      color-profile defs desc discard ellipse feBlend feColorMatrix
      feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting
      feDisplacementMap feDistantLight feDropShadow feFlood feFuncA
      feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode
      feMorphology feOffset fePointLight feSpecularLighting feSpotLight
      feTile feTurbulence filter foreignObject g hatch hatchpath image
      line linearGradient marker mask mesh meshgradient meshpatch meshrow
      metadata mpath path pattern polygon polyline radialGradient rect
      script set solidcolor stop style svg switch symbol text textPath
      title tspan unknown use view`.indexOf(name) != -1){
      return document.createElementNS("http://www.w3.org/2000/svg", name);

    }else{
      return document.createElement(name);
    }
  }
  static parseElement(elem = null) {
    if (elem == null){
      throw `${new PlusError('null element given to parser')}`
    }
    if (typeof elem === 'string'){
      let _elem = null;
      if((/<.*?><.*?>/g).test(elem)){
        try{
          _elem = SvgPlus.parseSVGString(elem)
        }catch(e){
          throw e
        }
      }else{
        _elem = document.getElementById(elem);
      }

      if (_elem == null){
        _elem = SvgPlus.make(elem);
      }


      if (_elem == null){
        throw `${new PlusError(`Could not parse ${elem}.`)}`
        return null
      }else{
        try {
          _elem = this.parseElement(_elem);
        }catch(e){
          throw e
          return null
        }
        return _elem
      }
    }else if (elem instanceof Element){
      return elem
    }else{
      throw 'invalid element'
      return null
    }
  }
  static parseSVGString(string){
    let parser = new DOMParser()
    let doc = parser.parseFromString(string, "image/svg+xml");
    let errors = doc.getElementsByTagName('parsererror');
    if (errors && errors.length > 0){
      throw '' + new PlusError(`${errors[0]}`)
      return null
    }
    return doc.firstChild
  }
  static extend(elem, proto){
    let keys = Object.getOwnPropertyNames(proto);
    if (proto != Object.prototype){
      let _proto = Object.getPrototypeOf(proto);
      elem = SvgPlus.extend(elem, _proto);
    }else{
      return elem
    }
    let build = false
    keys.forEach((key) => {
      if (key != 'constructor'){
        var prop = Object.getOwnPropertyDescriptor(proto, key);
        if (key == 'build'){
          Object.defineProperty(elem, 'plus_constructor', prop);
          build = true;
        }else{
          if (key in elem && elem[key]){
            throw `Property ${key} has been overwritten`
          }
          Object.defineProperty(elem, key, prop);
        }
      }
    })
    if(build){ elem.plus_constructor()}
    return elem;
  }
}
