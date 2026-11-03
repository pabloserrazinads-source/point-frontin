/* Pedevia v1.35.59 — fidelidade alternada: 10% de desconto → copo de 500ml → 10% → ...
   Regra (calculada só pela contagem oficial de pedidos, sem mudar o banco):
   - ciclos concluídos PAR   (0, 2, 4...) → a cartela atual vale 10% de desconto no 10º pedido;
   - ciclos concluídos ÍMPAR (1, 3, 5...) → a cartela atual vale 1 copo de 500ml grátis no 10º pedido.
   Vale automaticamente para todos os clientes já existentes. */
(function(){
  'use strict';
  const VERSION='1.35.59';
  const CUP='copo de 500ml';
  const offerNow=()=>{try{return activeLoyaltyOfferV113()}catch(_e){return null}};

  const cycleState=(count,offer=offerNow())=>{
    const total=Math.max(0,Number(count||0));
    const required=Math.max(1,Number(offer?.requiredOrders||10));
    const reward=Math.max(0,Math.min(100,Number(offer?.rewardPercent||10)));
    const progress=total%required;
    const cycles=Math.floor(total/required);
    const type=cycles%2===0?'percent':'cup';
    // O prêmio entra no próprio pedido que completa a cartela (9/10 → o 10º pedido).
    const eligible=!!offer&&progress===required-1&&(type==='cup'||reward>0);
    const prevType=type==='percent'?'cup':'percent';
    return {total,required,reward,progress,cycles,type,prevType,eligible,remaining:Math.max(0,required-progress)};
  };
  const rewardText=(type,reward)=>type==='cup'?`um ${CUP} grátis`:`${reward}% de desconto`;
  const rewardShort=(type,reward)=>type==='cup'?`copo de 500ml`:`${reward}% OFF`;
  window.pedeviaLoyaltyCycleV13559=cycleState;

  // ---------- Checkout: estado do benefício ----------
  if(typeof loyaltyStateFromProfileV119==='function'){
    loyaltyStateFromProfileV119=function(profile){
      const offer=offerNow();
      const phone=normalizeCustomerPhoneV113(profile?.phone||getCachedCustomerPhoneV115()||window.checkoutState?.phone||'');
      const s=cycleState(profile?.order_count,offer);
      return {phone,orderCount:s.total,eligible:s.eligible,percent:s.type==='percent'?s.reward:0,rewardType:s.type,required:s.required,offer};
    };
    window.loyaltyStateFromProfileV119=loyaltyStateFromProfileV119;
  }

  // Totais: o copo não altera o valor, só sinaliza o brinde.
  if(typeof checkoutTotalsV111==='function'){
    const totalsBase=checkoutTotalsV111;
    checkoutTotalsV111=function(){
      const t=totalsBase.apply(this,arguments);
      let cup=false;
      try{
        const b=window.loyaltyBenefitV119||{};
        cup=!!(b.eligible&&b.rewardType==='cup'&&loyaltyPhoneMatchesV119());
      }catch(_e){}
      t.loyaltyCup=cup;
      return t;
    };
    window.checkoutTotalsV111=checkoutTotalsV111;
  }

  // Tela de totais do checkout: linha do brinde + aviso.
  if(typeof renderCheckoutTotalsV119==='function'){
    const renderBase=renderCheckoutTotalsV119;
    renderCheckoutTotalsV119=function(){
      const r=renderBase.apply(this,arguments);
      try{
        const b=window.loyaltyBenefitV119||{};
        if(b.eligible&&b.rewardType==='cup'&&loyaltyPhoneMatchesV119()){
          const box=document.querySelector('#sheet .cartTotals')||document.querySelector('.sheet .cartTotals')||document.querySelector('.cartTotals');
          if(box&&!box.querySelector('.loyaltyCupV13559')){
            const row=document.createElement('div');
            row.className='row discountLine loyaltyDiscountV119 loyaltyCupV13559';
            row.innerHTML='<span>🎁 Brinde da fidelidade</span><b>1 copo de 500ml grátis</b>';
            const rows=box.querySelectorAll('.row');
            const last=rows[rows.length-1];
            if(last)box.insertBefore(row,last);else box.appendChild(row);
          }
          const status=document.getElementById('loyaltyCustomerStatusV113');
          if(status)status.textContent='🎉 Brinde liberado: você ganha 1 copo de 500ml grátis neste pedido.';
        }
      }catch(e){console.warn('Brinde da fidelidade:',e)}
      return r;
    };
    window.renderCheckoutTotalsV119=renderCheckoutTotalsV119;
  }

  // ---------- Mensagem enviada ao WhatsApp / salva no pedido ----------
  const CUP_LINE='🎁 Brinde fidelidade: 1 copo de 500ml (grátis)';
  function insertCupLine(text){
    const lines=String(text||'').split('\n');
    if(lines.some(x=>x.includes('Brinde fidelidade')))return lines.join('\n');
    const idx=lines.findIndex(x=>/^\*TOTAL:/i.test(x.trim()));
    if(idx>=0)lines.splice(idx,0,CUP_LINE);else lines.push('',CUP_LINE);
    return lines.join('\n');
  }
  if(typeof buildOrderTextV111==='function'){
    const buildBase=buildOrderTextV111;
    buildOrderTextV111=function(){
      const text=buildBase.apply(this,arguments);
      try{const t=checkoutTotalsV111();if(t.loyaltyCup)return insertCupLine(text)}catch(_e){}
      return text;
    };
    window.buildOrderTextV111=buildOrderTextV111;
  }
  // Cópia do pedido no painel: mantém o brinde que foi enviado no pedido original.
  if(typeof orderCopyTextV125==='function'){
    const copyBase=orderCopyTextV125;
    orderCopyTextV125=function(order){
      const text=copyBase.apply(this,arguments);
      if(/Brinde fidelidade/i.test(String(order?.whatsapp_text||'')))return insertCupLine(text);
      return text;
    };
    window.orderCopyTextV125=orderCopyTextV125;
  }

  // ---------- Mensagens para o cliente ----------
  loyaltyProgressTextV113=function(count,offer){
    if(!offer)return '';
    const s=cycleState(count,offer);
    if(s.eligible){
      return s.type==='cup'
        ?`🎁 Fidelidade: ${s.progress}/${s.required}. Este pedido completa a cartela e você ganha ${rewardText('cup')}!`
        :`🎁 Fidelidade: ${s.progress}/${s.required}. Este pedido completa a cartela e recebe ${s.reward}% de desconto.`;
    }
    if(s.progress===0&&s.total>0){
      const won=s.prevType==='cup'?`ganhou ${rewardText('cup')}`:`ganhou ${s.reward}% de desconto`;
      return `🎉 Você completou ${s.required} pedidos e ${won}! Sua fidelidade agora é: complete mais ${s.required} pedidos para ganhar ${rewardText(s.type,s.reward)}.`;
    }
    return `⭐ Fidelidade: ${s.progress}/${s.required} pedidos. Faltam ${s.remaining} para ganhar ${rewardText(s.type,s.reward)}.`;
  };
  window.loyaltyProgressTextV113=loyaltyProgressTextV113;

  if(typeof loyaltyModalContentV115==='function'){
    loyaltyModalContentV115=function(profile,offer){
      const s=cycleState(profile?.order_count,offer),width=Math.min(100,(s.progress/s.required)*100);
      const msg=s.eligible
        ?(s.type==='cup'?`Este pedido completa a cartela e você ganha ${rewardText('cup')}!`:`Este pedido completa a cartela e recebe ${s.reward}% de desconto.`)
        :s.progress===0&&s.total>0
          ?`Cartela concluída! Agora, nos próximos ${s.required} pedidos, você ganha ${rewardText(s.type,s.reward)}.`
          :`Faltam ${s.remaining} pedido(s) para ganhar ${rewardText(s.type,s.reward)}.`;
      return `<div class="loyaltyBigV115">${s.eligible?'🎁':'⭐'}</div><h3>${esc(profile?.name||'Cliente')}</h3><div class="loyaltyProgressBarV115"><span style="width:${width}%"></span></div><div class="loyaltyNumbersV115"><b>${s.progress}/${s.required} pedidos no ciclo atual</b></div><p>${msg}</p><small class="hint">Prêmio deste ciclo: ${s.type==='cup'?'🥤 copo de 500ml':'🏷️ '+s.reward+'% de desconto'}. A cada cartela concluída o prêmio alterna entre 10% e copo de 500ml.</small>${s.cycles?`<small class="hint" style="display:block;margin-top:4px">${s.cycles} cartela(s) já concluída(s).</small>`:''}`;
    };
    window.loyaltyModalContentV115=loyaltyModalContentV115;
  }

  // Banner da fidelidade na página inicial (descrição automática; texto personalizado
  // só é mantido se não falar de desconto/percentual).
  const bannerDesc=o=>`A cada ${Math.max(1,+o.requiredOrders||10)} pedidos você ganha um prêmio: ${Math.max(0,+o.rewardPercent||10)}% de desconto, depois um copo de 500ml, e assim por diante.`;
  if(typeof renderClientOffers==='function'){
    const offersBase=renderClientOffers;
    renderClientOffers=function(){
      const offs=(cfg.offers||[]).filter(o=>o&&o.type==='loyalty');
      const saved=offs.map(o=>o.description);
      offs.forEach(o=>{if(!o.description||/\d+\s*%|desconto/i.test(o.description))o.description=bannerDesc(o)});
      try{return offersBase.apply(this,arguments)}
      finally{offs.forEach((o,i)=>{o.description=saved[i]})}
    };
    window.renderClientOffers=renderClientOffers;
  }

  // ---------- Painel admin: clientes do clube ----------
  if(typeof window.renderLoyaltyCustomersAdminV1314==='function'){
    const adminBase=window.renderLoyaltyCustomersAdminV1314;
    window.renderLoyaltyCustomersAdminV1314=function(rows){
      const offer=offerNow();
      const r=adminBase.apply(this,arguments);
      try{
        const list=(rows||[]).filter(x=>x.status?.count>0);
        document.querySelectorAll('.loyaltyAdminCustomerV1314').forEach((panel,i)=>{
          const c=list[i];if(!c)return;
          const s=cycleState(c.status.count,offer);
          const hint=[...panel.querySelectorAll('.hint')].find(x=>/OFF|Faltam|Novo ciclo|desconto/i.test(x.textContent||''));
          if(hint){
            hint.textContent=s.eligible
              ?`O próximo pedido completa a cartela e ganha ${rewardText(s.type,s.reward)}`
              :s.progress===0
                ?`Novo ciclo iniciado · prêmio: ${rewardShort(s.type,s.reward)}`
                :`Faltam ${s.remaining} pedido(s) para ${rewardShort(s.type,s.reward)}`;
          }
          const badge=panel.querySelector('.badge');
          if(badge&&s.eligible)badge.textContent=s.type==='cup'?'PRÊMIO: COPO 500ml':'PRÊMIO: '+s.reward+'% OFF';
          if(!panel.querySelector('.loyaltyPhaseV13559')){
            const tag=document.createElement('small');
            tag.className='hint loyaltyPhaseV13559';
            tag.style.display='block';tag.style.marginTop='4px';
            tag.textContent=`Cartela atual vale: ${s.type==='cup'?'🥤 copo de 500ml':'🏷️ '+s.reward+'% de desconto'}`;
            (hint?.parentElement||panel).appendChild(tag);
          }
        });
        // Contagem de clientes com prêmio por tipo
        const sum=document.getElementById('loyaltyAdminSummaryV1314');
        if(sum){
          const ready=(window.loyaltyCustomersAdminV1314||rows||[]).filter(c=>cycleState(c.status?.count,offer).eligible);
          const cups=ready.filter(c=>cycleState(c.status?.count,offer).type==='cup').length;
          const small=[...sum.querySelectorAll('small')].find(x=>/prêmio/i.test(x.textContent||''));
          if(small)small.textContent=`próximos pedidos com prêmio (${cups} copo${cups===1?'':'s'})`;
        }
      }catch(e){console.warn('Painel de fidelidade:',e)}
      return r;
    };
  }

  // Textos "N pedidos → X% de benefício" nas telas administrativas.
  const hintRe=/^\s*(\d+)\s+pedidos\s*→\s*(\d+)%\s+de benefício\s*$/i;
  let queued=false;
  function fixAdminHints(){
    queued=false;
    document.querySelectorAll('.hint').forEach(el=>{
      const m=hintRe.exec(el.textContent||'');
      if(m)el.textContent=`${m[1]} pedidos → ${m[2]}% de desconto · ${m[1]} pedidos → copo de 500ml (alterna)`;
    });
  }
  function scheduleFix(){if(queued)return;queued=true;requestAnimationFrame(fixAdminHints)}
  try{
    new MutationObserver(scheduleFix).observe(document.body,{childList:true,subtree:true});
    scheduleFix();
  }catch(_e){}

  // Atualiza as telas que já estiverem abertas.
  try{
    if(typeof renderClientOffers==='function'&&document.getElementById('clientOffers'))renderClientOffers();
    const cached=typeof getCachedCustomerPhoneV115==='function'?getCachedCustomerPhoneV115():'';
    if(cached&&typeof refreshLoyaltyForPhoneV113==='function')refreshLoyaltyForPhoneV113(cached);
  }catch(_e){}

  window.PEDEVIA_VERSION=VERSION;
})();
