
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
