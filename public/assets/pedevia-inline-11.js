
// ===== v1.31.4: PAINEL ADMIN DO CLUBE DE FIDELIDADE =====
(function(){

  function loyaltyOfferAdminV1314(){
    normalizeOffers();
    return (cfg.offers||[]).find(o=>o.type==='loyalty')||null;
  }

  function loyaltyStatusTextAdminV1314(count, offer){
    const required=Math.max(1,Number(offer?.requiredOrders||10));
    const reward=Math.max(0,Number(offer?.rewardPercent||10));
    const n=Math.max(0,Number(count||0));
    const progress=n%required;
    const eligible=n>0 && progress===0;
    const remaining=eligible?0:required-progress;
    return {
      count:n,
      required,
      reward,
      progress:eligible?required:progress,
      eligible,
      remaining,
      label:eligible
        ? `Recompensa disponível · ${reward}% OFF`
        : `${progress}/${required} · faltam ${remaining}`
    };
  }

  window.openLoyaltyCustomersAdminV1314=async function(){
    const offer=loyaltyOfferAdminV1314();
    if(!offer){
      alert('Crie primeiro um programa de fidelidade.');
      return;
    }

    showModal(`
      <div class="row">
        <div>
          <h2 style="margin:0">★ Clientes do Clube</h2>
          <div class="hint">${Math.max(1,+offer.requiredOrders||10)} pedidos → ${Math.max(0,+offer.rewardPercent||10)}% de benefício</div>
        </div>
        <button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button>
      </div>
      <div style="margin-top:12px">
        <input id="loyaltyAdminSearchV1314" class="field" placeholder="Buscar cliente ou celular" data-pedevia-event="input" data-pedevia-call="filterLoyaltyCustomersAdminV1314">
      </div>
      <div id="loyaltyAdminSummaryV1314" class="v126StatsGrid" style="margin-top:10px"></div>
      <div id="loyaltyAdminListV1314">
        <div class="panel"><p class="hint">Carregando clientes e progresso...</p></div>
      </div>
    `);

    await loadLoyaltyCustomersAdminV1314();
  };

  window.loadLoyaltyCustomersAdminV1314=async function(){
    const host=document.getElementById('loyaltyAdminListV1314');
    const summary=document.getElementById('loyaltyAdminSummaryV1314');
    if(!host)return;

    const offer=loyaltyOfferAdminV1314();
    try{
      // Usa os pedidos já isolados por estabelecimento apenas para descobrir
      // nome/celular dos clientes. O número oficial da fidelidade vem da RPC
      // get_pedevia_loyalty_status_v127, que é a mesma usada pelo cliente.
      const rows=await fetchAllStoreOrdersV126();
      const map=new Map();

      rows.forEach(o=>{
        const phone=normalizePhoneV127(o.customer_phone||'');
        if(phone.length<10)return;
        const current=map.get(phone);
        const created=safeDateV126(o.created_at);
        if(!current || (created && (!current.lastDate || created>current.lastDate))){
          map.set(phone,{
            phone,
            name:String(o.customer_name||'Cliente').trim()||'Cliente',
            last:o.created_at||'',
            lastDate:created
          });
        }
      });

      const customers=[...map.values()];
      const enriched=[];

      // Lotes pequenos para não disparar muitas consultas simultâneas.
      for(let i=0;i<customers.length;i+=10){
        const batch=customers.slice(i,i+10);
        const results=await Promise.all(batch.map(async c=>{
          let status=null;
          try{status=await getLoyaltyStatusV113(c.phone)}catch(e){}
          const count=Number(status?.order_count||0);
          return {...c,status:loyaltyStatusTextAdminV1314(count,offer)};
        }));
        enriched.push(...results);
      }

      enriched.sort((a,b)=>{
        if(a.status.eligible!==b.status.eligible)return a.status.eligible?-1:1;
        if(a.status.count!==b.status.count)return b.status.count-a.status.count;
        return String(a.name).localeCompare(String(b.name),'pt-BR');
      });

      window.loyaltyCustomersAdminV1314=enriched;

      const withOrders=enriched.filter(c=>c.status.count>0);
      const rewards=enriched.filter(c=>c.status.eligible);

      if(summary){
        summary.innerHTML=`
          <div class="v126Stat"><b>${withOrders.length}</b><small>Clientes no clube</small></div>
          <div class="v126Stat"><b>${withOrders.reduce((s,c)=>s+c.status.count,0)}</b><small>Pedidos contabilizados</small></div>
          <div class="v126Stat"><b>${rewards.length}</b><small>Recompensas disponíveis</small></div>
        `;
      }

      renderLoyaltyCustomersAdminV1314(enriched);

    }catch(e){
      console.error('Falha ao carregar clientes da fidelidade:',e);
      host.innerHTML=`<div class="notice bad">Não foi possível carregar os clientes do Clube de Fidelidade.<br><small>${esc(e.message||e)}</small></div>`;
    }
  };

  window.renderLoyaltyCustomersAdminV1314=function(rows){
    const host=document.getElementById('loyaltyAdminListV1314');
    if(!host)return;

    const list=(rows||[]).filter(c=>c.status.count>0);

    if(!list.length){
      host.innerHTML='<div class="notice">Ainda não há clientes com pedidos contabilizados no Clube de Fidelidade.</div>';
      return;
    }

    host.replaceChildren();
    list.forEach(c=>{
      const s=c.status;
      const width=Math.max(4,Math.min(100,(s.progress/s.required)*100));
      const panel=document.createElement('div');panel.className='panel loyaltyAdminCustomerV1314';panel.dataset.search=String((c.name+' '+c.phone).toLowerCase());Object.assign(panel.style,{padding:'14px',margin:'10px 0'});
      const top=document.createElement('div');top.className='row';top.style.alignItems='flex-start';
      const identity=document.createElement('div');identity.style.minWidth='0';const customer=document.createElement('b');customer.style.fontSize='16px';customer.textContent=c.name;const phone=document.createElement('div');phone.className='hint';phone.textContent=c.phone;identity.append(customer,phone);
      const badge=document.createElement('span');badge.className='badge'+(s.eligible?' available':'');if(!s.eligible)Object.assign(badge.style,{background:'#eee',color:'#555'});badge.textContent=s.eligible?'PRÊMIO DISPONÍVEL':s.progress+'/'+s.required;top.append(identity,badge);
      const progress=document.createElement('div');progress.className='loyaltyProgressBarV115';progress.style.margin='12px 0 6px';const fill=document.createElement('span');fill.style.width=width+'%';progress.append(fill);
      const bottom=document.createElement('div');bottom.className='row';const details=document.createElement('div');const count=document.createElement('b');count.textContent=s.count+' pedido'+(s.count===1?'':'s')+' no clube';const hint=document.createElement('div');hint.className='hint';hint.textContent=s.eligible?s.reward+'% de desconto disponível no próximo pedido':'Faltam '+s.remaining+' pedido'+(s.remaining===1?'':'s')+' para '+s.reward+'% OFF';details.append(count,hint);bottom.append(details);
      if(c.last){const last=document.createElement('small');last.className='hint';last.style.textAlign='right';const date=new Date(c.last);last.append('Último pedido',document.createElement('br'),Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'-');bottom.append(last)}
      panel.append(top,progress,bottom);host.append(panel);
    });
  };

  window.filterLoyaltyCustomersAdminV1314=function(){
    const q=String(document.getElementById('loyaltyAdminSearchV1314')?.value||'').trim().toLowerCase();
    document.querySelectorAll('.loyaltyAdminCustomerV1314').forEach(el=>{
      el.style.display=!q || String(el.dataset.search||'').includes(q)?'':'none';
    });
  };

  // Mantém a tela de Ofertas já existente e acrescenta o acesso ao acompanhamento.
  adminOffers=function(){
    normalizeOffers();
    let list=cfg.offers.map(o=>`<div class="offerAdminCard"><div class="row"><div><span class="offerType">${o.type==='percentage'?'DESCONTO':'FIDELIDADE'}</span><h3 style="margin:5px 0 3px">${esc(o.title)}</h3><div class="hint">${o.type==='percentage'?`${+o.percent||0}% · ${esc(offerScopeText(o))}${+o.minValue?' · mínimo '+brl(+o.minValue):''}`:`${o.requiredOrders||10} pedidos → ${o.rewardPercent||10}% de benefício`}</div></div><span class="badge ${o.active?'available':'hidden'}">${o.active?'Ativa':'Inativa'}</span></div><div class="miniBtns" style="margin-top:10px"><button class="ghost" onclick="editOffer('${o.id}')">Editar</button>${o.type==='loyalty'?`<button class="ghost" data-pedevia-event="click" data-pedevia-call="openLoyaltyCustomersAdminV1314">Clientes do clube</button>`:''}<button class="ghost" onclick="toggleOffer('${o.id}')">${o.active?'Desativar':'Ativar'}</button><button class="dangerBtn" onclick="deleteOffer('${o.id}')">Excluir</button></div></div>`).join('')||'<div class="emptySection">Nenhuma oferta criada ainda.</div>';

    $('#adminContent').innerHTML=`<div class="panel"><div class="menuBuilderHead"><div><h3 style="margin:0">Ofertas</h3><div class="hint">Crie promoções que aparecem no cardápio e podem alterar o total do pedido.</div></div></div><div class="two"><button class="btn" onclick="newOffer('percentage')">＋ Desconto</button><button class="ghost" onclick="newOffer('loyalty')">★ Fidelidade</button></div>${list}<div class="notice">Descontos percentuais ativos são aplicados automaticamente no carrinho. Se houver mais de um válido, o sistema usa o que dá o maior desconto.</div></div>`;
  };

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.49');
      }
    });
  },1200);

})();
