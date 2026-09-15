
// ===== v1.32.13: REMOÇÃO DEFINITIVA DE ZONAS DE ENTREGA POR KM =====
(function(){
  window.PEDEVIA_VERSION='1.32.48';

  function sanitizeDeliveryV13213(){
    if(!window.cfg || !cfg.store) return;
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});

    // Migra automaticamente qualquer loja que estava em "área/km" para uma opção estável.
    if(o.deliveryCalc==='area' || o.deliveryCalc==='distance' || o.deliveryCalc==='zones_km'){
      o.deliveryCalc = (Array.isArray(o.deliveryNeighborhoods) && o.deliveryNeighborhoods.length) ? 'neighborhood' : 'fixed';
    }

    // Campos experimentais de zona/km deixam de participar da configuração.
    delete o.deliveryZonesKm;
    delete o.deliveryDistanceZones;
    delete o.allowOutside;
    delete o.maxDeliveryFee;

    // Cache experimental de geocodificação/rota também é descartado.
    delete cfg.store.deliveryOriginCoords;
  }

  function hideKmZoneUIV13213(root=document){
    const needles=[
      'zonas de entrega por km','zonas por distância','configurar zonas',
      'crie faixas como até 1 km','faixas de distância','taxa por distância'
    ];
    root.querySelectorAll('label,button,.card,.settingCard,.adminCard,.choice,.option,.row,div').forEach(el=>{
      const t=(el.innerText||'').trim().toLowerCase();
      if(!t || t.length>500) return;
      if(needles.some(n=>t.includes(n))){
        const candidate=el.closest('label,.card,.settingCard,.adminCard,.choice,.option')||el;
        candidate.style.display='none';
        candidate.setAttribute('data-pedevia-removed-km-zones','1');
      }
    });
  }

  const oldEnsure=window.ensureDeliveryZonesV1327;
  window.ensureDeliveryZonesV1327=function(){
    sanitizeDeliveryV13213();
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    return o;
  };

  // Se alguma camada histórica tentar abrir o configurador por km, não executa.
  window.openDeliveryZonesV1327=function(){
    sanitizeDeliveryV13213();
    if(typeof window.openOrderSettings==='function') return window.openOrderSettings();
  };
  window.renderDeliveryZonesV1327=function(){ return ''; };
  window.saveDeliveryZonesV1327=function(){ sanitizeDeliveryV13213(); try{save()}catch(_){} };

  // O checkout volta aos modos estáveis já existentes: taxa fixa ou lista de bairros.
  const previousDelivery=window.saveDeliveryAndPay;
  window.saveDeliveryAndPay=async function(){
    sanitizeDeliveryV13213();
    return previousDelivery();
  };

  // Evita reaparecimento da opção quando telas administrativas são renderizadas novamente.
  const obs=new MutationObserver(()=>hideKmZoneUIV13213());
  function boot(){
    sanitizeDeliveryV13213();
    hideKmZoneUIV13213();
    if(document.body)obs.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();

  // Persistência da migração ocorre no próximo salvamento normal da loja.
})();
