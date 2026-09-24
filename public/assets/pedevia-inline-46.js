
(function(){
  const CURRENT_VERSION='1.32.55';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  function money2V13239(v){
    const n=Number(v||0);
    return Number.isFinite(n)?Math.round((n+Number.EPSILON)*100)/100:0;
  }
  function rpcErrorTextV13239(e){
    const code=String(e?.code||'').trim();
    const msg=String(e?.message||e||'Erro desconhecido').trim();
    const details=String(e?.details||'').trim();
    const hint=String(e?.hint||'').trim();
    return [code&&`[${code}]`,msg,details,hint].filter(Boolean).join(' · ');
  }

  // Mantém a RPC segura v127, mas normaliza todos os valores monetários para
  // centavos antes da validação aritmética do servidor.
  window.createOnlineOrderV125=async function(){
    if(!storeAcceptingOrdersV125())
      throw new Error('O estabelecimento fechou antes da finalização.');

    const st=window.checkoutState||{};
    const t=checkoutTotalsV111();
    const text=buildOrderTextV111();
    const items=(cart||[]).map(i=>{
      const p=(cfg.products||[]).find(x=>x.id===i.pid);
      return {
        product_id:i.pid,
        name:p?.name||'Produto',
        variant:i.variantName||'',
        quantity:Math.max(1,Number(i.qty||1)||1),
        unit_price:money2V13239(i.unit),
        groups:i.groups||[],
        note:i.obs||''
      };
    });

    const args={
      p_store_key:String(currentStoreKeyV125()||'').trim(),
      p_store_name:String(currentStoreNameV125()||'').trim(),
      p_customer_name:String(st.customer||document.getElementById('coName')?.value||'').trim(),
      p_customer_phone:String(st.phone||document.getElementById('coPhone')?.value||'').trim(),
      p_order_mode:String(st.mode||'').trim(),
      p_address:String(st.address||''),
      p_neighborhood:String(st.neighborhood||''),
      p_table_number:String(st.table||''),
      p_payment_method:String(st.payment||'').trim(),
      p_note:String(st.note||document.getElementById('coObs')?.value||'').trim(),
      p_items:items,
      p_subtotal:money2V13239(t.sub),
      p_discount:money2V13239((t.promoDiscount||0)+(t.loyaltyDiscount||0)),
      p_delivery_fee:money2V13239(t.delivery),
      p_payment_adjustment:money2V13239(t.payAdj),
      p_service_fee:money2V13239(t.service),
      p_total:money2V13239(t.total),
      p_whatsapp_text:text
    };

    console.info('Pedevia pedido v1.32.55',{
      store_key:args.p_store_key,
      mode:args.p_order_mode,
      payment:args.p_payment_method,
      items:items.length,
      subtotal:args.p_subtotal,
      discount:args.p_discount,
      delivery:args.p_delivery_fee,
      adjustment:args.p_payment_adjustment,
      service:args.p_service_fee,
      total:args.p_total
    });

    console.info('DIAGNÓSTICO PEDEVIA — payload do pedido',{
      store_key:args.p_store_key,store_name:args.p_store_name,
      customer_phone_digits:String(args.p_customer_phone||'').replace(/\D/g,'').length,
      order_mode:args.p_order_mode,payment_method:args.p_payment_method,
      item_count:Array.isArray(args.p_items)?args.p_items.length:0,
      subtotal:args.p_subtotal,discount:args.p_discount,delivery_fee:args.p_delivery_fee,
      payment_adjustment:args.p_payment_adjustment,service_fee:args.p_service_fee,total:args.p_total
    });
    let res=await supabaseClient.rpc('register_pedevia_order_v127',args);
    if(res.error && (res.error.code==='PGRST202'||/function.*not found|schema cache/i.test(res.error.message||''))){
      console.warn('RPC v127 ausente; usando compatibilidade v1261.');
      res=await supabaseClient.rpc('register_pedevia_order_v1261',args);
    }
    if(res.error){
      const technical=rpcErrorTextV13239(res.error);
      console.error('Pedevia RPC pedido falhou:',technical,res.error);
      const err=new Error(technical);
      err.code=res.error.code;
      err.pedeviaRpc=true;
      throw err;
    }
    const row=Array.isArray(res.data)?res.data[0]:res.data;
    if(!row)throw new Error('O servidor respondeu sem confirmar o pedido.');
    return row;
  };

  // O alerta anterior escondia a causa. Mantemos mensagem amigável, mas mostramos
  // um código/descrição curta para suporte sem expor chaves ou credenciais.
  const finishBaseV13239=finishWhatsApp;
  // Não substituímos a cadeia de checkout: interceptamos apenas erros RPC que
  // escapem em chamadas diretas de diagnóstico.
  window.pedeviaOrderDiagnosticV13239=function(){
    const st=window.checkoutState||{};
    const t=typeof checkoutTotalsV111==='function'?checkoutTotalsV111():{};
    const report={
      version:CURRENT_VERSION,
      storeKey:typeof currentStoreKeyV125==='function'?currentStoreKeyV125():null,
      storeName:typeof currentStoreNameV125==='function'?currentStoreNameV125():null,
      accepting:typeof storeAcceptingOrdersV125==='function'?storeAcceptingOrdersV125():null,
      mode:st.mode||null,payment:st.payment||null,
      customer:!!String(st.customer||document.getElementById('coName')?.value||'').trim(),
      phoneDigits:String(st.phone||document.getElementById('coPhone')?.value||'').replace(/\D/g,'').length,
      cartItems:Array.isArray(cart)?cart.length:null,
      totals:t
    };
    console.info('Pedevia diagnóstico pedido',report);
    return report;
  };

  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
