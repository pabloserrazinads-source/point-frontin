
// ===== v1.31.13: LEITURA SEGURA DOS PEDIDOS PELO SERVIDOR =====
(function(){

  async function fetchOrdersAdminRpcV13113(limit=1000, offset=0){
    const key=currentStoreKeyV125();
    const {data,error}=await supabaseClient.rpc('get_pedevia_orders_admin_v13113',{
      p_store_key:key,
      p_limit:Math.max(1,Math.min(1000,Number(limit)||1000)),
      p_offset:Math.max(0,Number(offset)||0)
    });
    if(error)throw error;
    return Array.isArray(data)?data:[];
  }

  // Todas as telas que consultam pedidos passam pela mesma função segura.
  fetchOrdersV125=async function(){
    return await fetchOrdersAdminRpcV13113(200,0);
  };

  fetchStoreOrdersV126=async function(limit=1000){
    return await fetchOrdersAdminRpcV13113(limit,0);
  };

  fetchAllStoreOrdersV126=async function(){
    const all=[],page=1000,maxPages=20;
    for(let p=0;p<maxPages;p++){
      const rows=await fetchOrdersAdminRpcV13113(page,p*page);
      all.push(...rows);
      if(rows.length<page)break;
    }
    return all;
  };

  // Se a sessão expirar ou a leitura falhar, não mostra falsamente "0 pedidos".
  const loadOrdersBaseV13113=loadOrdersPanelV126;
  loadOrdersPanelV126=async function(){
    try{
      return await loadOrdersBaseV13113.apply(this,arguments);
    }catch(e){
      console.error('Falha ao carregar pedidos:',e);
      const host=document.getElementById('adminContent');
      if(host){
        host.innerHTML=`
          <div class="panel">
            <h3>Não foi possível carregar os pedidos</h3>
            <p class="hint">Os pedidos continuam salvos. A sessão pode ter expirado ou houve uma falha de conexão.</p>
            <button class="btn full" data-pedevia-event="click" data-pedevia-call="loadOrdersPanelV126">Tentar novamente</button>
          </div>`;
      }
      throw e;
    }
  };

  // Regra explícita: loja fechada bloqueia SOMENTE novos pedidos.
  // Pedidos já registrados continuam ativos até conclusão/cancelamento.
  window.pedeviaOrderPolicyV13113 = {
    closingDoesNotArchiveOrDeleteOrders:true
  };

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.50');
      }
    });
  },1200);

})();
