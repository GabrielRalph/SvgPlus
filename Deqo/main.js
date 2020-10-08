console.log('loaded');
let test_vue_page = new Vue({
  el: "#people",
  data: {
    test: 'this is a vue page for people'
  }
})

class Templates extends PlusElement{
  constructor(el){
    super(el);

  }
  get children(){
    return this.el.children
  }
  appendTemplate(template){
    // NOT AN ELEMENT
    if (!(template instanceof Element)){
      throw + new PlusError(`template must be of type Element`)
    }
    template = new PlusElement(template);
    //DUPLICATE
    if (template.id in this.children){
      throw + new PlusError(`${template.id} is already an ID for another template.`)
      return null;
    }

    //NO ID -> set to timestamp
    if (template.id == null){
      this.id = + new Date().valueOf();
      throw + new PlusError(`Template must have a unique id, ${template.id}.`);
    }

    this.appendChild(template)
  }
  removeTemplate(template){
    if (template instanceof PlusElement){
      return template.remove();
    }else if (typeof template == 'string' && template in this.children){
      template = this.children[template];
      return template.remove();
    }
  }
}
class Window extends PlusElement{
  constructor(el){
    super(el);
    this.setAttribute('class', 'window');
  }
}
class Windows extends PlusElement{
  constructor(el){
    super(el)
    //Get template from
    try{
      this.templates = new Templates(this.children.template)
    }catch(e){
      let templates = this.createChild('DIV', {id: 'templates'});
      this.templates = new Templates(template);
      throw e
    }

    let home_page = (window.location.href.split('#')[1] || '').replace('/', '') || 'home';
    this.current_window = home_page

    let nav = document.createElement('DIV');
    nav.setAttribute('id', 'navigator')
    this.el.appendChild(nav);
    this._make_window()
    // this.navigator = new Navigator(nav, this);
  }

  get children(){
    return this.el.children
  }

