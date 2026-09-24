
(function(){
  const CURRENT_VERSION='1.32.59';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  function tenantSlugV13233(){
    try{return typeof tenantSlugFromLocationV121==='function'?String(tenantSlugFromLocationV121()||'').trim().toLowerCase():''}catch(_e){return ''}
  }
  function setPlatformHeaderV13233(){
    const brand=document.getElementById('headerBrandName');
    if(brand)brand.innerHTML='PEDEVIA<small>Cardápio online</small>';
    const mark=document.getElementById('headerLogoMark');
    if(mark){
      mark.innerHTML='<span aria-hidden="true" style="font-size:25px;line-height:1;font-weight:900">P</span>';
      mark.setAttribute('aria-label','Pedevia');
      mark.style.display='grid';mark.style.placeItems='center';
    }
    try{document.title='Pedevia · Cardápio online'}catch(_e){}
  }
  window.setPlatformHeaderV13233=setPlatformHeaderV13233;

  // Fonte única para o cabeçalho. Em URL de tenant sem tenant válido carregado,
  // NUNCA cai no fallback histórico do Point.
  const brandBaseV13233=applyBrandHeaderV116;
  applyBrandHeaderV116=function(){
    const slug=tenantSlugV13233();
    if(slug && !window.pedeviaTenantV121){
      setPlatformHeaderV13233();
      return;
    }
    return brandBaseV13233.apply(this,arguments);
  };

  // Not-found passa a declarar o estado antes de qualquer renderização posterior.
  const notFoundBaseV13233=showTenantNotFoundV121;
  showTenantNotFoundV121=function(slug){
    window.pedeviaPublicUnavailableV13233=true;
    window.pedeviaTenantV121=null;
    setPlatformHeaderV13233();
    const r=notFoundBaseV13233.apply(this,arguments);
    setPlatformHeaderV13233();
    return r;
  };

  // Inicialização final e autoritativa. Não chama as cadeias antigas para tenant,
  // eliminando alternância Pedevia <-> Point causada por fallbacks históricos.
  initializeOnlineStateV13=async function(){
    const slug=tenantSlugV13233();
    if(!slug){
      window.pedeviaPublicUnavailableV13233=false;
      try{if(typeof loadOnline==='function')await loadOnline()}catch(_e){}
      try{renderShop();updateCart()}catch(_e){}
      try{applyBrandHeaderV116()}catch(_e){}
      if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      return true;
    }

    // Enquanto o tenant ainda não foi validado, shell neutro Pedevia.
    if(!window.pedeviaTenantV121)setPlatformHeaderV13233();

    try{
      const fresh=await loadTenantRowV121(slug);
      if(fresh){
        window.pedeviaPublicUnavailableV13233=false;
        applyTenantConfigV121(fresh);
        renderShop();updateCart();
        applyBrandHeaderV116();
        if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
        return true;
      }

      // Confirma se a loja existe porém está bloqueada comercialmente.
      let info=null;
      try{
        const res=await supabaseClient.rpc('get_public_client_site_status',{p_slug:slug});
        if(!res?.error)info=Array.isArray(res.data)?res.data[0]:res.data;
      }catch(_e){}

      window.pedeviaPublicUnavailableV13233=true;
      window.pedeviaTenantV121=null;
      try{localStorage.removeItem('pedevia:public-store-cache:'+slug)}catch(_e){}
      setPlatformHeaderV13233();

      if(info?.slug){
        const status=String(info.service_status||'').toLowerCase();
        const name=info.name||'Este estabelecimento';
        const title=status==='draft'?'Cardápio em preparação':'Cardápio temporariamente indisponível';
        const text=status==='draft'
          ?'Este estabelecimento ainda está preparando o cardápio na Pedevia.'
          :'Este estabelecimento está temporariamente indisponível na Pedevia.';
        const shop=document.getElementById('shopView');
        if(shop){
          const panel=document.createElement('div');panel.className='panel';Object.assign(panel.style,{maxWidth:'620px',margin:'55px auto',textAlign:'center',padding:'28px'});
          const icon=document.createElement('div');icon.style.fontSize='52px';icon.textContent='🏪';
          const heading=document.createElement('h2');heading.textContent=title;
          const store=document.createElement('p'),strong=document.createElement('b');strong.textContent=name;store.append(strong);
          const message=document.createElement('p');message.className='hint';message.textContent=text;
          panel.append(icon,heading,store,message);shop.replaceChildren(panel);
        }
        document.getElementById('cartBar')?.classList.add('hide');
      }else{
        showTenantNotFoundV121(slug);
      }
      setPlatformHeaderV13233();
      if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      return false;
    }catch(err){
      console.warn('Não foi possível validar o estabelecimento.',err);
      // Em falha de rede, cache válido pode ser usado; sem cache, mantém shell Pedevia.
      let cached=null;
      try{
        const box=JSON.parse(localStorage.getItem('pedevia:public-store-cache:'+slug)||'null');
        if(box?.row?.slug)cached=box.row;
      }catch(_e){}
      if(cached){
        window.pedeviaPublicUnavailableV13233=false;
        applyTenantConfigV121(cached);renderShop();updateCart();applyBrandHeaderV116();
        if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
        return true;
      }
      window.pedeviaPublicUnavailableV13233=true;
      window.pedeviaTenantV121=null;
      setPlatformHeaderV13233();
      showTenantNotFoundV121(slug);
      if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      return false;
    }
  };

  // Qualquer escritor histórico que tente reaplicar marca após a tela ser bloqueada
  // passa pela função única acima; não há MutationObserver brigando pela DOM.
  if(tenantSlugV13233() && !window.pedeviaTenantV121)setPlatformHeaderV13233();
  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
