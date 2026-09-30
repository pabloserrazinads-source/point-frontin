// ===== v1.35.0: módulo consolidado de criação, edição e duplicação de produtos =====
(function(){
  'use strict';

  const VERSION='1.35.0';
  const savingIds=new Set();
  const clone=value=>{
    try{return structuredClone(value)}catch(e){return JSON.parse(JSON.stringify(value))}
  };
  const toast=(message,type)=>{
    if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(message,type);
    else alert(message);
  };
  const product=id=>(cfg.products||[]).find(p=>String(p.id)===String(id));
  const group=id=>(cfg.groups||[]).find(g=>String(g.id)===String(id));
  const cache=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn(e)}};
  const isDataImage=value=>/^data:image\/[a-z0-9.+-]+;base64,/i.test(String(value||''));

  // Produto realmente novo: nenhum grupo é herdado automaticamente.
  let creating=false;
  newProduct=function(sectionId){
    if(creating||window._savingProductV132)return;
    creating=true;
    try{
      const existing=(cfg.products||[]).find(p=>p?._draftNewV132);
      if(existing){
        window._editingProductV132=existing.id;
        editProduct(existing.id);
        return;
      }
      const sid=sectionId||cfg.sections?.[0]?.id||'produtos';
      const p={
        id:'p'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
        category:sid,
        name:'Novo produto',
        desc:'',
        detailedDesc:'',
        price:0,
        status:'available',
        image:'',
        images:[],
        groups:[],
        _draftNewV132:true
      };
      cfg.products.push(p);
      window._editingProductV132=p.id;
      editProduct(p.id);
    }finally{
      setTimeout(()=>{creating=false;window._newProductLockV132=false},500);
    }
  };
  window.newProduct=newProduct;

  // Duplicar é a única ação que copia deliberadamente todos os grupos.
  duplicateProduct=function(id){
    if(creating||window._savingProductV132)return;
    const original=product(id);
    if(!original){toast('Produto original não encontrado.','error');return}
    const existing=(cfg.products||[]).find(p=>p?._draftNewV132);
    if(existing){
      window._editingProductV132=existing.id;
      editProduct(existing.id);
      toast('Conclua ou cancele o produto que já está em edição.');
      return;
    }
    const copy=clone(original);
    copy.id='p'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
    copy.name=(original.name||'Produto')+' — cópia';
    copy.groups=Array.isArray(original.groups)?[...original.groups]:[];
    copy.status='hidden';
    copy._draftNewV132=true;
    if(isDataImage(copy.image)){
      copy._pendingImage=copy.image;
      copy.image='';
    }else delete copy._pendingImage;
    delete copy._draftVariants;
    const index=(cfg.products||[]).findIndex(p=>String(p.id)===String(id));
    cfg.products.splice(index<0?cfg.products.length:index+1,0,copy);
    window._editingProductV132=copy.id;
    editProduct(copy.id);
  };
  window.duplicateProduct=duplicateProduct;

  // A exclusão fica dentro do editor do grupo, onde o escopo é explícito.
  productGroupsHTML=function(p){
    p.groups=Array.isArray(p.groups)?p.groups:[];
    return p.groups.map((gid,i)=>{
      const g=group(gid);
      if(!g)return'';
      const required=g.required||Number(g.min)>0;
      const rule=g.selectionMode==='single'?'Uma única opção':g.selectionMode==='quantity'?'Opção de quantidade':'Uma ou mais opções';
      return `<div class="assignedGroup">
        <div class="assignedGroupHead">
          <div class="pvGroupSummaryV1345">
            <b>${esc(g.name)}</b> <span class="tinyTag">${required?'Obrigatório':'Opcional'}</span>
            <div class="names">${esc(groupNames(g))}</div>
            <div class="hint">${rule} · ${g.unlimited?'sem limite':'máx. '+g.max}</div>
          </div>
          ${productGroupOrderActions(p,g,i)}
        </div>
      </div>`;
    }).join('');
  };
  window.productGroupsHTML=productGroupsHTML;

  // Mantém o comportamento já existente, mas agora confirma a persistência online.
  // Global edita o mesmo grupo para todos; "apenas este produto" cria uma cópia independente.
  saveAdvancedGroup=async function(pid,gid){
    const old=group(gid);
    const p=product(pid);
    const scope=document.querySelector('input[name="saveScope"]:checked')?.value||'global';
    if(!old||!p)return;
    const groupsBefore=clone(cfg.groups||[]);
    const productGroupsBefore=(cfg.products||[]).map(x=>({id:x.id,groups:[...(x.groups||[])]}));
    try{
      const form=collectGroupForm(old);
      if(scope==='global'){
        Object.assign(old,form);
      }else{
        const stamp=Date.now();
        const copy={...form,id:'g'+stamp+'_'+Math.random().toString(36).slice(2,6)};
        copy.options=(form.options||[]).map((o,i)=>({...o,id:'o'+stamp+'_'+i}));
        cfg.groups.push(copy);
        p.groups=(p.groups||[]).map(id=>String(id)===String(gid)?copy.id:id);
      }
      const ok=await persistAdminStateV15({products:true,notify:false});
      if(ok===false)throw new Error('O servidor não confirmou a alteração.');
      cache();
      editProduct(pid);
      renderShop();
      toast(scope==='global'?'✓ Grupo atualizado em todos os produtos':'✓ Grupo alterado somente neste produto');
    }catch(e){
      cfg.groups=groupsBefore;
      productGroupsBefore.forEach(saved=>{const target=product(saved.id);if(target)target.groups=saved.groups});
      console.error('Falha ao salvar grupo v1.34.5:',e);
      toast('Não foi possível salvar o grupo: '+(e?.message||e),'error');
    }
  };
  window.saveAdvancedGroup=saveAdvancedGroup;

  // Salva rascunhos com imagem em duas etapas. O registro oculto passa a existir
  // antes do upload e só é publicado após a foto e todos os dados serem confirmados.
  saveProduct=async function(id){
    const saveKey=String(id);
    if(savingIds.has(saveKey))return;
    const p=product(id);
    if(!p)return;
    const btn=document.getElementById('saveProductBtnV132')||document.querySelector('.stickySave .btn');
    const oldText=btn?.textContent||'Salvar produto';
    const wasDraft=!!p._draftNewV132;
    const oldStatus=p.status;
    const pending=p._pendingImage;
    savingIds.add(saveKey);
    window._savingProductV132=true;
    try{
      if(btn){btn.disabled=true;btn.textContent='Preparando produto...'}
      // A configuração é persistida inteira. Corrige imagens base64 antigas de
      // qualquer produto antes do save para que elas não bloqueiem o catálogo.
      const uploadedByData=new Map();
      const dirty=(cfg.products||[]).filter(item=>String(item.id)!==saveKey&&(isDataImage(item._pendingImage)||isDataImage(item.image)));
      for(let index=0;index<dirty.length;index++){
        const item=dirty[index];
        const data=isDataImage(item._pendingImage)?item._pendingImage:item.image;
        if(btn)btn.textContent=`Corrigindo imagem ${index+1}/${dirty.length}...`;
        let url=uploadedByData.get(data);
        if(!url){url=await PedeviaV130.uploadProductImage(item.id,data);uploadedByData.set(data,url)}
        item.image=url;
        delete item._pendingImage;
      }
      try{PedeviaV130.captureProductFlags(id)}catch(e){}
      p.name=document.getElementById('epn')?.value.trim()||'Produto';
      p.desc=document.getElementById('epd')?.value||'';
      p.detailedDesc=document.getElementById('epdetail')?.value||'';
      p.price=Number(document.getElementById('epp')?.value)||0;
      p.category=document.getElementById('epc')?.value||p.category;
      const desiredStatus=document.getElementById('eps')?.value||'available';
      const typedUrl=document.getElementById('epi')?.value.trim()||'';

      if(typeof collectVariantsFromEditor==='function'){
        p.variants=collectVariantsFromEditor();
        delete p._draftVariants;
      }
      if(typeof hasVariants==='function'&&!hasVariants(p)){
        const showPriceOnCard=p.allowedModes?.showPriceOnCard===true;
        p.allowedModes={
          delivery:document.getElementById('pmDelivery')?.checked??true,
          pickup:document.getElementById('pmPickup')?.checked??false,
          dinein:document.getElementById('pmDinein')?.checked??false,
          showPriceOnCard
        };
        if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein)
          throw new Error('Escolha pelo menos uma forma de atendimento para este produto.');
      }else if(typeof hasVariants==='function'&&hasVariants(p)){
        if(!p.variants?.length)throw new Error('Adicione pelo menos um tamanho.');
        if(p.variants.some(v=>!v.allowedModes?.delivery&&!v.allowedModes?.pickup&&!v.allowedModes?.dinein))
          throw new Error('Cada tamanho precisa ter pelo menos uma forma de atendimento.');
      }
      p.allowedModes=p.allowedModes||{};
      const priceChoice=document.getElementById('pvShowVariantPrice');
      if(priceChoice)p.allowedModes.showPriceOnCard=!!priceChoice.checked;

      // O marcador privado nunca é enviado na configuração definitiva.
      delete p._draftNewV132;
      const pendingImage=[p._pendingImage,typedUrl,p.image].find(isDataImage)||pending;
      if(wasDraft&&pendingImage){
        if(btn)btn.textContent='Criando registro seguro...';
        p.status='hidden';
        const prepared=await persistAdminStateV15({products:true,notify:false});
        if(prepared===false)throw new Error('Não foi possível preparar o novo produto para receber a imagem.');
      }
      if(pendingImage){
        if(btn)btn.textContent='Enviando imagem...';
        p.image=uploadedByData.get(pendingImage)||await PedeviaV130.uploadProductImage(id,pendingImage);
        delete p._pendingImage;
      }else if(typedUrl&&!isDataImage(typedUrl)){
        p.image=typedUrl;
      }
      p.status=desiredStatus;
      if(btn)btn.textContent='Gravando produto...';
      const ok=await persistAdminStateV15({products:true,notify:false});
      if(ok===false)throw new Error('O servidor não confirmou o salvamento do produto.');

      delete p._draftNewV132;
      delete p._pendingImage;
      cache();
      window._editingProductV132=null;
      renderShop();
      window._savingProductV132=false;
      closeModal();
      renderAdmin();
      toast('✓ Produto salvo e publicado no cardápio');
    }catch(e){
      if(wasDraft)p._draftNewV132=true;
      p.status=oldStatus;
      if(pending&&!p._pendingImage)p._pendingImage=pending;
      console.error('Falha ao salvar produto v1.34.5:',e);
      toast(e?.message||'Não foi possível salvar o produto.','error');
    }finally{
      savingIds.delete(saveKey);
      window._savingProductV132=false;
      const current=document.getElementById('saveProductBtnV132')||btn;
      if(current&&current.isConnected){current.disabled=false;current.textContent=oldText}
    }
  };
  window.saveProduct=saveProduct;

  function closeProductEditor(id,removeDraft){
    if(removeDraft&&product(id)?._draftNewV132)cfg.products=(cfg.products||[]).filter(item=>String(item.id)!==String(id));
    window._editingProductV132=null;window._savingProductV132=false;window._newProductLockV132=false;
    closeModal();renderAdmin();renderShop();
  }
  async function deleteProductFromEditor(id){
    const p=product(id);if(!p)return;
    if(p._draftNewV132){if(confirm(`Excluir "${p.name}"?`))closeProductEditor(id,true);return}
    await deleteProductOnline(id);
  }
  function footerButton(label,className,handler){
    const button=document.createElement('button');button.type='button';button.className=className;button.textContent=label;
    button.dataset.noAutoBusy='1';
    button.onclick=event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();handler()};
    return button;
  }
  function normalizeProductFooter(id){
    const footer=document.querySelector('#sheet .stickySave'),p=product(id);
    if(!footer||!p||!document.getElementById('epn'))return;
    footer.dataset.pvProductFooter='1';footer.innerHTML='';
    const remove=footerButton('Excluir','dangerBtn',()=>deleteProductFromEditor(id));
    const cancel=footerButton('Cancelar','ghost',()=>closeProductEditor(id,true));
    const duplicate=footerButton('Duplicar','ghost duplicateProductBtn',()=>window.duplicateProduct(id));
    if(p._draftNewV132)duplicate.disabled=true;
    const saveButton=footerButton('Salvar produto','btn',()=>window.saveProduct(id));saveButton.id='saveProductBtnV132';
    footer.append(remove,cancel,duplicate,saveButton);
  }
  function addPriceSetting(id){
    const p=product(id),enabled=document.getElementById('pvEnabled'),editor=document.getElementById('variantEditor');
    if(!p||!enabled||!editor||document.getElementById('pvShowVariantPrice'))return;
    const row=document.createElement('label');row.className='switchrow pvVariantPriceSetting';
    row.innerHTML=`<span><b>Exibir preço no cardápio principal</b><small class="hint">Desmarcado: o valor aparece somente depois que o cliente abrir o produto e escolher o tamanho.</small></span><input id="pvShowVariantPrice" type="checkbox" ${p.allowedModes?.showPriceOnCard===true?'checked':''}>`;
    editor.parentNode.insertBefore(row,editor.nextSibling);
    const refresh=()=>row.classList.toggle('hide',!enabled.checked);enabled.addEventListener('change',refresh);refresh();
  }

  const editProductBase=window.editProduct;
  editProduct=function(id){
    const p=product(id);if(!p){toast('Produto não encontrado. Atualize o cardápio.','error');return}
    savingIds.delete(String(id));window._savingProductV132=false;window._newProductLockV132=false;window._editingProductV132=id;
    const result=editProductBase.apply(this,arguments);
    setTimeout(()=>{addPriceSetting(id);normalizeProductFooter(id)},30);
    return result;
  };
  window.editProduct=editProduct;

  const editGroupBase=window.editGroupForProduct;
  editGroupForProduct=function(pid,gid){
    const result=editGroupBase.apply(this,arguments);
    setTimeout(()=>{
      const footer=document.querySelector('#sheet .stickySave');if(!footer||footer.querySelector('.pvDeleteGroup'))return;
      const del=footerButton('Excluir grupo','dangerBtn pvDeleteGroup',()=>window.deleteGroupByScope(pid,gid));
      footer.insertBefore(del,footer.firstElementChild);
    },0);
    return result;
  };
  window.editGroupForProduct=editGroupForProduct;

  window.deleteGroupByScope=async function(pid,gid){
    const p=product(pid),g=group(gid);if(!p||!g)return;
    const scope=document.querySelector('input[name="saveScope"]:checked')?.value||'global',global=scope==='global';
    const message=global?`Excluir "${g.name}" de todos os produtos?`:`Excluir "${g.name}" somente de "${p.name}"?`;
    if(!confirm(message))return;
    const groupsBefore=clone(cfg.groups||[]),linksBefore=(cfg.products||[]).map(item=>({id:item.id,groups:[...(item.groups||[])]}));
    try{
      if(global){cfg.groups=(cfg.groups||[]).filter(item=>String(item.id)!==String(gid));(cfg.products||[]).forEach(item=>item.groups=(item.groups||[]).filter(id=>String(id)!==String(gid)))}
      else p.groups=(p.groups||[]).filter(id=>String(id)!==String(gid));
      if(!(p._draftNewV132&&!global)){const ok=await persistAdminStateV15({products:true,notify:false});if(ok===false)throw new Error('O servidor não confirmou a exclusão.')}
      cache();editProduct(pid);renderShop();toast(global?'✓ Grupo excluído de todos os produtos':'✓ Grupo excluído somente deste produto');
    }catch(e){cfg.groups=groupsBefore;linksBefore.forEach(saved=>{const target=product(saved.id);if(target)target.groups=saved.groups});toast('Não foi possível excluir o grupo: '+(e?.message||e),'error')}
  };

  function applyCardPricePreference(){
    document.querySelectorAll('#productGrid .card[data-pedevia-open-product]').forEach(card=>{
      const p=product(card.getAttribute('data-pedevia-open-product'));if(!p||!Array.isArray(p.variants)||!p.variants.length)return;
      const body=card.querySelector('.cardbody');if(!body)return;
      body.querySelectorAll('.pvVariantCardPrice').forEach(el=>el.remove());
      body.querySelectorAll('.row').forEach(row=>{if(row.querySelector('.price'))row.remove()});
      if(p.allowedModes?.showPriceOnCard!==true)return;
      const prices=p.variants.filter(v=>v.status!=='hidden').map(v=>Number(v.price)).filter(Number.isFinite);if(!prices.length)return;
      const row=document.createElement('div');row.className='row pvVariantCardPrice';row.innerHTML=`<span class="price">A partir de ${brl(Math.min(...prices))}</span>`;body.appendChild(row);
    });
  }
  const renderShopBase=window.renderShop;
  renderShop=function(){const result=renderShopBase.apply(this,arguments);setTimeout(applyCardPricePreference,0);return result};
  window.renderShop=renderShop;

  function normalizeCatalogButtons(){
    document.querySelectorAll('#adminContent .adminProdCard').forEach(card=>card.querySelectorAll('button').forEach(button=>{
      button.dataset.noAutoBusy='1';button.disabled=false;button.removeAttribute('aria-busy');button.style.pointerEvents='auto';
      if(button.dataset.pedeviaOriginalText)button.textContent=button.dataset.pedeviaOriginalText;
      delete button.dataset.pedeviaBusy;delete button.dataset.pedeviaWorking;
    }));
  }
  const admin=document.getElementById('adminContent');if(admin)new MutationObserver(()=>setTimeout(normalizeCatalogButtons,0)).observe(admin,{childList:true,subtree:true});
  setTimeout(()=>{normalizeCatalogButtons();applyCardPricePreference()},0);

  const style=document.createElement('style');
  style.id='pedeviaProductsConsolidatedV1350';
  style.textContent=`
    .pvGroupSummaryV1345{min-width:0;flex:1}
    .pvGroupActionsV1345{display:flex;flex-direction:column;gap:8px;align-items:stretch;min-width:142px}
    .pvGroupActionsV1345 button{margin:0!important;white-space:normal;line-height:1.15;padding:10px 12px}
    .pvVariantPriceSetting{margin:10px 0 16px!important;border:1px solid var(--line);border-radius:15px;padding:13px;background:#faf8fb}
    #sheet .stickySave[data-pv-product-footer]{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:10px!important}
    #sheet .stickySave[data-pv-product-footer] #saveProductBtnV132{grid-column:1/-1!important;width:100%!important;min-height:54px!important}
    #sheet .stickySave[data-pv-product-footer] button{margin:0!important}
    @media(max-width:520px){
      .assignedGroupHead{align-items:flex-start!important;gap:10px}
      .pvGroupActionsV1345{min-width:126px}
      .pvGroupActionsV1345 button{font-size:13px;padding:9px 8px}
    }
  `;
  document.head.appendChild(style);

  window.PEDEVIA_PRODUCTS_CONSOLIDATED={
    version:VERSION,
    newProductsStartEmpty:true,
    duplicatesCopyGroups:true,
    productOnlyUnlink:true,
    scopedGroupEditing:true,
    draftImageTwoPhaseSave:true,
    singleEditorFlow:true,
    checkedPriceMeansShow:true,
    scopedGroupDeletion:true
  };
  try{window.PEDEVIA_VERSION=VERSION;applyPedeviaVersion?.()}catch(e){}
})();
