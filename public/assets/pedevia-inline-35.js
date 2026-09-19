
// ===== v1.32.22: META-AUDITORIA / HARDENING COMERCIAL =====
(function(){
  window.PEDEVIA_VERSION='1.32.52';

  // 1) Migração definitiva do modelo de entrega: somente FIXA ou BAIRROS.
  function normalizeCommercialConfigV13222(){
    if(!window.cfg?.store)return;
    const s=cfg.store, o=s.orderConfig||(s.orderConfig={});
    if(!['fixed','neighborhood'].includes(o.deliveryCalc))o.deliveryCalc='fixed';
    if(o.deliveryCalc==='fixed'){
      o.deliveryFixedFee=Math.max(0,Number(o.deliveryFixedFee??s.deliveryFee??0)||0);
      s.deliveryFee=o.deliveryFixedFee;
    }
    if(!Array.isArray(o.neighborhoods))o.neighborhoods=[];
    if(!Array.isArray(o.deliveryNeighborhoods))o.deliveryNeighborhoods=[];
    // chaves experimentais aposentadas
    ['deliveryZonesKm','deliveryDistanceZones','deliveryAreas','deliveryDistance','distanceRates','allowOutside','maxDeliveryFee']
      .forEach(k=>{try{delete o[k]}catch(_){}});
  }
  window.normalizeCommercialConfigV13222=normalizeCommercialConfigV13222;
  normalizeCommercialConfigV13222();

  // 2) Registro de pedido usa a RPC auditada v1.27 (validação no servidor).
  //    Compatibilidade: só cai para v1261 se a RPC v127 realmente não existir.
  window.createOnlineOrderV125=async function(){
    normalizeCommercialConfigV13222();
    if(!storeAcceptingOrdersV125())throw new Error('O estabelecimento fechou antes da finalização. Tente novamente no próximo horário de funcionamento.');
    const st=window.checkoutState||{};
    const t=typeof checkoutTotalsV111==='function'?checkoutTotalsV111():{sub:sum(),total:sum()};
    const text=typeof buildOrderTextV111==='function'?buildOrderTextV111():'';
    const items=(cart||[]).map(i=>{
      const p=(cfg.products||[]).find(x=>x.id===i.pid);
      return {product_id:i.pid,name:p?.name||'Produto',variant:i.variantName||'',quantity:+i.qty||1,unit_price:+i.unit||0,groups:i.groups||[],note:i.obs||''};
    });
    const args={
      p_store_key:currentStoreKeyV125(),
      p_store_name:currentStoreNameV125(),
      p_customer_name:String(st.customer||document.getElementById('coName')?.value||'').trim(),
      p_customer_phone:String(st.phone||document.getElementById('coPhone')?.value||'').trim(),
      p_order_mode:String(st.mode||''),
      p_address:String(st.address||''),
      p_neighborhood:String(st.neighborhood||''),
      p_table_number:String(st.table||''),
      p_payment_method:String(st.payment||''),
      p_note:String(st.note||document.getElementById('coObs')?.value||'').trim(),
      p_items:items,
      p_subtotal:Number(t.sub||0),
      p_discount:Number((t.promoDiscount||0)+(t.loyaltyDiscount||0)),
      p_delivery_fee:Number(t.delivery||0),
      p_payment_adjustment:Number(t.payAdj||0),
      p_service_fee:Number(t.service||0),
      p_total:Number(t.total||0),
      p_whatsapp_text:text
    };
    let res=await supabaseClient.rpc('register_pedevia_order_v127',args);
    if(res.error && (res.error.code==='PGRST202'||/function.*not found|schema cache/i.test(res.error.message||''))){
      console.warn('RPC v127 ausente; usando compatibilidade v1261.');
      res=await supabaseClient.rpc('register_pedevia_order_v1261',args);
    }
    if(res.error)throw res.error;
    const row=Array.isArray(res.data)?res.data[0]:res.data;
    if(!row)throw new Error('O pedido não retornou confirmação do servidor.');
    return row;
  };

  // 3) Resumo da entrega no Admin passa a refletir o modo real.
  const baseAdminV13222=window.adminOrderSettings;
  window.adminOrderSettings=function(){
    normalizeCommercialConfigV13222();
    baseAdminV13222.apply(this,arguments);
    const o=cfg.store.orderConfig||{};
    const cards=[...document.querySelectorAll('.settingsList .settingCard')];
    const delivery=cards.find(x=>(x.textContent||'').includes('Pedidos para entrega'));
    if(delivery){
      const sub=delivery.querySelector('small');
      if(sub){
        if(o.deliveryCalc==='fixed'){
          const fee=Math.max(0,Number(o.deliveryFixedFee??cfg.store.deliveryFee??0)||0);
          sub.textContent=fee>0?'Taxa fixa: '+brl(fee):'Entrega gratuita';
        }else{
          const n=(o.neighborhoods||[]).filter(x=>x&&x.enabled!==false).length;
          sub.textContent=n+' '+(n===1?'bairro atendido':'bairros atendidos')+' · taxas individuais';
        }
      }
    }
    const other=cards.find(x=>(x.textContent||'').includes('Outras configurações'));
    if(other){
      const si=other.querySelector('.si');
      if(si)si.innerHTML='<span class="otherSettingsIconV13221">⚙</span>';
    }
  };

  // 4) Evita versões antigas reaparecendo no cabeçalho por timers de camadas históricas.
  function enforceVersionV13222(){
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.52');
      }
    });
  }
  [0,500,1300,2500].forEach(ms=>setTimeout(enforceVersionV13222,ms));

  // 5) Diagnóstico local não destrutivo para suporte comercial.
  window.pedeviaPreflightV13222=function(){
    const issues=[];
    try{
      if(!window.supabaseClient)issues.push('Supabase client não inicializado');
      if(!window.cfg?.store)issues.push('Configuração da loja ausente');
      if(!Array.isArray(cfg?.products))issues.push('Catálogo inválido');
      if(!['fixed','neighborhood'].includes(cfg?.store?.orderConfig?.deliveryCalc))issues.push('Modo de entrega inválido');
      if(typeof saveTenantConfigV122!=='function')issues.push('Persistência de tenant indisponível');
      if(typeof saveSiteConfigOnline!=='function')issues.push('Persistência do Point indisponível');
      if(typeof fetchOrdersV125!=='function')issues.push('Leitura de pedidos indisponível');
      if(typeof createOnlineOrderV125!=='function')issues.push('Registro de pedidos indisponível');
    }catch(e){issues.push(String(e?.message||e))}
    const result={ok:issues.length===0,version:'1.32.30',issues};
    console.info('Pedevia preflight',result);
    return result;
  };
  setTimeout(()=>window.pedeviaPreflightV13222(),1800);
})();
