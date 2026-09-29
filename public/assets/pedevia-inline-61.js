// ===== v1.34.5: produtos sem grupos automáticos, vínculo individual e imagem resiliente =====
(function(){
  'use strict';

  const VERSION='1.34.5';
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
    delete copy._pendingImage;
    delete copy._draftVariants;
    const index=(cfg.products||[]).findIndex(p=>String(p.id)===String(id));
    cfg.products.splice(index<0?cfg.products.length:index+1,0,copy);
    window._editingProductV132=copy.id;
    editProduct(copy.id);
  };
  window.duplicateProduct=duplicateProduct;

  // Cada cartão deixa explícito que o vínculo será removido só deste produto.
  productGroupsHTML=function(p){
    p.groups=Array.isArray(p.groups)?p.groups:[];
    return p.groups.map(gid=>{
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
          <div class="pvGroupActionsV1345">
            <button type="button" class="ghost" onclick="editGroupForProduct('${p.id}','${g.id}')">Editar</button>
            <button type="button" class="dangerBtn" onclick="removeGroupFromProductV1345('${p.id}','${g.id}')">Remover deste produto</button>
          </div>
        </div>
      </div>`;
    }).join('');
  };
  window.productGroupsHTML=productGroupsHTML;

  window.removeGroupFromProductV1345=async function(pid,gid){
    const p=product(pid),g=group(gid);
    if(!p||!g)return;
    if(!confirm(`Remover o grupo "${g.name}" somente de "${p.name}"?\n\nOs demais produtos não serão alterados.`))return;
    const before=[...(p.groups||[])];
    p.groups=before.filter(id=>String(id)!==String(gid));
    if(p._draftNewV132){editProduct(pid);return}
    const ok=await persistAdminStateV15({products:true,notify:false});
    if(ok===false){p.groups=before;toast('Não foi possível remover o grupo. Tente novamente.','error');return}
    cache();
    editProduct(pid);
    renderShop();
    toast('✓ Grupo removido somente deste produto');
  };

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
    if(window._savingProductV132)return;
    const p=product(id);
    if(!p)return;
    const btn=document.getElementById('saveProductBtnV132')||document.querySelector('.stickySave .btn');
    const oldText=btn?.textContent||'Salvar produto';
    const wasDraft=!!p._draftNewV132;
    const oldStatus=p.status;
    const pending=p._pendingImage;
    window._savingProductV132=true;
    try{
      if(btn){btn.disabled=true;btn.textContent='Preparando produto...'}
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
        p.allowedModes={
          delivery:document.getElementById('pmDelivery')?.checked??true,
          pickup:document.getElementById('pmPickup')?.checked??false,
          dinein:document.getElementById('pmDinein')?.checked??false
        };
        if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein)
          throw new Error('Escolha pelo menos uma forma de atendimento para este produto.');
      }else if(typeof hasVariants==='function'&&hasVariants(p)){
        if(!p.variants?.length)throw new Error('Adicione pelo menos um tamanho.');
        if(p.variants.some(v=>!v.allowedModes?.delivery&&!v.allowedModes?.pickup&&!v.allowedModes?.dinein))
          throw new Error('Cada tamanho precisa ter pelo menos uma forma de atendimento.');
      }

      // O marcador privado nunca é enviado na configuração definitiva.
      delete p._draftNewV132;
      if(wasDraft&&pending){
        if(btn)btn.textContent='Criando registro seguro...';
        p.status='hidden';
        const prepared=await persistAdminStateV15({products:true,notify:false});
        if(prepared===false)throw new Error('Não foi possível preparar o novo produto para receber a imagem.');
      }
      if(pending){
        if(btn)btn.textContent='Enviando imagem...';
        p.image=await PedeviaV130.uploadProductImage(id,pending);
        delete p._pendingImage;
      }else if(typedUrl){
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
      window._savingProductV132=false;
      const current=document.getElementById('saveProductBtnV132')||btn;
      if(current&&current.isConnected){current.disabled=false;current.textContent=oldText}
    }
  };
  window.saveProduct=saveProduct;

  const style=document.createElement('style');
  style.id='pedeviaProductGroupsV1345';
  style.textContent=`
    .pvGroupSummaryV1345{min-width:0;flex:1}
    .pvGroupActionsV1345{display:flex;flex-direction:column;gap:8px;align-items:stretch;min-width:142px}
    .pvGroupActionsV1345 button{margin:0!important;white-space:normal;line-height:1.15;padding:10px 12px}
    @media(max-width:520px){
      .assignedGroupHead{align-items:flex-start!important;gap:10px}
      .pvGroupActionsV1345{min-width:126px}
      .pvGroupActionsV1345 button{font-size:13px;padding:9px 8px}
    }
  `;
  document.head.appendChild(style);

  window.PEDEVIA_PRODUCT_GROUPS_V1345={
    version:VERSION,
    newProductsStartEmpty:true,
    duplicatesCopyGroups:true,
    productOnlyUnlink:true,
    scopedGroupEditing:true,
    draftImageTwoPhaseSave:true
  };
  try{window.PEDEVIA_VERSION=VERSION;applyPedeviaVersion?.()}catch(e){}
})();
