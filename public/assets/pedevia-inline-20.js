
// ===== v1.31.18: LOGO COM PRÉVIA IMEDIATA E SALVAMENTO EXPLÍCITO =====
(function(){

  window.brandDraftV13118 = null;

  function brandPreviewHtmlV13118(src){
    return src
      ? `<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
           <img src="${esc(src)}" style="width:110px;height:110px;object-fit:contain;border-radius:22px;border:1px solid #ddd;background:#fff">
           <button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="removeBrandDraftV13118">Remover logo</button>
         </div>`
      : `<div style="width:110px;height:110px;border:1px dashed #999;border-radius:22px;display:grid;place-items:center;text-align:center;font-weight:800;color:#777;background:#fff">LOGO DO<br>ESTABELECIMENTO</div>`;
  }

  function refreshBrandPreviewV13118(){
    const box=document.getElementById('brandPreviewV13118');
    if(!box)return;
    const current = window.brandDraftV13118?.remove
      ? ''
      : (window.brandDraftV13118?.data || cfg.store?.brandImage || '');
    box.innerHTML=brandPreviewHtmlV13118(current);
  }

  window.previewBrandFileV13118=function(input){
    const file=input?.files?.[0];
    if(!file)return;

    if(!file.type.startsWith('image/')){
      alert('Selecione uma imagem válida.');
      input.value='';
      return;
    }
    if(file.size>8*1024*1024){
      alert('A imagem deve ter no máximo 8 MB.');
      input.value='';
      return;
    }

    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        // Apenas prepara a imagem localmente. NÃO envia ao Storage aqui.
        const max=1200;
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.width*scale));
        canvas.height=Math.max(1,Math.round(img.height*scale));
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);

        const mime=file.type==='image/png'?'image/png':'image/jpeg';
        const data=canvas.toDataURL(mime,0.88);

        window.brandDraftV13118={
          data,
          fileName:file.name,
          remove:false
        };

        // Mudança aparece instantaneamente na miniatura.
        refreshBrandPreviewV13118();

        const status=document.getElementById('brandSaveStatusV13118');
        if(status){
          status.textContent='Nova logo selecionada. Clique em Salvar para confirmar.';
          status.style.color='var(--p,#712489)';
        }
      };
      img.onerror=()=>alert('Não foi possível ler essa imagem.');
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  };

  window.removeBrandDraftV13118=function(){
    window.brandDraftV13118={data:null,remove:true};
    const input=document.getElementById('gLogoV13118');
    if(input)input.value='';
    refreshBrandPreviewV13118();
    const status=document.getElementById('brandSaveStatusV13118');
    if(status){
      status.textContent='A logo será removida quando você clicar em Salvar.';
      status.style.color='var(--p,#712489)';
    }
  };

  // Tela única usada tanto pelo Point quanto pelos clientes.
  generalBrand=function(){
    const s=cfg.store||{};
    window.brandDraftV13118=null;

    generalShell('Nome e marca',`
      <label>Nome do estabelecimento</label>
      <input id="gName" class="field" value="${esc(s.name||'')}">

      <label>Logo do estabelecimento</label>
      <div id="brandPreviewV13118" class="brandPreview">
        ${brandPreviewHtmlV13118(s.brandImage||'')}
      </div>

      <input id="gLogoV13118"
             type="file"
             accept="image/*"
             class="field"
             data-pedevia-event="change" data-pedevia-call="previewBrandFileV13118" data-pedevia-arg="this">

      <p class="hint">
        <b>Uma única logo para todo o site:</b>
        a imagem escolhida aparece acima imediatamente como prévia.
        Ela só será enviada e salva quando você clicar em <b>Salvar</b>.
      </p>

      <div id="brandSaveStatusV13118" class="hint" style="min-height:20px"></div>

      <label>Razão social e CNPJ (opcional)</label>
      <input id="gLegal" class="field" placeholder="Razão social" value="${esc(s.legalName||'')}">
      <input id="gCnpj" class="field" placeholder="CNPJ" value="${esc(s.cnpj||'')}">

      <button id="brandSaveBtnV13118" class="btn full" data-pedevia-event="click" data-pedevia-call="saveGeneralBrand">
        Salvar
      </button>
    `);
  };

  saveGeneralBrand=async function(){
    const s=cfg.store||{};
    const btn=document.getElementById('brandSaveBtnV13118');
    const status=document.getElementById('brandSaveStatusV13118');

    const old={
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
      // Só agora ocorre upload.
      if(window.brandDraftV13118?.remove){
        s.brandImage='';
      }else if(window.brandDraftV13118?.data){
        if(status)status.textContent='Enviando a logo...';
        s.brandImage=await PedeviaV130.uploadBrandImage(window.brandDraftV13118.data);
      }

      if(status)status.textContent='Gravando as alterações...';

      const ok=await PedeviaV130.persist(false,'Nome e logo salvos.');
      if(ok===false)throw new Error('Não foi possível confirmar o salvamento.');

      window.brandDraftV13118=null;

      // Atualiza a própria tela e todas as logos imediatamente.
      renderShop();
      try{applyBrandHeaderV116?.()}catch(e){}
      try{renderClientStoreInfo?.()}catch(e){}

      generalBrand();

      // Confirmação visual clara.
      if(typeof pedeviaToastV1315==='function'){
        pedeviaToastV1315('✓ Nome e logo salvos com sucesso');
      }else{
        const newStatus=document.getElementById('brandSaveStatusV13118');
        if(newStatus){
          newStatus.textContent='✓ Alterações salvas com sucesso.';
          newStatus.style.color='var(--ok,#198b57)';
        }
      }

    }catch(e){
      console.error('Falha ao salvar nome/logo:',e);

      // Se falhar, restaura o estado anterior.
      s.name=old.name;
      s.legalName=old.legalName;
      s.cnpj=old.cnpj;
      s.brandImage=old.brandImage;

      if(status){
        status.textContent='Não foi possível salvar: '+(e.message||e);
        status.style.color='#b8323f';
      }
      if(typeof pedeviaToastV1315==='function'){
        pedeviaToastV1315('Não foi possível salvar a logo.','error');
      }
    }finally{
      const currentBtn=document.getElementById('brandSaveBtnV13118')||btn;
      if(currentBtn){
        currentBtn.disabled=false;
        currentBtn.textContent='Salvar';
      }
    }
  };

  // Atualiza qualquer rótulo de versão visível carregado depois.
  setTimeout(()=>{
    if(typeof applyPedeviaVersion==='function')applyPedeviaVersion();
  },900);

})();
