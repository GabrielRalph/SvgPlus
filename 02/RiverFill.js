class RiverFill{
  constructor(props){
    if (typeof props !== 'object' || props === null) throw '' + new PlusError('Props must be an object');
    this.props = props;
  }
  begin(el){
    this.validate(el);

    this.a_tl = this.a.getTotalLength();
    this.b_tl = this.b.getTotalLength();

    let s_l = this.props.stitch_length / this.props.resolution;
    let avg_s_c = (this.a_tl + this.b_tl)/2/s_l;

    this.inc_a = this.a_tl/avg_s_c;
    this.inc_b = this.b_tl/avg_s_c;

    this.a_l = 0;
    this.b_l = 0;

    this.center_paths = []
    let cs = 1;
    for (var i = 0; i < cs; i++){
      let center = new SvgPath('path');
      center.props = {stroke: 'red', fill: 'none', 'stroke-width': '4'}
      this.group.appendChild(center);
      this.center_paths.push(center)
    }

    let p_a = this.a.getVectorAtLength(this.a_l);
    let p_b = this.b.getVectorAtLength(this.b_l);


    this.set_centers(p_a, p_b, true);
  }

  set_centers(p_a, p_b, init = false){
    let csp = this.center_paths.length + 1;
    this.center_paths.forEach((path, i) => {
      if (init){
        path.M(p_a.getPointAtDiv(p_b, (i + 1)/csp));
      }else{
        path.L(p_a.getPointAtDiv(p_b, (i + 1)/csp));
      }
    });
  }

  validate(el){
    if (!(el instanceof SVGGElement)) throw '' + new PlusError('RiverFill must be given an SVG group element.');
    this.group = el;
    let paths = el.getElementsByTagName('path');
    if (paths.length < 2) throw '' + new PlusError('RiverFill must be given a group with two path elements contained in it.');
    console.log(paths[0]);
    console.log(paths[1]);


      this.a = new SvgPath(paths[0]);
      this.b = new SvgPath(paths[1]);

  }

  next(){

    let p_a = this.a.getVectorAtLength(this.a_l);
    let p_b = this.b.getVectorAtLength(this.b_l);
    let path = new SvgPath('path');

    // path.props = {stroke: 'red', 'stroke-width': '1'}
    // this.group.appendChild(path);
    // path.M(p_a).L(p_b);
    this.set_centers(p_a, p_b);


    this.a_l += this.inc_a;
    this.b_l += this.inc_b;
    return !(this.a_l > this.a_tl || this.b_l > this.b_tl)
  }

  end(){

  }
}
