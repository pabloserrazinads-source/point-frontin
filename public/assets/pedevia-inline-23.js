
// ===== v1.32.1: CONSOLIDAÇÃO DO GRANDE CONSERTO + AUDITORIA DE OVERRIDES =====
(function(){
  window.PEDEVIA_VERSION='1.32.51';

  // 1) Placeholder da marca: uma frase única, legível e realmente centralizada.
  const st=document.createElement('style');
  st.id='pedeviaV1321Styles';
  st.textContent=`
    .brandPreview,.brandPreviewV13119,.brandBlockV13119{
      text-align:center!important;
    }
    .brandPreview,.brandPreviewV13119{
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:100%!important;
      min-height:112px!important;
    }
    .brandFallback,.brandFallbackV13119,.brandFallbackV132,.brandFallbackV1321{
      width:210px!important;
      min-width:210px!important;
      height:86px!important;
      padding:12px 14px!important;
      box-sizing:border-box!important;
      border-radius:20px!important;
      border:1px dashed #999!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      text-align:center!important;
      white-space:nowrap!important;
      word-break:normal!important;
      overflow-wrap:normal!important;
      font-size:12px!important;
      line-height:1!important;
      font-weight:900!important;
      letter-spacing:.15px!important;
      color:#666!important;
      background:#fff!important;
    }
    button[data-pedevia-working="1"]{
      opacity:.76!important;
      cursor:wait!important;
      pointer-events:none!important;
    }
  `;
  document.head.appendChild(st);

  function normalizeLogoPlaceholderV1321(root=document){
    root.querySelectorAll?.('.brandFallback,.brandFallbackV13119,.brandFallbackV132').forEach(el=>{
      if(/LOGO\s*DO\s*ESTABELECIMENTO/i.test(el.textContent||'')){
        el.innerHTML='';
        el.textContent='LOGO DO ESTABELECIMENTO';
        el.classList.add('brandFallbackV1321');
      }
    });
  }
  normalizeLogoPlaceholderV1321();
  new MutationObserver(()=>normalizeLogoPlaceholderV1321())
    .observe(document.documentElement,{childList:true,subtree:true});

  // 2) Aparência: a v1.32.0 já montou 9 listas x 20 templates.
  // Esta camada garante que os antigos controles automáticos de composição/acabamento
  // não reapareçam por renderizações históricas. Personalização manual fica só no bloco
  // "Ajustar cores uma por uma", onde também ficam os degradês.
  function cleanLegacyAppearanceV1321(){
    const host=document.getElementById('adminContent');
    if(!host)return;
    const appearanceText=(host.textContent||'').toLowerCase();
    if(!appearanceText.includes('aparência'))return;
    host.querySelectorAll('.v117Section,.cfgBlock,.panel').forEach(box=>{
      const t=(box.textContent||'').toLowerCase();
      if(
        t.includes('composição geral') ||
        t.includes('acabamento geral') ||
        t.includes('degradês e superfícies') ||
        t.includes('superfícies')
      ){
        if(!box.closest('#manualColorsV132')) box.style.display='none';
      }
    });
  }
  new MutationObserver(cleanLegacyAppearanceV1321)
    .observe(document.getElementById('adminContent')||document.body,{childList:true,subtree:true});
  cleanLegacyAppearanceV1321();

  // 3) Feedback universal para ações administrativas.
  // Os saves críticos possuem estado ligado à Promise; este fallback cobre os demais botões.
  const verbs=[
    [/^(salvar|concluir)/i,'Salvando...'],
    [/^(adicionar|criar|\+)/i,'Adicionando...'],
    [/^editar/i,'Abrindo edição...'],
    [/^(excluir|remover)/i,'Excluindo...'],
    [/^(ativar|desativar|pausar|retomar|reabrir|atualizar)/i,'Atualizando...'],
    [/^(enviar|convidar|reenviar)/i,'Enviando...'],
    [/^duplicar/i,'Duplicando...']
  ];
  document.addEventListener('click',ev=>{
    const b=ev.target?.closest?.('button');
    if(!b || !b.closest('#adminView') || b.disabled || b.dataset.pedeviaWorking==='1')return;
    const original=(b.textContent||'').trim();
    const hit=verbs.find(([rx])=>rx.test(original));
    if(!hit)return;
    // Deixa o handler original do botão iniciar primeiro.
    queueMicrotask(()=>{
      if(!b.isConnected || b.disabled || b.dataset.pedeviaWorking==='1')return;
      b.dataset.pedeviaWorking='1';
      b.dataset.pedeviaOriginal=original;
      b.textContent=hit[1];
      b.setAttribute('aria-busy','true');
      // Fallback apenas para ações antigas que não devolvem Promise/estado próprio.
      setTimeout(()=>{
        if(!b.isConnected || b.dataset.pedeviaWorking!=='1')return;
        b.textContent=b.dataset.pedeviaOriginal||original;
        b.removeAttribute('aria-busy');
        delete b.dataset.pedeviaWorking;
      },12000);
    });
  },false);

  // 4) Guarda extra contra múltiplos "Novo produto" vindos de handlers históricos.
  let creatingGuard=false;
  const stableNewProduct=window.newProduct;
  window.newProduct=function(sectionId){
    if(creatingGuard || window._savingProductV132)return;
    creatingGuard=true;
    try{
      const drafts=(cfg.products||[]).filter(p=>p && p._draftNewV132);
      if(drafts.length>1){
        const keep=drafts[0];
        cfg.products=(cfg.products||[]).filter(p=>!p?._draftNewV132 || p===keep);
      }
      const existing=(cfg.products||[]).find(p=>p?._draftNewV132);
      if(existing){
        window._editingProductV132=existing.id;
        return editProduct(existing.id);
      }
      return stableNewProduct(sectionId);
    }finally{
      setTimeout(()=>creatingGuard=false,700);
    }
  };

  // 5) Selecionar foto nunca fecha o editor nem salva antes da hora.
  // Reforça a função final da v1.32.0 caso algum override histórico tente reaparecer.
  const stablePreview=window.previewProductImage;
  window.previewProductImage=function(id,input){
    window._editingProductV132=id;
    return stablePreview(id,input);
  };

  // 6) Após salvar produto, força atualização visual do cardápio e do admin.
  const stableSaveProduct=window.saveProduct;
  window.saveProduct=async function(id){
    if(window._savingProductV132)return;
    const result=await stableSaveProduct(id);
    try{
      renderShop();
      if(typeof updateCart==='function')updateCart();
    }catch(e){ console.warn('Atualização visual pós-save:',e); }
    return result;
  };

  // 7) Regra multi-tenant explícita: esta camada não usa slug/nome específico.
  // Portanto vale para Point, clientes atuais e lojas futuras.
  window.PEDEVIA_PLATFORM_PATCH_V1321={
    appliesToAllStores:true,
    appearanceGroups:9,
    templatesPerGroup:20,
    productDraftGuard:true,
    imagePreviewDoesNotCloseEditor:true,
    globalActionFeedback:true,
    logoPlaceholderNormalized:true
  };

  try{
    if(typeof applyPedeviaVersion==='function')applyPedeviaVersion();
  }catch(e){}
})();
