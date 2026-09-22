
// ===== v1.32.6: NORMALIZAÇÃO REAL DAS CONFIGURAÇÕES DE PEDIDOS DOS TENANTS =====
(function(){
  window.PEDEVIA_VERSION='1.32.53';

  function normalizeTenantOrderConfigV1326(){
    cfg.store=cfg.store||{};
    cfg.store.modes=Object.assign({delivery:true,pickup:true,dinein:true},cfg.store.modes||{});
    cfg.store.payments=Object.assign({
      pix:true,cash:true,debit:true,credit:true,mealVoucher:false,foodVoucher:false
    },cfg.store.payments||{});

    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    const defaults={
      deliveryTime:'',
      deliveryArea:'',
      deliveryCalc:'neighborhood',
      deliveryFixedFee:Number(cfg.store.deliveryFee||0),
      allowOutside:false,
      outsideMaxFee:0,
      pickupTime:40,
      pickupPrepaid:false,
      dineinTableRequired:false,
      requireCpf:false,
      referenceCodes:false,
      showOrderNumber:false,
      receiptPrinting:false,
      panelAlerts:true,
      orderPrefix:'PD',
      nextOrder:1,
      alertVolume:.65,
      printWidth:'80',
      whatsAppStatusMessages:true
    };
    Object.keys(defaults).forEach(k=>{
      if(o[k]===undefined || o[k]===null)o[k]=defaults[k];
    });

    // O v0.6 normalizava bairros apenas no boot do Point, antes do tenant ser
    // carregado. Lojas clientes novas podiam chegar aqui sem neighborhoods.
    // Tenant começa vazio; nunca herdamos bairros/taxas do Point.
    if(!Array.isArray(o.neighborhoods))o.neighborhoods=[];

    if(!o.paymentMeta || typeof o.paymentMeta!=='object')o.paymentMeta={};
    ['pix','cash','debit','credit','mealVoucher','foodVoucher'].forEach(k=>{
      o.paymentMeta[k]=Object.assign(
        {feeType:'none',fee:0,askBrand:false},
        o.paymentMeta[k]||{}
      );
    });

    if(!o.statusMessages || typeof o.statusMessages!=='object')o.statusMessages={};
    return o;
  }
  window.normalizeTenantOrderConfigV1326=normalizeTenantOrderConfigV1326;

  // Normaliza toda vez que a tela é aberta, inclusive lojas antigas já salvas.
  const baseOrderSettingsV1326=window.adminOrderSettings;
  window.adminOrderSettings=function(){
    normalizeTenantOrderConfigV1326();
    return baseOrderSettingsV1326.apply(this,arguments);
  };

  // E normaliza assim que qualquer tenant é carregado, para as demais telas
  // de pedido receberem a mesma estrutura.
  if(typeof window.applyTenantConfigV121==='function'){
    const baseApplyTenantV1326=window.applyTenantConfigV121;
    window.applyTenantConfigV121=function(row){
      const r=baseApplyTenantV1326.apply(this,arguments);
      normalizeTenantOrderConfigV1326();
      return r;
    };
  }

  // Substitui a tentativa da v1.32.5: sem MutationObserver recursivo e sem
  // empilhar mensagens de erro.
  let openingV1326=false;
  window.openOrderSettingsV1325=window.openOrderSettingsV1326=function(){
    if(openingV1326)return false;
    openingV1326=true;
    try{
      window.adminTab='orders';
      window.adminOrdersView='config';
      normalizeTenantOrderConfigV1326();
      window.adminOrderSettings();
      return true;
    }catch(err){
      console.error('Falha ao abrir configurações de pedidos:',err);
      const host=document.getElementById('adminContent');
      if(host){
        const old=host.querySelector('.orderSettingsErrorV1326');
        if(old)old.remove();
        const box=document.createElement('div');
        box.className='notice bad orderSettingsErrorV1326';
        box.innerHTML='<b>Não foi possível abrir as configurações de pedidos.</b><br><small>'+esc(err?.message||String(err))+'</small>';
        host.prepend(box);
      }
      return false;
    }finally{
      openingV1326=false;
    }
  };

  // A engrenagem profissional recebe chamada direta, sem passar por
  // adminOrdersView/adminOrders.
  function wireV1326(){
    const host=document.getElementById('adminContent');
    if(!host)return;
    const head=host.querySelector('.v130OrdersHead .v130HeadBtns');
    if(!head)return;
    const gear=[...head.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='⚙');
    if(gear){
      gear.removeAttribute('onclick');
      gear.type='button';
      gear.setAttribute('aria-label','Configurações de pedidos');
      gear.onclick=function(e){
        e?.preventDefault?.();
        e?.stopPropagation?.();
        return window.openOrderSettingsV1326();
      };
    }
  }

  // O renderOrders é o ponto estável da interface mostrada no celular.
  if(window.PedeviaV130 && typeof window.PedeviaV130.renderOrders==='function'){
    const baseRenderV1326=window.PedeviaV130.renderOrders;
    window.PedeviaV130.renderOrders=function(){
      const r=baseRenderV1326.apply(this,arguments);
      wireV1326();
      return r;
    };
  }
  setTimeout(wireV1326,0);

  window.PEDEVIA_ORDER_SETTINGS_FIX_V1326={
    tenantOrderConfigNormalized:true,
    neighborhoodsSafe:true,
    recursiveErrorLoopRemoved:true,
    directGear:true,
    appliesToPoint:true,
    appliesToTenants:true
  };
})();
