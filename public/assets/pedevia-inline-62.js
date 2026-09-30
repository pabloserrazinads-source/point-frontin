// ===== v1.34.6: salvamento reentrante, preço de variações e exclusão por escopo =====
(function(){
  'use strict';

  const VERSION='1.34.6';
  const savingIds=new Set();
  const clone=value=>{
    try{return structuredClone(value)}catch(e){return JSON.parse(JSON.stringify(value))}
  };
  const product=id=>(cfg.products||[]).find(p=>String(p.id)===String(id));
  const group=id=>(cfg.groups||[]).find(g=>String(g.id)===String(id));
  const toast=(message,type)=>{
    if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(message,type);
    else alert(message);
  };
  const cache=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn(e)}};

  function resetSaveButton(id){
    const sheet=document.getElementById('sheet');
    const footer=sheet?.querySelector('.stickySave');
    if(!footer)return;
    const btn=footer.querySelector('#saveProductBtnV132,.btn');
    if(!btn)return;
    btn.id='saveProductBtnV132';
    btn.type='button';
    btn.disabled=false;
    btn.removeAttribute('aria-busy');
    btn.removeAttribute('data-pedevia-working');
    btn.removeAttribute('data-pedevia-product-save');
    btn.style.pointerEvents='auto';
    btn.style.opacity='';
    btn.textContent='Salvar produto';
    btn.removeAttribute('onclick');
    btn.onclick=event=>{
      event.preventDefault();
      event.stopPropagation();
      window.saveProduct(id);
    };
  }

  function addVariantPriceSetting(id){
    const p=product(id);
    const enabled=document.getElementById('pvEnabled');
    const editor=document.getElementById('variantEditor');
    if(!p||!enabled||!editor||document.getElementById('pvHideVariantPriceV1346'))return;
    const row=document.createElement('label');
    row.id='pvHideVariantPriceV1346Row';
    row.className='switchrow pvVariantPriceSettingV1346';
    row.innerHTML=`<span><b>Preço no cardápio principal</b><small class="hint">Ocultando, os valores aparecem somente depois que o cliente abrir o produto e escolher o tamanho.</small></span><input id="pvHideVariantPriceV1346" type="checkbox" ${p.allowedModes?.hidePriceOnCard!==false?'checked':''}>`;
    editor.parentNode.insertBefore(row,editor.nextSibling);
    const refresh=()=>row.classList.toggle('hide',!enabled.checked);
    enabled.addEventListener('change',refresh);
    refresh();
  }

  // Toda abertura do editor recebe um botão novo, funcional e sem estado antigo.
  const editProductBaseV1346=window.editProduct;
  editProduct=function(id){
    savingIds.delete(String(id));
    window._savingProductV132=false;
    const result=editProductBaseV1346.apply(this,arguments);
    setTimeout(()=>{
      resetSaveButton(id);
      addVariantPriceSetting(id);
    },30);
    return result;
  };
  window.editProduct=editProduct;

  // Proteção local por produto: um estado antigo global nunca bloqueia uma edição nova.
  const saveProductBaseV1346=window.saveProduct;
  saveProduct=async function(id){
    const key=String(id);
    if(savingIds.has(key))return;
    const p=product(id);
    if(!p)return;
    savingIds.add(key);
    window._savingProductV132=false;
    p.allowedModes=p.allowedModes||{delivery:true,pickup:false,dinein:false};
    const priceChoice=document.getElementById('pvHideVariantPriceV1346');
    if(priceChoice)p.allowedModes.hidePriceOnCard=!!priceChoice.checked;
    try{
      return await saveProductBaseV1346(id);
    }finally{
      savingIds.delete(key);
      window._savingProductV132=false;
      setTimeout(()=>{
        if(window._editingProductV132&&String(window._editingProductV132)===key)resetSaveButton(id);
      },30);
    }
  };
  window.saveProduct=saveProduct;

  // Nos cartões dos grupos fica somente Editar. A exclusão pertence ao editor do grupo.
  productGroupsHTML=function(p){
    p.groups=Array.isArray(p.groups)?p.groups:[];
    return p.groups.map((gid,i)=>{
      const g=group(gid);
      if(!g)return'';
      const required=g.required||Number(g.min)>0;
      const rule=g.selectionMode==='single'?'Uma única opção':g.selectionMode==='quantity'?'Opção de quantidade':'Uma ou mais opções';
      return `<div class="assignedGroup"><div class="assignedGroupHead"><div><b>${esc(g.name)}</b> <span class="tinyTag">${required?'Obrigatório':'Opcional'}</span><div class="names">${esc(groupNames(g))}</div><div class="hint">${rule} · ${g.unlimited?'sem limite':'máx. '+g.max}</div></div>${productGroupOrderActions(p,g,i)}</div></div>`;
    }).join('');
  };
  window.productGroupsHTML=productGroupsHTML;

  const editGroupBaseV1346=window.editGroupForProduct;
  editGroupForProduct=function(pid,gid){
    const result=editGroupBaseV1346.apply(this,arguments);
    setTimeout(()=>{
      const footer=document.querySelector('#sheet .stickySave');
      if(!footer||footer.querySelector('.pvDeleteGroupV1346'))return;
      const del=document.createElement('button');
      del.type='button';
      del.className='dangerBtn pvDeleteGroupV1346';
      del.textContent='Excluir grupo';
      del.onclick=()=>window.deleteGroupByScopeV1346(pid,gid);
      footer.insertBefore(del,footer.firstElementChild);
    },0);
    return result;
  };
  window.editGroupForProduct=editGroupForProduct;

  window.deleteGroupByScopeV1346=async function(pid,gid){
    const p=product(pid),g=group(gid);
    if(!p||!g)return;
    const scope=document.querySelector('input[name="saveScope"]:checked')?.value||'global';
    const global=scope==='global';
    const message=global
      ? `Excluir o grupo "${g.name}" de TODOS os produtos onde ele está aplicado?\n\nO grupo e seus complementos serão removidos globalmente.`
      : `Excluir o grupo "${g.name}" somente de "${p.name}"?\n\nOs demais produtos continuarão com este grupo.`;
    if(!confirm(message))return;

    const groupsBefore=clone(cfg.groups||[]);
    const linksBefore=(cfg.products||[]).map(item=>({id:item.id,groups:[...(item.groups||[])]}));
    try{
      if(global){
        cfg.groups=(cfg.groups||[]).filter(item=>String(item.id)!==String(gid));
        (cfg.products||[]).forEach(item=>{
          item.groups=(item.groups||[]).filter(id=>String(id)!==String(gid));
        });
      }else{
        p.groups=(p.groups||[]).filter(id=>String(id)!==String(gid));
      }

      if(!(p._draftNewV132&&!global)){
        const ok=await persistAdminStateV15({products:true,notify:false});
        if(ok===false)throw new Error('O servidor não confirmou a exclusão.');
      }
      cache();
      editProduct(pid);
      renderShop();
      toast(global?'✓ Grupo excluído de todos os produtos':'✓ Grupo excluído somente deste produto');
    }catch(e){
      cfg.groups=groupsBefore;
      linksBefore.forEach(saved=>{
        const target=product(saved.id);
        if(target)target.groups=saved.groups;
      });
      console.error('Falha ao excluir grupo v1.34.6:',e);
      toast('Não foi possível excluir o grupo: '+(e?.message||e),'error');
    }
  };

  function applyCardPricePreferenceV1346(){
    document.querySelectorAll('#productGrid .card[data-pedevia-open-product]').forEach(card=>{
      const p=product(card.getAttribute('data-pedevia-open-product'));
      if(!p||!Array.isArray(p.variants)||!p.variants.length)return;
      const body=card.querySelector('.cardbody');
      if(!body)return;
      body.querySelectorAll('.pvVariantCardPriceV1346').forEach(el=>el.remove());
      if(p.allowedModes?.hidePriceOnCard!==false){
        body.querySelectorAll('.row').forEach(row=>{if(row.querySelector('.price'))row.remove()});
        return;
      }
      const prices=p.variants.filter(v=>v.status!=='hidden').map(v=>Number(v.price)).filter(Number.isFinite);
      if(!prices.length)return;
      const row=document.createElement('div');
      row.className='row pvVariantCardPriceV1346';
      row.innerHTML=`<span class="price">A partir de ${brl(Math.min(...prices))}</span>`;
      body.appendChild(row);
    });
  }

  const renderShopBaseV1346=window.renderShop;
  renderShop=function(){
    const result=renderShopBaseV1346.apply(this,arguments);
    setTimeout(applyCardPricePreferenceV1346,0);
    return result;
  };
  window.renderShop=renderShop;
  setTimeout(applyCardPricePreferenceV1346,0);

  const style=document.createElement('style');
  style.id='pedeviaProductsV1346';
  style.textContent=`
    .pvVariantPriceSettingV1346{margin:10px 0 16px!important;border:1px solid var(--line);border-radius:15px;padding:13px;background:#faf8fb}
    .pvVariantPriceSettingV1346 span{min-width:0;padding-right:10px}
    .pvVariantPriceSettingV1346 small{display:block;margin-top:4px;line-height:1.35}
    #sheet .stickySave .pvDeleteGroupV1346{background:#fde3e6;color:#9d2835}
  `;
  document.head.appendChild(style);

  window.PEDEVIA_PRODUCTS_V1346={
    version:VERSION,
    staleSaveLockFixed:true,
    variantCardPricePreference:true,
    groupDeletionUsesSelectedScope:true,
    groupCardRemoveButton:false
  };
  try{window.PEDEVIA_VERSION=VERSION;applyPedeviaVersion?.()}catch(e){}
})();
