
// ===== v1.31.6: CORREÇÃO DEFINITIVA DA QUANTIDADE NO CARRINHO =====
(function(){

  // Atualiza o item diretamente no carrinho real e reconstrói o modal.
  changeCartQty=function(index,delta){
    index=Number(index);
    delta=Number(delta);
    if(!Number.isInteger(index) || !cart[index]) return;

    const current=Math.max(1,Number(cart[index].qty)||1);
    const next=Math.max(1,current+delta);

    if(next===current && delta<0) return;

    cart[index].qty=next;

    // Persiste/recalcula carrinho.
    try{ updateCart(); }catch(e){
      try{ saveCart?.(); }catch(_){}
      try{ renderCart?.(); }catch(_){}
    }

    // Em vez de depender do HTML antigo do modal, fecha e reconstrói
    // o carrinho usando o estado atualizado.
    try{
      const sheet=document.getElementById('sheet');
      if(sheet) sheet.innerHTML='';
      showCart();
    }catch(e){
      console.error('Falha ao redesenhar carrinho:',e);
    }

    // Feedback visual após a reconstrução.
    requestAnimationFrame(()=>{
      const rows=document.querySelectorAll('#sheet .cartItem');
      const row=rows[index];
      if(!row)return;

      // Procura o número central mesmo se a classe do HTML legado variar.
      let num=row.querySelector('.cartQty .num');
      if(!num){
        const controls=[...row.querySelectorAll('button')];
        const minus=controls.find(b=>(b.textContent||'').trim()==='-');
        const plus=controls.find(b=>(b.textContent||'').trim()==='+');
        if(minus && plus){
          let n=minus.nextElementSibling;
          if(n && n!==plus) num=n;
        }
      }

      if(num){
        num.textContent=String(next);
        num.style.transform='scale(1.22)';
        num.style.transition='transform .16s ease';
        setTimeout(()=>{num.style.transform='scale(1)'},170);
      }
    });
  };

  // Garante que todos os botões +/- do modal chamem a função acima,
  // inclusive se o HTML legado tiver sido renderizado por outra camada.
  document.addEventListener('click',function(ev){
    const btn=ev.target.closest('#sheet .cartQty button');
    if(!btn)return;

    const label=(btn.textContent||'').trim();
    if(label!=='+' && label!=='-')return;

    const row=btn.closest('.cartItem');
    if(!row)return;

    const rows=[...document.querySelectorAll('#sheet .cartItem')];
    const index=rows.indexOf(row);
    if(index<0 || !cart[index])return;

    ev.preventDefault();
    ev.stopImmediatePropagation();

    changeCartQty(index,label==='+'?1:-1);
  },true);

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0');
      }
    });
  },1200);

})();
