import {SvgPlus, SvgPath, Vector} from "../3.5.js"
import {DotNote} from "../SvgComponents/DotNote.js"

const knee_height = 39;
const rise = 25;
const height = 94;
const hip_depth = 17;
const waist = 70;
const hips = 88;
const dart = 2;
const taper = 3;

class Pants extends SvgPlus{
  constructor(id){
    super(id);
    const waist4 = waist/4;
    const hips4 = hips/4;

    let A = new Vector;
    let B = A.addH(hips/2);
    let C = new Vector(hips/2, height);
    let D = new Vector(0, height);
    let E = new Vector(0, hip_depth);
    let F = E.addH(hips/2);
    let G = new Vector(0, rise);
    let H = G.addH(hips/2);
    let I = new Vector(0, height - knee_height);
    let J = I.addH(hips/2);

    let P1 = A.addH(hips4);
    let P2 = D.addH(hips4);
    let P3 = E.addH(hips4);
    let P4 = G.addH(hips4);
    let P5 = I.addH(hips4);

    let K = A.addV(2.5);
    let L = K.addH(2.5);

    let h_ = Math.sqrt(waist4*waist4 - 2.5*2.5);
    let M = A.addH(h_ + 2.5);
    let N = G.addH(-hips4*0.15);
    let O = G.add(new Vector(-1.06, -1.06));
    let P = P5.addH(-3);
    let Q = P2.addH(-3 - taper);
    let D2 = D.addH(taper*2/3);

    let S = B.add(new Vector(-2.5, -2.5));
    let T = B.addH(-2.5 -dart - h_);
    let U = F.addV(-2.5);
    let V = H.addH(0.45*hips4);
    let V2 = H.add(new Vector(4.5/Math.sqrt(2), -4.5/Math.sqrt(2)))
    let W = J.addH(2);
    let X = C.addH(2 - taper);
    let Z = P2.addH(1 + taper*2/3);
    let Y = P5.addH(1);



    let c2 = P.add(P.sub(Q).mul(0.3));
    let l2 = E.sub(N);
    let cc1 = O.sub(l2.mul(0.12));
    let cc2 = O.add(l2.mul(0.2));

    let g_front = this.createChild("g");
    let front = g_front.createChild(SvgPath);
    front.M(M).
    C(M, P3.addV(-height/12), P3).
    L(P4).C(P4.addV(height/13), c2, P).
    L(Q).L(D2).L(I).L(N).
    C(N, cc1, O).
    C(cc2, E, E).L(L).Z();
    g_front.appendChild(front.cloneNode());

    let g_back = this.createChild("g");
    let back = g_back.createChild(SvgPath);
    back.M(T).L(S).L(U).L(V2).L(V).L(W).L(X).L(Z).L(Y).L(P4).L(P3).Z();
    g_back.appendChild(back.cloneNode());
    g_back.props = {
      transform: "translate(5, 0)"
    }

    let pagew = 84.0655;
    let pageh = 118.8889;

    let x_o = N.x;
    let w = V.x - x_o + 5;
    let y_o = S.y;
    let h = X.y - y_o;

    let wpad = (pagew - w)/2;
    x_o -= wpad;
    w += 2*wpad;

    let hpad = (pageh - h)/2;
    y_o -= wpad;
    h += 2*wpad;

    this.props = {
      viewBox: `${x_o} ${y_o} ${w} ${h}`
    }

    let guides = this.createChild("g", {class: "guides"});
    guides.createChild(SvgPath).
    M(A).L(D).L(P2).L(P1).Z()
    guides.createChild(SvgPath).
    M(E).L(P3).M(N).L(P4).M(G).L(O).M(I).L(P5)


    this.makePoints({
      A: A,
      D: D,
      D2: D2,
      E: E,
      G: G,
      I: I,
      L: L,
      M: M,
      N: N,
      O: O,
      P: P,
      Q: Q,
      P1: P1,
      P2: P2,
      P3: P3,
      P4: P4,
      P4: P5,
    })

    let high_thigh = N.dist(V);
    let cuff = D2.dist(Q) + Z.dist(X);
    let knee = I.dist(P) + Y.dist(W);
    let hipc = E.dist(U)*2;
    let waistc = L.dist(M)*2 + T.dist(S)*2
    console.log(`high thigh: ${high_thigh}\ncuff: ${cuff}
knee: ${knee}\nhips: ${hipc}\nwaist: ${waistc}
inseem_front: ${N.dist(I)+I.dist(D2)}
inseem_back: ${V.dist(W)+W.dist(X)}`);
  }

  ondblclick(){
    this.saveSvg("pants");
  }

  makePoints(points){
    let g = this.createChild("g", {class: "points"});
    for (let name in points) {
      let v = points[name]
      let dn = new DotNote({
        position: v,
        radius: 0.3,
        offset: new Vector(0,-1),
        note: {
          align: "middle",
          content: name,
        }
      })
      g.appendChild(dn);
    }
  }
}


export {Pants}
