// ===== v1.32.54: FIDELIDADE SOMENTE APÓS CONCLUSÃO =====
(function(){
  const CURRENT_VERSION='1.32.54';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  // O checkout continua salvando o perfil e o pedido operacional, mas não
  // contabiliza fidelidade. A contagem passa a ser responsabilidade exclusiva
  // da transição administrativa para "completed".
  window.registerLoyaltyOrderV113=async function(){ return null; };
  window.registerOrderAndCustomerV115=async function(){
    const st=window.checkoutState||{};
    const phone=typeof normalizePhoneV127==='function'
      ?normalizePhoneV127(st.phone)
      :String(st.phone||'').replace(/\D/g,'');
    if(phone.length<10)return null;
    if(typeof cacheCustomerPhoneV115==='function')cacheCustomerPhoneV115(phone);
    if(typeof upsertCustomerProfileV115==='function'){
      return await upsertCustomerProfileV115({
        phone,
        name:String(st.customer||'').trim(),
        neighborhood:String(st.neighborhood||''),
        address:String(st.address||''),
        reference:String(st.reference||'')
      });
    }
    return null;
  };

  async function orderByIdV13253(id){
    const cached=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));
    if(cached)return cached;
    const {data,error}=await supabaseClient.from('pedevia_orders')
      .select('*').eq('id',id).eq('store_key',currentStoreKeyV127()).maybeSingle();
    if(error)throw error;
    return data||null;
  }

  async function countCompletedOrderV13253(order){
    if(!order||order.status!=='completed')return null;
    const phone=typeof normalizePhoneV127==='function'
      ?normalizePhoneV127(order.customer_phone)
      :String(order.customer_phone||'').replace(/\D/g,'');
    if(phone.length<10)return null;
    const clientOrderId=String(order.id||'').trim();
    if(!clientOrderId)return null;
    const {data,error}=await supabaseClient.rpc('register_pedevia_customer_order_v127',{
      p_store_key:String(order.store_key||currentStoreKeyV127()),
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
  window.countCompletedOrderV13253=countCompletedOrderV13253;

  async function countByIdV13253(id){
    try{
      return await countCompletedOrderV13253(await orderByIdV13253(id));
    }catch(e){
      console.error('Fidelidade após conclusão:',e);
      alert('O pedido foi concluído, mas a fidelidade não pôde ser atualizada. Salve-o como Concluído novamente para tentar de novo.');
      return null;
    }
  }

  if(window.PedeviaV130?.setStatus){
    const base=PedeviaV130.setStatus.bind(PedeviaV130);
    PedeviaV130.setStatus=async function(id,status){
      const result=await base(...arguments);
      if(status==='completed')await countByIdV13253(id);
      return result;
    };
  }

  if(typeof updateOrderStatusV126==='function'){
    const base=updateOrderStatusV126;
    updateOrderStatusV126=async function(id){
      const target=document.getElementById('orderStatusV125')?.value||'new';
      const result=await base.apply(this,arguments);
      if(target==='completed')await countByIdV13253(id);
      return result;
    };
    updateOrderStatusV125=updateOrderStatusV126;
  }

  if(typeof finishTodayOrdersV126==='function'){
    const base=finishTodayOrdersV126;
    finishTodayOrdersV126=async function(){
      let candidateIds=[];
      try{
        const start=new Date();start.setHours(0,0,0,0);
        const end=new Date(start);end.setDate(end.getDate()+1);
        const {data}=await supabaseClient.from('pedevia_orders').select('id')
          .eq('store_key',currentStoreKeyV127())
          .in('status',['new','accepted','preparing','ready'])
          .gte('created_at',start.toISOString()).lt('created_at',end.toISOString());
        candidateIds=(data||[]).map(x=>x.id).filter(Boolean);
      }catch(_e){}
      const result=await base.apply(this,arguments);
      if(!candidateIds.length)return result;
      try{
        const {data,error}=await supabaseClient.from('pedevia_orders').select('*')
          .eq('store_key',currentStoreKeyV127()).eq('status','completed')
          .in('id',candidateIds);
        if(error)throw error;
        for(const order of (data||[]))await countCompletedOrderV13253(order);
      }catch(e){
        console.error('Fidelidade no encerramento em lote:',e);
        alert('Os pedidos foram concluídos, mas alguma fidelidade não pôde ser atualizada. Conclua novamente o pedido afetado para tentar de novo.');
      }
      return result;
    };
  }

  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
