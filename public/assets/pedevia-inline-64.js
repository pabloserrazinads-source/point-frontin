// ===== v1.34.8: semântica correta da opção de preço no cardápio =====
(function(){
  'use strict';

  const VERSION='1.34.8';
  const product=id=>(cfg.products||[]).find(p=>String(p.id)===String(id));

  function configurePriceOptionV1348(id){
    const p=product(id);
    const input=document.getElementById('pvHideVariantPriceV1346');
    const row=document.getElementById('pvHideVariantPriceV1346Row');
    if(!p||!input||!row)return;

    const title=row.querySelector('b');
    const help=row.querySelector('small');
    if(title)title.textContent='Exibir preço no cardápio principal';
    if(help)help.textContent='Desmarcado: o preço fica oculto e os valores aparecem somente quando o cliente abrir o produto e escolher o tamanho.';

    // Nova regra inequívoca: marcado mostra; desmarcado oculta.
    // Configurações antigas sem o novo campo começam ocultas.
    input.checked=p.allowedModes?.showPriceOnCard===true;
    input.setAttribute('aria-label','Exibir preço no cardápio principal');
  }

  const editProductBaseV1348=window.editProduct;
  editProduct=function(id){
    const result=editProductBaseV1348.apply(this,arguments);
    setTimeout(()=>configurePriceOptionV1348(id),100);
    return result;
  };
  window.editProduct=editProduct;

  // A v1.34.7 grava hidePriceOnCard. Invertemos temporariamente o checkbox
  // para manter compatibilidade, e persistimos também o novo campo explícito.
  const saveProductBaseV1348=window.saveProduct;
  saveProduct=async function(id){
    const p=product(id);
    const input=document.getElementById('pvHideVariantPriceV1346');
    if(!p||!input)return saveProductBaseV1348(id);

    const show=!!input.checked;
    p.allowedModes=p.allowedModes||{};
    p.allowedModes.showPriceOnCard=show;
    p.allowedModes.hidePriceOnCard=!show;

    // Compatibilidade com o coletor da versão anterior.
    input.checked=!show;
    try{
      return await saveProductBaseV1348(id);
    }finally{
      if(input.isConnected)input.checked=show;
    }
  };
  window.saveProduct=saveProduct;

  function applyPublicPriceRuleV1348(){
    document.querySelectorAll('#productGrid .card[data-pedevia-open-product]').forEach(card=>{
      const p=product(card.getAttribute('data-pedevia-open-product'));
      if(!p||!Array.isArray(p.variants)||!p.variants.length)return;
      const body=card.querySelector('.cardbody');
      if(!body)return;

      body.querySelectorAll('.pvVariantCardPriceV1346,.pvVariantCardPriceV1348').forEach(el=>el.remove());
      body.querySelectorAll('.row').forEach(row=>{
        if(row.querySelector('.price'))row.remove();
      });

      // Desmarcado e configurações antigas: preço oculto.
      if(p.allowedModes?.showPriceOnCard!==true)return;

      const prices=p.variants
        .filter(v=>v.status!=='hidden')
        .map(v=>Number(v.price))
        .filter(Number.isFinite);
      if(!prices.length)return;
      const row=document.createElement('div');
      row.className='row pvVariantCardPriceV1348';
      row.innerHTML=`<span class="price">A partir de ${brl(Math.min(...prices))}</span>`;
      body.appendChild(row);
    });
  }

  const renderShopBaseV1348=window.renderShop;
  renderShop=function(){
    const result=renderShopBaseV1348.apply(this,arguments);
    setTimeout(applyPublicPriceRuleV1348,60);
    return result;
  };
  window.renderShop=renderShop;
  setTimeout(applyPublicPriceRuleV1348,180);

  window.PEDEVIA_VARIANT_PRICE_V1348={
    version:VERSION,
    checkedMeansShow:true,
    uncheckedMeansHide:true,
    legacyDefaultsToHidden:true
  };
  try{window.PEDEVIA_VERSION=VERSION;applyPedeviaVersion?.()}catch(e){}
})();
