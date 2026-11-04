/* Pedevia v1.35.61 — consultas leves e histórico paginado da fidelidade. */
(function(){
  'use strict';
  const VERSION='1.35.61';
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

  window.openLoyaltyOrdersV1344=async function(phone,name,officialCount){
    const clean=digits(phone),offer=offerNow(),pageSize=30;
    showModal(`<div class="row"><div><h2 style="margin:0">Pedidos da fidelidade</h2><div class="hint">${esc(name||'Cliente')} · ${esc(clean)}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="openLoyaltyCustomersAdminV1314">‹</button></div><div id="v1344LoyaltyOrders"><div class="panel">Carregando pedidos contabilizados...</div></div>`);
    const host=document.getElementById('v1344LoyaltyOrders');
    try{
      // Consulta somente pedidos concluídos deste cliente, preservando o histórico
      // legado. O banco devolve 30 por vez; não baixa pedidos de outros clientes.
      const statusPromise=officialCount!==undefined
        ? Promise.resolve({order_count:officialCount})
        : getLoyaltyStatusV113(clean);
      const [statusResult,pageResult]=await Promise.all([
        statusPromise,
        supabaseClient.rpc('list_pedevia_loyalty_orders_v13561',{
          p_store_key:currentStoreKeyV127(),
          p_phone:clean,
          p_limit:pageSize,
          p_offset:0
        })
      ]);
      if(pageResult.error)throw pageResult.error;

      const official=Math.max(0,Number(statusResult?.order_count||0));
      const rows=Array.isArray(pageResult.data?.rows)?pageResult.data.rows:[];
      const total=Math.max(0,Number(pageResult.data?.total||0));
      const s=cycleState(official,offer);
      const activeCount=Math.min(s.progress,rows.length);
      const currentRows=rows.slice(0,activeCount);
      const pastRows=rows.slice(activeCount);
      let offset=rows.length;

      host.innerHTML=`
        <div class="v1344CycleSummary">
          <div><b>${s.progress}/${s.required}</b><span>ciclo atual</span></div>
          <div><b>${s.cycles}</b><span>cartelas concluídas</span></div>
          <div><b>${total}</b><span>pedidos encontrados</span></div>
        </div>
        ${official!==total?`<div class="notice">A quantidade oficial é ${official}, mas foram localizados ${total} pedidos concluídos no histórico. Essa diferença pode ocorrer por ajustes manuais ou registros antigos.</div>`:''}
        <h3>Ciclo atual</h3>
        <div id="v13560CurrentOrders">${renderOrders(currentRows,true)}</div>
        ${total>activeCount?`
          <details class="v1344Past" open>
            <summary>Pedidos de ciclos anteriores (${Math.max(0,total-activeCount)})</summary>
            <div id="v13560PastOrders">${renderOrders(pastRows,false)}</div>
            <div id="v13560MoreArea"></div>
          </details>`:''}
      `;

      const moreArea=document.getElementById('v13560MoreArea');
      const loadMore=async()=>{
        const button=document.getElementById('v13560LoadMore');
        if(!button || button.disabled)return;
        button.disabled=true;button.textContent='Carregando...';
        try{
          const {data,error}=await supabaseClient.rpc('list_pedevia_loyalty_orders_v13561',{
            p_store_key:currentStoreKeyV127(),
            p_phone:clean,
            p_limit:pageSize,
            p_offset:offset
          });
          if(error)throw error;
          const next=Array.isArray(data?.rows)?data.rows:[];
          const past=document.getElementById('v13560PastOrders');
          if(past && next.length)past.insertAdjacentHTML('beforeend',renderOrders(next,false));
          offset+=next.length;
          if(offset>=total || next.length===0){
            moreArea.innerHTML='<small class="hint">Todos os pedidos do histórico foram carregados.</small>';
          }else{
            button.disabled=false;
            button.textContent='Carregar mais 30 pedidos';
          }
        }catch(e){
          console.error('Falha ao carregar próxima página da fidelidade:',e);
          button.disabled=false;
          button.textContent='Tentar carregar novamente';
          alert('Não foi possível carregar os próximos pedidos: '+(e?.message||e));
        }
      };
      if(moreArea && offset<total){
        moreArea.innerHTML='<button type="button" class="ghost full" id="v13560LoadMore">Carregar mais 30 pedidos</button>';
        document.getElementById('v13560LoadMore')?.addEventListener('click',loadMore);
      }
    }catch(e){
      console.error('Falha ao carregar histórico da fidelidade:',e);
      host.innerHTML=`<div class="notice bad">Não foi possível carregar os pedidos: ${esc(e?.message||e)}<br><small>Confira se a atualização SQL de desempenho da fidelidade foi instalada no Supabase.</small></div>`;
    }
  };

  function renderOrders(rows,active){
    if(!rows.length)return `<div class="notice">${active?'O ciclo atual ainda não possui pedidos registrados.':'Nenhum pedido anterior encontrado.'}</div>`;
    return `<div class="v1344OrderList">${rows.map(o=>{
      const date=new Date(o.completed_at||o.updated_at||o.created_at);
      const rawNumber=o.store_order_number||o.order_number||'';
      const number=rawNumber?`Pedido #${rawNumber}`:`Pedido ${String(o.id||'').slice(0,8)}`;
      const detail=o.whatsapp_text?`<details class="v13560OrderDetail"><summary>Ver detalhes do pedido</summary><pre>${esc(o.whatsapp_text)}</pre></details>`:'';
      return `<div class="v1344Order"><div class="v13560OrderMain"><b>${esc(number)}</b><small>${Number.isFinite(date.getTime())?date.toLocaleString('pt-BR'):'Data não informada'}</small>${detail}</div><strong>${brl(Number(o.total||0))}</strong></div>`;
    }).join('')}</div>`;
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
        const button=document.createElement('button');button.type='button';button.className='ghost v1344HistoryBtn';button.textContent='Ver pedidos que valeram';button.onclick=()=>openLoyaltyOrdersV1344(c.phone,c.name,c.status.count);editor?.after(button);
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

  const css=document.createElement('style');css.textContent=`.v1344HistoryBtn{width:100%;margin-top:9px}.v1344CycleSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.v1344CycleSummary>div{background:#f5edf8;border-radius:15px;padding:12px;text-align:center}.v1344CycleSummary b,.v1344CycleSummary span{display:block}.v1344CycleSummary b{font-size:21px;color:var(--p)}.v1344CycleSummary span{font-size:11px;color:var(--muted);margin-top:3px}.v1344Order{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 2px;border-bottom:1px solid var(--line)}.v1344Order small{display:block;color:var(--muted);margin-top:3px}.v1344Past{margin-top:15px}.v1344Past summary{cursor:pointer;color:var(--p);font-weight:800;padding:12px;background:#f5edf8;border-radius:14px}.v13560OrderMain{min-width:0;flex:1}.v13560OrderDetail{margin-top:6px}.v13560OrderDetail summary{font-size:12px;color:var(--p);cursor:pointer}.v13560OrderDetail pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:12px;background:#faf8fb;border-radius:8px;padding:8px;margin:6px 0}`;document.head.appendChild(css);
  window.PEDEVIA_VERSION=VERSION;
})();
