
// ===== v1.20.1: CORREÇÃO DO PAINEL MESTRE + QR CODE DOS CLIENTES =====
window.clientQrDraftV1201 = null;

async function isPlatformAdminV1201(){
  try{
    const {data,error}=await supabaseClient.rpc('is_platform_admin');
    if(error) throw error;
    return data===true;
  }catch(e){
    console.warn('Não foi possível validar administrador da plataforma:',e);
    return false;
  }
}

async function loadPlatformMasterCardV1201(){
  const slot=document.getElementById('platformMasterSlotV1201');
  if(!slot)return;
  const ok=await isPlatformAdminV1201();
  if(!ok){slot.innerHTML='';return;}
  slot.innerHTML=moreCard('🏪','Sites dos clientes','Painel mestre para criar e administrar cardápios','openClientSitesMasterV120()');
}

// Mantém o menu atual do Point e injeta o painel mestre somente para o administrador da plataforma.
adminMore=function(){
  const s=cfg.store;
  $('#adminContent').innerHTML=`<div class="panel"><div class="settingsTitle">Mais</div><div class="generalHead">⚙️ Configurações gerais</div><div class="moreList">
  ${moreCard('▣','Nome e marca',s.name,'generalBrand()')}
  ${moreCard('🎨','Aparência e textos','Banner, cores e visual do site','generalAppearanceV116()')}
  ${moreCard('◷','Horário de Atendimento','Dias, horários e feriados','generalHours()')}
  ${moreCard('☎','Contato',formatWa(s.whatsapp),'generalContact()')}
  ${moreCard('⌖','Endereço',s.address,'generalAddress()')}
  ${moreCard('◎','Redes Sociais',s.instagram||'Adicionar rede social','generalSocial()')}
  ${moreCard('↗','Compartilhamento em Redes Sociais','Título, descrição e imagem','generalSharing()')}
        ${moreCard('▦','QR Code','Gerar QR Code do cardápio','generalQr()')}
  <div id="platformMasterSlotV1201"></div>
  ${moreCard('🧺','Pedidos','Configurações de pedidos',"adminTab='orders';adminOrdersView='config';renderAdmin()")}
  </div></div>`;
  loadPlatformMasterCardV1201();
};

function readQrUploadV1201(input){
  const file=input?.files?.[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){alert('Selecione uma imagem do QR Code.');input.value='';return;}
  if(file.size>8*1024*1024){alert('A imagem deve ter no máximo 8 MB.');input.value='';return;}
  const reader=new FileReader();
  reader.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const max=1200;
      const scale=Math.min(1,max/Math.max(img.width,img.height));
      const w=Math.max(1,Math.round(img.width*scale));
      const h=Math.max(1,Math.round(img.height*scale));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,w,h);
      // PNG preserva melhor as bordas do QR Code.
      window.clientQrDraftV1201=canvas.toDataURL('image/png');
      renderQrPreviewV1201();
    };
    img.onerror=()=>alert('Não foi possível ler essa imagem.');
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
}

function renderQrPreviewV1201(){
  const box=document.getElementById('clientQrPreviewV1201');if(!box)return;
  const img=window.clientQrDraftV1201;
  box.innerHTML=img?`<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><img src="${img}" alt="QR Code do cliente" style="width:150px;height:150px;object-fit:contain;background:#fff;border:1px solid #ddd;border-radius:16px;padding:8px"><button type="button" class="ghost" onclick="removeQrV1201()">Remover QR Code</button></div>`:`<div class="hint">Nenhum QR Code enviado ainda.</div>`;
}
function removeQrV1201(){window.clientQrDraftV1201='';renderQrPreviewV1201();}

// Substitui o editor da loja da v1.20 acrescentando armazenamento do QR Code dentro da configuração da própria loja.
editClientSiteV120=function(id){
  const r=window.clientSitesV120.find(x=>String(x.id)===String(id));if(!r)return;
  window.clientQrDraftV1201=r?.config?.store?.clientQrImage||'';
  showModal(`<div class="row"><div><h2 style="margin:0">${esc(r.name)}</h2><div class="hint">Estrutura independente do Point do Açaí</div></div><button class="ghost" onclick="closeModal()">✕</button></div>
  <label>Nome</label><input id="cseNameV120" class="field" value="${escapeAttrV120(r.name)}">
  <label>Slug</label><input id="cseSlugV120" class="field" value="${escapeAttrV120(r.slug)}">
  <label>WhatsApp</label><input id="cseWaV120" class="field" value="${escapeAttrV120(r.whatsapp||'')}">
  <label>Administrador</label><input id="cseEmailV120" type="email" class="field" value="${escapeAttrV120(r.admin_email||'')}">
  <label class="switchrow"><span><b>Loja ativa</b><small class="hint">Ative somente quando o cardápio estiver pronto para o cliente.</small></span><input id="cseActiveV120" type="checkbox" ${r.active?'checked':''}></label>
  <div class="panel" style="margin:14px 0;padding:14px"><b>▦ QR Code enviado pelo cliente</b><div class="hint" style="margin:4px 0 10px">Envie a imagem do QR Code para deixá-la salva junto ao cadastro desta empresa.</div>
    <div id="clientQrPreviewV1201"></div>
    <label class="btn" style="display:inline-block;margin-top:10px;cursor:pointer">Enviar QR Code<input type="file" accept="image/*" style="display:none" onchange="readQrUploadV1201(this)"></label>
  </div>
  <div class="notice" style="margin:12px 0"><b>Etapa atual:</b> estrutura-base criada e isolada.<br><small>Na próxima etapa, vamos ligar este cadastro à página pública e ao painel de edição exclusivo do cliente.</small></div>
  <button id="cseSaveBtnV120" class="btn full" onclick="saveClientSiteV120('${r.id}')">Salvar</button>
  <button class="dangerBtn full" style="margin-top:8px" onclick="deleteClientSiteV120('${r.id}')">Excluir esta loja</button>`);
  setTimeout(renderQrPreviewV1201,0);
};

saveClientSiteV120=async function(id){
  const row=window.clientSitesV120.find(x=>String(x.id)===String(id));if(!row)return;
  const name=$('#cseNameV120').value.trim(),slug=slugifyStoreV120($('#cseSlugV120').value),wa=$('#cseWaV120').value.replace(/\D/g,''),email=$('#cseEmailV120').value.trim().toLowerCase(),active=$('#cseActiveV120').checked;
  if(!name||!slug||!email){alert('Nome, slug e e-mail são obrigatórios.');return}
  const config=JSON.parse(JSON.stringify(row.config||cleanClientConfigV120(name,wa)));
  config.store=config.store||{};
  config.store.name=name;config.store.whatsapp=wa;config.store.hubSlug=slug;
  config.store.clientQrImage=window.clientQrDraftV1201||'';
  const btn=$('#cseSaveBtnV120');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
  const {error}=await supabaseClient.from('client_sites').update({name,slug,whatsapp:wa,admin_email:email,active,config,updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('Erro ao salvar: '+error.message);if(btn){btn.disabled=false;btn.textContent='Salvar'}return}
  closeModal();await openClientSitesMasterV120();
};
