
// ===== v1.32.19: ENDEREÇO DE ENTREGA ESTRUTURADO =====
(function(){
 window.PEDEVIA_VERSION='1.32.59';

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
