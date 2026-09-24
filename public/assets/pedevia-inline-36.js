
// ===== v1.32.23: FINAL DE PUBLICAÇÃO =====
(function(){
  window.PEDEVIA_VERSION='1.32.59';

  // Mantém fechamento automático completamente separado dos pedidos existentes.
  // Esta função SOMENTE informa se novos pedidos podem entrar.
  window.pedeviaStoreCanReceiveNewOrdersV13223=function(){
    try{return !!storeAcceptingOrdersV125()}catch(_){return false}
  };

  // A ação manual agora consulta primeiro os pedidos realmente afetados, informa
  // a quantidade e atualiza somente os IDs encontrados para a loja atual.
  window.finishTodayOrdersV126=async function(){
    const key=currentStoreKeyV125();
    const now=new Date();
    const start=new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0);
    const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0,0);
    try{
      const {data,error}=await supabaseClient.from('pedevia_orders')
        .select('id,status,created_at')
        .eq('store_key',key)
        .in('status',['new','accepted','preparing','ready'])
        .gte('created_at',start.toISOString())
        .lt('created_at',end.toISOString());
      if(error)throw error;
      const rows=Array.isArray(data)?data:[];
      if(!rows.length){alert('Não há pedidos ativos de hoje para encerrar.');return;}
      if(!confirm(`Encerrar ${rows.length} pedido${rows.length===1?'':'s'} ativo${rows.length===1?'':'s'} de hoje?\n\nEles serão marcados como Concluídos e continuarão no Histórico e nas Estatísticas.`))return;
      const ids=rows.map(x=>x.id).filter(Boolean);
      const iso=new Date().toISOString();
      const res=await supabaseClient.from('pedevia_orders')
        .update({status:'completed',completed_at:iso,updated_at:iso})
        .eq('store_key',key)
        .in('id',ids)
        .in('status',['new','accepted','preparing','ready']);
      if(res.error)throw res.error;
      await loadOrdersPanelV126();
    }catch(e){
      console.error('Encerrar pedidos de hoje:',e);
      alert('Não foi possível encerrar os pedidos: '+(e?.message||e));
    }
  };

  // Sanitização final, sem apagar bairros válidos.
  function finalNormalizeV13223(){
    if(!window.cfg?.store)return;
    const s=cfg.store,o=s.orderConfig||(s.orderConfig={});
    if(!['fixed','neighborhood'].includes(o.deliveryCalc)){
      o.deliveryCalc=(Array.isArray(o.neighborhoods)&&o.neighborhoods.length)?'neighborhood':'fixed';
    }
    if(!Array.isArray(o.neighborhoods))o.neighborhoods=[];
    if(!Array.isArray(o.deliveryNeighborhoods))o.deliveryNeighborhoods=[];
    ['deliveryZonesKm','deliveryDistanceZones','deliveryAreas','deliveryDistance','distanceRates','allowOutside','maxDeliveryFee']
      .forEach(k=>{try{delete o[k]}catch(_){}});
  }
  finalNormalizeV13223();

  // Centraliza a versão visível após timers de camadas antigas.
  function finalVersionV13223(){
    window.PEDEVIA_VERSION='1.32.59';
    document.querySelectorAll('.adminHead .hint,.hero .hint,.panel .hint').forEach(el=>{
      const t=el.textContent||'';
      if(/Versão\s+1\.\d+(?:\.\d+)*/i.test(t))el.textContent=t.replace(/Versão\s+1\.\d+(?:\.\d+)*/i,'Versão 1.32.59');
    });
  }
  [0,600,1400,2800,5000].forEach(ms=>setTimeout(finalVersionV13223,ms));

  // Preflight final para suporte. Não grava nem altera pedidos.
  window.pedeviaPreflightFinal=function(){
    const issues=[];
    try{
      if(!window.supabaseClient)issues.push('Supabase não inicializado');
      if(!window.cfg?.store)issues.push('Loja sem configuração');
      if(!Array.isArray(window.cfg?.products))issues.push('Catálogo inválido');
      const dc=window.cfg?.store?.orderConfig?.deliveryCalc;
      if(!['fixed','neighborhood'].includes(dc))issues.push('Modo de entrega inválido');
      ['createOnlineOrderV125','fetchOrdersV125','saveTenantConfigV122','saveSiteConfigOnline','persistAdminStateV15']
        .forEach(n=>{if(typeof window[n]!=='function' && typeof globalThis[n]!=='function')issues.push('Função ausente: '+n)});
    }catch(e){issues.push(String(e?.message||e))}
    const result={ok:issues.length===0,version:'1.32.30',issues};
    console.info('Pedevia preflight final',result);
    return result;
  };
})();
