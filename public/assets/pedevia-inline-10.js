
// ===== v1.31.3: WHATSAPP EM FORMATO DE COMANDA =====
(function(){
  function cleanDeliveryAddressV1313(address,reference){
    let a=String(address||'').trim();
    const r=String(reference||'').trim();
    if(r){
      const suffix=' · '+r;
      if(a.endsWith(suffix))a=a.slice(0,-suffix.length).trim();
    }
    return a;
  }

  function optionLineV1313(x){
    const q=Math.max(1,Number(x?.qty||1));
    const price=Math.max(0,Number(x?.price||0));
    return `   ↳ ${q}x ${String(x?.name||'Complemento')}${price?` (+${brl(price*q)})`:''}`;
  }

  buildOrderTextV111=function(){
    normalizeOrderExtrasV111();
    const st=window.checkoutState||{};
    const o=cfg.store.orderConfig||{};
    const t=checkoutTotalsV111();
    const storeName=String(cfg.store.name||'Estabelecimento').trim();
    const L=[`🛍️ *Novo pedido via ${storeName}:*`,''];

    cart.forEach(i=>{
      const p=cfg.products.find(x=>x.id===i.pid)||{};
      let base=Number(p.price||0);

      if(i.variantId && Array.isArray(p.variants)){
        const v=p.variants.find(x=>x.id===i.variantId);
        if(v)base=Number(v.price||0);
      }

      const qty=Math.max(1,Number(i.qty||1));
      const productName=`${p.name||'Produto'}${i.variantName?' · '+i.variantName:''}`;
      L.push(`*${qty}x ${productName} (${brl(base*qty)})*`);

      (i.groups||[]).forEach(g=>{
        (g.items||[]).forEach(x=>L.push(optionLineV1313(x)));
      });

      if(i.obs)L.push(`   ↳ Obs.: ${i.obs}`);
      L.push('');
    });

    L.push('*Valor*');
    L.push('Produtos: '+brl(t.sub));
    if(t.promoDiscount)L.push(`${t.promoOffer?.title||'Oferta'}: - ${brl(t.promoDiscount)}`);
    if(t.loyaltyDiscount)L.push(`Fidelidade (${t.loyaltyPercent}%): - ${brl(t.loyaltyDiscount)}`);
    if(t.delivery)L.push('Taxa de entrega: '+brl(t.delivery));
    if(t.payAdj)L.push((t.payAdj>0?'Taxa':'Desconto')+' de pagamento: '+brl(Math.abs(t.payAdj)));
    if(t.service)L.push((o.serviceFeeLabel||'Taxa de serviço')+': '+brl(t.service));
    L.push('*Total: '+brl(t.total)+'*','');

    L.push('*Forma de pagamento*');
    L.push(paymentKeyLabel(st.payment),'');

    if(st.mode==='delivery'){
      const addr=cleanDeliveryAddressV1313(st.address,st.reference);
      L.push('*Entrega*');
      if(st.neighborhood)L.push(st.neighborhood);
      if(addr)L.push(addr);
      if(st.reference)L.push(st.reference);
      L.push('');
    }else if(st.mode==='pickup'){
      L.push('*Retirada*');
      if(cfg.store.address)L.push(cfg.store.address);
      L.push('');
    }else{
      L.push('*Consumo no local*');
      if(st.table)L.push('Mesa: '+st.table);
      L.push('');
    }

    if(st.note){
      L.push('*Observações*',st.note,'');
    }

    if(st.payment==='pix' && o.pixKey){
      L.push('*Pix para pagamento*',o.pixKey);
      if(o.pixHolder)L.push(o.pixHolder);
      L.push('');
    }

    L.push('*Cliente*');
    L.push(`${st.customer||'-'}${st.phone?' - '+st.phone:''}`);

    return L.filter(x=>x!==null&&x!==undefined).join('\n');
  };

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.49');
      }
    });
  },1200);
})();
