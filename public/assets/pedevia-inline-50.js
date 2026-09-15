
(function(){
  const CURRENT_VERSION='1.32.48';
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

  // v1.32.48b — compatibilidade de handlers após externalização dos scripts.
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
  }catch(e){ console.error('Pedevia handler bridge v1.32.48b',e); }

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

/* PEDEVIA v1.32.49 — CART BAR TOTAL SYNC
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

/* PEDEVIA v1.32.49 — CART BAR TOTAL FINAL
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


/* PEDEVIA CSP MIGRATION — SAFE ARGUMENT HANDLERS */
(function(){
  if(window.__pedeviaCspArgBridge)return;
  window.__pedeviaCspArgBridge=true;
  ["click","change","input"].forEach(function(type){
    document.addEventListener(type,function(ev){
      const el=ev.target&&ev.target.closest?ev.target.closest('[data-pedevia-event="'+type+'"][data-pedevia-call][data-pedevia-arg]'):null;
      if(!el)return;
      const name=el.getAttribute("data-pedevia-call");
      const kind=el.getAttribute("data-pedevia-arg");
      const fn=name&&name.split(".").reduce(function(o,k){return o&&o[k]},window);
      if(typeof fn!=="function")return;
      if(type==="click")ev.preventDefault();
      fn.call(el,kind==="event"?ev:el);
    },false);
  });
})();


/* PEDEVIA CSP — FULL ATTRIBUTE HANDLER MIGRATION */
(function(){
 if(window.__pedeviaFullHandlerMigration)return;window.__pedeviaFullHandlerMigration=true;
 function run(id,el,event,args){const __ARGS=args||[];try{switch(id){case "h001":{qty(-1);break;}case "h002":{qty(1);break;}case "h003":{addCart(__ARGS[0]);break;}case "h004":{cart.splice(__ARGS[0],1);updateCart();showCart();break;}case "h005":{adminTab=__ARGS[0];renderAdmin();break;}case "h006":{repairSectionsEmergency();renderAdmin();renderShop();break;}case "h007":{adminSubTab='products';adminMenu();break;}case "h008":{adminSubTab='stock';adminMenu();break;}case "h009":{adminSubTab='products';adminMenu();break;}case "h010":{adminSubTab='stock';adminMenu();break;}case "h011":{adminSubTab='products';adminMenu();break;}case "h012":{adminSubTab='stock';adminMenu();break;}case "h013":{adminOrdersView='config';adminOrders();break;}case "h014":{adminOrdersView='main';adminOrders();break;}case "h015":{cfg.store.modes.pickup=$('#opEnabled').checked;save();closeModal();adminOrderSettings();renderShop();break;}case "h016":{cfg.store.modes.dinein=$('#oiEnabled').checked;save();closeModal();adminOrderSettings();renderShop();break;}case "h017":{cfg.store.orderConfig.receiptPrinting=$('#orReceipt').checked;save();closeModal();adminOrderSettings();break;}case "h018":{cfg.store.orderConfig.panelAlerts=$('#orAlerts').checked;save();closeModal();adminOrderSettings();break;}case "h019":{cfg.store.orderConfig.orderPrefix=$('#orPrefix').value;cfg.store.orderConfig.nextOrder=Math.max(1,+$('#orNext').value||1);save();closeModal();adminOrderSettings();break;}case "h020":{editProduct(__ARGS[0]);break;}case "h021":{saveProduct(__ARGS[0]);break;}case "h022":{editRules(__ARGS[0]);break;}case "h023":{setOpt(__ARGS[0],__ARGS[1],'available');break;}case "h024":{setOpt(__ARGS[0],__ARGS[1],'unavailable');break;}case "h025":{setOpt(__ARGS[0],__ARGS[1],'hidden');break;}case "h026":{newOption(__ARGS[0]);break;}case "h027":{saveRules(__ARGS[0]);break;}case "h028":{removeNeighborhood(__ARGS[0]);break;}case "h029":{adminOrdersView='main';adminOrders();break;}case "h030":{cfg.store.whatsapp=$('#gWa').value.replace(/\\D/g,'');cfg.store.email=$('#gEmail').value;save();generalContact();break;}case "h031":{cfg.store.address=$('#gAddr').value;save();generalAddress();break;}case "h032":{cfg.store.instagram=$('#gInsta').value;cfg.store.socialUrl=$('#gSocialUrl').value;save();generalSocial();break;}case "h033":{cfg.store.shareTitle=$('#gShareTitle').value;cfg.store.shareDescription=$('#gShareDesc').value;save();generalSharing();break;}case "h034":{cfg.store.hubSlug=$('#gSlug').value;cfg.store.customDomain=$('#gDomain').value;save();generalDomain();break;}case "h035":{removeCollab(__ARGS[0]);break;}case "h036":{cfg.store.analyticsId=$('#gAna').value;cfg.store.googleAdsId=$('#gAds').value;cfg.store.metaPixelId=$('#gMeta').value;save();generalIntegrations();break;}case "h037":{editProduct(__ARGS[0]);break;}case "h038":{editGroupForProduct(__ARGS[0],__ARGS[1]);break;}case "h039":{previewProductImage(__ARGS[0],this);break;}case "h040":{$('#epi').focus();break;}case "h041":{openAddGroupMenu(__ARGS[0]);break;}case "h042":{saveProduct(__ARGS[0]);break;}case "h043":{editProduct(__ARGS[0]);break;}case "h044":{createGroupForProduct(__ARGS[0]);break;}case "h045":{chooseReusableGroups(__ARGS[0]);break;}case "h046":{editProduct(__ARGS[0]);break;}case "h047":{saveReusableGroups(__ARGS[0]);break;}case "h048":{editProduct(__ARGS[0]);break;}case "h049":{setGroupMode('single');break;}case "h050":{setGroupMode('multiple');break;}case "h051":{setGroupMode('quantity');break;}case "h052":{editProduct(__ARGS[0]);break;}case "h053":{saveAdvancedGroup(__ARGS[0],__ARGS[1]);break;}case "h054":{this.closest('.optionEdit').remove();break;}case "h055":{this.closest('.optionEdit').remove();break;}case "h056":{selectSectionDisplay(__ARGS[0]);break;}case "h057":{saveSection(__ARGS[0]);break;}case "h058":{adminSubTab='stock';adminStock();break;}case "h059":{newSection(null);break;}case "h060":{moveSection(__ARGS[0],-1);break;}case "h061":{moveSection(__ARGS[0],1);break;}case "h062":{editSection(__ARGS[0]);break;}case "h063":{editProduct(__ARGS[0]);break;}case "h064":{newProduct(__ARGS[0]);break;}case "h065":{deleteSection(__ARGS[0]);break;}case "h066":{newSection(__ARGS[0]);break;}case "h067":{previewProductImage(__ARGS[0],this);break;}case "h068":{$('#epi').focus();break;}case "h069":{openAddGroupMenu(__ARGS[0]);break;}case "h070":{saveProduct(__ARGS[0]);break;}case "h071":{document.getElementById('clientSec_'+__ARGS[0]+'')?.scrollIntoView({behavior:'smooth'});break;}case "h072":{changeOptionQty(this,-1);break;}case "h073":{changeOptionQty(this,1);break;}case "h074":{qty(-1);break;}case "h075":{qty(1);break;}case "h076":{addCart(__ARGS[0]);break;}case "h077":{cart.splice(__ARGS[0],1);updateCart();showCart();break;}case "h078":{changeCartQty(__ARGS[0],-1);break;}case "h079":{changeCartQty(__ARGS[0],1);break;}case "h080":{removeCartItem(__ARGS[0]);break;}case "h081":{selectReceive('pickup');break;}case "h082":{selectReceive('dinein');break;}case "h083":{selectReceive('delivery');break;}case "h084":{window.checkoutState.neighborhood=this.value;break;}case "h085":{saveDineinAndPay(__ARGS[0]);break;}case "h086":{selectPayment(__ARGS[0]);break;}case "h087":{previewProductImage(__ARGS[0],this);break;}case "h088":{$('#epi').focus();break;}case "h089":{openAddGroupMenu(__ARGS[0]);break;}case "h090":{saveProduct(__ARGS[0]);break;}case "h091":{selectReceive('pickup');break;}case "h092":{selectReceive('dinein');break;}case "h093":{selectReceive('delivery');break;}case "h094":{setClientServiceMode('delivery',true);break;}case "h095":{setClientServiceMode('pickup',true);break;}case "h096":{setClientServiceMode('dinein',true);break;}case "h097":{document.getElementById('clientSec_'+__ARGS[0]+'')?.scrollIntoView({behavior:'smooth'});break;}case "h098":{selectReceive('pickup');break;}case "h099":{selectReceive('dinein');break;}case "h100":{selectReceive('delivery');break;}case "h101":{toggleVariantsEditor(__ARGS[0],this.checked);break;}case "h102":{this.closest('.variantAdminRow').remove();break;}case "h103":{previewProductImage(__ARGS[0],this);break;}case "h104":{$('#epi').focus();break;}case "h105":{openAddGroupMenu(__ARGS[0]);break;}case "h106":{saveProduct(__ARGS[0]);break;}case "h107":{qty(-1);break;}case "h108":{qty(1);break;}case "h109":{addCart(__ARGS[0]);break;}case "h110":{document.getElementById('clientSec_'+__ARGS[0]+'')?.scrollIntoView({behavior:'smooth'});break;}case "h111":{changeCartQty(__ARGS[0],-1);break;}case "h112":{changeCartQty(__ARGS[0],1);break;}case "h113":{removeCartItem(__ARGS[0]);break;}case "h114":{document.getElementById('clientSec_'+__ARGS[0]+'')?.scrollIntoView({behavior:'smooth'});break;}case "h115":{qty(-1);break;}case "h116":{qty(1);break;}case "h117":{addCart(__ARGS[0]);break;}case "h118":{selectReceive('pickup');break;}case "h119":{selectReceive('dinein');break;}case "h120":{selectReceive('delivery');break;}case "h121":{editOffer(__ARGS[0]);break;}case "h122":{toggleOffer(__ARGS[0]);break;}case "h123":{deleteOffer(__ARGS[0]);break;}case "h124":{newOffer('percentage');break;}case "h125":{newOffer('loyalty');break;}case "h126":{saveLoyaltyOffer(__ARGS[0]);break;}case "h127":{refreshOfferTarget(__ARGS[0]);break;}case "h128":{savePercentOffer(__ARGS[0]);break;}case "h129":{changeCartQty(__ARGS[0],-1);break;}case "h130":{changeCartQty(__ARGS[0],1);break;}case "h131":{removeCartItem(__ARGS[0]);break;}case "h132":{setCropZoom(this.value);break;}case "h133":{applyTemplateV117(__ARGS[0]);break;}case "h134":{setChoiceV117('cardStyle',__ARGS[0]);break;}case "h135":{setChoiceV117('fontStyle',__ARGS[0]);break;}case "h136":{setChoiceV117('density',__ARGS[0]);break;}case "h137":{setChoiceV117('photoShape',__ARGS[0]);break;}case "h138":{setChoiceV117('shadow',__ARGS[0]);break;}case "h139":{setChoiceV117(__ARGS[0],__ARGS[1]);break;}case "h140":{editClientSiteV120(__ARGS[0]);break;}case "h141":{document.getElementById('csSlugV120').value=slugifyStoreV120(this.value);break;}case "h142":{saveClientSiteV120(__ARGS[0]);break;}case "h143":{deleteClientSiteV120(__ARGS[0]);break;}case "h144":{saveClientSiteV120(__ARGS[0]);break;}case "h145":{deleteClientSiteV120(__ARGS[0]);break;}case "h146":{location.href='/';break;}case "h147":{openClientSiteV121(__ARGS[0]);break;}case "h148":{copyClientSiteLinkV121(__ARGS[0]);break;}case "h149":{editClientSiteV120(__ARGS[0]);break;}case "h150":{window.clientLogoDraftV1211='';renderClientLogoPreviewV1211();break;}case "h151":{resendClientInviteV122(__ARGS[0]);break;}case "h152":{readClientLogoV1211(this);break;}case "h153":{readQrUploadV1201(this);break;}case "h154":{saveClientSiteV120(__ARGS[0]);break;}case "h155":{deleteClientSiteV120(__ARGS[0]);break;}case "h156":{document.getElementById('csSlugV120').value=slugifyStoreV120(this.value);break;}case "h157":{closeModal();openPedeviaTutorialV123(0);break;}case "h158":{closeModal();openPedeviaTutorialV123(0);break;}case "h159":{closeModal();openPedeviaTutorialV123(0);break;}case "h160":{updateOrderStatusV125(__ARGS[0]);break;}case "h161":{copyOrderV125(__ARGS[0]);break;}case "h162":{viewOrderV125(__ARGS[0]);break;}case "h163":{copyOrderV125(__ARGS[0]);break;}case "h164":{adminOrdersView='config';adminOrders();break;}case "h165":{updateOrderStatusV126(__ARGS[0]);break;}case "h166":{copyOrderV125(__ARGS[0]);break;}case "h167":{deleteOrderV126(__ARGS[0]);break;}case "h168":{viewOrderV125(__ARGS[0]);break;}case "h169":{copyOrderV125(__ARGS[0]);break;}case "h170":{deleteOrderV126(__ARGS[0]);break;}case "h171":{ordersTabV126='active';loadOrdersPanelV126();break;}case "h172":{ordersTabV126='history';loadOrdersPanelV126();break;}case "h173":{adminOrdersView='stats';adminOrders();break;}case "h174":{adminOrdersView='stats';adminOrders();break;}case "h175":{statsRangeV126=__ARGS[0];loadStatisticsV126();break;}case "h176":{customerHistoryV126(__ARGS[0]);break;}case "h177":{customerHistoryV126(__ARGS[0]);break;}case "h178":{adminOrdersView='main';adminOrders();break;}case "h179":{adminOrdersView='config';adminOrders();break;}case "h180":{removeSpecialClosureV127(__ARGS[0]);break;}case "h181":{updateOrderStatusV126(__ARGS[0]);break;}case "h182":{openCustomerWhatsAppV127(__ARGS[0]);break;}case "h183":{copyOrderV125(__ARGS[0]);break;}case "h184":{printOrderV127(__ARGS[0]);break;}case "h185":{deleteOrderV126(__ARGS[0]);break;}case "h186":{viewOrderV125(__ARGS[0]);break;}case "h187":{openCustomerWhatsAppV127(__ARGS[0]);break;}case "h188":{printOrderV127(__ARGS[0]);break;}case "h189":{copyOrderV125(__ARGS[0]);break;}case "h190":{deleteOrderV126(__ARGS[0]);break;}case "h191":{restoreConfigBackupV127(__ARGS[0]);break;}case "h192":{PedeviaV130.openMaps(__ARGS[0]);break;}case "h193":{PedeviaV130.setStatus(__ARGS[0],__ARGS[1],false);break;}case "h194":{viewOrderV125(__ARGS[0]);break;}case "h195":{PedeviaV130.messageStatus(__ARGS[0]);break;}case "h196":{printOrderV127(__ARGS[0]);break;}case "h197":{adminOrdersView='stats';adminOrders();break;}case "h198":{adminOrdersView='history';adminOrders();break;}case "h199":{adminOrdersView='config';adminOrders();break;}case "h200":{adminOrdersView='active';ordersTabV126='active';adminOrders();break;}case "h201":{adminOrdersView='stats';adminOrders();break;}case "h202":{PedeviaV130.filterProducts(this.value);break;}case "h203":{PedeviaV130.toggleProduct(__ARGS[0]);break;}case "h204":{PedeviaV130.removeSpecialHours(__ARGS[0]);break;}case "h205":{PedeviaV130.tempClose(30);break;}case "h206":{PedeviaV130.tempClose(60);break;}case "h207":{PedeviaV130.tempClose(180);break;}case "h208":{PedeviaV130.bulkSet('available');break;}case "h209":{PedeviaV130.bulkSet('unavailable');break;}case "h210":{PedeviaV130.bulkSet('hidden');break;}case "h211":{setClientServiceStatusV131(__ARGS[0],'active');break;}case "h212":{setClientServiceStatusV131(__ARGS[0],'suspended');break;}case "h213":{openClientSiteV121(__ARGS[0]);break;}case "h214":{copyClientSiteLinkV121(__ARGS[0]);break;}case "h215":{editClientSiteV120(__ARGS[0]);break;}case "h216":{setClientServiceStatusV131(__ARGS[0],'active');break;}case "h217":{setClientServiceStatusV131(__ARGS[0],'suspended');break;}case "h218":{setClientServiceStatusV131(__ARGS[0],'cancelled');break;}case "h219":{readClientLogoV1211(this);break;}case "h220":{saveClientSiteV131(__ARGS[0]);break;}case "h221":{resendClientInviteV122(__ARGS[0]);break;}case "h222":{deleteClientSiteV120(__ARGS[0]);break;}case "h223":{editOffer(__ARGS[0]);break;}case "h224":{toggleOffer(__ARGS[0]);break;}case "h225":{deleteOffer(__ARGS[0]);break;}case "h226":{newOffer('percentage');break;}case "h227":{newOffer('loyalty');break;}case "h228":{applyTemplateV132(__ARGS[0]);break;}}}catch(err){console.error("[Pedevia CSP handler]",id,err);}}
 ["click","change","input"].forEach(function(type){
  document.addEventListener(type,function(event){
   const el=event.target&&event.target.closest?event.target.closest("[data-pedevia-handler]"):null;
   if(el){if(type==="click")event.preventDefault();let args=[];try{const raw=el.getAttribute("data-pedevia-args");if(raw)args=JSON.parse(decodeURIComponent(raw));}catch(e){}run.call(el,el.getAttribute("data-pedevia-handler"),el,event,args);return;}
   const named=event.target&&event.target.closest?event.target.closest("[data-pedevia-named-action]"):null;
   if(named&&type==="click"){event.preventDefault();const action=decodeURIComponent(named.getAttribute("data-pedevia-named-action")||"");try{switch(action){case "editOtherOrderSettings()":if(typeof editOtherOrderSettings==="function")editOtherOrderSettings();break;case "editPanelSettings()":if(typeof editPanelSettings==="function")editPanelSettings();break;case "editPaymentSettings()":if(typeof editPaymentSettings==="function")editPaymentSettings();break;case "editReceiptSettings()":if(typeof editReceiptSettings==="function")editReceiptSettings();break;}}catch(err){console.error("[Pedevia CSP named action]",action,err);}}
  },false);
 });
})();


/* PEDEVIA CSP — NAMED ACTION COMPATIBILITY FIX
   Corrige Configurações Gerais/Pedidos após remoção dos onclick.
   Sem eval/new Function: interpreta apenas chamadas nomeadas com argumentos simples.
*/
(function(){
  if(window.__pedeviaNamedActionCompat)return;
  window.__pedeviaNamedActionCompat=true;

  function splitArgs(src){
    const out=[]; let cur="", q=null, esc=false, depth=0;
    for(let i=0;i<src.length;i++){
      const ch=src[i];
      if(q){
        cur+=ch;
        if(esc) esc=false;
        else if(ch==="\\") esc=true;
        else if(ch===q) q=null;
        continue;
      }
      if(ch==="'"||ch==='""'){q=ch;cur+=ch;continue;}
      if(ch==="("||ch==="["||ch==="{"){depth++;cur+=ch;continue;}
      if(ch===")"||ch==="]"||ch==="}"){depth--;cur+=ch;continue;}
      if(ch===","&&depth===0){out.push(cur.trim());cur="";continue;}
      cur+=ch;
    }
    if(cur.trim())out.push(cur.trim());
    return out;
  }
  function primitive(v){
    v=(v||"").trim();
    if((v[0]==="'"&&v[v.length-1]==="'")||(v[0]==='"'&&v[v.length-1]==='"')){
      return v.slice(1,-1).replace(/\\(['"\\])/g,"$1");
    }
    if(v==="true")return true;
    if(v==="false")return false;
    if(v==="null")return null;
    if(v==="undefined")return undefined;
    if(v!==""&&!Number.isNaN(Number(v)))return Number(v);
    return v;
  }
  function invoke(action){
    const m=String(action||"").trim().match(/^([A-Za-z_$][\w$]*)\((.*)\)$/s);
    if(!m)return false;
    const fn=window[m[1]];
    if(typeof fn!=="function")return false;
    const args=m[2].trim()?splitArgs(m[2]).map(primitive):[];
    fn.apply(window,args);
    return true;
  }

  document.addEventListener("click",function(event){
    const el=event.target&&event.target.closest?event.target.closest("[data-pedevia-named-action]"):null;
    if(!el)return;
    const action=decodeURIComponent(el.getAttribute("data-pedevia-named-action")||"");
    if(!action)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try{
      if(!invoke(action)) console.warn("[Pedevia] Ação não resolvida:",action);
    }catch(err){
      console.error("[Pedevia] Falha em ação de configuração:",action,err);
    }
  },true);
})();


/* PEDEVIA CSP — SAVE ACTION RELIABILITY FIX
   Evita que ações Salvar sejam perdidas/duplicadas após a migração dos handlers.
   Também libera novamente o botão após a execução para permitir uma 2ª alteração.
*/
(function(){
  if(window.__pedeviaSaveActionReliability)return;
  window.__pedeviaSaveActionReliability=true;

  document.addEventListener("click",function(ev){
    const btn=ev.target&&ev.target.closest?ev.target.closest("button,[role=button]"):null;
    if(!btn)return;
    const label=(btn.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
    if(!label.startsWith("salvar"))return;

    /* Não cria uma ação nova: deixa o dispatcher CSP executar a ação migrada,
       mas garante que estados visuais/busy não prendam o botão para o próximo save. */
    setTimeout(function(){
      try{
        btn.disabled=false;
        btn.removeAttribute("aria-disabled");
        btn.classList.remove("disabled","is-disabled","busy","loading","saving");
        if(btn.dataset){
          delete btn.dataset.busy;
          delete btn.dataset.saving;
          delete btn.dataset.loading;
        }
      }catch(e){}
    },350);
    setTimeout(function(){
      try{
        btn.disabled=false;
        btn.removeAttribute("aria-disabled");
        btn.classList.remove("disabled","is-disabled","busy","loading","saving");
      }catch(e){}
    },1200);
  },true);
})();


/* PEDEVIA CSP — ADMIN CARD ACTION COMPATIBILITY
   Restaura ações de cards/menu migradas do onclick sem reintroduzir inline JS.
*/
(function(){
  if(window.__pedeviaAdminCardCompat)return;
  window.__pedeviaAdminCardCompat=true;

  const aliases={
    "Pedidos":"adminOrders",
    "Estatísticas de vendas":"salesStatsV126",
    "Otimizar imagens":"optimizeImagesV129",
    "Sites dos clientes":"openClientSitesMasterV120",
    "Backups da configuração":"openConfigBackupsV127",
    "QR Code":"generalQr"
  };

  document.addEventListener("click",function(ev){
    const card=ev.target&&ev.target.closest?ev.target.closest(".moreCard,.settingCard"):null;
    if(!card)return;
    const title=(card.querySelector("b,strong,h3,h4")?.textContent||card.textContent||"")
      .replace(/\s+/g," ").trim();

    let fnName=null;
    for(const [label,fn] of Object.entries(aliases)){
      if(title.startsWith(label)){fnName=fn;break;}
    }
    if(!fnName)return;
    const fn=window[fnName];
    if(typeof fn!=="function")return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    try{ fn(); }catch(err){ console.error("[Pedevia] Falha no card",fnName,err); }
  },true);
})();
