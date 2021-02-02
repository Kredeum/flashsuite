
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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
        sellToken: asset1,
        buyToken: asset2,
        sellAmount: amount,
        excludedSources: withoutEx
      };

      const response = await fetch(`${endpoint}/swap/v1/price?` + new URLSearchParams(params));
      const data = await response.json();
      const price = data.price;

      return price;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = getCjsExportFromNamespace(_nodeResolve_empty$1);

    var bn = createCommonjsModule(function (module) {
    (function (module, exports) {

      // Utils
      function assert (val, msg) {
        if (!val) throw new Error(msg || 'Assertion failed');
      }

      // Could use `inherits` module, but don't want to move from single file
      // architecture yet.
      function inherits (ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }

      // BN

      function BN (number, base, endian) {
        if (BN.isBN(number)) {
          return number;
        }

        this.negative = 0;
        this.words = null;
        this.length = 0;

        // Reduction context
        this.red = null;

        if (number !== null) {
          if (base === 'le' || base === 'be') {
            endian = base;
            base = 10;
          }

          this._init(number || 0, base || 10, endian || 'be');
        }
      }
      if (typeof module === 'object') {
        module.exports = BN;
      } else {
        exports.BN = BN;
      }

      BN.BN = BN;
      BN.wordSize = 26;

      var Buffer;
      try {
        Buffer = require$$0.Buffer;
      } catch (e) {
      }

      BN.isBN = function isBN (num) {
        if (num instanceof BN) {
          return true;
        }

        return num !== null && typeof num === 'object' &&
          num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      };

      BN.max = function max (left, right) {
        if (left.cmp(right) > 0) return left;
        return right;
      };

      BN.min = function min (left, right) {
        if (left.cmp(right) < 0) return left;
        return right;
      };

      BN.prototype._init = function init (number, base, endian) {
        if (typeof number === 'number') {
          return this._initNumber(number, base, endian);
        }

        if (typeof number === 'object') {
          return this._initArray(number, base, endian);
        }

        if (base === 'hex') {
          base = 16;
        }
        assert(base === (base | 0) && base >= 2 && base <= 36);

        number = number.toString().replace(/\s+/g, '');
        var start = 0;
        if (number[0] === '-') {
          start++;
        }

        if (base === 16) {
          this._parseHex(number, start);
        } else {
          this._parseBase(number, base, start);
        }

        if (number[0] === '-') {
          this.negative = 1;
        }

        this.strip();

        if (endian !== 'le') return;

        this._initArray(this.toArray(), base, endian);
      };

      BN.prototype._initNumber = function _initNumber (number, base, endian) {
        if (number < 0) {
          this.negative = 1;
          number = -number;
        }
        if (number < 0x4000000) {
          this.words = [ number & 0x3ffffff ];
          this.length = 1;
        } else if (number < 0x10000000000000) {
          this.words = [
            number & 0x3ffffff,
            (number / 0x4000000) & 0x3ffffff
          ];
          this.length = 2;
        } else {
          assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
          this.words = [
            number & 0x3ffffff,
            (number / 0x4000000) & 0x3ffffff,
            1
          ];
          this.length = 3;
        }

        if (endian !== 'le') return;

        // Reverse the bytes
        this._initArray(this.toArray(), base, endian);
      };

      BN.prototype._initArray = function _initArray (number, base, endian) {
        // Perhaps a Uint8Array
        assert(typeof number.length === 'number');
        if (number.length <= 0) {
          this.words = [ 0 ];
          this.length = 1;
          return this;
        }

        this.length = Math.ceil(number.length / 3);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }

        var j, w;
        var off = 0;
        if (endian === 'be') {
          for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
            w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
            this.words[j] |= (w << off) & 0x3ffffff;
            this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        } else if (endian === 'le') {
          for (i = 0, j = 0; i < number.length; i += 3) {
            w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
            this.words[j] |= (w << off) & 0x3ffffff;
            this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        }
        return this.strip();
      };

      function parseHex (str, start, end) {
        var r = 0;
        var len = Math.min(str.length, end);
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48;

          r <<= 4;

          // 'a' - 'f'
          if (c >= 49 && c <= 54) {
            r |= c - 49 + 0xa;

          // 'A' - 'F'
          } else if (c >= 17 && c <= 22) {
            r |= c - 17 + 0xa;

          // '0' - '9'
          } else {
            r |= c & 0xf;
          }
        }
        return r;
      }

      BN.prototype._parseHex = function _parseHex (number, start) {
        // Create possibly bigger array to ensure that it fits the number
        this.length = Math.ceil((number.length - start) / 6);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }

        var j, w;
        // Scan 24-bit chunks and add them to the number
        var off = 0;
        for (i = number.length - 6, j = 0; i >= start; i -= 6) {
          w = parseHex(number, i, i + 6);
          this.words[j] |= (w << off) & 0x3ffffff;
          // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
          this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
        if (i + 6 !== start) {
          w = parseHex(number, start, i + 6);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
        }
        this.strip();
      };

      function parseBase (str, start, end, mul) {
        var r = 0;
        var len = Math.min(str.length, end);
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48;

          r *= mul;

          // 'a'
          if (c >= 49) {
            r += c - 49 + 0xa;

          // 'A'
          } else if (c >= 17) {
            r += c - 17 + 0xa;

          // '0' - '9'
          } else {
            r += c;
          }
        }
        return r;
      }

      BN.prototype._parseBase = function _parseBase (number, base, start) {
        // Initialize as zero
        this.words = [ 0 ];
        this.length = 1;

        // Find length of limb in base
        for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
          limbLen++;
        }
        limbLen--;
        limbPow = (limbPow / base) | 0;

        var total = number.length - start;
        var mod = total % limbLen;
        var end = Math.min(total, total - mod) + start;

        var word = 0;
        for (var i = start; i < end; i += limbLen) {
          word = parseBase(number, i, i + limbLen, base);

          this.imuln(limbPow);
          if (this.words[0] + word < 0x4000000) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }

        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i, number.length, base);

          for (i = 0; i < mod; i++) {
            pow *= base;
          }

          this.imuln(pow);
          if (this.words[0] + word < 0x4000000) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
      };

      BN.prototype.copy = function copy (dest) {
        dest.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          dest.words[i] = this.words[i];
        }
        dest.length = this.length;
        dest.negative = this.negative;
        dest.red = this.red;
      };

      BN.prototype.clone = function clone () {
        var r = new BN(null);
        this.copy(r);
        return r;
      };

      BN.prototype._expand = function _expand (size) {
        while (this.length < size) {
          this.words[this.length++] = 0;
        }
        return this;
      };

      // Remove leading `0` from `this`
      BN.prototype.strip = function strip () {
        while (this.length > 1 && this.words[this.length - 1] === 0) {
          this.length--;
        }
        return this._normSign();
      };

      BN.prototype._normSign = function _normSign () {
        // -0 = 0
        if (this.length === 1 && this.words[0] === 0) {
          this.negative = 0;
        }
        return this;
      };

      BN.prototype.inspect = function inspect () {
        return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
      };

      /*

      var zeros = [];
      var groupSizes = [];
      var groupBases = [];

      var s = '';
      var i = -1;
      while (++i < BN.wordSize) {
        zeros[i] = s;
        s += '0';
      }
      groupSizes[0] = 0;
      groupSizes[1] = 0;
      groupBases[0] = 0;
      groupBases[1] = 0;
      var base = 2 - 1;
      while (++base < 36 + 1) {
        var groupSize = 0;
        var groupBase = 1;
        while (groupBase < (1 << BN.wordSize) / base) {
          groupBase *= base;
          groupSize += 1;
        }
        groupSizes[base] = groupSize;
        groupBases[base] = groupBase;
      }

      */

      var zeros = [
        '',
        '0',
        '00',
        '000',
        '0000',
        '00000',
        '000000',
        '0000000',
        '00000000',
        '000000000',
        '0000000000',
        '00000000000',
        '000000000000',
        '0000000000000',
        '00000000000000',
        '000000000000000',
        '0000000000000000',
        '00000000000000000',
        '000000000000000000',
        '0000000000000000000',
        '00000000000000000000',
        '000000000000000000000',
        '0000000000000000000000',
        '00000000000000000000000',
        '000000000000000000000000',
        '0000000000000000000000000'
      ];

      var groupSizes = [
        0, 0,
        25, 16, 12, 11, 10, 9, 8,
        8, 7, 7, 7, 7, 6, 6,
        6, 6, 6, 6, 6, 5, 5,
        5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5
      ];

      var groupBases = [
        0, 0,
        33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
        43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
        16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
        6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
        24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
      ];

      BN.prototype.toString = function toString (base, padding) {
        base = base || 10;
        padding = padding | 0 || 1;

        var out;
        if (base === 16 || base === 'hex') {
          out = '';
          var off = 0;
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = this.words[i];
            var word = (((w << off) | carry) & 0xffffff).toString(16);
            carry = (w >>> (24 - off)) & 0xffffff;
            if (carry !== 0 || i !== this.length - 1) {
              out = zeros[6 - word.length] + word + out;
            } else {
              out = word + out;
            }
            off += 2;
            if (off >= 26) {
              off -= 26;
              i--;
            }
          }
          if (carry !== 0) {
            out = carry.toString(16) + out;
          }
          while (out.length % padding !== 0) {
            out = '0' + out;
          }
          if (this.negative !== 0) {
            out = '-' + out;
          }
          return out;
        }

        if (base === (base | 0) && base >= 2 && base <= 36) {
          // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
          var groupSize = groupSizes[base];
          // var groupBase = Math.pow(base, groupSize);
          var groupBase = groupBases[base];
          out = '';
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            c = c.idivn(groupBase);

            if (!c.isZero()) {
              out = zeros[groupSize - r.length] + r + out;
            } else {
              out = r + out;
            }
          }
          if (this.isZero()) {
            out = '0' + out;
          }
          while (out.length % padding !== 0) {
            out = '0' + out;
          }
          if (this.negative !== 0) {
            out = '-' + out;
          }
          return out;
        }

        assert(false, 'Base should be between 2 and 36');
      };

      BN.prototype.toNumber = function toNumber () {
        var ret = this.words[0];
        if (this.length === 2) {
          ret += this.words[1] * 0x4000000;
        } else if (this.length === 3 && this.words[2] === 0x01) {
          // NOTE: at this stage it is known that the top bit is set
          ret += 0x10000000000000 + (this.words[1] * 0x4000000);
        } else if (this.length > 2) {
          assert(false, 'Number can only safely store up to 53 bits');
        }
        return (this.negative !== 0) ? -ret : ret;
      };

      BN.prototype.toJSON = function toJSON () {
        return this.toString(16);
      };

      BN.prototype.toBuffer = function toBuffer (endian, length) {
        assert(typeof Buffer !== 'undefined');
        return this.toArrayLike(Buffer, endian, length);
      };

      BN.prototype.toArray = function toArray (endian, length) {
        return this.toArrayLike(Array, endian, length);
      };

      BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
        var byteLength = this.byteLength();
        var reqLength = length || Math.max(1, byteLength);
        assert(byteLength <= reqLength, 'byte array longer than desired length');
        assert(reqLength > 0, 'Requested array length <= 0');

        this.strip();
        var littleEndian = endian === 'le';
        var res = new ArrayType(reqLength);

        var b, i;
        var q = this.clone();
        if (!littleEndian) {
          // Assume big-endian
          for (i = 0; i < reqLength - byteLength; i++) {
            res[i] = 0;
          }

          for (i = 0; !q.isZero(); i++) {
            b = q.andln(0xff);
            q.iushrn(8);

            res[reqLength - i - 1] = b;
          }
        } else {
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(0xff);
            q.iushrn(8);

            res[i] = b;
          }

          for (; i < reqLength; i++) {
            res[i] = 0;
          }
        }

        return res;
      };

      if (Math.clz32) {
        BN.prototype._countBits = function _countBits (w) {
          return 32 - Math.clz32(w);
        };
      } else {
        BN.prototype._countBits = function _countBits (w) {
          var t = w;
          var r = 0;
          if (t >= 0x1000) {
            r += 13;
            t >>>= 13;
          }
          if (t >= 0x40) {
            r += 7;
            t >>>= 7;
          }
          if (t >= 0x8) {
            r += 4;
            t >>>= 4;
          }
          if (t >= 0x02) {
            r += 2;
            t >>>= 2;
          }
          return r + t;
        };
      }

      BN.prototype._zeroBits = function _zeroBits (w) {
        // Short-cut
        if (w === 0) return 26;

        var t = w;
        var r = 0;
        if ((t & 0x1fff) === 0) {
          r += 13;
          t >>>= 13;
        }
        if ((t & 0x7f) === 0) {
          r += 7;
          t >>>= 7;
        }
        if ((t & 0xf) === 0) {
          r += 4;
          t >>>= 4;
        }
        if ((t & 0x3) === 0) {
          r += 2;
          t >>>= 2;
        }
        if ((t & 0x1) === 0) {
          r++;
        }
        return r;
      };

      // Return number of used bits in a BN
      BN.prototype.bitLength = function bitLength () {
        var w = this.words[this.length - 1];
        var hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };

      function toBitArray (num) {
        var w = new Array(num.bitLength());

        for (var bit = 0; bit < w.length; bit++) {
          var off = (bit / 26) | 0;
          var wbit = bit % 26;

          w[bit] = (num.words[off] & (1 << wbit)) >>> wbit;
        }

        return w;
      }

      // Number of trailing zero bits
      BN.prototype.zeroBits = function zeroBits () {
        if (this.isZero()) return 0;

        var r = 0;
        for (var i = 0; i < this.length; i++) {
          var b = this._zeroBits(this.words[i]);
          r += b;
          if (b !== 26) break;
        }
        return r;
      };

      BN.prototype.byteLength = function byteLength () {
        return Math.ceil(this.bitLength() / 8);
      };

      BN.prototype.toTwos = function toTwos (width) {
        if (this.negative !== 0) {
          return this.abs().inotn(width).iaddn(1);
        }
        return this.clone();
      };

      BN.prototype.fromTwos = function fromTwos (width) {
        if (this.testn(width - 1)) {
          return this.notn(width).iaddn(1).ineg();
        }
        return this.clone();
      };

      BN.prototype.isNeg = function isNeg () {
        return this.negative !== 0;
      };

      // Return negative clone of `this`
      BN.prototype.neg = function neg () {
        return this.clone().ineg();
      };

      BN.prototype.ineg = function ineg () {
        if (!this.isZero()) {
          this.negative ^= 1;
        }

        return this;
      };

      // Or `num` with `this` in-place
      BN.prototype.iuor = function iuor (num) {
        while (this.length < num.length) {
          this.words[this.length++] = 0;
        }

        for (var i = 0; i < num.length; i++) {
          this.words[i] = this.words[i] | num.words[i];
        }

        return this.strip();
      };

      BN.prototype.ior = function ior (num) {
        assert((this.negative | num.negative) === 0);
        return this.iuor(num);
      };

      // Or `num` with `this`
      BN.prototype.or = function or (num) {
        if (this.length > num.length) return this.clone().ior(num);
        return num.clone().ior(this);
      };

      BN.prototype.uor = function uor (num) {
        if (this.length > num.length) return this.clone().iuor(num);
        return num.clone().iuor(this);
      };

      // And `num` with `this` in-place
      BN.prototype.iuand = function iuand (num) {
        // b = min-length(num, this)
        var b;
        if (this.length > num.length) {
          b = num;
        } else {
          b = this;
        }

        for (var i = 0; i < b.length; i++) {
          this.words[i] = this.words[i] & num.words[i];
        }

        this.length = b.length;

        return this.strip();
      };

      BN.prototype.iand = function iand (num) {
        assert((this.negative | num.negative) === 0);
        return this.iuand(num);
      };

      // And `num` with `this`
      BN.prototype.and = function and (num) {
        if (this.length > num.length) return this.clone().iand(num);
        return num.clone().iand(this);
      };

      BN.prototype.uand = function uand (num) {
        if (this.length > num.length) return this.clone().iuand(num);
        return num.clone().iuand(this);
      };

      // Xor `num` with `this` in-place
      BN.prototype.iuxor = function iuxor (num) {
        // a.length > b.length
        var a;
        var b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }

        for (var i = 0; i < b.length; i++) {
          this.words[i] = a.words[i] ^ b.words[i];
        }

        if (this !== a) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }

        this.length = a.length;

        return this.strip();
      };

      BN.prototype.ixor = function ixor (num) {
        assert((this.negative | num.negative) === 0);
        return this.iuxor(num);
      };

      // Xor `num` with `this`
      BN.prototype.xor = function xor (num) {
        if (this.length > num.length) return this.clone().ixor(num);
        return num.clone().ixor(this);
      };

      BN.prototype.uxor = function uxor (num) {
        if (this.length > num.length) return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      };

      // Not ``this`` with ``width`` bitwidth
      BN.prototype.inotn = function inotn (width) {
        assert(typeof width === 'number' && width >= 0);

        var bytesNeeded = Math.ceil(width / 26) | 0;
        var bitsLeft = width % 26;

        // Extend the buffer with leading zeroes
        this._expand(bytesNeeded);

        if (bitsLeft > 0) {
          bytesNeeded--;
        }

        // Handle complete words
        for (var i = 0; i < bytesNeeded; i++) {
          this.words[i] = ~this.words[i] & 0x3ffffff;
        }

        // Handle the residue
        if (bitsLeft > 0) {
          this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
        }

        // And remove leading zeroes
        return this.strip();
      };

      BN.prototype.notn = function notn (width) {
        return this.clone().inotn(width);
      };

      // Set `bit` of `this`
      BN.prototype.setn = function setn (bit, val) {
        assert(typeof bit === 'number' && bit >= 0);

        var off = (bit / 26) | 0;
        var wbit = bit % 26;

        this._expand(off + 1);

        if (val) {
          this.words[off] = this.words[off] | (1 << wbit);
        } else {
          this.words[off] = this.words[off] & ~(1 << wbit);
        }

        return this.strip();
      };

      // Add `num` to `this` in-place
      BN.prototype.iadd = function iadd (num) {
        var r;

        // negative + positive
        if (this.negative !== 0 && num.negative === 0) {
          this.negative = 0;
          r = this.isub(num);
          this.negative ^= 1;
          return this._normSign();

        // positive + negative
        } else if (this.negative === 0 && num.negative !== 0) {
          num.negative = 0;
          r = this.isub(num);
          num.negative = 1;
          return r._normSign();
        }

        // a.length > b.length
        var a, b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }

        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
          this.words[i] = r & 0x3ffffff;
          carry = r >>> 26;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          this.words[i] = r & 0x3ffffff;
          carry = r >>> 26;
        }

        this.length = a.length;
        if (carry !== 0) {
          this.words[this.length] = carry;
          this.length++;
        // Copy the rest of the words
        } else if (a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }

        return this;
      };

      // Add `num` to `this`
      BN.prototype.add = function add (num) {
        var res;
        if (num.negative !== 0 && this.negative === 0) {
          num.negative = 0;
          res = this.sub(num);
          num.negative ^= 1;
          return res;
        } else if (num.negative === 0 && this.negative !== 0) {
          this.negative = 0;
          res = num.sub(this);
          this.negative = 1;
          return res;
        }

        if (this.length > num.length) return this.clone().iadd(num);

        return num.clone().iadd(this);
      };

      // Subtract `num` from `this` in-place
      BN.prototype.isub = function isub (num) {
        // this - (-num) = this + num
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          num.negative = 1;
          return r._normSign();

        // -this - num = -(this + num)
        } else if (this.negative !== 0) {
          this.negative = 0;
          this.iadd(num);
          this.negative = 1;
          return this._normSign();
        }

        // At this point both numbers are positive
        var cmp = this.cmp(num);

        // Optimization - zeroify
        if (cmp === 0) {
          this.negative = 0;
          this.length = 1;
          this.words[0] = 0;
          return this;
        }

        // a > b
        var a, b;
        if (cmp > 0) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }

        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 0x3ffffff;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 0x3ffffff;
        }

        // Copy rest of the words
        if (carry === 0 && i < a.length && a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }

        this.length = Math.max(this.length, i);

        if (a !== this) {
          this.negative = 1;
        }

        return this.strip();
      };

      // Subtract `num` from `this`
      BN.prototype.sub = function sub (num) {
        return this.clone().isub(num);
      };

      function smallMulTo (self, num, out) {
        out.negative = num.negative ^ self.negative;
        var len = (self.length + num.length) | 0;
        out.length = len;
        len = (len - 1) | 0;

        // Peel one iteration (compiler can't do it, because of code complexity)
        var a = self.words[0] | 0;
        var b = num.words[0] | 0;
        var r = a * b;

        var lo = r & 0x3ffffff;
        var carry = (r / 0x4000000) | 0;
        out.words[0] = lo;

        for (var k = 1; k < len; k++) {
          // Sum all words with the same `i + j = k` and accumulate `ncarry`,
          // note that ncarry could be >= 0x3ffffff
          var ncarry = carry >>> 26;
          var rword = carry & 0x3ffffff;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = (k - j) | 0;
            a = self.words[i] | 0;
            b = num.words[j] | 0;
            r = a * b + rword;
            ncarry += (r / 0x4000000) | 0;
            rword = r & 0x3ffffff;
          }
          out.words[k] = rword | 0;
          carry = ncarry | 0;
        }
        if (carry !== 0) {
          out.words[k] = carry | 0;
        } else {
          out.length--;
        }

        return out.strip();
      }

      // TODO(indutny): it may be reasonable to omit it for users who don't need
      // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
      // multiplication (like elliptic secp256k1).
      var comb10MulTo = function comb10MulTo (self, num, out) {
        var a = self.words;
        var b = num.words;
        var o = out.words;
        var c = 0;
        var lo;
        var mid;
        var hi;
        var a0 = a[0] | 0;
        var al0 = a0 & 0x1fff;
        var ah0 = a0 >>> 13;
        var a1 = a[1] | 0;
        var al1 = a1 & 0x1fff;
        var ah1 = a1 >>> 13;
        var a2 = a[2] | 0;
        var al2 = a2 & 0x1fff;
        var ah2 = a2 >>> 13;
        var a3 = a[3] | 0;
        var al3 = a3 & 0x1fff;
        var ah3 = a3 >>> 13;
        var a4 = a[4] | 0;
        var al4 = a4 & 0x1fff;
        var ah4 = a4 >>> 13;
        var a5 = a[5] | 0;
        var al5 = a5 & 0x1fff;
        var ah5 = a5 >>> 13;
        var a6 = a[6] | 0;
        var al6 = a6 & 0x1fff;
        var ah6 = a6 >>> 13;
        var a7 = a[7] | 0;
        var al7 = a7 & 0x1fff;
        var ah7 = a7 >>> 13;
        var a8 = a[8] | 0;
        var al8 = a8 & 0x1fff;
        var ah8 = a8 >>> 13;
        var a9 = a[9] | 0;
        var al9 = a9 & 0x1fff;
        var ah9 = a9 >>> 13;
        var b0 = b[0] | 0;
        var bl0 = b0 & 0x1fff;
        var bh0 = b0 >>> 13;
        var b1 = b[1] | 0;
        var bl1 = b1 & 0x1fff;
        var bh1 = b1 >>> 13;
        var b2 = b[2] | 0;
        var bl2 = b2 & 0x1fff;
        var bh2 = b2 >>> 13;
        var b3 = b[3] | 0;
        var bl3 = b3 & 0x1fff;
        var bh3 = b3 >>> 13;
        var b4 = b[4] | 0;
        var bl4 = b4 & 0x1fff;
        var bh4 = b4 >>> 13;
        var b5 = b[5] | 0;
        var bl5 = b5 & 0x1fff;
        var bh5 = b5 >>> 13;
        var b6 = b[6] | 0;
        var bl6 = b6 & 0x1fff;
        var bh6 = b6 >>> 13;
        var b7 = b[7] | 0;
        var bl7 = b7 & 0x1fff;
        var bh7 = b7 >>> 13;
        var b8 = b[8] | 0;
        var bl8 = b8 & 0x1fff;
        var bh8 = b8 >>> 13;
        var b9 = b[9] | 0;
        var bl9 = b9 & 0x1fff;
        var bh9 = b9 >>> 13;

        out.negative = self.negative ^ num.negative;
        out.length = 19;
        /* k = 0 */
        lo = Math.imul(al0, bl0);
        mid = Math.imul(al0, bh0);
        mid = (mid + Math.imul(ah0, bl0)) | 0;
        hi = Math.imul(ah0, bh0);
        var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
        w0 &= 0x3ffffff;
        /* k = 1 */
        lo = Math.imul(al1, bl0);
        mid = Math.imul(al1, bh0);
        mid = (mid + Math.imul(ah1, bl0)) | 0;
        hi = Math.imul(ah1, bh0);
        lo = (lo + Math.imul(al0, bl1)) | 0;
        mid = (mid + Math.imul(al0, bh1)) | 0;
        mid = (mid + Math.imul(ah0, bl1)) | 0;
        hi = (hi + Math.imul(ah0, bh1)) | 0;
        var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
        w1 &= 0x3ffffff;
        /* k = 2 */
        lo = Math.imul(al2, bl0);
        mid = Math.imul(al2, bh0);
        mid = (mid + Math.imul(ah2, bl0)) | 0;
        hi = Math.imul(ah2, bh0);
        lo = (lo + Math.imul(al1, bl1)) | 0;
        mid = (mid + Math.imul(al1, bh1)) | 0;
        mid = (mid + Math.imul(ah1, bl1)) | 0;
        hi = (hi + Math.imul(ah1, bh1)) | 0;
        lo = (lo + Math.imul(al0, bl2)) | 0;
        mid = (mid + Math.imul(al0, bh2)) | 0;
        mid = (mid + Math.imul(ah0, bl2)) | 0;
        hi = (hi + Math.imul(ah0, bh2)) | 0;
        var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
        w2 &= 0x3ffffff;
        /* k = 3 */
        lo = Math.imul(al3, bl0);
        mid = Math.imul(al3, bh0);
        mid = (mid + Math.imul(ah3, bl0)) | 0;
        hi = Math.imul(ah3, bh0);
        lo = (lo + Math.imul(al2, bl1)) | 0;
        mid = (mid + Math.imul(al2, bh1)) | 0;
        mid = (mid + Math.imul(ah2, bl1)) | 0;
        hi = (hi + Math.imul(ah2, bh1)) | 0;
        lo = (lo + Math.imul(al1, bl2)) | 0;
        mid = (mid + Math.imul(al1, bh2)) | 0;
        mid = (mid + Math.imul(ah1, bl2)) | 0;
        hi = (hi + Math.imul(ah1, bh2)) | 0;
        lo = (lo + Math.imul(al0, bl3)) | 0;
        mid = (mid + Math.imul(al0, bh3)) | 0;
        mid = (mid + Math.imul(ah0, bl3)) | 0;
        hi = (hi + Math.imul(ah0, bh3)) | 0;
        var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
        w3 &= 0x3ffffff;
        /* k = 4 */
        lo = Math.imul(al4, bl0);
        mid = Math.imul(al4, bh0);
        mid = (mid + Math.imul(ah4, bl0)) | 0;
        hi = Math.imul(ah4, bh0);
        lo = (lo + Math.imul(al3, bl1)) | 0;
        mid = (mid + Math.imul(al3, bh1)) | 0;
        mid = (mid + Math.imul(ah3, bl1)) | 0;
        hi = (hi + Math.imul(ah3, bh1)) | 0;
        lo = (lo + Math.imul(al2, bl2)) | 0;
        mid = (mid + Math.imul(al2, bh2)) | 0;
        mid = (mid + Math.imul(ah2, bl2)) | 0;
        hi = (hi + Math.imul(ah2, bh2)) | 0;
        lo = (lo + Math.imul(al1, bl3)) | 0;
        mid = (mid + Math.imul(al1, bh3)) | 0;
        mid = (mid + Math.imul(ah1, bl3)) | 0;
        hi = (hi + Math.imul(ah1, bh3)) | 0;
        lo = (lo + Math.imul(al0, bl4)) | 0;
        mid = (mid + Math.imul(al0, bh4)) | 0;
        mid = (mid + Math.imul(ah0, bl4)) | 0;
        hi = (hi + Math.imul(ah0, bh4)) | 0;
        var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
        w4 &= 0x3ffffff;
        /* k = 5 */
        lo = Math.imul(al5, bl0);
        mid = Math.imul(al5, bh0);
        mid = (mid + Math.imul(ah5, bl0)) | 0;
        hi = Math.imul(ah5, bh0);
        lo = (lo + Math.imul(al4, bl1)) | 0;
        mid = (mid + Math.imul(al4, bh1)) | 0;
        mid = (mid + Math.imul(ah4, bl1)) | 0;
        hi = (hi + Math.imul(ah4, bh1)) | 0;
        lo = (lo + Math.imul(al3, bl2)) | 0;
        mid = (mid + Math.imul(al3, bh2)) | 0;
        mid = (mid + Math.imul(ah3, bl2)) | 0;
        hi = (hi + Math.imul(ah3, bh2)) | 0;
        lo = (lo + Math.imul(al2, bl3)) | 0;
        mid = (mid + Math.imul(al2, bh3)) | 0;
        mid = (mid + Math.imul(ah2, bl3)) | 0;
        hi = (hi + Math.imul(ah2, bh3)) | 0;
        lo = (lo + Math.imul(al1, bl4)) | 0;
        mid = (mid + Math.imul(al1, bh4)) | 0;
        mid = (mid + Math.imul(ah1, bl4)) | 0;
        hi = (hi + Math.imul(ah1, bh4)) | 0;
        lo = (lo + Math.imul(al0, bl5)) | 0;
        mid = (mid + Math.imul(al0, bh5)) | 0;
        mid = (mid + Math.imul(ah0, bl5)) | 0;
        hi = (hi + Math.imul(ah0, bh5)) | 0;
        var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
        w5 &= 0x3ffffff;
        /* k = 6 */
        lo = Math.imul(al6, bl0);
        mid = Math.imul(al6, bh0);
        mid = (mid + Math.imul(ah6, bl0)) | 0;
        hi = Math.imul(ah6, bh0);
        lo = (lo + Math.imul(al5, bl1)) | 0;
        mid = (mid + Math.imul(al5, bh1)) | 0;
        mid = (mid + Math.imul(ah5, bl1)) | 0;
        hi = (hi + Math.imul(ah5, bh1)) | 0;
        lo = (lo + Math.imul(al4, bl2)) | 0;
        mid = (mid + Math.imul(al4, bh2)) | 0;
        mid = (mid + Math.imul(ah4, bl2)) | 0;
        hi = (hi + Math.imul(ah4, bh2)) | 0;
        lo = (lo + Math.imul(al3, bl3)) | 0;
        mid = (mid + Math.imul(al3, bh3)) | 0;
        mid = (mid + Math.imul(ah3, bl3)) | 0;
        hi = (hi + Math.imul(ah3, bh3)) | 0;
        lo = (lo + Math.imul(al2, bl4)) | 0;
        mid = (mid + Math.imul(al2, bh4)) | 0;
        mid = (mid + Math.imul(ah2, bl4)) | 0;
        hi = (hi + Math.imul(ah2, bh4)) | 0;
        lo = (lo + Math.imul(al1, bl5)) | 0;
        mid = (mid + Math.imul(al1, bh5)) | 0;
        mid = (mid + Math.imul(ah1, bl5)) | 0;
        hi = (hi + Math.imul(ah1, bh5)) | 0;
        lo = (lo + Math.imul(al0, bl6)) | 0;
        mid = (mid + Math.imul(al0, bh6)) | 0;
        mid = (mid + Math.imul(ah0, bl6)) | 0;
        hi = (hi + Math.imul(ah0, bh6)) | 0;
        var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
        w6 &= 0x3ffffff;
        /* k = 7 */
        lo = Math.imul(al7, bl0);
        mid = Math.imul(al7, bh0);
        mid = (mid + Math.imul(ah7, bl0)) | 0;
        hi = Math.imul(ah7, bh0);
        lo = (lo + Math.imul(al6, bl1)) | 0;
        mid = (mid + Math.imul(al6, bh1)) | 0;
        mid = (mid + Math.imul(ah6, bl1)) | 0;
        hi = (hi + Math.imul(ah6, bh1)) | 0;
        lo = (lo + Math.imul(al5, bl2)) | 0;
        mid = (mid + Math.imul(al5, bh2)) | 0;
        mid = (mid + Math.imul(ah5, bl2)) | 0;
        hi = (hi + Math.imul(ah5, bh2)) | 0;
        lo = (lo + Math.imul(al4, bl3)) | 0;
        mid = (mid + Math.imul(al4, bh3)) | 0;
        mid = (mid + Math.imul(ah4, bl3)) | 0;
        hi = (hi + Math.imul(ah4, bh3)) | 0;
        lo = (lo + Math.imul(al3, bl4)) | 0;
        mid = (mid + Math.imul(al3, bh4)) | 0;
        mid = (mid + Math.imul(ah3, bl4)) | 0;
        hi = (hi + Math.imul(ah3, bh4)) | 0;
        lo = (lo + Math.imul(al2, bl5)) | 0;
        mid = (mid + Math.imul(al2, bh5)) | 0;
        mid = (mid + Math.imul(ah2, bl5)) | 0;
        hi = (hi + Math.imul(ah2, bh5)) | 0;
        lo = (lo + Math.imul(al1, bl6)) | 0;
        mid = (mid + Math.imul(al1, bh6)) | 0;
        mid = (mid + Math.imul(ah1, bl6)) | 0;
        hi = (hi + Math.imul(ah1, bh6)) | 0;
        lo = (lo + Math.imul(al0, bl7)) | 0;
        mid = (mid + Math.imul(al0, bh7)) | 0;
        mid = (mid + Math.imul(ah0, bl7)) | 0;
        hi = (hi + Math.imul(ah0, bh7)) | 0;
        var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
        w7 &= 0x3ffffff;
        /* k = 8 */
        lo = Math.imul(al8, bl0);
        mid = Math.imul(al8, bh0);
        mid = (mid + Math.imul(ah8, bl0)) | 0;
        hi = Math.imul(ah8, bh0);
        lo = (lo + Math.imul(al7, bl1)) | 0;
        mid = (mid + Math.imul(al7, bh1)) | 0;
        mid = (mid + Math.imul(ah7, bl1)) | 0;
        hi = (hi + Math.imul(ah7, bh1)) | 0;
        lo = (lo + Math.imul(al6, bl2)) | 0;
        mid = (mid + Math.imul(al6, bh2)) | 0;
        mid = (mid + Math.imul(ah6, bl2)) | 0;
        hi = (hi + Math.imul(ah6, bh2)) | 0;
        lo = (lo + Math.imul(al5, bl3)) | 0;
        mid = (mid + Math.imul(al5, bh3)) | 0;
        mid = (mid + Math.imul(ah5, bl3)) | 0;
        hi = (hi + Math.imul(ah5, bh3)) | 0;
        lo = (lo + Math.imul(al4, bl4)) | 0;
        mid = (mid + Math.imul(al4, bh4)) | 0;
        mid = (mid + Math.imul(ah4, bl4)) | 0;
        hi = (hi + Math.imul(ah4, bh4)) | 0;
        lo = (lo + Math.imul(al3, bl5)) | 0;
        mid = (mid + Math.imul(al3, bh5)) | 0;
        mid = (mid + Math.imul(ah3, bl5)) | 0;
        hi = (hi + Math.imul(ah3, bh5)) | 0;
        lo = (lo + Math.imul(al2, bl6)) | 0;
        mid = (mid + Math.imul(al2, bh6)) | 0;
        mid = (mid + Math.imul(ah2, bl6)) | 0;
        hi = (hi + Math.imul(ah2, bh6)) | 0;
        lo = (lo + Math.imul(al1, bl7)) | 0;
        mid = (mid + Math.imul(al1, bh7)) | 0;
        mid = (mid + Math.imul(ah1, bl7)) | 0;
        hi = (hi + Math.imul(ah1, bh7)) | 0;
        lo = (lo + Math.imul(al0, bl8)) | 0;
        mid = (mid + Math.imul(al0, bh8)) | 0;
        mid = (mid + Math.imul(ah0, bl8)) | 0;
        hi = (hi + Math.imul(ah0, bh8)) | 0;
        var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
        w8 &= 0x3ffffff;
        /* k = 9 */
        lo = Math.imul(al9, bl0);
        mid = Math.imul(al9, bh0);
        mid = (mid + Math.imul(ah9, bl0)) | 0;
        hi = Math.imul(ah9, bh0);
        lo = (lo + Math.imul(al8, bl1)) | 0;
        mid = (mid + Math.imul(al8, bh1)) | 0;
        mid = (mid + Math.imul(ah8, bl1)) | 0;
        hi = (hi + Math.imul(ah8, bh1)) | 0;
        lo = (lo + Math.imul(al7, bl2)) | 0;
        mid = (mid + Math.imul(al7, bh2)) | 0;
        mid = (mid + Math.imul(ah7, bl2)) | 0;
        hi = (hi + Math.imul(ah7, bh2)) | 0;
        lo = (lo + Math.imul(al6, bl3)) | 0;
        mid = (mid + Math.imul(al6, bh3)) | 0;
        mid = (mid + Math.imul(ah6, bl3)) | 0;
        hi = (hi + Math.imul(ah6, bh3)) | 0;
        lo = (lo + Math.imul(al5, bl4)) | 0;
        mid = (mid + Math.imul(al5, bh4)) | 0;
        mid = (mid + Math.imul(ah5, bl4)) | 0;
        hi = (hi + Math.imul(ah5, bh4)) | 0;
        lo = (lo + Math.imul(al4, bl5)) | 0;
        mid = (mid + Math.imul(al4, bh5)) | 0;
        mid = (mid + Math.imul(ah4, bl5)) | 0;
        hi = (hi + Math.imul(ah4, bh5)) | 0;
        lo = (lo + Math.imul(al3, bl6)) | 0;
        mid = (mid + Math.imul(al3, bh6)) | 0;
        mid = (mid + Math.imul(ah3, bl6)) | 0;
        hi = (hi + Math.imul(ah3, bh6)) | 0;
        lo = (lo + Math.imul(al2, bl7)) | 0;
        mid = (mid + Math.imul(al2, bh7)) | 0;
        mid = (mid + Math.imul(ah2, bl7)) | 0;
        hi = (hi + Math.imul(ah2, bh7)) | 0;
        lo = (lo + Math.imul(al1, bl8)) | 0;
        mid = (mid + Math.imul(al1, bh8)) | 0;
        mid = (mid + Math.imul(ah1, bl8)) | 0;
        hi = (hi + Math.imul(ah1, bh8)) | 0;
        lo = (lo + Math.imul(al0, bl9)) | 0;
        mid = (mid + Math.imul(al0, bh9)) | 0;
        mid = (mid + Math.imul(ah0, bl9)) | 0;
        hi = (hi + Math.imul(ah0, bh9)) | 0;
        var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
        w9 &= 0x3ffffff;
        /* k = 10 */
        lo = Math.imul(al9, bl1);
        mid = Math.imul(al9, bh1);
        mid = (mid + Math.imul(ah9, bl1)) | 0;
        hi = Math.imul(ah9, bh1);
        lo = (lo + Math.imul(al8, bl2)) | 0;
        mid = (mid + Math.imul(al8, bh2)) | 0;
        mid = (mid + Math.imul(ah8, bl2)) | 0;
        hi = (hi + Math.imul(ah8, bh2)) | 0;
        lo = (lo + Math.imul(al7, bl3)) | 0;
        mid = (mid + Math.imul(al7, bh3)) | 0;
        mid = (mid + Math.imul(ah7, bl3)) | 0;
        hi = (hi + Math.imul(ah7, bh3)) | 0;
        lo = (lo + Math.imul(al6, bl4)) | 0;
        mid = (mid + Math.imul(al6, bh4)) | 0;
        mid = (mid + Math.imul(ah6, bl4)) | 0;
        hi = (hi + Math.imul(ah6, bh4)) | 0;
        lo = (lo + Math.imul(al5, bl5)) | 0;
        mid = (mid + Math.imul(al5, bh5)) | 0;
        mid = (mid + Math.imul(ah5, bl5)) | 0;
        hi = (hi + Math.imul(ah5, bh5)) | 0;
        lo = (lo + Math.imul(al4, bl6)) | 0;
        mid = (mid + Math.imul(al4, bh6)) | 0;
        mid = (mid + Math.imul(ah4, bl6)) | 0;
        hi = (hi + Math.imul(ah4, bh6)) | 0;
        lo = (lo + Math.imul(al3, bl7)) | 0;
        mid = (mid + Math.imul(al3, bh7)) | 0;
        mid = (mid + Math.imul(ah3, bl7)) | 0;
        hi = (hi + Math.imul(ah3, bh7)) | 0;
        lo = (lo + Math.imul(al2, bl8)) | 0;
        mid = (mid + Math.imul(al2, bh8)) | 0;
        mid = (mid + Math.imul(ah2, bl8)) | 0;
        hi = (hi + Math.imul(ah2, bh8)) | 0;
        lo = (lo + Math.imul(al1, bl9)) | 0;
        mid = (mid + Math.imul(al1, bh9)) | 0;
        mid = (mid + Math.imul(ah1, bl9)) | 0;
        hi = (hi + Math.imul(ah1, bh9)) | 0;
        var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
        w10 &= 0x3ffffff;
        /* k = 11 */
        lo = Math.imul(al9, bl2);
        mid = Math.imul(al9, bh2);
        mid = (mid + Math.imul(ah9, bl2)) | 0;
        hi = Math.imul(ah9, bh2);
        lo = (lo + Math.imul(al8, bl3)) | 0;
        mid = (mid + Math.imul(al8, bh3)) | 0;
        mid = (mid + Math.imul(ah8, bl3)) | 0;
        hi = (hi + Math.imul(ah8, bh3)) | 0;
        lo = (lo + Math.imul(al7, bl4)) | 0;
        mid = (mid + Math.imul(al7, bh4)) | 0;
        mid = (mid + Math.imul(ah7, bl4)) | 0;
        hi = (hi + Math.imul(ah7, bh4)) | 0;
        lo = (lo + Math.imul(al6, bl5)) | 0;
        mid = (mid + Math.imul(al6, bh5)) | 0;
        mid = (mid + Math.imul(ah6, bl5)) | 0;
        hi = (hi + Math.imul(ah6, bh5)) | 0;
        lo = (lo + Math.imul(al5, bl6)) | 0;
        mid = (mid + Math.imul(al5, bh6)) | 0;
        mid = (mid + Math.imul(ah5, bl6)) | 0;
        hi = (hi + Math.imul(ah5, bh6)) | 0;
        lo = (lo + Math.imul(al4, bl7)) | 0;
        mid = (mid + Math.imul(al4, bh7)) | 0;
        mid = (mid + Math.imul(ah4, bl7)) | 0;
        hi = (hi + Math.imul(ah4, bh7)) | 0;
        lo = (lo + Math.imul(al3, bl8)) | 0;
        mid = (mid + Math.imul(al3, bh8)) | 0;
        mid = (mid + Math.imul(ah3, bl8)) | 0;
        hi = (hi + Math.imul(ah3, bh8)) | 0;
        lo = (lo + Math.imul(al2, bl9)) | 0;
        mid = (mid + Math.imul(al2, bh9)) | 0;
        mid = (mid + Math.imul(ah2, bl9)) | 0;
        hi = (hi + Math.imul(ah2, bh9)) | 0;
        var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
        w11 &= 0x3ffffff;
        /* k = 12 */
        lo = Math.imul(al9, bl3);
        mid = Math.imul(al9, bh3);
        mid = (mid + Math.imul(ah9, bl3)) | 0;
        hi = Math.imul(ah9, bh3);
        lo = (lo + Math.imul(al8, bl4)) | 0;
        mid = (mid + Math.imul(al8, bh4)) | 0;
        mid = (mid + Math.imul(ah8, bl4)) | 0;
        hi = (hi + Math.imul(ah8, bh4)) | 0;
        lo = (lo + Math.imul(al7, bl5)) | 0;
        mid = (mid + Math.imul(al7, bh5)) | 0;
        mid = (mid + Math.imul(ah7, bl5)) | 0;
        hi = (hi + Math.imul(ah7, bh5)) | 0;
        lo = (lo + Math.imul(al6, bl6)) | 0;
        mid = (mid + Math.imul(al6, bh6)) | 0;
        mid = (mid + Math.imul(ah6, bl6)) | 0;
        hi = (hi + Math.imul(ah6, bh6)) | 0;
        lo = (lo + Math.imul(al5, bl7)) | 0;
        mid = (mid + Math.imul(al5, bh7)) | 0;
        mid = (mid + Math.imul(ah5, bl7)) | 0;
        hi = (hi + Math.imul(ah5, bh7)) | 0;
        lo = (lo + Math.imul(al4, bl8)) | 0;
        mid = (mid + Math.imul(al4, bh8)) | 0;
        mid = (mid + Math.imul(ah4, bl8)) | 0;
        hi = (hi + Math.imul(ah4, bh8)) | 0;
        lo = (lo + Math.imul(al3, bl9)) | 0;
        mid = (mid + Math.imul(al3, bh9)) | 0;
        mid = (mid + Math.imul(ah3, bl9)) | 0;
        hi = (hi + Math.imul(ah3, bh9)) | 0;
        var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
        w12 &= 0x3ffffff;
        /* k = 13 */
        lo = Math.imul(al9, bl4);
        mid = Math.imul(al9, bh4);
        mid = (mid + Math.imul(ah9, bl4)) | 0;
        hi = Math.imul(ah9, bh4);
        lo = (lo + Math.imul(al8, bl5)) | 0;
        mid = (mid + Math.imul(al8, bh5)) | 0;
        mid = (mid + Math.imul(ah8, bl5)) | 0;
        hi = (hi + Math.imul(ah8, bh5)) | 0;
        lo = (lo + Math.imul(al7, bl6)) | 0;
        mid = (mid + Math.imul(al7, bh6)) | 0;
        mid = (mid + Math.imul(ah7, bl6)) | 0;
        hi = (hi + Math.imul(ah7, bh6)) | 0;
        lo = (lo + Math.imul(al6, bl7)) | 0;
        mid = (mid + Math.imul(al6, bh7)) | 0;
        mid = (mid + Math.imul(ah6, bl7)) | 0;
        hi = (hi + Math.imul(ah6, bh7)) | 0;
        lo = (lo + Math.imul(al5, bl8)) | 0;
        mid = (mid + Math.imul(al5, bh8)) | 0;
        mid = (mid + Math.imul(ah5, bl8)) | 0;
        hi = (hi + Math.imul(ah5, bh8)) | 0;
        lo = (lo + Math.imul(al4, bl9)) | 0;
        mid = (mid + Math.imul(al4, bh9)) | 0;
        mid = (mid + Math.imul(ah4, bl9)) | 0;
        hi = (hi + Math.imul(ah4, bh9)) | 0;
        var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
        w13 &= 0x3ffffff;
        /* k = 14 */
        lo = Math.imul(al9, bl5);
        mid = Math.imul(al9, bh5);
        mid = (mid + Math.imul(ah9, bl5)) | 0;
        hi = Math.imul(ah9, bh5);
        lo = (lo + Math.imul(al8, bl6)) | 0;
        mid = (mid + Math.imul(al8, bh6)) | 0;
        mid = (mid + Math.imul(ah8, bl6)) | 0;
        hi = (hi + Math.imul(ah8, bh6)) | 0;
        lo = (lo + Math.imul(al7, bl7)) | 0;
        mid = (mid + Math.imul(al7, bh7)) | 0;
        mid = (mid + Math.imul(ah7, bl7)) | 0;
        hi = (hi + Math.imul(ah7, bh7)) | 0;
        lo = (lo + Math.imul(al6, bl8)) | 0;
        mid = (mid + Math.imul(al6, bh8)) | 0;
        mid = (mid + Math.imul(ah6, bl8)) | 0;
        hi = (hi + Math.imul(ah6, bh8)) | 0;
        lo = (lo + Math.imul(al5, bl9)) | 0;
        mid = (mid + Math.imul(al5, bh9)) | 0;
        mid = (mid + Math.imul(ah5, bl9)) | 0;
        hi = (hi + Math.imul(ah5, bh9)) | 0;
        var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
        w14 &= 0x3ffffff;
        /* k = 15 */
        lo = Math.imul(al9, bl6);
        mid = Math.imul(al9, bh6);
        mid = (mid + Math.imul(ah9, bl6)) | 0;
        hi = Math.imul(ah9, bh6);
        lo = (lo + Math.imul(al8, bl7)) | 0;
        mid = (mid + Math.imul(al8, bh7)) | 0;
        mid = (mid + Math.imul(ah8, bl7)) | 0;
        hi = (hi + Math.imul(ah8, bh7)) | 0;
        lo = (lo + Math.imul(al7, bl8)) | 0;
        mid = (mid + Math.imul(al7, bh8)) | 0;
        mid = (mid + Math.imul(ah7, bl8)) | 0;
        hi = (hi + Math.imul(ah7, bh8)) | 0;
        lo = (lo + Math.imul(al6, bl9)) | 0;
        mid = (mid + Math.imul(al6, bh9)) | 0;
        mid = (mid + Math.imul(ah6, bl9)) | 0;
        hi = (hi + Math.imul(ah6, bh9)) | 0;
        var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
        w15 &= 0x3ffffff;
        /* k = 16 */
        lo = Math.imul(al9, bl7);
        mid = Math.imul(al9, bh7);
        mid = (mid + Math.imul(ah9, bl7)) | 0;
        hi = Math.imul(ah9, bh7);
        lo = (lo + Math.imul(al8, bl8)) | 0;
        mid = (mid + Math.imul(al8, bh8)) | 0;
        mid = (mid + Math.imul(ah8, bl8)) | 0;
        hi = (hi + Math.imul(ah8, bh8)) | 0;
        lo = (lo + Math.imul(al7, bl9)) | 0;
        mid = (mid + Math.imul(al7, bh9)) | 0;
        mid = (mid + Math.imul(ah7, bl9)) | 0;
        hi = (hi + Math.imul(ah7, bh9)) | 0;
        var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
        w16 &= 0x3ffffff;
        /* k = 17 */
        lo = Math.imul(al9, bl8);
        mid = Math.imul(al9, bh8);
        mid = (mid + Math.imul(ah9, bl8)) | 0;
        hi = Math.imul(ah9, bh8);
        lo = (lo + Math.imul(al8, bl9)) | 0;
        mid = (mid + Math.imul(al8, bh9)) | 0;
        mid = (mid + Math.imul(ah8, bl9)) | 0;
        hi = (hi + Math.imul(ah8, bh9)) | 0;
        var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
        w17 &= 0x3ffffff;
        /* k = 18 */
        lo = Math.imul(al9, bl9);
        mid = Math.imul(al9, bh9);
        mid = (mid + Math.imul(ah9, bl9)) | 0;
        hi = Math.imul(ah9, bh9);
        var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
        w18 &= 0x3ffffff;
        o[0] = w0;
        o[1] = w1;
        o[2] = w2;
        o[3] = w3;
        o[4] = w4;
        o[5] = w5;
        o[6] = w6;
        o[7] = w7;
        o[8] = w8;
        o[9] = w9;
        o[10] = w10;
        o[11] = w11;
        o[12] = w12;
        o[13] = w13;
        o[14] = w14;
        o[15] = w15;
        o[16] = w16;
        o[17] = w17;
        o[18] = w18;
        if (c !== 0) {
          o[19] = c;
          out.length++;
        }
        return out;
      };

      // Polyfill comb
      if (!Math.imul) {
        comb10MulTo = smallMulTo;
      }

      function bigMulTo (self, num, out) {
        out.negative = num.negative ^ self.negative;
        out.length = self.length + num.length;

        var carry = 0;
        var hncarry = 0;
        for (var k = 0; k < out.length - 1; k++) {
          // Sum all words with the same `i + j = k` and accumulate `ncarry`,
          // note that ncarry could be >= 0x3ffffff
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 0x3ffffff;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j;
            var a = self.words[i] | 0;
            var b = num.words[j] | 0;
            var r = a * b;

            var lo = r & 0x3ffffff;
            ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
            lo = (lo + rword) | 0;
            rword = lo & 0x3ffffff;
            ncarry = (ncarry + (lo >>> 26)) | 0;

            hncarry += ncarry >>> 26;
            ncarry &= 0x3ffffff;
          }
          out.words[k] = rword;
          carry = ncarry;
          ncarry = hncarry;
        }
        if (carry !== 0) {
          out.words[k] = carry;
        } else {
          out.length--;
        }

        return out.strip();
      }

      function jumboMulTo (self, num, out) {
        var fftm = new FFTM();
        return fftm.mulp(self, num, out);
      }

      BN.prototype.mulTo = function mulTo (num, out) {
        var res;
        var len = this.length + num.length;
        if (this.length === 10 && num.length === 10) {
          res = comb10MulTo(this, num, out);
        } else if (len < 63) {
          res = smallMulTo(this, num, out);
        } else if (len < 1024) {
          res = bigMulTo(this, num, out);
        } else {
          res = jumboMulTo(this, num, out);
        }

        return res;
      };

      // Cooley-Tukey algorithm for FFT
      // slightly revisited to rely on looping instead of recursion

      function FFTM (x, y) {
        this.x = x;
        this.y = y;
      }

      FFTM.prototype.makeRBT = function makeRBT (N) {
        var t = new Array(N);
        var l = BN.prototype._countBits(N) - 1;
        for (var i = 0; i < N; i++) {
          t[i] = this.revBin(i, l, N);
        }

        return t;
      };

      // Returns binary-reversed representation of `x`
      FFTM.prototype.revBin = function revBin (x, l, N) {
        if (x === 0 || x === N - 1) return x;

        var rb = 0;
        for (var i = 0; i < l; i++) {
          rb |= (x & 1) << (l - i - 1);
          x >>= 1;
        }

        return rb;
      };

      // Performs "tweedling" phase, therefore 'emulating'
      // behaviour of the recursive algorithm
      FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
        for (var i = 0; i < N; i++) {
          rtws[i] = rws[rbt[i]];
          itws[i] = iws[rbt[i]];
        }
      };

      FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);

        for (var s = 1; s < N; s <<= 1) {
          var l = s << 1;

          var rtwdf = Math.cos(2 * Math.PI / l);
          var itwdf = Math.sin(2 * Math.PI / l);

          for (var p = 0; p < N; p += l) {
            var rtwdf_ = rtwdf;
            var itwdf_ = itwdf;

            for (var j = 0; j < s; j++) {
              var re = rtws[p + j];
              var ie = itws[p + j];

              var ro = rtws[p + j + s];
              var io = itws[p + j + s];

              var rx = rtwdf_ * ro - itwdf_ * io;

              io = rtwdf_ * io + itwdf_ * ro;
              ro = rx;

              rtws[p + j] = re + ro;
              itws[p + j] = ie + io;

              rtws[p + j + s] = re - ro;
              itws[p + j + s] = ie - io;

              /* jshint maxdepth : false */
              if (j !== l) {
                rx = rtwdf * rtwdf_ - itwdf * itwdf_;

                itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                rtwdf_ = rx;
              }
            }
          }
        }
      };

      FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
        var N = Math.max(m, n) | 1;
        var odd = N & 1;
        var i = 0;
        for (N = N / 2 | 0; N; N = N >>> 1) {
          i++;
        }

        return 1 << i + 1 + odd;
      };

      FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
        if (N <= 1) return;

        for (var i = 0; i < N / 2; i++) {
          var t = rws[i];

          rws[i] = rws[N - i - 1];
          rws[N - i - 1] = t;

          t = iws[i];

          iws[i] = -iws[N - i - 1];
          iws[N - i - 1] = -t;
        }
      };

      FFTM.prototype.normalize13b = function normalize13b (ws, N) {
        var carry = 0;
        for (var i = 0; i < N / 2; i++) {
          var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
            Math.round(ws[2 * i] / N) +
            carry;

          ws[i] = w & 0x3ffffff;

          if (w < 0x4000000) {
            carry = 0;
          } else {
            carry = w / 0x4000000 | 0;
          }
        }

        return ws;
      };

      FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
        var carry = 0;
        for (var i = 0; i < len; i++) {
          carry = carry + (ws[i] | 0);

          rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
          rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
        }

        // Pad with zeroes
        for (i = 2 * len; i < N; ++i) {
          rws[i] = 0;
        }

        assert(carry === 0);
        assert((carry & ~0x1fff) === 0);
      };

      FFTM.prototype.stub = function stub (N) {
        var ph = new Array(N);
        for (var i = 0; i < N; i++) {
          ph[i] = 0;
        }

        return ph;
      };

      FFTM.prototype.mulp = function mulp (x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length);

        var rbt = this.makeRBT(N);

        var _ = this.stub(N);

        var rws = new Array(N);
        var rwst = new Array(N);
        var iwst = new Array(N);

        var nrws = new Array(N);
        var nrwst = new Array(N);
        var niwst = new Array(N);

        var rmws = out.words;
        rmws.length = N;

        this.convert13b(x.words, x.length, rws, N);
        this.convert13b(y.words, y.length, nrws, N);

        this.transform(rws, _, rwst, iwst, N, rbt);
        this.transform(nrws, _, nrwst, niwst, N, rbt);

        for (var i = 0; i < N; i++) {
          var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
          iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
          rwst[i] = rx;
        }

        this.conjugate(rwst, iwst, N);
        this.transform(rwst, iwst, rmws, _, N, rbt);
        this.conjugate(rmws, _, N);
        this.normalize13b(rmws, N);

        out.negative = x.negative ^ y.negative;
        out.length = x.length + y.length;
        return out.strip();
      };

      // Multiply `this` by `num`
      BN.prototype.mul = function mul (num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return this.mulTo(num, out);
      };

      // Multiply employing FFT
      BN.prototype.mulf = function mulf (num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return jumboMulTo(this, num, out);
      };

      // In-place Multiplication
      BN.prototype.imul = function imul (num) {
        return this.clone().mulTo(num, this);
      };

      BN.prototype.imuln = function imuln (num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);

        // Carry
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var w = (this.words[i] | 0) * num;
          var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
          carry >>= 26;
          carry += (w / 0x4000000) | 0;
          // NOTE: lo is 27bit maximum
          carry += lo >>> 26;
          this.words[i] = lo & 0x3ffffff;
        }

        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }

        return this;
      };

      BN.prototype.muln = function muln (num) {
        return this.clone().imuln(num);
      };

      // `this` * `this`
      BN.prototype.sqr = function sqr () {
        return this.mul(this);
      };

      // `this` * `this` in-place
      BN.prototype.isqr = function isqr () {
        return this.imul(this.clone());
      };

      // Math.pow(`this`, `num`)
      BN.prototype.pow = function pow (num) {
        var w = toBitArray(num);
        if (w.length === 0) return new BN(1);

        // Skip leading zeroes
        var res = this;
        for (var i = 0; i < w.length; i++, res = res.sqr()) {
          if (w[i] !== 0) break;
        }

        if (++i < w.length) {
          for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
            if (w[i] === 0) continue;

            res = res.mul(q);
          }
        }

        return res;
      };

      // Shift-left in-place
      BN.prototype.iushln = function iushln (bits) {
        assert(typeof bits === 'number' && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
        var i;

        if (r !== 0) {
          var carry = 0;

          for (i = 0; i < this.length; i++) {
            var newCarry = this.words[i] & carryMask;
            var c = ((this.words[i] | 0) - newCarry) << r;
            this.words[i] = c | carry;
            carry = newCarry >>> (26 - r);
          }

          if (carry) {
            this.words[i] = carry;
            this.length++;
          }
        }

        if (s !== 0) {
          for (i = this.length - 1; i >= 0; i--) {
            this.words[i + s] = this.words[i];
          }

          for (i = 0; i < s; i++) {
            this.words[i] = 0;
          }

          this.length += s;
        }

        return this.strip();
      };

      BN.prototype.ishln = function ishln (bits) {
        // TODO(indutny): implement me
        assert(this.negative === 0);
        return this.iushln(bits);
      };

      // Shift-right in-place
      // NOTE: `hint` is a lowest bit before trailing zeroes
      // NOTE: if `extended` is present - it will be filled with destroyed bits
      BN.prototype.iushrn = function iushrn (bits, hint, extended) {
        assert(typeof bits === 'number' && bits >= 0);
        var h;
        if (hint) {
          h = (hint - (hint % 26)) / 26;
        } else {
          h = 0;
        }

        var r = bits % 26;
        var s = Math.min((bits - r) / 26, this.length);
        var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
        var maskedWords = extended;

        h -= s;
        h = Math.max(0, h);

        // Extended mode, copy masked part
        if (maskedWords) {
          for (var i = 0; i < s; i++) {
            maskedWords.words[i] = this.words[i];
          }
          maskedWords.length = s;
        }

        if (s === 0) ; else if (this.length > s) {
          this.length -= s;
          for (i = 0; i < this.length; i++) {
            this.words[i] = this.words[i + s];
          }
        } else {
          this.words[0] = 0;
          this.length = 1;
        }

        var carry = 0;
        for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
          var word = this.words[i] | 0;
          this.words[i] = (carry << (26 - r)) | (word >>> r);
          carry = word & mask;
        }

        // Push carried bits as a mask
        if (maskedWords && carry !== 0) {
          maskedWords.words[maskedWords.length++] = carry;
        }

        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }

        return this.strip();
      };

      BN.prototype.ishrn = function ishrn (bits, hint, extended) {
        // TODO(indutny): implement me
        assert(this.negative === 0);
        return this.iushrn(bits, hint, extended);
      };

      // Shift-left
      BN.prototype.shln = function shln (bits) {
        return this.clone().ishln(bits);
      };

      BN.prototype.ushln = function ushln (bits) {
        return this.clone().iushln(bits);
      };

      // Shift-right
      BN.prototype.shrn = function shrn (bits) {
        return this.clone().ishrn(bits);
      };

      BN.prototype.ushrn = function ushrn (bits) {
        return this.clone().iushrn(bits);
      };

      // Test if n bit is set
      BN.prototype.testn = function testn (bit) {
        assert(typeof bit === 'number' && bit >= 0);
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;

        // Fast case: bit is much higher than all existing words
        if (this.length <= s) return false;

        // Check bit and return
        var w = this.words[s];

        return !!(w & q);
      };

      // Return only lowers bits of number (in-place)
      BN.prototype.imaskn = function imaskn (bits) {
        assert(typeof bits === 'number' && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;

        assert(this.negative === 0, 'imaskn works only with positive numbers');

        if (this.length <= s) {
          return this;
        }

        if (r !== 0) {
          s++;
        }
        this.length = Math.min(s, this.length);

        if (r !== 0) {
          var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
          this.words[this.length - 1] &= mask;
        }

        return this.strip();
      };

      // Return only lowers bits of number
      BN.prototype.maskn = function maskn (bits) {
        return this.clone().imaskn(bits);
      };

      // Add plain number `num` to `this`
      BN.prototype.iaddn = function iaddn (num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        if (num < 0) return this.isubn(-num);

        // Possible sign change
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num) {
            this.words[0] = num - (this.words[0] | 0);
            this.negative = 0;
            return this;
          }

          this.negative = 0;
          this.isubn(num);
          this.negative = 1;
          return this;
        }

        // Add without checks
        return this._iaddn(num);
      };

      BN.prototype._iaddn = function _iaddn (num) {
        this.words[0] += num;

        // Carry
        for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
          this.words[i] -= 0x4000000;
          if (i === this.length - 1) {
            this.words[i + 1] = 1;
          } else {
            this.words[i + 1]++;
          }
        }
        this.length = Math.max(this.length, i + 1);

        return this;
      };

      // Subtract plain number `num` from `this`
      BN.prototype.isubn = function isubn (num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        if (num < 0) return this.iaddn(-num);

        if (this.negative !== 0) {
          this.negative = 0;
          this.iaddn(num);
          this.negative = 1;
          return this;
        }

        this.words[0] -= num;

        if (this.length === 1 && this.words[0] < 0) {
          this.words[0] = -this.words[0];
          this.negative = 1;
        } else {
          // Carry
          for (var i = 0; i < this.length && this.words[i] < 0; i++) {
            this.words[i] += 0x4000000;
            this.words[i + 1] -= 1;
          }
        }

        return this.strip();
      };

      BN.prototype.addn = function addn (num) {
        return this.clone().iaddn(num);
      };

      BN.prototype.subn = function subn (num) {
        return this.clone().isubn(num);
      };

      BN.prototype.iabs = function iabs () {
        this.negative = 0;

        return this;
      };

      BN.prototype.abs = function abs () {
        return this.clone().iabs();
      };

      BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
        var len = num.length + shift;
        var i;

        this._expand(len);

        var w;
        var carry = 0;
        for (i = 0; i < num.length; i++) {
          w = (this.words[i + shift] | 0) + carry;
          var right = (num.words[i] | 0) * mul;
          w -= right & 0x3ffffff;
          carry = (w >> 26) - ((right / 0x4000000) | 0);
          this.words[i + shift] = w & 0x3ffffff;
        }
        for (; i < this.length - shift; i++) {
          w = (this.words[i + shift] | 0) + carry;
          carry = w >> 26;
          this.words[i + shift] = w & 0x3ffffff;
        }

        if (carry === 0) return this.strip();

        // Subtraction overflow
        assert(carry === -1);
        carry = 0;
        for (i = 0; i < this.length; i++) {
          w = -(this.words[i] | 0) + carry;
          carry = w >> 26;
          this.words[i] = w & 0x3ffffff;
        }
        this.negative = 1;

        return this.strip();
      };

      BN.prototype._wordDiv = function _wordDiv (num, mode) {
        var shift = this.length - num.length;

        var a = this.clone();
        var b = num;

        // Normalize
        var bhi = b.words[b.length - 1] | 0;
        var bhiBits = this._countBits(bhi);
        shift = 26 - bhiBits;
        if (shift !== 0) {
          b = b.ushln(shift);
          a.iushln(shift);
          bhi = b.words[b.length - 1] | 0;
        }

        // Initialize quotient
        var m = a.length - b.length;
        var q;

        if (mode !== 'mod') {
          q = new BN(null);
          q.length = m + 1;
          q.words = new Array(q.length);
          for (var i = 0; i < q.length; i++) {
            q.words[i] = 0;
          }
        }

        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          a = diff;
          if (q) {
            q.words[m] = 1;
          }
        }

        for (var j = m - 1; j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 0x4000000 +
            (a.words[b.length + j - 1] | 0);

          // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
          // (0x7ffffff)
          qj = Math.min((qj / bhi) | 0, 0x3ffffff);

          a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0) {
            qj--;
            a.negative = 0;
            a._ishlnsubmul(b, 1, j);
            if (!a.isZero()) {
              a.negative ^= 1;
            }
          }
          if (q) {
            q.words[j] = qj;
          }
        }
        if (q) {
          q.strip();
        }
        a.strip();

        // Denormalize
        if (mode !== 'div' && shift !== 0) {
          a.iushrn(shift);
        }

        return {
          div: q || null,
          mod: a
        };
      };

      // NOTE: 1) `mode` can be set to `mod` to request mod only,
      //       to `div` to request div only, or be absent to
      //       request both div & mod
      //       2) `positive` is true if unsigned mod is requested
      BN.prototype.divmod = function divmod (num, mode, positive) {
        assert(!num.isZero());

        if (this.isZero()) {
          return {
            div: new BN(0),
            mod: new BN(0)
          };
        }

        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          res = this.neg().divmod(num, mode);

          if (mode !== 'mod') {
            div = res.div.neg();
          }

          if (mode !== 'div') {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.iadd(num);
            }
          }

          return {
            div: div,
            mod: mod
          };
        }

        if (this.negative === 0 && num.negative !== 0) {
          res = this.divmod(num.neg(), mode);

          if (mode !== 'mod') {
            div = res.div.neg();
          }

          return {
            div: div,
            mod: res.mod
          };
        }

        if ((this.negative & num.negative) !== 0) {
          res = this.neg().divmod(num.neg(), mode);

          if (mode !== 'div') {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.isub(num);
            }
          }

          return {
            div: res.div,
            mod: mod
          };
        }

        // Both numbers are positive at this point

        // Strip both numbers to approximate shift value
        if (num.length > this.length || this.cmp(num) < 0) {
          return {
            div: new BN(0),
            mod: this
          };
        }

        // Very short reduction
        if (num.length === 1) {
          if (mode === 'div') {
            return {
              div: this.divn(num.words[0]),
              mod: null
            };
          }

          if (mode === 'mod') {
            return {
              div: null,
              mod: new BN(this.modn(num.words[0]))
            };
          }

          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modn(num.words[0]))
          };
        }

        return this._wordDiv(num, mode);
      };

      // Find `this` / `num`
      BN.prototype.div = function div (num) {
        return this.divmod(num, 'div', false).div;
      };

      // Find `this` % `num`
      BN.prototype.mod = function mod (num) {
        return this.divmod(num, 'mod', false).mod;
      };

      BN.prototype.umod = function umod (num) {
        return this.divmod(num, 'mod', true).mod;
      };

      // Find Round(`this` / `num`)
      BN.prototype.divRound = function divRound (num) {
        var dm = this.divmod(num);

        // Fast case - exact division
        if (dm.mod.isZero()) return dm.div;

        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

        var half = num.ushrn(1);
        var r2 = num.andln(1);
        var cmp = mod.cmp(half);

        // Round down
        if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

        // Round up
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      };

      BN.prototype.modn = function modn (num) {
        assert(num <= 0x3ffffff);
        var p = (1 << 26) % num;

        var acc = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          acc = (p * acc + (this.words[i] | 0)) % num;
        }

        return acc;
      };

      // In-place division by number
      BN.prototype.idivn = function idivn (num) {
        assert(num <= 0x3ffffff);

        var carry = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var w = (this.words[i] | 0) + carry * 0x4000000;
          this.words[i] = (w / num) | 0;
          carry = w % num;
        }

        return this.strip();
      };

      BN.prototype.divn = function divn (num) {
        return this.clone().idivn(num);
      };

      BN.prototype.egcd = function egcd (p) {
        assert(p.negative === 0);
        assert(!p.isZero());

        var x = this;
        var y = p.clone();

        if (x.negative !== 0) {
          x = x.umod(p);
        } else {
          x = x.clone();
        }

        // A * x + B * y = x
        var A = new BN(1);
        var B = new BN(0);

        // C * x + D * y = y
        var C = new BN(0);
        var D = new BN(1);

        var g = 0;

        while (x.isEven() && y.isEven()) {
          x.iushrn(1);
          y.iushrn(1);
          ++g;
        }

        var yp = y.clone();
        var xp = x.clone();

        while (!x.isZero()) {
          for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
          if (i > 0) {
            x.iushrn(i);
            while (i-- > 0) {
              if (A.isOdd() || B.isOdd()) {
                A.iadd(yp);
                B.isub(xp);
              }

              A.iushrn(1);
              B.iushrn(1);
            }
          }

          for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd()) {
                C.iadd(yp);
                D.isub(xp);
              }

              C.iushrn(1);
              D.iushrn(1);
            }
          }

          if (x.cmp(y) >= 0) {
            x.isub(y);
            A.isub(C);
            B.isub(D);
          } else {
            y.isub(x);
            C.isub(A);
            D.isub(B);
          }
        }

        return {
          a: C,
          b: D,
          gcd: y.iushln(g)
        };
      };

      // This is reduced incarnation of the binary EEA
      // above, designated to invert members of the
      // _prime_ fields F(p) at a maximal speed
      BN.prototype._invmp = function _invmp (p) {
        assert(p.negative === 0);
        assert(!p.isZero());

        var a = this;
        var b = p.clone();

        if (a.negative !== 0) {
          a = a.umod(p);
        } else {
          a = a.clone();
        }

        var x1 = new BN(1);
        var x2 = new BN(0);

        var delta = b.clone();

        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
          if (i > 0) {
            a.iushrn(i);
            while (i-- > 0) {
              if (x1.isOdd()) {
                x1.iadd(delta);
              }

              x1.iushrn(1);
            }
          }

          for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd()) {
                x2.iadd(delta);
              }

              x2.iushrn(1);
            }
          }

          if (a.cmp(b) >= 0) {
            a.isub(b);
            x1.isub(x2);
          } else {
            b.isub(a);
            x2.isub(x1);
          }
        }

        var res;
        if (a.cmpn(1) === 0) {
          res = x1;
        } else {
          res = x2;
        }

        if (res.cmpn(0) < 0) {
          res.iadd(p);
        }

        return res;
      };

      BN.prototype.gcd = function gcd (num) {
        if (this.isZero()) return num.abs();
        if (num.isZero()) return this.abs();

        var a = this.clone();
        var b = num.clone();
        a.negative = 0;
        b.negative = 0;

        // Remove common factor of two
        for (var shift = 0; a.isEven() && b.isEven(); shift++) {
          a.iushrn(1);
          b.iushrn(1);
        }

        do {
          while (a.isEven()) {
            a.iushrn(1);
          }
          while (b.isEven()) {
            b.iushrn(1);
          }

          var r = a.cmp(b);
          if (r < 0) {
            // Swap `a` and `b` to make `a` always bigger than `b`
            var t = a;
            a = b;
            b = t;
          } else if (r === 0 || b.cmpn(1) === 0) {
            break;
          }

          a.isub(b);
        } while (true);

        return b.iushln(shift);
      };

      // Invert number in the field F(num)
      BN.prototype.invm = function invm (num) {
        return this.egcd(num).a.umod(num);
      };

      BN.prototype.isEven = function isEven () {
        return (this.words[0] & 1) === 0;
      };

      BN.prototype.isOdd = function isOdd () {
        return (this.words[0] & 1) === 1;
      };

      // And first word and num
      BN.prototype.andln = function andln (num) {
        return this.words[0] & num;
      };

      // Increment at the bit position in-line
      BN.prototype.bincn = function bincn (bit) {
        assert(typeof bit === 'number');
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;

        // Fast case: bit is much higher than all existing words
        if (this.length <= s) {
          this._expand(s + 1);
          this.words[s] |= q;
          return this;
        }

        // Add bit and propagate, if needed
        var carry = q;
        for (var i = s; carry !== 0 && i < this.length; i++) {
          var w = this.words[i] | 0;
          w += carry;
          carry = w >>> 26;
          w &= 0x3ffffff;
          this.words[i] = w;
        }
        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }
        return this;
      };

      BN.prototype.isZero = function isZero () {
        return this.length === 1 && this.words[0] === 0;
      };

      BN.prototype.cmpn = function cmpn (num) {
        var negative = num < 0;

        if (this.negative !== 0 && !negative) return -1;
        if (this.negative === 0 && negative) return 1;

        this.strip();

        var res;
        if (this.length > 1) {
          res = 1;
        } else {
          if (negative) {
            num = -num;
          }

          assert(num <= 0x3ffffff, 'Number is too big');

          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0) return -res | 0;
        return res;
      };

      // Compare two numbers and return:
      // 1 - if `this` > `num`
      // 0 - if `this` == `num`
      // -1 - if `this` < `num`
      BN.prototype.cmp = function cmp (num) {
        if (this.negative !== 0 && num.negative === 0) return -1;
        if (this.negative === 0 && num.negative !== 0) return 1;

        var res = this.ucmp(num);
        if (this.negative !== 0) return -res | 0;
        return res;
      };

      // Unsigned comparison
      BN.prototype.ucmp = function ucmp (num) {
        // At this point both numbers have the same sign
        if (this.length > num.length) return 1;
        if (this.length < num.length) return -1;

        var res = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var a = this.words[i] | 0;
          var b = num.words[i] | 0;

          if (a === b) continue;
          if (a < b) {
            res = -1;
          } else if (a > b) {
            res = 1;
          }
          break;
        }
        return res;
      };

      BN.prototype.gtn = function gtn (num) {
        return this.cmpn(num) === 1;
      };

      BN.prototype.gt = function gt (num) {
        return this.cmp(num) === 1;
      };

      BN.prototype.gten = function gten (num) {
        return this.cmpn(num) >= 0;
      };

      BN.prototype.gte = function gte (num) {
        return this.cmp(num) >= 0;
      };

      BN.prototype.ltn = function ltn (num) {
        return this.cmpn(num) === -1;
      };

      BN.prototype.lt = function lt (num) {
        return this.cmp(num) === -1;
      };

      BN.prototype.lten = function lten (num) {
        return this.cmpn(num) <= 0;
      };

      BN.prototype.lte = function lte (num) {
        return this.cmp(num) <= 0;
      };

      BN.prototype.eqn = function eqn (num) {
        return this.cmpn(num) === 0;
      };

      BN.prototype.eq = function eq (num) {
        return this.cmp(num) === 0;
      };

      //
      // A reduce context, could be using montgomery or something better, depending
      // on the `m` itself.
      //
      BN.red = function red (num) {
        return new Red(num);
      };

      BN.prototype.toRed = function toRed (ctx) {
        assert(!this.red, 'Already a number in reduction context');
        assert(this.negative === 0, 'red works only with positives');
        return ctx.convertTo(this)._forceRed(ctx);
      };

      BN.prototype.fromRed = function fromRed () {
        assert(this.red, 'fromRed works only with numbers in reduction context');
        return this.red.convertFrom(this);
      };

      BN.prototype._forceRed = function _forceRed (ctx) {
        this.red = ctx;
        return this;
      };

      BN.prototype.forceRed = function forceRed (ctx) {
        assert(!this.red, 'Already a number in reduction context');
        return this._forceRed(ctx);
      };

      BN.prototype.redAdd = function redAdd (num) {
        assert(this.red, 'redAdd works only with red numbers');
        return this.red.add(this, num);
      };

      BN.prototype.redIAdd = function redIAdd (num) {
        assert(this.red, 'redIAdd works only with red numbers');
        return this.red.iadd(this, num);
      };

      BN.prototype.redSub = function redSub (num) {
        assert(this.red, 'redSub works only with red numbers');
        return this.red.sub(this, num);
      };

      BN.prototype.redISub = function redISub (num) {
        assert(this.red, 'redISub works only with red numbers');
        return this.red.isub(this, num);
      };

      BN.prototype.redShl = function redShl (num) {
        assert(this.red, 'redShl works only with red numbers');
        return this.red.shl(this, num);
      };

      BN.prototype.redMul = function redMul (num) {
        assert(this.red, 'redMul works only with red numbers');
        this.red._verify2(this, num);
        return this.red.mul(this, num);
      };

      BN.prototype.redIMul = function redIMul (num) {
        assert(this.red, 'redMul works only with red numbers');
        this.red._verify2(this, num);
        return this.red.imul(this, num);
      };

      BN.prototype.redSqr = function redSqr () {
        assert(this.red, 'redSqr works only with red numbers');
        this.red._verify1(this);
        return this.red.sqr(this);
      };

      BN.prototype.redISqr = function redISqr () {
        assert(this.red, 'redISqr works only with red numbers');
        this.red._verify1(this);
        return this.red.isqr(this);
      };

      // Square root over p
      BN.prototype.redSqrt = function redSqrt () {
        assert(this.red, 'redSqrt works only with red numbers');
        this.red._verify1(this);
        return this.red.sqrt(this);
      };

      BN.prototype.redInvm = function redInvm () {
        assert(this.red, 'redInvm works only with red numbers');
        this.red._verify1(this);
        return this.red.invm(this);
      };

      // Return negative clone of `this` % `red modulo`
      BN.prototype.redNeg = function redNeg () {
        assert(this.red, 'redNeg works only with red numbers');
        this.red._verify1(this);
        return this.red.neg(this);
      };

      BN.prototype.redPow = function redPow (num) {
        assert(this.red && !num.red, 'redPow(normalNum)');
        this.red._verify1(this);
        return this.red.pow(this, num);
      };

      // Prime numbers with efficient reduction
      var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null
      };

      // Pseudo-Mersenne prime
      function MPrime (name, p) {
        // P = 2 ^ N - K
        this.name = name;
        this.p = new BN(p, 16);
        this.n = this.p.bitLength();
        this.k = new BN(1).iushln(this.n).isub(this.p);

        this.tmp = this._tmp();
      }

      MPrime.prototype._tmp = function _tmp () {
        var tmp = new BN(null);
        tmp.words = new Array(Math.ceil(this.n / 13));
        return tmp;
      };

      MPrime.prototype.ireduce = function ireduce (num) {
        // Assumes that `num` is less than `P^2`
        // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
        var r = num;
        var rlen;

        do {
          this.split(r, this.tmp);
          r = this.imulK(r);
          r = r.iadd(this.tmp);
          rlen = r.bitLength();
        } while (rlen > this.n);

        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0) {
          r.words[0] = 0;
          r.length = 1;
        } else if (cmp > 0) {
          r.isub(this.p);
        } else {
          if (r.strip !== undefined) {
            // r is BN v4 instance
            r.strip();
          } else {
            // r is BN v5 instance
            r._strip();
          }
        }

        return r;
      };

      MPrime.prototype.split = function split (input, out) {
        input.iushrn(this.n, 0, out);
      };

      MPrime.prototype.imulK = function imulK (num) {
        return num.imul(this.k);
      };

      function K256 () {
        MPrime.call(
          this,
          'k256',
          'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
      }
      inherits(K256, MPrime);

      K256.prototype.split = function split (input, output) {
        // 256 = 9 * 26 + 22
        var mask = 0x3fffff;

        var outLen = Math.min(input.length, 9);
        for (var i = 0; i < outLen; i++) {
          output.words[i] = input.words[i];
        }
        output.length = outLen;

        if (input.length <= 9) {
          input.words[0] = 0;
          input.length = 1;
          return;
        }

        // Shift by 9 limbs
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;

        for (i = 10; i < input.length; i++) {
          var next = input.words[i] | 0;
          input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
          prev = next;
        }
        prev >>>= 22;
        input.words[i - 10] = prev;
        if (prev === 0 && input.length > 10) {
          input.length -= 10;
        } else {
          input.length -= 9;
        }
      };

      K256.prototype.imulK = function imulK (num) {
        // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
        num.words[num.length] = 0;
        num.words[num.length + 1] = 0;
        num.length += 2;

        // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
        var lo = 0;
        for (var i = 0; i < num.length; i++) {
          var w = num.words[i] | 0;
          lo += w * 0x3d1;
          num.words[i] = lo & 0x3ffffff;
          lo = w * 0x40 + ((lo / 0x4000000) | 0);
        }

        // Fast length reduction
        if (num.words[num.length - 1] === 0) {
          num.length--;
          if (num.words[num.length - 1] === 0) {
            num.length--;
          }
        }
        return num;
      };

      function P224 () {
        MPrime.call(
          this,
          'p224',
          'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
      }
      inherits(P224, MPrime);

      function P192 () {
        MPrime.call(
          this,
          'p192',
          'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
      }
      inherits(P192, MPrime);

      function P25519 () {
        // 2 ^ 255 - 19
        MPrime.call(
          this,
          '25519',
          '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
      }
      inherits(P25519, MPrime);

      P25519.prototype.imulK = function imulK (num) {
        // K = 0x13
        var carry = 0;
        for (var i = 0; i < num.length; i++) {
          var hi = (num.words[i] | 0) * 0x13 + carry;
          var lo = hi & 0x3ffffff;
          hi >>>= 26;

          num.words[i] = lo;
          carry = hi;
        }
        if (carry !== 0) {
          num.words[num.length++] = carry;
        }
        return num;
      };

      // Exported mostly for testing purposes, use plain name instead
      BN._prime = function prime (name) {
        // Cached version of prime
        if (primes[name]) return primes[name];

        var prime;
        if (name === 'k256') {
          prime = new K256();
        } else if (name === 'p224') {
          prime = new P224();
        } else if (name === 'p192') {
          prime = new P192();
        } else if (name === 'p25519') {
          prime = new P25519();
        } else {
          throw new Error('Unknown prime ' + name);
        }
        primes[name] = prime;

        return prime;
      };

      //
      // Base reduction engine
      //
      function Red (m) {
        if (typeof m === 'string') {
          var prime = BN._prime(m);
          this.m = prime.p;
          this.prime = prime;
        } else {
          assert(m.gtn(1), 'modulus must be greater than 1');
          this.m = m;
          this.prime = null;
        }
      }

      Red.prototype._verify1 = function _verify1 (a) {
        assert(a.negative === 0, 'red works only with positives');
        assert(a.red, 'red works only with red numbers');
      };

      Red.prototype._verify2 = function _verify2 (a, b) {
        assert((a.negative | b.negative) === 0, 'red works only with positives');
        assert(a.red && a.red === b.red,
          'red works only with red numbers');
      };

      Red.prototype.imod = function imod (a) {
        if (this.prime) return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      };

      Red.prototype.neg = function neg (a) {
        if (a.isZero()) {
          return a.clone();
        }

        return this.m.sub(a)._forceRed(this);
      };

      Red.prototype.add = function add (a, b) {
        this._verify2(a, b);

        var res = a.add(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res._forceRed(this);
      };

      Red.prototype.iadd = function iadd (a, b) {
        this._verify2(a, b);

        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res;
      };

      Red.prototype.sub = function sub (a, b) {
        this._verify2(a, b);

        var res = a.sub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res._forceRed(this);
      };

      Red.prototype.isub = function isub (a, b) {
        this._verify2(a, b);

        var res = a.isub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res;
      };

      Red.prototype.shl = function shl (a, num) {
        this._verify1(a);
        return this.imod(a.ushln(num));
      };

      Red.prototype.imul = function imul (a, b) {
        this._verify2(a, b);
        return this.imod(a.imul(b));
      };

      Red.prototype.mul = function mul (a, b) {
        this._verify2(a, b);
        return this.imod(a.mul(b));
      };

      Red.prototype.isqr = function isqr (a) {
        return this.imul(a, a.clone());
      };

      Red.prototype.sqr = function sqr (a) {
        return this.mul(a, a);
      };

      Red.prototype.sqrt = function sqrt (a) {
        if (a.isZero()) return a.clone();

        var mod3 = this.m.andln(3);
        assert(mod3 % 2 === 1);

        // Fast case
        if (mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }

        // Tonelli-Shanks algorithm (Totally unoptimized and slow)
        //
        // Find Q and S, that Q * 2 ^ S = (P - 1)
        var q = this.m.subn(1);
        var s = 0;
        while (!q.isZero() && q.andln(1) === 0) {
          s++;
          q.iushrn(1);
        }
        assert(!q.isZero());

        var one = new BN(1).toRed(this);
        var nOne = one.redNeg();

        // Find quadratic non-residue
        // NOTE: Max is such because of generalized Riemann hypothesis.
        var lpow = this.m.subn(1).iushrn(1);
        var z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);

        while (this.pow(z, lpow).cmp(nOne) !== 0) {
          z.redIAdd(nOne);
        }

        var c = this.pow(z, q);
        var r = this.pow(a, q.addn(1).iushrn(1));
        var t = this.pow(a, q);
        var m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i = 0; tmp.cmp(one) !== 0; i++) {
            tmp = tmp.redSqr();
          }
          assert(i < m);
          var b = this.pow(c, new BN(1).iushln(m - i - 1));

          r = r.redMul(b);
          c = b.redSqr();
          t = t.redMul(c);
          m = i;
        }

        return r;
      };

      Red.prototype.invm = function invm (a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0) {
          inv.negative = 0;
          return this.imod(inv).redNeg();
        } else {
          return this.imod(inv);
        }
      };

      Red.prototype.pow = function pow (a, num) {
        if (num.isZero()) return new BN(1).toRed(this);
        if (num.cmpn(1) === 0) return a.clone();

        var windowSize = 4;
        var wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this);
        wnd[1] = a;
        for (var i = 2; i < wnd.length; i++) {
          wnd[i] = this.mul(wnd[i - 1], a);
        }

        var res = wnd[0];
        var current = 0;
        var currentLen = 0;
        var start = num.bitLength() % 26;
        if (start === 0) {
          start = 26;
        }

        for (i = num.length - 1; i >= 0; i--) {
          var word = num.words[i];
          for (var j = start - 1; j >= 0; j--) {
            var bit = (word >> j) & 1;
            if (res !== wnd[0]) {
              res = this.sqr(res);
            }

            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }

            current <<= 1;
            current |= bit;
            currentLen++;
            if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

            res = this.mul(res, wnd[current]);
            currentLen = 0;
            current = 0;
          }
          start = 26;
        }

        return res;
      };

      Red.prototype.convertTo = function convertTo (num) {
        var r = num.umod(this.m);

        return r === num ? r.clone() : r;
      };

      Red.prototype.convertFrom = function convertFrom (num) {
        var res = num.clone();
        res.red = null;
        return res;
      };

      //
      // Montgomery method engine
      //

      BN.mont = function mont (num) {
        return new Mont(num);
      };

      function Mont (m) {
        Red.call(this, m);

        this.shift = this.m.bitLength();
        if (this.shift % 26 !== 0) {
          this.shift += 26 - (this.shift % 26);
        }

        this.r = new BN(1).iushln(this.shift);
        this.r2 = this.imod(this.r.sqr());
        this.rinv = this.r._invmp(this.m);

        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
        this.minv = this.minv.umod(this.r);
        this.minv = this.r.sub(this.minv);
      }
      inherits(Mont, Red);

      Mont.prototype.convertTo = function convertTo (num) {
        return this.imod(num.ushln(this.shift));
      };

      Mont.prototype.convertFrom = function convertFrom (num) {
        var r = this.imod(num.mul(this.rinv));
        r.red = null;
        return r;
      };

      Mont.prototype.imul = function imul (a, b) {
        if (a.isZero() || b.isZero()) {
          a.words[0] = 0;
          a.length = 1;
          return a;
        }

        var t = a.imul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;

        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }

        return res._forceRed(this);
      };

      Mont.prototype.mul = function mul (a, b) {
        if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

        var t = a.mul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }

        return res._forceRed(this);
      };

      Mont.prototype.invm = function invm (a) {
        // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })( module, commonjsGlobal);
    });

    const version = "logger/5.0.8";

    let _permanentCensorErrors = false;
    let _censorErrors = false;
    const LogLevels = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };
    let _logLevel = LogLevels["default"];
    let _globalLogger = null;
    function _checkNormalize() {
        try {
            const missing = [];
            // Make sure all forms of normalization are supported
            ["NFD", "NFC", "NFKD", "NFKC"].forEach((form) => {
                try {
                    if ("test".normalize(form) !== "test") {
                        throw new Error("bad normalize");
                    }
                    ;
                }
                catch (error) {
                    missing.push(form);
                }
            });
            if (missing.length) {
                throw new Error("missing " + missing.join(", "));
            }
            if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
                throw new Error("broken implementation");
            }
        }
        catch (error) {
            return error.message;
        }
        return null;
    }
    const _normalizeError = _checkNormalize();
    var LogLevel;
    (function (LogLevel) {
        LogLevel["DEBUG"] = "DEBUG";
        LogLevel["INFO"] = "INFO";
        LogLevel["WARNING"] = "WARNING";
        LogLevel["ERROR"] = "ERROR";
        LogLevel["OFF"] = "OFF";
    })(LogLevel || (LogLevel = {}));
    var ErrorCode;
    (function (ErrorCode) {
        ///////////////////
        // Generic Errors
        // Unknown Error
        ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
        // Not Implemented
        ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
        // Unsupported Operation
        //   - operation
        ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
        // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
        //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
        ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
        // Some sort of bad response from the server
        ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
        // Timeout
        ErrorCode["TIMEOUT"] = "TIMEOUT";
        ///////////////////
        // Operational  Errors
        // Buffer Overrun
        ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
        // Numeric Fault
        //   - operation: the operation being executed
        //   - fault: the reason this faulted
        ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT";
        ///////////////////
        // Argument Errors
        // Missing new operator to an object
        //  - name: The name of the class
        ErrorCode["MISSING_NEW"] = "MISSING_NEW";
        // Invalid argument (e.g. value is incompatible with type) to a function:
        //   - argument: The argument name that was invalid
        //   - value: The value of the argument
        ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
        // Missing argument to a function:
        //   - count: The number of arguments received
        //   - expectedCount: The number of arguments expected
        ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
        // Too many arguments
        //   - count: The number of arguments received
        //   - expectedCount: The number of arguments expected
        ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
        ///////////////////
        // Blockchain Errors
        // Call exception
        //  - transaction: the transaction
        //  - address?: the contract address
        //  - args?: The arguments passed into the function
        //  - method?: The Solidity method signature
        //  - errorSignature?: The EIP848 error signature
        //  - errorArgs?: The EIP848 error parameters
        //  - reason: The reason (only for EIP848 "Error(string)")
        ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION";
        // Insufficien funds (< value + gasLimit * gasPrice)
        //   - transaction: the transaction attempted
        ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
        // Nonce has already been used
        //   - transaction: the transaction attempted
        ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED";
        // The replacement fee for the transaction is too low
        //   - transaction: the transaction attempted
        ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
        // The gas limit could not be estimated
        //   - transaction: the transaction passed to estimateGas
        ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
    })(ErrorCode || (ErrorCode = {}));
    class Logger {
        constructor(version) {
            Object.defineProperty(this, "version", {
                enumerable: true,
                value: version,
                writable: false
            });
        }
        _log(logLevel, args) {
            const level = logLevel.toLowerCase();
            if (LogLevels[level] == null) {
                this.throwArgumentError("invalid log level name", "logLevel", logLevel);
            }
            if (_logLevel > LogLevels[level]) {
                return;
            }
            console.log.apply(console, args);
        }
        debug(...args) {
            this._log(Logger.levels.DEBUG, args);
        }
        info(...args) {
            this._log(Logger.levels.INFO, args);
        }
        warn(...args) {
            this._log(Logger.levels.WARNING, args);
        }
        makeError(message, code, params) {
            // Errors are being censored
            if (_censorErrors) {
                return this.makeError("censored error", code, {});
            }
            if (!code) {
                code = Logger.errors.UNKNOWN_ERROR;
            }
            if (!params) {
                params = {};
            }
            const messageDetails = [];
            Object.keys(params).forEach((key) => {
                try {
                    messageDetails.push(key + "=" + JSON.stringify(params[key]));
                }
                catch (error) {
                    messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
                }
            });
            messageDetails.push(`code=${code}`);
            messageDetails.push(`version=${this.version}`);
            const reason = message;
            if (messageDetails.length) {
                message += " (" + messageDetails.join(", ") + ")";
            }
            // @TODO: Any??
            const error = new Error(message);
            error.reason = reason;
            error.code = code;
            Object.keys(params).forEach(function (key) {
                error[key] = params[key];
            });
            return error;
        }
        throwError(message, code, params) {
            throw this.makeError(message, code, params);
        }
        throwArgumentError(message, name, value) {
            return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
                argument: name,
                value: value
            });
        }
        assert(condition, message, code, params) {
            if (!!condition) {
                return;
            }
            this.throwError(message, code, params);
        }
        assertArgument(condition, message, name, value) {
            if (!!condition) {
                return;
            }
            this.throwArgumentError(message, name, value);
        }
        checkNormalize(message) {
            if (_normalizeError) {
                this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "String.prototype.normalize", form: _normalizeError
                });
            }
        }
        checkSafeUint53(value, message) {
            if (typeof (value) !== "number") {
                return;
            }
            if (message == null) {
                message = "value not safe";
            }
            if (value < 0 || value >= 0x1fffffffffffff) {
                this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                    operation: "checkSafeInteger",
                    fault: "out-of-safe-range",
                    value: value
                });
            }
            if (value % 1) {
                this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                    operation: "checkSafeInteger",
                    fault: "non-integer",
                    value: value
                });
            }
        }
        checkArgumentCount(count, expectedCount, message) {
            if (message) {
                message = ": " + message;
            }
            else {
                message = "";
            }
            if (count < expectedCount) {
                this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
                    count: count,
                    expectedCount: expectedCount
                });
            }
            if (count > expectedCount) {
                this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
                    count: count,
                    expectedCount: expectedCount
                });
            }
        }
        checkNew(target, kind) {
            if (target === Object || target == null) {
                this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
            }
        }
        checkAbstract(target, kind) {
            if (target === kind) {
                this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
            }
            else if (target === Object || target == null) {
                this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
            }
        }
        static globalLogger() {
            if (!_globalLogger) {
                _globalLogger = new Logger(version);
            }
            return _globalLogger;
        }
        static setCensorship(censorship, permanent) {
            if (!censorship && permanent) {
                this.globalLogger().throwError("cannot permanently disable censorship", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "setCensorship"
                });
            }
            if (_permanentCensorErrors) {
                if (!censorship) {
                    return;
                }
                this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "setCensorship"
                });
            }
            _censorErrors = !!censorship;
            _permanentCensorErrors = !!permanent;
        }
        static setLogLevel(logLevel) {
            const level = LogLevels[logLevel.toLowerCase()];
            if (level == null) {
                Logger.globalLogger().warn("invalid log level - " + logLevel);
                return;
            }
            _logLevel = level;
        }
        static from(version) {
            return new Logger(version);
        }
    }
    Logger.errors = ErrorCode;
    Logger.levels = LogLevel;

    const version$1 = "bytes/5.0.9";

    const logger = new Logger(version$1);
    ///////////////////////////////
    function isHexable(value) {
        return !!(value.toHexString);
    }
    function addSlice(array) {
        if (array.slice) {
            return array;
        }
        array.slice = function () {
            const args = Array.prototype.slice.call(arguments);
            return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
        };
        return array;
    }
    function isBytes(value) {
        if (value == null) {
            return false;
        }
        if (value.constructor === Uint8Array) {
            return true;
        }
        if (typeof (value) === "string") {
            return false;
        }
        if (value.length == null) {
            return false;
        }
        for (let i = 0; i < value.length; i++) {
            const v = value[i];
            if (typeof (v) !== "number" || v < 0 || v >= 256 || (v % 1)) {
                return false;
            }
        }
        return true;
    }
    function arrayify(value, options) {
        if (!options) {
            options = {};
        }
        if (typeof (value) === "number") {
            logger.checkSafeUint53(value, "invalid arrayify value");
            const result = [];
            while (value) {
                result.unshift(value & 0xff);
                value = parseInt(String(value / 256));
            }
            if (result.length === 0) {
                result.push(0);
            }
            return addSlice(new Uint8Array(result));
        }
        if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
            value = "0x" + value;
        }
        if (isHexable(value)) {
            value = value.toHexString();
        }
        if (isHexString(value)) {
            let hex = value.substring(2);
            if (hex.length % 2) {
                if (options.hexPad === "left") {
                    hex = "0x0" + hex.substring(2);
                }
                else if (options.hexPad === "right") {
                    hex += "0";
                }
                else {
                    logger.throwArgumentError("hex data is odd-length", "value", value);
                }
            }
            const result = [];
            for (let i = 0; i < hex.length; i += 2) {
                result.push(parseInt(hex.substring(i, i + 2), 16));
            }
            return addSlice(new Uint8Array(result));
        }
        if (isBytes(value)) {
            return addSlice(new Uint8Array(value));
        }
        return logger.throwArgumentError("invalid arrayify value", "value", value);
    }
    function isHexString(value, length) {
        if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
            return false;
        }
        if (length && value.length !== 2 + 2 * length) {
            return false;
        }
        return true;
    }
    const HexCharacters = "0123456789abcdef";
    function hexlify(value, options) {
        if (!options) {
            options = {};
        }
        if (typeof (value) === "number") {
            logger.checkSafeUint53(value, "invalid hexlify value");
            let hex = "";
            while (value) {
                hex = HexCharacters[value & 0x0f] + hex;
                value = Math.floor(value / 16);
            }
            if (hex.length) {
                if (hex.length % 2) {
                    hex = "0" + hex;
                }
                return "0x" + hex;
            }
            return "0x00";
        }
        if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
            value = "0x" + value;
        }
        if (isHexable(value)) {
            return value.toHexString();
        }
        if (isHexString(value)) {
            if (value.length % 2) {
                if (options.hexPad === "left") {
                    value = "0x0" + value.substring(2);
                }
                else if (options.hexPad === "right") {
                    value += "0";
                }
                else {
                    logger.throwArgumentError("hex data is odd-length", "value", value);
                }
            }
            return value.toLowerCase();
        }
        if (isBytes(value)) {
            let result = "0x";
            for (let i = 0; i < value.length; i++) {
                let v = value[i];
                result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
            }
            return result;
        }
        return logger.throwArgumentError("invalid hexlify value", "value", value);
    }
    function hexZeroPad(value, length) {
        if (typeof (value) !== "string") {
            value = hexlify(value);
        }
        else if (!isHexString(value)) {
            logger.throwArgumentError("invalid hex string", "value", value);
        }
        if (value.length > 2 * length + 2) {
            logger.throwArgumentError("value out of range", "value", arguments[1]);
        }
        while (value.length < 2 * length + 2) {
            value = "0x0" + value.substring(2);
        }
        return value;
    }

    const version$2 = "bignumber/5.0.13";

    var BN = bn.BN;
    const logger$1 = new Logger(version$2);
    const _constructorGuard = {};
    const MAX_SAFE = 0x1fffffffffffff;
    function isBigNumberish(value) {
        return (value != null) && (BigNumber.isBigNumber(value) ||
            (typeof (value) === "number" && (value % 1) === 0) ||
            (typeof (value) === "string" && !!value.match(/^-?[0-9]+$/)) ||
            isHexString(value) ||
            (typeof (value) === "bigint") ||
            isBytes(value));
    }
    // Only warn about passing 10 into radix once
    let _warnedToStringRadix = false;
    class BigNumber {
        constructor(constructorGuard, hex) {
            logger$1.checkNew(new.target, BigNumber);
            if (constructorGuard !== _constructorGuard) {
                logger$1.throwError("cannot call constructor directly; use BigNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "new (BigNumber)"
                });
            }
            this._hex = hex;
            this._isBigNumber = true;
            Object.freeze(this);
        }
        fromTwos(value) {
            return toBigNumber(toBN(this).fromTwos(value));
        }
        toTwos(value) {
            return toBigNumber(toBN(this).toTwos(value));
        }
        abs() {
            if (this._hex[0] === "-") {
                return BigNumber.from(this._hex.substring(1));
            }
            return this;
        }
        add(other) {
            return toBigNumber(toBN(this).add(toBN(other)));
        }
        sub(other) {
            return toBigNumber(toBN(this).sub(toBN(other)));
        }
        div(other) {
            const o = BigNumber.from(other);
            if (o.isZero()) {
                throwFault("division by zero", "div");
            }
            return toBigNumber(toBN(this).div(toBN(other)));
        }
        mul(other) {
            return toBigNumber(toBN(this).mul(toBN(other)));
        }
        mod(other) {
            const value = toBN(other);
            if (value.isNeg()) {
                throwFault("cannot modulo negative values", "mod");
            }
            return toBigNumber(toBN(this).umod(value));
        }
        pow(other) {
            const value = toBN(other);
            if (value.isNeg()) {
                throwFault("cannot raise to negative values", "pow");
            }
            return toBigNumber(toBN(this).pow(value));
        }
        and(other) {
            const value = toBN(other);
            if (this.isNegative() || value.isNeg()) {
                throwFault("cannot 'and' negative values", "and");
            }
            return toBigNumber(toBN(this).and(value));
        }
        or(other) {
            const value = toBN(other);
            if (this.isNegative() || value.isNeg()) {
                throwFault("cannot 'or' negative values", "or");
            }
            return toBigNumber(toBN(this).or(value));
        }
        xor(other) {
            const value = toBN(other);
            if (this.isNegative() || value.isNeg()) {
                throwFault("cannot 'xor' negative values", "xor");
            }
            return toBigNumber(toBN(this).xor(value));
        }
        mask(value) {
            if (this.isNegative() || value < 0) {
                throwFault("cannot mask negative values", "mask");
            }
            return toBigNumber(toBN(this).maskn(value));
        }
        shl(value) {
            if (this.isNegative() || value < 0) {
                throwFault("cannot shift negative values", "shl");
            }
            return toBigNumber(toBN(this).shln(value));
        }
        shr(value) {
            if (this.isNegative() || value < 0) {
                throwFault("cannot shift negative values", "shr");
            }
            return toBigNumber(toBN(this).shrn(value));
        }
        eq(other) {
            return toBN(this).eq(toBN(other));
        }
        lt(other) {
            return toBN(this).lt(toBN(other));
        }
        lte(other) {
            return toBN(this).lte(toBN(other));
        }
        gt(other) {
            return toBN(this).gt(toBN(other));
        }
        gte(other) {
            return toBN(this).gte(toBN(other));
        }
        isNegative() {
            return (this._hex[0] === "-");
        }
        isZero() {
            return toBN(this).isZero();
        }
        toNumber() {
            try {
                return toBN(this).toNumber();
            }
            catch (error) {
                throwFault("overflow", "toNumber", this.toString());
            }
            return null;
        }
        toString() {
            // Lots of people expect this, which we do not support, so check (See: #889)
            if (arguments.length > 0) {
                if (arguments[0] === 10) {
                    if (!_warnedToStringRadix) {
                        _warnedToStringRadix = true;
                        logger$1.warn("BigNumber.toString does not accept any parameters; base-10 is assumed");
                    }
                }
                else if (arguments[0] === 16) {
                    logger$1.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", Logger.errors.UNEXPECTED_ARGUMENT, {});
                }
                else {
                    logger$1.throwError("BigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, {});
                }
            }
            return toBN(this).toString(10);
        }
        toHexString() {
            return this._hex;
        }
        toJSON(key) {
            return { type: "BigNumber", hex: this.toHexString() };
        }
        static from(value) {
            if (value instanceof BigNumber) {
                return value;
            }
            if (typeof (value) === "string") {
                if (value.match(/^-?0x[0-9a-f]+$/i)) {
                    return new BigNumber(_constructorGuard, toHex(value));
                }
                if (value.match(/^-?[0-9]+$/)) {
                    return new BigNumber(_constructorGuard, toHex(new BN(value)));
                }
                return logger$1.throwArgumentError("invalid BigNumber string", "value", value);
            }
            if (typeof (value) === "number") {
                if (value % 1) {
                    throwFault("underflow", "BigNumber.from", value);
                }
                if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                    throwFault("overflow", "BigNumber.from", value);
                }
                return BigNumber.from(String(value));
            }
            const anyValue = value;
            if (typeof (anyValue) === "bigint") {
                return BigNumber.from(anyValue.toString());
            }
            if (isBytes(anyValue)) {
                return BigNumber.from(hexlify(anyValue));
            }
            if (anyValue) {
                // Hexable interface (takes piority)
                if (anyValue.toHexString) {
                    const hex = anyValue.toHexString();
                    if (typeof (hex) === "string") {
                        return BigNumber.from(hex);
                    }
                }
                else {
                    // For now, handle legacy JSON-ified values (goes away in v6)
                    let hex = anyValue._hex;
                    // New-form JSON
                    if (hex == null && anyValue.type === "BigNumber") {
                        hex = anyValue.hex;
                    }
                    if (typeof (hex) === "string") {
                        if (isHexString(hex) || (hex[0] === "-" && isHexString(hex.substring(1)))) {
                            return BigNumber.from(hex);
                        }
                    }
                }
            }
            return logger$1.throwArgumentError("invalid BigNumber value", "value", value);
        }
        static isBigNumber(value) {
            return !!(value && value._isBigNumber);
        }
    }
    // Normalize the hex string
    function toHex(value) {
        // For BN, call on the hex string
        if (typeof (value) !== "string") {
            return toHex(value.toString(16));
        }
        // If negative, prepend the negative sign to the normalized positive value
        if (value[0] === "-") {
            // Strip off the negative sign
            value = value.substring(1);
            // Cannot have mulitple negative signs (e.g. "--0x04")
            if (value[0] === "-") {
                logger$1.throwArgumentError("invalid hex", "value", value);
            }
            // Call toHex on the positive component
            value = toHex(value);
            // Do not allow "-0x00"
            if (value === "0x00") {
                return value;
            }
            // Negate the value
            return "-" + value;
        }
        // Add a "0x" prefix if missing
        if (value.substring(0, 2) !== "0x") {
            value = "0x" + value;
        }
        // Normalize zero
        if (value === "0x") {
            return "0x00";
        }
        // Make the string even length
        if (value.length % 2) {
            value = "0x0" + value.substring(2);
        }
        // Trim to smallest even-length string
        while (value.length > 4 && value.substring(0, 4) === "0x00") {
            value = "0x" + value.substring(4);
        }
        return value;
    }
    function toBigNumber(value) {
        return BigNumber.from(toHex(value));
    }
    function toBN(value) {
        const hex = BigNumber.from(value).toHexString();
        if (hex[0] === "-") {
            return (new BN("-" + hex.substring(3), 16));
        }
        return new BN(hex.substring(2), 16);
    }
    function throwFault(fault, operation, value) {
        const params = { fault: fault, operation: operation };
        if (value != null) {
            params.value = value;
        }
        return logger$1.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
    }

    const logger$2 = new Logger(version$2);
    const _constructorGuard$1 = {};
    const Zero = BigNumber.from(0);
    const NegativeOne = BigNumber.from(-1);
    function throwFault$1(message, fault, operation, value) {
        const params = { fault: fault, operation: operation };
        if (value !== undefined) {
            params.value = value;
        }
        return logger$2.throwError(message, Logger.errors.NUMERIC_FAULT, params);
    }
    // Constant to pull zeros from for multipliers
    let zeros = "0";
    while (zeros.length < 256) {
        zeros += zeros;
    }
    // Returns a string "1" followed by decimal "0"s
    function getMultiplier(decimals) {
        if (typeof (decimals) !== "number") {
            try {
                decimals = BigNumber.from(decimals).toNumber();
            }
            catch (e) { }
        }
        if (typeof (decimals) === "number" && decimals >= 0 && decimals <= 256 && !(decimals % 1)) {
            return ("1" + zeros.substring(0, decimals));
        }
        return logger$2.throwArgumentError("invalid decimal size", "decimals", decimals);
    }
    function formatFixed(value, decimals) {
        if (decimals == null) {
            decimals = 0;
        }
        const multiplier = getMultiplier(decimals);
        // Make sure wei is a big number (convert as necessary)
        value = BigNumber.from(value);
        const negative = value.lt(Zero);
        if (negative) {
            value = value.mul(NegativeOne);
        }
        let fraction = value.mod(multiplier).toString();
        while (fraction.length < multiplier.length - 1) {
            fraction = "0" + fraction;
        }
        // Strip training 0
        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
        const whole = value.div(multiplier).toString();
        value = whole + "." + fraction;
        if (negative) {
            value = "-" + value;
        }
        return value;
    }
    function parseFixed(value, decimals) {
        if (decimals == null) {
            decimals = 0;
        }
        const multiplier = getMultiplier(decimals);
        if (typeof (value) !== "string" || !value.match(/^-?[0-9.,]+$/)) {
            logger$2.throwArgumentError("invalid decimal value", "value", value);
        }
        if (multiplier.length - 1 === 0) {
            return BigNumber.from(value);
        }
        // Is it negative?
        const negative = (value.substring(0, 1) === "-");
        if (negative) {
            value = value.substring(1);
        }
        if (value === ".") {
            logger$2.throwArgumentError("missing value", "value", value);
        }
        // Split it into a whole and fractional part
        const comps = value.split(".");
        if (comps.length > 2) {
            logger$2.throwArgumentError("too many decimal points", "value", value);
        }
        let whole = comps[0], fraction = comps[1];
        if (!whole) {
            whole = "0";
        }
        if (!fraction) {
            fraction = "0";
        }
        // Prevent underflow
        if (fraction.length > multiplier.length - 1) {
            throwFault$1("fractional component exceeds decimals", "underflow", "parseFixed");
        }
        // Fully pad the string with zeros to get to wei
        while (fraction.length < multiplier.length - 1) {
            fraction += "0";
        }
        const wholeValue = BigNumber.from(whole);
        const fractionValue = BigNumber.from(fraction);
        let wei = (wholeValue.mul(multiplier)).add(fractionValue);
        if (negative) {
            wei = wei.mul(NegativeOne);
        }
        return wei;
    }
    class FixedFormat {
        constructor(constructorGuard, signed, width, decimals) {
            if (constructorGuard !== _constructorGuard$1) {
                logger$2.throwError("cannot use FixedFormat constructor; use FixedFormat.from", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "new FixedFormat"
                });
            }
            this.signed = signed;
            this.width = width;
            this.decimals = decimals;
            this.name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
            this._multiplier = getMultiplier(decimals);
            Object.freeze(this);
        }
        static from(value) {
            if (value instanceof FixedFormat) {
                return value;
            }
            let signed = true;
            let width = 128;
            let decimals = 18;
            if (typeof (value) === "string") {
                if (value === "fixed") ;
                else if (value === "ufixed") {
                    signed = false;
                }
                else if (value != null) {
                    const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
                    if (!match) {
                        logger$2.throwArgumentError("invalid fixed format", "format", value);
                    }
                    signed = (match[1] !== "u");
                    width = parseInt(match[2]);
                    decimals = parseInt(match[3]);
                }
            }
            else if (value) {
                const check = (key, type, defaultValue) => {
                    if (value[key] == null) {
                        return defaultValue;
                    }
                    if (typeof (value[key]) !== type) {
                        logger$2.throwArgumentError("invalid fixed format (" + key + " not " + type + ")", "format." + key, value[key]);
                    }
                    return value[key];
                };
                signed = check("signed", "boolean", signed);
                width = check("width", "number", width);
                decimals = check("decimals", "number", decimals);
            }
            if (width % 8) {
                logger$2.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", width);
            }
            if (decimals > 80) {
                logger$2.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", decimals);
            }
            return new FixedFormat(_constructorGuard$1, signed, width, decimals);
        }
    }
    class FixedNumber {
        constructor(constructorGuard, hex, value, format) {
            logger$2.checkNew(new.target, FixedNumber);
            if (constructorGuard !== _constructorGuard$1) {
                logger$2.throwError("cannot use FixedNumber constructor; use FixedNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "new FixedFormat"
                });
            }
            this.format = format;
            this._hex = hex;
            this._value = value;
            this._isFixedNumber = true;
            Object.freeze(this);
        }
        _checkFormat(other) {
            if (this.format.name !== other.format.name) {
                logger$2.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", other);
            }
        }
        addUnsafe(other) {
            this._checkFormat(other);
            const a = parseFixed(this._value, this.format.decimals);
            const b = parseFixed(other._value, other.format.decimals);
            return FixedNumber.fromValue(a.add(b), this.format.decimals, this.format);
        }
        subUnsafe(other) {
            this._checkFormat(other);
            const a = parseFixed(this._value, this.format.decimals);
            const b = parseFixed(other._value, other.format.decimals);
            return FixedNumber.fromValue(a.sub(b), this.format.decimals, this.format);
        }
        mulUnsafe(other) {
            this._checkFormat(other);
            const a = parseFixed(this._value, this.format.decimals);
            const b = parseFixed(other._value, other.format.decimals);
            return FixedNumber.fromValue(a.mul(b).div(this.format._multiplier), this.format.decimals, this.format);
        }
        divUnsafe(other) {
            this._checkFormat(other);
            const a = parseFixed(this._value, this.format.decimals);
            const b = parseFixed(other._value, other.format.decimals);
            return FixedNumber.fromValue(a.mul(this.format._multiplier).div(b), this.format.decimals, this.format);
        }
        floor() {
            let comps = this.toString().split(".");
            let result = FixedNumber.from(comps[0], this.format);
            const hasFraction = !comps[1].match(/^(0*)$/);
            if (this.isNegative() && hasFraction) {
                result = result.subUnsafe(ONE);
            }
            return result;
        }
        ceiling() {
            let comps = this.toString().split(".");
            let result = FixedNumber.from(comps[0], this.format);
            const hasFraction = !comps[1].match(/^(0*)$/);
            if (!this.isNegative() && hasFraction) {
                result = result.addUnsafe(ONE);
            }
            return result;
        }
        // @TODO: Support other rounding algorithms
        round(decimals) {
            if (decimals == null) {
                decimals = 0;
            }
            // If we are already in range, we're done
            let comps = this.toString().split(".");
            if (decimals < 0 || decimals > 80 || (decimals % 1)) {
                logger$2.throwArgumentError("invalid decimal count", "decimals", decimals);
            }
            if (comps[1].length <= decimals) {
                return this;
            }
            const factor = FixedNumber.from("1" + zeros.substring(0, decimals));
            return this.mulUnsafe(factor).addUnsafe(BUMP).floor().divUnsafe(factor);
        }
        isZero() {
            return (this._value === "0.0");
        }
        isNegative() {
            return (this._value[0] === "-");
        }
        toString() { return this._value; }
        toHexString(width) {
            if (width == null) {
                return this._hex;
            }
            if (width % 8) {
                logger$2.throwArgumentError("invalid byte width", "width", width);
            }
            const hex = BigNumber.from(this._hex).fromTwos(this.format.width).toTwos(width).toHexString();
            return hexZeroPad(hex, width / 8);
        }
        toUnsafeFloat() { return parseFloat(this.toString()); }
        toFormat(format) {
            return FixedNumber.fromString(this._value, format);
        }
        static fromValue(value, decimals, format) {
            // If decimals looks more like a format, and there is no format, shift the parameters
            if (format == null && decimals != null && !isBigNumberish(decimals)) {
                format = decimals;
                decimals = null;
            }
            if (decimals == null) {
                decimals = 0;
            }
            if (format == null) {
                format = "fixed";
            }
            return FixedNumber.fromString(formatFixed(value, decimals), FixedFormat.from(format));
        }
        static fromString(value, format) {
            if (format == null) {
                format = "fixed";
            }
            const fixedFormat = FixedFormat.from(format);
            const numeric = parseFixed(value, fixedFormat.decimals);
            if (!fixedFormat.signed && numeric.lt(Zero)) {
                throwFault$1("unsigned value cannot be negative", "overflow", "value", value);
            }
            let hex = null;
            if (fixedFormat.signed) {
                hex = numeric.toTwos(fixedFormat.width).toHexString();
            }
            else {
                hex = numeric.toHexString();
                hex = hexZeroPad(hex, fixedFormat.width / 8);
            }
            const decimal = formatFixed(numeric, fixedFormat.decimals);
            return new FixedNumber(_constructorGuard$1, hex, decimal, fixedFormat);
        }
        static fromBytes(value, format) {
            if (format == null) {
                format = "fixed";
            }
            const fixedFormat = FixedFormat.from(format);
            if (arrayify(value).length > fixedFormat.width / 8) {
                throw new Error("overflow");
            }
            let numeric = BigNumber.from(value);
            if (fixedFormat.signed) {
                numeric = numeric.fromTwos(fixedFormat.width);
            }
            const hex = numeric.toTwos((fixedFormat.signed ? 0 : 1) + fixedFormat.width).toHexString();
            const decimal = formatFixed(numeric, fixedFormat.decimals);
            return new FixedNumber(_constructorGuard$1, hex, decimal, fixedFormat);
        }
        static from(value, format) {
            if (typeof (value) === "string") {
                return FixedNumber.fromString(value, format);
            }
            if (isBytes(value)) {
                return FixedNumber.fromBytes(value, format);
            }
            try {
                return FixedNumber.fromValue(value, 0, format);
            }
            catch (error) {
                // Allow NUMERIC_FAULT to bubble up
                if (error.code !== Logger.errors.INVALID_ARGUMENT) {
                    throw error;
                }
            }
            return logger$2.throwArgumentError("invalid FixedNumber value", "value", value);
        }
        static isFixedNumber(value) {
            return !!(value && value._isFixedNumber);
        }
    }
    const ONE = FixedNumber.from(1);
    const BUMP = FixedNumber.from("0.5");

    const version$3 = "units/5.0.9";

    const logger$3 = new Logger(version$3);
    const names = [
        "wei",
        "kwei",
        "mwei",
        "gwei",
        "szabo",
        "finney",
        "ether",
    ];
    function formatUnits(value, unitName) {
        if (typeof (unitName) === "string") {
            const index = names.indexOf(unitName);
            if (index !== -1) {
                unitName = 3 * index;
            }
        }
        return formatFixed(value, (unitName != null) ? unitName : 18);
    }
    function parseUnits(value, unitName) {
        if (typeof (value) !== "string") {
            logger$3.throwArgumentError("value must be a string", "value", value);
        }
        if (typeof (unitName) === "string") {
            const index = names.indexOf(unitName);
            if (index !== -1) {
                unitName = 3 * index;
            }
        }
        return parseFixed(value, (unitName != null) ? unitName : 18);
    }

    var addresses = {
      mainnet: {
        uniswap: {
          factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        },
        sushiswap: {
          factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        },
        DAIAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        WETHAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        USDCAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        USDTAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      },
      kovan: {
        daiAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        wethAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      }
    };

    const {mainnet} = addresses;


    const endpoint = "https://api.1inch.exchange/v2.0/quote";

    async function get1inchPairPrice({asset1 = 'DAI', asset2 = 'WETH', amount = '1', asset1Decimals, selectedExchange}) {

      const fromTokenAddress = mainnet[`${asset1}Address`];
      const toTokenAddress = mainnet[`${asset2}Address`];

      const formattedAmount = parseUnits(amount, asset1Decimals);

      const params = {
        fromTokenAddress,
        toTokenAddress,
        amount: formattedAmount,
        protocols: selectedExchange
      };

      const response = await fetch(`${endpoint}?` + new URLSearchParams(params));
      const data = await response.json();
      console.log('data', data);
      return data?.toTokenAmount ? formatUnits(data.toTokenAmount, data.toToken.decimals) : null;

    }

    async function getPriceData({ pair }) {

      let uniswapPrice;
      let sushiswapPrice;
      let balancerPrice;
      let bancorPrice;
      let kyberPrice;

      const targetedExchanges = ['UNISWAP_V2', 'SUSHI', 'BALANCER', 'BANCOR', 'KYBER'];


      // 1inch provided prices
      [uniswapPrice, 
        sushiswapPrice,
        balancerPrice,
        bancorPrice,
        kyberPrice] = await Promise.all(targetedExchanges.map(dex => get1inchPairPrice({...pair, selectedExchange: dex})));

      
      
      // 0xPrices
      // const uniswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Uniswap_V2"});
      // const sushiswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "SushiSwap"});
      // const balancerPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Balancer"})
      bancorPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Bancor"});
      kyberPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Kyber"});
      // const crytpo_comPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "CryptoCom"});
      
      // Direct API's
      // const sushiswapPrice = await getUniswapPairPrice({ "_protocol": "sushiswap", "asset1": pair.asset1, "asset2": pair.asset2 });
      // const uniswapPrice = await getUniswapPairPrice({ "asset1": pair.asset1, "asset2": pair.asset2 });


      return {uniswapPrice, sushiswapPrice, balancerPrice, bancorPrice, kyberPrice};
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

    /* svelte/arbitrage.svelte generated by Svelte v3.32.0 */

    const { console: console_1 } = globals;
    const file = "svelte/arbitrage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (51:2) {#each pairs as pair}
    function create_each_block_4(ctx) {
    	let option;
    	let t0_value = /*pair*/ ctx[22].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*pair*/ ctx[22];
    			option.value = option.__value;
    			add_location(option, file, 51, 4, 1473);
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
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(51:2) {#each pairs as pair}",
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

    // (61:0) {:then}
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
    		source: "(61:0) {:then}",
    		ctx
    	});

    	return block;
    }

    // (64:4) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let t0;
    	let t1_value = /*priceData*/ ctx[1].uniswapPrice + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4_value = /*priceData*/ ctx[1].sushiswapPrice + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6;
    	let t7_value = /*priceData*/ ctx[1].balancerPrice + "";
    	let t7;
    	let t8;
    	let p3;
    	let t9;
    	let t10_value = /*priceData*/ ctx[1].bancorPrice + "";
    	let t10;
    	let t11;
    	let p4;
    	let t12;
    	let t13_value = /*priceData*/ ctx[1].kyberPrice + "";
    	let t13;
    	let t14;
    	let div2;
    	let div1;
    	let div0;
    	let t16;
    	let t17;
    	let t18;
    	let each_value_3 = /*dexes*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*dexes*/ ctx[4];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*dexes*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Price on Uniswap: ");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("Price on Sushiswap: ");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Price on Balancer: ");
    			t7 = text(t7_value);
    			t8 = space();
    			p3 = element("p");
    			t9 = text("Price on Bancor: ");
    			t10 = text(t10_value);
    			t11 = space();
    			p4 = element("p");
    			t12 = text("Price on Kyber: ");
    			t13 = text(t13_value);
    			t14 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "FlashArb";
    			t16 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t17 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t18 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p0, file, 64, 4, 1647);
    			add_location(p1, file, 65, 4, 1701);
    			add_location(p2, file, 66, 4, 1759);
    			add_location(p3, file, 67, 4, 1815);
    			add_location(p4, file, 68, 4, 1867);
    			attr_dev(div0, "class", "grid-item");
    			add_location(div0, file, 71, 8, 1984);
    			attr_dev(div1, "class", "first-col");
    			add_location(div1, file, 70, 6, 1952);
    			attr_dev(div2, "class", "grid-container");
    			add_location(div2, file, 69, 4, 1917);
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
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t16);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append_dev(div2, t17);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div2, t18);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*priceData*/ 2 && t1_value !== (t1_value = /*priceData*/ ctx[1].uniswapPrice + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*priceData*/ 2 && t4_value !== (t4_value = /*priceData*/ ctx[1].sushiswapPrice + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*priceData*/ 2 && t7_value !== (t7_value = /*priceData*/ ctx[1].balancerPrice + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*priceData*/ 2 && t10_value !== (t10_value = /*priceData*/ ctx[1].bancorPrice + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*priceData*/ 2 && t13_value !== (t13_value = /*priceData*/ ctx[1].kyberPrice + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*dexes*/ 16) {
    				each_value_3 = /*dexes*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty & /*dexes*/ 16) {
    				each_value_2 = /*dexes*/ ctx[4];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, t18);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*dexes, computeSpread, priceData*/ 50) {
    				each_value = /*dexes*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:2) {#if loading}
    function create_if_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Fetching";
    			add_location(p, file, 62, 4, 1615);
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
    		source: "(62:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {#each dexes as rowHeaderDex}
    function create_each_block_3(ctx) {
    	let div;
    	let t_value = /*rowHeaderDex*/ ctx[19] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "grid-item");
    			add_location(div, file, 73, 10, 2070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(73:8) {#each dexes as rowHeaderDex}",
    		ctx
    	});

    	return block;
    }

    // (77:6) {#each dexes as colHeaderDex}
    function create_each_block_2(ctx) {
    	let div;
    	let t_value = /*colHeaderDex*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "grid-item");
    			add_location(div, file, 77, 8, 2187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(77:6) {#each dexes as colHeaderDex}",
    		ctx
    	});

    	return block;
    }

    // (81:8) {#each dexes as rowDex, j}
    function create_each_block_1(ctx) {
    	let div;

    	let t_value = (/*i*/ ctx[12] !== /*j*/ ctx[15]
    	? /*computeSpread*/ ctx[5](/*priceData*/ ctx[1][`${/*colDex*/ ctx[10]}Price`], /*priceData*/ ctx[1][`${/*rowDex*/ ctx[13]}Price`])
    	: "") + "";

    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "grid-item");
    			add_location(div, file, 81, 10, 2323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*priceData*/ 2 && t_value !== (t_value = (/*i*/ ctx[12] !== /*j*/ ctx[15]
    			? /*computeSpread*/ ctx[5](/*priceData*/ ctx[1][`${/*colDex*/ ctx[10]}Price`], /*priceData*/ ctx[1][`${/*rowDex*/ ctx[13]}Price`])
    			: "") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(81:8) {#each dexes as rowDex, j}",
    		ctx
    	});

    	return block;
    }

    // (80:6) {#each dexes as colDex, i}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*dexes*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*computeSpread, priceData, dexes*/ 50) {
    				each_value_1 = /*dexes*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:6) {#each dexes as colDex, i}",
    		ctx
    	});

    	return block;
    }

    // (59:20)    <p>Loading</p> {:then}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading";
    			add_location(p, file, 59, 2, 1572);
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
    		source: "(59:20)    <p>Loading</p> {:then}",
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
    	let each_value_4 = /*pairs*/ ctx[3];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
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

    	handle_promise(/*getPrices*/ ctx[6](), info);

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
    			attr_dev(h1, "class", "big");
    			add_location(h1, file, 47, 0, 1303);
    			if (/*selectedPair*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file, 49, 0, 1373);
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

    			select_option(select, /*selectedPair*/ ctx[2]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[8]),
    					listen_dev(select, "change", /*change_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*pairs*/ 8) {
    				each_value_4 = /*pairs*/ ctx[3];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty & /*selectedPair, pairs*/ 12) {
    				select_option(select, /*selectedPair*/ ctx[2]);
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

    	// let uniswapPrice = 0;
    	// let sushiswapPrice = 0;
    	// let balancerPrice = 0;
    	// let bancorPrice = 0;
    	// let kyberPrice = 0;
    	// let crypto_comPrice = 0;
    	let priceData;

    	const pairs = [
    		{
    			id: "DAI_WETH",
    			text: "DAI-WETH",
    			asset1: "DAI",
    			asset2: "WETH",
    			asset1Decimals: 18,
    			asset2Decimals: 18
    		},
    		{
    			id: "USDC_WETH",
    			text: "USDC-WETH",
    			asset1: "USDC",
    			asset2: "WETH",
    			asset1Decimals: 6,
    			asset2Decimals: 18
    		},
    		{
    			id: "USDT_WETH",
    			text: "USDT-WETH",
    			asset1: "USDT",
    			asset2: "WETH",
    			asset1Decimals: 6,
    			asset2Decimals: 18
    		}
    	];

    	const dexes = ["uniswap", "sushiswap", "balancer", "bancor", "kyber"];

    	// const dexPairs = dexes.flatMap(
    	//   (v, i) => dexes.slice(i+1).map( w => v + '/' + w)
    	// );
    	const computeSpread = (price1, price2) => `${(price1 / price2 - 1) * 100}%`;

    	let selectedPair = pairs[0];

    	async function getPrices() {
    		const data = await getPriceData({ pair: selectedPair });
    		console.log("priceData", data);
    		$$invalidate(1, priceData = data);
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
    		$$invalidate(2, selectedPair);
    		$$invalidate(3, pairs);
    	}

    	const change_handler = () => onReloadPrices();

    	$$self.$capture_state = () => ({
    		getPriceData,
    		getSpreadData,
    		loading,
    		priceData,
    		pairs,
    		dexes,
    		computeSpread,
    		selectedPair,
    		getPrices,
    		onReloadPrices
    	});

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    		if ("priceData" in $$props) $$invalidate(1, priceData = $$props.priceData);
    		if ("selectedPair" in $$props) $$invalidate(2, selectedPair = $$props.selectedPair);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loading,
    		priceData,
    		selectedPair,
    		pairs,
    		dexes,
    		computeSpread,
    		getPrices,
    		onReloadPrices,
    		select_change_handler,
    		change_handler
    	];
    }

    class Arbitrage extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.grid-container{display:grid;grid-template-columns:repeat(6, 1fr);padding:10px}.grid-item{background-color:rgba(255, 255, 255, 0.8);border:1px solid rgba(0, 0, 0, 0.8);padding:10px;font-size:1rem;text-align:center}.first-col{grid-column:1 /1;grid-row:1/7}</style>`;

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

    customElements.define("flashsuite-arbitrage", Arbitrage);

    return Arbitrage;

}());
