// ===== Pedevia v1.33.5: COMANDA ORGANIZADA, NUMERADA E OBSERVAÇÃO EM DESTAQUE =====
(function(){
  'use strict';

  const itemEmojiV1334=n=>['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][n]||`*${n}.*`;
  const modeLabelV1334=mode=>mode==='delivery'?'Entrega':mode==='pickup'?'Retirada':'Consumo no local';
  const cleanV1334=v=>String(v??'').trim();

  function optionLinesV1334(groups){
    const lines=[];
    (groups||[]).forEach(g=>(g.items||[]).forEach(x=>{
      const item=typeof x==='string'?{name:x}:x||{};
      const qty=Math.max(1,Number(item.qty||1));
      const price=Math.max(0,Number(item.price||0));
      lines.push(`   ↳ ${qty}x ${cleanV1334(item.name)||'Complemento'}${price?` (+${brl(price*qty)})`:''}`);
    }));
    return lines;
  }

  function cartProductLinesV1334(){
    const lines=[];
    (cart||[]).forEach((item,index)=>{
      const product=(cfg.products||[]).find(x=>String(x.id)===String(item.pid))||{};
      let base=Number(product.price||0);
      if(item.variantId&&Array.isArray(product.variants)){
        const variant=product.variants.find(x=>String(x.id)===String(item.variantId));
        if(variant)base=Number(variant.price||0);
      }
      const qty=Math.max(1,Number(item.qty||1));
      const name=`${product.name||'Produto'}${item.variantName?' · '+item.variantName:''}`;
      lines.push(`${itemEmojiV1334(index+1)} *${qty}x ${name} (${brl(base*qty)})*`);
      lines.push(...optionLinesV1334(item.groups));
      if(item.obs)lines.push(`   ↳ Obs.: ${cleanV1334(item.obs)}`);
      lines.push('');
    });
    return lines;
  }

  window.buildOrderTextV111=function(){
    if(typeof normalizeOrderExtrasV111==='function')normalizeOrderExtrasV111();
    const st=window.checkoutState||{},o=cfg.store.orderConfig||{},t=checkoutTotalsV111();
    const lines=[`🛍️ *NOVO PEDIDO VIA ${cleanV1334(cfg.store.name||'Estabelecimento').toUpperCase()}*`,'',...cartProductLinesV1334()];

    // A observação geral fica imediatamente depois dos produtos para não passar despercebida.
    if(st.note)lines.push('📝 *OBSERVAÇÕES DO PEDIDO*',cleanV1334(st.note),'');

    lines.push('💰 *VALORES*',`Produtos: ${brl(t.sub)}`);
    if(t.promoDiscount)lines.push(`${t.promoOffer?.title||'Oferta'}: - ${brl(t.promoDiscount)}`);
    if(t.loyaltyDiscount)lines.push(`Fidelidade (${t.loyaltyPercent}%): - ${brl(t.loyaltyDiscount)}`);
    if(t.delivery)lines.push(`Taxa de entrega: ${brl(t.delivery)}`);
    if(t.payAdj)lines.push(`${t.payAdj>0?'Taxa':'Desconto'} de pagamento: ${t.payAdj<0?'- ':''}${brl(Math.abs(t.payAdj))}`);
    if(t.service)lines.push(`${o.serviceFeeLabel||'Taxa de serviço'}: ${brl(t.service)}`);
    lines.push(`*TOTAL: ${brl(t.total)}*`,'');

    lines.push('💳 *FORMA DE PAGAMENTO*',paymentKeyLabel(st.payment));
    if(['cash','dinheiro'].includes(cleanV1334(st.payment).toLowerCase())){
      let raw=cleanV1334(st.cashPaid).replace(/[R$\s]/g,'');
      if(raw.includes(','))raw=raw.replace(/\./g,'').replace(',','.');
      const paid=Number(raw);
      if(raw&&Number.isFinite(paid)&&paid>0)lines.push(`Vai pagar com: ${brl(paid)}`,`Troco: ${brl(Math.max(0,paid-Number(t.total||0)))}`);
    }
    lines.push('');

    if(st.mode==='delivery'){
      let address=cleanV1334(st.address),reference=cleanV1334(st.reference);
      if(reference&&address.endsWith(' · '+reference))address=address.slice(0,-(' · '+reference).length).trim();
      lines.push('📍 *ENTREGA*');
      if(st.neighborhood)lines.push(`Bairro: ${cleanV1334(st.neighborhood)}`);
      if(address)lines.push(`Endereço: ${address}`);
      if(reference)lines.push(`Referência: ${reference}`);
      lines.push('');
    }else if(st.mode==='pickup'){
      lines.push('📍 *RETIRADA*');
      if(cfg.store.address)lines.push(cleanV1334(cfg.store.address));
      lines.push('');
    }else{
      lines.push('🍧 *CONSUMO NO LOCAL*');
      if(st.table)lines.push(`Mesa: ${cleanV1334(st.table)}`);
      lines.push('');
    }

    lines.push('👤 *CLIENTE*',`Nome: ${cleanV1334(st.customer)||'-'}`,`Celular: ${cleanV1334(st.phone)||'-'}`);

    if(st.payment==='pix'&&o.pixKey){
      lines.push('','━━━━━━━━━━━━━━━━','💠 *PIX PARA PAGAMENTO*',cleanV1334(o.pixKey));
      if(o.pixHolder)lines.push(cleanV1334(o.pixHolder));
      lines.push('━━━━━━━━━━━━━━━━');
    }
    return lines.filter(v=>v!==null&&v!==undefined).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  };

  function storedProductLinesV1334(order){
    const lines=[];
    (order.items||[]).forEach((item,index)=>{
      const qty=Math.max(1,Number(item.quantity||item.qty||1));
      const name=`${item.name||'Produto'}${item.variant?' · '+item.variant:''}`;
      lines.push(`${itemEmojiV1334(index+1)} *${qty}x ${name} (${brl(Number(item.unit_price||0)*qty)})*`);
      lines.push(...optionLinesV1334(item.groups));
      if(item.note)lines.push(`   ↳ Obs.: ${cleanV1334(item.note)}`);
      lines.push('');
    });
    return lines;
  }

  window.orderCopyTextV125=function(order){
    const lines=[`🧾 *PEDIDO ${orderNumberV125(order)} · ${cleanV1334(order.store_name||currentStoreNameV125()).toUpperCase()}*`,'',...storedProductLinesV1334(order)];
    if(order.note)lines.push('📝 *OBSERVAÇÕES DO PEDIDO*',cleanV1334(order.note),'');
    const sub=Number(order.subtotal||0),discount=Number(order.discount||0),delivery=Number(order.delivery_fee||0),pay=Number(order.payment_adjustment||0),service=Number(order.service_fee||0),total=Number(order.total||0);
    lines.push('💰 *VALORES*',`Produtos: ${brl(sub)}`);
    if(discount)lines.push(`Descontos: - ${brl(discount)}`);
    if(delivery)lines.push(`Taxa de entrega: ${brl(delivery)}`);
    if(pay)lines.push(`${pay>0?'Taxa':'Desconto'} de pagamento: ${pay<0?'- ':''}${brl(Math.abs(pay))}`);
    if(service)lines.push(`Taxa de serviço: ${brl(service)}`);
    lines.push(`*TOTAL: ${brl(total)}*`,'','💳 *FORMA DE PAGAMENTO*',paymentKeyLabel(order.payment_method));
    if(['cash','dinheiro'].includes(cleanV1334(order.payment_method).toLowerCase())){
      const original=cleanV1334(order.whatsapp_text);
      for(const label of ['Vai pagar com','Troco']){
        const value=original.match(new RegExp('(?:^|\\n)'+label+':\\s*([^\\n]+)','i'))?.[1];
        if(value)lines.push(`${label}: ${cleanV1334(value)}`);
      }
    }
    lines.push('');

    if(order.order_mode==='delivery'){
      lines.push('📍 *ENTREGA*');
      if(order.neighborhood)lines.push(`Bairro: ${cleanV1334(order.neighborhood)}`);
      if(order.address)lines.push(`Endereço: ${cleanV1334(order.address)}`);
      const old=cleanV1334(order.whatsapp_text);
      if(/Referência:/i.test(old)){const ref=old.match(/Referência:\s*([^\n]+)/i)?.[1];if(ref)lines.push(`Referência: ${cleanV1334(ref)}`)}
      lines.push('');
    }else if(order.order_mode==='pickup')lines.push('📍 *RETIRADA*','','');
    else {lines.push('🍧 *CONSUMO NO LOCAL*');if(order.table_number)lines.push(`Mesa: ${cleanV1334(order.table_number)}`);lines.push('')}

    lines.push('👤 *CLIENTE*',`Nome: ${cleanV1334(order.customer_name)||'-'}`,`Celular: ${cleanV1334(order.customer_phone)||'-'}`);
    return lines.join('\n').replace(/\n{3,}/g,'\n\n').trim();
  };
})();
