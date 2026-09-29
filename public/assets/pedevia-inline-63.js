// ===== v1.34.7: salvamento único e reparo automático de imagens base64 =====
(function(){
  'use strict';

  const VERSION='1.34.7';
  const saving=new Set();
  const product=id=>(cfg.products||[]).find(p=>String(p.id)===String(id));
  const toast=(message,type)=>{
    if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(message,type);
    else alert(message);
  };
  const isDataImage=value=>/^data:image\/[a-z0-9.+-]+;base64,/i.test(String(value||''));
  const cache=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn(e)}};

  function saveButton(){
    return document.querySelector('#sheet #saveProductBtnV132,#sheet .stickySave .btn');
  }

  function releaseButton(id,label='Salvar produto'){
    const btn=saveButton();
    if(!btn)return;
    btn.id='saveProductBtnV132';
    btn.type='button';
    btn.disabled=false;
    btn.textContent=label;
    btn.removeAttribute('aria-busy');
    btn.removeAttribute('data-pedevia-working');
    btn.removeAttribute('data-pedevia-product-save');
    btn.style.pointerEvents='auto';
    btn.style.opacity='';
    btn.removeAttribute('onclick');
    btn.onclick=event=>{
      event.preventDefault();
      event.stopPropagation();
      window.saveProduct(id);
    };
  }

  function captureProductForm(p){
    try{PedeviaV130.captureProductFlags(p.id)}catch(e){}
    p.name=document.getElementById('epn')?.value.trim()||'Produto';
    p.desc=document.getElementById('epd')?.value||'';
    p.detailedDesc=document.getElementById('epdetail')?.value||'';
    p.price=Number(document.getElementById('epp')?.value)||0;
    p.category=document.getElementById('epc')?.value||p.category;
    p.status=document.getElementById('eps')?.value||'available';

    if(typeof collectVariantsFromEditor==='function'){
      p.variants=collectVariantsFromEditor();
      delete p._draftVariants;
    }

    p.allowedModes=p.allowedModes||{delivery:true,pickup:false,dinein:false};
    const hide=document.getElementById('pvHideVariantPriceV1346');
    if(hide)p.allowedModes.hidePriceOnCard=!!hide.checked;

    if(typeof hasVariants==='function'&&!hasVariants(p)){
      const oldHide=p.allowedModes.hidePriceOnCard;
      p.allowedModes={
        delivery:document.getElementById('pmDelivery')?.checked??true,
        pickup:document.getElementById('pmPickup')?.checked??false,
        dinein:document.getElementById('pmDinein')?.checked??false,
        hidePriceOnCard:oldHide
      };
      if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein)
        throw new Error('Escolha pelo menos uma forma de atendimento para este produto.');
    }else if(typeof hasVariants==='function'&&hasVariants(p)){
      if(!p.variants?.length)throw new Error('Adicione pelo menos um tamanho.');
      if(p.variants.some(v=>!v.allowedModes?.delivery&&!v.allowedModes?.pickup&&!v.allowedModes?.dinein))
        throw new Error('Cada tamanho precisa ter pelo menos uma forma de atendimento.');
    }
  }

  // Substitui definitivamente a cadeia histórica de wrappers de save.
  saveProduct=async function(id){
    const key=String(id);
    if(saving.has(key))return;
    const p=product(id);
    if(!p)return;

    const btn=saveButton();
    const wasDraft=!!p._draftNewV132;
    const previousStatus=p.status;
    const previousImage=p.image||'';
    const previousPending=p._pendingImage;
    saving.add(key);
    window._savingProductV132=true;

    try{
      if(btn){
        btn.disabled=true;
        btn.setAttribute('aria-busy','true');
        btn.style.pointerEvents='none';
        btn.textContent='Preparando produto...';
      }

      captureProductForm(p);
      const desiredStatus=p.status;
      const imageField=document.getElementById('epi');
      const typed=imageField?.value.trim()||'';
      const normalUrl=typed&&!isDataImage(typed)?typed:'';
      const dataImage=[p._pendingImage,typed,normalUrl?'':p.image].find(isDataImage)||'';

      // Nenhum base64 entra no banco/configuração. Para rascunho com foto,
      // cria antes um registro oculto e leve, necessário para o upload seguro.
      if(wasDraft&&dataImage){
        if(btn)btn.textContent='Preparando envio da imagem...';
        delete p._draftNewV132;
        delete p._pendingImage;
        p.image='';
        p.status='hidden';
        const prepared=await persistAdminStateV15({products:true,notify:false});
        if(prepared===false)throw new Error('O servidor não permitiu preparar o novo produto.');
      }

      if(dataImage){
        if(btn)btn.textContent='Enviando imagem...';
        p.image=await PedeviaV130.uploadProductImage(id,dataImage);
        delete p._pendingImage;
        if(imageField)imageField.value=p.image;
      }else if(normalUrl){
        p.image=normalUrl;
        delete p._pendingImage;
      }

      p.status=desiredStatus;
      delete p._draftNewV132;
      delete p._pendingImage;
      if(btn)btn.textContent='Salvando alterações...';
      const ok=await persistAdminStateV15({products:true,notify:false});
      if(ok===false)throw new Error('O servidor não confirmou o salvamento.');

      cache();
      window._editingProductV132=null;
      window._savingProductV132=false;
      saving.delete(key);
      renderShop();
      closeModal();
      renderAdmin();
      toast('✓ Produto salvo com sucesso');
    }catch(e){
      if(wasDraft)p._draftNewV132=true;
      p.status=previousStatus;
      // Mantém a imagem disponível para nova tentativa, mas nunca a grava online.
      if(!p.image)p.image=previousImage;
      if(previousPending)p._pendingImage=previousPending;
      console.error('Falha ao salvar produto v1.34.7:',e);
      toast('Não foi possível salvar: '+(e?.message||e),'error');
    }finally{
      saving.delete(key);
      window._savingProductV132=false;
      if(window._editingProductV132&&String(window._editingProductV132)===key){
        releaseButton(id);
      }
    }
  };
  window.saveProduct=saveProduct;

  // Ao reabrir, limpa qualquer trava visual anterior e não exibe o base64 gigante.
  const editProductBaseV1347=window.editProduct;
  editProduct=function(id){
    saving.delete(String(id));
    window._savingProductV132=false;
    const result=editProductBaseV1347.apply(this,arguments);
    setTimeout(()=>{
      const p=product(id);
      const imageField=document.getElementById('epi');
      if(p&&imageField&&isDataImage(imageField.value)){
        imageField.value='';
        imageField.placeholder='Imagem pronta para ser corrigida ao salvar';
      }
      releaseButton(id);
    },60);
    return result;
  };
  window.editProduct=editProduct;

  // Garante a regra também após qualquer renderização tardia do cardápio.
  function enforceVariantPricesV1347(){
    document.querySelectorAll('#productGrid .card[data-pedevia-open-product]').forEach(card=>{
      const p=product(card.getAttribute('data-pedevia-open-product'));
      if(!p||!Array.isArray(p.variants)||!p.variants.length)return;
      const body=card.querySelector('.cardbody');
      if(!body)return;
      body.querySelectorAll('.pvVariantCardPriceV1346').forEach(el=>el.remove());
      body.querySelectorAll('.row').forEach(row=>{
        if(row.querySelector('.price'))row.remove();
      });
      if(p.allowedModes?.hidePriceOnCard!==false)return;
      const prices=p.variants.filter(v=>v.status!=='hidden').map(v=>Number(v.price)).filter(Number.isFinite);
      if(!prices.length)return;
      const row=document.createElement('div');
      row.className='row pvVariantCardPriceV1346';
      row.innerHTML=`<span class="price">A partir de ${brl(Math.min(...prices))}</span>`;
      body.appendChild(row);
    });
  }

  const renderShopBaseV1347=window.renderShop;
  renderShop=function(){
    const result=renderShopBaseV1347.apply(this,arguments);
    setTimeout(enforceVariantPricesV1347,20);
    return result;
  };
  window.renderShop=renderShop;
  setTimeout(enforceVariantPricesV1347,100);

  window.PEDEVIA_PRODUCT_SAVE_V1347={
    version:VERSION,
    singleFinalSave:true,
    repairsPersistedBase64:true,
    staleButtonStateReset:true,
    variantPriceEnforced:true
  };
  try{window.PEDEVIA_VERSION=VERSION;applyPedeviaVersion?.()}catch(e){}
})();
