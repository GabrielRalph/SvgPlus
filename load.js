function load(){
  return new Promise((resolve, reject) => {
    var vector_script = document.createElement("script");  // create a script DOM node
    vector_script.src = 'https://www.svg.plus/vector.js';  // set its src to the provided URL
    document.head.appendChild(vector_script);
    console.log('loading vectors');
    setTimeout(() => {
      reject('SvgPlus timeout 10s')
    }, 10000)
    vector_script.onload = () => {
      console.log('loaded vectors');
      var svg_plus_script = document.createElement("script");  // create a script DOM node
      svg_plus_script.src = 'https://www.svg.plus/SvgPlus.js';  // set its src to the provided URL
      document.head.appendChild(svg_plus_script);
      setTimeout(() => {
        reject('Vectors timeout 10s')
      }, 10000)
      console.log('loading SvgPlus');
      svg_plus_script.onload = () => {
        console.log('Loaded Successfuly');
        resolve('Successfuly loaded SvgPlus')
      }
    }
  })
}
let loaded = false;
let load_buffer = [];
load().then(msg => {
  loaded = msg
  load_buffer.forEach((node) => {
    node.remove();
    node.type = 'application/javascript'
    document.head.appendChild(node)
  });
})
const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach(node => {
            // For each added script tag
            if(node.nodeType === 1 && node.tagName === 'SCRIPT') {
              if (loaded == false){
                node.type = 'pause';
                load_buffer.push(node)
              }
            }
        })
    })
})

// Starts the monitoring
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
})
