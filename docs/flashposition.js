
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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

    /* svelte/flashposition.svelte generated by Svelte v3.32.0 */

    const file = "svelte/flashposition.svelte";

    function create_fragment(ctx) {
    	let div6;
    	let div5;
    	let a0;
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div2;
    	let t3;
    	let div101;
    	let div100;
    	let div8;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let div99;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let h1;
    	let t7;
    	let p;
    	let t9;
    	let div10;
    	let div9;
    	let t11;
    	let div95;
    	let div56;
    	let div16;
    	let h20;
    	let t13;
    	let div15;
    	let div14;
    	let div11;
    	let t14;
    	let div12;
    	let img3;
    	let img3_src_value;
    	let t15;
    	let div13;
    	let t17;
    	let nav0;
    	let a1;
    	let t19;
    	let a2;
    	let t21;
    	let img4;
    	let img4_src_value;
    	let t22;
    	let div18;
    	let div17;
    	let t24;
    	let div20;
    	let div19;
    	let t26;
    	let div51;
    	let h30;
    	let t28;
    	let h31;
    	let t30;
    	let div26;
    	let div23;
    	let div21;
    	let img5;
    	let img5_src_value;
    	let t31;
    	let div22;
    	let t33;
    	let div25;
    	let div24;
    	let t35;
    	let div32;
    	let div29;
    	let div27;
    	let img6;
    	let img6_src_value;
    	let t36;
    	let div28;
    	let t38;
    	let div31;
    	let div30;
    	let t40;
    	let div33;
    	let t42;
    	let div35;
    	let div34;
    	let t44;
    	let img7;
    	let img7_src_value;
    	let t45;
    	let div41;
    	let div38;
    	let div36;
    	let img8;
    	let img8_src_value;
    	let t46;
    	let div37;
    	let t48;
    	let div40;
    	let div39;
    	let t50;
    	let div47;
    	let div44;
    	let div42;
    	let img9;
    	let img9_src_value;
    	let t51;
    	let div43;
    	let t53;
    	let div46;
    	let div45;
    	let t55;
    	let div48;
    	let t57;
    	let div50;
    	let div49;
    	let t59;
    	let img10;
    	let img10_src_value;
    	let t60;
    	let div55;
    	let div54;
    	let div52;
    	let t62;
    	let img11;
    	let img11_src_value;
    	let t63;
    	let div53;
    	let t65;
    	let div94;
    	let div62;
    	let h21;
    	let t67;
    	let div61;
    	let div60;
    	let div57;
    	let t68;
    	let div58;
    	let img12;
    	let img12_src_value;
    	let t69;
    	let div59;
    	let t71;
    	let nav1;
    	let a3;
    	let t73;
    	let a4;
    	let t75;
    	let img13;
    	let img13_src_value;
    	let t76;
    	let div64;
    	let div63;
    	let t78;
    	let div66;
    	let div65;
    	let t80;
    	let div84;
    	let h32;
    	let t82;
    	let h33;
    	let t84;
    	let div71;
    	let div69;
    	let div67;
    	let img14;
    	let img14_src_value;
    	let t85;
    	let div68;
    	let t87;
    	let div70;
    	let input0;
    	let t88;
    	let div76;
    	let div74;
    	let div72;
    	let img15;
    	let img15_src_value;
    	let t89;
    	let div73;
    	let t91;
    	let div75;
    	let input1;
    	let t92;
    	let div77;
    	let t94;
    	let div79;
    	let div78;
    	let t96;
    	let img16;
    	let img16_src_value;
    	let t97;
    	let div81;
    	let div80;
    	let t99;
    	let div83;
    	let div82;
    	let t101;
    	let img17;
    	let img17_src_value;
    	let t102;
    	let div86;
    	let div85;
    	let t104;
    	let div93;
    	let div89;
    	let div87;
    	let t106;
    	let img18;
    	let img18_src_value;
    	let t107;
    	let div88;
    	let t109;
    	let div92;
    	let div90;
    	let t111;
    	let img19;
    	let img19_src_value;
    	let t112;
    	let div91;
    	let t114;
    	let div98;
    	let div97;
    	let div96;

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
    			img0 = element("img");
    			t1 = space();
    			div2 = element("div");
    			div2.textContent = "0x56t7...897d";
    			t3 = space();
    			div101 = element("div");
    			div100 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			img1 = element("img");
    			t4 = space();
    			div99 = element("div");
    			img2 = element("img");
    			t5 = space();
    			h1 = element("h1");
    			h1.textContent = "Migrate your positions";
    			t7 = space();
    			p = element("p");
    			p.textContent = "Use 2 accounts to connect and disconnect to FlashSuite when you are\n        prompted.";
    			t9 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "Position Migration";
    			t11 = space();
    			div95 = element("div");
    			div56 = element("div");
    			div16 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Origin";
    			t13 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div11 = element("div");
    			t14 = space();
    			div12 = element("div");
    			img3 = element("img");
    			t15 = space();
    			div13 = element("div");
    			div13.textContent = "Select address";
    			t17 = space();
    			nav0 = element("nav");
    			a1 = element("a");
    			a1.textContent = "Acc.1 address";
    			t19 = space();
    			a2 = element("a");
    			a2.textContent = "Acc.2 address";
    			t21 = space();
    			img4 = element("img");
    			t22 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div17.textContent = "Please connect your Origin account";
    			t24 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div19.textContent = "Please connect your Origin account";
    			t26 = space();
    			div51 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Your Deposits";
    			t28 = space();
    			h31 = element("h3");
    			h31.textContent = "Your Loans";
    			t30 = space();
    			div26 = element("div");
    			div23 = element("div");
    			div21 = element("div");
    			img5 = element("img");
    			t31 = space();
    			div22 = element("div");
    			div22.textContent = "---";
    			t33 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div24.textContent = "0.0000";
    			t35 = space();
    			div32 = element("div");
    			div29 = element("div");
    			div27 = element("div");
    			img6 = element("img");
    			t36 = space();
    			div28 = element("div");
    			div28.textContent = "---";
    			t38 = space();
    			div31 = element("div");
    			div30 = element("div");
    			div30.textContent = "0.0000";
    			t40 = space();
    			div33 = element("div");
    			div33.textContent = "-";
    			t42 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div34.textContent = "Variable Rate (--%)";
    			t44 = space();
    			img7 = element("img");
    			t45 = space();
    			div41 = element("div");
    			div38 = element("div");
    			div36 = element("div");
    			img8 = element("img");
    			t46 = space();
    			div37 = element("div");
    			div37.textContent = "---";
    			t48 = space();
    			div40 = element("div");
    			div39 = element("div");
    			div39.textContent = "0.0000";
    			t50 = space();
    			div47 = element("div");
    			div44 = element("div");
    			div42 = element("div");
    			img9 = element("img");
    			t51 = space();
    			div43 = element("div");
    			div43.textContent = "---";
    			t53 = space();
    			div46 = element("div");
    			div45 = element("div");
    			div45.textContent = "0.0000";
    			t55 = space();
    			div48 = element("div");
    			div48.textContent = "-";
    			t57 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div49.textContent = "Variable Rate (--%)";
    			t59 = space();
    			img10 = element("img");
    			t60 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div52 = element("div");
    			div52.textContent = "Origin HF";
    			t62 = space();
    			img11 = element("img");
    			t63 = space();
    			div53 = element("div");
    			div53.textContent = "Good (--%)";
    			t65 = space();
    			div94 = element("div");
    			div62 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Destination";
    			t67 = space();
    			div61 = element("div");
    			div60 = element("div");
    			div57 = element("div");
    			t68 = space();
    			div58 = element("div");
    			img12 = element("img");
    			t69 = space();
    			div59 = element("div");
    			div59.textContent = "Select address";
    			t71 = space();
    			nav1 = element("nav");
    			a3 = element("a");
    			a3.textContent = "Acc.1 address";
    			t73 = space();
    			a4 = element("a");
    			a4.textContent = "Acc.2 address";
    			t75 = space();
    			img13 = element("img");
    			t76 = space();
    			div64 = element("div");
    			div63 = element("div");
    			div63.textContent = "Please connect your Origin account";
    			t78 = space();
    			div66 = element("div");
    			div65 = element("div");
    			div65.textContent = "Please connect your Origin account";
    			t80 = space();
    			div84 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Your Deposits";
    			t82 = space();
    			h33 = element("h3");
    			h33.textContent = "Your Loans";
    			t84 = space();
    			div71 = element("div");
    			div69 = element("div");
    			div67 = element("div");
    			img14 = element("img");
    			t85 = space();
    			div68 = element("div");
    			div68.textContent = "---";
    			t87 = space();
    			div70 = element("div");
    			input0 = element("input");
    			t88 = space();
    			div76 = element("div");
    			div74 = element("div");
    			div72 = element("div");
    			img15 = element("img");
    			t89 = space();
    			div73 = element("div");
    			div73.textContent = "---";
    			t91 = space();
    			div75 = element("div");
    			input1 = element("input");
    			t92 = space();
    			div77 = element("div");
    			div77.textContent = "-";
    			t94 = space();
    			div79 = element("div");
    			div78 = element("div");
    			div78.textContent = "Variable Rate (--%)";
    			t96 = space();
    			img16 = element("img");
    			t97 = space();
    			div81 = element("div");
    			div80 = element("div");
    			div80.textContent = "-";
    			t99 = space();
    			div83 = element("div");
    			div82 = element("div");
    			div82.textContent = "Stable Rate (--%)";
    			t101 = space();
    			img17 = element("img");
    			t102 = space();
    			div86 = element("div");
    			div85 = element("div");
    			div85.textContent = "Select Max for all!";
    			t104 = space();
    			div93 = element("div");
    			div89 = element("div");
    			div87 = element("div");
    			div87.textContent = "New Origin HF";
    			t106 = space();
    			img18 = element("img");
    			t107 = space();
    			div88 = element("div");
    			div88.textContent = "Good (--%)";
    			t109 = space();
    			div92 = element("div");
    			div90 = element("div");
    			div90.textContent = "New Dest HF";
    			t111 = space();
    			img19 = element("img");
    			t112 = space();
    			div91 = element("div");
    			div91.textContent = "Good (--%)";
    			t114 = space();
    			div98 = element("div");
    			div97 = element("div");
    			div96 = element("div");
    			div96.textContent = "Migrate Positions";
    			this.c = noop;
    			attr_dev(div0, "class", "frostedglasseffect notfixed");
    			add_location(div0, file, 6, 8, 223);
    			if (img0.src !== (img0_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "loading", "lazy");
    			attr_dev(img0, "id", "platformLogo");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "placeholderimage");
    			add_location(img0, file, 9, 12, 381);
    			attr_dev(div1, "id", "identiconAddressImage");
    			attr_dev(div1, "class", "buttondisk");
    			add_location(div1, file, 8, 10, 317);
    			attr_dev(div2, "id", "userAddressSet");
    			attr_dev(div2, "class", "textdarkmode");
    			add_location(div2, file, 17, 10, 655);
    			attr_dev(div3, "class", "blockcontents");
    			add_location(div3, file, 7, 8, 279);
    			attr_dev(div4, "class", "frostedglasswrapper left");
    			add_location(div4, file, 5, 6, 176);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "headerbutton w-inline-block");
    			add_location(a0, file, 4, 4, 121);
    			attr_dev(div5, "class", "nnavbarcontents");
    			add_location(div5, file, 3, 2, 87);
    			attr_dev(div6, "class", "nnavbar");
    			add_location(div6, file, 2, 0, 63);
    			if (img1.src !== (img1_src_value = "images/FLSuite-Logo-Full-Dark.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "width", "125");
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "flashlogo");
    			add_location(img1, file, 28, 8, 928);
    			attr_dev(div7, "class", "blockimage");
    			add_location(div7, file, 27, 6, 895);
    			attr_dev(div8, "class", "sectionbumper");
    			add_location(div8, file, 26, 4, 861);
    			if (img2.src !== (img2_src_value = "images/FlashPos-SubLogo-Light.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "loading", "lazy");
    			attr_dev(img2, "width", "200");
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "sectionlogoimage");
    			add_location(img2, file, 38, 6, 1150);
    			add_location(h1, file, 45, 6, 1309);
    			attr_dev(p, "class", "paragraph");
    			add_location(p, file, 46, 6, 1347);
    			attr_dev(div9, "id", "amountDep02ORG");
    			attr_dev(div9, "class", "textdarkmode button");
    			add_location(div9, file, 51, 8, 1533);
    			attr_dev(div10, "id", "chipFlashPos");
    			attr_dev(div10, "class", "chipflashpos");
    			add_location(div10, file, 50, 6, 1480);
    			attr_dev(h20, "id", "columnTitle");
    			add_location(h20, file, 61, 12, 1874);
    			attr_dev(div11, "class", "arrow lightmode w-icon-dropdown-toggle");
    			add_location(div11, file, 68, 16, 2131);
    			if (img3.src !== (img3_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "loading", "lazy");
    			attr_dev(img3, "id", "platformLogo");
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", "placeholderimage");
    			add_location(img3, file, 70, 18, 2274);
    			attr_dev(div12, "id", "platformAddressLogo");
    			attr_dev(div12, "class", "buttondisk");
    			add_location(div12, file, 69, 16, 2206);
    			attr_dev(div13, "class", "textlightmode");
    			add_location(div13, file, 78, 16, 2596);
    			attr_dev(div14, "class", "dropdown-toggle addresses w-dropdown-toggle");
    			add_location(div14, file, 67, 14, 2057);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "id", "accItem-01");
    			attr_dev(a1, "class", "dropdownitem w-dropdown-link");
    			add_location(a1, file, 81, 16, 2739);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "id", "accItem-02");
    			attr_dev(a2, "class", "dropdownitem w-dropdown-link");
    			add_location(a2, file, 87, 16, 2928);
    			attr_dev(nav0, "class", "dropdown-list w-dropdown-list");
    			add_location(nav0, file, 80, 14, 2679);
    			attr_dev(div15, "data-hover", "");
    			attr_dev(div15, "data-delay", "0");
    			attr_dev(div15, "class", "adressdropdown w-dropdown");
    			add_location(div15, file, 62, 12, 1919);
    			if (img4.src !== (img4_src_value = "images/Network-Dot-Green.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "loading", "lazy");
    			attr_dev(img4, "width", "50");
    			attr_dev(img4, "alt", "");
    			attr_dev(img4, "class", "connectindicator");
    			add_location(img4, file, 95, 12, 3153);
    			attr_dev(div16, "class", "columntitlebar");
    			add_location(div16, file, 60, 10, 1833);
    			attr_dev(div17, "id", "userMessagePurpleText");
    			attr_dev(div17, "class", "textdarkmode usermessage");
    			add_location(div17, file, 104, 12, 3428);
    			attr_dev(div18, "id", "userMessagePurple");
    			attr_dev(div18, "class", "usermessagesbar");
    			add_location(div18, file, 103, 10, 3363);
    			attr_dev(div19, "id", "userMessageOrangeText");
    			attr_dev(div19, "class", "textdarkmode usermessage");
    			add_location(div19, file, 112, 12, 3702);
    			attr_dev(div20, "id", "userMessageOrange");
    			attr_dev(div20, "class", "usermessagesbar orange");
    			add_location(div20, file, 111, 10, 3630);
    			attr_dev(h30, "class", "left");
    			add_location(h30, file, 120, 12, 3971);
    			attr_dev(h31, "class", "right");
    			add_location(h31, file, 121, 12, 4019);
    			if (img5.src !== (img5_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "loading", "lazy");
    			attr_dev(img5, "id", "tokenLogoDep01ORG");
    			attr_dev(img5, "alt", "");
    			attr_dev(img5, "class", "placeholderimage");
    			add_location(img5, file, 125, 18, 4216);
    			attr_dev(div21, "id", "platformAddressLogo");
    			attr_dev(div21, "class", "buttondisk");
    			add_location(div21, file, 124, 16, 4148);
    			attr_dev(div22, "id", "tokenSymbolDep01ORG");
    			attr_dev(div22, "class", "textlightmode");
    			add_location(div22, file, 133, 16, 4543);
    			attr_dev(div23, "class", "tokendetails");
    			add_location(div23, file, 123, 14, 4105);
    			attr_dev(div24, "id", "amountDep01ORG");
    			attr_dev(div24, "class", "textlightmode numbers");
    			add_location(div24, file, 138, 16, 4720);
    			attr_dev(div25, "class", "readonlyfield");
    			add_location(div25, file, 137, 14, 4676);
    			attr_dev(div26, "class", "deposititem");
    			add_location(div26, file, 122, 12, 4065);
    			if (img6.src !== (img6_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "loading", "lazy");
    			attr_dev(img6, "id", "tokenLogoLoan01ORG");
    			attr_dev(img6, "alt", "");
    			attr_dev(img6, "class", "placeholderimage");
    			add_location(img6, file, 146, 18, 5040);
    			attr_dev(div27, "id", "platformAddressLogo");
    			attr_dev(div27, "class", "buttondisk reverse");
    			add_location(div27, file, 145, 16, 4964);
    			attr_dev(div28, "id", "tokenSymbolLoan01");
    			attr_dev(div28, "class", "textlightmode");
    			add_location(div28, file, 154, 16, 5368);
    			attr_dev(div29, "class", "tokendetails reverse");
    			add_location(div29, file, 144, 14, 4913);
    			attr_dev(div30, "id", "amountLoan01ORG");
    			attr_dev(div30, "class", "textlightmode numbers");
    			add_location(div30, file, 157, 16, 5507);
    			attr_dev(div31, "class", "readonlyfield");
    			add_location(div31, file, 156, 14, 5463);
    			attr_dev(div32, "class", "loanitem");
    			add_location(div32, file, 143, 12, 4876);
    			attr_dev(div33, "class", "textlightmode rates");
    			add_location(div33, file, 162, 12, 5664);
    			attr_dev(div34, "id", "tokenSymbolDep01ORG");
    			attr_dev(div34, "class", "textlightmode rates");
    			add_location(div34, file, 167, 14, 5843);
    			if (img7.src !== (img7_src_value = "images/Info-Icon.svg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "loading", "lazy");
    			attr_dev(img7, "alt", "");
    			attr_dev(img7, "class", "infroicon");
    			add_location(img7, file, 170, 14, 5973);
    			attr_dev(div35, "id", "APRLoan01ORG");
    			attr_dev(div35, "class", "ratesinfo w-node-9c5920cd5a3d-3e5b97ee");
    			add_location(div35, file, 163, 12, 5717);
    			if (img8.src !== (img8_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "loading", "lazy");
    			attr_dev(img8, "id", "tokenLogoDep02ORG");
    			attr_dev(img8, "alt", "");
    			attr_dev(img8, "class", "placeholderimage");
    			add_location(img8, file, 180, 18, 6308);
    			attr_dev(div36, "id", "platformAddressLogo");
    			attr_dev(div36, "class", "buttondisk");
    			add_location(div36, file, 179, 16, 6240);
    			attr_dev(div37, "id", "tokenSymbolDep02ORG");
    			attr_dev(div37, "class", "textlightmode");
    			add_location(div37, file, 188, 16, 6635);
    			attr_dev(div38, "class", "tokendetails");
    			add_location(div38, file, 178, 14, 6197);
    			attr_dev(div39, "id", "amountDep02ORG");
    			attr_dev(div39, "class", "textlightmode numbers");
    			add_location(div39, file, 193, 16, 6812);
    			attr_dev(div40, "class", "readonlyfield");
    			add_location(div40, file, 192, 14, 6768);
    			attr_dev(div41, "class", "deposititem");
    			add_location(div41, file, 177, 12, 6157);
    			if (img9.src !== (img9_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "loading", "lazy");
    			attr_dev(img9, "id", "tokenLogoLoan02ORG");
    			attr_dev(img9, "alt", "");
    			attr_dev(img9, "class", "placeholderimage");
    			add_location(img9, file, 201, 18, 7132);
    			attr_dev(div42, "id", "platformAddressLogo");
    			attr_dev(div42, "class", "buttondisk reverse");
    			add_location(div42, file, 200, 16, 7056);
    			attr_dev(div43, "id", "tokenSymbolLoan02ORG");
    			attr_dev(div43, "class", "textlightmode");
    			add_location(div43, file, 209, 16, 7460);
    			attr_dev(div44, "class", "tokendetails reverse");
    			add_location(div44, file, 199, 14, 7005);
    			attr_dev(div45, "id", "amountLoan02ORG");
    			attr_dev(div45, "class", "textlightmode numbers");
    			add_location(div45, file, 214, 16, 7638);
    			attr_dev(div46, "class", "readonlyfield");
    			add_location(div46, file, 213, 14, 7594);
    			attr_dev(div47, "class", "loanitem");
    			add_location(div47, file, 198, 12, 6968);
    			attr_dev(div48, "class", "textlightmode rates");
    			add_location(div48, file, 219, 12, 7795);
    			attr_dev(div49, "id", "tokenSymbolDep01ORG");
    			attr_dev(div49, "class", "textlightmode rates");
    			add_location(div49, file, 224, 14, 7974);
    			if (img10.src !== (img10_src_value = "images/Info-Icon.svg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "loading", "lazy");
    			attr_dev(img10, "alt", "");
    			attr_dev(img10, "class", "infroicon");
    			add_location(img10, file, 227, 14, 8104);
    			attr_dev(div50, "id", "APRLoan01ORG");
    			attr_dev(div50, "class", "ratesinfo w-node-6a861f31309d-3e5b97ee");
    			add_location(div50, file, 220, 12, 7848);
    			attr_dev(div51, "id", "gridOrigin");
    			attr_dev(div51, "class", "w-layout-grid gridorigin");
    			add_location(div51, file, 119, 10, 3904);
    			attr_dev(div52, "id", "userMessagePurpleText");
    			attr_dev(div52, "class", "textlightmode rates");
    			add_location(div52, file, 237, 14, 8417);
    			if (img11.src !== (img11_src_value = "images/Info-Icon.svg")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "loading", "lazy");
    			attr_dev(img11, "alt", "");
    			attr_dev(img11, "class", "infroicon");
    			add_location(img11, file, 240, 14, 8539);
    			attr_dev(div53, "id", "userMessagePurpleText");
    			attr_dev(div53, "class", "textlightmode rates green");
    			add_location(div53, file, 246, 14, 8706);
    			attr_dev(div54, "class", "hfcontents origin");
    			add_location(div54, file, 236, 12, 8371);
    			attr_dev(div55, "id", "healthFactorInfoORG");
    			attr_dev(div55, "class", "healthfactorinfo");
    			add_location(div55, file, 235, 10, 8303);
    			attr_dev(div56, "id", "OriginPosition");
    			attr_dev(div56, "class", "columnposition w-col w-col-6 w-col-stack w-col-small-small-stack");
    			add_location(div56, file, 56, 8, 1695);
    			attr_dev(h21, "id", "columnTitle");
    			add_location(h21, file, 260, 12, 9115);
    			attr_dev(div57, "class", "arrow lightmode w-icon-dropdown-toggle");
    			add_location(div57, file, 267, 16, 9377);
    			if (img12.src !== (img12_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "loading", "lazy");
    			attr_dev(img12, "id", "platformLogo");
    			attr_dev(img12, "alt", "");
    			attr_dev(img12, "class", "placeholderimage");
    			add_location(img12, file, 269, 18, 9520);
    			attr_dev(div58, "id", "platformAddressLogo");
    			attr_dev(div58, "class", "buttondisk");
    			add_location(div58, file, 268, 16, 9452);
    			attr_dev(div59, "class", "textlightmode");
    			add_location(div59, file, 277, 16, 9842);
    			attr_dev(div60, "class", "dropdown-toggle addresses w-dropdown-toggle");
    			add_location(div60, file, 266, 14, 9303);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "id", "accItem-01");
    			attr_dev(a3, "class", "dropdownitem w-dropdown-link");
    			add_location(a3, file, 280, 16, 9985);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "id", "accItem-02");
    			attr_dev(a4, "class", "dropdownitem w-dropdown-link");
    			add_location(a4, file, 286, 16, 10174);
    			attr_dev(nav1, "class", "dropdown-list w-dropdown-list");
    			add_location(nav1, file, 279, 14, 9925);
    			attr_dev(div61, "data-hover", "");
    			attr_dev(div61, "data-delay", "0");
    			attr_dev(div61, "class", "adressdropdown w-dropdown");
    			add_location(div61, file, 261, 12, 9165);
    			if (img13.src !== (img13_src_value = "images/Network-Dot-Green.svg")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "loading", "lazy");
    			attr_dev(img13, "width", "50");
    			attr_dev(img13, "alt", "");
    			attr_dev(img13, "class", "connectindicator");
    			add_location(img13, file, 294, 12, 10399);
    			attr_dev(div62, "class", "columntitlebar reverse");
    			add_location(div62, file, 259, 10, 9066);
    			attr_dev(div63, "id", "userMessagePurpleText");
    			attr_dev(div63, "class", "textdarkmode usermessage");
    			add_location(div63, file, 303, 12, 10674);
    			attr_dev(div64, "id", "userMessagePurple");
    			attr_dev(div64, "class", "usermessagesbar");
    			add_location(div64, file, 302, 10, 10609);
    			attr_dev(div65, "id", "userMessageOrangeText");
    			attr_dev(div65, "class", "textdarkmode usermessage");
    			add_location(div65, file, 311, 12, 10948);
    			attr_dev(div66, "id", "userMessageOrange");
    			attr_dev(div66, "class", "usermessagesbar orange");
    			add_location(div66, file, 310, 10, 10876);
    			attr_dev(h32, "class", "left");
    			add_location(h32, file, 319, 12, 11223);
    			attr_dev(h33, "class", "right");
    			add_location(h33, file, 320, 12, 11271);
    			if (img14.src !== (img14_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "loading", "lazy");
    			attr_dev(img14, "id", "tokenLogoDep01ORG");
    			attr_dev(img14, "alt", "");
    			attr_dev(img14, "class", "placeholderimage");
    			add_location(img14, file, 324, 18, 11468);
    			attr_dev(div67, "id", "platformAddressLogo");
    			attr_dev(div67, "class", "buttondisk");
    			add_location(div67, file, 323, 16, 11400);
    			attr_dev(div68, "id", "tokenSymbolDep01ORG");
    			attr_dev(div68, "class", "textlightmode");
    			add_location(div68, file, 332, 16, 11795);
    			attr_dev(div69, "class", "tokendetails");
    			add_location(div69, file, 322, 14, 11357);
    			set_style(input0, "outline-width", "0");
    			set_style(input0, "color", "#6d6d6d");
    			set_style(input0, "background-color", "transparent");
    			set_style(input0, "padding-left", "10px");
    			set_style(input0, "padding-right", "10px");
    			set_style(input0, "padding-top", "10px");
    			set_style(input0, "padding-bottom", "10px");
    			set_style(input0, "width", "100%");
    			set_style(input0, "height", "40px");
    			set_style(input0, "border-top-style", "solid");
    			set_style(input0, "border-top-width", "0px");
    			set_style(input0, "border-left-style", "solid");
    			set_style(input0, "border-left-width", "0px");
    			set_style(input0, "border-right-style", "solid");
    			set_style(input0, "border-right-width", "0px");
    			set_style(input0, "border-bottom-style", "solid");
    			set_style(input0, "border-bottom-width", "0px");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "maxlength", "3");
    			add_location(input0, file, 341, 16, 12103);
    			attr_dev(div70, "id", "userInputDeposit01DEST");
    			attr_dev(div70, "af-sock", "contentCurrencyInput");
    			attr_dev(div70, "class", "inputtextfield w-embed");
    			add_location(div70, file, 336, 14, 11928);
    			attr_dev(div71, "class", "deposititem");
    			add_location(div71, file, 321, 12, 11317);
    			if (img15.src !== (img15_src_value = "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "loading", "lazy");
    			attr_dev(img15, "id", "tokenLogoLoan01ORG");
    			attr_dev(img15, "alt", "");
    			attr_dev(img15, "class", "placeholderimage");
    			add_location(img15, file, 369, 18, 13171);
    			attr_dev(div72, "id", "platformAddressLogo");
    			attr_dev(div72, "class", "buttondisk reverse");
    			add_location(div72, file, 368, 16, 13095);
    			attr_dev(div73, "id", "tokenSymbolLoan01");
    			attr_dev(div73, "class", "textlightmode");
    			add_location(div73, file, 377, 16, 13499);
    			attr_dev(div74, "class", "tokendetails reverse");
    			add_location(div74, file, 367, 14, 13044);
    			set_style(input1, "outline-width", "0");
    			set_style(input1, "color", "#6d6d6d");
    			set_style(input1, "background-color", "transparent");
    			set_style(input1, "padding-left", "10px");
    			set_style(input1, "padding-right", "10px");
    			set_style(input1, "padding-top", "10px");
    			set_style(input1, "padding-bottom", "10px");
    			set_style(input1, "width", "100%");
    			set_style(input1, "height", "40px");
    			set_style(input1, "border-top-style", "solid");
    			set_style(input1, "border-top-width", "0px");
    			set_style(input1, "border-left-style", "solid");
    			set_style(input1, "border-left-width", "0px");
    			set_style(input1, "border-right-style", "solid");
    			set_style(input1, "border-right-width", "0px");
    			set_style(input1, "border-bottom-style", "solid");
    			set_style(input1, "border-bottom-width", "0px");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "maxlength", "3");
    			add_location(input1, file, 384, 16, 13769);
    			attr_dev(div75, "id", "userInputDeposit01DEST");
    			attr_dev(div75, "af-sock", "contentCurrencyInput");
    			attr_dev(div75, "class", "inputtextfield w-embed");
    			add_location(div75, file, 379, 14, 13594);
    			attr_dev(div76, "class", "loanitem");
    			add_location(div76, file, 366, 12, 13007);
    			attr_dev(div77, "id", "w-node-e2fd51c45bfd-3e5b97ee");
    			attr_dev(div77, "class", "textlightmode rates");
    			add_location(div77, file, 409, 12, 14673);
    			attr_dev(div78, "id", "tokenSymbolDep01ORG");
    			attr_dev(div78, "class", "textlightmode rates");
    			add_location(div78, file, 419, 14, 14955);
    			if (img16.src !== (img16_src_value = "images/Info-Icon.svg")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "loading", "lazy");
    			attr_dev(img16, "alt", "");
    			attr_dev(img16, "class", "infroicon");
    			add_location(img16, file, 422, 14, 15085);
    			attr_dev(div79, "id", "APRLoan01ORG");
    			attr_dev(div79, "class", "ratesinfo w-node-4600669af223-3e5b97ee");
    			add_location(div79, file, 415, 12, 14829);
    			attr_dev(div80, "class", "textlightmode rates");
    			add_location(div80, file, 433, 14, 15395);
    			attr_dev(div81, "id", "APRLoan01ORG");
    			attr_dev(div81, "class", "ratesinfo w-node-56b66b626e79-3e5b97ee");
    			add_location(div81, file, 429, 12, 15269);
    			attr_dev(div82, "id", "tokenSymbolDep01ORG");
    			attr_dev(div82, "class", "textlightmode rates");
    			add_location(div82, file, 439, 14, 15593);
    			if (img17.src !== (img17_src_value = "images/Info-Icon.svg")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "loading", "lazy");
    			attr_dev(img17, "alt", "");
    			attr_dev(img17, "class", "infroicon");
    			add_location(img17, file, 442, 14, 15721);
    			attr_dev(div83, "id", "APRLoan01ORG");
    			attr_dev(div83, "class", "ratesinfo w-node-81b5b1f95777-3e5b97ee");
    			add_location(div83, file, 435, 12, 15467);
    			attr_dev(div84, "id", "gridDeposit");
    			attr_dev(div84, "class", "w-layout-grid griddestination");
    			add_location(div84, file, 318, 10, 11150);
    			attr_dev(div85, "id", "amountDep02ORG");
    			attr_dev(div85, "class", "textlightmode button");
    			add_location(div85, file, 451, 12, 15977);
    			attr_dev(div86, "id", "maxSelect");
    			attr_dev(div86, "class", "secondarybutton");
    			add_location(div86, file, 450, 10, 15920);
    			attr_dev(div87, "id", "userMessagePurpleText");
    			attr_dev(div87, "class", "textlightmode rates");
    			add_location(div87, file, 457, 14, 16230);
    			if (img18.src !== (img18_src_value = "images/Info-Icon.svg")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "loading", "lazy");
    			attr_dev(img18, "alt", "");
    			attr_dev(img18, "class", "infroicon");
    			add_location(img18, file, 460, 14, 16356);
    			attr_dev(div88, "id", "userMessagePurpleText");
    			attr_dev(div88, "class", "textlightmode rates green");
    			add_location(div88, file, 466, 14, 16523);
    			attr_dev(div89, "class", "hfcontents origin new");
    			add_location(div89, file, 456, 12, 16180);
    			attr_dev(div90, "id", "userMessagePurpleText");
    			attr_dev(div90, "class", "textlightmode rates");
    			add_location(div90, file, 474, 14, 16767);
    			if (img19.src !== (img19_src_value = "images/Info-Icon.svg")) attr_dev(img19, "src", img19_src_value);
    			attr_dev(img19, "loading", "lazy");
    			attr_dev(img19, "alt", "");
    			attr_dev(img19, "class", "infroicon");
    			add_location(img19, file, 477, 14, 16891);
    			attr_dev(div91, "id", "userMessagePurpleText");
    			attr_dev(div91, "class", "textlightmode rates green");
    			add_location(div91, file, 483, 14, 17058);
    			attr_dev(div92, "class", "hfcontents destination");
    			add_location(div92, file, 473, 12, 16716);
    			attr_dev(div93, "id", "healthFactorInfoORG");
    			attr_dev(div93, "class", "healthfactorinfo");
    			add_location(div93, file, 455, 10, 16112);
    			attr_dev(div94, "id", "DepositPosition");
    			attr_dev(div94, "class", "columnposition w-col w-col-6 w-col-stack w-col-small-small-stack");
    			add_location(div94, file, 255, 8, 8927);
    			attr_dev(div95, "class", "columnspositions w-row");
    			add_location(div95, file, 55, 6, 1650);
    			attr_dev(div96, "id", "amountDep02ORG");
    			attr_dev(div96, "class", "textlightmode buttodarkmode");
    			add_location(div96, file, 495, 10, 17376);
    			attr_dev(div97, "id", "maxSelect");
    			attr_dev(div97, "class", "mainbutton");
    			add_location(div97, file, 494, 8, 17326);
    			attr_dev(div98, "class", "buttonwrapper");
    			add_location(div98, file, 493, 6, 17290);
    			attr_dev(div99, "class", "sectioncontents");
    			add_location(div99, file, 37, 4, 1114);
    			attr_dev(div100, "class", "sectioncontainer");
    			add_location(div100, file, 25, 2, 826);
    			attr_dev(div101, "class", "headermain");
    			add_location(div101, file, 23, 0, 774);
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
    			append_dev(div1, img0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div101, anchor);
    			append_dev(div101, div100);
    			append_dev(div100, div8);
    			append_dev(div8, div7);
    			append_dev(div7, img1);
    			append_dev(div100, t4);
    			append_dev(div100, div99);
    			append_dev(div99, img2);
    			append_dev(div99, t5);
    			append_dev(div99, h1);
    			append_dev(div99, t7);
    			append_dev(div99, p);
    			append_dev(div99, t9);
    			append_dev(div99, div10);
    			append_dev(div10, div9);
    			append_dev(div99, t11);
    			append_dev(div99, div95);
    			append_dev(div95, div56);
    			append_dev(div56, div16);
    			append_dev(div16, h20);
    			append_dev(div16, t13);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div11);
    			append_dev(div14, t14);
    			append_dev(div14, div12);
    			append_dev(div12, img3);
    			append_dev(div14, t15);
    			append_dev(div14, div13);
    			append_dev(div15, t17);
    			append_dev(div15, nav0);
    			append_dev(nav0, a1);
    			append_dev(nav0, t19);
    			append_dev(nav0, a2);
    			append_dev(div16, t21);
    			append_dev(div16, img4);
    			append_dev(div56, t22);
    			append_dev(div56, div18);
    			append_dev(div18, div17);
    			append_dev(div56, t24);
    			append_dev(div56, div20);
    			append_dev(div20, div19);
    			append_dev(div56, t26);
    			append_dev(div56, div51);
    			append_dev(div51, h30);
    			append_dev(div51, t28);
    			append_dev(div51, h31);
    			append_dev(div51, t30);
    			append_dev(div51, div26);
    			append_dev(div26, div23);
    			append_dev(div23, div21);
    			append_dev(div21, img5);
    			append_dev(div23, t31);
    			append_dev(div23, div22);
    			append_dev(div26, t33);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div51, t35);
    			append_dev(div51, div32);
    			append_dev(div32, div29);
    			append_dev(div29, div27);
    			append_dev(div27, img6);
    			append_dev(div29, t36);
    			append_dev(div29, div28);
    			append_dev(div32, t38);
    			append_dev(div32, div31);
    			append_dev(div31, div30);
    			append_dev(div51, t40);
    			append_dev(div51, div33);
    			append_dev(div51, t42);
    			append_dev(div51, div35);
    			append_dev(div35, div34);
    			append_dev(div35, t44);
    			append_dev(div35, img7);
    			append_dev(div51, t45);
    			append_dev(div51, div41);
    			append_dev(div41, div38);
    			append_dev(div38, div36);
    			append_dev(div36, img8);
    			append_dev(div38, t46);
    			append_dev(div38, div37);
    			append_dev(div41, t48);
    			append_dev(div41, div40);
    			append_dev(div40, div39);
    			append_dev(div51, t50);
    			append_dev(div51, div47);
    			append_dev(div47, div44);
    			append_dev(div44, div42);
    			append_dev(div42, img9);
    			append_dev(div44, t51);
    			append_dev(div44, div43);
    			append_dev(div47, t53);
    			append_dev(div47, div46);
    			append_dev(div46, div45);
    			append_dev(div51, t55);
    			append_dev(div51, div48);
    			append_dev(div51, t57);
    			append_dev(div51, div50);
    			append_dev(div50, div49);
    			append_dev(div50, t59);
    			append_dev(div50, img10);
    			append_dev(div56, t60);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div52);
    			append_dev(div54, t62);
    			append_dev(div54, img11);
    			append_dev(div54, t63);
    			append_dev(div54, div53);
    			append_dev(div95, t65);
    			append_dev(div95, div94);
    			append_dev(div94, div62);
    			append_dev(div62, h21);
    			append_dev(div62, t67);
    			append_dev(div62, div61);
    			append_dev(div61, div60);
    			append_dev(div60, div57);
    			append_dev(div60, t68);
    			append_dev(div60, div58);
    			append_dev(div58, img12);
    			append_dev(div60, t69);
    			append_dev(div60, div59);
    			append_dev(div61, t71);
    			append_dev(div61, nav1);
    			append_dev(nav1, a3);
    			append_dev(nav1, t73);
    			append_dev(nav1, a4);
    			append_dev(div62, t75);
    			append_dev(div62, img13);
    			append_dev(div94, t76);
    			append_dev(div94, div64);
    			append_dev(div64, div63);
    			append_dev(div94, t78);
    			append_dev(div94, div66);
    			append_dev(div66, div65);
    			append_dev(div94, t80);
    			append_dev(div94, div84);
    			append_dev(div84, h32);
    			append_dev(div84, t82);
    			append_dev(div84, h33);
    			append_dev(div84, t84);
    			append_dev(div84, div71);
    			append_dev(div71, div69);
    			append_dev(div69, div67);
    			append_dev(div67, img14);
    			append_dev(div69, t85);
    			append_dev(div69, div68);
    			append_dev(div71, t87);
    			append_dev(div71, div70);
    			append_dev(div70, input0);
    			append_dev(div84, t88);
    			append_dev(div84, div76);
    			append_dev(div76, div74);
    			append_dev(div74, div72);
    			append_dev(div72, img15);
    			append_dev(div74, t89);
    			append_dev(div74, div73);
    			append_dev(div76, t91);
    			append_dev(div76, div75);
    			append_dev(div75, input1);
    			append_dev(div84, t92);
    			append_dev(div84, div77);
    			append_dev(div84, t94);
    			append_dev(div84, div79);
    			append_dev(div79, div78);
    			append_dev(div79, t96);
    			append_dev(div79, img16);
    			append_dev(div84, t97);
    			append_dev(div84, div81);
    			append_dev(div81, div80);
    			append_dev(div84, t99);
    			append_dev(div84, div83);
    			append_dev(div83, div82);
    			append_dev(div83, t101);
    			append_dev(div83, img17);
    			append_dev(div94, t102);
    			append_dev(div94, div86);
    			append_dev(div86, div85);
    			append_dev(div94, t104);
    			append_dev(div94, div93);
    			append_dev(div93, div89);
    			append_dev(div89, div87);
    			append_dev(div89, t106);
    			append_dev(div89, img18);
    			append_dev(div89, t107);
    			append_dev(div89, div88);
    			append_dev(div93, t109);
    			append_dev(div93, div92);
    			append_dev(div92, div90);
    			append_dev(div92, t111);
    			append_dev(div92, img19);
    			append_dev(div92, t112);
    			append_dev(div92, div91);
    			append_dev(div99, t114);
    			append_dev(div99, div98);
    			append_dev(div98, div97);
    			append_dev(div97, div96);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div101);
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
    	validate_slots("flashsuite-position", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<flashsuite-position> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Flashposition extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>.w-layout-grid{display:-ms-grid;display:grid;grid-auto-columns:1fr;-ms-grid-columns:1fr 1fr;grid-template-columns:1fr 1fr;-ms-grid-rows:auto auto;grid-template-rows:auto auto;grid-row-gap:16px;grid-column-gap:16px}h1{margin-top:10px;margin-bottom:10px;font-size:24px;line-height:32px;font-weight:800}h2{margin-top:0px;margin-bottom:0px;padding-right:0px;padding-left:10px;-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center;font-size:20px;line-height:28px;font-weight:900}h3{margin-top:20px;margin-bottom:10px;font-size:16px;line-height:30px;font-weight:700;text-align:right}p{display:block;max-width:none;margin:10px 0px;padding-left:0px;-webkit-align-self:auto;-ms-flex-item-align:auto;-ms-grid-row-align:auto;align-self:auto;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto;text-align:left}a{text-decoration:underline}.headermain{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:100vh;margin-bottom:0px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-image:url('../images/Synth-BG-Header-Hi.png');background-position:50% 50%;background-size:cover;background-repeat:no-repeat;background-attachment:fixed}.textdarkmode{margin-top:0px;margin-bottom:0px;color:#ffe6fc}.textdarkmode.usermessage{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;color:#fff;font-size:14px;font-weight:700}.textdarkmode.button{color:#fff;font-weight:700}.headerbutton{overflow:hidden;width:100%;max-width:200px;min-height:auto;min-width:auto;padding:0px;-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center;border-style:solid;border-width:2px;border-color:#fff;border-radius:50px;background-color:transparent}.frostedglasswrapper{position:static;left:auto;top:0%;right:0%;bottom:0%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;overflow:hidden;height:45px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;border-radius:30px}.frostedglasswrapper.left{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start}.frostedglasseffect{width:100%;height:100%;background-color:transparent;background-image:-webkit-gradient(linear, left top, left bottom, from(rgba(246, 202, 255, 0.23)), to(rgba(246, 202, 255, 0.23))), url('../images/Synth-BG-Header-Hi.png');background-image:linear-gradient(180deg, rgba(246, 202, 255, 0.23), rgba(246, 202, 255, 0.23)), url('../images/Synth-BG-Header-Hi.png');background-position:0px 0px, 50% 50%;background-size:auto, cover;background-repeat:repeat, no-repeat;background-attachment:scroll, fixed;-webkit-filter:blur(3px);filter:blur(3px)}.flashlogo{position:static;top:44px;z-index:1}.blockimage{position:absolute;z-index:1;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.nnavbarcontents{position:fixed;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;max-width:1400px;margin-right:0px;margin-left:0px;padding-right:140px;padding-left:140px;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:stretch;-ms-flex-item-align:stretch;align-self:stretch;-webkit-box-flex:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto}.nnavbar{position:absolute;left:0%;top:6%;right:0%;bottom:auto;z-index:2;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;height:55px;padding-bottom:0px;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-color:transparent;box-shadow:none}.buttondisk{position:static;top:-0.8333px;right:157.5417px;width:45px;height:45px;margin-right:10px;padding-left:0px;border-radius:50px;background-color:#f0f0f0}.buttondisk.reverse{margin-right:0px;margin-left:10px}.arrow{color:#ebebeb}.arrow.lightmode{color:#241130}.dropdown-toggle{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:45px;min-width:150px;padding:0px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;border-style:solid;border-width:2px;border-color:#fdfdfd;border-radius:50px}.dropdown-toggle.addresses{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;border-color:#f2def5}.sectioncontainer{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;overflow:scroll;width:100%;height:100vh;max-width:1400px;margin:60px 0px 0px;padding-right:0px;padding-bottom:0px;padding-left:0px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center;border-radius:20px;background-color:#fff}.sectionbumper{position:relative;z-index:1;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;height:15vh;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;border:2px solid #f2def5;border-radius:20px;background-image:-webkit-gradient(linear, left top, left bottom, from(rgba(106, 20, 127, 0.95)), to(rgba(242, 222, 245, 0)));background-image:linear-gradient(180deg, rgba(106, 20, 127, 0.95), rgba(242, 222, 245, 0))}.sectionlogoimage{margin:10px}.sectioncontents{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;overflow:scroll;width:100%;height:100%;padding-top:230px;padding-right:100px;padding-left:100px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.columnspositions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start}.columnposition{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;height:100%;padding:10px 0px;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:stretch;-webkit-align-items:stretch;-ms-flex-align:stretch;align-items:stretch;border:2px solid #f2def5;border-radius:20px;background-color:transparent}.columntitlebar{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;padding:10px;-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.columntitlebar.reverse{-webkit-box-orient:horizontal;-webkit-box-direction:reverse;-webkit-flex-direction:row-reverse;-ms-flex-direction:row-reverse;flex-direction:row-reverse}.adressdropdown{width:60%;margin-right:0px;margin-left:0px}.textlightmode{margin-top:0px;margin-bottom:0px;color:#241130}.textlightmode.numbers{font-weight:700}.textlightmode.rates{padding-right:0px;padding-left:0px;color:rgba(36, 17, 48, 0.5);font-size:12px;font-weight:700;text-align:right}.textlightmode.rates.green{padding-right:5px;padding-left:5px;color:#03ac1c}.textlightmode.button{font-size:14px;font-weight:700}.textlightmode.buttodarkmode{color:#fff;font-size:14px;font-weight:700}.blockcontents{position:absolute;z-index:1;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.dropdown-list{border-bottom-right-radius:20px}.dropdownitem{border-radius:20px;font-weight:400}.placeholderimage{width:100%;overflow:hidden;border-radius:30px}.connectindicator{max-width:none;-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto}.usermessagesbar{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;padding:0px 10px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-color:#8a4cc6}.usermessagesbar.orange{display:none;background-color:#d17038}.gridorigin{margin-top:10px;margin-bottom:10px;padding-right:10px;padding-left:10px;-webkit-box-pack:stretch;-webkit-justify-content:stretch;-ms-flex-pack:stretch;justify-content:stretch;grid-column-gap:10px;grid-row-gap:0px;grid-template-areas:"Deposit-Ttile-Origin Loan-Title-Origin"
        "Deposit-Item-01 Loan-Item-01"
        "Empty-area APR-Rate-Info-Loan-01"
        "Deposit-Item-02 Loan-item-02"
        "Empty-Area APR-Rate-Info-Loan-02";-ms-grid-rows:auto 0px auto 0px minmax(15px, 1fr) 0px auto 0px minmax(15px, 1fr);grid-template-rows:auto auto minmax(15px, 1fr) auto minmax(15px, 1fr)}.right{margin-top:0px;margin-bottom:0px}.left{margin-top:0px;margin-bottom:0px;text-align:left}.deposititem{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;padding:5px;border-radius:10px;background-color:#f9f5ff}.tokendetails{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:50%;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.tokendetails.reverse{-webkit-box-orient:horizontal;-webkit-box-direction:reverse;-webkit-flex-direction:row-reverse;-ms-flex-direction:row-reverse;flex-direction:row-reverse}.readonlyfield{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:50%;padding:5px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.loanitem{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;padding:5px;-webkit-box-orient:horizontal;-webkit-box-direction:reverse;-webkit-flex-direction:row-reverse;-ms-flex-direction:row-reverse;flex-direction:row-reverse;border-radius:10px;background-color:#f8f7f8}.griddestination{margin-top:10px;margin-bottom:10px;padding-right:10px;padding-left:10px;-webkit-box-pack:stretch;-webkit-justify-content:stretch;-ms-flex-pack:stretch;justify-content:stretch;grid-column-gap:10px;grid-row-gap:0px;grid-template-areas:"Deposit-Ttile-Origin Loan-Title-Origin"
        "Deposit-Item-01 Loan-Item-01"
        "Empty-area APR-Rate-Info-Loan-01"
        "Deposit-Item-02 Loan-item-02"
        "Empty-Area APR-Rate-Info-Loan-02";-ms-grid-rows:auto 0px auto 0px minmax(15px, 1fr) 0px auto 0px minmax(15px, 1fr);grid-template-rows:auto auto minmax(15px, 1fr) auto minmax(15px, 1fr)}.inputtextfield{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;overflow:hidden;width:60%;margin-top:0px;padding-left:0px;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center;border:2px solid #460456;border-radius:10px;-webkit-transition:all 200ms ease;transition:all 200ms ease}.inputtextfield:hover{border-style:solid;border-width:1px;border-color:#6d6d6d;background-color:transparent}.inputtextfield:active{border-style:solid;border-width:1px;border-color:#6d6d6d}.inputtextfield:focus{border-color:#6d6d6d}.ratesinfo{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.infroicon{height:30px}.secondarybutton{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:55px;max-width:250px;min-width:100px;margin-right:10px;padding-right:20px;padding-left:20px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:flex-end;-ms-flex-item-align:end;align-self:flex-end;border:2px solid #f2def5;border-radius:30px;background-color:#fff}.secondarybutton:hover{background-color:#f2def5}.chipflashpos{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:55px;max-width:250px;min-width:100px;margin-right:10px;margin-bottom:20px;padding-right:20px;padding-left:20px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center;border:2px solid #f2def5;border-radius:30px;background-color:#a04bce}.paragraph{margin-bottom:20px}.mainbutton{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:55px;max-width:250px;min-width:100px;margin-right:10px;padding-right:20px;padding-left:20px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center;border:2px solid #ce80d9;border-radius:30px;background-color:#7f2fff;color:#fff}.mainbutton:hover{background-color:#3f0454}.buttonwrapper{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;padding-top:40px;padding-bottom:40px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.healthfactorinfo{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:30px;margin-top:10px;margin-bottom:10px;padding:0px 10px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-color:transparent}.hfcontents{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}@media screen and (min-width: 1920px){h1{font-size:30px;line-height:40px}h2{font-size:24px}p{margin-top:10px;margin-bottom:20px;font-size:22px;line-height:28px}.textdarkmode{font-size:22px;line-height:32px}.textdarkmode.button{font-size:20px;line-height:24px}.headerbutton{max-width:300px;min-width:100px;margin-right:0px}.frostedglasswrapper{height:55px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.flashlogo{min-width:120%}.blockimage{-webkit-align-self:auto;-ms-flex-item-align:auto;-ms-grid-row-align:auto;align-self:auto;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto}.nnavbarcontents{padding-right:0px;padding-left:0px;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end}.buttondisk{top:0px;right:225.5417px;width:55px;height:55px}.dropdown-toggle{height:55px}.sectioncontainer{height:auto}.sectionbumper{height:10vh}.sectionlogoimage{max-width:120%;min-width:250px}.sectioncontents{height:100%;padding-top:200px}.textlightmode{font-size:20px;line-height:32px}.textlightmode.numbers{font-size:20px}.textlightmode.rates{font-size:14px}.textlightmode.button{font-size:20px}.textlightmode.buttodarkmode{font-size:20px}.blockcontents{-webkit-align-self:auto;-ms-flex-item-align:auto;-ms-grid-row-align:auto;align-self:auto;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto}.right{font-size:20px}.left{font-size:20px}.griddestination{grid-template-areas:"Deposit-Ttile-Origin Loan-Title-Origin"
          "Deposit-Item-01 Loan-Item-01"
          "Empty-area APR-Rate-Info-Loan-01"
          "Area-2 Area";-ms-grid-rows:auto auto minmax(15px, 1fr) minmax(20px, 1fr);grid-template-rows:auto auto minmax(15px, 1fr) minmax(20px, 1fr)}.inputtextfield{border:2px solid #460456;border-radius:10px}.ratesinfo{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.secondarybutton{height:60px;border:2px solid #f2def5;border-radius:30px;background-color:#fff}.chipflashpos{height:40px;margin-bottom:20px;padding-top:10px;padding-bottom:10px;-webkit-box-flex:0;-webkit-flex:0 auto;-ms-flex:0 auto;flex:0 auto;border:2px solid #f2def5;border-radius:30px;background-color:#a04bce}.paragraph{font-size:20px}.mainbutton{height:60px;border:2px solid #f2def5;border-radius:30px;background-color:#7f2fff}.healthfactorinfo{-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end}}@media screen and (max-width: 991px){p{text-align:center}.nnavbarcontents{margin-right:40px;margin-left:40px}.sectioncontents{height:100%;margin-top:0px;padding-top:419px;padding-right:20px;padding-left:20px}.columnspositions{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}}@media screen and (max-width: 767px){.headerbutton{max-width:125px;min-width:125px}.flashlogo{max-width:80%}.columnspositions{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column}}@media screen and (max-width: 479px){.nnavbarcontents{margin-right:20px;margin-left:20px}}@media screen and (min-width: 1920px){#APRLoan01ORG.w-node-9c5920cd5a3d-3e5b97ee{-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}#APRLoan01ORG.w-node-6a861f31309d-3e5b97ee{-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}#w-node-e2fd51c45bfd-3e5b97ee{-ms-grid-row:5;-ms-grid-column:1;grid-area:Empty-area}.griddestination>#w-node-e2fd51c45bfd-3e5b97ee{-ms-grid-row:5;-ms-grid-column:1}@media screen and (min-width: 1920px){.griddestination>#w-node-e2fd51c45bfd-3e5b97ee{-ms-grid-row:3;-ms-grid-column:1}}#APRLoan01ORG.w-node-4600669af223-3e5b97ee{-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}#APRLoan01ORG.w-node-56b66b626e79-3e5b97ee{-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}#APRLoan01ORG.w-node-81b5b1f95777-3e5b97ee{-webkit-align-self:center;-ms-flex-item-align:center;-ms-grid-row-align:center;align-self:center}}</style>`;

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

    customElements.define("flashsuite-position", Flashposition);

    return Flashposition;

}());
//# sourceMappingURL=flashposition.js.map
