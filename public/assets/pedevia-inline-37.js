
// ===== v1.32.24: CORREÇÃO DE NAVEGAÇÃO DO ADMIN =====
(function(){
  window.PEDEVIA_VERSION='1.33.0';

  // Há camadas históricas que escreveram window.adminTab/window.adminOrdersView,
  // enquanto o núcleo usa bindings globais `let`. Esta camada usa diretamente
  // o estado real do núcleo e impede que os dois estados voltem a divergir.
  function goAdminV13224(tab){
    const target=String(tab||'home');

    // Tocar novamente em Ofertas (ou em outra aba já aberta) não deve reconstruir
    // a tela e causar o flash visual observado no celular.
    if(target===adminTab && target!=='orders') return false;

    if(target==='orders'){
      // O botão inferior Pedidos é sempre a "raiz" de Pedidos.
      adminOrdersView='main';
      ordersTabV126='active';
    }else{
      // Nunca carregamos subestado de Pedidos para outra aba.
      adminOrdersView='main';
    }

    adminTab=target;
    renderAdmin();
    return true;
  }
  window.goAdminV13224=goAdminV13224;

  function wireBottomNavV13224(){
    const nav=document.getElementById('adminBottomNav');
    if(!nav)return;
    const buttons=[...nav.querySelectorAll('button')];
    buttons.forEach((b,i)=>{
      const tab=adminTabs?.[i]?.[0];
      if(!tab)return;
      b.removeAttribute('onclick');
      b.onclick=function(ev){
        ev?.preventDefault?.();
        ev?.stopPropagation?.();
        goAdminV13224(tab);
      };
    });
  }

  // Render principal: depois de qualquer reconstrução, liga a navegação estável.
  const renderAdminBaseV13224=renderAdmin;
  renderAdmin=function(){
    const r=renderAdminBaseV13224.apply(this,arguments);
    wireBottomNavV13224();
    return r;
  };

  // Configurações de pedidos: o Voltar passa a alterar o MESMO estado usado
  // por adminOrders(), sem depender de atributo onclick ou de window.* paralelo.
  const adminOrderSettingsBaseV13224=adminOrderSettings;
  adminOrderSettings=function(){
    const r=adminOrderSettingsBaseV13224.apply(this,arguments);
    const host=document.getElementById('adminContent');
    const back=host?.querySelector('.backBtn');
    if(back && /Voltar para Pedidos/i.test(back.textContent||'')){
      back.removeAttribute('onclick');
      back.type='button';
      back.onclick=function(ev){
        ev?.preventDefault?.();
        ev?.stopPropagation?.();
        adminTab='orders';
        adminOrdersView='main';
        ordersTabV126='active';
        renderAdmin();
      };
    }
    wireBottomNavV13224();
    return r;
  };

  // Engrenagem/configuração também passa a escrever o estado real do núcleo.
  window.openOrderSettingsV1325=window.openOrderSettingsV1326=function(){
    try{
      adminTab='orders';
      adminOrdersView='config';
      if(typeof normalizeTenantOrderConfigV1326==='function')normalizeTenantOrderConfigV1326();
      adminOrderSettings();
      return true;
    }catch(err){
      console.error('Falha ao abrir configurações de pedidos:',err);
      return false;
    }
  };

  // Corrige qualquer navegação já renderizada antes deste patch carregar.
  wireBottomNavV13224();

  function enforceVersionV13224(){
    window.PEDEVIA_VERSION='1.33.0';
    document.querySelectorAll('.adminHead .hint,.hero .hint,.panel .hint').forEach(el=>{
      const t=el.textContent||'';
      if(/Versão\s+1\.\d+(?:\.\d+)*/i.test(t))
        el.textContent=t.replace(/Versão\s+1\.\d+(?:\.\d+)*/i,'Versão 1.33.0');
    });
  }
  [0,700,1600,3000,5200].forEach(ms=>setTimeout(enforceVersionV13224,ms));
})();
