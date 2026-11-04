
// ===== v1.32.19: ENDEREÇO DE ENTREGA ESTRUTURADO =====
(function(){
 window.PEDEVIA_VERSION='1.33.0';

 window.showDeliveryForm=function(){
   var o=(cfg.store&&cfg.store.orderConfig)||{};
   var mode=o.deliveryCalc==='neighborhood'?'neighborhood':'fixed';
   var ne=(o.neighborhoods||[]).filter(function(n){return n.enabled!==false});
   var opts=ne.map(function(n){
     return '<option value="'+esc(n.name)+'">'+esc(n.name)+' — '+brl(n.fee)+'</option>';
   }).join('');

   var bairro=(mode==='neighborhood')
     ? '<select id="coNeigh" class="field">'+opts+'</select>'
     : '<input id="coNeighText" class="field" placeholder="Ex.: Centro">';

   var h=''
     +'<div class="row"><h2 class="checkoutTitle">Endereço de entrega</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">‹</button></div>'
     +'<label>Rua / Avenida *</label><input id="coStreet" class="field" placeholder="Ex.: Avenida João Batista Ferrini">'
     +'<div class="two"><div><label>Número *</label><input id="coNumber" class="field" placeholder="Ex.: 136"></div>'
     +'<div><label>Bairro *</label>'+bairro+'</div></div>'
     +'<label>Complemento</label><input id="coComplement" class="field" placeholder="Casa, apto, bloco...">'
     +'<label>Referência *</label><input id="coRef" class="field" placeholder="Ex.: ao lado da farmácia">'
     +'<div class="hint" style="margin-top:8px">Os campos com * são obrigatórios.</div>'
     +'<div class="checkoutSticky"><button class="btn" data-pedevia-event="click" data-pedevia-call="saveDeliveryAndPay">Continuar</button></div>';
   showModal(h);
 };

 window.saveDeliveryAndPay=function(){
   var mode=(cfg.store&&cfg.store.orderConfig&&cfg.store.orderConfig.deliveryCalc)==='neighborhood'?'neighborhood':'fixed';
   var street=(document.getElementById('coStreet')?.value||'').trim();
   var number=(document.getElementById('coNumber')?.value||'').trim();
   var neighborhood=mode==='neighborhood'
     ? (document.getElementById('coNeigh')?.value||'')
     : (document.getElementById('coNeighText')?.value||'').trim();
   var complement=(document.getElementById('coComplement')?.value||'').trim();
   var reference=(document.getElementById('coRef')?.value||'').trim();

   if(!street){ alert('Informe a rua ou avenida.'); return; }
   if(!number){ alert('Informe o número.'); return; }
   if(!neighborhood){ alert('Informe o bairro.'); return; }
   if(!reference){ alert('Informe uma referência para facilitar a entrega.'); return; }

   var address=street+', '+number+' - '+neighborhood+(complement?' · '+complement:'');
   window.checkoutState=window.checkoutState||{};
   Object.assign(window.checkoutState,{
     street:street, number:number, neighborhood:neighborhood,
     complement:complement, reference:reference, address:address
   });
   showPaymentChoices();
 };
})();