  //Set the current_page to either a string (template ID) or Element Page,
  //Set options as element attributes:
  //  direction: 'left'|'right'|'up'|'down',
  //  duration: Number
  // async goto(page){
  //   let new_window = null;
  //   try{
  //     new_window = this._make_window(page);
  //   }catch(e){
  //     throw e
  //     return null
  //   }
  //   new_window = await this.wave_transition(new_window, options);
  //   let old_window = this.current_window;
  //   old_window.remove();
  //   put_template()
  //   this.el.appendChild(new_window);
  //
  // }
  //
  //
  async wave_transition(new_window, options){
    return Promise((resolve, reject) => {
      let dir = 'right';
      let duration = 400;
      //Options checking
      if (typeof options == 'object'){
        //Direction of transition, either from the 'left'|'right', or 'up'|'down'
        if ('direction' in options && ('right left up down').indexOf(options.direction) != -1){
          dir = options.direction;
        }
        //duration of the transition
        if ('duration' in options && typeof options.duration == 'number' && !Number.isNaN(options.duration)){
          duration = options.duration;
        }
      }

      let init_time = null;
      let t = (time) => {

        init_time = init_time == null?time:init_time;
        let x = (time - init_time)/duration;

        let y1 = (dir == 'right' || dir == 'down' ? 1 : -1) * 50*(1 + Math.cos(x));
        let y2 = y1 - (dir == 'right' || dir == 'down' ? 1 : -1)*100;

        if (this.current_page != null){
          let translate2 = dir == 'right' || dir == 'down' ? `translate(${y2}%, 0%)` : `translate(0%, ${y2}%)`;
          this.current_page.style.setProperty('transform', translate2)
        }
        let translate1 = dir == 'right' || dir == 'down' ? `translate(${y1}%, 0%)` : `translate(0%, ${y1}%)`;
        new_window.style.setProperty('transform', translate1);

        if (x < Math.PI){
          window.requestAnimationFrame(t);

        }else{
          resolve(new_window)
        }
      }
      window.requestAnimationFrame(t);
    })
  }
  //
  //
  //
  //
  //
  // get current_page(){
  //   return this._current_page;
  // }
  //
  //
  _make_window(){
    let new_window = new Window(null)
  }
  //
  //
  // appendTemplate(template){
  //   if (template instanceof Element){
  //     if (template.id){
  //       template.id = new Date().valueOf();
  //       throw `null id, id set to time stamp ${template.id}`
  //       template.remove();
  //       this.template_el.appendChild(template);
  //       return template
  //     }
  //   }
  // }
  // removeTemplate(template ){
  //   if (template in)
  //   template.remove()
  //   return template
  // }
  //
  //
  // goto(name, options){
  //   let page = null;
  //   try{
  //     page = this.get_template(name)
  //   }catch(e){
  //     throw e;
  //     return
  //   }
  //
  //   this.wave_transition(new_window, options);
  // }
}
//
// class Navigator{
//   constructor(el, windows = null){
//     this.el = el;
//
//
//     //On change event listner
//     this.onchange = null;
//
//
//
//     //Make positioner
//     let position = document.createElement('DIV');
//     this.el.appendChild(position);
//
//     //Make hider
//     this.hider = document.createElement('H1');
//     this.hider.innerHTML = '=';
//     this.hider.onclick = () => {
//       this.hide = !this.hide;
//     }
//     position.appendChild(this.hider);
//
//     //Make table for links
//     let table = document.createElement('TABLE');
//     position.appendChild(table);
//
//     //Make table row for links
//     this.links = document.createElement('TR');
//     table.appendChild(this.links);
//
//     // Add windows
//     if (windows instanceof Windows){
//       this.windows = windows;
//       this.pages = this.windows.template_el;
//     }else{
//       this.windows = null;
//     }
//
//     //Setup hash change listners
//     window.onhashchange = (e) => {
//       let page_name = (e.newURL.split('#')[1].replace('/', '') || 'home');
//       if (this.onchange instanceof Function){
//         this.onchange(page_name);
//       }
//       if (this.windows instanceof Windows){
//         this.windows.goto(page_name);
//       }
//     }
//     window.onload = (e) => {
//       let page_name = (window.location.href.split('#')[1].replace('/', '') || 'home');
//       if (this.onchange instanceof Function){
//         this.onchange(page_name);
//       }
//       if (this.windows instanceof Windows){
//         this.windows.current_page_name = page_name;
//       }
//     }
//
//     this.moving = false;
//     this.hide = true;
//
//   }
//
//   addLink(name){
//     let link_cell = document.createElement("TD");
//     let link = document.createElement('A');
//
//     link.setAttribute('href', `#/${name}`);
//     link.innerHTML = name.replace('_', ' ');
//
//     link_cell.appendChild(link)
//     this.links.appendChild(link_cell)
//   }
//   clearLinks(){
//     this.links.innerHTML = '';
//   }
//
//   set hide(val = true){
//     if (this.moving){
//       return
//     }
//     this.moving = true;
//     this._hide = val;
//     let init_time = null;
//     let t = (time) => {
//       init_time = init_time == null?time:init_time;
//       let x = (time - init_time)/400
//       let y = 50*(1 + Math.cos(x));
//       this.el.style.setProperty('transform', `translate(${val ? 100 - y : y}%, 0%)`)
//       if (x < Math.PI){
//         window.requestAnimationFrame(t);
//       }else{
//         this.moving = false;
//       }
//     }
//     window.requestAnimationFrame(t);
//   }
//   get hide(){
//     return this._hide;
//   }
//
//   set pages(template_pages){
//     this.clearLinks()
//     if (!template_pages.children){
//       throw `Navigator pages must be set to a HTML Element with children whos ID's are the location names`
//       return
//     }
//     let children = template_pages.children;
//     for (var i = 0; i < children.length; i++){
//       let child = children[i];
//       if (child.id){
//         this.addLink(child.id);
//       }
//     }
//   }
//
// }
let panels = new Windows('main');
