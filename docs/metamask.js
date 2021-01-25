
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
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
    function children(element) {
        return Array.from(element.childNodes);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    /* svelte/metamask.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file = "svelte/metamask.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let hr0;
    	let t2;
    	let h20;
    	let t4;
    	let hr1;
    	let t5;
    	let h21;
    	let t7;
    	let hr2;
    	let t8;
    	let small;
    	let br0;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let br1;
    	let t14;
    	let t15;
    	let t16;
    	let br2;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let hr3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "FlashSuite - AAVE Dashboard";
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "Deposits";
    			t4 = space();
    			hr1 = element("hr");
    			t5 = space();
    			h21 = element("h2");
    			h21.textContent = "Borrows";
    			t7 = space();
    			hr2 = element("hr");
    			t8 = space();
    			small = element("small");
    			br0 = element("br");
    			t9 = text("network: ");
    			t10 = text(/*chainId*/ ctx[0]);
    			t11 = text(" \"");
    			t12 = text(/*network*/ ctx[1]);
    			t13 = text("\"\n    ");
    			br1 = element("br");
    			t14 = text("address: ");
    			t15 = text(/*address*/ ctx[2]);
    			t16 = space();
    			br2 = element("br");
    			t17 = text("balance: ");
    			t18 = text(/*balance*/ ctx[3]);
    			t19 = text(" ETH");
    			t20 = space();
    			hr3 = element("hr");
    			this.c = noop;
    			add_location(h1, file, 76, 2, 1745);
    			add_location(hr0, file, 77, 2, 1784);
    			add_location(h20, file, 78, 2, 1792);
    			add_location(hr1, file, 79, 2, 1812);
    			add_location(h21, file, 80, 2, 1820);
    			add_location(hr2, file, 81, 2, 1839);
    			add_location(br0, file, 83, 4, 1859);
    			add_location(br1, file, 84, 4, 1899);
    			add_location(br2, file, 85, 4, 1927);
    			add_location(small, file, 82, 2, 1847);
    			add_location(hr3, file, 87, 2, 1969);
    			add_location(main, file, 75, 0, 1736);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, hr0);
    			append_dev(main, t2);
    			append_dev(main, h20);
    			append_dev(main, t4);
    			append_dev(main, hr1);
    			append_dev(main, t5);
    			append_dev(main, h21);
    			append_dev(main, t7);
    			append_dev(main, hr2);
    			append_dev(main, t8);
    			append_dev(main, small);
    			append_dev(small, br0);
    			append_dev(small, t9);
    			append_dev(small, t10);
    			append_dev(small, t11);
    			append_dev(small, t12);
    			append_dev(small, t13);
    			append_dev(small, br1);
    			append_dev(small, t14);
    			append_dev(small, t15);
    			append_dev(small, t16);
    			append_dev(small, br2);
    			append_dev(small, t17);
    			append_dev(small, t18);
    			append_dev(small, t19);
    			append_dev(main, t20);
    			append_dev(main, hr3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chainId*/ 1) set_data_dev(t10, /*chainId*/ ctx[0]);
    			if (dirty & /*network*/ 2) set_data_dev(t12, /*network*/ ctx[1]);
    			if (dirty & /*address*/ 4) set_data_dev(t15, /*address*/ ctx[2]);
    			if (dirty & /*balance*/ 8) set_data_dev(t18, /*balance*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function _networkGet(chainId) {
    	const networks = new Map([[1, "mainnet"], [3, "ropsten"], [4, "rinkeby"], [5, "goerli"], [42, "kovan"]]);
    	return networks.get(Number(chainId));
    }

    function _log(bal) {
    	return (bal / 10 ** 18).toString();
    }

    function _alertKovan() {
    	alert("FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet");
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("svelte-metamask", slots, []);
    	const eth = window.ethereum;

    	if (eth) {
    		eth.enable();
    	} else {
    		alert("Install Metamask");
    	}

    	// init + onChainChanged => chainId => network + onAccountChanged => accounts => address => balance
    	// init => chainId
    	let chainId = eth.chainId;

    	if (chainId && chainId != 42) _alertKovan();

    	// onChainChanged => chainId
    	eth.on("chainChanged", chainIdChanged => {
    		$$invalidate(0, chainId = chainIdChanged);
    		if (chainId != 42) _alertKovan();
    	});

    	// chainId => network
    	let network = "";

    	// network => accounts
    	let accounts;

    	ethereum.request({ method: "eth_requestAccounts" }).then(res => {
    		$$invalidate(4, accounts = res);
    	});

    	// onAccountChanged => accounts
    	eth.on("accountsChanged", accountsChanged => {
    		$$invalidate(4, accounts = accountsChanged);
    	});

    	// accounts => address
    	let address = "";

    	// address => balance
    	let balance = 0;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<svelte-metamask> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		_networkGet,
    		_log,
    		_alertKovan,
    		eth,
    		chainId,
    		network,
    		accounts,
    		address,
    		balance
    	});

    	$$self.$inject_state = $$props => {
    		if ("chainId" in $$props) $$invalidate(0, chainId = $$props.chainId);
    		if ("network" in $$props) $$invalidate(1, network = $$props.network);
    		if ("accounts" in $$props) $$invalidate(4, accounts = $$props.accounts);
    		if ("address" in $$props) $$invalidate(2, address = $$props.address);
    		if ("balance" in $$props) $$invalidate(3, balance = $$props.balance);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*chainId*/ 1) {
    			 $$invalidate(1, network = _networkGet(chainId));
    		}

    		if ($$self.$$.dirty & /*accounts*/ 16) {
    			 $$invalidate(2, address = accounts && accounts[0]);
    		}

    		if ($$self.$$.dirty & /*chainId, address*/ 5) {
    			 if (chainId && address) {
    				ethereum.request({
    					method: "eth_getBalance",
    					params: [address, "latest"]
    				}).then(bal => {
    					$$invalidate(3, balance = (bal / 10 ** 18).toString());
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*chainId, network, address, balance*/ 15) {
    			// logs
    			 console.log(chainId, network, address, balance);
    		}
    	};

    	return [chainId, network, address, balance, accounts];
    }

    class Metamask extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>main{padding:1em;max-width:240px;margin:0 auto}h1{color:#ff3e00;text-transform:uppercase;font-size:4em;font-weight:100}@media(min-width: 640px){main{max-width:none}}</style>`;

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

    customElements.define("svelte-metamask", Metamask);

}());
//# sourceMappingURL=metamask.js.map
