
// ===== v1.32.3: CONFIGURAÇÕES DE PEDIDOS TAMBÉM PARA ADMINISTRADORES DAS LOJAS =====
(function(){
  window.PEDEVIA_VERSION='1.32.54';

  // Abre a configuração pelo mesmo fluxo usado pelo painel principal.
  // Não depende de ser Point ou tenant; a persistência continua sendo roteada
  // pelas funções multi-tenant já existentes.
  window.openOrderSettingsV1323=function(){
    try{
      window.adminOrdersView='config';
      window.adminTab='orders';

      if(typeof window.adminOrders==='function'){
        window.adminOrders();
      }else if(typeof window.renderAdmin==='function'){
        window.renderAdmin();
      }else{
        throw new Error('Tela de configurações de pedidos indisponível.');
      }
    }catch(err){
      console.error('Falha ao abrir configurações de pedidos:',err);
      if(typeof window.showToast==='function'){
        window.showToast('Não foi possível abrir as configurações de pedidos.','bad');
      }
    }
  };

  // Corrige o botão engrenagem após qualquer renderização do painel de pedidos.
  function bindOrderGearV1323(){
    const host=document.getElementById('adminContent');
    if(!host)return;
    const buttons=[...host.querySelectorAll('button')];
    buttons.forEach(btn=>{
      const txt=(btn.textContent||'').trim();
      const aria=(btn.getAttribute('aria-label')||'').toLowerCase();
      const title=(btn.getAttribute('title')||'').toLowerCase();

      // Engrenagem do cabeçalho de Pedidos / botão Configurar.
      if(txt==='⚙' || /^⚙\s*configurar/i.test(txt) ||
         aria.includes('configura') && aria.includes('pedido') ||
         title.includes('configura') && title.includes('pedido')){
        btn.onclick=function(ev){
          ev?.preventDefault?.();
          ev?.stopPropagation?.();
          window.openOrderSettingsV1323();
          return false;
        };
      }
    });
  }

  const obs=new MutationObserver(()=>bindOrderGearV1323());
  obs.observe(document.getElementById('adminContent')||document.body,{childList:true,subtree:true});
  bindOrderGearV1323();

  // Reforça adminOrders sem duplicar a tela: quando view=config,
  // chama diretamente a tela de configuração existente.
  const baseAdminOrdersV1323=window.adminOrders;
  if(typeof baseAdminOrdersV1323==='function'){
    window.adminOrders=function(){
      if(window.adminOrdersView==='config' && typeof window.adminOrderSettings==='function'){
        return window.adminOrderSettings();
      }
      const r=baseAdminOrdersV1323.apply(this,arguments);
      queueMicrotask(bindOrderGearV1323);
      return r;
    };
  }

  window.PEDEVIA_ORDER_SETTINGS_FIX_V1323={
    appliesToPoint:true,
    appliesToTenants:true
  };
})();
