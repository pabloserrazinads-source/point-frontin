
// ===== v1.31.2: CORREÇÃO DO PEDIDO MÍNIMO =====
// O pedido mínimo de entrega considera SOMENTE o valor dos produtos.
// Taxa de entrega, taxa de serviço e outros acréscimos não ajudam a atingir o mínimo.
function minimumOrderCheckV1312(){
  const minimum=Math.max(0,Number(cfg?.store?.minimumOrder||0));
  const products=Math.max(0,Number(typeof cartSubtotal==='function'?cartSubtotal():sum()));
  return {
    minimum,
    products,
    missing:Math.max(0,minimum-products),
    ok:minimum<=0 || products+0.0001>=minimum
  };
}

function minimumOrderMessageV1312(){
  const c=minimumOrderCheckV1312();
  return `O pedido mínimo para entrega é ${brl(c.minimum)} em produtos.\n\n`+
         `Produtos no carrinho: ${brl(c.products)}\n`+
         `Faltam: ${brl(c.missing)}\n\n`+
         `A taxa de entrega não conta para atingir o pedido mínimo.`;
}

const _selectReceiveV1312Base=selectReceive;
selectReceive=function(m){
  if(m==='delivery'){
    const c=minimumOrderCheckV1312();
    if(!c.ok){
      alert(minimumOrderMessageV1312());
      showCart();
      return;
    }
  }
  return _selectReceiveV1312Base(m);
};

// Segunda validação no envio: protege o pedido caso o mínimo seja alterado
// enquanto o cliente já está no checkout ou alguma etapa seja contornada.
const _finishWhatsAppV1312Base=finishWhatsApp;
finishWhatsApp=async function(){
  if((window.checkoutState||{}).mode==='delivery'){
    const c=minimumOrderCheckV1312();
    if(!c.ok){
      alert(minimumOrderMessageV1312());
      return;
    }
  }
  return await _finishWhatsAppV1312Base();
};

setTimeout(()=>{
  document.querySelectorAll('.adminHead .hint').forEach(el=>{
    if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||''))
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0');
  });
},1100);
