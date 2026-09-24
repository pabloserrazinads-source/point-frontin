
// ===== v1.32.14: ENTREGA SIMPLIFICADA + ENDEREÇO ÚNICO E CONSISTENTE =====
(function(){
  window.PEDEVIA_VERSION='1.32.59';

  function clean(v){ return String(v??'').trim(); }
  function storeAddressV13214(){
    const st=(window.cfg&&cfg.store)||{};
    const candidates=[
      st.address, st.addressDisplay, st.displayAddress, st.fullAddress,
      st.addressText, st.locationAddress,
      st.location&&st.location.address,
      st.addressConfig&&st.addressConfig.display,
      st.addressConfig&&st.addressConfig.address
    ];
    return clean(candidates.find(v=>clean(v))||'');
  }
  window.getPedeviaStoreAddress=storeAddressV13214;

  function removeObsoleteDeliveryModesV13214(){
    if(!window.cfg||!cfg.store)return;
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    if(['area','distance','zones_km'].includes(clean(o.deliveryCalc).toLowerCase())){
      o.deliveryCalc=(Array.isArray(o.deliveryNeighborhoods)&&o.deliveryNeighborhoods.length)?'neighborhood':'fixed';
    }
    delete o.deliveryAreas;
    delete o.deliveryDistance;
    delete o.distanceRates;
    delete o.deliveryZonesKm;
    delete o.deliveryDistanceZones;
  }

  function hideObsoleteDeliveryUIV13214(root=document){
    const texts=['taxa por áreas de entrega','taxa por areas de entrega','taxa por distância (km)','taxa por distancia (km)'];
    root.querySelectorAll('label,.card,.settingCard,.adminCard,.choice,.option,.radioCard,.delivery-option,div').forEach(el=>{
      const t=clean(el.innerText).toLowerCase();
      if(!t||t.length>260)return;
      if(texts.some(x=>t.includes(x))){
        let box=el.closest('label,.card,.settingCard,.adminCard,.choice,.option,.radioCard,.delivery-option')||el;
        box.style.display='none';
        box.setAttribute('data-pedevia-obsolete-delivery','1');
      }
    });
  }

  function refreshAddressEverywhereV13214(root=document){
    const addr=storeAddressV13214();
    if(!addr)return;

    // Menus/cartões que exibiam "Endereço não informado".
    root.querySelectorAll('*').forEach(el=>{
      if(el.children.length) return;
      const t=clean(el.textContent).toLowerCase();
      if(t==='endereço não informado'||t==='endereco não informado'||t==='não informado'){
        // Evita trocar "Não informado" de campos sem relação com endereço.
        const parent=el.parentElement;
        const context=clean(parent?.innerText).toLowerCase();
        if(t!=='não informado'||context.includes('endereço')||context.includes('endereco')){
          el.textContent=addr;
        }
      }
    });

    // Linha "Endereço" no menu Mais: coloca resumo abaixo, igual Contato/Redes.
    root.querySelectorAll('*').forEach(el=>{
      if(el.children.length) return;
      const t=clean(el.textContent).toLowerCase();
      if(t!=='endereço'&&t!=='endereco') return;
      const row=el.closest('button,.card,.settingCard,.adminCard,.menuItem,.moreItem,.row,div');
      if(!row) return;
      const all=clean(row.innerText).toLowerCase();
      if(all.length>120||all.includes('endereço de entrega'))return;
      let sub=[...row.querySelectorAll('small,.muted,.sub,.subtitle,p')].find(x=>x!==el);
      if(sub){ sub.textContent=addr; }
      else if(row.children.length<8){
        const d=document.createElement('div');
        d.className='muted pedevia-address-summary';
        d.style.cssText='font-size:.95em;margin-top:2px;';
        d.textContent=addr;
        (el.parentElement||row).appendChild(d);
      }
    });
  }

  function applyV13214(){
    removeObsoleteDeliveryModesV13214();
    hideObsoleteDeliveryUIV13214();
    refreshAddressEverywhereV13214();
  }

  let scheduled=false;
  const obs=new MutationObserver(()=>{
    if(scheduled)return; scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;applyV13214();});
  });
  function boot(){
    applyV13214();
    if(document.body)obs.observe(document.body,{subtree:true,childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();

  // Após salvar qualquer configuração, re-renderizações também recebem o endereço correto.
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b)return;
    const t=clean(b.innerText).toLowerCase();
    if(t.includes('salvar endereço')||t==='concluir'){
      setTimeout(applyV13214,150);
      setTimeout(applyV13214,700);
    }
  },true);
})();
