class Vector{
	constructor(x = 0, y = 0){
    this.x = x;
    this.y = y;

		// If the first parameter is an array
    if(x instanceof Array){
			if (typeof y !== 'number') y = 0;

			//Fill the array using y as an offset, if y is not a number it will be set as Zero
      this.x = x[y]
      this.y = x[y + 1]

		//If x is a vector or object set accordingly
    }else if(x instanceof Vector || x instanceof Object){
      this.x = typeof x.x === 'number' || typeof x.x === 'string' ? x.x : 0;
      this.y = typeof x.y === 'number' || typeof x.y === 'string' ? x.y : 0;
    }
		this.x = parseFloat(this.x)
		this.y = parseFloat(this.y)
	}

	round(){
		return new Vector(Math.round(this.x), Math.round(this.y))
	}

	add(p1, y = null){
    if(p1 instanceof Vector){
      return new Vector(this.x + p1.x, this.y + p1.y);
    }else if (typeof p1 === 'number' && y == null){
      return new Vector(this.x + p1, this.y + p1);
    }else if (typeof p1 === 'number' && typeof y === 'number'){
			return this.add(new Vector(p1, y));
		}
	}

	addV(y){
		if (typeof y === 'number'){
			return this.add(0, y);
		}
	}
	addH(x){
		if (typeof x === 'number'){
			return this.add(x, 0);
		}
	}

	sub(p1, y = null){
    if(p1 instanceof Vector){
      return new Vector(this.x - p1.x, this.y - p1.y);
    }else if (typeof p1 === 'number' && y == null){
      return new Vector(this.x - p1, this.y - p1);
    }else if (typeof p1 === 'number' && typeof y === 'number'){
			return this.sub(new Vector(p1, y));
		}
	}
	div(p1){
    if(p1 instanceof Vector){
      return new Vector(this.x / p1.x, this.y / p1.y)
    }else{
      return new Vector(this.x / p1, this.y / p1)
    }
	}
  mul(p1){
    if(p1 instanceof Vector){
      return new Vector(this.x * p1.x, this.y * p1.y)
    }else{
      return new Vector(this.x * p1, this.y * p1)
    }
	}
	assign(){
		return new Vector(this.x, this.y)
	}

	grad(v2){
		if (v2.x - this.x == 0){
			return 10000000000
		}
		return (v2.y - this.y)/(v2.x - this.x)
	}

  norm(){
    return Math.sqrt(this.y*this.y + this.x*this.x)
  }

  arg(){
    return this.atan(this.y, this.x)
  }

	distToLine(p1, p2){
		let line = p2.sub(p1).rotate(Math.PI/2)
	  let d = line.dot(this.sub(p1))/line.norm()
	  return Math.abs(d)
	}

	// (x + iy)*(cos(t) + isin(t)) = xcos(t) - ysin(t) + i(xsin(t) + ycos(t))
  rotate(theta){
    return new Vector(this.x*Math.cos(theta) - this.y*Math.sin(theta), this.x*Math.sin(theta) + this.y*Math.cos(theta))
  }

  angleBetween(p2){
    let a = this.norm()
    let b = p2.norm()
    let c = this.distance(p2)
    if (a == 0||b == 0||c==0){return 0}
    return Math.acos((c*c - a*a - b*b)/(-2*a*b))
  }

  atan(rise, run){
    if(run == 0 && rise == 0){
      // console.error('Undefined angle for atan(0/0)');
      return 0
    }
    let theta = Math.atan(Math.abs(rise)/Math.abs(run))
    let pi = Math.PI
    if(rise > 0){
      if(run > 0){
        return theta
      }else if(run < 0){
        return pi - theta
      }else{
        return pi/2
      }
    }else if(rise < 0){
      if(run > 0){
        return theta + 3*pi/2
      }else if(run < 0){
        return theta + pi
      }else{
        return 3*pi/2
      }
    }else{
      if(run >= 0){
        return 0
      }else{
        return pi
      }
    }
  }

  dir(){
    if(this.norm() == 0){return new Vector(0,0)}
    return this.div(this.norm())
  }
  dot(p2){
    return this.x*p2.x + this.y*p2.y
  }
	dist(p2){
		return this.distance(p2)
	}
  distance(p2){
    return Math.sqrt((this.x - p2.x)*(this.x - p2.x) + (this.y - p2.y)*(this.y - p2.y))
  }

	getPointAtDiv(p1, d){
		if (p1 instanceof Vector){
			if (d >= 0 && d <= 1){
				return new Vector (this.x + (p1.x - this.x)*d, this.y + (p1.y - this.y)*d)
			}
		}
	}
	isZero(){
		return (this.x == 0 && this.y == 0)
	}
	toString(){
		return `${this.x},${this.y}`
	}
}
