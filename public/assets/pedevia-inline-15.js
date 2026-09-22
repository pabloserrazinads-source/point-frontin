
// ===== v1.31.11: PAGAMENTO EM DINHEIRO SEM OBSERVERS / FOCO ESTÁVEL =====
(function(){

  function isCashV13111(){
    const p=String(window.checkoutState?.payment||'').toLowerCase();
    return p==='cash' || p==='dinheiro';
  }

  function parseMoneyV13111(v){
    let s=String(v??'').trim().replace(/[R$\s]/g,'');
    if(!s)return 0;
    if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
    const n=Number(s);
    return Number.isFinite(n)?n:0;
  }

  function cashNumbersV13111(){
    const total=Math.max(0,Number(checkoutTotalsV111()?.total||0));
    const paid=Math.max(0,parseMoneyV13111(window.checkoutState?.cashPaid||''));
    return {total,paid,change:Math.max(0,paid-total)};
  }

  function renderCashResultV13111(){
    const input=document.getElementById('cashPaidV13111');
    const result=document.getElementById('cashChangeV13111');
    const warning=document.getElementById('cashWarnV13111');
    if(!input||!result)return;

    window.checkoutState=window.checkoutState||{};
    window.checkoutState.cashPaid=input.value;

    const x=cashNumbersV13111();
    const empty=!String(input.value||'').trim();

    if(empty){
      result.textContent='Informe com quanto você vai pagar';
      if(warning)warning.hidden=true;
      return;
    }

    if(x.paid<x.total){
      result.textContent='Valor informado: '+brl(x.paid);
      if(warning){
        warning.hidden=false;
        warning.textContent='O valor informado precisa ser igual ou maior que o total do pedido.';
      }
      return;
    }

    if(warning)warning.hidden=true;
    result.textContent=x.change>0 ? 'Troco: '+brl(x.change) : 'Não precisa de troco';
  }

  function addCashBoxV13111(){
    if(!isCashV13111())return;
    const sheet=document.getElementById('sheet');
    if(!sheet || document.getElementById('cashPaymentBoxV13111'))return;

    // O bloco é inserido UMA ÚNICA VEZ após o botão da forma de pagamento.
    const paymentButton=[...sheet.querySelectorAll('button.choiceTile')]
      .find(b=>/dinheiro/i.test(b.textContent||''));
    if(!paymentButton)return;

    const box=document.createElement('div');
    box.id='cashPaymentBoxV13111';
    box.className='cashBoxV13111';
    box.innerHTML=`
      <div class="cashTitleV13111">💵 Pagamento em dinheiro</div>
      <label for="cashPaidV13111">Vai pagar com quanto?</label>
      <input
        id="cashPaidV13111"
        class="field"
        type="text"
        inputmode="decimal"
        enterkeyhint="done"
        autocomplete="off"
        placeholder="Ex.: 50,00"
        value="${esc(String(window.checkoutState?.cashPaid||''))}">
      <div id="cashChangeV13111" class="cashResultV13111">Informe com quanto você vai pagar</div>
      <div id="cashWarnV13111" class="cashWarnV13111" hidden></div>
    `;

    paymentButton.insertAdjacentElement('afterend',box);

    // Listener direto no campo. Sem MutationObserver, sem reconstruir checkout,
    // sem trocar o elemento que está focado.
    const input=box.querySelector('#cashPaidV13111');
    input.addEventListener('input',renderCashResultV13111);
    input.addEventListener('change',renderCashResultV13111);

    renderCashResultV13111();
  }

  // Mantém TODAS as camadas atuais do checkout/fidelidade e apenas acrescenta
  // o campo de dinheiro depois que elas terminarem de montar a tela.
  const showCustomerBaseV13111=showCustomerForm;
  showCustomerForm=function(){
    const r=showCustomerBaseV13111.apply(this,arguments);
    addCashBoxV13111();
    return r;
  };

  // Se a fidelidade alterar o total depois da consulta do telefone,
  // atualiza só o texto do troco. O input permanece exatamente o mesmo.
  if(typeof renderCheckoutTotalsV119==='function'){
    const totalsBaseV13111=renderCheckoutTotalsV119;
    renderCheckoutTotalsV119=function(){
      const r=totalsBaseV13111.apply(this,arguments);
      if(document.getElementById('cashPaidV13111'))renderCashResultV13111();
      return r;
    };
  }

  // Validação final antes de registrar/enviar.
  const finishBaseV13111=finishWhatsApp;
  finishWhatsApp=async function(){
    if(isCashV13111()){
      const input=document.getElementById('cashPaidV13111');
      if(input){
        window.checkoutState=window.checkoutState||{};
        window.checkoutState.cashPaid=input.value;
      }
      const raw=String(window.checkoutState?.cashPaid||'').trim();
      const x=cashNumbersV13111();

      if(!raw){
        alert('Informe com quanto você vai pagar em dinheiro.');
        input?.focus();
        return;
      }
      if(x.paid<x.total){
        alert(`O valor informado (${brl(x.paid)}) é menor que o total do pedido (${brl(x.total)}).`);
        input?.focus();
        return;
      }
    }
    return await finishBaseV13111.apply(this,arguments);
  };

  // Acrescenta "vai pagar com" e "troco" à comanda do WhatsApp,
  // preservando a formatação profissional já existente.
  const buildTextBaseV13111=buildOrderTextV111;
  buildOrderTextV111=function(){
    let text=buildTextBaseV13111.apply(this,arguments);
    if(!isCashV13111())return text;

    const x=cashNumbersV13111();
    const payment=paymentKeyLabel(window.checkoutState?.payment);
    const needle=`*Forma de pagamento*\n${payment}`;

    const extra=`${needle}\nVai pagar com: ${brl(x.paid)}\nTroco: ${brl(x.change)}`;
    if(text.includes(needle))return text.replace(needle,extra);

    return text+`\n\n*Pagamento em dinheiro*\nVai pagar com: ${brl(x.paid)}\nTroco: ${brl(x.change)}`;
  };

  // Estilo do bloco sem interferir no comportamento do teclado.
  const style=document.createElement('style');
  style.id='cashStyleV13111';
  style.textContent=`
    .cashBoxV13111{
      margin:12px 0 18px;
      padding:15px;
      border-radius:18px;
      background:#fff1c7;
    }
    .cashTitleV13111{
      font-size:17px;
      font-weight:900;
      margin-bottom:10px;
    }
    .cashBoxV13111 label{
      display:block;
      margin-bottom:7px;
      font-weight:700;
    }
    .cashResultV13111{
      margin-top:9px;
      font-weight:900;
      font-size:16px;
    }
    .cashWarnV13111{
      margin-top:6px;
      color:#b8323f;
      font-size:13px;
      font-weight:700;
    }
  `;
  document.head.appendChild(style);

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.53');
      }
    });
  },1200);

})();
