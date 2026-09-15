
// ===== v1.32.21: OUTRAS CONFIGURAÇÕES — SAVE ROBUSTO =====
(function(){
  window.PEDEVIA_VERSION='1.32.47';

  async function saveOrderConfigOnlyV13221(){
    try{
      try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
      const {data,error}=await supabaseClient.auth.getSession();
      if(error)throw error;
      if(!data?.session)throw new Error('Sessão administrativa expirada. Entre novamente no Admin.');

      if(window.pedeviaTenantV121){
        const ok=await saveTenantConfigV122();
        if(ok===false)throw new Error('Não foi possível identificar a loja para salvar.');
      }else{
        const ok=await saveSiteConfigOnline();
        if(ok===false)throw new Error('Não foi possível salvar a configuração da loja.');
      }
      try{setSyncStatusV15('ok')}catch(e){}
      return true;
    }catch(e){
      console.error('Outras configurações v1.32.21:',e);
      try{setSyncStatusV15('error',String(e?.message||e))}catch(_){}
      alert('Não foi possível salvar no servidor: '+(e?.message||e));
      return false;
    }
  }

  window.editOtherOrderSettings=function(){
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    showModal(`
      <div class="row"><h2>Outras configurações</h2><button class="ghost" onclick="closeModal()">✕</button></div>
      <div class="cfgBlock"><label class="switchrow"><span><b>Solicitar CPF ou CNPJ do cliente na compra</b><small class="hint">Se habilitado, o preenchimento será obrigatório.</small></span>${toggleHTML('orCpf',!!o.requireCpf)}</label></div>
      <div class="cfgBlock"><label class="switchrow"><span><b>Incluir código de referência nos produtos e complementos</b><small class="hint">Útil para identificar itens por código.</small></span>${toggleHTML('orRef',!!o.referenceCodes)}</label></div>
      <div class="cfgBlock"><label class="switchrow"><span><b>Mostrar numeração dos pedidos</b><small class="hint">A numeração fica visível para o estabelecimento e cliente.</small></span>${toggleHTML('orNum',!!o.showOrderNumber)}</label></div>
      <label class="cfgLabel">Prefixo dos pedidos</label>
      <input id="orPrefix" class="field" value="${esc(o.orderPrefix||'PD')}">
      <label class="cfgLabel">Próximo número</label>
      <input id="orNext" type="number" min="1" class="field" value="${Math.max(1,+o.nextOrder||1)}">
      <button id="otherSaveV13221" class="btn full" onclick="saveOtherOrderSettingsV13221()">Salvar</button>
    `);
  };

  window.saveOtherOrderSettingsV13221=async function(){
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    const before={
      requireCpf:o.requireCpf, referenceCodes:o.referenceCodes,
      showOrderNumber:o.showOrderNumber, orderPrefix:o.orderPrefix, nextOrder:o.nextOrder
    };
    o.requireCpf=!!document.getElementById('orCpf')?.checked;
    o.referenceCodes=!!document.getElementById('orRef')?.checked;
    o.showOrderNumber=!!document.getElementById('orNum')?.checked;
    o.orderPrefix=(document.getElementById('orPrefix')?.value||'').trim()||'PD';
    o.nextOrder=Math.max(1,+(document.getElementById('orNext')?.value||1));

    const btn=document.getElementById('otherSaveV13221');
    if(btn){btn.disabled=true;btn.textContent='Salvando...';}
    try{
      const ok=await saveOrderConfigOnlyV13221();
      if(!ok){Object.assign(o,before);return;}
      closeModal();
      adminOrderSettings();
      renderShop();
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Salvar';}
    }
  };
  window.saveOtherOrderSettings=window.saveOtherOrderSettingsV13221;

  // Mantém toda a tela existente e troca apenas o ícone problemático.
  const baseAdminOrderSettingsV13221=window.adminOrderSettings;
  window.adminOrderSettings=function(){
    baseAdminOrderSettingsV13221();
    const cards=[...document.querySelectorAll('.settingsList .settingCard, .settingsList button')];
    const card=cards.find(el=>(el.textContent||'').includes('Outras configurações'));
    if(card){
      const icon=card.querySelector('.settingIc, .settingsIc, span');
      if(icon && (icon.textContent||'').includes('•••')){
        icon.innerHTML='<span class="otherSettingsIconV13221">⚙</span>';
      }
    }
  };
})();
