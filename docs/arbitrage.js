
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    const MAINNET_ENDPOINT = "https://api.0x.org";
    const KOVAN_ENDPOINT =	"https://kovan.api.0x.org";

    /*
    0: {name: "0x", proportion: "0"}
    1: {name: "Uniswap", proportion: "0"}             Works
    2: {name: "Uniswap_V2", proportion: "0"}          Works
    3: {name: "Eth2Dai", proportion: "0"}             
    4: {name: "Kyber", proportion: "0"}               Works
    5: {name: "Curve", proportion: "0"}               
    6: {name: "LiquidityProvider", proportion: "0"} 
    7: {name: "MultiBridge", proportion: "0"}
    8: {name: "Balancer", proportion: "0"}            Works
    9: {name: "CREAM", proportion: "0"}
    10: {name: "Bancor", proportion: "0"}             Works
    11: {name: "mStable", proportion: "0"}
    12: {name: "Mooniswap", proportion: "0"}
    13: {name: "MultiHop", proportion: "0"}
    14: {name: "Shell", proportion: "0"}
    15: {name: "Swerve", proportion: "0"}
    16: {name: "SnowSwap", proportion: "0"}
    17: {name: "SushiSwap", proportion: "1"}          Works
    18: {name: "DODO", proportion: "0"}
    19: {name: "CryptoCom", proportion: "0"}          Works
    */

    async function get0xPairPrice({asset1 = 'DAI', asset2 = 'WETH', amount = '1000000000000000000',  network = 'mainnet', _selectedExchange}) {
      let arrayEx = ["0x", "Uniswap", "Uniswap_V2", "Eth2Dai", "Kyber", "Curve", "LiquidityProvider", "MultiBridge", "Balancer", "CREAM", "Bancor", "mStable", "Mooniswap", "MultiHop", "Shell", "Swerve", "SnowSwap","SushiSwap", "DODO", "CryptoCom"]; 

      // Filtering out the exchange we want to make sure our data comes from that exchange
      let filteredAryEx = arrayEx.filter(function(e) {return e !== _selectedExchange});
      
      console.log(filteredAryEx);

      const endpoint = network === 'mainnet' ? MAINNET_ENDPOINT : KOVAN_ENDPOINT;
      
      const withoutEx = filteredAryEx.toString();

      const params = {
        buyToken: asset1,
        sellToken: asset2,
        sellAmount: amount,
        excludedSources: withoutEx
      };

      const response = await fetch(`${endpoint}/swap/v1/price?` + new URLSearchParams(params));
      const data = await response.json();
      const price = data.price;
      console.log('data', data);
      console.log('price', price);

      return price;
    }

    async function getPriceData({ pair }) {
      const uniswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Uniswap_V2"});
      const sushiswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "SushiSwap"});
      const balancerPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Balancer"});
      const bancorPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Bancor"});
      const kyberPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Kyber"});
      const crytpo_comPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "CryptoCom"});
      
      // Direct API's
      // const sushiswapPrice = await getUniswapPairPrice({ "_protocol": "sushiswap", "asset1": pair.asset1, "asset2": pair.asset2 });
      // const uniswapPrice = await getUniswapPairPrice({ "asset1": pair.asset1, "asset2": pair.asset2 });

      const spread = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`;

      console.log("balancerPrice", balancerPrice);

      return {uniswapPrice, sushiswapPrice, balancerPrice, bancorPrice, kyberPrice, crytpo_comPrice, spread};
    }

    // import { BigNumber } from "ethers";


    async function getSpreadData() {
      const data = await getPriceData({pair: selectedPair});
      uniswapPrice = data.uniswapPrice;
      sushiswapPrice = data.sushiswapPrice;
      balancerPrice = data.balancerPrice;
      bancorPrice = data.bancorPrice;
      kyberPrice = data.kyberPrice;
      // crypto_comPrice = data.crytpo_comPrice;

      //Uni-Sushi
      const uniSushi = `${(uniswapPrice / sushiswapPrice - 1) * 100}%`;
      const sushiUni = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`;

      //Uni-Balancer
      const uniBalancer = `${(uniswapPrice / balancerPrice - 1) * 100}%`;
      const balancerUni = `${(balancerPrice / uniswapPrice - 1) * 100}%`;

      //Uni-Bancor
      const uniBancor = `${(uniswapPrice / bancorPrice - 1) * 100}%`;
      const bancorUni = `${(bancorPrice / uniswapPrice - 1) * 100}%`;

      //Uni-Kyber
      const uniKyber = `${(uniswapPrice / kyberPrice - 1) * 100}%`;
      const kyberUni = `${(kyberPrice / uniswapPrice - 1) * 100}%`;

      //Sushi-Balancer
      const sushiBalancer = `${(sushiswapPrice / balancerPrice - 1) * 100}%`;
      const balancerSushi = `${(balancerPrice / sushiswapPrice - 1) * 100}%`;

      //Sushi-Bancor
      const sushiBancor = `${(sushiswapPrice / bancorPrice - 1) * 100}%`;
      const bancorSushi = `${(bancorPrice / sushiswapPrice - 1) * 100}%`;

      //Sushi-Kyber
      const sushiKyber = `${(sushiswapPrice / kyberPrice - 1) * 100}%`;
      const kyberSushi = `${(kyberPrice / sushiswapPrice - 1) * 100}%`;

      //Balancer-Bancor
      const balancerBancor = `${(balancerPrice / bancorPrice - 1) * 100}%`;
      const bancorBalancer = `${(bancorPrice / balancerPrice - 1) * 100}%`;

      //Balancer-Kyber
      const balancerKyber = `${(balancerPrice / kyberPrice - 1) * 100}%`;
      const kyberBalancer = `${(kyberPrice / balancerPrice - 1) * 100}%`;

      //Bancor-Kyber
      const bancorKyber = `${(bancorPrice / kyberPrice - 1) * 100}%`;
      const kyberBancor = `${(kyberPrice / bancorPrice - 1) * 100}%`;


      console.log("uniSushi", uniSushi);

      return {uniSushi, sushiUni, uniBalancer, balancerUni, uniBancor, bancorUni, uniKyber, kyberUni, sushiBalancer, balancerSushi, sushiBancor, bancorSushi, sushiKyber, kyberSushi, balancerBancor, bancorBalancer, balancerKyber, kyberBalancer, bancorKyber, kyberBancor};
    }

    /* svelte\arbitrage.svelte generated by Svelte v3.32.0 */

    const { console: console_1 } = globals;
    const file = "svelte\\arbitrage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    // (79:2) {#each pairs as pair}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*pair*/ ctx[33].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*pair*/ ctx[33];
    			option.value = option.__value;
    			add_location(option, file, 79, 4, 2976);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(79:2) {#each pairs as pair}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:options tag="flashsuite-arbitrage" immutable={true}
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <svelte:options tag=\\\"flashsuite-arbitrage\\\" immutable={true}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {:then}
    function create_then_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(88:0) {:then}",
    		ctx
    	});

    	return block;
    }

    // (91:2) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let t0;
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4;
    	let t5;
    	let p2;
    	let t6;
    	let t7;
    	let t8;
    	let p3;
    	let t9;
    	let t10;
    	let t11;
    	let p4;
    	let t12;
    	let t13;
    	let t14;
    	let p5;
    	let t15;
    	let t16;
    	let t17;
    	let p6;
    	let t18;
    	let t19;
    	let t20;
    	let p7;
    	let t21;
    	let t22;
    	let t23;
    	let p8;
    	let t24;
    	let t25;
    	let t26;
    	let p9;
    	let t27;
    	let t28;
    	let t29;
    	let p10;
    	let t30;
    	let t31;
    	let t32;
    	let p11;
    	let t33;
    	let t34;
    	let t35;
    	let p12;
    	let t36;
    	let t37;
    	let t38;
    	let p13;
    	let t39;
    	let t40;
    	let t41;
    	let p14;
    	let t42;
    	let t43;
    	let t44;
    	let p15;
    	let t45;
    	let t46;
    	let t47;
    	let p16;
    	let t48;
    	let t49;
    	let t50;
    	let p17;
    	let t51;
    	let t52;
    	let t53;
    	let p18;
    	let t54;
    	let t55;
    	let t56;
    	let p19;
    	let t57;
    	let t58;
    	let t59;
    	let p20;
    	let t60;
    	let t61;
    	let t62;
    	let p21;
    	let t63;
    	let t64;
    	let t65;
    	let p22;
    	let t66;
    	let t67;
    	let t68;
    	let p23;
    	let t69;
    	let t70;
    	let t71;
    	let p24;
    	let t72;
    	let t73;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Price from Uniswap is ");
    			t1 = text(/*uniswapPrice*/ ctx[1]);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("Price from SushiSwap is ");
    			t4 = text(/*sushiswapPrice*/ ctx[2]);
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Price from Balancer is ");
    			t7 = text(/*balancerPrice*/ ctx[3]);
    			t8 = space();
    			p3 = element("p");
    			t9 = text("Price from Bancor is ");
    			t10 = text(/*bancorPrice*/ ctx[4]);
    			t11 = space();
    			p4 = element("p");
    			t12 = text("Price from Kyber is ");
    			t13 = text(/*kyberPrice*/ ctx[5]);
    			t14 = space();
    			p5 = element("p");
    			t15 = text("Spread of Uni to Sushi is: ");
    			t16 = text(/*uniSushi*/ ctx[6]);
    			t17 = space();
    			p6 = element("p");
    			t18 = text("Spread of Uni to Balancer is: ");
    			t19 = text(/*uniBalancer*/ ctx[8]);
    			t20 = space();
    			p7 = element("p");
    			t21 = text("Spread of Uni to Bancor is: ");
    			t22 = text(/*uniBancor*/ ctx[10]);
    			t23 = space();
    			p8 = element("p");
    			t24 = text("Spread of Uni to Kyber is: ");
    			t25 = text(/*uniKyber*/ ctx[12]);
    			t26 = space();
    			p9 = element("p");
    			t27 = text("Spread of Sushi to Uni is: ");
    			t28 = text(/*sushiUni*/ ctx[7]);
    			t29 = space();
    			p10 = element("p");
    			t30 = text("Spread of Sushi to Balancer is: ");
    			t31 = text(/*sushiBalancer*/ ctx[14]);
    			t32 = space();
    			p11 = element("p");
    			t33 = text("Spread of Sushi to Bancor is: ");
    			t34 = text(/*sushiBancor*/ ctx[16]);
    			t35 = space();
    			p12 = element("p");
    			t36 = text("Spread of Sushi to Kyber is: ");
    			t37 = text(/*sushiKyber*/ ctx[18]);
    			t38 = space();
    			p13 = element("p");
    			t39 = text("Spread of Balancer to Uni is: ");
    			t40 = text(/*balancerUni*/ ctx[9]);
    			t41 = space();
    			p14 = element("p");
    			t42 = text("Spread of Balancer to Sushi is: ");
    			t43 = text(/*balancerSushi*/ ctx[15]);
    			t44 = space();
    			p15 = element("p");
    			t45 = text("Spread of Balancer to Bancor is: ");
    			t46 = text(/*balancerBancor*/ ctx[20]);
    			t47 = space();
    			p16 = element("p");
    			t48 = text("Spread of Balancer to Kyber is: ");
    			t49 = text(/*balancerKyber*/ ctx[22]);
    			t50 = space();
    			p17 = element("p");
    			t51 = text("Spread of Bancor to Uni is: ");
    			t52 = text(/*bancorUni*/ ctx[11]);
    			t53 = space();
    			p18 = element("p");
    			t54 = text("Spread of Bancor to Sushi is: ");
    			t55 = text(/*bancorSushi*/ ctx[17]);
    			t56 = space();
    			p19 = element("p");
    			t57 = text("Spread of Bancor to Balancer is: ");
    			t58 = text(/*bancorBalancer*/ ctx[21]);
    			t59 = space();
    			p20 = element("p");
    			t60 = text("Spread of Bancor to Kyber is: ");
    			t61 = text(/*bancorKyber*/ ctx[24]);
    			t62 = space();
    			p21 = element("p");
    			t63 = text("Spread of Kyber to Uni is: ");
    			t64 = text(/*kyberUni*/ ctx[13]);
    			t65 = space();
    			p22 = element("p");
    			t66 = text("Spread of Kyber to Sushi is: ");
    			t67 = text(/*kyberSushi*/ ctx[19]);
    			t68 = space();
    			p23 = element("p");
    			t69 = text("Spread of Kyber to Balancer is: ");
    			t70 = text(/*kyberBalancer*/ ctx[23]);
    			t71 = space();
    			p24 = element("p");
    			t72 = text("Spread of Kyber to Bancor is: ");
    			t73 = text(/*kyberBancor*/ ctx[25]);
    			add_location(p0, file, 91, 4, 3159);
    			add_location(p1, file, 92, 4, 3208);
    			add_location(p2, file, 93, 4, 3261);
    			add_location(p3, file, 94, 4, 3312);
    			add_location(p4, file, 95, 4, 3359);
    			add_location(p5, file, 97, 4, 3406);
    			add_location(p6, file, 98, 4, 3456);
    			add_location(p7, file, 99, 4, 3512);
    			add_location(p8, file, 100, 4, 3564);
    			add_location(p9, file, 102, 4, 3620);
    			add_location(p10, file, 103, 4, 3670);
    			add_location(p11, file, 104, 4, 3730);
    			add_location(p12, file, 105, 4, 3786);
    			add_location(p13, file, 107, 4, 3842);
    			add_location(p14, file, 108, 4, 3898);
    			add_location(p15, file, 109, 4, 3958);
    			add_location(p16, file, 110, 4, 4020);
    			add_location(p17, file, 112, 4, 4082);
    			add_location(p18, file, 113, 4, 4134);
    			add_location(p19, file, 114, 4, 4190);
    			add_location(p20, file, 115, 4, 4252);
    			add_location(p21, file, 117, 4, 4310);
    			add_location(p22, file, 118, 4, 4360);
    			add_location(p23, file, 119, 4, 4414);
    			add_location(p24, file, 120, 4, 4474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t9);
    			append_dev(p3, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t12);
    			append_dev(p4, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t15);
    			append_dev(p5, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p6, anchor);
    			append_dev(p6, t18);
    			append_dev(p6, t19);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, p7, anchor);
    			append_dev(p7, t21);
    			append_dev(p7, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p8, anchor);
    			append_dev(p8, t24);
    			append_dev(p8, t25);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, p9, anchor);
    			append_dev(p9, t27);
    			append_dev(p9, t28);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, p10, anchor);
    			append_dev(p10, t30);
    			append_dev(p10, t31);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, p11, anchor);
    			append_dev(p11, t33);
    			append_dev(p11, t34);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, p12, anchor);
    			append_dev(p12, t36);
    			append_dev(p12, t37);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, p13, anchor);
    			append_dev(p13, t39);
    			append_dev(p13, t40);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, p14, anchor);
    			append_dev(p14, t42);
    			append_dev(p14, t43);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, p15, anchor);
    			append_dev(p15, t45);
    			append_dev(p15, t46);
    			insert_dev(target, t47, anchor);
    			insert_dev(target, p16, anchor);
    			append_dev(p16, t48);
    			append_dev(p16, t49);
    			insert_dev(target, t50, anchor);
    			insert_dev(target, p17, anchor);
    			append_dev(p17, t51);
    			append_dev(p17, t52);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, p18, anchor);
    			append_dev(p18, t54);
    			append_dev(p18, t55);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, p19, anchor);
    			append_dev(p19, t57);
    			append_dev(p19, t58);
    			insert_dev(target, t59, anchor);
    			insert_dev(target, p20, anchor);
    			append_dev(p20, t60);
    			append_dev(p20, t61);
    			insert_dev(target, t62, anchor);
    			insert_dev(target, p21, anchor);
    			append_dev(p21, t63);
    			append_dev(p21, t64);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, p22, anchor);
    			append_dev(p22, t66);
    			append_dev(p22, t67);
    			insert_dev(target, t68, anchor);
    			insert_dev(target, p23, anchor);
    			append_dev(p23, t69);
    			append_dev(p23, t70);
    			insert_dev(target, t71, anchor);
    			insert_dev(target, p24, anchor);
    			append_dev(p24, t72);
    			append_dev(p24, t73);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*uniswapPrice*/ 2) set_data_dev(t1, /*uniswapPrice*/ ctx[1]);
    			if (dirty[0] & /*sushiswapPrice*/ 4) set_data_dev(t4, /*sushiswapPrice*/ ctx[2]);
    			if (dirty[0] & /*balancerPrice*/ 8) set_data_dev(t7, /*balancerPrice*/ ctx[3]);
    			if (dirty[0] & /*bancorPrice*/ 16) set_data_dev(t10, /*bancorPrice*/ ctx[4]);
    			if (dirty[0] & /*kyberPrice*/ 32) set_data_dev(t13, /*kyberPrice*/ ctx[5]);
    			if (dirty[0] & /*uniSushi*/ 64) set_data_dev(t16, /*uniSushi*/ ctx[6]);
    			if (dirty[0] & /*uniBalancer*/ 256) set_data_dev(t19, /*uniBalancer*/ ctx[8]);
    			if (dirty[0] & /*uniBancor*/ 1024) set_data_dev(t22, /*uniBancor*/ ctx[10]);
    			if (dirty[0] & /*uniKyber*/ 4096) set_data_dev(t25, /*uniKyber*/ ctx[12]);
    			if (dirty[0] & /*sushiUni*/ 128) set_data_dev(t28, /*sushiUni*/ ctx[7]);
    			if (dirty[0] & /*sushiBalancer*/ 16384) set_data_dev(t31, /*sushiBalancer*/ ctx[14]);
    			if (dirty[0] & /*sushiBancor*/ 65536) set_data_dev(t34, /*sushiBancor*/ ctx[16]);
    			if (dirty[0] & /*sushiKyber*/ 262144) set_data_dev(t37, /*sushiKyber*/ ctx[18]);
    			if (dirty[0] & /*balancerUni*/ 512) set_data_dev(t40, /*balancerUni*/ ctx[9]);
    			if (dirty[0] & /*balancerSushi*/ 32768) set_data_dev(t43, /*balancerSushi*/ ctx[15]);
    			if (dirty[0] & /*balancerBancor*/ 1048576) set_data_dev(t46, /*balancerBancor*/ ctx[20]);
    			if (dirty[0] & /*balancerKyber*/ 4194304) set_data_dev(t49, /*balancerKyber*/ ctx[22]);
    			if (dirty[0] & /*bancorUni*/ 2048) set_data_dev(t52, /*bancorUni*/ ctx[11]);
    			if (dirty[0] & /*bancorSushi*/ 131072) set_data_dev(t55, /*bancorSushi*/ ctx[17]);
    			if (dirty[0] & /*bancorBalancer*/ 2097152) set_data_dev(t58, /*bancorBalancer*/ ctx[21]);
    			if (dirty[0] & /*bancorKyber*/ 16777216) set_data_dev(t61, /*bancorKyber*/ ctx[24]);
    			if (dirty[0] & /*kyberUni*/ 8192) set_data_dev(t64, /*kyberUni*/ ctx[13]);
    			if (dirty[0] & /*kyberSushi*/ 524288) set_data_dev(t67, /*kyberSushi*/ ctx[19]);
    			if (dirty[0] & /*kyberBalancer*/ 8388608) set_data_dev(t70, /*kyberBalancer*/ ctx[23]);
    			if (dirty[0] & /*kyberBancor*/ 33554432) set_data_dev(t73, /*kyberBancor*/ ctx[25]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(p9);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(p10);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(p11);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(p12);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(p13);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(p14);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(p15);
    			if (detaching) detach_dev(t47);
    			if (detaching) detach_dev(p16);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(p17);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(p18);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(p19);
    			if (detaching) detach_dev(t59);
    			if (detaching) detach_dev(p20);
    			if (detaching) detach_dev(t62);
    			if (detaching) detach_dev(p21);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(p22);
    			if (detaching) detach_dev(t68);
    			if (detaching) detach_dev(p23);
    			if (detaching) detach_dev(t71);
    			if (detaching) detach_dev(p24);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(91:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (89:2) {#if loading}
    function create_if_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Fetching";
    			add_location(p, file, 89, 4, 3127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(89:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (86:20)     <p>Loading</p>  {:then}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading";
    			add_location(p, file, 86, 2, 3081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(86:20)     <p>Loading</p>  {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let h1;
    	let t1;
    	let select;
    	let t2;
    	let await_block_anchor;
    	let mounted;
    	let dispose;
    	let each_value = /*pairs*/ ctx[27];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block
    	};

    	handle_promise(/*getPrices*/ ctx[28](), info);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "FlashArb";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			await_block_anchor = empty();
    			info.block.c();
    			this.c = noop;
    			add_location(h1, file, 75, 0, 2814);
    			if (/*selectedPair*/ ctx[26] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[30].call(select));
    			add_location(select, file, 77, 0, 2874);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedPair*/ ctx[26]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[30]),
    					listen_dev(select, "change", /*change_handler*/ ctx[31], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*pairs*/ 134217728) {
    				each_value = /*pairs*/ ctx[27];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*selectedPair, pairs*/ 201326592) {
    				select_option(select, /*selectedPair*/ ctx[26]);
    			}

    			{
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("flashsuite-arbitrage", slots, []);
    	let loading;
    	let uniswapPrice = 0;
    	let sushiswapPrice = 0;
    	let balancerPrice = 0;
    	let bancorPrice = 0;
    	let kyberPrice = 0;
    	let crypto_comPrice = 0;

    	//spreads
    	let uniSushi;

    	let sushiUni;
    	let uniBalancer;
    	let balancerUni;
    	let uniBancor;
    	let bancorUni;
    	let uniKyber;
    	let kyberUni;
    	let sushiBalancer;
    	let balancerSushi;
    	let sushiBancor;
    	let bancorSushi;
    	let sushiKyber;
    	let kyberSushi;
    	let balancerBancor;
    	let bancorBalancer;
    	let balancerKyber;
    	let kyberBalancer;
    	let bancorKyber;
    	let kyberBancor;

    	const pairs = [
    		{
    			id: "DAI_WETH",
    			text: "DAI-WETH",
    			asset1: "DAI",
    			asset2: "WETH"
    		},
    		{
    			id: "USDC_WETH",
    			text: "USDC-WETH",
    			asset1: "USDC",
    			asset2: "WETH"
    		},
    		{
    			id: "USDT_WETH",
    			text: "USDT-WETH",
    			asset1: "USDT",
    			asset2: "WETH"
    		}
    	];

    	let selectedPair = pairs[0];

    	async function getPrices() {
    		console.log("selectedPair", selectedPair);
    		const data = await getPriceData({ pair: selectedPair });
    		$$invalidate(1, uniswapPrice = data.uniswapPrice);
    		$$invalidate(2, sushiswapPrice = data.sushiswapPrice);
    		$$invalidate(3, balancerPrice = data.balancerPrice);
    		$$invalidate(4, bancorPrice = data.bancorPrice);
    		$$invalidate(5, kyberPrice = data.kyberPrice);
    		$$invalidate(6, uniSushi = `${(uniswapPrice / sushiswapPrice - 1) * 100}%`);
    		$$invalidate(7, sushiUni = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`);
    		$$invalidate(8, uniBalancer = `${(uniswapPrice / balancerPrice - 1) * 100}%`);
    		$$invalidate(9, balancerUni = `${(balancerPrice / uniswapPrice - 1) * 100}%`);
    		$$invalidate(10, uniBancor = `${(uniswapPrice / bancorPrice - 1) * 100}%`);
    		$$invalidate(11, bancorUni = `${(bancorPrice / uniswapPrice - 1) * 100}%`);
    		$$invalidate(12, uniKyber = `${(uniswapPrice / kyberPrice - 1) * 100}%`);
    		$$invalidate(13, kyberUni = `${(kyberPrice / uniswapPrice - 1) * 100}%`);
    		$$invalidate(14, sushiBalancer = `${(sushiswapPrice / balancerPrice - 1) * 100}%`);
    		$$invalidate(15, balancerSushi = `${(balancerPrice / sushiswapPrice - 1) * 100}%`);
    		$$invalidate(16, sushiBancor = `${(sushiswapPrice / bancorPrice - 1) * 100}%`);
    		$$invalidate(17, bancorSushi = `${(bancorPrice / sushiswapPrice - 1) * 100}%`);
    		$$invalidate(18, sushiKyber = `${(sushiswapPrice / kyberPrice - 1) * 100}%`);
    		$$invalidate(19, kyberSushi = `${(kyberPrice / sushiswapPrice - 1) * 100}%`);
    		$$invalidate(20, balancerBancor = `${(balancerPrice / bancorPrice - 1) * 100}%`);
    		$$invalidate(21, bancorBalancer = `${(bancorPrice / balancerPrice - 1) * 100}%`);
    		$$invalidate(22, balancerKyber = `${(balancerPrice / kyberPrice - 1) * 100}%`);
    		$$invalidate(23, kyberBalancer = `${(kyberPrice / balancerPrice - 1) * 100}%`);
    		$$invalidate(24, bancorKyber = `${(bancorPrice / kyberPrice - 1) * 100}%`);
    		$$invalidate(25, kyberBancor = `${(kyberPrice / bancorPrice - 1) * 100}%`);
    	}

    	async function onReloadPrices() {
    		$$invalidate(0, loading = true);
    		await getPrices();
    		$$invalidate(0, loading = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<flashsuite-arbitrage> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedPair = select_value(this);
    		$$invalidate(26, selectedPair);
    		$$invalidate(27, pairs);
    	}

    	const change_handler = () => onReloadPrices();

    	$$self.$capture_state = () => ({
    		getPriceData,
    		getSpreadData,
    		loading,
    		uniswapPrice,
    		sushiswapPrice,
    		balancerPrice,
    		bancorPrice,
    		kyberPrice,
    		crypto_comPrice,
    		uniSushi,
    		sushiUni,
    		uniBalancer,
    		balancerUni,
    		uniBancor,
    		bancorUni,
    		uniKyber,
    		kyberUni,
    		sushiBalancer,
    		balancerSushi,
    		sushiBancor,
    		bancorSushi,
    		sushiKyber,
    		kyberSushi,
    		balancerBancor,
    		bancorBalancer,
    		balancerKyber,
    		kyberBalancer,
    		bancorKyber,
    		kyberBancor,
    		pairs,
    		selectedPair,
    		getPrices,
    		onReloadPrices
    	});

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    		if ("uniswapPrice" in $$props) $$invalidate(1, uniswapPrice = $$props.uniswapPrice);
    		if ("sushiswapPrice" in $$props) $$invalidate(2, sushiswapPrice = $$props.sushiswapPrice);
    		if ("balancerPrice" in $$props) $$invalidate(3, balancerPrice = $$props.balancerPrice);
    		if ("bancorPrice" in $$props) $$invalidate(4, bancorPrice = $$props.bancorPrice);
    		if ("kyberPrice" in $$props) $$invalidate(5, kyberPrice = $$props.kyberPrice);
    		if ("crypto_comPrice" in $$props) crypto_comPrice = $$props.crypto_comPrice;
    		if ("uniSushi" in $$props) $$invalidate(6, uniSushi = $$props.uniSushi);
    		if ("sushiUni" in $$props) $$invalidate(7, sushiUni = $$props.sushiUni);
    		if ("uniBalancer" in $$props) $$invalidate(8, uniBalancer = $$props.uniBalancer);
    		if ("balancerUni" in $$props) $$invalidate(9, balancerUni = $$props.balancerUni);
    		if ("uniBancor" in $$props) $$invalidate(10, uniBancor = $$props.uniBancor);
    		if ("bancorUni" in $$props) $$invalidate(11, bancorUni = $$props.bancorUni);
    		if ("uniKyber" in $$props) $$invalidate(12, uniKyber = $$props.uniKyber);
    		if ("kyberUni" in $$props) $$invalidate(13, kyberUni = $$props.kyberUni);
    		if ("sushiBalancer" in $$props) $$invalidate(14, sushiBalancer = $$props.sushiBalancer);
    		if ("balancerSushi" in $$props) $$invalidate(15, balancerSushi = $$props.balancerSushi);
    		if ("sushiBancor" in $$props) $$invalidate(16, sushiBancor = $$props.sushiBancor);
    		if ("bancorSushi" in $$props) $$invalidate(17, bancorSushi = $$props.bancorSushi);
    		if ("sushiKyber" in $$props) $$invalidate(18, sushiKyber = $$props.sushiKyber);
    		if ("kyberSushi" in $$props) $$invalidate(19, kyberSushi = $$props.kyberSushi);
    		if ("balancerBancor" in $$props) $$invalidate(20, balancerBancor = $$props.balancerBancor);
    		if ("bancorBalancer" in $$props) $$invalidate(21, bancorBalancer = $$props.bancorBalancer);
    		if ("balancerKyber" in $$props) $$invalidate(22, balancerKyber = $$props.balancerKyber);
    		if ("kyberBalancer" in $$props) $$invalidate(23, kyberBalancer = $$props.kyberBalancer);
    		if ("bancorKyber" in $$props) $$invalidate(24, bancorKyber = $$props.bancorKyber);
    		if ("kyberBancor" in $$props) $$invalidate(25, kyberBancor = $$props.kyberBancor);
    		if ("selectedPair" in $$props) $$invalidate(26, selectedPair = $$props.selectedPair);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loading,
    		uniswapPrice,
    		sushiswapPrice,
    		balancerPrice,
    		bancorPrice,
    		kyberPrice,
    		uniSushi,
    		sushiUni,
    		uniBalancer,
    		balancerUni,
    		uniBancor,
    		bancorUni,
    		uniKyber,
    		kyberUni,
    		sushiBalancer,
    		balancerSushi,
    		sushiBancor,
    		bancorSushi,
    		sushiKyber,
    		kyberSushi,
    		balancerBancor,
    		bancorBalancer,
    		balancerKyber,
    		kyberBalancer,
    		bancorKyber,
    		kyberBancor,
    		selectedPair,
    		pairs,
    		getPrices,
    		onReloadPrices,
    		select_change_handler,
    		change_handler
    	];
    }

    class Arbitrage extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes)
    			},
    			instance,
    			create_fragment,
    			not_equal,
    			{},
    			[-1, -1]
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("flashsuite-arbitrage", Arbitrage);

    return Arbitrage;

}());
