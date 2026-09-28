/* Pedevia v1.34.4 — ciclos e histórico auditável da fidelidade. */
(function(){
  'use strict';
  const VERSION='1.34.4';
  const digits=v=>String(v||'').replace(/\D/g,'');
  const samePhone=(a,b)=>{const x=digits(a),y=digits(b);return x.length>=10&&y.length>=10&&x.slice(-10)===y.slice(-10)};
  const offerNow=()=>{try{return activeLoyaltyOfferV113()}catch(_e){return null}};
  const cycleState=(count,offer=offerNow())=>{
    const total=Math.max(0,Number(count||0));
    const required=Math.max(1,Number(offer?.requiredOrders||10));
    const reward=Math.max(0,Math.min(100,Number(offer?.rewardPercent||10)));
    const progress=total%required;
    // O benefício entra no próprio pedido que completa a cartela.
    const eligible=!!offer&&progress===required-1&&reward>0;
    return {total,required,reward,progress,eligible,remaining:Math.max(0,required-progress),cycles:Math.floor(total/required)};
  };

  // Checkout: 9/10 libera o desconto para o décimo pedido.
  if(typeof loyaltyStateFromProfileV119==='function'){
    loyaltyStateFromProfileV119=function(profile){
      const offer=offerNow();
      const phone=normalizeCustomerPhoneV113(profile?.phone||getCachedCustomerPhoneV115()||window.checkoutState?.phone||'');
      const state=cycleState(profile?.order_count,offer);
      return {phone,orderCount:state.total,eligible:state.eligible,percent:state.reward,required:state.required,offer};
    };
    window.loyaltyStateFromProfileV119=loyaltyStateFromProfileV119;
  }

  // Cliente: ao concluir cada grupo de dez, a cartela ativa volta para 0/10.
  loyaltyProgressTextV113=function(count,offer){
    if(!offer)return '';
    const s=cycleState(count,offer);
    if(s.eligible)return `🎁 Fidelidade: ${s.progress}/${s.required}. Este pedido completa a cartela e recebe ${s.reward}% de desconto.`;
    if(s.progress===0&&s.total>0)return `⭐ Novo ciclo: 0/${s.required} pedidos. Complete outra cartela para ganhar ${s.reward}% de desconto.`;
    return `⭐ Fidelidade: ${s.progress}/${s.required} pedidos. Faltam ${s.remaining} para ganhar ${s.reward}% de desconto.`;
  };
  window.loyaltyProgressTextV113=loyaltyProgressTextV113;

  if(typeof loyaltyModalContentV115==='function'){
    loyaltyModalContentV115=function(profile,offer){
      const s=cycleState(profile?.order_count,offer),width=Math.min(100,(s.progress/s.required)*100);
      return `<div class="loyaltyBigV115">${s.eligible?'🎁':'⭐'}</div><h3>${esc(profile?.name||'Cliente')}</h3><div class="loyaltyProgressBarV115"><span style="width:${width}%"></span></div><div class="loyaltyNumbersV115"><b>${s.progress}/${s.required} pedidos no ciclo atual</b></div><p>${s.eligible?`Este pedido completa a cartela e recebe ${s.reward}% de desconto.`:s.progress===0&&s.total>0?`Uma cartela foi concluída. O novo ciclo já começou.`:`Faltam ${s.remaining} pedido(s) para ganhar ${s.reward}% de desconto.`}</p>${s.cycles?`<small class="hint">${s.cycles} cartela(s) já concluída(s).</small>`:''}`;
    };
    window.loyaltyModalContentV115=loyaltyModalContentV115;
  }

  window.openLoyaltyOrdersV1344=async function(phone,name){
    const clean=digits(phone),offer=offerNow();
    showModal(`<div class="row"><div><h2 style="margin:0">Pedidos da fidelidade</h2><div class="hint">${esc(name||'Cliente')} · ${esc(clean)}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="openLoyaltyCustomersAdminV1314">‹</button></div><div id="v1344LoyaltyOrders"><div class="panel">Carregando pedidos contabilizados...</div></div>`);
    const host=document.getElementById('v1344LoyaltyOrders');
    try{
      const all=await fetchAllStoreOrdersV126();
      const rows=all.filter(o=>o.status==='completed'&&samePhone(o.customer_phone,clean)).sort((a,b)=>new Date(b.completed_at||b.updated_at||b.created_at)-new Date(a.completed_at||a.updated_at||a.created_at));
      let official=rows.length;
      try{const p=await getLoyaltyStatusV113(clean);if(p?.order_count!==undefined)official=Math.max(0,Number(p.order_count||0))}catch(_e){}
      const s=cycleState(official,offer),activeCount=s.progress;
      host.innerHTML=`<div class="v1344CycleSummary"><div><b>${s.progress}/${s.required}</b><span>ciclo atual</span></div><div><b>${s.cycles}</b><span>cartelas concluídas</span></div><div><b>${rows.length}</b><span>pedidos encontrados</span></div></div>${official!==rows.length?`<div class="notice">A quantidade oficial é ${official}, mas foram encontrados ${rows.length} pedidos concluídos no histórico. Isso pode ocorrer por ajustes manuais ou registros antigos.</div>`:''}<h3>Ciclo atual</h3>${renderOrders(rows.slice(0,activeCount),true)}${rows.length>activeCount?`<details class="v1344Past"><summary>Ver pedidos de ciclos anteriores (${rows.length-activeCount})</summary>${renderOrders(rows.slice(activeCount),false)}</details>`:''}`;
    }catch(e){host.innerHTML=`<div class="notice bad">Não foi possível carregar os pedidos: ${esc(e?.message||e)}</div>`}
  };
  function renderOrders(rows,active){
    if(!rows.length)return `<div class="notice">${active?'O ciclo atual ainda não possui pedidos.':'Nenhum pedido anterior encontrado.'}</div>`;
    return `<div class="v1344OrderList">${rows.map(o=>{const date=new Date(o.completed_at||o.updated_at||o.created_at),number=typeof orderNumberV125==='function'?orderNumberV125(o):String(o.store_order_number||o.order_number||'Pedido');return `<div class="v1344Order"><div><b>${esc(number)}</b><small>${Number.isFinite(date.getTime())?date.toLocaleString('pt-BR'):'Data não informada'}</small></div><strong>${brl(Number(o.total||0))}</strong></div>`}).join('')}</div>`;
  }

  // Corrige o painel privado: progresso do ciclo, histórico e identidade pelo celular.
  if(typeof window.renderLoyaltyCustomersAdminV1314==='function'){
    const baseRender=window.renderLoyaltyCustomersAdminV1314;
    window.renderLoyaltyCustomersAdminV1314=function(rows){
      const offer=offerNow();
      (rows||[]).forEach(c=>{
        const s=cycleState(c.status?.count,offer);
        c.status={...c.status,count:s.total,required:s.required,reward:s.reward,progress:s.progress,eligible:s.eligible,remaining:s.remaining,label:s.eligible?`Este pedido ganha ${s.reward}% OFF`:`${s.progress}/${s.required}`};
      });
      baseRender(rows);
      document.querySelectorAll('.loyaltyAdminCustomerV1314').forEach((panel,i)=>{
        const c=(rows||[]).filter(x=>x.status?.count>0)[i];if(!c)return;
        panel.dataset.customerPhone=digits(c.phone);
        const count=[...panel.querySelectorAll('b')].find(x=>/pedido.*no clube/i.test(x.textContent||''));
        if(count){const s=cycleState(c.status.count,offer);count.textContent=`${s.progress}/${s.required} no ciclo atual`}
        const hint=[...panel.querySelectorAll('.hint')].find(x=>/Faltam|desconto disponível/i.test(x.textContent||''));
        if(hint){const s=cycleState(c.status.count,offer);hint.textContent=s.eligible?`O próximo pedido completa a cartela e ganha ${s.reward}% OFF`:s.progress===0?'Novo ciclo iniciado':`Faltam ${s.remaining} pedido(s) para ${s.reward}% OFF`}
        const editor=panel.lastElementChild,input=editor?.querySelector('input'),label=editor?.querySelector('label'),cycle=cycleState(c.status.count,offer);
        if(input)input.value=String(cycle.progress);if(label)label.textContent='Pedidos no ciclo atual';
        const button=document.createElement('button');button.type='button';button.className='ghost v1344HistoryBtn';button.textContent='Ver pedidos que valeram';button.onclick=()=>openLoyaltyOrdersV1344(c.phone,c.name);editor?.after(button);
      });
    };
  }

  // O ajuste manual altera somente a cartela aberta e preserva os ciclos anteriores.
  window.saveLoyaltyCountAdminV13255=async function(phone,name,button){
    const customer=(window.loyaltyCustomersAdminV1314||[]).find(c=>samePhone(c.loyaltyPhone||c.phone,phone));
    const offer=offerNow(),state=cycleState(customer?.status?.count,offer),input=document.getElementById('loyaltyCount_'+phone),progress=Number(input?.value);
    if(!Number.isInteger(progress)||progress<0||progress>=state.required){alert(`Informe uma quantidade entre 0 e ${state.required-1} para o ciclo atual.`);return}
    if(!confirm(`Alterar o ciclo atual de ${name||phone} para ${progress}/${state.required}?`))return;
    const total=state.cycles*state.required+progress,old=button?.textContent||'Salvar quantidade';
    if(button){button.disabled=true;button.textContent='Salvando...'}
    try{
      const key=currentStoreKeyV127();
      const rpc=await supabaseClient.rpc('set_pedevia_loyalty_count_v13257',{p_store_key:key,p_phone:digits(phone),p_order_count:total,p_name:String(name||'Cliente')});
      if(rpc.error)throw rpc.error;
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('✓ Ciclo atual da fidelidade atualizado');
      await loadLoyaltyCustomersAdminV1314();
    }catch(e){console.error('Falha ao ajustar ciclo da fidelidade:',e);alert('Não foi possível alterar a quantidade: '+(e?.message||e))}
    finally{if(button?.isConnected){button.disabled=false;button.textContent=old}}
  };

  if(typeof window.loadLoyaltyCustomersAdminV1314==='function'){
    const baseLoad=window.loadLoyaltyCustomersAdminV1314;
    window.loadLoyaltyCustomersAdminV1314=async function(){
      const r=await baseLoad.apply(this,arguments),rows=window.loyaltyCustomersAdminV1314||[],offer=offerNow();
      const summary=document.getElementById('loyaltyAdminSummaryV1314');
      if(summary){const active=rows.filter(c=>cycleState(c.status?.count,offer).progress>0),ready=rows.filter(c=>cycleState(c.status?.count,offer).eligible);summary.innerHTML=`<div class="v126Stat"><b>${active.length}</b><small>clientes no ciclo</small></div><div class="v126Stat"><b>${active.reduce((n,c)=>n+cycleState(c.status?.count,offer).progress,0)}</b><small>pedidos no ciclo atual</small></div><div class="v126Stat"><b>${ready.length}</b><small>próximos pedidos com prêmio</small></div>`}
      return r;
    };
  }

  const css=document.createElement('style');css.textContent=`.v1344HistoryBtn{width:100%;margin-top:9px}.v1344CycleSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.v1344CycleSummary>div{background:#f5edf8;border-radius:15px;padding:12px;text-align:center}.v1344CycleSummary b,.v1344CycleSummary span{display:block}.v1344CycleSummary b{font-size:21px;color:var(--p)}.v1344CycleSummary span{font-size:11px;color:var(--muted);margin-top:3px}.v1344Order{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 2px;border-bottom:1px solid var(--line)}.v1344Order small{display:block;color:var(--muted);margin-top:3px}.v1344Past{margin-top:15px}.v1344Past summary{cursor:pointer;color:var(--p);font-weight:800;padding:12px;background:#f5edf8;border-radius:14px}`;document.head.appendChild(css);
  window.PEDEVIA_VERSION=VERSION;
})();
