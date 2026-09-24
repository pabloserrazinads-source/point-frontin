
// ===== v1.31.14: CARREGAMENTO RÁPIDO DOS ESTABELECIMENTOS =====
(function(){

  const TENANT_CACHE_PREFIX_V13114='pedevia:public-store-cache:';

  function tenantCacheKeyV13114(slug){
    return TENANT_CACHE_PREFIX_V13114+String(slug||'').toLowerCase();
  }

  function readTenantCacheV13114(slug){
    try{
      const raw=localStorage.getItem(tenantCacheKeyV13114(slug));
      if(!raw)return null;
      const box=JSON.parse(raw);
      if(!box?.row?.slug)return null;
      return box.row;
    }catch(e){return null}
  }

  function writeTenantCacheV13114(row){
    try{
      if(!row?.slug)return;
      localStorage.setItem(
        tenantCacheKeyV13114(row.slug),
        JSON.stringify({savedAt:Date.now(),row})
      );
    }catch(e){}
  }

  // Toda configuração pública carregada com sucesso passa a alimentar o cache.
  const applyTenantBaseV13114=applyTenantConfigV121;
  applyTenantConfigV121=function(row){
    const r=applyTenantBaseV13114(row);
    writeTenantCacheV13114(row);
    return r;
  };

  // Guarda a inicialização final já existente (inclui suspensão, tenant, etc.).
  const initializeBaseV13114=initializeOnlineStateV13;

  initializeOnlineStateV13=async function(){
    const slug=tenantSlugFromLocationV121();

    // Point/Admin principal mantém exatamente o fluxo normal.
    if(!slug){
      releaseTenantBootV1317?.();
      return initializeBaseV13114();
    }

    // 1) Se este aparelho já abriu a loja alguma vez, desenha IMEDIATAMENTE
    // usando o cache local, sem esperar Supabase.
    const cached=readTenantCacheV13114(slug);
    if(cached){
      try{
        applyTenantConfigV121(cached);
        renderShop();
        updateCart();
        releaseTenantBootV1317?.();
      }catch(e){
        console.warn('Cache público da loja inválido; carregando online.',e);
      }

      // 2) Atualiza silenciosamente em segundo plano.
      try{
        const fresh=await loadTenantRowV121(slug);
        if(fresh){
          applyTenantConfigV121(fresh);
          renderShop();
          updateCart();
          return true;
        }

        const info=await publicServiceInfoV131(slug);
        if(info?.slug){
          showServiceUnavailableV131(info);
          return false;
        }
      }catch(e){
        console.warn('Atualização online da loja falhou; mantendo cache.',e);
      }
      return true;
    }

    // Primeiro acesso neste aparelho: apenas uma consulta online.
    // A v1.31.7 libera a página assim que o estabelecimento for aplicado,
    // sem aguardar o antigo timeout de 10 segundos.
    return initializeBaseV13114();
  };

  // Versão visual.
  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.59');
      }
    });
  },1200);

})();

// IMPORTANTE: esta agora é a ÚNICA inicialização real do site.
// Ela acontece depois que todas as correções/overrides foram carregadas.
initializeOnlineStateV13();
