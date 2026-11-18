import { SvgPlus } from "./4.js";

const LOADED_STYLES = {};
const CSS_STYLE_SHEET_CACHE = new Map();

function supportsConstructedSheets(win) {
    try {
        new win.CSSStyleSheet();
        return "adoptedStyleSheets" in win.Document.prototype;
    } catch (e) {
        return false;
    }
}

function newCSSStyleSheet(text, win, cacheKey, useConstructor = true) {
    let style = null;
    let useCache = typeof cacheKey === "string"; 
    if (useConstructor) {
        console.log("Creating new CSSStyleSheet with text:", cacheKey);
        if (!CSS_STYLE_SHEET_CACHE.has(win)) CSS_STYLE_SHEET_CACHE.set(win, {})
        let CSET = CSS_STYLE_SHEET_CACHE.get(win);

        // if using cache and style sheet exists in cache, use it
        if (useCache && cacheKey in CSET) {
            style = CSET[cacheKey];
        // otherwise, create a new style sheet 
        } else {
            style = new win.CSSStyleSheet()
            style.replaceSync(text);

            // cache the newly created style sheet if caching is enabled
            if (useCache) {
                CSET[cacheKey] = style;
            }
        } 

    // plain style element fallback for browsers that 
    // do not support constructed style sheets
    } else {
        style = win.document.createElement("style")
        style.innerHTML = text;
    }
    return style;
}

async function getCSSText(url) {
    if (!(url in LOADED_STYLES)) {
        LOADED_STYLES[url] = (async () => {
            let text = null;
            try {
                let response = await fetch(url);
                if (response.ok) {
                    text = await response.text();
                }
            } catch (e) {
                text = null;
            }
            return text;
        })()
    }
    return await LOADED_STYLES[url]
}

async function loadCSSStyleSheets(urls, win, useCache = true) {
    let useConstructor = supportsConstructedSheets(win);
    let texts = await Promise.all(urls.map(getCSSText));
    let styleSheets = texts.map((text, i) => {
        let style = null
        if (text === null) {
            console.warn(`ShadowElement CSS: Failed to load CSS from ${urls[i]}`);
        } else {
            style = newCSSStyleSheet(
                text, win,  
                useCache ? urls[i] : undefined,
                useConstructor
            );
        }
        return style;
    }).filter(style => style !== null);
    return [styleSheets, useConstructor];
}



/**
 * @template {SvgPlus} RootElementType
 */
export class ShadowElement extends SvgPlus {
    /**
     * @param {string | Element} el element or tag name to be used as the root of the shadow element.
     * @param {string | RootElementType} name element or tag name to be used as the root of the shadow element. If a string is provided, an SvgPlus element with that tag name will be created and used as the root. If an SvgPlus element is provided, it will be used directly as the root. If not provided, the element created from `el` will be used as the root.
     */
    constructor(el, name = el) {
        super(el);
        this.attachShadow({mode: "open"});
        this.loadStyles();
        if (typeof name === "string") {
            this._root = /** @type {RootElementType} */ new SvgPlus(name);
        } else if (SvgPlus.is(name, SvgPlus)) {
            this._root = name;
        }

        this._root.toggleAttribute("shadow");
        this.shadowRoot.appendChild(this._root);
    }

    appendChild(...args) {
        return this.root.appendChild(...args);
    }

    /** Creates a child SvgPlus element, sets its properties and appends it to its root element
     * @template {new (...args: any[]) => SvgPlus} T
     * @overload
     * @param {T} type class definition of the element to be created.
     * @param {Props} props properties to be set on the element before it is appended to the DOM.
     * @param {...any} args arguments to be passed to the constructor of the class definition provided in type.
     * @returns {InstanceType<T>}
     */
    /** Creates a child SvgPlus element, sets its properties and appends to its root element
     * @overload
     * @param {ElementLike} type tag name of the element to be created.
     * @param {Props} props properties to be set on the element before it is appended to the DOM.
     * @returns {SvgPlus}
     */
    /** Creates a child SvgPlus element, sets its properties and appends to its root element
     * @template {new (...args: any[]) => SvgPlus} T 
     * @param {ElementLike | T} type type Can be provided as an element tag name or an SvgPlus class.
     * @param {Props} props props element properties will be set before appending the newly created element.
     * @param {...any} args args if a type is given as an SvgPlusClass then the params will be passed to the 
     *                      constructor of that class when constructing the element.
     * @return {SvgPlus | InstanceType<T>}
     */
    createChild(type, props = {}, ...args) {
        return this.root.createChild(type, props, ...args);
    }

    /**
     * Waits for the styles to be loaded and applied to the shadow root.
     * If the styles are already loaded, it resolves immediately.
     * @returns {Promise<void>} Resolves when the styles have been loaded and applied.
     */
    async waitStyles(){
        if (this._stylesProm instanceof Promise) {
            await this._stylesProm
        }
    }

    /**
     * Waits for the styles to be loaded and applied to the shadow root.
     * If the styles are already loaded, it resolves immediately.
     * @returns {Promise<void>} Resolves when the styles have been loaded and applied.
     */
    async loadStyles({
        sources = this.usedStyleSheets,
        window: win = window, 
        useCache = true,
    } = {}) {
        if (!(this._stylesProm instanceof Promise)) {
            this._stylesProm = (async () => {
                let [styles, useConstructor] = await ShadowElement.loadStyleSheets(sources, {window: win, useCache});
                if (useConstructor) {
                    this.shadowRoot.adoptedStyleSheets = [...styles];
                } else {
                    // remove all styles previously appended to the shadow root
                    [...this.shadowRoot.children].forEach(child => {
                        if (child.tagName === 'STYLE') {
                            this.shadowRoot.removeChild(child);
                        }
                    });

                    for (let style of styles) {
                        this.shadowRoot.appendChild(style)
                    }
                }
                return styles;
            })();
        }
        return await this._stylesProm;
    }

    async reloadStyles(options = {}) {
        await this.waitStyles();    
        this._stylesProm = null;
        return await this.loadStyles(options);
    }

    /**
     * Loads the specified style sheets and applies them to the shadow root.
     * If the styles are already loaded, it reuses the cached versions.
     * @param {string|string[]} url - The URL(s) of the style sheets to load.
     * @returns {Promise<void>} Resolves when the styles have been loaded and applied.
     */
    static async loadStyleSheets(urls = this.usedStyleSheets, {
        window: win = window, 
        useCache = true
    } = {}){
        let [styles, useConstructor] = [[], false];
        if (typeof urls === "string") urls = [urls];
        if (Array.isArray(urls)) {
            urls = urls.flatMap(u => {
                if (Array.isArray(u)) {
                    return u;
                } else if (typeof u !== "string") {
                    console.warn(`Invalid style sheet URL:`, u);
                    return null;
                } else {
                    return [u];
                }
            });
            urls = urls.filter(u => typeof u === "string");
            [styles, useConstructor] = await loadCSSStyleSheets(urls, win, useCache);
        } else {
            console.warn(`Invalid style sheet URL(s):`, urls);
        }
        return [styles, useConstructor];
    }

    static get usedStyleSheets(){
        return []
    }

    get usedStyleSheets() {
        return this["__+"].usedStyleSheets
    }

    /** @returns {RootElementType} */
    get root() {return this._root;}
}

