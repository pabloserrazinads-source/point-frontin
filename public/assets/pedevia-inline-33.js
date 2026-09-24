
// ===== v1.32.20: SAVE ROBUSTO + PIX + IMPRESSÃO =====
(function(){
  window.PEDEVIA_VERSION='1.32.57';

  function saveButtonV13220(label){
    const modal=document.getElementById('modal');
    const btn=modal?.querySelector('.btn.full, .btn');
    if(!btn)return null;
    if(!btn.dataset.normalText)btn.dataset.normalText=btn.textContent.trim()||'Salvar';
    btn.disabled=label==='Salvando...';
    btn.textContent=label||btn.dataset.normalText;
    return btn;
  }
  function releaseSaveButtonV13220(){
    const modal=document.getElementById('modal');
    const btn=modal?.querySelector('.btn.full, .btn');
    if(btn){btn.disabled=false;btn.textContent=btn.dataset.normalText||'Salvar';}
  }

  // Salva apenas a configuração. Não sincroniza catálogo para alterações
  // que não têm qualquer relação com produtos.
  async function persistConfigOnlyV13220(message){
    try{
      try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
      const {data,error}=await supabaseClient.auth.getSession();
      if(error)throw error;
      if(!data?.session)throw new Error('Sessão administrativa expirada. Entre novamente no Admin.');

      // Em lojas clientes, client_sites.config é a fonte oficial.
      if(window.pedeviaTenantV121){
        const ok=await saveTenantConfigV122();
        if(ok===false)throw new Error('Não foi possível identificar a loja para salvar.');
      }else{
        // Point: mantém o fluxo oficial da configuração, sem sync de produtos.
        const ok=await saveSiteConfigOnline();
        if(ok===false)throw new Error('Não foi possível salvar a configuração da loja.');
      }
      try{setSyncStatusV15('ok')}catch(e){}
      if(message)alert(message);
      return true;
    }catch(e){
      console.error('Config save v1.32.20:',e);
      try{setSyncStatusV15('error',String(e?.message||e))}catch(_){}
      alert('Não foi possível salvar no servidor: '+(e?.message||e));
      return false;
    }
  }

  window.editReceiptSettings=function(){
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    showModal(`
      <div class="row"><h2>Impressão de recibos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
      <label class="switchrow"><span>Ativar impressão de recibos</span>
      <input id="orReceipt" type="checkbox" ${o.receiptPrinting?'checked':''}></label>
      <p class="hint">Ativa a opção de impressão dos pedidos no painel. A impressão usa o recurso de impressão disponível no dispositivo.</p>
      <button id="receiptSaveV13220" class="btn full" data-pedevia-event="click" data-pedevia-call="saveReceiptSettingsV13220">Salvar</button>
    `);
  };

  window.saveReceiptSettingsV13220=async function(){
    const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
    const old=!!o.receiptPrinting;
    o.receiptPrinting=!!document.getElementById('orReceipt')?.checked;
    saveButtonV13220('Salvando...');
    try{
      const ok=await persistConfigOnlyV13220('');
      if(!ok){o.receiptPrinting=old;return;}
      closeModal(); adminOrderSettings(); renderShop();
    }finally{releaseSaveButtonV13220();}
  };

  // Substitui o save antigo de Pix/taxa de serviço. O botão sempre é liberado
  // no finally, inclusive em erro de rede.
  window.saveServiceAndPixV111=async function(){
    normalizeOrderExtrasV111();
    const o=cfg.store.orderConfig;
    const before=JSON.parse(JSON.stringify(o));

    o.serviceFeeEnabled=!!document.getElementById('svcEnabled')?.checked;
    o.serviceFeeLabel=(document.getElementById('svcLabel')?.value||'').trim()||'Taxa de serviço';
    o.serviceFeeType=document.getElementById('svcType')?.value==='fixed'?'fixed':'percent';
    o.serviceFeeValue=Math.max(0,+(document.getElementById('svcValue')?.value||0));
    o.pixKey=(document.getElementById('pixKeyCfg')?.value||'').trim();
    o.pixHolder=(document.getElementById('pixHolderCfg')?.value||'').trim();

    saveButtonV13220('Salvando...');
    try{
      const ok=await persistConfigOnlyV13220('');
      if(!ok){
        cfg.store.orderConfig=before;
        return;
      }
      closeModal(); adminOrderSettings(); renderShop();
    }finally{releaseSaveButtonV13220();}
  };
})();
