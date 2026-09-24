// ===== Pedevia v1.32.57: FIDELIDADE SOMENTE APÓS CONCLUSÃO =====
(function(){
  const digits=v=>String(v||'').replace(/\D/g,'');

  async function currentLoyaltyProfileV13253(phone){
    try{return await getCustomerProfileV115(phone)}catch(_e){return null}
  }

  // No checkout salvamos apenas os dados do cliente. O pedido ainda não vale
  // ponto: ele precisa ser concluído pelo estabelecimento.
  registerOrderAndCustomerV115=async function(){
    const st=window.checkoutState||{};
    const phone=digits(st.phone);
    if(phone.length<10)throw new Error('Telefone inválido');
    cacheCustomerPhoneV115(phone);
    await upsertCustomerProfileV115({
      phone,
      name:String(st.customer||'').trim(),
      neighborhood:String(st.neighborhood||''),
      address:String(st.address||''),
      reference:String(st.reference||'')
    });
    const profile=await currentLoyaltyProfileV13253(phone);
    if(profile)updateLoyaltyDisplaysV115(profile);
    return profile||{phone,name:String(st.customer||'').trim(),order_count:0};
  };

  async function creditCompletedOrderV13253(order){
    if(!order||order.status!=='completed')return null;
    const phone=digits(order.customer_phone);
    if(phone.length<10)return null;
    const key=String(order.store_key||currentStoreKeyV127());
    const clientOrderId=String(order.id||'');
    if(!clientOrderId)return null;
    const {data,error}=await supabaseClient.rpc('register_pedevia_customer_order_v127',{
      p_store_key:key,
      p_client_order_id:clientOrderId,
      p_phone:phone,
      p_name:String(order.customer_name||'').trim(),
      p_neighborhood:String(order.neighborhood||''),
      p_address:String(order.address||''),
      p_reference:String(order.reference||''),
      p_total:Number(order.total||0),
      p_order_text:String(order.whatsapp_text||'')
    });
    if(error)throw error;
    return Array.isArray(data)?data[0]||null:data;
  }
  window.creditCompletedOrderV13253=creditCompletedOrderV13253;

  async function fetchCompletedOrderV13253(id){
    const key=currentStoreKeyV127();
    const {data,error}=await supabaseClient.from('pedevia_orders')
      .select('*').eq('id',id).eq('store_key',key).eq('status','completed').maybeSingle();
    if(error)throw error;
    return data||null;
  }

  // Tela detalhada/histórico.
  if(typeof updateOrderStatusV126==='function'){
    const baseUpdate=updateOrderStatusV126;
    updateOrderStatusV126=async function(id){
      const wanted=document.getElementById('orderStatusV125')?.value||'new';
      const result=await baseUpdate.apply(this,arguments);
      if(wanted==='completed'){
        try{
          const order=await fetchCompletedOrderV13253(id);
          if(order)await creditCompletedOrderV13253(order);
        }catch(e){
          console.error('Pedido concluído, mas a fidelidade não pôde ser atualizada:',e);
          alert('O pedido foi concluído, mas a fidelidade não foi atualizada. Abra o pedido e salve como Concluído novamente.');
        }
      }
      return result;
    };
    updateOrderStatusV125=updateOrderStatusV126;
  }

  // Quadro operacional moderno.
  if(window.PedeviaV130&&typeof PedeviaV130.setStatus==='function'){
    const baseSetStatus=PedeviaV130.setStatus;
    PedeviaV130.setStatus=async function(id,status,sendMessage){
      const result=await baseSetStatus.apply(this,arguments);
      if(status==='completed'){
        try{
          const order=await fetchCompletedOrderV13253(id);
          if(order)await creditCompletedOrderV13253(order);
        }catch(e){
          console.error('Pedido concluído, mas a fidelidade não pôde ser atualizada:',e);
          alert('O pedido foi concluído, mas a fidelidade não foi atualizada. Tente concluir o pedido novamente.');
        }
      }
      return result;
    };
  }

  // Encerramento em lote dos pedidos do dia.
  if(typeof finishTodayOrdersV126==='function'){
    const baseFinishToday=finishTodayOrdersV126;
    finishTodayOrdersV126=async function(){
      const key=currentStoreKeyV127();
      const before=await fetchStoreOrdersV126(1000).catch(()=>[]);
      const candidates=before.filter(o=>['new','accepted','preparing','ready'].includes(o.status));
      const result=await baseFinishToday.apply(this,arguments);
      for(const candidate of candidates){
        try{
          const order=await fetchCompletedOrderV13253(candidate.id);
          if(order)await creditCompletedOrderV13253(order);
        }catch(e){console.error('Falha ao creditar fidelidade do pedido '+candidate.id,e)}
      }
      return result;
    };
  }

  window.PEDEVIA_VERSION='1.32.57';
  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.57');
    });
  },0);
})();
