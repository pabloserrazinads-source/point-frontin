
(function(){
  const CURRENT_VERSION='1.32.53';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  // Não depende da cadeia histórica de wrappers de closeModal.
  // Fecha somente o modal do carrinho e devolve o cliente ao cardápio.
  window.continueShopping=function(){
    const modal=document.getElementById('modal');
    if(modal) modal.classList.remove('show');

    // Remove foco/seleção residual do botão no Android.
    try{
      const active=document.activeElement;
      if(active && typeof active.blur==='function') active.blur();
      const sel=window.getSelection && window.getSelection();
      if(sel && typeof sel.removeAllRanges==='function') sel.removeAllRanges();
    }catch(_){}

    requestAnimationFrame(function(){
      const shop=document.getElementById('shopView') ||
                 document.getElementById('productGrid') ||
                 document.querySelector('.clientSection');
      if(shop && typeof shop.scrollIntoView==='function'){
        shop.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  };

  // Garante type=button em controles de ação do carrinho, evitando comportamento
  // nativo inesperado caso o HTML seja futuramente colocado dentro de um form.
  document.addEventListener('click',function(ev){
    const b=ev.target && ev.target.closest ? ev.target.closest('#sheet button') : null;
    if(b && !b.hasAttribute('type')) b.setAttribute('type','button');
  },true);

  // v1.32.53 — compatibilidade de handlers após externalização dos scripts.
  // Os controles do cardápio/checkout ainda são gerados com atributos onclick.
  // Expõe explicitamente os pontos de entrada no objeto global para preservar
  // o mesmo comportamento da versão monolítica em todos os tenants.
  try{
    if(typeof addCart==='function') window.addCart=addCart;
    if(typeof beginCheckout==='function') window.beginCheckout=beginCheckout;
    if(typeof showReceiveChoices==='function') window.showReceiveChoices=showReceiveChoices;
    if(typeof showPaymentChoices==='function') window.showPaymentChoices=showPaymentChoices;
    if(typeof finishWhatsApp==='function') window.finishWhatsApp=finishWhatsApp;
    if(typeof showCart==='function') window.showCart=showCart;
    if(typeof qty==='function') window.qty=qty;
    if(typeof changeOptQty==='function') window.changeOptQty=changeOptQty;
    if(typeof handleChoiceChange==='function') window.handleChoiceChange=handleChoiceChange;
  }catch(e){ console.error('Pedevia handler bridge v1.32.53',e); }

  if(typeof window.applyPedeviaVersion==='function') window.applyPedeviaVersion();
})();

/* PEDEVIA CSP MIGRATION STEP 1
   Delegated event bridge. CSP header remains unchanged during migration.
   This layer intentionally preserves legacy inline handlers for compatibility;
   it only establishes the listener infrastructure for gradual conversion.
*/
(function(){
  if(window.__pedeviaCspBridge1)return;
  window.__pedeviaCspBridge1=true;

  document.addEventListener('click',function(ev){
    const el=ev.target && ev.target.closest ? ev.target.closest('[data-pedevia-action]') : null;
    if(!el)return;
    const action=el.getAttribute('data-pedevia-action');
    if(action==='switch-mode' && typeof window.switchMode==='function'){
      ev.preventDefault(); window.switchMode();
    }else if(action==='login' && typeof window.login==='function'){
      ev.preventDefault(); window.login();
    }else if(action==='logout-admin' && typeof window.logoutAdmin==='function'){
      ev.preventDefault(); window.logoutAdmin();
    }else if(action==='show-cart' && typeof window.showCart==='function'){
      ev.preventDefault(); window.showCart();
    }
  },false);
})();


/* PEDEVIA CSP FULL MIGRATION — GENERIC ZERO-ARG ACTIONS */
(function(){
  if(window.__pedeviaCspGenericZeroArg)return;
  window.__pedeviaCspGenericZeroArg=true;
  ["click","change","input"].forEach(function(type){
    document.addEventListener(type,function(ev){
      const el=ev.target&&ev.target.closest?ev.target.closest('[data-pedevia-event="'+type+'"][data-pedevia-call]'):null;
      if(!el)return;
      const name=el.getAttribute("data-pedevia-call");
      const fn=name&&name.split(".").reduce(function(o,k){return o&&o[k]},window);
      if(typeof fn==="function"){
        if(type==="click") ev.preventDefault();
        fn.call(el,ev);
      }
    });
  });
})();

/* PEDEVIA v1.32.53 — CART BAR TOTAL SYNC
   Recalcula o total visível da barra do carrinho usando TODOS os itens atuais.
*/
(function(){
  if(window.__pedeviaCartBarTotalSync)return;
  window.__pedeviaCartBarTotalSync=true;

  function moneyBR(v){
    return Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function itemTotal(it){
    if(!it)return 0;
    /* Prefer totals already calculated by the cart model. */
    for(const k of ["total","lineTotal","line_total","itemTotal","item_total"]){
      const n=Number(it[k]);
      if(Number.isFinite(n) && n>=0) return n;
    }
    const qty=Math.max(1,Number(it.qty ?? it.quantity ?? 1)||1);
    const unit=Number(it.unitPrice ?? it.unit_price ?? it.price ?? 0)||0;
    let extras=0;
    const pools=[it.extras,it.addons,it.complements,it.complementos,it.selectedExtras];
    for(const pool of pools){
      if(!Array.isArray(pool))continue;
      extras += pool.reduce((s,x)=>{
        if(x==null)return s;
        if(typeof x==="number")return s+x;
        const p=Number(x.price ?? x.valor ?? x.value ?? 0)||0;
        const q=Math.max(1,Number(x.qty ?? x.quantity ?? 1)||1);
        return s+p*q;
      },0);
    }
    return (unit+extras)*qty;
  }

  function getCart(){
    const candidates=[window.cart,window.CART,window.carrinho,window.cartItems];
    return candidates.find(Array.isArray)||[];
  }

  function sync(){
    const cart=getCart();
    if(!cart.length)return;
    const total=cart.reduce((s,it)=>s+itemTotal(it),0);
    if(!(total>=0))return;

    /* Bottom cart bar: update only a price-looking text node/element inside it. */
    const bar=document.querySelector("#cartBar,.cartBar,.cart-bar,[data-cart-bar]");
    if(!bar)return;
    const nodes=[...bar.querySelectorAll("span,b,strong,div")];
    const priceNode=nodes.find(n=>/R\$\s*[\d.,]+/.test((n.textContent||"").trim()));
    if(priceNode){
      const old=priceNode.textContent||"";
      priceNode.textContent=old.replace(/R\$\s*[\d.,]+/,"R$ "+moneyBR(total));
    }
  }

  document.addEventListener("click",()=>setTimeout(sync,0));
  document.addEventListener("change",()=>setTimeout(sync,0));
  document.addEventListener("input",()=>setTimeout(sync,0));

  const oldRender=window.renderCartBar;
  if(typeof oldRender==="function"){
    window.renderCartBar=function(){
      const r=oldRender.apply(this,arguments);
      setTimeout(sync,0);
      return r;
    };
  }
  setTimeout(sync,0);
})();

/* PEDEVIA v1.32.53 — CART BAR TOTAL FINAL
   Usa diretamente o mesmo estado/funções do carrinho (cart/sum/oferta),
   em vez de procurar o carrinho em window.
*/
(function(){
  if(window.__pedeviaCartBarTotalFinal)return;
  window.__pedeviaCartBarTotalFinal=true;

  function syncCartBarFinal(){
    try{
      const count=(cart||[]).reduce((s,i)=>s+(Number(i.qty)||0),0);
      let total=Number(typeof sum==="function"?sum():0)||0;

      if(typeof activeOfferDiscount==="function"){
        const d=activeOfferDiscount();
        total=Math.max(0,total-(Number(d&&d.amount)||0));
      }

      const countEl=document.getElementById("cartCount");
      const totalEl=document.getElementById("cartTotal");
      if(countEl) countEl.textContent=String(count);
      if(totalEl) totalEl.textContent=brl(total);
    }catch(e){
      console.warn("[Pedevia] Falha ao sincronizar total da barra",e);
    }
  }

  /* Encadeia no updateCart final já existente. */
  if(typeof updateCart==="function"){
    const prevUpdateCart=updateCart;
    updateCart=function(){
      const r=prevUpdateCart.apply(this,arguments);
      syncCartBarFinal();
      setTimeout(syncCartBarFinal,0);
      setTimeout(syncCartBarFinal,30);
      return r;
    };
  }

  /* Neutraliza apenas a informação antiga do enhancer legado,
     executando a sincronização correta logo depois dele. */
  document.addEventListener("click",function(){setTimeout(syncCartBarFinal,40)},false);
  syncCartBarFinal();
})();
