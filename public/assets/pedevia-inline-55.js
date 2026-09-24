// ===== Pedevia v1.32.59: NAVEGAÇÃO ESTÁVEL + FLUXO SIMPLES DE PEDIDOS =====
(function(){
  window.PEDEVIA_VERSION='1.32.59';

  // A navegação inferior sempre reabre a tela solicitada, mesmo quando um
  // subpainel deixou adminTab apontando para a mesma aba.
  function navigateAdminV13258(tab){
    const target=String(tab||'home');
    adminOrdersView='main';
    if(target==='orders')ordersTabV126='active';
    if(target==='menu')adminSubTab='products';
    adminTab=target;
    renderAdmin();
  }
  window.navigateAdminV13258=navigateAdminV13258;

  document.addEventListener('click',function(ev){
    const button=ev.target?.closest?.('#adminBottomNav button');
    if(!button)return;
    const nav=document.getElementById('adminBottomNav');
    const index=[...(nav?.querySelectorAll('button')||[])].indexOf(button);
    const tab=adminTabs?.[index]?.[0];
    if(!tab)return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    navigateAdminV13258(tab);
  },true);

  // Aceite automático: todo pedido ativo oferece somente Concluir. O SQL desta
  // versão também grava pedidos novos diretamente como accepted.
  if(window.PedeviaV130){
    PedeviaV130.orderNext=function(status){
      if(['new','accepted','preparing','ready'].includes(status))return 'completed';
      return '';
    };
    PedeviaV130.nextLabel=function(status){
      return ['new','accepted','preparing','ready'].includes(status)?'Concluir pedido':'';
    };

    PedeviaV130.loadBoard=async function(){
      const host=document.getElementById('ordersListV130');if(!host)return;
      try{
        const rows=await fetchOrdersV125();window.pedeviaOrdersV125=rows;
        const active=rows.filter(o=>!['completed','cancelled'].includes(o.status));
        const completedToday=rows.filter(o=>o.status==='completed'&&new Date(o.completed_at||o.updated_at).toDateString()===new Date().toDateString());
        const revenue=completedToday.reduce((a,o)=>a+(+o.total||0),0);
        const groups=[
          {label:'Pedidos aceitos',emoji:'✓',list:active}
        ];
        const cols=groups.map(g=>`<section class="v130OrderCol"><header><span>${g.emoji} ${g.label}</span><b>${g.list.length}</b></header><div>${g.list.length?g.list.map(o=>this.orderCard(o)).join(''):'<div class="v130Empty">Nenhum pedido</div>'}</div></section>`).join('');
        host.innerHTML=`<div class="v130Today"><div><b>${completedToday.length}</b><span>concluídos hoje</span></div><div><b>${brl(revenue)}</b><span>faturamento hoje</span></div><div><b>${active.length}</b><span>em andamento</span></div></div><div class="v130Board v13258SimpleBoard">${cols}</div>`;
        this.refreshOrderBadge(rows.filter(o=>o.status==='new').length);
      }catch(e){host.innerHTML=`<div class="notice bad">Não foi possível carregar os pedidos: ${esc(e.message||e)}</div>`}
    };
  }

  // No modal de detalhes também ficam somente Aceito e Concluído.
  const viewOrderBaseV13258=viewOrderV125;
  viewOrderV125=function(id){
    const result=viewOrderBaseV13258.apply(this,arguments);
    const order=(window.pedeviaOrdersV125||[]).find(o=>String(o.id)===String(id));
    setTimeout(()=>{
      const select=document.getElementById('orderStatusV125');
      if(!select)return;
      select.innerHTML='<option value="accepted">Aceito</option><option value="completed">Concluído</option>';
      select.value=order?.status==='completed'?'completed':'accepted';
    },0);
    return result;
  };

  const style=document.createElement('style');
  style.id='pedeviaSimpleOrdersV13258';
  style.textContent='.v130Board.v13258SimpleBoard{grid-template-columns:repeat(2,minmax(0,1fr))!important}@media(max-width:760px){.v130Board.v13258SimpleBoard{grid-template-columns:1fr!important}}';
  document.head.appendChild(style);

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.59');
    });
  },1600);
})();
