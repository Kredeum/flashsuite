
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    /* svelte/main.svelte generated by Svelte v3.32.0 */

    const file = "svelte/main.svelte";

    function create_fragment(ctx) {
    	let div6;
    	let div5;
    	let a0;
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let div2;
    	let t3;
    	let div18;
    	let div17;
    	let div7;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let h4;
    	let t6;
    	let p0;
    	let t8;
    	let div16;
    	let div11;
    	let a1;
    	let div10;
    	let div8;
    	let t9;
    	let div9;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let p1;
    	let t12;
    	let div15;
    	let a2;
    	let div14;
    	let div12;
    	let t13;
    	let div13;
    	let img2;
    	let img2_src_value;
    	let t14;
    	let p2;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			a0 = element("a");
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			div2.textContent = "0x56t7...897d";
    			t3 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div7 = element("div");
    			img0 = element("img");
    			t4 = space();
    			h4 = element("h4");
    			h4.textContent = "Flashloan DApps";
    			t6 = space();
    			p0 = element("p");
    			p0.textContent = "without the need to write a single line of code";
    			t8 = space();
    			div16 = element("div");
    			div11 = element("div");
    			a1 = element("a");
    			div10 = element("div");
    			div8 = element("div");
    			t9 = space();
    			div9 = element("div");
    			img1 = element("img");
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "Allows you to migrate your position, full and partially from one address to another.";
    			t12 = space();
    			div15 = element("div");
    			a2 = element("a");
    			div14 = element("div");
    			div12 = element("div");
    			t13 = space();
    			div13 = element("div");
    			img2 = element("img");
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "A graphical interface that helps you identify good arbitrage opportunities";
    			this.c = noop;
    			attr_dev(div0, "class", "frostedglasseffect notfixed");
    			add_location(div0, file, 6, 8, 219);
    			attr_dev(div1, "id", "identiconAddressImage");
    			attr_dev(div1, "class", "buttondisk");
    			add_location(div1, file, 8, 10, 313);
    			attr_dev(div2, "id", "userAddressSet");
    			attr_dev(div2, "class", "textdarkmode");
    			add_location(div2, file, 11, 10, 576);
    			attr_dev(div3, "class", "blockcontents");
    			add_location(div3, file, 7, 8, 275);
    			attr_dev(div4, "class", "frostedglasswrapper left");
    			add_location(div4, file, 5, 6, 172);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "headerbutton w-inline-block");
    			add_location(a0, file, 4, 4, 117);
    			attr_dev(div5, "class", "nnavbarcontents");
    			add_location(div5, file, 3, 2, 83);
    			attr_dev(div6, "class", "nnavbar");
    			add_location(div6, file, 2, 0, 59);
    			if (img0.src !== (img0_src_value = "images/FLSuite-Logo-Full-Dark.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "loading", "eager");
    			attr_dev(img0, "width", "400");
    			attr_dev(img0, "id", "flashSuiteLogo");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "flashsuitelogo");
    			add_location(img0, file, 19, 37, 860);
    			attr_dev(h4, "class", "textdarkmode");
    			add_location(h4, file, 20, 6, 990);
    			attr_dev(p0, "class", "headerparagraph");
    			add_location(p0, file, 21, 6, 1042);
    			attr_dev(div7, "class", "headercontents left");
    			add_location(div7, file, 19, 4, 827);
    			attr_dev(div8, "class", "frostedglasseffect");
    			add_location(div8, file, 27, 12, 1359);
    			if (img1.src !== (img1_src_value = "images/FlashPos-Sub-Logo-Dark.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "width", "125");
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "flashlogo");
    			add_location(img1, file, 28, 36, 1434);
    			attr_dev(div9, "class", "blockimage");
    			add_location(div9, file, 28, 12, 1410);
    			attr_dev(div10, "class", "frostedglasswrapper");
    			add_location(div10, file, 26, 10, 1313);
    			attr_dev(a1, "id", "flashPosTrigger");
    			attr_dev(a1, "href", "#sectionFlashPos");
    			attr_dev(a1, "class", "headerbutton w-inline-block");
    			add_location(a1, file, 25, 8, 1218);
    			attr_dev(p1, "class", "headerparagraph headeritemparagraph");
    			add_location(p1, file, 31, 8, 1576);
    			attr_dev(div11, "class", "headeritemcontents");
    			add_location(div11, file, 24, 6, 1177);
    			attr_dev(div12, "class", "frostedglasseffect");
    			add_location(div12, file, 36, 12, 1898);
    			if (img2.src !== (img2_src_value = "images/FlashArb-Sub-Logo-Dark.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "loading", "lazy");
    			attr_dev(img2, "width", "125");
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "flashlogo");
    			add_location(img2, file, 37, 36, 1973);
    			attr_dev(div13, "class", "blockimage");
    			add_location(div13, file, 37, 12, 1949);
    			attr_dev(div14, "class", "frostedglasswrapper");
    			add_location(div14, file, 35, 10, 1852);
    			attr_dev(a2, "id", "flashArbTrigger");
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "headerbutton w-inline-block");
    			add_location(a2, file, 34, 8, 1772);
    			attr_dev(p2, "class", "headerparagraph headeritemparagraph");
    			add_location(p2, file, 40, 8, 2115);
    			attr_dev(div15, "class", "headeritemcontents");
    			add_location(div15, file, 33, 6, 1731);
    			attr_dev(div16, "class", "headercontents right");
    			add_location(div16, file, 23, 4, 1136);
    			attr_dev(div17, "data-w-id", "4a69aa65-f69d-177b-618b-fec329a2edbb");
    			set_style(div17, "opacity", "1");
    			attr_dev(div17, "class", "header1400container");
    			add_location(div17, file, 18, 2, 722);
    			attr_dev(div18, "class", "headermain");
    			add_location(div18, file, 17, 0, 695);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, a0);
    			append_dev(a0, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div17);
    			append_dev(div17, div7);
    			append_dev(div7, img0);
    			append_dev(div7, t4);
    			append_dev(div7, h4);
    			append_dev(div7, t6);
    			append_dev(div7, p0);
    			append_dev(div17, t8);
    			append_dev(div17, div16);
    			append_dev(div16, div11);
    			append_dev(div11, a1);
    			append_dev(a1, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t9);
    			append_dev(div10, div9);
    			append_dev(div9, img1);
    			append_dev(div11, t10);
    			append_dev(div11, p1);
    			append_dev(div16, t12);
    			append_dev(div16, div15);
    			append_dev(div15, a2);
    			append_dev(a2, div14);
    			append_dev(div14, div12);
    			append_dev(div14, t13);
    			append_dev(div14, div13);
    			append_dev(div13, img2);
    			append_dev(div15, t14);
    			append_dev(div15, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div18);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("flashsuite-main", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<flashsuite-main> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Main extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>h4{margin-top:10px;margin-bottom:10px;font-size:18px;line-height:24px;font-weight:700}p{display:block;max-width:none;margin:10px 0px;padding-left:0px;-webkit-align-self:auto;-ms-flex-item-align:auto;-ms-grid-row-align:auto;align-self:auto;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto;text-align:left}a{text-decoration:underline}.headermain{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:120vh;margin-bottom:0px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-image:url('../images/Synth-BG-Header-Hi.png');background-position:50% 50%;background-size:cover;background-repeat:no-repeat;background-attachment:fixed}.flashsuitelogo{margin-bottom:-22px;-webkit-align-self:flex-start;-ms-flex-item-align:start;align-self:flex-start}.headercontents{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start}.headercontents.left{height:100%;padding-right:20px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.headercontents.right{width:50%;padding-top:100px;padding-left:20px;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}.headerparagraph{padding:0px;-webkit-align-self:flex-start;-ms-flex-item-align:start;align-self:flex-start;color:#ffe6fc;line-height:22px}.headerparagraph.headeritemparagraph{width:auto;padding-top:10px;padding-right:0px;padding-left:0px}.textdarkmode{margin-top:0px;margin-bottom:0px;color:#ffe6fc}.headerbutton{overflow:hidden;width:100%;max-width:200px;min-height:auto;min-width:auto;padding:0px;-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center;border-style:solid;border-width:2px;border-color:#fff;border-radius:50px;background-color:transparent}.frostedglasswrapper{position:static;left:auto;top:0%;right:0%;bottom:0%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;overflow:hidden;height:45px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;border-radius:30px}.frostedglasswrapper.left{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start}.frostedglasseffect{width:100%;height:100%;background-color:transparent;background-image:-webkit-gradient(linear, left top, left bottom, from(rgba(246, 202, 255, 0.23)), to(rgba(246, 202, 255, 0.23))), url('../images/Synth-BG-Header-Hi.png');background-image:linear-gradient(180deg, rgba(246, 202, 255, 0.23), rgba(246, 202, 255, 0.23)), url('../images/Synth-BG-Header-Hi.png');background-position:0px 0px, 50% 50%;background-size:auto, cover;background-repeat:repeat, no-repeat;background-attachment:scroll, fixed;-webkit-filter:blur(3px);filter:blur(3px)}.headeritemcontents{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:auto;height:100%;padding:20px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.flashlogo{position:static;top:44px;z-index:1}.blockimage{position:absolute;z-index:1;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.header1400container{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;max-width:900px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.nnavbarcontents{position:fixed;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;max-width:1400px;margin-right:0px;margin-left:0px;padding-right:140px;padding-left:140px;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:stretch;-ms-flex-item-align:stretch;align-self:stretch;-webkit-box-flex:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto}.nnavbar{position:absolute;left:0%;top:6%;right:0%;bottom:auto;z-index:2;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;height:55px;padding-bottom:0px;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-color:transparent;box-shadow:none}.buttondisk{position:static;top:-0.8333px;right:157.5417px;width:45px;height:45px;margin-right:10px;padding-left:0px;border-radius:50px;background-color:#f0f0f0}.blockcontents{position:absolute;z-index:1;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.right{margin-top:0px;margin-bottom:0px}.left{margin-top:0px;margin-bottom:0px;text-align:left}@media screen and (min-width: 1920px){p{margin-top:10px;margin-bottom:20px;font-size:22px;line-height:28px}.flashsuitelogo{max-width:100%;min-width:100%;margin-bottom:-31px}.headercontents.right{padding-top:100px}.headerparagraph{font-size:22px;line-height:28px}.headerparagraph.headeritemparagraph{width:auto;padding-right:0px;padding-left:0px;-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}.textdarkmode{font-size:22px;line-height:32px}.headerbutton{max-width:300px;min-width:100px;margin-right:0px}.frostedglasswrapper{height:55px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.headeritemcontents{padding:40px 60px}.flashlogo{min-width:120%}.blockimage{-webkit-align-self:auto;-ms-flex-item-align:auto;-ms-grid-row-align:auto;align-self:auto;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto}.header1400container{max-width:1400px}.nnavbarcontents{padding-right:0px;padding-left:0px;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end}.buttondisk{top:0px;right:225.5417px;width:55px;height:55px}.blockcontents{-webkit-align-self:auto;-ms-flex-item-align:auto;-ms-grid-row-align:auto;align-self:auto;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto}.right{font-size:20px}.left{font-size:20px}}@media screen and (max-width: 991px){p{text-align:center}.headercontents.right{width:auto;padding-top:40px}.header1400container{padding-right:40px;padding-left:40px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column}.nnavbarcontents{margin-right:40px;margin-left:40px}}@media screen and (max-width: 767px){.headerbutton{max-width:125px;min-width:125px}.flashlogo{max-width:80%}}@media screen and (max-width: 479px){.flashsuitelogo{margin-bottom:0px}.nnavbarcontents{margin-right:20px;margin-left:20px}}@media screen and (min-width: 1920px){@media screen and (min-width: 1920px){}}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes)
    			},
    			instance,
    			create_fragment,
    			not_equal,
    			{}
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("flashsuite-main", Main);

    return Main;

}());
//# sourceMappingURL=main.js.map
