!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e}function s(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function i(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function l(t){return document.createTextNode(t)}function f(){return l(" ")}function d(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function h(t){const e={};for(const n of t)e[n.name]=n.value;return e}let m;function p(t){m=t}const $=[],g=[],y=[],b=[],x=Promise.resolve();let _=!1;function w(t){y.push(t)}let k=!1;const E=new Set;function C(){if(!k){k=!0;do{for(let t=0;t<$.length;t+=1){const e=$[t];p(e),v(e.$$)}for(p(null),$.length=0;g.length;)g.pop()();for(let t=0;t<y.length;t+=1){const e=y[t];E.has(e)||(E.add(e),e())}y.length=0}while($.length);for(;b.length;)b.pop()();_=!1,k=!1,E.clear()}}function v(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(w)}}const M=new Set;function T(t,e){-1===t.$$.dirty[0]&&($.push(t),_||(_=!0,x.then(C)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function q(a,s,c,u,l,f,d=[-1]){const h=m;p(a);const $=s.props||{},g=a.$$={fragment:null,ctx:null,props:f,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:[]),callbacks:n(),dirty:d,skip_bound:!1};let y=!1;if(g.ctx=c?c(a,$,((t,e,...n)=>{const o=n.length?n[0]:e;return g.ctx&&l(g.ctx[t],g.ctx[t]=o)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](o),y&&T(a,t)),e})):[],g.update(),y=!0,o(g.before_update),g.fragment=!!u&&u(g.ctx),s.target){if(s.hydrate){const t=function(t){return Array.from(t.childNodes)}(s.target);g.fragment&&g.fragment.l(t),t.forEach(i)}else g.fragment&&g.fragment.c();s.intro&&((b=a.$$.fragment)&&b.i&&(M.delete(b),b.i(x))),function(t,n,a){const{fragment:s,on_mount:c,on_destroy:i,after_update:u}=t.$$;s&&s.m(n,a),w((()=>{const n=c.map(e).filter(r);i?i.push(...n):o(n),t.$$.on_mount=[]})),u.forEach(w)}(a,s.target,s.anchor),C()}var b,x;p(h)}let H;function N(e){let n,o,r,a,h,m,p,$,g,y,b,x,_,w,k,E,C,v;return{c(){n=u("main"),o=u("h1"),o.textContent="Ethereum Balance",r=f(),a=u("p"),h=l("network: "),m=l(e[1]),p=l(" ("),$=l(e[0]),g=l(")"),y=f(),b=u("p"),x=l("address: "),_=l(e[2]),w=f(),k=u("p"),E=l("balance: "),C=l(e[3]),v=l(" ETH"),this.c=t},m(t,e){c(t,n,e),s(n,o),s(n,r),s(n,a),s(a,h),s(a,m),s(a,p),s(a,$),s(a,g),s(n,y),s(n,b),s(b,x),s(b,_),s(n,w),s(n,k),s(k,E),s(k,C),s(k,v)},p(t,[e]){2&e&&d(m,t[1]),1&e&&d($,t[0]),4&e&&d(_,t[2]),8&e&&d(C,t[3])},i:t,o:t,d(t){t&&i(n)}}}function S(t,e,n){const o=window.ethereum;o?o.enable():alert("Install Metamask");let r=o.chainId;o.on("chainChanged",(t=>{n(0,r=t)}));let a,s="";ethereum.request({method:"eth_requestAccounts"}).then((t=>{n(4,a=t)})),o.on("accountsChanged",(t=>{n(4,a=t)}));let c="",i=0;return t.$$.update=()=>{1&t.$$.dirty&&n(1,s=function(t){return new Map([[1,"mainnet"],[3,"ropsten"],[4,"rinkeby"],[5,"goerli"],[42,"kovan"]]).get(Number(t))}(r)),16&t.$$.dirty&&n(2,c=a&&a[0]),5&t.$$.dirty&&r&&c&&ethereum.request({method:"eth_getBalance",params:[c,"latest"]}).then((t=>{n(3,i=(t/10**18).toString())})),15&t.$$.dirty&&console.log(r,s,c,i)},[r,s,c,i,a]}"function"==typeof HTMLElement&&(H=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});customElements.define("svelte-metamask",class extends H{constructor(t){super(),this.shadowRoot.innerHTML="<style>main{padding:1em;max-width:240px;margin:0 auto}h1{color:#ff3e00;text-transform:uppercase;font-size:4em;font-weight:100}p{font-size:2em}@media(min-width: 640px){main{max-width:none}}</style>",q(this,{target:this.shadowRoot,props:h(this.attributes)},S,N,a,{}),t&&t.target&&c(t.target,this,t.anchor)}})}();
//# sourceMappingURL=metamask.js.map
