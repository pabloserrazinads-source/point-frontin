// ===== v1.32.55: SALVAMENTO DIRECIONADO DE PRODUTOS =====
(function(){
  'use strict';

  window.PEDEVIA_VERSION='1.32.55';

  const previousSaveProductV13255=window.saveProduct;
  const previousDuplicateProductV13255=window.duplicateProduct;

  function productButtonV13255(){
    return document.getElementById('saveProductBtnV132') ||
      [...document.querySelectorAll('button')].find(b=>/salvar\s+produto|concluir/i.test((b.textContent||'').trim())) || null;
  }

  function errorTextV13255(error){
    return String(error?.message || error?.error_description || error || 'Falha desconhecida');
  }

  async function requireAdminSessionV13255(){
    const {data,error}=await supabaseClient.auth.getSession();
    if(error)throw error;
    if(!data?.session)throw new Error('Sua sessão expirou. Entre novamente no Admin.');
  }

  async function upsertOneProductV13255(product,sortOrder){
    await requireAdminSessionV13255();
    const {error}=await supabaseClient
      .from('products')
      .upsert(productToDbRow(product,sortOrder),{onConflict:'id'});
    if(error)throw error;
    try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn('Falha no cache local',e)}
    return true;
  }

  window.saveProduct=async function(id){
    // Lojas de clientes persistem o catálogo dentro de client_sites.config.
    if(window.pedeviaTenantV121){
      return previousSaveProductV13255.apply(this,arguments);
    }
    if(window._savingProductV13255)return;

    const product=(cfg.products||[]).find(p=>String(p.id)===String(id));
    if(!product)return;

    const button=productButtonV13255();
    const oldText=button?.textContent || 'Salvar produto';
    window._savingProductV13255=true;

    try{
      if(button){button.disabled=true;button.textContent='Salvando produto...'}
      try{PedeviaV130.captureProductFlags(id)}catch(e){}

      product.name=document.getElementById('epn')?.value.trim() || 'Produto';
      product.desc=document.getElementById('epd')?.value || '';
      product.detailedDesc=document.getElementById('epdetail')?.value || '';
      product.price=Number(document.getElementById('epp')?.value) || 0;
      product.category=document.getElementById('epc')?.value || product.category || 'acai';
      product.status=document.getElementById('eps')?.value || 'available';

      if(typeof collectVariantsFromEditor==='function'){
        product.variants=collectVariantsFromEditor();
        delete product._draftVariants;
      }

      if(typeof hasVariants==='function' && !hasVariants(product)){
        product.allowedModes={
          delivery:document.getElementById('pmDelivery')?.checked ?? true,
          pickup:document.getElementById('pmPickup')?.checked ?? false,
          dinein:document.getElementById('pmDinein')?.checked ?? false
        };
        if(!product.allowedModes.delivery&&!product.allowedModes.pickup&&!product.allowedModes.dinein){
          throw new Error('Escolha pelo menos uma forma de atendimento para este produto.');
        }
      }else if(typeof hasVariants==='function' && hasVariants(product)){
        if(!product.variants?.length)throw new Error('Adicione pelo menos um tamanho.');
        if(product.variants.some(v=>!v.allowedModes?.delivery&&!v.allowedModes?.pickup&&!v.allowedModes?.dinein)){
          throw new Error('Cada tamanho precisa ter pelo menos uma forma de atendimento.');
        }
      }

      const typedUrl=document.getElementById('epi')?.value.trim() || '';
      if(product._pendingImage){
        if(button)button.textContent='Enviando imagem...';
        product.image=await PedeviaV130.uploadProductImage(id,product._pendingImage);
        delete product._pendingImage;
      }else if(typedUrl){
        product.image=typedUrl;
      }

      if(button)button.textContent='Gravando produto...';
      const position=Math.max(0,(cfg.products||[]).findIndex(p=>String(p.id)===String(id)));
      await upsertOneProductV13255(product,position);

      delete product._draftNewV132;
      window._editingProductV132=null;
      renderShop();
      if(typeof updateCart==='function')updateCart();
      if(typeof closeModalBaseV132==='function')closeModalBaseV132();
      else if(typeof closeModal==='function')closeModal();
      renderAdmin();

      if(typeof setSyncStatusV15==='function')setSyncStatusV15('ok');
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('✓ Produto salvo e publicado no cardápio');
      else alert('Produto salvo.');
      return true;
    }catch(error){
      console.error('Falha ao salvar produto v1.32.55:',error);
      if(typeof setSyncStatusV15==='function')setSyncStatusV15('error',errorTextV13255(error));
      const message='Não foi possível salvar: '+errorTextV13255(error);
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(message,'error');
      else alert(message);
      return false;
    }finally{
      window._savingProductV13255=false;
      const current=(button&&button.isConnected)?button:productButtonV13255();
      if(current){current.disabled=false;current.textContent=oldText}
    }
  };

  window.duplicateProduct=async function(id){
    if(window.pedeviaTenantV121){
      return previousDuplicateProductV13255.apply(this,arguments);
    }
    const original=(cfg.products||[]).find(p=>String(p.id)===String(id));
    if(!original){alert('Produto não encontrado.');return false}

    const copy=typeof deepCloneProductV18==='function'
      ? deepCloneProductV18(original)
      : JSON.parse(JSON.stringify(original));
    copy.id='p'+Date.now()+Math.floor(Math.random()*1000);
    copy.name=(original.name||'Produto')+' - cópia';
    delete copy._pendingImage;
    delete copy._draftVariants;
    delete copy._draftNewV132;

    // A cópia vai para o fim para não regravar os outros produtos apenas para
    // ajustar sort_order. Ela pode ser reordenada depois pelo painel.
    cfg.products.push(copy);
    try{
      await upsertOneProductV13255(copy,cfg.products.length-1);
      renderAdmin();
      renderShop();
      editProduct(copy.id);
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('✓ Produto duplicado. Edite a cópia e salve.');
      else alert('Produto duplicado. Agora edite a cópia e toque em Concluir.');
      return true;
    }catch(error){
      console.error('Falha ao duplicar produto v1.32.55:',error);
      cfg.products=cfg.products.filter(p=>String(p.id)!==String(copy.id));
      try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
      const message='Não foi possível duplicar: '+errorTextV13255(error);
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(message,'error');
      else alert(message);
      return false;
    }
  };

  function enforceVersionV13255(){
    window.PEDEVIA_VERSION='1.32.55';
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      const text=el.textContent||'';
      if(/Versão\s+1\.\d+(?:\.\d+)*/i.test(text)){
        el.textContent=text.replace(/Versão\s+1\.\d+(?:\.\d+)*/i,'Versão 1.32.55');
      }
    });
  }
  const previousRenderAdminV13255=window.renderAdmin;
  if(typeof previousRenderAdminV13255==='function'){
    window.renderAdmin=function(){
      const result=previousRenderAdminV13255.apply(this,arguments);
      setTimeout(enforceVersionV13255,0);
      return result;
    };
  }
  [0,400,1200,2500].forEach(ms=>setTimeout(enforceVersionV13255,ms));
})();
