import {SvgPlus, SvgPath, Vector} from "../3.5.js";

class Bounds{
  constructor(v0) {
    let min = new Vector(Infinity, Infinity);
    let max = new Vector(-Infinity, -Infinity);

    this.add = (v) => {
      if (v instanceof Vector) {
        if (v.x > max.x) max.x = v.x;
        if (v.x < min.x) min.x = v.x;
        if (v.y > max.y) max.y = v.y;
        if (v.y < min.y) min.y = v.y;
      }else if (v instanceof Bounds){
        this.add(v.max);
        this.add(v.min);
      }
    }

    this.add(v0);

    Object.defineProperty("min", this, {get: () => {return min.clone()}})
    Object.defineProperty("max", this, {get: () => {return max.clone()}})
    Object.defineProperty("isSet", this, {get: () => {return max.x < min.x || max.y < min.y;}})
  }

  clone() {
    return new Bounds(this);
  }
}

class Graph extends SvgPlus{
  constructor(el, size){
    if (el && !(el instanceof Vector)) super(id);
    else super("svg");

    if (id instanceof Vector) {
      size = id;
    }else if (!(size instanceof Vector)) {
      size = new Vector;
    }

    Object.defineProperty("size", this, {
      get: () => {return size.clone();}
    })
  }

  draw(drawables) {
    if (typeof drawables === "object" && drawables !== null) {
      drawables = [drawables]
    }
    if (Array.isArray(drawables)) {
      let bounds = new Bounds;
      for (let drawable of drawables) {
        let Class = drawable.class;
        if (Class instanceof Function && Class.prototype instanceof Drawable) {
          let draw_el = new Class(drawable.data);
          this.appendChild(draw_el);
        }
      }
    }
  }
}


class Drawable extends SvgPlus {
  constructor(data){
    super("g");
    let bounds =new Bounds();
    Object.defineProperty("bounds", this, {
      get: () => {return bounds.clone();}
    })
    this.addBounds = (v) => {
      bounds.add(v);
    }
  }
}
