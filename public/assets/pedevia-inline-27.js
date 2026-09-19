
// ===== v1.32.5: ROTA DIRETA E DEFINITIVA PARA CONFIGURAÇÕES DE PEDIDOS =====
(function(){
  window.PEDEVIA_VERSION='1.32.51';

  // A tela profissional v1.30 recria o cabeçalho de Pedidos. Em tenants,
  // depender da cadeia histórica adminOrdersView -> adminOrders estava deixando
  // a engrenagem sem efeito. A partir daqui a engrenagem chama diretamente
  // a tela real de configurações já existente.
  window.openOrderSettingsV1325=function(){
    try{
      window.adminTab='orders';
      window.adminOrdersView='config';

      if(typeof window.adminOrderSettings!=='function'){
        throw new Error('adminOrderSettings não está disponível.');
      }

      window.adminOrderSettings();

      const host=document.getElementById('adminContent');
      if(!host || !/Configurações de pedidos/i.test(host.textContent||'')){
        throw new Error('A tela de configurações não foi renderizada.');
      }
      return true;
    }catch(err){
      console.error('Falha ao abrir configurações de pedidos:',err);
      const host=document.getElementById('adminContent');
      if(host){
        host.insertAdjacentHTML('afterbegin',
          '<div class="notice bad"><b>Não foi possível abrir as configurações de pedidos.</b></div>');
      }
      return false;
    }
  };

  function isOrdersScreenV1325(){
    const host=document.getElementById('adminContent');
    if(!host)return false;
    return !!host.querySelector('.v130OrdersHead') ||
           /^Pedidos\b/i.test((host.querySelector('h2')?.textContent||'').trim());
  }

  function wireOrderSettingsV1325(){
    const host=document.getElementById('adminContent');
    if(!host || !isOrdersScreenV1325())return;

    const head=host.querySelector('.v130HeadBtns');
    if(head){
      const gear=[...head.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='⚙');
      if(gear){
        // Remove a dependência do onclick inline/cadeia de overrides.
        gear.removeAttribute('onclick');
        gear.type='button';
        gear.setAttribute('aria-label','Configurações de pedidos');
        gear.setAttribute('title','Configurações de pedidos');
        gear.onclick=window.openOrderSettingsV1325;
      }
    }

    // Também cobre versões antigas do cabeçalho que mostram "⚙ Configurar".
    [...host.querySelectorAll('button')].forEach(btn=>{
      if(/^⚙\s*Configurar$/i.test((btn.textContent||'').trim())){
        btn.removeAttribute('onclick');
        btn.type='button';
        btn.onclick=window.openOrderSettingsV1325;
      }
    });
  }

  // Corrige imediatamente e após qualquer renderização da área administrativa.
  const observer=new MutationObserver(()=>wireOrderSettingsV1325());
  observer.observe(document.getElementById('adminContent')||document.body,{childList:true,subtree:true});
  setTimeout(wireOrderSettingsV1325,0);

  // Corrige na fonte a renderização profissional v1.30.
  if(window.PedeviaV130 && typeof window.PedeviaV130.renderOrders==='function'){
    const baseRenderOrdersV1325=window.PedeviaV130.renderOrders;
    window.PedeviaV130.renderOrders=function(){
      const r=baseRenderOrdersV1325.apply(this,arguments);
      wireOrderSettingsV1325();
      return r;
    };
  }

  // Delegação final em capture: mesmo que algum código antigo volte a escrever
  // onclick no botão, o clique da engrenagem é interceptado antes.
  document.addEventListener('click',function(ev){
    const btn=ev.target?.closest?.('button');
    if(!btn || !isOrdersScreenV1325())return;
    const txt=(btn.textContent||'').trim();
    const title=(btn.getAttribute('title')||'').toLowerCase();
    const aria=(btn.getAttribute('aria-label')||'').toLowerCase();
    if(txt==='⚙' || /^⚙\s*Configurar$/i.test(txt) ||
       title==='configurações de pedidos' || aria==='configurações de pedidos'){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      window.openOrderSettingsV1325();
    }
  },true);

  window.PEDEVIA_ORDER_SETTINGS_FIX_V1325={
    directRoute:true,
    captureFallback:true,
    appliesToPoint:true,
    appliesToTenants:true
  };
})();
