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

// Insights: identificadores aleatórios, sem nome, telefone, endereço ou conteúdo do pedido.
(function(){
 'use strict';
 const labels=['','Cardápio','Produto aberto','Carrinho','Finalização iniciada','Entrega ou consumo local','Pagamento','Dados finais','Pedido registrado'];
 const mem={},pending=new Map();let sending=false,lastActivity=Date.now(),lastPulse=0,initial=false;
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch(_){return mem[k]??fallback}};
 const write=(k,v)=>{mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
 const uuid=()=>crypto.randomUUID();
 const store=()=>String(currentStoreKeyV127()||'point-frontin');
 const enabled=()=>!logged&&mode!=='admin'&&document.visibilityState==='visible'&&!window.pedeviaPublicUnavailableV13233;
 function session(key){
  const now=Date.now(),k='pvInsightsSession:'+key;let state=read(k,null);
  if(!state||state.day!==today()||now-state.at>1800000){state={id:uuid(),visitor:read('pvInsightsVisitor',null)||uuid(),day:today(),at:now,step:1,order:null};write('pvInsightsVisitor',state.visitor)}
  state.at=now;write(k,state);return state;
 }
 function enqueue(step,order){
  if(!enabled())return;
  try{
   const key=store(),state=session(key);state.step=Math.max(state.step,step);if(order)state.order=String(order);
   write('pvInsightsSession:'+key,state);
   const event={p_store:key,p_session:state.id,p_visitor:state.visitor,p_step:state.step,p_order:state.order};
   pending.set(state.id,event);saveQueue();void flush();
  }catch(e){console.warn('Insights: registro temporariamente indisponível',e)}
 }
 function saveQueue(){write('pvInsightsQueue',Array.from(pending.values()).slice(-30))}
 async function flush(){
  if(sending||!enabled()||!pending.size)return;sending=true;
  try{for(const [id,event] of pending){
   const {data,error}=await supabaseClient.rpc('track_pedevia_insight_v13554',event);
   if(error||data!==true)break;
   if(pending.get(id)===event)pending.delete(id);saveQueue();
  }}catch(_e){}finally{sending=false}
 }
 function wrap(name,step,check){
  const base=window[name];if(typeof base!=='function')return;
  window[name]=function(){const before=cart.length,result=base.apply(this,arguments);if(!check||check(before))enqueue(step);return result};
 }
 wrap('openProduct',2,()=>!!document.querySelector('#modal.show .addPriceBtn'));
 wrap('addCart',3,before=>cart.length>before);
 wrap('showCart',3,()=>cart.length>0&&!!document.querySelector('#modal.show .checkoutTitle'));
 wrap('showReceiveChoices',4,()=>!!document.querySelector('#modal.show .checkoutTitle'));
 wrap('showDeliveryForm',5,()=>!!document.querySelector('#modal.show #coAddr'));
 wrap('showDineinForm',5,()=>!!document.querySelector('#modal.show #coTable'));
 wrap('showPaymentChoices',6,()=>!!document.querySelector('#modal.show .checkoutTitle'));
 wrap('showCustomerForm',7,()=>!!document.querySelector('#modal.show #coPhone'));
 const createBase=window.createOnlineOrderV125;
 if(typeof createBase==='function')window.createOnlineOrderV125=async function(){
  const row=await createBase.apply(this,arguments);if(row?.id)enqueue(8,row.id);return row;
 };
 ['pointerdown','keydown'].forEach(type=>document.addEventListener(type,()=>{lastActivity=Date.now()}, {passive:true}));
 setTimeout(()=>{
  try{(read('pvInsightsQueue',[])||[]).filter(e=>e.p_store===store()).forEach(e=>pending.set(e.p_session,e))}catch(_){}
  if(enabled()){enqueue(1);initial=true}
 },5000);
 setInterval(()=>{
  if(!enabled())return;
  if(!initial){enqueue(1);initial=true}
  else if(Date.now()-lastActivity<65000&&Date.now()-lastPulse>55000){lastPulse=Date.now();enqueue(1)}
  else void flush();
 },15000);
 window.addEventListener('online',()=>void flush());
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){lastActivity=Date.now();enqueue(1)}});
 const statsBase=window.adminStatisticsV126;
 window.adminStatisticsV126=function(){
  const result=statsBase.apply(this,arguments),host=document.getElementById('adminContent');
  if(host&&!document.getElementById('pvInsightsLink')){
   const button=document.createElement('button');button.id='pvInsightsLink';button.type='button';button.className='ghost full';button.style.marginBottom='16px';button.textContent='Insights · Visitas e etapas do pedido';button.addEventListener('click',()=>window.openInsightsV13554());host.prepend(button);
  }return result;
 };
 const dayBack=n=>{const d=new Date(today()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-n);return d.toISOString().slice(0,10)};
 window.openInsightsV13554=function(){
  const host=document.getElementById('adminContent');if(!host)return;
  host.innerHTML=`<button class="backBtn" id="pvInsightsBack">‹ Voltar às estatísticas</button><div class="panel"><h2>Insights</h2><p class="hint">Visitas e caminho até o pedido, por dia no horário de Brasília.</p><div class="v126Filters"><button data-irange="0">Hoje</button><button data-irange="6">7 dias</button><button data-irange="29">30 dias</button><button data-irange="all">Desde o início</button></div><div class="two"><label>De<input id="pvInsightsFrom" type="date" class="field" value="${dayBack(29)}"></label><label>Até<input id="pvInsightsTo" type="date" class="field" value="${today()}"></label></div><button id="pvInsightsApply" class="btn full">Consultar</button></div><div id="pvInsightsResult" aria-live="polite"></div>`;
  document.getElementById('pvInsightsBack').onclick=()=>adminStatisticsV126();
  document.getElementById('pvInsightsApply').onclick=()=>window.loadInsightsV13554();
  host.querySelectorAll('[data-irange]').forEach(b=>b.onclick=()=>{document.getElementById('pvInsightsFrom').value=b.dataset.irange==='all'?'':dayBack(Number(b.dataset.irange));document.getElementById('pvInsightsTo').value=today();window.loadInsightsV13554()});
  window.loadInsightsV13554();
 };
 let loadToken=0;
 window.loadInsightsV13554=async function(){
  const host=document.getElementById('pvInsightsResult');if(!host)return;
  const token=++loadToken,from=document.getElementById('pvInsightsFrom').value||null,to=document.getElementById('pvInsightsTo').value||null;
  if(from&&to&&from>to){host.innerHTML='<div class="notice bad">A data inicial deve ser anterior à final.</div>';return}
  host.innerHTML='<div class="panel">Carregando Insights...</div>';
  try{
   const {data,error}=await supabaseClient.rpc('get_pedevia_insights_v13554',{p_store:store(),p_from:from,p_to:to});
   if(error)throw error;if(token!==loadToken||!host.isConnected)return;
   host.innerHTML=renderInsights(data||{});
  }catch(e){if(token===loadToken&&host.isConnected)host.innerHTML='<div class="notice bad"><b>Não foi possível carregar os Insights.</b><p>Execute o SQL da versão 1.35.54 no Supabase e verifique sua sessão e conexão.</p><small>'+esc(e.message||'Erro de conexão')+'</small></div>'}
 };
 function renderInsights(data){
  const days=data.days||[],funnel=data.funnel||[],since=data.tracking_since?new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(new Date(data.tracking_since)):null;
  const sum=k=>days.reduce((n,d)=>n+Number(d[k]||0),0),visits=sum('sessions'),converted=sum('converted'),rate=visits?(100*converted/visits).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%':'—';
  const first=data.tracking_since?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.tracking_since)):null;
  const num=(d,k)=>!first||d.day<first?'—':Number(d[k]||0);
  const measured=!!first&&days.some(d=>d.day>=first);
  const cards=[['Visitas (sessões)',measured?visits:'—'],['Sessões com pedido',measured?converted:'—'],['Conversão observada',measured?rate:'—'],['Pedidos registrados',sum('registered')],['Pedidos concluídos',sum('completed')],['Sessões sem atividade há 30 min',measured?sum('abandoned'):'—']];
  return `<div class="notice">${since?'Medição de visitas iniciada em '+esc(since)+'.':'Aguardando a primeira visita medida após a instalação.'} Pedidos anteriores foram consultados no histórico existente. Visitas e etapas anteriores à medição não estão disponíveis.</div><div class="v126StatsGrid">${cards.map(([label,value])=>`<div class="v126Stat"><b>${value}</b><small>${label}</small></div>`).join('')}</div><div class="panel"><h3>Até onde as pessoas chegaram</h3><p class="hint">Cada sessão aparece na etapa mais avançada que alcançou e nas anteriores. Algumas etapas podem ser puladas, como endereço na retirada.</p>${funnel.map(f=>`<div class="adminItem"><div><b>${esc(labels[Number(f.step)]||'Etapa')}</b><small style="display:block">${Number(f.reached)} sessões chegaram aqui ou avançaram</small></div><span>${Number(f.step)===8?'Finalizaram':Number(f.stopped)+' pararam aqui'}</span></div>`).join('')}<p class="hint">“Pararam” significa sem pedido registrado e sem atividade há pelo menos 30 minutos. Não é uma confirmação de desistência. ${sum('ongoing')} sessões ainda recentes no período.</p></div><div class="panel"><h3>Histórico diário</h3><div style="overflow-x:auto"><table class="pvInsightsTable"><thead><tr><th>Dia</th><th>Visitas</th><th>Navegadores</th><th>Sessões com pedido</th><th>Pedidos registrados</th><th>Concluídos</th><th>Pararam</th></tr></thead><tbody>${days.map(d=>`<tr><td>${esc(d.day.split('-').reverse().join('/'))}</td><td>${num(d,'sessions')}</td><td>${num(d,'visitors')}</td><td>${num(d,'converted')}</td><td>${Number(d.registered||0)}</td><td>${Number(d.completed||0)}</td><td>${num(d,'abandoned')}</td></tr>`).join('')||'<tr><td colspan="7">Sem registros neste período.</td></tr>'}</tbody></table></div><p class="hint">Um navegador pode fazer várias visitas. Uma nova visita começa após 30 minutos sem atividade ou na mudança do dia. Aparelhos diferentes ou dados de navegação apagados contam separadamente. O primeiro dia pode ter medição parcial. “Pedido registrado” confirma a gravação no sistema, não o envio ou a leitura no WhatsApp. Pedidos excluídos não podem ser recuperados aqui.</p><p class="hint">Identificadores aleatórios; não armazenamos nome, telefone, endereço ou conteúdo do pedido nos Insights. Falhas de rede e bloqueadores podem reduzir a contagem. Uso com o administrador conectado é excluído.</p></div>`;
 }
 window.PedeviaInsightsV13554={render:renderInsights,labels};
 const style=document.createElement('style');style.textContent='.pvInsightsTable{width:100%;border-collapse:collapse;font-size:14px}.pvInsightsTable th,.pvInsightsTable td{padding:12px 10px;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}#pvInsightsResult .notice{margin-bottom:16px}';document.head.appendChild(style);
})();
