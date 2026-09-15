
// ===== v1.31.19: SALVAMENTO RESILIENTE + ALINHAMENTO DA LOGO =====
(function(){

  // Corrige um problema importante do fluxo antigo:
  // se um salvamento falhava, v15SyncPromise podia ficar rejeitada e
  // contaminar os próximos salvamentos. Agora cada tentativa se recupera
  // da anterior e inicia uma nova operação limpa.
  persistAdminStateV15=async function({products=true,notify=false,message='Alterações salvas online.'}={}){
    try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn('Falha no cache local',e)}

    const {data:sessionData,error:sessionError}=await supabaseClient.auth.getSession();
    if(sessionError)throw sessionError;

    if(!sessionData?.session){
      setSyncStatusV15('error','Sessão administrativa ausente.');
      if(notify) alert('Sua sessão expirou. Entre novamente no Admin para salvar online.');
      return false;
    }

    setSyncStatusV15('saving');

    try{
      // Recupera qualquer rejeição anterior antes de encadear o novo save.
      v15SyncPromise=Promise.resolve(v15SyncPromise)
        .catch(err=>{
          console.warn('Salvamento anterior falhou; fila liberada para nova tentativa.',err);
        })
        .then(async()=>{
          await saveSiteConfigOnline();
          if(products)await syncAllProductsOnline();
        });

      await v15SyncPromise;
      setSyncStatusV15('ok');
      if(notify)alert(message);
      return true;

    }catch(e){
      console.error('Persistência online v1.31.19:',e);

      // Muito importante: não deixa a fila "envenenada" para o próximo clique.
      v15SyncPromise=Promise.resolve();

      setSyncStatusV15('error',String(e?.message||e));

      if(notify){
        alert('Não foi possível salvar no servidor: '+(e?.message||e));
      }
      return false;
    }
  };

  function brandPreviewHtmlV13119(src){
    return src
      ? `<div class="brandVisualV13119">
           <img src="${esc(src)}" class="brandImgV13119">
           <button type="button" class="ghost" onclick="removeBrandDraftV13118()">Remover logo</button>
         </div>`
      : `<div class="brandFallbackV13119">LOGO DO<br>ESTABELECIMENTO</div>`;
  }

  // Reaproveita o draft já criado na v1.31.18, mas corrige a disposição.
  generalBrand=function(){
    const s=cfg.store||{};
    window.brandDraftV13118=null;

    generalShell('Nome e marca',`
      <label>Nome do estabelecimento</label>
      <input id="gName" class="field" value="${esc(s.name||'')}">

      <div class="brandBlockV13119">
        <label class="brandLabelV13119">Logo do estabelecimento</label>
        <div id="brandPreviewV13118" class="brandPreview brandPreviewV13119">
          ${brandPreviewHtmlV13119(s.brandImage||'')}
        </div>
      </div>

      <input id="gLogoV13118"
             type="file"
             accept="image/*"
             class="field"
             onchange="previewBrandFileV13118(this)">

      <p class="hint">
        <b>Uma única logo para todo o site:</b>
        a imagem escolhida aparece acima imediatamente como prévia.
        Ela só será enviada e salva quando você clicar em <b>Salvar</b>.
      </p>

      <div id="brandSaveStatusV13118" class="hint" style="min-height:20px"></div>

      <label>Razão social e CNPJ (opcional)</label>
      <input id="gLegal" class="field" placeholder="Razão social" value="${esc(s.legalName||'')}">
      <input id="gCnpj" class="field" placeholder="CNPJ" value="${esc(s.cnpj||'')}">

      <button id="brandSaveBtnV13118" class="btn full" onclick="saveGeneralBrand()">
        Salvar
      </button>
    `);
  };

  // Substitui apenas o renderer da prévia para manter alinhamento após escolher/remover.
  refreshBrandPreviewV13118=function(){
    const box=document.getElementById('brandPreviewV13118');
    if(!box)return;

    const current=window.brandDraftV13118?.remove
      ? ''
      : (window.brandDraftV13118?.data || cfg.store?.brandImage || '');

    box.innerHTML=brandPreviewHtmlV13119(current);
  };

  // Salvamento com mensagem de erro REAL e confirmação explícita.
  saveGeneralBrand=async function(){
    const s=cfg.store||{};
    const btn=document.getElementById('brandSaveBtnV13118');
    const status=document.getElementById('brandSaveStatusV13118');

    const previous={
      name:s.name,
      legalName:s.legalName,
      cnpj:s.cnpj,
      brandImage:s.brandImage
    };

    s.name=document.getElementById('gName')?.value.trim()||s.name;
    s.legalName=document.getElementById('gLegal')?.value||'';
    s.cnpj=document.getElementById('gCnpj')?.value||'';

    if(btn){
      btn.disabled=true;
      btn.textContent='Salvando...';
    }
    if(status){
      status.textContent='Salvando alterações...';
      status.style.color='';
    }

    try{
      if(window.brandDraftV13118?.remove){
        s.brandImage='';
      }else if(window.brandDraftV13118?.data){
        if(status)status.textContent='Enviando a logo...';
        s.brandImage=await PedeviaV130.uploadBrandImage(window.brandDraftV13118.data);
      }

      if(status)status.textContent='Gravando os dados da loja...';

      const ok=await persistAdminStateV15({
        products:false,
        notify:false,
        message:'Nome e logo salvos.'
      });

      if(!ok)throw new Error('O servidor não confirmou a gravação.');

      window.brandDraftV13118=null;

      renderShop();
      try{applyBrandHeaderV116?.()}catch(e){}
      try{renderClientStoreInfo?.()}catch(e){}

      generalBrand();

      const done=document.getElementById('brandSaveStatusV13118');
      if(done){
        done.textContent='✓ Nome e logo salvos com sucesso.';
        done.style.color='var(--ok,#198b57)';
      }

      if(typeof pedeviaToastV1315==='function'){
        pedeviaToastV1315('✓ Nome e logo salvos com sucesso');
      }

    }catch(e){
      console.error('Falha ao salvar nome/logo v1.31.19:',e);

      s.name=previous.name;
      s.legalName=previous.legalName;
      s.cnpj=previous.cnpj;
      s.brandImage=previous.brandImage;

      if(status){
        status.textContent='Não foi possível salvar: '+(e?.message||e);
        status.style.color='#b8323f';
      }

      if(typeof pedeviaToastV1315==='function'){
        pedeviaToastV1315('Não foi possível salvar a logo.','error');
      }else{
        alert('Não foi possível salvar: '+(e?.message||e));
      }

    }finally{
      const b=document.getElementById('brandSaveBtnV13118')||btn;
      if(b){
        b.disabled=false;
        b.textContent='Salvar';
      }
    }
  };

  const style=document.createElement('style');
  style.id='brandLayoutV13119';
  style.textContent=`
    .brandBlockV13119{
      width:100%;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      margin:8px 0 14px;
    }
    .brandLabelV13119{
      width:100%;
      text-align:center;
      margin:0 0 10px;
      font-weight:800;
    }
    .brandPreviewV13119{
      width:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:130px;
    }
    .brandVisualV13119{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:12px;
      flex-wrap:wrap;
    }
    .brandImgV13119{
      width:110px;
      height:110px;
      object-fit:contain;
      border-radius:22px;
      border:1px solid #ddd;
      background:#fff;
    }
    .brandFallbackV13119{
      width:110px;
      height:110px;
      border:1px dashed #999;
      border-radius:22px;
      display:grid;
      place-items:center;
      text-align:center;
      font-weight:800;
      color:#777;
      background:#fff;
      line-height:1.15;
    }
  `;
  document.head.appendChild(style);

  setTimeout(()=>{
    if(typeof applyPedeviaVersion==='function')applyPedeviaVersion();
  },900);

})();
