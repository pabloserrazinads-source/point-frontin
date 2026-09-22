
// ===== v1.31.5: FEEDBACK DE SALVAMENTO + QUANTIDADE VISÍVEL NO CARRINHO =====
(function(){

  function pedeviaToastV1315(message,type='ok'){
    let el=document.getElementById('pedeviaToastV1315');
    if(!el){
      el=document.createElement('div');
      el.id='pedeviaToastV1315';
      el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);z-index:99999;max-width:calc(100% - 32px);padding:13px 18px;border-radius:14px;font-weight:800;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.22);opacity:0;transition:.22s ease;text-align:center;';
      document.body.appendChild(el);
    }
    el.textContent=message;
    el.style.background=type==='error'?'#b8323f':'#198b57';
    el.style.color='#fff';
    el.style.opacity='1';
    el.style.transform='translateX(-50%) translateY(0)';
    clearTimeout(window._pedeviaToastTimerV1315);
    window._pedeviaToastTimerV1315=setTimeout(()=>{
      el.style.opacity='0';
      el.style.transform='translateX(-50%) translateY(20px)';
    },2400);
  }
  window.pedeviaToastV1315=pedeviaToastV1315;

  // Mostra claramente que as formas de pagamento foram gravadas.
  savePaymentSettings=async function(){
    const o=cfg.store.orderConfig;
    const btn=[...document.querySelectorAll('#sheet button')].find(b=>/salvar formas de pagamento/i.test(b.textContent||''));
    const oldText=btn?.textContent||'Salvar formas de pagamento';

    try{
      ['pix','cash','credit','debit','foodVoucher','mealVoucher'].forEach(k=>{
        const pay=$('#pay_'+k), type=$('#ft_'+k), value=$('#fv_'+k), brand=$('#brand_'+k);
        if(pay) cfg.store.payments[k]=pay.checked;
        if(type) o.paymentMeta[k].feeType=type.value;
        if(value) o.paymentMeta[k].fee=+value.value||0;
        if(brand) o.paymentMeta[k].askBrand=brand.checked;
      });

      if(btn){
        btn.disabled=true;
        btn.textContent='Salvando...';
      }

      let ok=true;
      if(typeof persistAdminStateV15==='function'){
        ok=await persistAdminStateV15({
          products:false,
          notify:false,
          message:'Formas de pagamento salvas.'
        });
      }else{
        save();
      }

      if(!ok) throw new Error('Não foi possível confirmar o salvamento online.');

      closeModal();
      adminOrderSettings();
      renderShop();
      pedeviaToastV1315('✓ Formas de pagamento salvas com sucesso');

    }catch(e){
      console.error('Erro ao salvar formas de pagamento:',e);
      if(btn){
        btn.disabled=false;
        btn.textContent=oldText;
      }
      pedeviaToastV1315('Não foi possível salvar. Tente novamente.','error');
    }
  };

  // Faz a quantidade mudar na tela imediatamente e destaca a alteração.
  const _changeCartQtyV1315Base=changeCartQty;
  changeCartQty=function(i,d){
    const it=cart[i];
    if(!it)return;

    const before=Math.max(1,+it.qty||1);
    it.qty=Math.max(1,before+d);

    updateCart();

    // Recalcula o conteúdo do carrinho e mantém a quantidade nova visível.
    showCart();

    requestAnimationFrame(()=>{
      const items=document.querySelectorAll('#sheet .cartItem');
      const row=items[i];
      if(!row)return;

      const num=row.querySelector('.cartQty .num');
      if(num){
        num.textContent=it.qty;
        num.style.transition='transform .18s ease, background .18s ease, color .18s ease';
        num.style.display='inline-grid';
        num.style.placeItems='center';
        num.style.minWidth='42px';
        num.style.height='42px';
        num.style.borderRadius='12px';
        num.style.background='rgba(113,36,137,.12)';
        num.style.color='var(--p,#712489)';
        num.style.fontWeight='900';
        num.style.transform='scale(1.18)';
        setTimeout(()=>{num.style.transform='scale(1)'},180);
      }

      // Pisca o valor do item para deixar claro que ele também mudou.
      const price=row.querySelector('.cartItemHead > b:last-child');
      if(price){
        price.style.transition='opacity .18s ease';
        price.style.opacity='.35';
        setTimeout(()=>{price.style.opacity='1'},180);
      }
    });
  };

  // Ajuste visual permanente dos controles de quantidade.
  if(!document.getElementById('pedeviaCartQtyStyleV1315')){
    const s=document.createElement('style');
    s.id='pedeviaCartQtyStyleV1315';
    s.textContent=`
      .cartQty .num{
        display:inline-grid;
        place-items:center;
        min-width:42px;
        height:42px;
        border-radius:12px;
        font-weight:900;
        font-size:18px;
        background:rgba(113,36,137,.08);
        color:var(--p,#712489);
      }
      .cartQty button:not(.cartRemove){
        min-width:48px;
        min-height:48px;
      }
    `;
    document.head.appendChild(s);
  }

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.53');
      }
    });
  },1200);

})();
