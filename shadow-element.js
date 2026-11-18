import { SvgPlus } from "./4.js";

const LOADED_STYLES = {};
const CSS_STYLE_SHEET_CACHE = new WeakMap();

function supportsConstructedSheets(win) {
    try {
        new win.CSSStyleSheet();
        return "adoptedStyleSheets" in win.Document.prototype;
    } catch (e) {
        return false;
    }
}

function newCSSStyleSheet(text, win, url, useCache, useConstructor = true) {
    let style = null;
    if (useConstructor) {
        if (!CSS_STYLE_SHEET_CACHE.has(win)) CSS_STYLE_SHEET_CACHE.set(win, {})
        let CSET = CSS_STYLE_SHEET_CACHE.get(win);

        // if using cache and style sheet exists in cache, use it
        if (useCache && url in CSET) {
            style = CSET[url];
        // otherwise, create a new style sheet 
        } else {
            let baseURL = new URL(url, win.location.href).href;
            style = new win.CSSStyleSheet({baseURL})
            style.replaceSync(text);

            // cache the newly created style sheet if caching is enabled
            if (useCache) {
                CSET[url] = style;
            }
        } 

    // plain style element fallback for browsers that 
    // do not support constructed style sheets
    } else {
        style = win.document.createElement("style")
        style.textContent = text;
    }
    return style;
}

/**
 * Rewrites relative url(...) references in CSS text to absolute URLs, resolved
 * against the stylesheet's own URL. Needed because constructed style sheets and
 * <style> elements otherwise resolve them against the document, and the
 * CSSStyleSheet `baseURL` option is not supported by all browsers.
 * Absolute URLs (any scheme, e.g. data:, http:), protocol-relative URLs and
 * fragment-only references (#id) are left untouched.
 * @param {string} text
 * @param {string} baseURL
 * @returns {string}
 */
function absolutizeCSSURLs(text, baseURL) {
    return text.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (match, _quote, ref) => {
        if (ref === "" || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref)) return match;
        try {
            return `url("${new URL(ref, baseURL).href}")`;
        } catch (e) {
            return match;
        }
    });
}

async function getCSSText(url) {
    if (!(url in LOADED_STYLES)) {
        LOADED_STYLES[url] = (async () => {
            let text = null;
            try {
                let response = await fetch(url);
                if (response.ok) {
                    text = await response.text();
                    text = absolutizeCSSURLs(text, response.url);
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
                urls[i],
                useCache,
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
     * @param {string | Element} el element or tag name to be used as the host element (the element the shadow root is attached to).
     * @param {string | RootElementType} [name=el] element or tag name to be used as the root element inside the shadow root.
     *   If a string is provided, a new SvgPlus element with that tag name is created and used as the root.
     *   If an SvgPlus element is provided, it is used directly as the root; it must not be the host element itself.
     *   If omitted, defaults to `el`: this only works when `el` is a tag name (a second element with the same tag
     *   is created as the root). If `el` is an element, `name` must be provided.
     * @throws {Error} if `name` is not a tag name or an SvgPlus element other than the host.
     */
    constructor(el, name = el) {
        super(el);
        this.attachShadow({mode: "open"});
        this.loadStyles();
        if (typeof name === "string") {
            this._root = /** @type {RootElementType} */ new SvgPlus(name);
        } else if (SvgPlus.is(name, SvgPlus) && name !== el) {
            this._root = name;
        } else {
            throw new Error("Invalid root element for ShadowElement");
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
     * Loads style sheets and applies them to the shadow root. Uses adopted style sheets when
     * supported, otherwise appends `<style>` elements (replacing any previously appended).
     * Only loads once: if a load has already started, this waits for it and ignores the
     * options. Use {@link ShadowElement#reloadStyles} to load again.
     * Errors are logged, not thrown, so the promise always resolves.
     * @param {Object} [options]
     * @param {string | (string | string[])[]} [options.sources=this.usedStyleSheets] URL(s) of the style sheets to load.
     * @param {Window} [options.window=window] window whose CSSStyleSheet / document is used to create the sheets.
     * @param {boolean} [options.useCache=true] whether to reuse (and cache) constructed style sheets per URL.
     * @returns {Promise<void>} Resolves when loading has finished (successfully or not).
     */
    async loadStyles({
        sources = this.usedStyleSheets,
        window: win = window, 
        useCache = true,
    } = {}) {
        if (!(this._stylesProm instanceof Promise)) {
            this._stylesProm = (async () => {
                try {
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
                } catch (e) {
                    console.error("Failed to load styles:", e);
                }
            })();
        }
        await this._stylesProm;
    }

    /**
     * Waits for any current load to finish, then loads and applies the style sheets again.
     * @param {Parameters<ShadowElement["loadStyles"]>[0]} [options] same options as {@link ShadowElement#loadStyles}.
     * @returns {Promise<void>}
     */
    async reloadStyles(options = {}) {
        await this.waitStyles();    
        this._stylesProm = null;
        return await this.loadStyles(options);
    }

    /**
     * Fetches the specified style sheets and creates style sheet objects from them. Does not apply them
     * to any shadow root. CSS text is cached per URL; constructed sheets are cached per window and URL
     * when `useCache` is true. URLs that fail to load are skipped with a warning.
     * @param {string | (string | string[])[]} [urls=this.usedStyleSheets] URL(s) of the style sheets to load.
     *   Nested arrays are flattened one level; non-string entries are ignored with a warning.
     * @param {Object} [options]
     * @param {Window} [options.window=window] window whose CSSStyleSheet / document is used to create the sheets.
     * @param {boolean} [options.useCache=true] whether to reuse (and cache) constructed style sheets per URL.
     * @returns {Promise<[(CSSStyleSheet | HTMLStyleElement)[], boolean]>} the loaded sheets, and whether they are
     *   constructed `CSSStyleSheet`s (true, for `adoptedStyleSheets`) or `<style>` elements (false).
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

