/* Pedevia v1.35.60 — Clientes do Clube mais leve.
   - Lista de clientes: 1 consulta no banco (RPC) em vez de baixar todos os pedidos + 1 consulta por cliente.
   - Lista paginada (30 por vez, com busca em todos os clientes).
   - Histórico de um cliente: só os pedidos concluídos daquele celular, 30 por vez.
   - Se o SQL 1.35.60 ainda não foi instalado no Supabase, usa o caminho antigo, porém já "enxuto"
     (baixa só as colunas necessárias, não a tabela inteira). */
(function(){
  'use strict';
  const VERSION='1.35.60';
  const PAGE=30;
  const digits=v=>String(v||'').replace(/\D/g,'');
  const key=()=>String(typeof currentStoreKeyV127==='function'?currentStoreKeyV127():'point-frontin');
  const offerNow=()=>{try{return activeLoyaltyOfferV113()}catch(_e){return null}};
  const cycleOf=(count,offer)=>{
    if(typeof window.pedeviaLoyaltyCycleV13559==='function')return window.pedeviaLoyaltyCycleV13559(count,offer);
    const total=Math.max(0,Number(count||0)),required=Math.max(1,Number(offer?.requiredOrders||10));
    const reward=Math.max(0,Number(offer?.rewardPercent||10)),progress=total%required;
    return {total,required,reward,progress,cycles:Math.floor(total/required),type:'percent',eligible:progress===required-1,remaining:required-progress};
  };
  const isMissing=e=>{
    const m=String(e?.message||e||'');
    return e?.code==='PGRST202'||e?.code==='42883'||/could not find the function|function .* does not exist|schema cache/i.test(m);
  };
  const phaseText=s=>s.type==='cup'?'🥤 copo de 500ml':'🏷️ '+s.reward+'% de desconto';

  let sqlMissing=false;
  let fastActive=false;
  const view={rows:[],shown:PAGE,query:''};

  // ---------- Caminho antigo, mas enxuto ----------
  async function leanFetchOrders(){
    const k=String(typeof currentStoreKeyV125==='function'?currentStoreKeyV125():key()),all=[],page=1000,maxPages=20;
    for(let p=0;p<maxPages;p++){
      const {data,error}=await supabaseClient.from('pedevia_orders').select('customer_phone,customer_name,created_at').eq('store_key',k).order('created_at',{ascending:false}).range(p*page,p*page+page-1);
      if(error)throw error;
      const rows=Array.isArray(data)?data:[];all.push(...rows);
      if(rows.length<page)break;
    }
    return all;
  }
  const legacyLoad=window.loadLoyaltyCustomersAdminV1314;
  const legacyFilter=window.filterLoyaltyCustomersAdminV1314;
  const legacyOrders=window.openLoyaltyOrdersV1344;

  async function runLegacyLoad(self,args){
    fastActive=false;
    if(typeof legacyLoad!=='function')return;
    const full=fetchAllStoreOrdersV126;
    fetchAllStoreOrdersV126=leanFetchOrders;
    try{return await legacyLoad.apply(self,args)}
    finally{fetchAllStoreOrdersV126=full}
  }

  // ---------- Lista de clientes (rápida) ----------
  function buildRows(arr,offer){
    return arr.map(r=>{
      const s=cycleOf(r.order_count,offer);
      const phone=digits(r.phone);
      return {
        phone,
        loyaltyPhone:digits(r.loyalty_phone||phone),
        name:String(r.name||'Cliente'),
        last:r.last_order_at||'',
        status:{count:s.total,required:s.required,reward:s.reward,progress:s.progress,eligible:s.eligible,remaining:s.remaining,
          label:s.eligible?'Este pedido ganha prêmio':s.progress+'/'+s.required}
      };
    });
  }
  function renderSummary(rows,offer){
    const summary=document.getElementById('loyaltyAdminSummaryV1314');
    if(!summary)return;
    const st=rows.map(c=>cycleOf(c.status.count,offer));
    const active=st.filter(s=>s.progress>0),ready=st.filter(s=>s.eligible);
    summary.innerHTML=`<div class="v126Stat"><b>${active.length}</b><small>clientes no ciclo</small></div><div class="v126Stat"><b>${active.reduce((n,s)=>n+s.progress,0)}</b><small>pedidos no ciclo atual</small></div><div class="v126Stat"><b>${ready.length}</b><small>próximos pedidos com prêmio</small></div>`;
  }
  function renderView(){
    const host=document.getElementById('loyaltyAdminListV1314');
    if(!host)return;
    const q=view.query;
    const all=q?view.rows.filter(c=>(c.name+' '+c.phone).toLowerCase().includes(q)):view.rows;
    const slice=all.slice(0,view.shown);
    window.loyaltyCustomersAdminV1314=view.rows;
    window.renderLoyaltyCustomersAdminV1314(slice);
    if(!slice.length&&q)host.innerHTML='<div class="notice">Nenhum cliente encontrado para essa busca.</div>';
    if(all.length>slice.length){
      const btn=document.createElement('button');
      btn.type='button';btn.className='ghost loyaltyMoreV13560';btn.style.width='100%';btn.style.margin='6px 0 12px';
      btn.textContent=`Carregar mais (${all.length-slice.length} restantes)`;
      btn.onclick=()=>{view.shown+=PAGE;renderView()};
      host.appendChild(btn);
    }
  }

  window.loadLoyaltyCustomersAdminV1314=async function(){
    const host=document.getElementById('loyaltyAdminListV1314');
    if(!host)return;
    if(!sqlMissing){
      try{
        const {data,error}=await supabaseClient.rpc('list_pedevia_loyalty_customers_v13560',{p_store_key:key()});
        if(error)throw error;
        const offer=offerNow();
        view.rows=buildRows(Array.isArray(data)?data:[],offer);
        view.shown=PAGE;
        view.query=String(document.getElementById('loyaltyAdminSearchV1314')?.value||'').trim().toLowerCase();
        fastActive=true;
        renderSummary(view.rows,offer);
        renderView();
        return;
      }catch(e){
        if(isMissing(e)){sqlMissing=true;console.warn('Instale o SQL 1.35.60 no Supabase para a lista do clube carregar mais rápido.')}
        else console.warn('Consulta rápida do clube falhou; usando o método antigo:',e);
      }
    }
    const r=await runLegacyLoad(this,arguments);
    if(sqlMissing&&host.isConnected&&!document.getElementById('loyaltyLegacyHintV13560')){
      const hint=document.createElement('div');
      hint.id='loyaltyLegacyHintV13560';hint.className='hint';hint.style.margin='8px 0';
      hint.textContent='Dica: instale o SQL 1.35.60 no Supabase para esta lista carregar bem mais rápido.';
      host.before(hint);
    }
    return r;
  };

  let filterTimer=0;
  window.filterLoyaltyCustomersAdminV1314=function(){
    if(!fastActive){return typeof legacyFilter==='function'?legacyFilter.apply(this,arguments):undefined}
    clearTimeout(filterTimer);
    filterTimer=setTimeout(()=>{
      view.query=String(document.getElementById('loyaltyAdminSearchV1314')?.value||'').trim().toLowerCase();
      view.shown=PAGE;
      renderView();
    },180);
  };

  // ---------- Histórico de pedidos de um cliente ----------
  const money=v=>{try{return brl(Number(v||0))}catch(_e){return 'R$ '+Number(v||0).toFixed(2)}};
  function orderRows(rows){
    if(!rows.length)return '<div class="notice">Nenhum pedido encontrado.</div>';
    return `<div class="v1344OrderList">${rows.map(o=>{
      const date=new Date(o.completed_at||o.updated_at||o.created_at);
      const num=typeof orderNumberV125==='function'?orderNumberV125(o):String(o.store_order_number||o.order_number||'Pedido');
      return `<div class="v1344Order"><div><b>${esc(num)}</b><small>${Number.isFinite(date.getTime())?date.toLocaleString('pt-BR'):'Data não informada'}</small></div><strong>${money(o.total)}</strong></div>`;
    }).join('')}</div>`;
  }
  async function fetchOrdersPage(phone,offset){
    const {data,error}=await supabaseClient.rpc('list_pedevia_loyalty_orders_v13560',{p_store_key:key(),p_phone:phone,p_limit:PAGE,p_offset:offset});
    if(error)throw error;
    const d=Array.isArray(data)?data[0]:data;
    return {total:Number(d?.total||0),rows:Array.isArray(d?.rows)?d.rows:[]};
  }

  window.openLoyaltyOrdersV1344=async function(phone,name){
    if(sqlMissing)return legacyOrders?legacyOrders.apply(this,arguments):undefined;
    const clean=digits(phone),offer=offerNow();
    showModal(`<div class="row"><div><h2 style="margin:0">Pedidos da fidelidade</h2><div class="hint">${esc(name||'Cliente')} · ${esc(clean)}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="openLoyaltyCustomersAdminV1314">‹</button></div><div id="v1344LoyaltyOrders"><div class="panel">Carregando pedidos contabilizados...</div></div>`);
    const host=document.getElementById('v1344LoyaltyOrders');
    try{
      const [status,first]=await Promise.all([
        getLoyaltyStatusV113(clean).catch(()=>null),
        fetchOrdersPage(clean,0)
      ]);
      const official=status?.order_count!==undefined?Math.max(0,Number(status.order_count||0)):first.total;
      const s=cycleOf(official,offer);
      const rows=first.rows.slice();
      const draw=()=>{
        if(!host.isConnected)return;
        const current=rows.slice(0,s.progress),past=rows.slice(s.progress);
        const remainingPast=Math.max(0,first.total-rows.length);
        host.innerHTML=`<div class="v1344CycleSummary"><div><b>${s.progress}/${s.required}</b><span>ciclo atual</span></div><div><b>${s.cycles}</b><span>cartelas concluídas</span></div><div><b>${first.total}</b><span>pedidos encontrados</span></div></div>
          <div class="hint" style="margin:-4px 0 10px">Cartela atual vale: ${phaseText(s)}</div>
          ${official!==first.total?`<div class="notice">A quantidade oficial é ${official}, mas foram encontrados ${first.total} pedidos concluídos no histórico. Isso pode ocorrer por ajustes manuais ou registros antigos.</div>`:''}
          <h3>Ciclo atual</h3>${current.length?orderRows(current):'<div class="notice">O ciclo atual ainda não possui pedidos.</div>'}
          ${past.length||remainingPast?`<details class="v1344Past"><summary>Ver pedidos de ciclos anteriores (${Math.max(0,first.total-current.length)})</summary>${orderRows(past)}${remainingPast?`<button type="button" class="ghost loyaltyMoreOrdersV13560" style="width:100%;margin-top:10px">Carregar mais (${remainingPast} restantes)</button>`:''}</details>`:''}`;
        const more=host.querySelector('.loyaltyMoreOrdersV13560');
        if(more)more.onclick=async()=>{
          more.disabled=true;more.textContent='Carregando...';
          try{
            const next=await fetchOrdersPage(clean,rows.length);
            if(!next.rows.length){first.total=rows.length}else rows.push(...next.rows);
            draw();
            const det=host.querySelector('.v1344Past');if(det)det.open=true;
          }catch(e){more.disabled=false;more.textContent='Tentar de novo';console.error(e)}
        };
      };
      draw();
    }catch(e){
      if(isMissing(e)){sqlMissing=true;return legacyOrders?legacyOrders.call(this,phone,name):undefined}
      host.innerHTML=`<div class="notice bad">Não foi possível carregar os pedidos: ${esc(e?.message||e)}</div>`;
    }
  };

  window.PEDEVIA_VERSION=VERSION;
})();