// ===== v1.35.63: ENDEREÇO MANUAL + REUTILIZAÇÃO OPCIONAL DO ÚLTIMO PEDIDO =====
(function(){
  function localProfile(){
    try{
      return typeof loadCustomerProfileV114==='function'
        ? (loadCustomerProfileV114()||{})
        : {};
    }catch(_e){return {}}
  }

  function normalizedPhone(value){
    try{
      return typeof normalizeCustomerPhoneV113==='function'
        ? normalizeCustomerPhoneV113(value||'')
        : String(value||'').replace(/\D/g,'');
    }catch(_e){return String(value||'').replace(/\D/g,'')}
  }

  function getKnownPhone(profile){
    let phone='';
    try{
      if(typeof getCachedCustomerPhoneV115==='function'){
        phone=getCachedCustomerPhoneV115()||'';
      }
    }catch(_e){}
    return normalizedPhone(phone||profile.phone||'');
  }

  function splitSavedAddress(profile){
    let street=String(profile.street||'').trim();
    let number=String(profile.number||'').trim();
    let complement=String(profile.complement||'').trim();
    const neighborhood=String(profile.neighborhood||'').trim();

    if(!street){
      let raw=String(profile.address||'').trim();

      // Formato salvo pelo checkout estruturado:
      // "Rua, 123 - Bairro · Complemento"
      const dot=raw.lastIndexOf(' · ');
      if(dot>=0){
        if(!complement)complement=raw.slice(dot+3).trim();
        raw=raw.slice(0,dot).trim();
      }

      if(neighborhood){
        const suffix=' - '+neighborhood;
        if(raw.toLowerCase().endsWith(suffix.toLowerCase())){
          raw=raw.slice(0,-suffix.length).trim();
        }
      }

      const comma=raw.lastIndexOf(',');
      if(comma>=0){
        street=raw.slice(0,comma).trim();
        let tail=raw.slice(comma+1).trim();
        const oldComplement=tail.indexOf(' - ');
        if(oldComplement>=0){
          if(!complement)complement=tail.slice(oldComplement+3).trim();
          tail=tail.slice(0,oldComplement).trim();
        }
        number=number||tail;
      }else{
        street=raw;
      }
    }

    return {street,number,complement,neighborhood,reference:String(profile.reference||'').trim()};
  }

  function fillFromProfile(profile){
    const data=splitSavedAddress(profile||{});
    const streetEl=document.getElementById('coStreet');
    const numberEl=document.getElementById('coNumber');
    const neighEl=document.getElementById('coNeigh');
    const neighTextEl=document.getElementById('coNeighText');
    const complementEl=document.getElementById('coComplement');
    const referenceEl=document.getElementById('coRef');

    if(streetEl)streetEl.value=data.street;
    if(numberEl)numberEl.value=data.number;
    if(complementEl)complementEl.value=data.complement;
    if(referenceEl)referenceEl.value=data.reference;

    if(neighEl){
      const exists=[...neighEl.options].some(o=>o.value===data.neighborhood);
      neighEl.value=exists?data.neighborhood:'';
      if(data.neighborhood&&!exists){
        alert('O bairro salvo no último pedido não está mais disponível. Selecione um bairro da lista.');
      }
    }else if(neighTextEl){
      neighTextEl.value=data.neighborhood;
    }

    window.checkoutState=window.checkoutState||{};
    Object.assign(window.checkoutState,{
      street:data.street,
      number:data.number,
      neighborhood:neighEl?(neighEl.value||''):data.neighborhood,
      complement:data.complement,
      reference:data.reference
    });
  }

  function clearDeliveryFields(){
    ['coStreet','coNumber','coComplement','coRef'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.value='';
    });
    const neigh=document.getElementById('coNeigh');
    const neighText=document.getElementById('coNeighText');
    if(neigh)neigh.value='';
    if(neighText)neighText.value='';

    window.checkoutState=window.checkoutState||{};
    Object.assign(window.checkoutState,{
      street:'',
      number:'',
      neighborhood:'',
      complement:'',
      reference:'',
      address:''
    });
  }

  window.showDeliveryForm=function(){
    const o=(cfg.store&&cfg.store.orderConfig)||{};
    const mode=o.deliveryCalc==='neighborhood'?'neighborhood':'fixed';
    const neighborhoods=(o.neighborhoods||[]).filter(n=>n.enabled!==false);
    const options=neighborhoods.map(n=>
      '<option value="'+esc(n.name)+'">'+esc(n.name)+' — '+brl(n.fee)+'</option>'
    ).join('');

    const profile=localProfile();
    const knownPhone=getKnownPhone(profile);
    const localHasAddress=!!String(profile.address||'').trim();
    const showReuseOption=localHasAddress||knownPhone.length>=10;

    const neighborhoodField=mode==='neighborhood'
      ? '<select id="coNeigh" class="field" required>'
        + '<option value="" selected disabled>Selecione seu bairro</option>'
        + options
        + '</select>'
      : '<input id="coNeighText" class="field" placeholder="Ex.: Centro">';

    const reuseField=showReuseOption
      ? '<div id="coReuseLastAddress" style="margin:10px 0 14px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--soft,#f8f8f8)">'
        + '<label style="display:flex;align-items:center;gap:10px;margin:0;cursor:pointer;font-weight:700">'
        + '<input id="coReuseLastAddressCheck" type="checkbox" style="width:18px;height:18px;flex:0 0 auto">'
        + '<span>Mesmo endereço do último pedido?</span>'
        + '</label>'
        + '<small id="coReuseLastAddressHint" style="display:block;margin:6px 0 0 28px;color:var(--muted,#666)">Marque para preencher automaticamente o endereço, bairro e referência anteriores.</small>'
        + '</div>'
      : '';

    const html=''
      + '<div class="row"><h2 class="checkoutTitle">Endereço de entrega</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">‹</button></div>'
      + reuseField
      + '<label>Rua / Avenida *</label><input id="coStreet" class="field" placeholder="Ex.: Avenida João Batista Ferrini">'
      + '<div class="two"><div><label>Número *</label><input id="coNumber" class="field" placeholder="Ex.: 136"></div>'
      + '<div><label>Bairro *</label>'+neighborhoodField+'</div></div>'
      + '<label>Complemento</label><input id="coComplement" class="field" placeholder="Casa, apto, bloco...">'
      + '<label>Referência *</label><input id="coRef" class="field" placeholder="Ex.: ao lado da farmácia">'
      + '<div class="hint" style="margin-top:8px">Os campos com * são obrigatórios.</div>'
      + '<div class="checkoutSticky"><button class="btn" data-pedevia-event="click" data-pedevia-call="saveDeliveryAndPay">Continuar</button></div>';

    showModal(html);

    // Todo pedido novo começa sem bairro pré-selecionado.
    const neighborhoodSelect=document.getElementById('coNeigh');
    if(neighborhoodSelect)neighborhoodSelect.value='';

    window.checkoutState=window.checkoutState||{};
    Object.assign(window.checkoutState,{
      street:'',
      number:'',
      neighborhood:'',
      complement:'',
      reference:'',
      address:''
    });

    const reuseCheck=document.getElementById('coReuseLastAddressCheck');
    if(reuseCheck){
      let savedProfile=localHasAddress?profile:null;
      const hint=document.getElementById('coReuseLastAddressHint');

      reuseCheck.addEventListener('change',()=>{
        if(reuseCheck.checked){
          if(savedProfile)fillFromProfile(savedProfile);
        }else{
          clearDeliveryFields();
        }
      });

      if(knownPhone.length>=10&&typeof getCustomerProfileV115==='function'){
        if(!savedProfile&&hint)hint.textContent='Consultando o endereço do último pedido...';
        getCustomerProfileV115(knownPhone).then(remoteProfile=>{
          if(!remoteProfile||!String(remoteProfile.address||'').trim())return;
          savedProfile=remoteProfile;
          if(hint)hint.textContent='Marque para preencher automaticamente o endereço, bairro e referência anteriores.';
          if(reuseCheck.checked)fillFromProfile(savedProfile);
        }).catch(error=>{
          console.warn('Não foi possível consultar o endereço anterior:',error);
          if(!savedProfile){
            const wrapper=document.getElementById('coReuseLastAddress');
            if(wrapper)wrapper.remove();
          }
        });
      }else if(!savedProfile){
        const wrapper=document.getElementById('coReuseLastAddress');
        if(wrapper)wrapper.remove();
      }
    }
  };

  window.saveDeliveryAndPay=function(){
    const mode=(cfg.store&&cfg.store.orderConfig&&cfg.store.orderConfig.deliveryCalc)==='neighborhood'
      ? 'neighborhood'
      : 'fixed';

    const street=(document.getElementById('coStreet')?.value||'').trim();
    const number=(document.getElementById('coNumber')?.value||'').trim();
    const neighborhood=mode==='neighborhood'
      ? (document.getElementById('coNeigh')?.value||'')
      : (document.getElementById('coNeighText')?.value||'').trim();
    const complement=(document.getElementById('coComplement')?.value||'').trim();
    const reference=(document.getElementById('coRef')?.value||'').trim();

    if(!street){alert('Informe a rua ou avenida.');return;}
    if(!number){alert('Informe o número.');return;}
    if(!neighborhood){
      alert('Selecione seu bairro para continuar.');
      document.getElementById(mode==='neighborhood'?'coNeigh':'coNeighText')?.focus();
      return;
    }
    if(!reference){alert('Informe uma referência para facilitar a entrega.');return;}

    const address=street+', '+number+' - '+neighborhood+(complement?' · '+complement:'');
    window.checkoutState=window.checkoutState||{};
    Object.assign(window.checkoutState,{
      street,
      number,
      neighborhood,
      complement,
      reference,
      address
    });
    if(typeof saveCustomerProfileV114==='function'){
      saveCustomerProfileV114({street,number,neighborhood,complement,reference,address});
    }

    showPaymentChoices();
  };
})();
