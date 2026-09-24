
// ===== v1.32.59: LOJA EXCLUÍDA NÃO PODE SOBREVIVER PELO CACHE =====
(function(){
  const CURRENT_VERSION='1.32.59';
  window.PEDEVIA_VERSION=CURRENT_VERSION;
  const CACHE_PREFIX='pedevia:public-store-cache:';

  function cacheKey(slug){return CACHE_PREFIX+String(slug||'').toLowerCase()}
  function purgeDeletedTenant(slug){
    try{localStorage.removeItem(cacheKey(slug))}catch(_e){}
    // Evita que a configuração já aplicada continue sendo tratada como tenant válido.
    if(window.pedeviaTenantV121 && String(window.pedeviaTenantV121.slug||'').toLowerCase()===String(slug||'').toLowerCase()){
      window.pedeviaTenantV121=null;
    }
  }

  // Substitui a última inicialização: mantém o cache para velocidade, mas a
  // revalidação online agora distingue corretamente "falha de rede" de
  // "estabelecimento não existe mais". Antes, ausência de row/status caía em
  // `return true` e deixava a cópia local funcionando indefinidamente.
  initializeOnlineStateV13=async function(){
    const slug=typeof tenantSlugFromLocationV121==='function'?tenantSlugFromLocationV121():'';
    if(!slug){
      // Point continua no fluxo original/base já consolidado.
      if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      try{
        // Point não depende de tenant cache. Mantém o carregamento online legado.
        if(typeof loadOnline==='function')await loadOnline();
      }catch(_e){}
      try{renderShop();updateCart()}catch(_e){}
      return true;
    }

    let cached=null;
    try{
      const raw=localStorage.getItem(cacheKey(slug));
      const box=raw?JSON.parse(raw):null;
      if(box?.row?.slug)cached=box.row;
    }catch(_e){}

    if(cached){
      try{
        applyTenantConfigV121(cached);renderShop();updateCart();
        if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      }catch(_e){}
    }

    try{
      const fresh=await loadTenantRowV121(slug);
      if(fresh){
        applyTenantConfigV121(fresh);renderShop();updateCart();
        if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
        return true;
      }

      const info=typeof publicServiceInfoV131==='function'?await publicServiceInfoV131(slug):null;
      if(info?.slug){
        // Suspensa/cancelada/rascunho: existe, mas o acesso público é bloqueado.
        try{localStorage.removeItem(cacheKey(slug))}catch(_e){}
        showServiceUnavailableV131(info);
        if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
        return false;
      }

      // As duas consultas responderam normalmente e nenhuma conhece o slug:
      // a loja foi excluída (ou nunca existiu). Cache local deve morrer agora.
      purgeDeletedTenant(slug);
      showTenantNotFoundV121(slug);
      if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      return false;
    }catch(err){
      // Só preserva cache em falha real de conectividade/consulta.
      console.warn('Não foi possível revalidar o estabelecimento agora.',err);
      if(cached)return true;
      showTenantNotFoundV121(slug);
      if(typeof releaseTenantBootV1317==='function')releaseTenantBootV1317();
      return false;
    }
  };

  // Revalida novamente quando a página volta do background/bfcache, evitando
  // que uma aba antiga permaneça aberta depois de a loja ser excluída no mestre.
  let lastRevalidate=0;
  async function revalidateOnReturn(){
    const slug=typeof tenantSlugFromLocationV121==='function'?tenantSlugFromLocationV121():'';
    if(!slug || document.hidden)return;
    const now=Date.now(); if(now-lastRevalidate<1500)return; lastRevalidate=now;
    try{await initializeOnlineStateV13()}catch(_e){}
  }
  document.addEventListener('visibilitychange',revalidateOnReturn);
  window.addEventListener('pageshow',e=>{if(e.persisted)revalidateOnReturn()});

  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
