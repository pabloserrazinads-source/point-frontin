
// ===== v1.21.0: PEDEVIA · LOJAS PÚBLICAS POR SLUG =====
const PEDEVIA_PUBLIC_BASE='https://pedevia.cardapioonline.workers.dev';
window.pedeviaTenantV121=null;

function tenantSlugFromLocationV121(){
  const qs=new URLSearchParams(location.search);
  const fromQuery=slugifyStoreV120(qs.get('loja')||'');
  if(fromQuery)return fromQuery;
  const parts=location.pathname.split('/').filter(Boolean);
  if(!parts.length)return '';
  const first=slugifyStoreV120(parts[0]);
  // caminhos técnicos que não representam uma loja
  if(['index-html','favicon-ico','robots-txt'].includes(first))return '';
  return first;
}

function tenantPublicUrlV121(slug){
  return `${PEDEVIA_PUBLIC_BASE}/${encodeURIComponent(slugifyStoreV120(slug))}`;
}

async function loadTenantRowV121(slug){
  // Cliente comum: somente lojas ativas por RPC pública e segura.
  try{
    const {data,error}=await supabaseClient.rpc('get_public_client_site',{p_slug:slug});
    if(!error && data){
      const row=Array.isArray(data)?data[0]:data;
      if(row && row.slug)return row;
    }
  }catch(e){console.warn('RPC pública da loja indisponível:',e)}

  // Dono da plataforma autenticado pode visualizar também rascunhos.
  try{
    const {data:sessionData}=await supabaseClient.auth.getSession();
    if(sessionData?.session){
      const {data,error}=await supabaseClient.from('client_sites').select('id,name,slug,whatsapp,active,config,admin_email,service_status,billing_due_date,monthly_fee,suspension_reason').eq('slug',slug).maybeSingle();
      if(!error && data)return data;
    }
  }catch(e){console.warn('Prévia autenticada indisponível:',e)}
  return null;
}

function applyTenantConfigV121(row){
  const incoming=JSON.parse(JSON.stringify(row?.config||{}));
  const safeBase=JSON.parse(JSON.stringify(DEFAULT));
  const store=Object.assign({},safeBase.store||{},incoming.store||{});
  store.name=row?.name||store.name||'Estabelecimento';
  store.whatsapp=row?.whatsapp||store.whatsapp||'';
  store.hubSlug=row?.slug||store.hubSlug||'';

  cfg={
    store,
    categories:Array.isArray(incoming.categories)?incoming.categories:[],
    sections:Array.isArray(incoming.sections)?incoming.sections:[],
    groups:Array.isArray(incoming.groups)?incoming.groups:[],
    products:Array.isArray(incoming.products)?incoming.products:[],
    offers:Array.isArray(incoming.offers)?incoming.offers:[]
  };

  // Garante pelo menos uma seção vazia para lojas recém-criadas.
  if(!cfg.sections.length){cfg.sections=[{id:'produtos',title:'Produtos',description:'',accent:'#712489',display:'cards',active:true,order:0}]}
  if(!cfg.categories.length){cfg.categories=cfg.sections.map(s=>({id:s.id,name:s.title||'Produtos',active:s.active!==false}))}
  activeCat=cfg.categories.find(c=>c.active!==false)?.id||cfg.categories[0]?.id||'';
  window.pedeviaTenantV121=row;
  try{document.title=`${cfg.store.name} · Pedevia`}catch(e){}

  // Identidade visual e compatibilidade das versões mais novas.
  try{if(typeof ensureV116Defaults==='function')ensureV116Defaults()}catch(e){console.warn(e)}
  try{if(typeof ensureDesignV117==='function')ensureDesignV117()}catch(e){console.warn(e)}
  try{if(typeof refreshVisualV116==='function')refreshVisualV116()}catch(e){console.warn(e)}
  try{if(typeof applyBrandHeaderV116==='function')applyBrandHeaderV116()}catch(e){console.warn(e)}
}

function showTenantNotFoundV121(slug){
  const shop=document.getElementById('shopView');
  if(shop){
    const panel=document.createElement('div');panel.className='panel';Object.assign(panel.style,{maxWidth:'620px',margin:'50px auto',textAlign:'center'});
    const icon=document.createElement('div');icon.style.fontSize='52px';icon.textContent='🏪';
    const title=document.createElement('h2');title.textContent='Loja indisponível';
    const message=document.createElement('p');message.className='hint';message.append('O endereço ');
    const address=document.createElement('b');address.textContent='/'+String(slug||'');message.append(address,' não está publicado ou não existe na Pedevia.');
    const back=document.createElement('button');back.type='button';back.className='btn';back.textContent='Ir para a Pedevia';back.addEventListener('click',()=>location.assign('/'));
    panel.append(icon,title,message,back);shop.replaceChildren(panel);
  }
  document.getElementById('cartBar')?.classList.add('hide');
}

const _initializePointOnlineStateV121=initializeOnlineStateV13;
initializeOnlineStateV13=async function(){
  const slug=tenantSlugFromLocationV121();
  if(!slug){
    window.pedeviaTenantV121=null;
    return _initializePointOnlineStateV121();
  }

  const row=await loadTenantRowV121(slug);
  if(!row){showTenantNotFoundV121(slug);return false}
  applyTenantConfigV121(row);
  renderShop();
  updateCart();
  return true;
};

// Lista mestre: adiciona link público e cópia rápida.
renderClientSitesListV120=function(rows){
  const el=$('#clientSitesListV120');if(!el)return;
  if(!rows.length){
    const empty=document.createElement('div');empty.className='emptySection';
    const title=document.createElement('b');title.textContent='Nenhuma loja criada ainda.';
    const hint=document.createElement('span');hint.className='hint';hint.textContent='Clique em “+ Nova loja” para gerar a primeira estrutura limpa.';
    empty.append(title,document.createElement('br'),hint);el.replaceChildren(empty);
    return;
  }
  el.replaceChildren();
  rows.forEach(r=>{
    const url=tenantPublicUrlV121(r.slug||'');
    const item=document.createElement('div');item.className='adminItem';item.style.alignItems='flex-start';
    const info=document.createElement('div');const name=document.createElement('b');name.textContent=r.name||'Loja';info.append(name,' ');
    const badge=document.createElement('span');badge.className='badge '+(r.active?'available':'hidden');badge.textContent=r.active?'Ativo':'Rascunho';info.append(badge,document.createElement('br'));
    const meta=document.createElement('span');meta.className='hint';meta.textContent='/'+(r.slug||'')+' · '+(r.admin_email||'sem administrador');
    const link=document.createElement('small');link.className='hint';link.textContent=url;
    const created=document.createElement('small');created.className='hint';const date=r.created_at?new Date(r.created_at):null;created.textContent='Criada em '+(date&&Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'-');
    info.append(meta,document.createElement('br'),link,document.createElement('br'),created);
    const actions=document.createElement('div');actions.className='miniBtns';Object.assign(actions.style,{display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'flex-end'});
    [['Abrir site',()=>openClientSiteV121(r.id)],['Copiar link',()=>copyClientSiteLinkV121(r.id)],['Gerenciar',()=>editClientSiteV120(r.id)]].forEach(([label,handler])=>{const button=document.createElement('button');button.type='button';button.className='ghost';button.textContent=label;button.addEventListener('click',handler);actions.append(button)});
    item.append(info,actions);el.append(item);
  });
};

function clientRowV121(id){return (window.clientSitesV120||[]).find(x=>String(x.id)===String(id))}
function openClientSiteV121(id){
  const r=clientRowV121(id);if(!r)return;
  window.open(tenantPublicUrlV121(r.slug),'_blank','noopener');
}
async function copyClientSiteLinkV121(id){
  const r=clientRowV121(id);if(!r)return;
  const url=tenantPublicUrlV121(r.slug);
  try{await navigator.clipboard.writeText(url);alert('Link copiado:\n'+url)}
  catch(e){prompt('Copie o link da loja:',url)}
}

// Na página pública de uma loja, não deixa o cliente cair no Admin do Point por engano.
const _switchModeV121=switchMode;
switchMode=function(){
  if(window.pedeviaTenantV121){
    alert('O painel administrativo desta loja será liberado na próxima etapa da Pedevia.');
    return;
  }
  return _switchModeV121();
};


// ===== v1.21.1: TEMPLATE LIMPO PARA LOJAS PEDEVIA =====
// Remove qualquer identidade herdada do Point nas lojas de clientes e deixa
// campos genéricos para o estabelecimento personalizar.
window.clientLogoDraftV1211='';

cleanClientConfigV120=function(name,whatsapp){
  const base=JSON.parse(JSON.stringify(DEFAULT));
  base.store=base.store||{};
  Object.assign(base.store,{
    name:name||'Novo estabelecimento',
    legalName:'',cnpj:'',email:'',address:'',instagram:'',socialUrl:'',
    whatsapp:String(whatsapp||'').replace(/\D/g,''),brandImage:'',
    heroTitle:'Texto inicial do site',heroEmoji:'',heroText:'',
    shareTitle:name||'Novo estabelecimento',shareDescription:'Confira nosso cardápio online.',
    hubSlug:slugifyStoreV120(name||'novo-estabelecimento'),customDomain:'',
    collaborators:[],analyticsId:'',googleAdsId:'',metaPixelId:'',
    deliveryFee:0,minimumOrder:0,paused:false,
    hours:{'0':[],'1':[],'2':[],'3':[],'4':[],'5':[],'6':[]},
    orderConfig:{deliveryTime:'',deliveryArea:'',pickupTime:'',receiptPrinting:false,panelAlerts:true,orderPrefix:'PD',nextOrder:1}
  });
  base.categories=[{id:'produtos',name:'Produtos',active:true}];
  base.sections=[{id:'produtos',title:'Produtos',description:'',accent:'#712489',display:'cards',active:true,order:0}];
  base.products=[];base.groups=[];base.offers=[];
  return base;
};

function genericTenantStoreV1211(store,incoming){
  const original=incoming?.store||{};
  store.brandImage=original.brandImage||'';
  const oldHero=(original.heroTitle||'').trim();
  store.heroTitle=(!oldHero||oldHero==='Seu açaí, do seu jeito')?'Texto inicial do site':oldHero;
  store.heroEmoji=(original.heroEmoji===undefined||original.heroEmoji==='💜')?'':original.heroEmoji;
  const oldText=(original.heroText||'').trim();
  store.heroText=(!oldText||oldText==='Monte seu pedido com os complementos que você gosta e finalize pelo WhatsApp.')?'':oldText;
  if(store.instagram==='@point_frontin')store.instagram='';
  if(/instagram\.com\/point_frontin/i.test(store.socialUrl||''))store.socialUrl='';
  if((store.address||'').includes('Avenida João Batista Ferrini'))store.address='';
  if(store.orderConfig?.deliveryArea==='Centro e bairros atendidos')store.orderConfig.deliveryArea='';
  return store;
}

const _applyTenantConfigV121_v1211=applyTenantConfigV121;
applyTenantConfigV121=function(row){
  const incoming=JSON.parse(JSON.stringify(row?.config||{}));
  _applyTenantConfigV121_v1211(row);
  cfg.store=genericTenantStoreV1211(cfg.store,incoming);
  // Lojas criadas antes desta versão herdavam os horários do Point.
  const pointHours=JSON.stringify(DEFAULT.store.hours||{});
  if(JSON.stringify(incoming?.store?.hours||{})===pointHours){
    cfg.store.hours={'0':[],'1':[],'2':[],'3':[],'4':[],'5':[],'6':[]};
  }
  try{refreshVisualV116()}catch(e){}
};

const _applyBrandHeaderV116_v1211=applyBrandHeaderV116;
applyBrandHeaderV116=function(){
  if(!window.pedeviaTenantV121)return _applyBrandHeaderV116_v1211();
  const mark=document.getElementById('headerLogoMark');
  if(mark){
    mark.innerHTML=cfg.store.brandImage
      ? `<img src="${esc(cfg.store.brandImage)}" alt="Logo ${esc(cfg.store.name)}">`
      : `<div style="width:100%;height:100%;display:grid;place-items:center;border:1px dashed #aaa;border-radius:50%;font-size:11px;font-weight:800;color:#777;background:#fff">LOGO</div>`;
  }
  const brand=document.getElementById('headerBrandName');
  if(brand){
    brand.childNodes[0].nodeValue=(cfg.store.name||'ESTABELECIMENTO').toUpperCase()+' ';
    const small=brand.querySelector('small');if(small)small.textContent='Cardápio online';
  }
};

const _renderClientStoreInfo_v1211=renderClientStoreInfo;
renderClientStoreInfo=function(){
  if(!window.pedeviaTenantV121)return _renderClientStoreInfo_v1211();
  const s=cfg.store,st=openState();
  const logo=s.brandImage
    ? `<img src="${esc(s.brandImage)}" alt="Logo ${esc(s.name)}">`
    : `<div class="fallback" style="font-size:13px;line-height:1.15">LOGO DO<br>ESTABELECIMENTO</div>`;
  const subtitle=s.address?esc(clientAddressShort()):'';
  $('#clientBrand').innerHTML=`<div class="clientBrand"><div class="clientBrandLogo">${logo}</div><h1>${esc(s.name)}</h1>${subtitle?`<div class="sub">${subtitle}</div>`:''}</div>`;
  const wa=formatWa(s.whatsapp),waDigits=String(s.whatsapp||'').replace(/\D/g,''),waUrl='https://wa.me/'+waDigits;
  const insta=s.socialUrl||('https://instagram.com/'+cleanInstagramHandle());
  $('#clientInfoTop').innerHTML=`<div class="clientInfoGrid">
    <div class="clientInfoCard"><div class="ci">◷</div><div><b class="${st.open?'clientStatusOpen':'clientStatusClosed'}">${esc(st.text)}</b><small>${esc(nextCloseText())}${s.modes?.pickup&&s.orderConfig?.pickupTime?' · Retirada: '+esc(s.orderConfig.pickupTime)+' min':''}</small></div><span></span></div>
    <div class="clientInfoCard"><div class="ci">☏</div><div><b>${waDigits?esc(wa):'Contato não informado'}</b><small>WhatsApp</small></div>${waDigits?`<a href="${waUrl}" target="_blank">CONTATO</a>`:'<span></span>'}</div>
    <div class="clientInfoCard"><div class="ci">⌖</div><div><b>${esc(clientAddressShort()||'Endereço não informado')}</b><small>${esc(s.address||'')}</small></div>${s.address?`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}" target="_blank">DIREÇÕES</a>`:'<span></span>'}</div>
  </div>`;
  $('#clientInfoBottom').innerHTML=`<div class="clientDetails"><h3>Informações da loja</h3><div class="detailRow"><div class="di">◷</div><div><b>Horário de atendimento</b><small>${esc(todayScheduleText())}</small></div></div><div class="detailRow"><div class="di">⌖</div><div><b>Endereço</b><small>${esc(s.address||'Não informado')}</small></div></div><div class="detailRow"><div class="di">☏</div><div><b>Contato</b><small>${waDigits?esc(wa):'Não informado'}${s.email?' · '+esc(s.email):''}</small></div></div>${(s.instagram||s.socialUrl)?`<div class="detailRow"><div class="di">◎</div><div><b>Redes sociais</b><small>${esc(s.instagram||cleanInstagramHandle())}</small><a class="socialBtn" href="${esc(insta)}" target="_blank">◎ Instagram</a></div></div>`:''}</div>`;
  $('#clientFooter').innerHTML=`<div class="clientFooter"><b>${esc(s.name)}</b><br>Cardápio e pedidos online · Pedevia</div>`;
};

function readClientLogoV1211(input){
  const file=input?.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){alert('Selecione uma imagem para a logo.');return}
  if(file.size>8*1024*1024){alert('A imagem deve ter no máximo 8 MB.');return}
  const reader=new FileReader();
  reader.onload=()=>{const img=new Image();img.onload=()=>{
    const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    window.clientLogoDraftV1211=c.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',0.86);
    renderClientLogoPreviewV1211();
  };img.src=reader.result};reader.readAsDataURL(file);
}
function renderClientLogoPreviewV1211(){
  const box=document.getElementById('clientLogoPreviewV1211');if(!box)return;
  box.innerHTML=window.clientLogoDraftV1211
    ? `<div style="display:flex;align-items:center;gap:12px"><img src="${window.clientLogoDraftV1211}" style="width:88px;height:88px;object-fit:contain;border-radius:18px;border:1px solid #ddd;background:#fff"><button class="ghost" type="button" onclick="window.clientLogoDraftV1211='';renderClientLogoPreviewV1211()">Remover logo</button></div>`
    : `<div style="width:88px;height:88px;border:1px dashed #aaa;border-radius:18px;display:grid;place-items:center;font-weight:800;color:#777;background:#fff">LOGO</div>`;
}

editClientSiteV120=function(id){
  const r=window.clientSitesV120.find(x=>String(x.id)===String(id));if(!r)return;
  const st=r.config?.store||{};
  window.clientQrDraftV1201=st.clientQrImage||'';
  window.clientLogoDraftV1211=st.brandImage||'';
  const heroTitle=(!st.heroTitle||st.heroTitle==='Seu açaí, do seu jeito')?'Texto inicial do site':st.heroTitle;
  const heroText=(!st.heroText||st.heroText==='Monte seu pedido com os complementos que você gosta e finalize pelo WhatsApp.')?'':st.heroText;
  showModal(`<div class="row"><div><h2 style="margin:0">${esc(r.name)}</h2><div class="hint">Loja independente na Pedevia</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
  <label>Nome</label><input id="cseNameV120" class="field" value="${escapeAttrV120(r.name)}">
  <label>Slug</label><input id="cseSlugV120" class="field" value="${escapeAttrV120(r.slug)}">
  <label>WhatsApp</label><input id="cseWaV120" class="field" value="${escapeAttrV120(r.whatsapp||'')}">
  <label>Administrador</label><input id="cseEmailV120" type="email" class="field" value="${escapeAttrV120(r.admin_email||'')}">
  <div class="panel" style="margin:14px 0;padding:14px"><b>📧 Acesso do administrador</b><div class="hint" style="margin:4px 0 10px">Administrador atual: <b>${esc(r.admin_email||'E-mail não informado')}</b>. Use o botão abaixo para enviar o primeiro convite ou reenviar o acesso.</div><button id="resendInviteV122" type="button" class="btn full" onclick="resendClientInviteV122('${r.id}')">Enviar / reenviar convite de acesso</button></div>
  <div class="panel" style="margin:14px 0;padding:14px"><b>Logo do estabelecimento</b><div class="hint" style="margin:4px 0 10px">A mesma imagem será usada no logo principal e no logozinho do topo. Se não enviar uma imagem, o site mostra apenas “LOGO”.</div><div id="clientLogoPreviewV1211"></div><label class="btn" style="display:inline-block;margin-top:10px;cursor:pointer">Enviar logo<input type="file" accept="image/*" style="display:none" onchange="readClientLogoV1211(this)"></label></div>
  <div class="panel" style="margin:14px 0;padding:14px"><b>Texto inicial do site</b><div class="hint" style="margin:4px 0 10px">Escreva livremente a chamada que aparecerá no banner inicial.</div><label>Título</label><input id="cseHeroTitleV1211" class="field" value="${escapeAttrV120(heroTitle)}" placeholder="Texto inicial do site"><label>Texto complementar (opcional)</label><textarea id="cseHeroTextV1211" class="field" rows="3" placeholder="Deixe em branco se não quiser texto abaixo">${esc(heroText)}</textarea></div>
  <label class="switchrow"><span><b>Loja ativa</b><small class="hint">Ative quando o cardápio estiver pronto.</small></span><input id="cseActiveV120" type="checkbox" ${r.active?'checked':''}></label>
  <div class="panel" style="margin:14px 0;padding:14px"><b>▦ QR Code enviado pelo cliente</b><div class="hint" style="margin:4px 0 10px">Imagem do QR Code salva junto ao cadastro desta empresa.</div><div id="clientQrPreviewV1201"></div><label class="btn" style="display:inline-block;margin-top:10px;cursor:pointer">Enviar QR Code<input type="file" accept="image/*" style="display:none" onchange="readQrUploadV1201(this)"></label></div>
  <button id="cseSaveBtnV120" class="btn full" onclick="saveClientSiteV120('${r.id}')">Salvar</button>
  <button class="dangerBtn full" style="margin-top:8px" onclick="deleteClientSiteV120('${r.id}')">Excluir esta loja</button>`);
  setTimeout(()=>{renderQrPreviewV1201();renderClientLogoPreviewV1211()},0);
};

saveClientSiteV120=async function(id){
  const row=window.clientSitesV120.find(x=>String(x.id)===String(id));if(!row)return;
  const name=$('#cseNameV120').value.trim(),slug=slugifyStoreV120($('#cseSlugV120').value),wa=$('#cseWaV120').value.replace(/\D/g,''),email=$('#cseEmailV120').value.trim().toLowerCase(),active=$('#cseActiveV120').checked;
  if(!name||!slug||!email){alert('Nome, slug e e-mail são obrigatórios.');return}
  const config=JSON.parse(JSON.stringify(row.config||cleanClientConfigV120(name,wa)));
  config.store=config.store||{};
  config.store.name=name;config.store.whatsapp=wa;config.store.hubSlug=slug;
  config.store.brandImage=window.clientLogoDraftV1211||'';
  config.store.heroTitle=($('#cseHeroTitleV1211')?.value||'').trim()||'Texto inicial do site';
  config.store.heroEmoji='';
  config.store.heroText=($('#cseHeroTextV1211')?.value||'').trim();
  config.store.clientQrImage=window.clientQrDraftV1201||'';
  // Limpa dados que lojas antigas possam ter herdado do Point.
  if(config.store.instagram==='@point_frontin')config.store.instagram='';
  if(/instagram\.com\/point_frontin/i.test(config.store.socialUrl||''))config.store.socialUrl='';
  if((config.store.address||'').includes('Avenida João Batista Ferrini'))config.store.address='';
  const btn=$('#cseSaveBtnV120');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
  const {error}=await supabaseClient.from('client_sites').update({name,slug,whatsapp:wa,admin_email:email,active,config,updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('Erro ao salvar: '+error.message);if(btn){btn.disabled=false;btn.textContent='Salvar'}return}
  closeModal();await openClientSitesMasterV120();
};


// ===== v1.22.0: ADMIN INDIVIDUAL + CONVITE AUTOMÁTICO =====
// A criação de lojas e convites passa por uma Edge Function segura.
const PEDEVIA_ADMIN_FUNCTION_V122='pedevia-admin';

function currentTenantSlugV122(){
  return window.pedeviaTenantV121?.slug||tenantSlugFromLocationV121();
}

async function invokePedeviaAdminV122(body){
  const {data,error}=await supabaseClient.functions.invoke(PEDEVIA_ADMIN_FUNCTION_V122,{body});
  if(error){
    let msg=error.message||'Falha no servidor da Pedevia.';
    try{
      const ctx=error.context;
      if(ctx && typeof ctx.json==='function'){
        const j=await ctx.json();
        if(j?.error)msg=j.error;
      }
    }catch(_e){}
    throw new Error(msg);
  }
  if(!data?.ok)throw new Error(data?.error||'Não foi possível concluir a operação.');
  return data;
}

// Criação automática: cria a loja e dispara o convite para o administrador.
createClientSiteV120=async function(){
  const name=$('#csNameV120').value.trim();
  const slug=slugifyStoreV120($('#csSlugV120').value||name);
  const wa=$('#csWaV120').value.replace(/\D/g,'');
  const email=$('#csEmailV120').value.trim().toLowerCase();
  if(!name||!slug||!email){alert('Preencha nome, endereço do site e e-mail do administrador.');return}
  const btn=$('#csCreateBtnV120');
  if(btn){btn.disabled=true;btn.textContent='Criando loja e enviando convite...'}
  try{
    const config=cleanClientConfigV120(name,wa);
    config.store.hubSlug=slug;
    const result=await invokePedeviaAdminV122({
      action:'create_site',name,slug,whatsapp:wa,admin_email:email,config,
      redirect_to:`${PEDEVIA_PUBLIC_BASE}/${encodeURIComponent(slug)}?definir-senha=1`
    });
    closeModal();
    await openClientSitesMasterV120();
    const site=result.site;
    const invite=result.invite||{};
    let text=`Loja “${name}” criada com sucesso.`;
    if(invite.sent) text+=`\n\nConvite enviado para ${email}. O cliente poderá definir a própria senha pelo e-mail.`;
    else if(invite.existing) text+=`\n\nEsse e-mail já possui uma conta. Ele já pode entrar com a senha existente.`;
    else text+=`\n\nA loja foi criada, mas o convite não foi enviado. Você pode reenviar em Gerenciar.`;
    alert(text);
    if(site?.id)setTimeout(()=>editClientSiteV120(site.id),120);
  }catch(e){
    console.error(e);alert('Não foi possível criar a loja: '+(e.message||e));
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Criar loja e enviar convite'}
  }
};

// Atualiza o texto do botão/modal de nova loja para deixar o fluxo evidente.
newClientSiteV120=function(){
  showModal(`<div class="row"><div><h2 style="margin:0">Nova loja</h2><div class="hint">Cria a loja na Pedevia e envia automaticamente um convite de acesso ao proprietário.</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
  <label>Nome do estabelecimento</label><input id="csNameV120" class="field" placeholder="Ex.: Pizzaria Central" oninput="document.getElementById('csSlugV120').value=slugifyStoreV120(this.value)">
  <label>Endereço do site (slug)</label><input id="csSlugV120" class="field" placeholder="pizzaria-central"><div class="hint">Ex.: pedevia.cardapioonline.workers.dev/pizzaria-central</div>
  <label>WhatsApp da loja</label><input id="csWaV120" class="field" inputmode="tel" placeholder="5524999999999">
  <label>E-mail do proprietário</label><input id="csEmailV120" class="field" type="email" placeholder="dono@empresa.com"><div class="hint">O cliente receberá um e-mail para criar a própria senha. Você não precisa cadastrar senha para ele.</div>
  <button id="csCreateBtnV120" class="btn full" data-pedevia-event="click" data-pedevia-call="createClientSiteV120">Criar loja e enviar convite</button>`);
};

async function resendClientInviteV122(id){
  const row=clientRowV121(id);if(!row)return;
  if(!row.admin_email){alert('Cadastre o e-mail do administrador primeiro.');return}
  try{
    const r=await invokePedeviaAdminV122({
      action:'invite_admin',site_id:row.id,admin_email:String(row.admin_email).trim().toLowerCase(),
      redirect_to:`${tenantPublicUrlV121(row.slug)}?definir-senha=1`
    });
    if(r.invite?.sent)alert('Convite enviado para '+row.admin_email+'.');
    else if(r.invite?.existing)alert('Esse e-mail já possui conta na Pedevia e pode entrar com a senha existente.');
    else alert('Não foi possível enviar o convite agora.');
  }catch(e){alert('Erro ao enviar convite: '+(e.message||e))}
}

// v1.22.1: o botão de convite agora faz parte diretamente do modal Gerenciar.
// Isso evita depender de inserção posterior no DOM em navegadores móveis.

async function loadTenantAdminRowV122(slug){
  const {data,error}=await supabaseClient.from('client_sites')
    .select('id,name,slug,whatsapp,active,config,admin_email')
    .eq('slug',slug).maybeSingle();
  if(error)throw error;
  return data||null;
}

async function saveTenantConfigV122(){
  const row=window.pedeviaTenantV121;
  if(!row?.id)return false;
  const payload=JSON.parse(JSON.stringify(cfg));
  const {error}=await supabaseClient.from('client_sites').update({
    name:cfg.store?.name||row.name,
    whatsapp:String(cfg.store?.whatsapp||row.whatsapp||'').replace(/\D/g,''),
    config:payload,
    updated_at:new Date().toISOString()
  }).eq('id',row.id);
  if(error)throw error;
  row.name=cfg.store?.name||row.name;
  row.whatsapp=cfg.store?.whatsapp||row.whatsapp;
  row.config=payload;
  return true;
}

// Todas as telas administrativas já existentes passam a salvar no registro da loja do cliente.
const _saveSiteConfigOnlineV122=saveSiteConfigOnline;
saveSiteConfigOnline=async function(){
  if(window.pedeviaTenantV121)return saveTenantConfigV122();
  return _saveSiteConfigOnlineV122();
};
const _syncAllProductsOnlineV122=syncAllProductsOnline;
syncAllProductsOnline=async function(){
  if(window.pedeviaTenantV121)return saveTenantConfigV122();
  return _syncAllProductsOnlineV122();
};
const _ensureSiteConfigInitializedV122=ensureSiteConfigInitialized;
ensureSiteConfigInitialized=async function(){
  if(window.pedeviaTenantV121)return true;
  return _ensureSiteConfigInitializedV122();
};

async function enterTenantAdminV122(){
  const slug=currentTenantSlugV122();
  if(!slug)throw new Error('Loja não identificada.');
  const row=await loadTenantAdminRowV122(slug);
  if(!row)throw new Error('Este usuário não possui acesso administrativo a esta loja.');
  applyTenantConfigV121(row);
  logged=true;
  $('#loginBox')?.classList.add('hide');
  $('#adminPanel')?.classList.remove('hide');
  const head=document.querySelector('#adminPanel .adminHead h2');if(head)head.textContent='Painel · '+(row.name||'Loja');
  renderAdmin();
  return true;
}

// Na loja do cliente, a engrenagem agora abre o Admin dela — não o Admin do Point.
switchMode=function(){
  mode=mode==='shop'?'admin':'shop';
  $('#shopView').classList.toggle('hide',mode!=='shop');
  $('#adminView').classList.toggle('hide',mode!=='admin');
  $('#cartBar').classList.toggle('hide',mode!=='shop');
  $('#modeBtn').textContent=mode==='shop'?'⚙️':'🛍️';
  if(mode==='admin'&&logged){
    if(window.pedeviaTenantV121)enterTenantAdminV122().catch(e=>{
      logged=false;$('#adminPanel')?.classList.add('hide');$('#loginBox')?.classList.remove('hide');
      if($('#loginMsg'))$('#loginMsg').textContent=e.message||String(e);
    });
    else renderAdmin();
  }
};

const _loginPointV122=login;
login=async function(){
  if(!tenantSlugFromLocationV121())return _loginPointV122();
  const email=($('#loginEmail')?.value||'').trim();
  const password=$('#loginPass')?.value||'';
  const msg=$('#loginMsg'),btn=$('#loginBtn');
  if(!email||!password){if(msg)msg.textContent='Digite e-mail e senha.';return}
  if(btn){btn.disabled=true;btn.textContent='Entrando...'}
  if(msg)msg.textContent='';
  try{
    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data.session)throw new Error('Sessão não iniciada.');
    await enterTenantAdminV122();
  }catch(e){
    console.error(e);
    try{await supabaseClient.auth.signOut()}catch(_e){}
    logged=false;
    if(msg)msg.textContent=e.message?.includes('acesso administrativo')?e.message:'Não foi possível entrar. Confira o e-mail e a senha.';
  }finally{if(btn){btn.disabled=false;btn.textContent='Entrar'}}
};

const _restoreAdminSessionPointV122=restoreAdminSession;
restoreAdminSession=async function(){
  if(!tenantSlugFromLocationV121())return _restoreAdminSessionPointV122();
  try{
    const {data}=await supabaseClient.auth.getSession();
    logged=!!data?.session;
    if(logged){
      try{await enterTenantAdminV122()}
      catch(e){
        logged=false;$('#adminPanel')?.classList.add('hide');$('#loginBox')?.classList.remove('hide');
      }
    }else{
      $('#adminPanel')?.classList.add('hide');$('#loginBox')?.classList.remove('hide');
    }
  }catch(e){console.error(e)}
};

function showSetPasswordV122(){
  if(document.getElementById('invitePasswordV122'))return;
  showModal(`<div id="invitePasswordV122"><div class="row"><div><h2 style="margin:0">Crie sua senha</h2><div class="hint">Seu acesso à Pedevia está quase pronto.</div></div></div>
    <label>Nova senha</label><input id="newPassV122" class="field" type="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres">
    <label>Repita a senha</label><input id="newPass2V122" class="field" type="password" autocomplete="new-password" placeholder="Repita a senha">
    <button id="setPassBtnV122" class="btn full" data-pedevia-event="click" data-pedevia-call="setInvitedPasswordV122">Salvar minha senha</button>
    <p id="setPassMsgV122" class="hint"></p></div>`);
}

async function setInvitedPasswordV122(){
  const p1=$('#newPassV122')?.value||'',p2=$('#newPass2V122')?.value||'',msg=$('#setPassMsgV122'),btn=$('#setPassBtnV122');
  if(p1.length<8){if(msg)msg.textContent='Use pelo menos 8 caracteres.';return}
  if(p1!==p2){if(msg)msg.textContent='As senhas não são iguais.';return}
  if(btn){btn.disabled=true;btn.textContent='Salvando...'}
  try{
    const {error}=await supabaseClient.auth.updateUser({password:p1});
    if(error)throw error;
    const u=new URL(location.href);u.searchParams.delete('definir-senha');history.replaceState({},'',u.pathname+u.search+u.hash);
    closeModal();alert('Senha criada com sucesso. Seu acesso administrativo está liberado.');
    await enterTenantAdminV122();
    mode='admin';$('#shopView').classList.add('hide');$('#adminView').classList.remove('hide');$('#cartBar').classList.add('hide');$('#modeBtn').textContent='🛍️';
  }catch(e){if(msg)msg.textContent='Não foi possível salvar a senha: '+(e.message||e)}
  finally{if(btn){btn.disabled=false;btn.textContent='Salvar minha senha'}}
}

async function maybeHandleInviteV122(){
  if(new URLSearchParams(location.search).get('definir-senha')!=='1')return;
  // O Supabase pode levar alguns instantes para converter o token do convite em sessão.
  for(let i=0;i<8;i++){
    const {data}=await supabaseClient.auth.getSession();
    if(data?.session){showSetPasswordV122();return}
    await new Promise(r=>setTimeout(r,250));
  }
  const msg=$('#loginMsg');if(msg)msg.textContent='Abra novamente o link do convite enviado para seu e-mail.';
}

const _loadTenantRowV121_v122=loadTenantRowV121;
loadTenantRowV121=async function(slug){
  let row=await _loadTenantRowV121_v122(slug);
  if(row)return row;
  if(new URLSearchParams(location.search).get('definir-senha')==='1'){
    // Dá tempo para o token de convite virar uma sessão antes de consultar um rascunho.
    for(let i=0;i<6;i++){
      await new Promise(r=>setTimeout(r,250));
      try{row=await loadTenantAdminRowV122(slug);if(row)return row}catch(_e){}
    }
  }
  return null;
};

document.addEventListener('DOMContentLoaded',()=>setTimeout(maybeHandleInviteV122,300));
supabaseClient.auth.onAuthStateChange((event,session)=>{
  if(session && new URLSearchParams(location.search).get('definir-senha')==='1')setTimeout(maybeHandleInviteV122,50);
});



// ===== v1.23.0: BOAS-VINDAS + TUTORIAL COMPLETO PEDEVIA =====
const PEDEVIA_TUTORIAL_V123=[
  {icon:'👋',title:'Bem-vindo à Pedevia',text:'Este painel é o centro de controle do seu estabelecimento. Você pode administrar a loja pelo celular e as alterações ficam salvas na sua própria empresa.',items:['Seu acesso é exclusivo desta loja.','A engrenagem abre o painel administrativo.','O ícone de sacola volta para a visão do cliente.']},
  {icon:'🏠',title:'Início do painel',text:'A tela inicial reúne atalhos e informações rápidas para você acompanhar o funcionamento do estabelecimento.',items:['Confira o estado da loja antes de divulgar o link.','Use os atalhos para chegar rapidamente às áreas mais usadas.','Mudanças feitas no painel refletem no cardápio público.']},
  {icon:'🍔',title:'Cardápio e produtos',text:'Aqui você monta o que o cliente realmente verá e poderá comprar.',items:['Crie, edite, organize e remova produtos.','Defina nome, descrição, preço, foto, categoria e disponibilidade.','Use Disponível, Indisponível ou Oculto para controlar a exibição sem precisar apagar o produto.','Organize categorias e seções para deixar o cardápio fácil de navegar.']},
  {icon:'➕',title:'Complementos, adicionais e regras',text:'Produtos podem ter grupos de escolhas para montar pedidos personalizados.',items:['Crie complementos, caldas, sabores, tamanhos e adicionais.','Defina mínimo e máximo de escolhas em cada grupo.','Adicione preço extra quando uma opção tiver acréscimo.','Controle individualmente se cada opção está disponível, indisponível ou oculta.']},
  {icon:'🧺',title:'Pedidos',text:'A área de pedidos concentra as configurações usadas no fechamento da compra.',items:['Configure entrega, retirada e consumo no local.','Defina pedido mínimo, taxa de entrega e bairros quando disponíveis.','Configure Pix, dinheiro, débito e crédito.','Revise as informações antes de começar a receber pedidos reais.']},
  {icon:'🏷️',title:'Ofertas e promoções',text:'Use ofertas para destacar condições especiais sem precisar alterar manualmente todo o cardápio.',items:['Crie promoções e descontos quando desejar.','Defina quando uma oferta está ativa.','Revise sempre o valor final exibido no checkout antes de divulgar uma promoção.']},
  {icon:'🎨',title:'Nome, logo e aparência',text:'A loja pode ter a identidade visual do seu estabelecimento.',items:['Envie a logo uma vez: ela aparece no topo e na apresentação principal.','Altere nome, textos iniciais, cores, estilos e modelos visuais.','Use a prévia para conferir como o cliente verá a loja.','Se não houver logo, a Pedevia mantém um espaço neutro em vez de usar a marca de outra empresa.']},
  {icon:'🕐',title:'Horários e funcionamento',text:'Mantenha os horários corretos para o cliente saber quando pode pedir.',items:['Configure dias e horários de atendimento.','Pause a loja manualmente quando necessário.','Personalize a mensagem exibida quando o estabelecimento estiver pausado ou fechado.']},
  {icon:'📍',title:'Contato, endereço e redes sociais',text:'Em Mais, você encontra os dados institucionais e canais de contato.',items:['Atualize WhatsApp, endereço e informações do estabelecimento.','Cadastre Instagram e outras redes disponíveis.','Configure título, descrição e imagem usados ao compartilhar o link da loja.']},
  {icon:'🔗',title:'Link, QR Code e divulgação',text:'Seu estabelecimento possui um link público próprio dentro da Pedevia.',items:['Compartilhe o link gerado para sua loja.','Use QR Code para facilitar o acesso ao cardápio.','No Painel Mestre também pode existir um QR Code enviado pelo estabelecimento para ficar arquivado no cadastro.']},
  {icon:'🛒',title:'Experiência do cliente',text:'Sempre teste a loja como se você fosse um cliente antes de divulgar.',items:['Abra a visão pública e navegue pelas categorias.','Monte produtos e confira regras obrigatórias de complementos.','Adicione itens ao carrinho e revise subtotal, descontos, entrega e total.','Faça um pedido de teste para confirmar o fluxo completo.']},
  {icon:'⚙️',title:'Configurações e ajuda',text:'Quase tudo que personaliza a operação fica em Mais.',items:['Nome e marca, aparência, horários, contato, endereço e redes sociais.','Compartilhamento, QR Code e configurações de pedidos.','Se esquecer alguma coisa, volte em Mais → Tutorial da Pedevia e faça este guia novamente quantas vezes quiser.']},
  {icon:'🚀',title:'Sua loja está pronta para ser montada',text:'Agora você já conhece o caminho. Comece pela identidade da loja, configure o funcionamento e depois cadastre o cardápio.',items:['1. Logo, nome e aparência','2. Contato, endereço e horários','3. Categorias, produtos e complementos','4. Pagamentos e entrega','5. Pedido de teste e publicação do link']}
];
window.pedeviaTutorialStepV123=0;

function tenantOnboardingDoneV123(){return !!cfg?.store?.pedeviaOnboardingCompleted}
async function markTenantOnboardingV123(done=true){
  if(!window.pedeviaTenantV121)return;
  cfg.store=cfg.store||{};
  cfg.store.pedeviaOnboardingCompleted=!!done;
  cfg.store.pedeviaOnboardingVersion='1.23';
  try{await saveTenantConfigV122()}catch(e){console.warn('Não foi possível salvar o estado do tutorial:',e)}
}

function tutorialProgressV123(){
  const n=PEDEVIA_TUTORIAL_V123.length,i=window.pedeviaTutorialStepV123;
  return `<div style="height:7px;background:#eee;border-radius:999px;overflow:hidden;margin:14px 0 18px"><div style="height:100%;width:${((i+1)/n)*100}%;background:var(--primary,#712489);border-radius:999px;transition:.25s"></div></div>`;
}
function renderTutorialV123(){
  const i=Math.max(0,Math.min(PEDEVIA_TUTORIAL_V123.length-1,window.pedeviaTutorialStepV123));
  const x=PEDEVIA_TUTORIAL_V123[i];
  const host=document.getElementById('pedeviaTutorialV123');if(!host)return;
  host.innerHTML=`<div style="text-align:center"><div style="font-size:52px;line-height:1">${x.icon}</div><div class="hint" style="margin-top:8px">Etapa ${i+1} de ${PEDEVIA_TUTORIAL_V123.length}</div><h2 style="margin:8px 0">${esc(x.title)}</h2></div>${tutorialProgressV123()}<p style="font-size:15px;line-height:1.55">${esc(x.text)}</p><div style="background:rgba(0,0,0,.035);border-radius:16px;padding:12px 14px;margin:14px 0">${x.items.map(v=>`<div style="display:flex;gap:9px;align-items:flex-start;margin:8px 0"><b style="color:var(--primary,#712489)">✓</b><span>${esc(v)}</span></div>`).join('')}</div><div style="display:flex;gap:8px;margin-top:18px"><button class="ghost" style="flex:1" data-pedevia-event="click" data-pedevia-call="tutorialPrevV123" ${i===0?'disabled':''}>← Voltar</button>${i<PEDEVIA_TUTORIAL_V123.length-1?`<button class="btn" style="flex:1" data-pedevia-event="click" data-pedevia-call="tutorialNextV123">Continuar →</button>`:`<button class="btn" style="flex:1" data-pedevia-event="click" data-pedevia-call="finishTutorialV123">Concluir tutorial ✓</button>`}</div><button class="ghost full" style="margin-top:10px" data-pedevia-event="click" data-pedevia-call="skipTutorialV123">Pular tutorial</button>`;
}
function openPedeviaTutorialV123(start=0){
  window.pedeviaTutorialStepV123=start;
  showModal(`<div id="pedeviaTutorialV123"></div>`);
  setTimeout(renderTutorialV123,0);
}
function tutorialNextV123(){if(window.pedeviaTutorialStepV123<PEDEVIA_TUTORIAL_V123.length-1){window.pedeviaTutorialStepV123++;renderTutorialV123()}}
function tutorialPrevV123(){if(window.pedeviaTutorialStepV123>0){window.pedeviaTutorialStepV123--;renderTutorialV123()}}
async function finishTutorialV123(){await markTenantOnboardingV123(true);closeModal();alert('Tutorial concluído. Você pode abri-lo novamente em Mais → Tutorial da Pedevia.')}
async function skipTutorialV123(){await markTenantOnboardingV123(true);closeModal();alert('Tutorial pulado. Quando quiser rever, abra Mais → Tutorial da Pedevia.')}

function showPedeviaWelcomeV123(){
  const name=window.pedeviaTenantV121?.name||cfg?.store?.name||'seu estabelecimento';
  showModal(`<div style="text-align:center;padding:6px 2px 2px"><div style="width:74px;height:74px;border-radius:24px;margin:0 auto 14px;display:grid;place-items:center;background:var(--primary,#712489);color:#fff;font-size:34px;font-weight:900">P</div><div class="hint">PEDEVIA</div><h2 style="font-size:27px;margin:6px 0 8px">Bem-vindo à sua nova loja! 👋</h2><p style="line-height:1.55;margin:0 auto 16px;max-width:420px">O acesso de <b>${esc(name)}</b> está pronto. Antes de começar, podemos te mostrar todo o sistema em um tutorial completo.</p><div style="background:rgba(0,0,0,.035);padding:13px;border-radius:16px;text-align:left;margin-bottom:16px"><b>Você vai aprender a:</b><div class="hint" style="margin-top:6px;line-height:1.5">Cadastrar produtos e adicionais · configurar pedidos e pagamentos · personalizar a loja · criar ofertas · ajustar horários · divulgar o link e QR Code · usar todas as configurações.</div></div><button class="btn full" onclick="closeModal();openPedeviaTutorialV123(0)">Fazer tutorial completo →</button><button class="ghost full" style="margin-top:8px" data-pedevia-event="click" data-pedevia-call="skipWelcomeV123">Pular tutorial e ir ao painel</button></div>`);
}
async function skipWelcomeV123(){await markTenantOnboardingV123(true);closeModal()}

// Depois de criar a senha, apresenta a Pedevia antes de abrir o tutorial.
setInvitedPasswordV122=async function(){
  const p1=$('#newPassV122')?.value||'',p2=$('#newPass2V122')?.value||'',msg=$('#setPassMsgV122'),btn=$('#setPassBtnV122');
  if(p1.length<8){if(msg)msg.textContent='Use pelo menos 8 caracteres.';return}
  if(p1!==p2){if(msg)msg.textContent='As senhas não são iguais.';return}
  if(btn){btn.disabled=true;btn.textContent='Criando minha senha...'}
  try{
    const {error}=await supabaseClient.auth.updateUser({password:p1});if(error)throw error;
    const u=new URL(location.href);u.searchParams.delete('definir-senha');history.replaceState({},'',u.pathname+u.search+u.hash);
    closeModal();
    await enterTenantAdminV122();
    mode='admin';$('#shopView').classList.add('hide');$('#adminView').classList.remove('hide');$('#cartBar').classList.add('hide');$('#modeBtn').textContent='🛍️';
    setTimeout(showPedeviaWelcomeV123,180);
  }catch(e){if(msg)msg.textContent='Não foi possível salvar a senha: '+(e.message||e)}
  finally{if(btn){btn.disabled=false;btn.textContent='Criar senha e continuar'}}
};

// Deixa a tela de definição de senha com aparência de primeiro acesso.
showSetPasswordV122=function(){
  if(document.getElementById('invitePasswordV122'))return;
  const name=window.pedeviaTenantV121?.name||cfg?.store?.name||'seu estabelecimento';
  showModal(`<div id="invitePasswordV122" style="text-align:center"><div style="width:70px;height:70px;border-radius:22px;margin:0 auto 12px;display:grid;place-items:center;background:var(--primary,#712489);color:#fff;font-size:32px;font-weight:900">P</div><div class="hint">PEDEVIA · PRIMEIRO ACESSO</div><h2 style="margin:7px 0">Olá! Sua loja está quase pronta 👋</h2><p class="hint" style="line-height:1.5">Crie uma senha para administrar <b>${esc(name)}</b>. Essa senha é somente sua e não fica disponível para quem criou a loja.</p><div style="text-align:left;margin-top:18px"><label>Crie sua senha</label><input id="newPassV122" class="field" type="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres"><label>Confirme sua senha</label><input id="newPass2V122" class="field" type="password" autocomplete="new-password" placeholder="Digite novamente"><div class="hint">✓ Mínimo de 8 caracteres &nbsp; · &nbsp; ✓ As duas senhas devem ser iguais</div></div><button id="setPassBtnV122" class="btn full" style="margin-top:16px" data-pedevia-event="click" data-pedevia-call="setInvitedPasswordV122">Criar senha e continuar</button><p id="setPassMsgV122" class="hint"></p></div>`);
};

// Acrescenta um acesso permanente ao tutorial em Mais para administradores de lojas Pedevia.
const _adminMoreBeforeTutorialV123=adminMore;
adminMore=function(){
  _adminMoreBeforeTutorialV123();
  if(!window.pedeviaTenantV121)return;
  const list=document.querySelector('#adminContent .moreList');
  if(!list||document.getElementById('pedeviaTutorialCardV123'))return;
  const holder=document.createElement('div');holder.id='pedeviaTutorialCardV123';
  holder.innerHTML=moreCard('🎓','Tutorial da Pedevia','Rever o guia completo de todas as funcionalidades','openPedeviaTutorialV123(0)');
  list.insertBefore(holder,list.firstChild);
};


// ===== v1.23.1: CORREÇÃO RESPONSIVA DO PAINEL MESTRE =====
(function(){
  const st=document.createElement('style');
  st.id='pedeviaMasterResponsiveV1231';
  st.textContent=`
    #clientSitesListV120 .adminItem{
      width:100%;
      min-width:0;
      box-sizing:border-box;
    }
    #clientSitesListV120 .adminItem>div:first-child{
      min-width:0;
      overflow-wrap:anywhere;
      word-break:break-word;
    }
    #clientSitesListV120 .adminItem>div:first-child small,
    #clientSitesListV120 .adminItem>div:first-child .hint{
      overflow-wrap:anywhere;
      word-break:break-word;
    }
    #clientSitesListV120 .miniBtns{
      max-width:100%;
      box-sizing:border-box;
    }
    #clientSitesListV120 .miniBtns .ghost{
      white-space:normal;
      line-height:1.15;
      min-height:42px;
      box-sizing:border-box;
    }
    @media (max-width:680px){
      #clientSitesListV120 .adminItem{
        display:block !important;
        padding:14px 0 !important;
      }
      #clientSitesListV120 .adminItem>div:first-child{
        width:100%;
        padding-right:0;
      }
      #clientSitesListV120 .miniBtns{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:7px !important;
        width:100%;
        margin-top:12px;
        justify-content:stretch !important;
      }
      #clientSitesListV120 .miniBtns .ghost{
        width:100%;
        min-width:0;
        padding:10px 6px;
        font-size:13px;
        border-radius:12px;
      }
    }
    @media (max-width:390px){
      #clientSitesListV120 .miniBtns{
        grid-template-columns:1fr;
      }
      #clientSitesListV120 .miniBtns .ghost{
        font-size:14px;
      }
    }
  `;
  document.head.appendChild(st);
})();




// ===== v1.24.0: RESPONSIVIDADE + TUTORIAL PRÁTICO GUIADO =====
(function(){
  const st=document.createElement('style');
  st.id='pedeviaV124Styles';
  st.textContent=`
    html,body{max-width:100%;overflow-x:hidden!important}
    .wrap,#adminView,#adminContent,.panel,.moreList,.moreCard,.settingsList,.settingCard{min-width:0;max-width:100%}
    #adminView,#adminContent,.panel,.moreList{width:100%}
    .moreCard,.settingCard{grid-template-columns:34px minmax(0,1fr) 20px!important;width:100%;overflow:hidden}
    .moreCard>span:nth-child(2),.settingCard>span:nth-child(2){min-width:0;overflow:hidden}
    .moreCard b,.settingCard b{overflow-wrap:anywhere;word-break:normal}
    .moreCard small,.settingCard small{max-width:100%}
    @media(max-width:560px){
      .wrap{width:100%;max-width:100%;padding-left:12px!important;padding-right:12px!important}
      .panel{padding-left:12px!important;padding-right:12px!important}
      .moreCard,.settingCard{padding:13px 12px!important;gap:9px!important}
      .moreCard small,.settingCard small{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.3}
      .settingsTitle{font-size:24px}
    }
    #pedeviaCoachV124{
      position:fixed;z-index:46;left:10px;right:10px;bottom:calc(78px + env(safe-area-inset-bottom));
      background:#fff;border:1px solid rgba(113,36,137,.22);border-radius:20px;padding:13px 14px;
      box-shadow:0 12px 38px #0003;color:var(--ink);max-width:620px;margin:auto;
    }
    #pedeviaCoachV124 .pcTop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
    #pedeviaCoachV124 .pcStep{font-size:11px;font-weight:900;letter-spacing:.04em;color:var(--p);text-transform:uppercase}
    #pedeviaCoachV124 .pcTitle{font-size:17px;font-weight:900;margin:2px 0 3px}
    #pedeviaCoachV124 .pcText{font-size:13px;line-height:1.38;color:var(--muted)}
    #pedeviaCoachV124 .pcProgress{height:5px;background:#eee;border-radius:999px;overflow:hidden;margin:9px 0 10px}
    #pedeviaCoachV124 .pcProgress>span{display:block;height:100%;background:var(--p);border-radius:999px}
    #pedeviaCoachV124 .pcActions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    #pedeviaCoachV124 .pcActions button{padding:9px 8px;font-size:12px}
    #pedeviaCoachV124 .pcClose{border:0;background:transparent;font-size:20px;padding:0 2px;color:#777}
    body.pedeviaTutorialActiveV124 .wrap{padding-bottom:250px!important}
  `;
  document.head.appendChild(st);
})();

const PEDEVIA_PRACTICAL_TUTORIAL_V124=[
  {title:'Nome e marca',text:'Abra a identidade da loja. Troque o nome ou a logo e toque em Salvar. A alteração é real e ficará gravada.',open:()=>{adminTab='more';renderAdmin();generalBrand();}},
  {title:'Aparência e textos',text:'Teste uma cor, banner, estilo ou texto da loja e salve para ver como a personalização funciona.',open:()=>{adminTab='more';renderAdmin();generalAppearanceV116();}},
  {title:'Horários de atendimento',text:'Configure pelo menos um dia de funcionamento e toque em Salvar horários.',open:()=>{adminTab='more';renderAdmin();generalHours();}},
  {title:'Contato',text:'Confira o WhatsApp e o e-mail do estabelecimento. Faça uma alteração de teste e salve.',open:()=>{adminTab='more';renderAdmin();generalContact();}},
  {title:'Endereço',text:'Confira o endereço que aparecerá para o cliente. Faça uma pequena edição e salve.',open:()=>{adminTab='more';renderAdmin();generalAddress();}},
  {title:'Redes sociais',text:'Cadastre ou edite o Instagram da loja e salve. Isso ficará disponível na página pública.',open:()=>{adminTab='more';renderAdmin();generalSocial();}},
  {title:'Compartilhamento',text:'Edite o título ou a descrição usados quando o link da loja for compartilhado e salve.',open:()=>{adminTab='more';renderAdmin();generalSharing();}},
  {title:'Cardápio e seções',text:'Agora vá para o cardápio. Crie uma seção ou edite uma existente para entender a organização da vitrine.',open:()=>{adminTab='menu';adminSubTab='products';renderAdmin();}},
  {title:'Produto na prática',text:'Cadastre um produto de teste ou edite um produto existente: nome, preço, descrição, imagem e disponibilidade. Salve ao terminar.',open:()=>{adminTab='menu';adminSubTab='products';renderAdmin();}},
  {title:'Complementos e estoque',text:'Abra Complementos e estoque. Edite uma regra, adicional ou disponibilidade e salve.',open:()=>{adminTab='menu';adminSubTab='stock';renderAdmin();}},
  {title:'Pedidos',text:'Conheça as configurações de pedidos. Entre em uma opção, altere um dado de teste e salve para avançar.',open:()=>{adminTab='orders';adminOrdersView='config';renderAdmin();}},
  {title:'Formas de pagamento',text:'Dentro de Pedidos, abra Formas de pagamentos. Ative ou confira uma forma de pagamento e salve.',open:()=>{adminTab='orders';adminOrdersView='config';renderAdmin();setTimeout(()=>{try{editPaymentSettings()}catch(e){}},120);}},
  {title:'Entrega, retirada e consumo local',text:'Abra uma modalidade de atendimento, confira suas regras e salve uma alteração de teste.',open:()=>{adminTab='orders';adminOrdersView='config';renderAdmin();}},
  {title:'Ofertas e fidelidade',text:'Abra Ofertas. Crie uma promoção de teste ou edite uma existente e salve. Depois você pode desativá-la quando quiser.',open:()=>{adminTab='offers';renderAdmin();}},
  {title:'QR Code',text:'Veja o QR Code e o link da loja. Esta etapa é de consulta: use Próxima etapa quando terminar.',open:()=>{adminTab='more';renderAdmin();generalQr();},manual:true},
  {title:'Teste final da loja',text:'Abra a loja como cliente, monte um pedido de teste e confira toda a experiência. O tutorial poderá ser aberto novamente em Mais.',open:()=>{mode='shop';$('#adminView').classList.add('hide');$('#shopView').classList.remove('hide');$('#cartBar').classList.remove('hide');$('#modeBtn').textContent='⚙️';renderShop();},manual:true}
];
window.pedeviaTutorialStepV124=0;
window.pedeviaTutorialActiveV124=false;
window.pedeviaTutorialAdvancingV124=false;

function saveTutorialProgressV124(done=false){
  if(!window.pedeviaTenantV121)return;
  cfg.store=cfg.store||{};
  cfg.store.pedeviaTutorialPracticalStep=window.pedeviaTutorialStepV124;
  cfg.store.pedeviaTutorialPracticalCompleted=!!done;
  cfg.store.pedeviaOnboardingVersion='1.24';
  try{saveTenantConfigV122()}catch(e){console.warn(e)}
}
function removeTutorialCoachV124(){
  document.getElementById('pedeviaCoachV124')?.remove();
  document.body.classList.remove('pedeviaTutorialActiveV124');
}
function renderTutorialCoachV124(){
  removeTutorialCoachV124();
  if(!window.pedeviaTutorialActiveV124)return;
  const i=window.pedeviaTutorialStepV124;
  const x=PEDEVIA_PRACTICAL_TUTORIAL_V124[i];
  if(!x)return;
  const host=document.createElement('div');host.id='pedeviaCoachV124';
  const pct=Math.round(((i+1)/PEDEVIA_PRACTICAL_TUTORIAL_V124.length)*100);
  host.innerHTML=`<div class="pcTop"><div><div class="pcStep">Tutorial prático · ${i+1}/${PEDEVIA_PRACTICAL_TUTORIAL_V124.length}</div><div class="pcTitle">${esc(x.title)}</div></div><button class="pcClose" data-pedevia-event="click" data-pedevia-call="pausePracticalTutorialV124">×</button></div><div class="pcText">${esc(x.text)}</div><div class="pcProgress"><span style="width:${pct}%"></span></div><div class="pcActions"><button class="ghost" data-pedevia-event="click" data-pedevia-call="skipPracticalStepV124">Pular etapa</button><button class="btn" data-pedevia-event="click" data-pedevia-call="nextPracticalTutorialV124">${i===PEDEVIA_PRACTICAL_TUTORIAL_V124.length-1?'Concluir tutorial':'Próxima etapa →'}</button></div>`;
  document.body.appendChild(host);document.body.classList.add('pedeviaTutorialActiveV124');
}
function openPracticalStepV124(){
  const x=PEDEVIA_PRACTICAL_TUTORIAL_V124[window.pedeviaTutorialStepV124];if(!x)return;
  try{x.open()}catch(e){console.error('Tutorial:',e)}
  setTimeout(renderTutorialCoachV124,180);
  saveTutorialProgressV124(false);
}
function openPedeviaTutorialV123(start){
  closeModal();
  const saved=Number(cfg?.store?.pedeviaTutorialPracticalStep||0);
  window.pedeviaTutorialStepV124=Number.isFinite(start)?Math.max(0,Math.min(PEDEVIA_PRACTICAL_TUTORIAL_V124.length-1,start)) : Math.max(0,Math.min(PEDEVIA_PRACTICAL_TUTORIAL_V124.length-1,saved));
  window.pedeviaTutorialActiveV124=true;
  openPracticalStepV124();
}
function nextPracticalTutorialV124(){
  if(!window.pedeviaTutorialActiveV124||window.pedeviaTutorialAdvancingV124)return;
  window.pedeviaTutorialAdvancingV124=true;
  setTimeout(()=>window.pedeviaTutorialAdvancingV124=false,500);
  if(window.pedeviaTutorialStepV124>=PEDEVIA_PRACTICAL_TUTORIAL_V124.length-1){
    saveTutorialProgressV124(true);markTenantOnboardingV123(true);window.pedeviaTutorialActiveV124=false;removeTutorialCoachV124();
    if(mode!=='admin'){mode='admin';$('#shopView').classList.add('hide');$('#adminView').classList.remove('hide');$('#cartBar').classList.add('hide');$('#modeBtn').textContent='🛍️';}
    adminTab='home';renderAdmin();alert('Tutorial prático concluído! Você pode refazê-lo quando quiser em Mais → Tutorial da Pedevia.');return;
  }
  window.pedeviaTutorialStepV124++;
  openPracticalStepV124();
}
function skipPracticalStepV124(){nextPracticalTutorialV124()}
function pausePracticalTutorialV124(){
  saveTutorialProgressV124(false);window.pedeviaTutorialActiveV124=false;removeTutorialCoachV124();
  alert('Tutorial pausado. Você pode continuar depois em Mais → Tutorial da Pedevia.');
}

// Ao tocar em um botão real de salvar/concluir durante o tutorial, a alteração é salva
// pela própria tela e o guia avança automaticamente para a próxima atividade.
document.addEventListener('click',function(ev){
  if(!window.pedeviaTutorialActiveV124)return;
  const b=ev.target?.closest?.('button');if(!b||b.closest('#pedeviaCoachV124'))return;
  const t=(b.textContent||'').trim().toLowerCase();
  if(!/(salvar|concluir|criar produto|adicionar produto|criar oferta)/.test(t))return;
  setTimeout(()=>{if(window.pedeviaTutorialActiveV124)nextPracticalTutorialV124()},700);
},true);

// O primeiro acesso agora abre diretamente o tutorial prático, mantendo a opção de pular.
showPedeviaWelcomeV123=function(){
  const name=window.pedeviaTenantV121?.name||cfg?.store?.name||'seu estabelecimento';
  showModal(`<div style="text-align:center;padding:6px 2px 2px"><div style="width:74px;height:74px;border-radius:24px;margin:0 auto 14px;display:grid;place-items:center;background:var(--primary,#712489);color:#fff;font-size:34px;font-weight:900">P</div><div class="hint">PEDEVIA</div><h2 style="font-size:27px;margin:6px 0 8px">Bem-vindo à sua nova loja! 👋</h2><p style="line-height:1.55;margin:0 auto 16px;max-width:420px">O acesso de <b>${esc(name)}</b> está pronto. Agora você pode aprender usando as telas reais da sua loja.</p><div style="background:rgba(0,0,0,.035);padding:13px;border-radius:16px;text-align:left;margin-bottom:16px"><b>Tutorial prático:</b><div class="hint" style="margin-top:6px;line-height:1.5">O guia abre cada configuração, explica o que fazer e acompanha você enquanto realiza alterações reais. Ao salvar uma etapa, seguimos automaticamente para a próxima.</div></div><button class="btn full" onclick="closeModal();openPedeviaTutorialV123(0)">Começar tutorial prático →</button><button class="ghost full" style="margin-top:8px" data-pedevia-event="click" data-pedevia-call="skipWelcomeV123">Pular tutorial e ir ao painel</button></div>`);
};

// ===== v1.24.2: IDENTIDADE CORRETA NO PRIMEIRO ACESSO =====
function tenantNameV1242(){
  // Em rotas de estabelecimentos, o registro de client_sites é a fonte principal.
  // Isso impede que o nome padrão do Point apareça durante o carregamento inicial.
  const tenantName=String(window.pedeviaTenantV121?.name||'').trim();
  if(tenantName)return tenantName;
  const cfgName=String(cfg?.store?.name||'').trim();
  if(window.pedeviaTenantV121 && /point do açaí frontin/i.test(cfgName))return 'seu estabelecimento';
  return cfgName||'seu estabelecimento';
}

showSetPasswordV122=function(){
  if(document.getElementById('invitePasswordV122'))return;
  const name=tenantNameV1242();
  showModal(`<div id="invitePasswordV122" style="text-align:center"><div style="width:70px;height:70px;border-radius:22px;margin:0 auto 12px;display:grid;place-items:center;background:var(--primary,#712489);color:#fff;font-size:32px;font-weight:900">P</div><div class="hint">PEDEVIA · PRIMEIRO ACESSO</div><h2 style="margin:7px 0">Olá! Sua loja está quase pronta 👋</h2><p class="hint" style="line-height:1.5">Crie uma senha para administrar <b>${esc(name)}</b>. Essa senha é somente sua e não fica disponível para quem criou a loja.</p><div style="text-align:left;margin-top:18px"><label>Crie sua senha</label><input id="newPassV122" class="field" type="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres"><label>Confirme sua senha</label><input id="newPass2V122" class="field" type="password" autocomplete="new-password" placeholder="Digite novamente"><div class="hint">✓ Mínimo de 8 caracteres &nbsp; · &nbsp; ✓ As duas senhas devem ser iguais</div></div><button id="setPassBtnV122" class="btn full" style="margin-top:16px" data-pedevia-event="click" data-pedevia-call="setInvitedPasswordV122">Criar senha e continuar</button><p id="setPassMsgV122" class="hint"></p></div>`);
};

showPedeviaWelcomeV123=function(){
  const name=tenantNameV1242();
  showModal(`<div style="text-align:center;padding:6px 2px 2px"><div style="width:74px;height:74px;border-radius:24px;margin:0 auto 14px;display:grid;place-items:center;background:var(--primary,#712489);color:#fff;font-size:34px;font-weight:900">P</div><div class="hint">PEDEVIA</div><h2 style="font-size:27px;margin:6px 0 8px">Bem-vindo à sua nova loja! 👋</h2><p style="line-height:1.55;margin:0 auto 16px;max-width:420px">O acesso de <b>${esc(name)}</b> está pronto. Agora você pode aprender usando as telas reais da sua loja.</p><div style="background:rgba(0,0,0,.035);padding:13px;border-radius:16px;text-align:left;margin-bottom:16px"><b>Tutorial prático:</b><div class="hint" style="margin-top:6px;line-height:1.5">O guia abre cada configuração, explica o que fazer e acompanha você enquanto realiza alterações reais. Ao salvar uma etapa, seguimos automaticamente para a próxima.</div></div><button class="btn full" onclick="closeModal();openPedeviaTutorialV123(0)">Começar tutorial prático →</button><button class="ghost full" style="margin-top:8px" data-pedevia-event="click" data-pedevia-call="skipWelcomeV123">Pular tutorial e ir ao painel</button></div>`);
};

// ===== v1.24.3: NOME DO ESTABELECIMENTO GARANTIDO NO LINK DE CONVITE =====
// O link de convite pode abrir antes de o tenant terminar de carregar. Nesse caso,
// buscamos explicitamente o estabelecimento pelo slug antes de montar a tela de senha.
window.pedeviaInviteTenantNameV1243='';

async function resolveInviteTenantNameV1243(){
  const current=String(window.pedeviaTenantV121?.name||'').trim();
  if(current){window.pedeviaInviteTenantNameV1243=current;return current}

  const slug=tenantSlugFromLocationV121();
  if(slug){
    try{
      let row=null;
      // Primeiro tenta a rota pública, que funciona mesmo durante a conversão do convite em sessão.
      try{row=await loadTenantRowV121(slug)}catch(_e){}
      // Se já houver sessão autenticada, tenta também a leitura administrativa.
      if(!row){try{row=await loadTenantAdminRowV122(slug)}catch(_e){}}
      if(row?.name){
        window.pedeviaTenantV121=row;
        window.pedeviaInviteTenantNameV1243=String(row.name).trim();
        return window.pedeviaInviteTenantNameV1243;
      }
    }catch(e){console.warn('Não foi possível resolver o nome do tenant no convite.',e)}
  }

  const cfgName=String(cfg?.store?.name||'').trim();
  if(slug && /point do açaí frontin/i.test(cfgName))return 'seu estabelecimento';
  return cfgName||'seu estabelecimento';
}

showSetPasswordV122=function(){
  if(document.getElementById('invitePasswordV122'))return;
  const name=String(window.pedeviaInviteTenantNameV1243||tenantNameV1242()||'seu estabelecimento').trim();
  showModal(`<div id="invitePasswordV122" style="text-align:center"><div style="width:70px;height:70px;border-radius:22px;margin:0 auto 12px;display:grid;place-items:center;background:var(--primary,#712489);color:#fff;font-size:32px;font-weight:900">P</div><div class="hint">PEDEVIA · PRIMEIRO ACESSO</div><h2 style="margin:7px 0">Olá! Sua loja está quase pronta 👋</h2><p class="hint" style="line-height:1.5">Crie uma senha para administrar <b>${esc(name)}</b>. Essa senha é somente sua e não fica disponível para quem criou a loja.</p><div style="text-align:left;margin-top:18px"><label>Crie sua senha</label><input id="newPassV122" class="field" type="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres"><label>Confirme sua senha</label><input id="newPass2V122" class="field" type="password" autocomplete="new-password" placeholder="Digite novamente"><div class="hint">✓ Mínimo de 8 caracteres &nbsp; · &nbsp; ✓ As duas senhas devem ser iguais</div></div><button id="setPassBtnV122" class="btn full" style="margin-top:16px" data-pedevia-event="click" data-pedevia-call="setInvitedPasswordV122">Criar senha e continuar</button><p id="setPassMsgV122" class="hint"></p></div>`);
};

maybeHandleInviteV122=async function(){
  if(new URLSearchParams(location.search).get('definir-senha')!=='1')return;
  for(let i=0;i<8;i++){
    const {data}=await supabaseClient.auth.getSession();
    if(data?.session){
      await resolveInviteTenantNameV1243();
      showSetPasswordV122();
      return;
    }
    await new Promise(r=>setTimeout(r,250));
  }
  const msg=$('#loginMsg');if(msg)msg.textContent='Abra novamente o link do convite enviado para seu e-mail.';
};

// Exibe a versão nova no cabeçalho administrativo.
setTimeout(()=>{
  document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.2[0-9]/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.2[0-9.]+/i,'Versão 1.33.0')});
},0);


// ===== v1.25.0: HORÁRIO BLOQUEIA CARRINHO + PAINEL ONLINE DE PEDIDOS =====
// Regra global da Pedevia: vale para o Point e para todos os estabelecimentos atuais e futuros.

function currentStoreKeyV125(){
  const slug=String(window.pedeviaTenantV121?.slug||tenantSlugFromLocationV121()||'').trim();
  return slug||'point-frontin';
}
function currentStoreNameV125(){
  return String(window.pedeviaTenantV121?.name||cfg?.store?.name||'Estabelecimento').trim()||'Estabelecimento';
}
function storeAcceptingOrdersV125(){
  const st=openState();
  return !!st.open;
}
function closedOrderMessageV125(){
  const st=openState();
  return `O estabelecimento não está recebendo pedidos agora. ${st.text||''}`.trim();
}

// Mantém o cardápio totalmente navegável quando fechado, mas impede qualquer item novo no carrinho.
const _addCartV125Base=addCart;
addCart=function(pid){
  if(!storeAcceptingOrdersV125()){
    alert(closedOrderMessageV125()+' Você pode consultar o cardápio e montar as opções, mas só poderá adicionar ao carrinho durante o horário de funcionamento.');
    return;
  }
  return _addCartV125Base(pid);
};

// Segurança adicional: se o horário virar enquanto o cliente está com o carrinho aberto,
// ele não consegue iniciar/finalizar um pedido fora do expediente.
const _beginCheckoutV125Base=beginCheckout;
beginCheckout=function(){
  if(!storeAcceptingOrdersV125()){
    alert(closedOrderMessageV125()+' O carrinho foi preservado para você continuar quando a loja abrir.');
    return;
  }
  return _beginCheckoutV125Base();
};

// Corrige a mensagem pública de loja fechada em todas as lojas.
const _renderShopV125Base=renderShop;
renderShop=function(){
  _renderShopV125Base();
  const st=openState();
  const notice=document.getElementById('closedNotice');
  if(notice && !st.open){
    notice.innerHTML=`<div class="notice bad"><b>Pedidos fechados no momento.</b><br>Você pode consultar o cardápio e selecionar opções, mas só poderá adicionar produtos ao carrinho durante o horário de funcionamento.</div>`;
  }
};

function orderStatusLabelV125(status){
  return ({new:'Novo',accepted:'Aceito',preparing:'Preparando',ready:'Pronto',completed:'Concluído',cancelled:'Cancelado'})[status]||status||'Novo';
}
function orderStatusClassV125(status){
  return ['completed','ready'].includes(status)?'available':status==='cancelled'?'unavailable':'hidden';
}
function orderModeLabelV125(mode){return mode==='delivery'?'Entrega':mode==='pickup'?'Retirada':mode==='dinein'?'Consumo no local':mode||'-'}
function orderDateV125(v){
  try{return new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(_e){return ''}
}
function orderNumberV125(o){return '#'+String(o.order_number||o.id||'').replace(/[^0-9A-Za-z-]/g,'').slice(-10)}

async function createOnlineOrderV125(){
  if(!storeAcceptingOrdersV125())throw new Error('O estabelecimento fechou antes da finalização. Tente novamente no próximo horário de funcionamento.');
  const st=window.checkoutState||{};
  const t=typeof checkoutTotalsV111==='function'?checkoutTotalsV111():{sub:sum(),total:sum()};
  const text=typeof buildOrderTextV111==='function'?buildOrderTextV111():'';
  const items=(cart||[]).map(i=>{
    const p=(cfg.products||[]).find(x=>x.id===i.pid);
    return {product_id:i.pid,name:p?.name||'Produto',variant:i.variantName||'',quantity:+i.qty||1,unit_price:+i.unit||0,groups:i.groups||[],note:i.obs||''};
  });
  const payload={
    store_key:currentStoreKeyV125(),
    store_name:currentStoreNameV125(),
    customer_name:String(st.customer||document.getElementById('coName')?.value||'').trim(),
    customer_phone:String(st.phone||document.getElementById('coPhone')?.value||'').trim(),
    order_mode:String(st.mode||''),
    address:String(st.address||''),
    neighborhood:String(st.neighborhood||''),
    table_number:String(st.table||''),
    payment_method:String(st.payment||''),
    note:String(st.note||document.getElementById('coObs')?.value||'').trim(),
    items,
    subtotal:Number(t.sub||0),
    discount:Number((t.promoDiscount||0)+(t.loyaltyDiscount||0)),
    delivery_fee:Number(t.delivery||0),
    payment_adjustment:Number(t.payAdj||0),
    service_fee:Number(t.service||0),
    total:Number(t.total||0),
    status:'new',
    whatsapp_text:text
  };
  // Usa RPC SECURITY DEFINER para permitir que clientes anônimos registrem
  // pedidos sem depender de leitura direta da tabela client_sites sob RLS.
  const {data,error}=await supabaseClient.rpc('register_pedevia_order_v1261',{
    p_store_key:payload.store_key,
    p_store_name:payload.store_name,
    p_customer_name:payload.customer_name,
    p_customer_phone:payload.customer_phone,
    p_order_mode:payload.order_mode,
    p_address:payload.address,
    p_neighborhood:payload.neighborhood,
    p_table_number:payload.table_number,
    p_payment_method:payload.payment_method,
    p_note:payload.note,
    p_items:payload.items,
    p_subtotal:payload.subtotal,
    p_discount:payload.discount,
    p_delivery_fee:payload.delivery_fee,
    p_payment_adjustment:payload.payment_adjustment,
    p_service_fee:payload.service_fee,
    p_total:payload.total,
    p_whatsapp_text:payload.whatsapp_text
  });
  if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;
  if(!row)throw new Error('O pedido não retornou confirmação do servidor.');
  return row;
}

async function fetchOrdersV125(){
  const key=currentStoreKeyV125();
  const {data,error}=await supabaseClient.from('pedevia_orders').select('*').eq('store_key',key).order('created_at',{ascending:false}).limit(200);
  if(error)throw error;
  return Array.isArray(data)?data:[];
}

function orderCopyTextV125(o){
  if(o.whatsapp_text)return o.whatsapp_text;
  const lines=[`*PEDIDO ${orderNumberV125(o)} · ${o.store_name||currentStoreNameV125()}*`,''];
  (o.items||[]).forEach(i=>lines.push(`*${i.quantity||1}x ${i.name||'Produto'}* — ${brl((+i.unit_price||0)*(+i.quantity||1))}`));
  lines.push('',`Cliente: ${o.customer_name||'-'}`,`Celular: ${o.customer_phone||'-'}`,`Tipo: ${orderModeLabelV125(o.order_mode)}`,`Pagamento: ${paymentKeyLabel(o.payment_method)}`,`*TOTAL: ${brl(+o.total||0)}*`);
  return lines.join('\n');
}
async function copyOrderV125(id){
  const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;
  try{await navigator.clipboard.writeText(orderCopyTextV125(o));alert('Pedido copiado. Agora é só colar no WhatsApp do cliente.')}catch(_e){prompt('Copie o pedido:',orderCopyTextV125(o))}
}
function viewOrderV125(id){
  const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;
  const items=(o.items||[]).map(i=>`<div class="summary"><div class="row"><b>${i.quantity||1}x ${esc(i.name||'Produto')}${i.variant?' · '+esc(i.variant):''}</b><b>${brl((+i.unit_price||0)*(+i.quantity||1))}</b></div>${(i.groups||[]).map(g=>`<small><b>${esc(g.name||'Complementos')}:</b> ${(g.items||[]).map(x=>esc(x.name||x)).join(', ')}</small>`).join('')}${i.note?`<small>Obs.: ${esc(i.note)}</small>`:''}</div>`).join('');
  showModal(`<div class="row"><div><h2 style="margin:0">Pedido ${orderNumberV125(o)}</h2><div class="hint">${orderDateV125(o.created_at)}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>${items}<div class="summary"><div><b>${esc(o.customer_name||'-')}</b> · ${esc(o.customer_phone||'-')}</div><small>${orderModeLabelV125(o.order_mode)}${o.neighborhood?' · '+esc(o.neighborhood):''}${o.address?' · '+esc(o.address):''}${o.table_number?' · Mesa '+esc(o.table_number):''}</small><small>Pagamento: ${esc(paymentKeyLabel(o.payment_method))}</small>${o.note?`<small>Obs.: ${esc(o.note)}</small>`:''}<div class="row" style="margin-top:8px"><strong>Total</strong><strong>${brl(+o.total||0)}</strong></div></div><label>Status</label><select id="orderStatusV125" class="field"><option value="new">Novo</option><option value="accepted">Aceito</option><option value="preparing">Preparando</option><option value="ready">Pronto</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select><button class="btn full" onclick="updateOrderStatusV125('${o.id}')">Salvar status</button><button class="ghost full" style="margin-top:8px" onclick="copyOrderV125('${o.id}')">Copiar pedido</button>`);
  setTimeout(()=>{const s=document.getElementById('orderStatusV125');if(s)s.value=o.status||'new'},0);
}
async function updateOrderStatusV125(id){
  const status=document.getElementById('orderStatusV125')?.value||'new';
  const {error}=await supabaseClient.from('pedevia_orders').update({status,updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('Não foi possível atualizar o pedido: '+error.message);return}
  closeModal();await loadOrdersPanelV125();
}

async function loadOrdersPanelV125(){
  if(adminTab!=='orders'||adminOrdersView==='config')return;
  const host=document.getElementById('ordersListV125');if(!host)return;
  host.innerHTML='<div class="panel"><p class="hint">Atualizando pedidos...</p></div>';
  try{
    const rows=await fetchOrdersV125();window.pedeviaOrdersV125=rows;
    const newCount=rows.filter(o=>o.status==='new').length;
    const body=rows.length?rows.map(o=>`<div class="panel" style="padding:13px"><div class="row"><div><b style="font-size:17px">${orderNumberV125(o)}</b> <span class="badge ${orderStatusClassV125(o.status)}">${orderStatusLabelV125(o.status)}</span><div class="hint">${orderDateV125(o.created_at)} · ${esc(o.customer_name||'Cliente')} · ${orderModeLabelV125(o.order_mode)}</div></div><b>${brl(+o.total||0)}</b></div><div class="miniBtns" style="margin-top:10px"><button class="ghost" onclick="viewOrderV125('${o.id}')">Ver pedido</button><button class="ghost" onclick="copyOrderV125('${o.id}')">Copiar</button></div></div>`).join(''):'<div class="panel"><h3>Nenhum pedido ainda</h3><p class="hint">Assim que um cliente finalizar um pedido, ele aparecerá aqui automaticamente.</p></div>';
    host.innerHTML=`${newCount?`<div class="notice"><b>${newCount} pedido(s) novo(s)</b> aguardando atendimento.</div>`:''}${body}`;
  }catch(e){
    console.error('Falha ao carregar painel de pedidos:',e);
    host.innerHTML='<div class="notice bad"><b>Painel de pedidos ainda não conectado.</b><br>Execute a configuração SQL da versão 1.25.0 no Supabase e atualize esta página.</div>';
  }
}

// Substitui a antiga tela "Pedidos por WhatsApp" por um painel operacional real.
adminOrders=function(){
  if(adminOrdersView==='config'){adminOrderSettings();return}
  const st=openState(),paused=cfg.store.paused;
  document.getElementById('adminContent').innerHTML=`<div class="orderHero"><div class="row"><div><h2 style="margin:0">Pedidos</h2><div class="hint">Todos os pedidos feitos pelo cardápio aparecem aqui.</div></div><button class="ghost" onclick="adminOrdersView='config';adminOrders()">⚙ Configurar</button></div><div class="storeState ${paused?'paused':''}"><div><span class="stateDot"></span><b>${paused?'Recebimento pausado':st.open?'Estabelecimento aberto':'Estabelecimento fechado'}</b><div style="font-size:12px;opacity:.8">${paused?'Pedidos online temporariamente pausados':st.text}</div></div><button data-pedevia-event="click" data-pedevia-call="toggleOrdersPaused">${paused?'Retomar':'Pausar'} ▾</button></div></div><div id="ordersListV125"></div>`;
  loadOrdersPanelV125();
};

// Atualização automática enquanto o painel de Pedidos estiver aberto.
setInterval(()=>{if(mode==='admin'&&logged&&adminTab==='orders'&&adminOrdersView!=='config')loadOrdersPanelV125()},15000);

// Registra no painel antes de abrir o WhatsApp. Se o banco ainda não estiver configurado,
// o pedido continua podendo seguir para o WhatsApp para não interromper a operação.
const _finishWhatsAppV125Base=finishWhatsApp;
finishWhatsApp=async function(){
  if(!storeAcceptingOrdersV125()){
    alert(closedOrderMessageV125()+' O pedido não foi enviado.');return;
  }
  const btn=document.querySelector('#sheet .checkoutSticky .btn.green, .sheet .checkoutSticky .btn.green');
  if(btn){btn.disabled=true;btn.textContent='Registrando pedido...'}
  try{
    window.checkoutState=window.checkoutState||{};
    const n=document.getElementById('coName'),p=document.getElementById('coPhone'),o=document.getElementById('coObs');
    if(n)window.checkoutState.customer=n.value.trim();if(p)window.checkoutState.phone=p.value.trim();if(o)window.checkoutState.note=o.value.trim();
    if(!window.checkoutState.customer||!window.checkoutState.phone){alert('Informe seu nome e celular.');return}
    let created=null;
    try{created=await createOnlineOrderV125()}catch(e){
      console.error('Pedido não foi salvo no painel:',e);
      alert('Não foi possível registrar o pedido. Tente novamente em alguns instantes.');
      return;
    }
    if(created){
      const num=orderNumberV125(created);
      window.pedeviaCurrentOrderNumberV125=num;
      const oldBuild=buildOrderTextV111;
      buildOrderTextV111=function(){
        const txt=oldBuild();
        return `🧾 *PEDIDO ${num}*\n`+txt.replace(/POINT DO AÇAÍ FRONTIN/gi,currentStoreNameV125());
      };
      try{return await _finishWhatsAppV125Base()}finally{buildOrderTextV111=oldBuild}
    }
    return await _finishWhatsAppV125Base();
  }finally{
    if(btn){btn.disabled=false;btn.textContent='☏ Enviar pelo WhatsApp'}
  }
};

// Mostra a versão nova no cabeçalho administrativo.
setTimeout(()=>{
  document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.2[0-9.]+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.2[0-9.]+/i,'Versão 1.33.0')});
},0);


// ===== Pedevia v1.26.1: HISTÓRICO, LIMPEZA, ESTATÍSTICAS E REGISTRO ROBUSTO DE PEDIDOS =====
(function injectV126Styles(){
  if(document.getElementById('pedeviaV126Styles'))return;
  const st=document.createElement('style');st.id='pedeviaV126Styles';st.textContent=`
  .v126Toolbar{display:flex;gap:8px;overflow:auto;margin:0 0 12px;scrollbar-width:none}.v126Toolbar button{white-space:nowrap}
  .v126StatsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0 14px}.v126Stat{background:var(--card,#fff);border:1px solid var(--line,#e8e1ea);border-radius:17px;padding:14px}.v126Stat b{display:block;font-size:22px;color:var(--p,#712489)}.v126Stat small{display:block;color:var(--muted,#7c7480);margin-top:4px}
  .v126Rank{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line,#e8e1ea)}.v126Rank:last-child{border-bottom:0}.v126RankNum{width:30px;height:30px;border-radius:10px;background:#f0ebf2;display:grid;place-items:center;font-weight:900}.v126Right{text-align:right}.v126Right small{display:block;color:var(--muted,#7c7480)}
  .v126Filters{display:flex;gap:7px;overflow:auto;margin:0 0 12px;scrollbar-width:none}.v126Filters button{white-space:nowrap;border:1px solid var(--line,#e8e1ea);background:var(--card,#fff);color:var(--ink,#28232b);border-radius:999px;padding:9px 12px;font-weight:800}.v126Filters button.on{background:var(--p,#712489);color:#fff;border-color:var(--p,#712489)}
  .v126Danger{background:#fde3e6!important;color:#922a34!important}.v126Muted{opacity:.72}.v126SectionTitle{display:flex;justify-content:space-between;gap:10px;align-items:end;margin:18px 0 8px}.v126SectionTitle h3{margin:0}.v126OrderActions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
  @media(min-width:720px){.v126StatsGrid{grid-template-columns:repeat(4,minmax(0,1fr))}}
  `;document.head.appendChild(st);
})();

window.ordersTabV126=window.ordersTabV126||'active';
window.statsRangeV126=window.statsRangeV126||'30';

function activeOrderV126(o){return ['new','accepted','preparing','ready'].includes(o.status)}
function archivedOrderV126(o){return ['completed','cancelled'].includes(o.status)}
function normalizePhoneV126(v){return String(v||'').replace(/\D/g,'')}
function statusRevenueV126(o){return o.status==='completed'}
function safeDateV126(v){const d=new Date(v);return Number.isNaN(+d)?null:d}

async function fetchStoreOrdersV126(limit=1000){
  const key=currentStoreKeyV125();
  const {data,error}=await supabaseClient.from('pedevia_orders').select('*').eq('store_key',key).order('created_at',{ascending:false}).limit(limit);
  if(error)throw error;return Array.isArray(data)?data:[];
}

async function fetchAllStoreOrdersV126(){
  const key=currentStoreKeyV125(),all=[],page=1000,maxPages=20;
  for(let p=0;p<maxPages;p++){
    const from=p*page,to=from+page-1;
    const {data,error}=await supabaseClient.from('pedevia_orders').select('*').eq('store_key',key).order('created_at',{ascending:false}).range(from,to);
    if(error)throw error;
    const rows=Array.isArray(data)?data:[];all.push(...rows);if(rows.length<page)break;
  }
  return all;
}

async function deleteOrderV126(id){
  const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));
  if(!confirm(`Excluir definitivamente o pedido ${o?orderNumberV125(o):''}?\n\nEssa ação não pode ser desfeita e o pedido deixará de aparecer no histórico e nas estatísticas.`))return;
  const {error}=await supabaseClient.from('pedevia_orders').delete().eq('id',id).eq('store_key',currentStoreKeyV125());
  if(error){alert('Não foi possível excluir o pedido: '+error.message);return}
  closeModal();await loadOrdersPanelV126();
}

async function finishTodayOrdersV126(){
  if(!confirm('Encerrar todos os pedidos ativos de hoje?\n\nEles serão marcados como Concluídos e sairão da lista de pedidos ativos, mas continuarão salvos no Histórico e nas Estatísticas.'))return;
  const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  const iso=new Date().toISOString();
  const {error}=await supabaseClient.from('pedevia_orders').update({status:'completed',completed_at:iso,updated_at:iso}).eq('store_key',currentStoreKeyV125()).in('status',['new','accepted','preparing','ready']).gte('created_at',start.toISOString()).lt('created_at',end.toISOString());
  if(error){alert('Não foi possível encerrar os pedidos: '+error.message);return}
  await loadOrdersPanelV126();
}

async function updateOrderStatusV126(id){
  const status=document.getElementById('orderStatusV125')?.value||'new',now=new Date().toISOString();
  const patch={status,updated_at:now,completed_at:null,cancelled_at:null};
  if(status==='completed')patch.completed_at=now;if(status==='cancelled')patch.cancelled_at=now;
  const {error}=await supabaseClient.from('pedevia_orders').update(patch).eq('id',id).eq('store_key',currentStoreKeyV125());
  if(error){alert('Não foi possível atualizar o pedido: '+error.message);return}
  closeModal();await loadOrdersPanelV126();
}
updateOrderStatusV125=updateOrderStatusV126;

viewOrderV125=function(id){
  const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;
  const items=(o.items||[]).map(i=>`<div class="summary"><div class="row"><b>${i.quantity||1}x ${esc(i.name||'Produto')}${i.variant?' · '+esc(i.variant):''}</b><b>${brl((+i.unit_price||0)*(+i.quantity||1))}</b></div>${(i.groups||[]).map(g=>`<small><b>${esc(g.name||'Complementos')}:</b> ${(g.items||[]).map(x=>esc(x.name||x)).join(', ')}</small>`).join('')}${i.note?`<small>Obs.: ${esc(i.note)}</small>`:''}</div>`).join('');
  showModal(`<div class="row"><div><h2 style="margin:0">Pedido ${orderNumberV125(o)}</h2><div class="hint">${orderDateV125(o.created_at)}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>${items}<div class="summary"><div><b>${esc(o.customer_name||'-')}</b> · ${esc(o.customer_phone||'-')}</div><small>${orderModeLabelV125(o.order_mode)}${o.neighborhood?' · '+esc(o.neighborhood):''}${o.address?' · '+esc(o.address):''}${o.table_number?' · Mesa '+esc(o.table_number):''}</small><small>Pagamento: ${esc(paymentKeyLabel(o.payment_method))}</small>${o.note?`<small>Obs.: ${esc(o.note)}</small>`:''}<div class="row" style="margin-top:8px"><strong>Total</strong><strong>${brl(+o.total||0)}</strong></div></div><label>Status</label><select id="orderStatusV125" class="field"><option value="new">Novo</option><option value="accepted">Aceito</option><option value="preparing">Preparando</option><option value="ready">Pronto</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select><button class="btn full" onclick="updateOrderStatusV126('${o.id}')">Salvar status</button><button class="ghost full" style="margin-top:8px" onclick="copyOrderV125('${o.id}')">Copiar pedido</button><button class="dangerBtn full" style="width:100%;margin-top:8px" onclick="deleteOrderV126('${o.id}')">Excluir pedido definitivamente</button>`);
  setTimeout(()=>{const s=document.getElementById('orderStatusV125');if(s)s.value=o.status||'new'},0);
};

function renderOrderCardV126(o){
  return `<div class="panel" style="padding:13px"><div class="row"><div><b style="font-size:17px">${orderNumberV125(o)}</b> <span class="badge ${orderStatusClassV125(o.status)}">${orderStatusLabelV125(o.status)}</span><div class="hint">${orderDateV125(o.created_at)} · ${esc(o.customer_name||'Cliente')} · ${orderModeLabelV125(o.order_mode)}</div></div><b>${brl(+o.total||0)}</b></div><div class="v126OrderActions"><button class="ghost" onclick="viewOrderV125('${o.id}')">Ver pedido</button><button class="ghost" onclick="copyOrderV125('${o.id}')">Copiar</button>${archivedOrderV126(o)?`<button class="ghost v126Danger" onclick="deleteOrderV126('${o.id}')">Excluir</button>`:''}</div></div>`;
}

async function loadOrdersPanelV126(){
  if(adminTab!=='orders'||adminOrdersView==='config'||adminOrdersView==='stats')return;
  const host=document.getElementById('ordersListV125');if(!host)return;
  host.innerHTML='<div class="panel"><p class="hint">Atualizando pedidos...</p></div>';
  try{
    const rows=await fetchStoreOrdersV126(1000);window.pedeviaOrdersV125=rows;
    const active=rows.filter(activeOrderV126),history=rows.filter(archivedOrderV126),show=ordersTabV126==='history'?history:active;
    const newCount=active.filter(o=>o.status==='new').length;
    const tabs=`<div class="v126Filters"><button class="${ordersTabV126==='active'?'on':''}" onclick="ordersTabV126='active';loadOrdersPanelV126()">Ativos (${active.length})</button><button class="${ordersTabV126==='history'?'on':''}" onclick="ordersTabV126='history';loadOrdersPanelV126()">Histórico (${history.length})</button></div>`;
    const actions=ordersTabV126==='active'?`<div class="v126Toolbar"><button class="ghost" data-pedevia-event="click" data-pedevia-call="finishTodayOrdersV126">✓ Encerrar pedidos de hoje</button><button class="ghost" onclick="adminOrdersView='stats';adminOrders()">📊 Estatísticas</button></div>`:`<div class="v126Toolbar"><button class="ghost" onclick="adminOrdersView='stats';adminOrders()">📊 Estatísticas</button></div>`;
    const empty=ordersTabV126==='active'?'<div class="panel"><h3>Nenhum pedido ativo</h3><p class="hint">Os pedidos concluídos e cancelados ficam guardados na aba Histórico.</p></div>':'<div class="panel"><h3>Histórico vazio</h3><p class="hint">Pedidos concluídos ou cancelados aparecerão aqui.</p></div>';
    host.innerHTML=`${newCount&&ordersTabV126==='active'?`<div class="notice"><b>${newCount} pedido(s) novo(s)</b> aguardando atendimento.</div>`:''}${tabs}${actions}${show.length?show.map(renderOrderCardV126).join(''):empty}`;
  }catch(e){console.error('Falha ao carregar painel de pedidos:',e);host.innerHTML='<div class="notice bad"><b>Painel de pedidos não conectado.</b><br>Execute o SQL da versão 1.26.0 no Supabase e recarregue esta página.</div>'}
}
loadOrdersPanelV125=loadOrdersPanelV126;

function statsCutoffV126(){
  if(statsRangeV126==='all')return null;const n=+statsRangeV126||30,d=new Date();d.setDate(d.getDate()-n);return d;
}
function aggregateCustomersV126(rows){
  const m=new Map();
  rows.forEach(o=>{const phone=normalizePhoneV126(o.customer_phone),key=phone||('nome:'+String(o.customer_name||'').toLowerCase());if(!key)return;let c=m.get(key);if(!c)c={key,phone,name:o.customer_name||'Cliente',orders:0,completed:0,spent:0,last:o.created_at,all:[]};c.orders++;c.all.push(o);if(statusRevenueV126(o)){c.completed++;c.spent+=+o.total||0}if(new Date(o.created_at)>new Date(c.last))c.last=o.created_at;m.set(key,c)});
  return [...m.values()];
}
function aggregateProductsV126(rows){
  const m=new Map();rows.filter(statusRevenueV126).forEach(o=>(o.items||[]).forEach(i=>{const key=String(i.product_id||i.name||'Produto');let p=m.get(key);if(!p)p={name:i.name||'Produto',qty:0,revenue:0};const q=+i.quantity||1;p.qty+=q;p.revenue+=(+i.unit_price||0)*q;m.set(key,p)}));return [...m.values()].sort((a,b)=>b.qty-a.qty);
}
function customerHistoryV126(key){
  const customers=aggregateCustomersV126(window.statsOrdersV126||[]),c=customers.find(x=>x.key===key);if(!c)return;
  const rows=[...c.all].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  showModal(`<div class="row"><div><h2 style="margin:0">${esc(c.name)}</h2><div class="hint">${esc(c.phone||'Sem telefone')}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><div class="v126StatsGrid"><div class="v126Stat"><b>${c.orders}</b><small>Pedidos registrados</small></div><div class="v126Stat"><b>${c.completed}</b><small>Pedidos concluídos</small></div><div class="v126Stat"><b>${brl(c.spent)}</b><small>Total faturado</small></div></div><h3>Histórico de pedidos</h3>${rows.map(o=>`<div class="summary"><div class="row"><b>${orderNumberV125(o)}</b><b>${brl(+o.total||0)}</b></div><small>${orderDateV125(o.created_at)} · ${orderStatusLabelV125(o.status)} · ${orderModeLabelV125(o.order_mode)}</small></div>`).join('')||'<p class="hint">Sem pedidos.</p>'}`);
}

async function loadStatisticsV126(){
  const host=document.getElementById('statsHostV126');if(!host)return;host.innerHTML='<div class="panel"><p class="hint">Calculando estatísticas...</p></div>';
  try{
    const all=await fetchAllStoreOrdersV126();window.statsOrdersV126=all;
    const cutoff=statsCutoffV126(),period=cutoff?all.filter(o=>{const d=safeDateV126(o.created_at);return d&&d>=cutoff}):all;
    const completed=period.filter(statusRevenueV126),lifeCompleted=all.filter(statusRevenueV126),cancelled=period.filter(o=>o.status==='cancelled'),active=all.filter(activeOrderV126);
    const revenue=completed.reduce((s,o)=>s+(+o.total||0),0),lifeRevenue=lifeCompleted.reduce((s,o)=>s+(+o.total||0),0),ticket=completed.length?revenue/completed.length:0;
    const customers=aggregateCustomersV126(period).sort((a,b)=>b.completed-a.completed||b.spent-a.spent),products=aggregateProductsV126(period).slice(0,10);
    const ranges=[['7','7 dias'],['30','30 dias'],['90','90 dias'],['all','Todo período']].map(([v,n])=>`<button class="${statsRangeV126===v?'on':''}" onclick="statsRangeV126='${v}';loadStatisticsV126()">${n}</button>`).join('');
    const rankedCustomers=customers.filter(c=>c.completed>0).slice(0,10),listedCustomers=customers.slice(0,30);
    const topCustomers=rankedCustomers.map((c,i)=>`<div class="v126Rank"><div class="v126RankNum">${i+1}</div><div><b>${esc(c.name)}</b><small>${esc(c.phone||'Sem telefone')} · ${c.completed} concluído(s)</small></div><div class="v126Right"><b>${brl(c.spent)}</b><button type="button" class="ghost v126TopCustomerHistory" data-customer-index="${i}" style="padding:5px 8px;margin-top:4px">Histórico</button></div></div>`).join('')||'<p class="hint">Ainda não há clientes com pedidos concluídos neste período.</p>';
    const allCustomers=listedCustomers.map((c,i)=>`<div class="adminItem"><div><b>${esc(c.name)}</b><small>${esc(c.phone||'Sem telefone')} · último pedido ${orderDateV125(c.last)}</small></div><button type="button" class="ghost v126AllCustomerHistory" data-customer-index="${i}">Ver histórico</button></div>`).join('')||'<p class="hint">Nenhum cliente registrado.</p>';
    const topProducts=products.map((p,i)=>`<div class="v126Rank"><div class="v126RankNum">${i+1}</div><div><b>${esc(p.name)}</b><small>${p.qty} unidade(s) vendida(s)</small></div><div class="v126Right"><b>${brl(p.revenue)}</b></div></div>`).join('')||'<p class="hint">Ainda não há produtos vendidos neste período.</p>';
    host.innerHTML=`<div class="v126Filters">${ranges}</div><div class="v126StatsGrid"><div class="v126Stat"><b>${brl(revenue)}</b><small>Faturamento no período</small></div><div class="v126Stat"><b>${completed.length}</b><small>Vendas concluídas</small></div><div class="v126Stat"><b>${brl(ticket)}</b><small>Ticket médio</small></div><div class="v126Stat"><b>${brl(lifeRevenue)}</b><small>Faturamento geral</small></div></div><div class="panel"><div class="row"><h3 style="margin:0">Situação dos pedidos</h3><span class="hint">${active.length} ativos · ${cancelled.length} cancelados no período</span></div></div><div class="panel"><h3>Clientes que mais pedem</h3>${topCustomers}</div><div class="panel"><h3>Produtos mais vendidos</h3>${topProducts}</div><div class="panel"><h3>Histórico dos clientes</h3><p class="hint">Veja todos os pedidos registrados para cada cliente, inclusive cancelados.</p>${allCustomers}</div>`;
    host.querySelectorAll('.v126TopCustomerHistory').forEach(button=>button.addEventListener('click',()=>{const customer=rankedCustomers[Number(button.dataset.customerIndex)];if(customer)customerHistoryV126(customer.key)}));
    host.querySelectorAll('.v126AllCustomerHistory').forEach(button=>button.addEventListener('click',()=>{const customer=listedCustomers[Number(button.dataset.customerIndex)];if(customer)customerHistoryV126(customer.key)}));
  }catch(e){console.error(e);host.innerHTML='<div class="notice bad"><b>Não foi possível carregar as estatísticas.</b><br>Confirme se o SQL da versão 1.26.0 foi executado.</div>'}
}

function adminStatisticsV126(){
  document.getElementById('adminContent').innerHTML=`<button class="backBtn" onclick="adminOrdersView='main';adminOrders()">‹ Voltar para Pedidos</button><div class="panel"><div class="row"><div><div class="settingsTitle" style="margin-bottom:2px">Estatísticas de vendas</div><div class="hint">Faturamento considera somente pedidos marcados como Concluídos.</div></div></div></div><div id="statsHostV126"></div>`;loadStatisticsV126();
}

adminOrders=function(){
  if(adminOrdersView==='config'){adminOrderSettings();return}
  if(adminOrdersView==='stats'){adminStatisticsV126();return}
  const st=openState(),paused=cfg.store.paused;
  document.getElementById('adminContent').innerHTML=`<div class="orderHero"><div class="row"><div><h2 style="margin:0">Pedidos</h2><div class="hint">Acompanhe os pedidos ativos e consulte o histórico.</div></div><button class="ghost" onclick="adminOrdersView='config';adminOrders()">⚙ Configurar</button></div><div class="storeState ${paused?'paused':''}"><div><span class="stateDot"></span><b>${paused?'Recebimento pausado':st.open?'Estabelecimento aberto':'Estabelecimento fechado'}</b><div style="font-size:12px;opacity:.8">${paused?'Pedidos online temporariamente pausados':st.text}</div></div><button data-pedevia-event="click" data-pedevia-call="toggleOrdersPaused">${paused?'Retomar':'Pausar'} ▾</button></div></div><div id="ordersListV125"></div>`;loadOrdersPanelV126();
};

// Estatísticas também ficam acessíveis em Mais, no Point e em todas as lojas.
const _adminMoreV126Base=adminMore;
adminMore=function(){
  _adminMoreV126Base();
  const list=document.querySelector('#adminContent .moreList');if(!list||document.getElementById('statsCardV126'))return;
  const holder=document.createElement('div');holder.id='statsCardV126';holder.innerHTML=moreCard('📊','Estatísticas de vendas','Faturamento, clientes, ranking e histórico',"adminTab='orders';adminOrdersView='stats';renderAdmin()");
  list.appendChild(holder);
};

// Versão exibida no Admin.
setTimeout(()=>{document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.2[0-9.]+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.2[0-9.]+/i,'Versão 1.33.0')})},0);


// ===== v1.27.0: AUDITORIA GERAL PEDEVIA =====
// Aplica-se ao Point e a todos os estabelecimentos atuais e futuros.

(function injectPedeviaV127Styles(){
  if(document.getElementById('pedeviaV127Styles'))return;
  const s=document.createElement('style');s.id='pedeviaV127Styles';s.textContent=`
  .v127Timeline{display:grid;gap:7px;margin:12px 0}.v127Time{display:grid;grid-template-columns:105px 1fr;gap:8px;font-size:13px}.v127Time b{font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:var(--muted,#7c7480)}
  .v127Bars{display:grid;gap:9px}.v127Bar{display:grid;grid-template-columns:minmax(90px,1fr) 2fr auto;gap:8px;align-items:center}.v127BarTrack{height:9px;border-radius:999px;background:var(--line,#e8e1ea);overflow:hidden}.v127BarFill{height:100%;background:var(--p,#712489);border-radius:999px}.v127Bar small{white-space:nowrap}
  .v127ScheduleDay{border:1px solid var(--line,#e8e1ea);border-radius:16px;padding:12px;margin:9px 0}.v127ScheduleDay>div:first-child{font-weight:900;margin-bottom:8px}.v127ScheduleRow{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:7px}.v127ScheduleRow input{width:100%}
  .v127Exception{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid var(--line,#e8e1ea)}
  .v127Realtime{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted,#7c7480)}.v127Realtime:before{content:'';width:8px;height:8px;border-radius:50%;background:#29a56a;box-shadow:0 0 0 3px rgba(41,165,106,.12)}
  @media(min-width:720px){.v127ScheduleGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v127ScheduleDay{margin:0}}
  `;document.head.appendChild(s);
})();

function currentStoreKeyV127(){return typeof currentStoreKeyV125==='function'?currentStoreKeyV125():'point-frontin'}
function scopedLocalKeyV127(base){return `pedevia:${currentStoreKeyV127()}:${base}`}
function normalizePhoneV127(v){let d=String(v||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);return d}

// --- Identidade limpa e PIX isolado ---
const _cleanClientConfigV127Base=cleanClientConfigV120;
cleanClientConfigV120=function(name,whatsapp){
  const x=_cleanClientConfigV127Base(name,whatsapp);x.store=x.store||{};x.store.orderConfig=x.store.orderConfig||{};
  x.store.orderConfig.pixKey='';x.store.orderConfig.pixHolder='';x.store.specialClosures=[];
  return x;
};
function sanitizeTenantV127(){
  if(!window.pedeviaTenantV121)return;
  cfg.store=cfg.store||{};cfg.store.orderConfig=cfg.store.orderConfig||{};
  const o=cfg.store.orderConfig;
  if(String(o.pixKey||'')==='24998375867' && /Pablo\s*-\s*PicPay/i.test(String(o.pixHolder||''))){o.pixKey='';o.pixHolder=''}
  if(!Array.isArray(cfg.store.specialClosures))cfg.store.specialClosures=[];
  document.title=`${cfg.store.name||'Estabelecimento'} · Pedevia`;
}
const _applyTenantConfigV127Base=applyTenantConfigV121;
applyTenantConfigV121=function(row){const r=_applyTenantConfigV127Base(row);sanitizeTenantV127();return r};

// --- Cache e perfil do cliente por estabelecimento ---
loadCustomerCacheV113=function(){try{return JSON.parse(localStorage.getItem(scopedLocalKeyV127('customer'))||'null')||{}}catch(e){return {}}};
saveCustomerCacheV113=function(name,phone){const data={name:String(name||'').trim(),phone:normalizePhoneV127(phone),updatedAt:Date.now()};try{localStorage.setItem(scopedLocalKeyV127('customer'),JSON.stringify(data))}catch(e){}return data};
cacheCustomerPhoneV115=function(phone){const p=normalizePhoneV127(phone);if(p.length>=10){try{localStorage.setItem(scopedLocalKeyV127('customer-phone'),p)}catch(e){}}return p};
getCachedCustomerPhoneV115=function(){try{return localStorage.getItem(scopedLocalKeyV127('customer-phone'))||''}catch(e){return ''}};

getCustomerProfileV115=async function(phone){
  const p=normalizePhoneV127(phone);if(p.length<10)return null;
  try{const {data,error}=await supabaseClient.rpc('get_pedevia_customer_profile_v127',{p_store_key:currentStoreKeyV127(),p_phone:p});if(error)throw error;return Array.isArray(data)?data[0]||null:data||null}catch(e){console.error('Erro ao consultar perfil isolado:',e);return null}
};
upsertCustomerProfileV115=async function(profile={}){
  const phone=normalizePhoneV127(profile.phone);if(phone.length<10)return null;cacheCustomerPhoneV115(phone);
  try{const {data,error}=await supabaseClient.rpc('upsert_pedevia_customer_profile_v127',{p_store_key:currentStoreKeyV127(),p_phone:phone,p_name:String(profile.name||'').trim(),p_neighborhood:String(profile.neighborhood||'').trim(),p_address:String(profile.address||'').trim(),p_reference:String(profile.reference||'').trim()});if(error)throw error;return Array.isArray(data)?data[0]||null:data}catch(e){console.error('Erro ao salvar perfil isolado:',e);return null}
};
getLoyaltyStatusV113=async function(phone){
  const p=normalizePhoneV127(phone);if(p.length<10)return null;
  try{const {data,error}=await supabaseClient.rpc('get_pedevia_loyalty_status_v127',{p_store_key:currentStoreKeyV127(),p_phone:p});if(error)throw error;return Array.isArray(data)?data[0]||null:data||null}catch(e){console.warn('Não foi possível consultar fidelidade isolada:',e);return null}
};
registerOrderAndCustomerV115=async function(){
  const st=window.checkoutState||{},phone=normalizePhoneV127(st.phone);if(phone.length<10)throw new Error('Telefone inválido');cacheCustomerPhoneV115(phone);
  const t=checkoutTotalsV111(),orderId=ensureClientOrderIdV113();
  const {data,error}=await supabaseClient.rpc('register_pedevia_customer_order_v127',{p_store_key:currentStoreKeyV127(),p_client_order_id:orderId,p_phone:phone,p_name:String(st.customer||'').trim(),p_neighborhood:String(st.neighborhood||''),p_address:String(st.address||''),p_reference:String(st.reference||''),p_total:Number(t.total||0),p_order_text:buildOrderTextV111()});
  if(error)throw error;const result=Array.isArray(data)?data[0]||null:data;if(result)updateLoyaltyDisplaysV115(result);return result;
};

// --- Horário confiável, múltiplos expedientes, madrugada e fechamentos excepcionais ---
window.pedeviaServerOffsetV127=0;
async function syncServerClockV127(){try{const before=Date.now(),{data,error}=await supabaseClient.rpc('pedevia_server_time_v127');if(error)throw error;const after=Date.now(),server=new Date(data).getTime();if(Number.isFinite(server))window.pedeviaServerOffsetV127=server-((before+after)/2)}catch(e){console.warn('Relógio do servidor indisponível; usando horário local.',e)}}
function nowV127(){return new Date(Date.now()+(window.pedeviaServerOffsetV127||0))}
function hmV127(v){const a=String(v||'').split(':').map(Number);return (a[0]||0)*60+(a[1]||0)}
function dateKeyV127(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function scheduleStateV127(){
  const s=cfg.store||{},d=nowV127();if(s.paused)return{open:false,text:s.pauseMessage||'Estabelecimento temporariamente fechado.'};if(s.scheduleMode==='always')return{open:true,text:'Aberto agora'};
  const special=(s.specialClosures||[]).find(x=>x&&x.date===dateKeyV127(d)&&x.closed!==false);if(special)return{open:false,text:special.message||'Fechado excepcionalmente hoje'};
  const dow=d.getDay(),m=d.getHours()*60+d.getMinutes(),today=s.hours?.[String(dow)]||[],prev=s.hours?.[String((dow+6)%7)]||[];
  for(const x of today){const a=hmV127(x[0]),b=hmV127(x[1]);if(a===b)return{open:true,text:'Aberto agora'};if(a<b&&m>=a&&m<b)return{open:true,text:`Aberto agora · até ${x[1]}`};if(a>b&&m>=a)return{open:true,text:`Aberto agora · até ${x[1]} de amanhã`}}
  for(const x of prev){const a=hmV127(x[0]),b=hmV127(x[1]);if(a>b&&m<b)return{open:true,text:`Aberto agora · até ${x[1]}`};if(a===b)return{open:true,text:'Aberto agora'}}
  const txt=today.length?today.map(x=>`${x[0]}–${x[1]}`).join(', '):'Fechado hoje';return{open:false,text:today.length?`Fechado agora · hoje ${txt}`:txt};
}
openState=function(){return scheduleStateV127()};
todayScheduleText=function(){const s=cfg.store||{};if(s.scheduleMode==='always')return'Aberto 24 horas';const d=nowV127(),sp=(s.specialClosures||[]).find(x=>x?.date===dateKeyV127(d)&&x.closed!==false);if(sp)return sp.message||'Fechado excepcionalmente hoje';const r=s.hours?.[String(d.getDay())]||[];return r.length?r.map(x=>`${x[0]}–${x[1]}`).join(', '):'Fechado hoje'};
nextCloseText=function(){const st=scheduleStateV127();return st.open?st.text.replace(/^Aberto agora\s*·?\s*/,'Até '):todayScheduleText()};

function specialClosuresHtmlV127(){const arr=cfg.store.specialClosures||[];return arr.length?arr.slice().sort((a,b)=>a.date.localeCompare(b.date)).map((x,i)=>`<div class="v127Exception"><div><b>${esc(new Date(x.date+'T12:00:00').toLocaleDateString('pt-BR'))}</b><small>${esc(x.message||'Fechado excepcionalmente')}</small></div><button class="ghost" onclick="removeSpecialClosureV127(${i})">Remover</button></div>`).join(''):'<p class="hint">Nenhum fechamento excepcional cadastrado.</p>'}
function removeSpecialClosureV127(i){cfg.store.specialClosures=(cfg.store.specialClosures||[]).filter((_,idx)=>idx!==i);generalHours()}
function addSpecialClosureV127(){const date=document.getElementById('v127CloseDate')?.value,msg=document.getElementById('v127CloseMsg')?.value.trim()||'Fechado excepcionalmente';if(!date){alert('Escolha a data.');return}cfg.store.specialClosures=cfg.store.specialClosures||[];cfg.store.specialClosures=cfg.store.specialClosures.filter(x=>x.date!==date);cfg.store.specialClosures.push({date,closed:true,message:msg});generalHours()}

generalHours=function(){
  const s=cfg.store,n=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];if(!Array.isArray(s.specialClosures))s.specialClosures=[];
  const days=n.map((name,i)=>{const r=s.hours?.[String(i)]||[],a=r[0]||['',''],b=r[1]||['',''];return `<div class="v127ScheduleDay"><div>${name}</div><div class="v127ScheduleRow"><input id="ga${i}_1" type="time" value="${a[0]||''}"><input id="gb${i}_1" type="time" value="${a[1]||''}"></div><div class="v127ScheduleRow"><input id="ga${i}_2" type="time" value="${b[0]||''}"><input id="gb${i}_2" type="time" value="${b[1]||''}"></div><small class="hint">Use a 2ª faixa para intervalo de almoço. Horários como 18:00–02:00 funcionam normalmente.</small></div>`}).join('');
  generalShell('Horário de Atendimento',`<p class="hint">Você pode cadastrar até dois expedientes por dia e também horários que passam da meia-noite.</p><select id="gSchedule" class="field"><option value="fixed">Atende em horários pré-estabelecidos</option><option value="always">Sempre aberto</option></select><div class="v127ScheduleGrid">${days}</div><div class="panel" style="margin-top:14px"><h3>Fechamento excepcional</h3><p class="hint">Use para feriados, manutenção, férias ou qualquer dia em que a programação semanal não deve valer.</p><input id="v127CloseDate" type="date" class="field"><input id="v127CloseMsg" class="field" placeholder="Ex.: Fechado para manutenção"><button class="ghost full" data-pedevia-event="click" data-pedevia-call="addSpecialClosureV127">+ Adicionar fechamento</button><div style="margin-top:10px">${specialClosuresHtmlV127()}</div></div><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveGeneralHours">Salvar horários</button>`);document.getElementById('gSchedule').value=s.scheduleMode||'fixed';
};
saveGeneralHours=async function(){
  cfg.store.scheduleMode=document.getElementById('gSchedule')?.value||'fixed';cfg.store.hours=cfg.store.hours||{};
  for(let i=0;i<7;i++){const list=[];for(let k=1;k<=2;k++){const a=document.getElementById(`ga${i}_${k}`)?.value||'',b=document.getElementById(`gb${i}_${k}`)?.value||'';if(a&&b)list.push([a,b])}cfg.store.hours[String(i)]=list}
  try{if(typeof persistAdminStateV15==='function'){const ok=await persistAdminStateV15({products:false,notify:true,message:'Horários salvos online.'});if(ok){generalHours();renderShop();return}}save();generalHours();renderShop()}catch(e){alert('Não foi possível salvar os horários: '+(e.message||e))}
};
adminHours=generalHours;

// --- Registro robusto + numeração independente por estabelecimento ---
orderNumberV125=function(o){const n=o?.store_order_number??o?.order_number;return '#'+String(n||'').padStart(3,'0')};
createOnlineOrderV125=async function(){
  if(!storeAcceptingOrdersV125())throw new Error('O estabelecimento fechou antes da finalização.');
  const st=window.checkoutState||{},t=checkoutTotalsV111(),text=buildOrderTextV111();
  const items=(cart||[]).map(i=>{const p=(cfg.products||[]).find(x=>x.id===i.pid);return{product_id:i.pid,name:p?.name||'Produto',variant:i.variantName||'',quantity:+i.qty||1,unit_price:+i.unit||0,groups:i.groups||[],note:i.obs||''}});
  const args={p_store_key:currentStoreKeyV127(),p_store_name:currentStoreNameV125(),p_customer_name:String(st.customer||document.getElementById('coName')?.value||'').trim(),p_customer_phone:String(st.phone||document.getElementById('coPhone')?.value||'').trim(),p_order_mode:String(st.mode||''),p_address:String(st.address||''),p_neighborhood:String(st.neighborhood||''),p_table_number:String(st.table||''),p_payment_method:String(st.payment||''),p_note:String(st.note||document.getElementById('coObs')?.value||'').trim(),p_items:items,p_subtotal:Number(t.sub||0),p_discount:Number((t.promoDiscount||0)+(t.loyaltyDiscount||0)),p_delivery_fee:Number(t.delivery||0),p_payment_adjustment:Number(t.payAdj||0),p_service_fee:Number(t.service||0),p_total:Number(t.total||0),p_whatsapp_text:text};
  const {data,error}=await supabaseClient.rpc('register_pedevia_order_v127',args);if(error)throw error;const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error('O servidor não confirmou o pedido.');return row;
};
orderCopyTextV125=function(o){let txt=String(o?.whatsapp_text||'').trim();const head=`🧾 *PEDIDO ${orderNumberV125(o)}*`;if(txt){if(!txt.startsWith('🧾 *PEDIDO'))txt=head+'\n'+txt;return txt.replace(/POINT DO AÇAÍ FRONTIN/gi,o.store_name||currentStoreNameV125())}const lines=[`${head} · ${o.store_name||currentStoreNameV125()}`,''];(o.items||[]).forEach(i=>lines.push(`*${i.quantity||1}x ${i.name||'Produto'}* — ${brl((+i.unit_price||0)*(+i.quantity||1))}`));lines.push('',`Cliente: ${o.customer_name||'-'}`,`Celular: ${o.customer_phone||'-'}`,`Tipo: ${orderModeLabelV125(o.order_mode)}`,`Pagamento: ${paymentKeyLabel(o.payment_method)}`,`*TOTAL: ${brl(+o.total||0)}*`);return lines.join('\n')};

// --- Linha do tempo, WhatsApp do cliente e impressão térmica ---
function orderTimelineV127(o){const rows=[['Recebido',o.created_at],['Aceito',o.accepted_at],['Preparando',o.preparing_at],['Pronto',o.ready_at],['Concluído',o.completed_at],['Cancelado',o.cancelled_at]].filter(x=>x[1]);return rows.length?`<div class="v127Timeline">${rows.map(([n,v])=>`<div class="v127Time"><b>${n}</b><span>${orderDateV125(v)}</span></div>`).join('')}</div>`:''}
function customerWhatsAppUrlV127(o){let d=String(o?.customer_phone||'').replace(/\D/g,'');if(!d)return'';if(!d.startsWith('55'))d='55'+d;return`https://wa.me/${d}`}
function openCustomerWhatsAppV127(id){const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;const u=customerWhatsAppUrlV127(o);if(!u){alert('Este pedido não possui celular válido.');return}window.open(u+'?text='+encodeURIComponent(`Olá, ${o.customer_name||'cliente'}! Sobre o seu pedido ${orderNumberV125(o)} na ${o.store_name||currentStoreNameV125()}:`),'_blank')}
function printOrderV127(id){const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;const w=window.open('','_blank','width=420,height=650');if(!w){alert('Permita pop-ups para imprimir o pedido.');return}const items=(o.items||[]).map(i=>`<div><b>${i.quantity||1}x ${esc(i.name||'Produto')}</b><span>${brl((+i.unit_price||0)*(+i.quantity||1))}</span></div>${(i.groups||[]).map(g=>`<small>${esc(g.name||'Complementos')}: ${(g.items||[]).map(x=>esc(x.name||x)).join(', ')}</small>`).join('')}${i.note?`<small>Obs.: ${esc(i.note)}</small>`:''}`).join('');w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Pedido ${orderNumberV125(o)}</title><style>body{font:13px Arial;margin:10px;color:#000}h2{text-align:center;margin:0 0 4px}.muted{text-align:center;font-size:11px;margin-bottom:10px}.item>div,body>div.row{display:flex;justify-content:space-between;gap:8px}.item{border-top:1px dashed #000;padding:7px 0}.item small{display:block;margin-top:3px}.total{border-top:2px solid #000;margin-top:8px;padding-top:8px;font-size:17px;font-weight:bold;display:flex;justify-content:space-between}@media print{body{width:72mm;margin:3mm}}</style></head><body><h2>${esc(o.store_name||currentStoreNameV125())}</h2><div class="muted">Pedido ${orderNumberV125(o)} · ${orderDateV125(o.created_at)}</div><p><b>${esc(o.customer_name||'-')}</b><br>${esc(o.customer_phone||'')}<br>${esc(orderModeLabelV125(o.order_mode))}${o.address?'<br>'+esc(o.address):''}${o.neighborhood?' · '+esc(o.neighborhood):''}</p>${(o.items||[]).map(i=>`<div class="item"><div><b>${i.quantity||1}x ${esc(i.name||'Produto')}</b><span>${brl((+i.unit_price||0)*(+i.quantity||1))}</span></div>${(i.groups||[]).map(g=>`<small>${esc(g.name||'Complementos')}: ${(g.items||[]).map(x=>esc(x.name||x)).join(', ')}</small>`).join('')}${i.note?`<small>Obs.: ${esc(i.note)}</small>`:''}</div>`).join('')}<p>Pagamento: ${esc(paymentKeyLabel(o.payment_method))}${o.note?'<br>Obs.: '+esc(o.note):''}</p><div class="total"><span>TOTAL</span><span>${brl(+o.total||0)}</span></div><script>onload=()=>{print();setTimeout(()=>close(),300)}<\/script></body></html>`);w.document.close()}

updateOrderStatusV126=async function(id){const status=document.getElementById('orderStatusV125')?.value||'new',now=new Date().toISOString(),patch={status,updated_at:now};if(status==='accepted')patch.accepted_at=now;if(status==='preparing')patch.preparing_at=now;if(status==='ready')patch.ready_at=now;if(status==='completed')patch.completed_at=now;if(status==='cancelled')patch.cancelled_at=now;const {error}=await supabaseClient.from('pedevia_orders').update(patch).eq('id',id).eq('store_key',currentStoreKeyV127());if(error){alert('Não foi possível atualizar o pedido: '+error.message);return}closeModal();await loadOrdersPanelV126()};
updateOrderStatusV125=updateOrderStatusV126;
viewOrderV125=function(id){const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;const items=(o.items||[]).map(i=>`<div class="summary"><div class="row"><b>${i.quantity||1}x ${esc(i.name||'Produto')}${i.variant?' · '+esc(i.variant):''}</b><b>${brl((+i.unit_price||0)*(+i.quantity||1))}</b></div>${(i.groups||[]).map(g=>`<small><b>${esc(g.name||'Complementos')}:</b> ${(g.items||[]).map(x=>esc(x.name||x)).join(', ')}</small>`).join('')}${i.note?`<small>Obs.: ${esc(i.note)}</small>`:''}</div>`).join('');showModal(`<div class="row"><div><h2 style="margin:0">Pedido ${orderNumberV125(o)}</h2><div class="hint">${orderDateV125(o.created_at)}</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>${items}<div class="summary"><div><b>${esc(o.customer_name||'-')}</b> · ${esc(o.customer_phone||'-')}</div><small>${orderModeLabelV125(o.order_mode)}${o.neighborhood?' · '+esc(o.neighborhood):''}${o.address?' · '+esc(o.address):''}${o.table_number?' · Mesa '+esc(o.table_number):''}</small><small>Pagamento: ${esc(paymentKeyLabel(o.payment_method))}</small>${o.note?`<small>Obs.: ${esc(o.note)}</small>`:''}<div class="row" style="margin-top:8px"><strong>Total</strong><strong>${brl(+o.total||0)}</strong></div></div>${orderTimelineV127(o)}<label>Status</label><select id="orderStatusV125" class="field"><option value="new">Novo</option><option value="accepted">Aceito</option><option value="preparing">Preparando</option><option value="ready">Pronto</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select><button class="btn full" onclick="updateOrderStatusV126('${o.id}')">Salvar status</button><div class="v126OrderActions"><button class="ghost" onclick="openCustomerWhatsAppV127('${o.id}')">WhatsApp do cliente</button><button class="ghost" onclick="copyOrderV125('${o.id}')">Copiar</button><button class="ghost" onclick="printOrderV127('${o.id}')">Imprimir</button></div><button class="dangerBtn full" style="width:100%;margin-top:8px" onclick="deleteOrderV126('${o.id}')">Excluir pedido definitivamente</button>`);setTimeout(()=>{const s=document.getElementById('orderStatusV125');if(s)s.value=o.status||'new'},0)};
renderOrderCardV126=function(o){return `<div class="panel" style="padding:13px"><div class="row"><div><b style="font-size:17px">${orderNumberV125(o)}</b> <span class="badge ${orderStatusClassV125(o.status)}">${orderStatusLabelV125(o.status)}</span><div class="hint">${orderDateV125(o.created_at)} · ${esc(o.customer_name||'Cliente')} · ${orderModeLabelV125(o.order_mode)}</div></div><b>${brl(+o.total||0)}</b></div><div class="v126OrderActions"><button class="ghost" onclick="viewOrderV125('${o.id}')">Ver pedido</button><button class="ghost" onclick="openCustomerWhatsAppV127('${o.id}')">WhatsApp</button><button class="ghost" onclick="printOrderV127('${o.id}')">Imprimir</button><button class="ghost" onclick="copyOrderV125('${o.id}')">Copiar</button>${archivedOrderV126(o)?`<button class="ghost v126Danger" onclick="deleteOrderV126('${o.id}')">Excluir</button>`:''}</div></div>`};

// --- Realtime + alerta sonoro ---
let ordersChannelV127=null,lastRealtimeOrderV127='';
function beepOrderV127(){if(cfg.store?.orderConfig?.panelAlerts===false)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.setValueAtTime(.001,c.currentTime);g.gain.exponentialRampToValueAtTime(.15,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.45);o.start();o.stop(c.currentTime+.46)}catch(e){}}
function notifyNewOrderV127(row){if(row?.id===lastRealtimeOrderV127)return;lastRealtimeOrderV127=row?.id||'';beepOrderV127();if(document.visibilityState==='hidden'&&'Notification'in window&&Notification.permission==='granted'){try{new Notification(`${currentStoreNameV125()} · novo pedido`,{body:`${row.customer_name||'Cliente'} · ${brl(+row.total||0)}`})}catch(e){}}if(mode==='admin'&&logged&&adminTab==='orders'&&adminOrdersView!=='config'&&adminOrdersView!=='stats')loadOrdersPanelV126()}
function subscribeOrdersV127(){if(!logged||!supabaseClient?.channel)return;if(ordersChannelV127){try{supabaseClient.removeChannel(ordersChannelV127)}catch(e){}}const key=currentStoreKeyV127();ordersChannelV127=supabaseClient.channel(`orders-${key}-${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'pedevia_orders',filter:`store_key=eq.${key}`},p=>notifyNewOrderV127(p.new)).subscribe()}
const _renderAdminV127Base=renderAdmin;
renderAdmin=function(){_renderAdminV127Base();if(logged)setTimeout(subscribeOrdersV127,50)};

// --- Estatísticas ampliadas + CSV ---
function csvCellV127(v){const s=String(v??'').replace(/"/g,'""');return `"${s}"`}
function exportOrdersCsvV127(){const rows=window.statsOrdersV126||[];if(!rows.length){alert('Não há pedidos para exportar.');return}const head=['Pedido','Data','Cliente','Celular','Tipo','Pagamento','Status','Total'];const lines=[head.map(csvCellV127).join(';'),...rows.map(o=>[orderNumberV125(o),new Date(o.created_at).toLocaleString('pt-BR'),o.customer_name,o.customer_phone,orderModeLabelV125(o.order_mode),paymentKeyLabel(o.payment_method),orderStatusLabelV125(o.status),Number(o.total||0).toFixed(2).replace('.',',')].map(csvCellV127).join(';'))];const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`pedevia-${currentStoreKeyV127()}-pedidos.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
function groupStatsV127(rows,keyFn,valueFn=()=>1){const m=new Map();rows.forEach(o=>{const k=keyFn(o)||'Não informado';m.set(k,(m.get(k)||0)+valueFn(o))});return [...m.entries()].sort((a,b)=>b[1]-a[1])}
function barsV127(entries,format=v=>String(v)){const max=Math.max(1,...entries.map(x=>x[1]));return `<div class="v127Bars">${entries.map(([k,v])=>`<div class="v127Bar"><span>${esc(k)}</span><div class="v127BarTrack"><div class="v127BarFill" style="width:${Math.max(3,(v/max)*100)}%"></div></div><small>${esc(format(v))}</small></div>`).join('')}</div>`}
const _loadStatisticsV127Base=loadStatisticsV126;
loadStatisticsV126=async function(){await _loadStatisticsV127Base();const host=document.getElementById('statsHostV126');if(!host||!window.statsOrdersV126)return;const cutoff=statsCutoffV126(),period=cutoff?window.statsOrdersV126.filter(o=>{const d=safeDateV126(o.created_at);return d&&d>=cutoff}):window.statsOrdersV126,completed=period.filter(statusRevenueV126);const byPay=groupStatsV127(completed,o=>paymentKeyLabel(o.payment_method),o=>+o.total||0).slice(0,8),byMode=groupStatsV127(completed,o=>orderModeLabelV125(o.order_mode)),byHour=groupStatsV127(completed,o=>String(new Date(o.created_at).getHours()).padStart(2,'0')+'h').slice(0,8);let prep=completed.map(o=>{const a=safeDateV126(o.accepted_at||o.created_at),b=safeDateV126(o.ready_at||o.completed_at);return a&&b?Math.max(0,(b-a)/60000):null}).filter(x=>x!==null&&x<1440);const avg=prep.length?prep.reduce((a,b)=>a+b,0)/prep.length:0;host.insertAdjacentHTML('beforeend',`<div class="panel"><div class="row"><h3 style="margin:0">Operação</h3><button class="ghost" data-pedevia-event="click" data-pedevia-call="exportOrdersCsvV127">Exportar CSV</button></div><div class="v126StatsGrid"><div class="v126Stat"><b>${avg?Math.round(avg)+' min':'—'}</b><small>Tempo médio até ficar pronto</small></div><div class="v126Stat"><b>${period.length}</b><small>Pedidos registrados no período</small></div></div></div><div class="panel"><h3>Faturamento por forma de pagamento</h3>${barsV127(byPay,v=>brl(v))||'<p class="hint">Sem dados.</p>'}</div><div class="panel"><h3>Pedidos por modalidade</h3>${barsV127(byMode)||'<p class="hint">Sem dados.</p>'}</div><div class="panel"><h3>Horários de pico</h3>${barsV127(byHour)||'<p class="hint">Sem dados.</p>'}</div>`)};

// --- Limpeza de textos históricos do Point onde não fazem sentido na plataforma ---
function cleanLegacyLabelsV127(){document.querySelectorAll('#adminContent .hint').forEach(el=>{if(el.textContent?.trim()==='Visão geral do Point do Açaí.')el.textContent='Visão geral do estabelecimento.'});if(!tenantSlugFromLocationV121())document.title=`${cfg.store?.name||'Point do Açaí Frontin'} · Pedevia`}
const _renderAdminV127Clean=renderAdmin;
renderAdmin=function(){_renderAdminV127Clean();setTimeout(cleanLegacyLabelsV127,0)};

syncServerClockV127();setInterval(syncServerClockV127,10*60*1000);
setTimeout(()=>{sanitizeTenantV127();cleanLegacyLabelsV127();document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0')})},0);

// --- Backups de configuração + resumo do painel mestre ---
async function openConfigBackupsV127(){
  generalShell('Backups de configuração','<div id="v127Backups"><p class="hint">Carregando backups...</p></div>');
  const host=document.getElementById('v127Backups');
  try{const {data,error}=await supabaseClient.from('pedevia_config_backups').select('id,store_key,actor_email,created_at').eq('store_key',currentStoreKeyV127()).order('created_at',{ascending:false}).limit(30);if(error)throw error;const rows=data||[];host.innerHTML=rows.length?`<p class="hint">A Pedevia salva automaticamente a versão anterior sempre que a configuração da loja é alterada.</p>${rows.map((b,i)=>`<div class="adminItem"><div><b>Backup ${rows.length-i}</b><small>${new Date(b.created_at).toLocaleString('pt-BR')}${b.actor_email?' · '+esc(b.actor_email):''}</small></div><button class="ghost" onclick="restoreConfigBackupV127('${b.id}')">Restaurar</button></div>`).join('')}`:'<div class="notice">Ainda não há backups. O primeiro será criado automaticamente na próxima alteração salva.</div>'}catch(e){host.innerHTML=`<div class="notice bad">Não foi possível carregar os backups: ${esc(e.message||e)}</div>`}
}
async function restoreConfigBackupV127(id){if(!confirm('Restaurar esta versão da configuração?\n\nA configuração atual também será preservada como backup antes da restauração.'))return;try{const {error}=await supabaseClient.rpc('restore_pedevia_config_backup_v127',{p_backup_id:id});if(error)throw error;alert('Backup restaurado. A página será recarregada para aplicar a versão escolhida.');location.reload()}catch(e){alert('Não foi possível restaurar: '+(e.message||e))}}
const _adminMoreV127BackupBase=adminMore;
adminMore=function(){_adminMoreV127BackupBase();const list=document.querySelector('#adminContent .moreList');if(!list||document.getElementById('backupCardV127'))return;const h=document.createElement('div');h.id='backupCardV127';h.innerHTML=moreCard('↶','Backups da configuração','Restaure uma versão anterior da sua loja','openConfigBackupsV127()');list.appendChild(h)};

const _renderClientSitesListV127Base=renderClientSitesListV120;
renderClientSitesListV120=function(rows){_renderClientSitesListV127Base(rows);const host=document.getElementById('clientSitesListV120');if(!host||document.getElementById('masterSummaryV127'))return;const active=(rows||[]).filter(x=>x.active).length,box=document.createElement('div');box.id='masterSummaryV127';box.className='v126StatsGrid';box.innerHTML=`<div class="v126Stat"><b>${rows?.length||0}</b><small>Estabelecimentos</small></div><div class="v126Stat"><b>${active}</b><small>Lojas ativas</small></div><div class="v126Stat"><b>${(rows?.length||0)-active}</b><small>Rascunhos/inativas</small></div>`;host.prepend(box)};



/* ===== Pedevia v1.30.2 · Consolidação comercial ===== */
window.PedeviaV130 = window.PedeviaV130 || {
  version:'1.32.30',
  ensureDefaults(){
    cfg.store=cfg.store||{}; cfg.store.orderConfig=cfg.store.orderConfig||{};
    const o=cfg.store.orderConfig;
    if(o.alertVolume===undefined)o.alertVolume=.65;
    if(o.printWidth===undefined)o.printWidth='80';
    if(o.whatsAppStatusMessages===undefined)o.whatsAppStatusMessages=true;
    if(!o.statusMessages)o.statusMessages={
      accepted:'Olá, {cliente}! Seu pedido {pedido} foi confirmado e já entrou na fila de preparo. 💜',
      preparing:'Olá, {cliente}! Seu pedido {pedido} já está sendo preparado. 👨‍🍳',
      ready:'Olá, {cliente}! Seu pedido {pedido} está pronto! 🎉',
      completed:'Obrigado pelo pedido, {cliente}! 💜 Esperamos que você aproveite.',
      cancelled:'Olá, {cliente}. Precisamos cancelar o pedido {pedido}. Entre em contato conosco para mais informações.'
    };
    if(!Array.isArray(cfg.store.specialHours))cfg.store.specialHours=[];
    if(!Array.isArray(cfg.store.specialClosures))cfg.store.specialClosures=[];
    (cfg.products||[]).forEach(p=>{if(p.featured===undefined)p.featured=false;if(p.isNew===undefined)p.isNew=false;if(p.bestSeller===undefined)p.bestSeller=false});
  },
  async persist(products=false,msg='Alterações salvas online.'){
    try{
      if(typeof persistAdminStateV15==='function')return await persistAdminStateV15({products,notify:true,message:msg});
      save(); return true;
    }catch(e){console.error(e);alert('Não foi possível salvar: '+(e.message||e));return false}
  },
  minutesAgo(v){const d=new Date(v);if(!Number.isFinite(d.getTime()))return '';const m=Math.max(0,Math.floor((Date.now()-d.getTime())/60000));return m<1?'agora':m===1?'há 1 min':`há ${m} min`},
  orderAgeClass(o){const m=Math.max(0,(Date.now()-new Date(o.created_at).getTime())/60000);return m>=30?'late':m>=15?'warn':''},
  orderNext(status){return ({new:'accepted',accepted:'preparing',preparing:'ready',ready:'completed'})[status]||''},
  nextLabel(status){return ({new:'Aceitar pedido',accepted:'Iniciar preparo',preparing:'Marcar como pronto',ready:'Concluir pedido'})[status]||''},
  statusEmoji(status){return ({new:'🔔',accepted:'✓',preparing:'🍳',ready:'✅',completed:'🏁',cancelled:'✕'})[status]||'•'},
  templateStatus(o,status){
    const tpl=cfg.store?.orderConfig?.statusMessages?.[status]||'';
    return tpl.replaceAll('{cliente}',o.customer_name||'cliente').replaceAll('{pedido}',orderNumberV125(o)).replaceAll('{loja}',o.store_name||currentStoreNameV125());
  },
  waUrl(phone,text){let d=String(phone||'').replace(/\D/g,'');if(d.length===10||d.length===11)d='55'+d;return d.length>=12?`https://wa.me/${d}?text=${encodeURIComponent(text||'')}`:''},
  async setStatus(id,status,sendMessage=false){
    const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;
    const now=new Date().toISOString(),patch={status,updated_at:now};
    if(status==='accepted'&&!o.accepted_at)patch.accepted_at=now;
    if(status==='preparing'&&!o.preparing_at)patch.preparing_at=now;
    if(status==='ready'&&!o.ready_at)patch.ready_at=now;
    if(status==='completed'&&!o.completed_at)patch.completed_at=now;
    if(status==='cancelled'&&!o.cancelled_at)patch.cancelled_at=now;
    const {error}=await supabaseClient.from('pedevia_orders').update(patch).eq('id',id).eq('store_key',currentStoreKeyV127());
    if(error){alert('Não foi possível atualizar o pedido: '+error.message);return}
    Object.assign(o,patch);
    if(sendMessage&&cfg.store?.orderConfig?.whatsAppStatusMessages!==false){const u=this.waUrl(o.customer_phone,this.templateStatus(o,status));if(u)window.open(u,'_blank')}
    await this.loadBoard();
  },
  orderCard(o){
    const next=this.orderNext(o.status), age=this.minutesAgo(o.created_at), ageClass=this.orderAgeClass(o);
    const address=[o.address,o.neighborhood].filter(Boolean).join(' · ');
    return `<article class="v130OrderCard ${ageClass}">
      <div class="v130OrderTop"><div><b>${orderNumberV125(o)}</b><span class="v130Age">${esc(age)}</span></div><strong>${brl(+o.total||0)}</strong></div>
      <div class="v130Customer"><b>${esc(o.customer_name||'Cliente')}</b><small>${esc(orderModeLabelV125(o.order_mode))}${o.table_number?' · Mesa '+esc(o.table_number):''}</small></div>
      ${address?`<button class="v130Address" onclick="PedeviaV130.openMaps('${encodeURIComponent(address)}')">⌖ ${esc(address)}</button>`:''}
      <div class="v130Mini">${(o.items||[]).slice(0,3).map(i=>`${i.quantity||1}x ${esc(i.name||'Produto')}`).join(' · ')}${(o.items||[]).length>3?' +'+((o.items||[]).length-3):''}</div>
      ${next?`<button class="btn full v130Next" onclick="PedeviaV130.setStatus('${o.id}','${next}',false)">${this.nextLabel(o.status)}</button>`:''}
      <div class="v130CardActions"><button onclick="viewOrderV125('${o.id}')">Ver</button><button onclick="PedeviaV130.messageStatus('${o.id}')">WhatsApp</button><button onclick="printOrderV127('${o.id}')">Imprimir</button></div>
    </article>`;
  },
  openMaps(encoded){const q=decodeURIComponent(encoded);window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q),'_blank')},
  messageStatus(id){const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;const status=o.status==='new'?'accepted':o.status;const text=this.templateStatus(o,status)||`Olá, ${o.customer_name||'cliente'}! Sobre o seu pedido ${orderNumberV125(o)}:`;const u=this.waUrl(o.customer_phone,text);if(!u){alert('Este pedido não possui WhatsApp válido.');return}window.open(u,'_blank')},
  async loadBoard(){
    const host=document.getElementById('ordersListV130');if(!host)return;
    try{
      const rows=await fetchOrdersV125(); window.pedeviaOrdersV125=rows;
      const active=rows.filter(o=>!['completed','cancelled'].includes(o.status));
      const completedToday=rows.filter(o=>o.status==='completed'&&new Date(o.completed_at||o.updated_at).toDateString()===new Date().toDateString());
      const revenue=completedToday.reduce((a,o)=>a+(+o.total||0),0);
      const groups=[['new','Novos'],['accepted','Aceitos'],['preparing','Preparando'],['ready','Prontos']];
      const cols=groups.map(([s,label])=>{const list=active.filter(o=>o.status===s);return `<section class="v130OrderCol"><header><span>${this.statusEmoji(s)} ${label}</span><b>${list.length}</b></header><div>${list.length?list.map(o=>this.orderCard(o)).join(''):`<div class="v130Empty">Nenhum pedido</div>`}</div></section>`}).join('');
      host.innerHTML=`<div class="v130Today"><div><b>${completedToday.length}</b><span>concluídos hoje</span></div><div><b>${brl(revenue)}</b><span>faturamento hoje</span></div><div><b>${active.length}</b><span>em andamento</span></div></div><div class="v130Board">${cols}</div>`;
      this.refreshOrderBadge(rows.filter(o=>o.status==='new').length);
    }catch(e){host.innerHTML=`<div class="notice bad">Não foi possível carregar os pedidos: ${esc(e.message||e)}</div>`}
  },
  refreshOrderBadge(n){
    document.querySelectorAll('button').forEach(b=>{if((b.textContent||'').trim().startsWith('Pedidos')){let x=b.querySelector('.v130NavBadge');if(n>0){if(!x){x=document.createElement('span');x.className='v130NavBadge';b.appendChild(x)}x.textContent=n}else x?.remove()}})
  },
  renderOrders(){
    const st=openState(),paused=cfg.store.paused;
    document.getElementById('adminContent').innerHTML=`<div class="v130OrdersHead"><div><h2>Pedidos</h2><div class="hint">Operação em tempo real · ${esc(st.text||'')}</div></div><div class="v130HeadBtns"><button class="ghost" onclick="adminOrdersView='stats';adminOrders()">Estatísticas</button><button class="ghost" onclick="adminOrdersView='history';adminOrders()">Histórico</button><button class="ghost" onclick="adminOrdersView='config';adminOrders()">⚙</button></div></div><div class="storeState ${paused?'paused':''}"><div><span class="stateDot"></span><b>${paused?'Recebimento pausado':st.open?'Estabelecimento aberto':'Estabelecimento fechado'}</b><div style="font-size:12px;opacity:.8">${paused?'Pedidos online temporariamente pausados':st.text}</div></div><button data-pedevia-event="click" data-pedevia-call="toggleOrdersPaused">${paused?'Retomar':'Pausar'} ▾</button></div><div id="ordersListV130"></div>`;
    this.loadBoard();
  },
  renderHistory(){
    adminOrdersView='history'; ordersTabV126='history';
    const host=document.getElementById('adminContent');
    if(!host)return;
    host.innerHTML=`<div class="v130OrdersHead"><div><h2>Histórico de pedidos</h2><div class="hint">Pedidos concluídos e cancelados ficam guardados aqui.</div></div><div class="v130HeadBtns"><button class="ghost" onclick="adminOrdersView='active';ordersTabV126='active';adminOrders()">← Pedidos ativos</button><button class="ghost" onclick="adminOrdersView='stats';adminOrders()">Estatísticas</button></div></div><div id="ordersListV125"></div>`;
    return loadOrdersPanelV126();
  },
  enhanceShop(){
    const tabs=document.getElementById('categoryTabs'),grid=document.getElementById('productGrid');if(!tabs||!grid)return;
    if(!document.getElementById('v130ShopTools')){const d=document.createElement('div');d.id='v130ShopTools';d.className='v130ShopTools';const search=document.createElement('div');search.className='v130Search';const icon=document.createElement('span');icon.textContent='⌕';const input=document.createElement('input');input.id='v130SearchInput';input.placeholder='Buscar produto';input.addEventListener('input',()=>PedeviaV130.filterProducts(input.value));search.append(icon,input);d.append(search);tabs.parentNode.insertBefore(d,tabs)}
    grid.querySelectorAll('.card').forEach(card=>{
      const onclick=card.getAttribute('onclick')||'',m=onclick.match(/openProduct\('([^']+)'\)/),id=m?.[1];if(!id)return;const p=(cfg.products||[]).find(x=>String(x.id)===String(id));if(!p)return;
      card.dataset.search=((p.name||'')+' '+(p.desc||'')).toLowerCase();
      if(!card.querySelector('.v130Badges')){const badges=[];if(p.bestSeller)badges.push('🔥 Mais pedido');if(p.featured)badges.push('⭐ Destaque');if(p.isNew)badges.push('🆕 Novo');if(badges.length){const b=document.createElement('div');b.className='v130Badges';badges.forEach(text=>{const badge=document.createElement('span');badge.textContent=text;b.append(badge)});card.prepend(b)}}
    });
    const st=openState();const status=document.getElementById('storeStatus');if(status)status.classList.toggle('v130Open',!!st.open);
  },
  filterProducts(v){const q=String(v||'').trim().toLowerCase();document.querySelectorAll('#productGrid .card').forEach(c=>c.style.display=!q||(c.dataset.search||'').includes(q)?'':'none');document.querySelectorAll('#productGrid .clientSection').forEach(s=>{const any=[...s.querySelectorAll('.card')].some(c=>c.style.display!=='none');s.style.display=any?'':'none'})},
  enhanceAdminProducts(){
    document.querySelectorAll('#adminContent .adminProdCard').forEach(card=>{
      const edit=card.querySelector('button[onclick*="editProduct"]');if(!edit||card.querySelector('.v130ProdTools'))return;const m=(edit.getAttribute('onclick')||'').match(/editProduct\('([^']+)'\)/),id=m?.[1];if(!id)return;
      const tools=document.createElement('div');tools.className='v130ProdTools';tools.innerHTML=`<button class="ghost" onclick="PedeviaV130.toggleProduct('${id}')">Disponível ↔</button>`;card.appendChild(tools)
    })
  },
  async duplicateProduct(id){const p=(cfg.products||[]).find(x=>String(x.id)===String(id));if(!p)return;const copy=JSON.parse(JSON.stringify(p));copy.id='p'+Date.now();copy.name=(p.name||'Produto')+' — cópia';copy.status='hidden';cfg.products.push(copy);if(await this.persist(true,'Produto duplicado.')){renderAdmin();renderShop()}},
  async toggleProduct(id){const p=(cfg.products||[]).find(x=>String(x.id)===String(id));if(!p)return;p.status=p.status==='available'?'unavailable':'available';if(await this.persist(true,'Status do produto atualizado.')){renderAdmin();renderShop()}},
  enhanceProductEditor(id){
    const p=(cfg.products||[]).find(x=>String(x.id)===String(id)),footer=document.querySelector('.stickySave');if(!p||!footer||document.getElementById('v130ProductFlags'))return;
    const box=document.createElement('div');box.id='v130ProductFlags';box.className='panel v130Flags';box.innerHTML=`<h3>Destaques no cardápio</h3><label class="switchrow"><span>⭐ Produto em destaque</span><input id="v130Featured" type="checkbox" ${p.featured?'checked':''}></label><label class="switchrow"><span>🔥 Marcar como mais pedido</span><input id="v130Best" type="checkbox" ${p.bestSeller?'checked':''}></label><label class="switchrow"><span>🆕 Marcar como novidade</span><input id="v130New" type="checkbox" ${p.isNew?'checked':''}></label>`;footer.parentNode.insertBefore(box,footer)
  },
  captureProductFlags(id){const p=(cfg.products||[]).find(x=>String(x.id)===String(id));if(!p)return;p.featured=!!document.getElementById('v130Featured')?.checked;p.bestSeller=!!document.getElementById('v130Best')?.checked;p.isNew=!!document.getElementById('v130New')?.checked},
  tempClose(minutes){cfg.store.temporaryPauseUntil=minutes?new Date(Date.now()+minutes*60000).toISOString():'';cfg.store.pauseMessage=minutes?`Fechado temporariamente. Voltamos em aproximadamente ${minutes} minutos.`:'';this.persist(false,'Fechamento temporário salvo.').then(()=>{renderShop();generalHours()})},
  clearTempClose(){cfg.store.temporaryPauseUntil='';cfg.store.pauseMessage='';this.persist(false,'Loja reaberta.').then(()=>{renderShop();generalHours()})},
  addSpecialHours(){const date=document.getElementById('v130SpecialDate')?.value,a=document.getElementById('v130SpecialStart')?.value,b=document.getElementById('v130SpecialEnd')?.value;if(!date||!a||!b){alert('Informe data, abertura e fechamento.');return}cfg.store.specialHours=cfg.store.specialHours||[];cfg.store.specialHours=cfg.store.specialHours.filter(x=>x.date!==date);cfg.store.specialHours.push({date,ranges:[[a,b]]});generalHours()},
  removeSpecialHours(date){cfg.store.specialHours=(cfg.store.specialHours||[]).filter(x=>x.date!==date);generalHours()},
  specialHoursHtml(){return (cfg.store.specialHours||[]).map(x=>`<div class="v127Exception"><div><b>${esc(new Date(x.date+'T12:00:00').toLocaleDateString('pt-BR'))}</b><small>${esc((x.ranges||[]).map(r=>r.join('–')).join(', '))}</small></div><button class="ghost" onclick="PedeviaV130.removeSpecialHours('${x.date}')">Remover</button></div>`).join('')||'<p class="hint">Nenhum horário especial.</p>'},
  showInstallHelp(){showModal(`<div class="row"><h2>Instalar Pedevia</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p>A Pedevia pode ser instalada na tela inicial do celular e aberta como aplicativo.</p><div class="notice"><b>Android/Chrome:</b><br>Menu ⋮ → Adicionar à tela inicial / Instalar app.</div><div class="notice"><b>iPhone/Safari:</b><br>Compartilhar → Adicionar à Tela de Início.</div>`)},
  async requestNotifications(){if(!('Notification'in window)){alert('Este navegador não oferece notificações.');return}const p=await Notification.requestPermission();alert(p==='granted'?'Notificações liberadas.':'As notificações não foram liberadas.')},
  renderPanelSettings(){
    this.ensureDefaults();const o=cfg.store.orderConfig;
    showModal(`<div class="row"><h2>Painel de pedidos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
      <label class="switchrow"><span>Alertas sonoros</span><input id="orAlerts" type="checkbox" ${o.panelAlerts!==false?'checked':''}></label>
      <label>Volume do alerta</label><input id="v130Volume" type="range" min="0" max="1" step=".05" value="${Number(o.alertVolume??.65)}" class="field">
      <button class="ghost full" data-pedevia-event="click" data-pedevia-call="beepOrderV127">🔊 Testar som</button>
      <label class="switchrow"><span>Abrir WhatsApp ao mudar o status</span><input id="v130StatusWa" type="checkbox" ${o.whatsAppStatusMessages!==false?'checked':''}></label>
      <label>Largura da impressora térmica</label><select id="v130PrintWidth" class="field"><option value="58" ${String(o.printWidth)==='58'?'selected':''}>58 mm</option><option value="80" ${String(o.printWidth)!=='58'?'selected':''}>80 mm</option></select>
      <button class="ghost full" data-pedevia-event="click" data-pedevia-call="PedeviaV130.requestNotifications">Permitir notificações do navegador</button>
      <h3>Mensagens automáticas</h3>${['accepted','preparing','ready','completed','cancelled'].map(s=>`<label>${orderStatusLabelV125(s)}</label><textarea id="v130Msg_${s}" class="field">${esc(o.statusMessages?.[s]||'')}</textarea>`).join('')}
      <p class="hint">Use {cliente}, {pedido} e {loja} como variáveis.</p>
      <button class="btn full" data-pedevia-event="click" data-pedevia-call="PedeviaV130.savePanelSettings">Salvar</button>`)
  },
  async savePanelSettings(){const o=cfg.store.orderConfig;o.panelAlerts=!!document.getElementById('orAlerts')?.checked;o.alertVolume=+document.getElementById('v130Volume')?.value||0;o.whatsAppStatusMessages=!!document.getElementById('v130StatusWa')?.checked;o.printWidth=document.getElementById('v130PrintWidth')?.value||'80';o.statusMessages=o.statusMessages||{};['accepted','preparing','ready','completed','cancelled'].forEach(s=>o.statusMessages[s]=document.getElementById('v130Msg_'+s)?.value||'');if(await this.persist(false,'Painel de pedidos configurado.')){closeModal();adminOrderSettings()}},
  async masterMetrics(){
    const box=document.getElementById('masterSummaryV130');if(!box)return;
    try{const since=new Date();since.setDate(1);since.setHours(0,0,0,0);const {data,error}=await supabaseClient.from('pedevia_orders').select('store_key,total,status,created_at').gte('created_at',since.toISOString());if(error)throw error;const rows=data||[],completed=rows.filter(o=>o.status==='completed'),rev=completed.reduce((a,o)=>a+(+o.total||0),0);box.innerHTML=`<div class="v126Stat"><b>${rows.length}</b><small>Pedidos este mês</small></div><div class="v126Stat"><b>${brl(rev)}</b><small>Movimentado no mês</small></div><div class="v126Stat"><b>${new Set(rows.map(x=>x.store_key)).size}</b><small>Lojas com pedidos</small></div>`}catch(e){box.innerHTML=''}
  },
  init(){this.ensureDefaults();setTimeout(()=>{try{this.enhanceShop()}catch(e){}},400);if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js?v=13300stable1',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})}
};


// Hooks v1.30
const _renderShopV130Base=renderShop;
renderShop=function(){_renderShopV130Base();setTimeout(()=>PedeviaV130.enhanceShop(),0)};
const _adminMenuV130Base=adminMenu;
adminMenu=function(){_adminMenuV130Base();setTimeout(()=>PedeviaV130.enhanceAdminProducts(),0)};
const _editProductV130Base=editProduct;
editProduct=function(id){_editProductV130Base(id);setTimeout(()=>PedeviaV130.enhanceProductEditor(id),0)};
const _saveProductV130Base=saveProduct;
saveProduct=async function(id){
  PedeviaV130.captureProductFlags(id);
  if(!window.pedeviaTenantV121)return await _saveProductV130Base(id);
  const p=cfg.products.find(x=>String(x.id)===String(id));if(!p)return;
  p.name=document.getElementById('epn')?.value.trim()||'Produto';
  p.desc=document.getElementById('epd')?.value||'';
  p.detailedDesc=document.getElementById('epdetail')?.value||'';
  p.price=+document.getElementById('epp')?.value||0;
  p.category=document.getElementById('epc')?.value||p.category;
  p.image=p._pendingImage||document.getElementById('epi')?.value.trim()||p.image||'';delete p._pendingImage;
  p.status=document.getElementById('eps')?.value||'available';
  if(typeof collectVariantsFromEditor==='function')p.variants=collectVariantsFromEditor();delete p._draftVariants;
  if(typeof hasVariants==='function'&&!hasVariants(p)){p.allowedModes={delivery:document.getElementById('pmDelivery')?.checked??true,pickup:document.getElementById('pmPickup')?.checked??false,dinein:document.getElementById('pmDinein')?.checked??false};if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein){alert('Escolha pelo menos uma forma de atendimento para este produto.');return}}
  if(await PedeviaV130.persist(true,'Produto salvo online.')){closeModal();renderAdmin();renderShop()}
};
const _deleteProductV130Base=deleteProductOnline;
deleteProductOnline=async function(id){
  if(!window.pedeviaTenantV121)return await _deleteProductV130Base(id);
  const p=cfg.products.find(x=>String(x.id)===String(id));if(!p)return;
  if(!confirm(`Excluir "${p.name}" do cardápio?`))return;
  cfg.products=cfg.products.filter(x=>String(x.id)!==String(id));
  if(await PedeviaV130.persist(true,'Produto excluído.')){closeModal();renderAdmin();renderShop()}
};


// Persiste os novos campos de destaque também no catálogo do Point.
const _dbRowToProductV130Base=dbRowToProduct;
dbRowToProduct=function(r){const p=_dbRowToProductV130Base(r);p.featured=!!r.featured;p.isNew=!!r.is_new;p.bestSeller=!!r.best_seller;return p};
const _productToDbRowV130Base=productToDbRow;
productToDbRow=function(p,sortOrder){const r=_productToDbRowV130Base(p,sortOrder);r.featured=!!p.featured;r.is_new=!!p.isNew;r.best_seller=!!p.bestSeller;return r};

// Painel em colunas.
adminOrders=function(){
  if(adminOrdersView==='config'){adminOrderSettings();return}
  if(adminOrdersView==='stats'){if(typeof adminStatisticsV126==='function')return adminStatisticsV126();}
  if(adminOrdersView==='history'){return PedeviaV130.renderHistory()}
  PedeviaV130.renderOrders();
};

// Configuração profissional do painel.
editPanelSettings=function(){PedeviaV130.renderPanelSettings()};

// Alerta respeita volume configurável.
beepOrderV127=function(){if(cfg.store?.orderConfig?.panelAlerts===false)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain(),vol=Math.max(.001,Math.min(1,+cfg.store?.orderConfig?.alertVolume||.65));o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.setValueAtTime(.001,c.currentTime);g.gain.exponentialRampToValueAtTime(.18*vol,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.48);o.start();o.stop(c.currentTime+.5)}catch(e){}};
const _notifyNewOrderV130Base=notifyNewOrderV127;
notifyNewOrderV127=function(row){_notifyNewOrderV130Base(row);PedeviaV130.refreshOrderBadge(((window.pedeviaOrdersV125||[]).filter(o=>o.status==='new').length)||1);if(document.getElementById('ordersListV130'))PedeviaV130.loadBoard()};

// Horário: pausa temporária e exceção com horário especial.
const _scheduleStateV130Base=scheduleStateV127;
scheduleStateV127=function(){
  const now=nowV127(),until=cfg.store?.temporaryPauseUntil?new Date(cfg.store.temporaryPauseUntil):null;
  if(until&&Number.isFinite(until.getTime())&&until>now)return{open:false,text:cfg.store.pauseMessage||('Fechado temporariamente · volta '+until.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}))};
  const date=dateKeyV127(now),sp=(cfg.store?.specialHours||[]).find(x=>x?.date===date);
  if(sp&&Array.isArray(sp.ranges)){const m=now.getHours()*60+now.getMinutes();for(const r of sp.ranges){const a=hmV127(r[0]),b=hmV127(r[1]);if(a===b||a<b&&m>=a&&m<b||a>b&&m>=a)return{open:true,text:`Aberto em horário especial · até ${r[1]}`}}return{open:false,text:'Fechado agora · horário especial hoje: '+sp.ranges.map(r=>r.join('–')).join(', ')}}
  return _scheduleStateV130Base();
};
openState=function(){return scheduleStateV127()};

// Estende tela de horários sem reescrever o restante.
const _generalHoursV130Base=generalHours;
generalHours=function(){_generalHoursV130Base();setTimeout(()=>{const panel=document.querySelector('#adminContent .panel');if(!panel||document.getElementById('v130HoursExtra'))return;const x=document.createElement('div');x.id='v130HoursExtra';x.innerHTML=`<div class="panel" style="margin-top:14px"><h3>Fechar agora</h3><p class="hint">Pausa temporária sem alterar sua programação semanal.</p><div class="v130HoursQuick"><button class="ghost" onclick="PedeviaV130.tempClose(30)">30 min</button><button class="ghost" onclick="PedeviaV130.tempClose(60)">1 hora</button><button class="ghost" onclick="PedeviaV130.tempClose(180)">3 horas</button><button class="ghost" data-pedevia-event="click" data-pedevia-call="PedeviaV130.clearTempClose">Reabrir agora</button></div></div><div class="panel" style="margin-top:14px"><h3>Horário especial por data</h3><p class="hint">Ex.: em um feriado abrir somente das 18h às 22h.</p><input id="v130SpecialDate" type="date" class="field"><div class="two"><input id="v130SpecialStart" type="time" class="field"><input id="v130SpecialEnd" type="time" class="field"></div><button class="ghost full" data-pedevia-event="click" data-pedevia-call="PedeviaV130.addSpecialHours">+ Adicionar horário especial</button><div style="margin-top:10px">${PedeviaV130.specialHoursHtml()}</div></div>`;const saveBtn=[...panel.querySelectorAll('button')].find(b=>(b.textContent||'').includes('Salvar horários'));if(saveBtn)panel.insertBefore(x,saveBtn);else panel.appendChild(x)},0)};
adminHours=generalHours;

// Impressão 58/80 mm.
printOrderV127=function(id){const o=(window.pedeviaOrdersV125||[]).find(x=>String(x.id)===String(id));if(!o)return;const width=String(cfg.store?.orderConfig?.printWidth||'80')==='58'?'52mm':'72mm';const w=window.open('','_blank','width=420,height=650');if(!w){alert('Permita pop-ups para imprimir o pedido.');return}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Pedido ${orderNumberV125(o)}</title><style>body{font:12px Arial;margin:3mm;color:#000}.c{text-align:center}.item{border-top:1px dashed #000;padding:6px 0}.item>div,.row{display:flex;justify-content:space-between;gap:6px}.item small{display:block;margin:2px 0}.total{border-top:2px solid #000;margin-top:7px;padding-top:7px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between}@media print{body{width:${width};margin:2mm}}</style></head><body><h2 class="c">${esc(o.store_name||currentStoreNameV125())}</h2><div class="c">Pedido ${orderNumberV125(o)} · ${orderDateV125(o.created_at)}</div><p><b>${esc(o.customer_name||'-')}</b><br>${esc(o.customer_phone||'')}<br>${esc(orderModeLabelV125(o.order_mode))}${o.address?'<br>'+esc(o.address):''}${o.neighborhood?' · '+esc(o.neighborhood):''}</p>${(o.items||[]).map(i=>`<div class="item"><div><b>${i.quantity||1}x ${esc(i.name||'Produto')}</b><span>${brl((+i.unit_price||0)*(+i.quantity||1))}</span></div>${(i.groups||[]).map(g=>`<small>${esc(g.name||'Complementos')}: ${(g.items||[]).map(x=>esc(x.name||x)).join(', ')}</small>`).join('')}${i.note?`<small>Obs.: ${esc(i.note)}</small>`:''}</div>`).join('')}<p>Pagamento: ${esc(paymentKeyLabel(o.payment_method))}${o.note?'<br>Obs.: '+esc(o.note):''}</p><div class="total"><span>TOTAL</span><span>${brl(+o.total||0)}</span></div><script>onload=()=>{print();setTimeout(()=>close(),300)}<\/script></body></html>`);w.document.close()};

// Cartão PWA em Mais.
const _adminMoreV130Base=adminMore;
adminMore=function(){_adminMoreV130Base();const list=document.querySelector('#adminContent .moreList');if(list&&!document.getElementById('installCardV130')){const h=document.createElement('div');h.id='installCardV130';h.innerHTML=moreCard('▣','Instalar Pedevia','Adicionar o painel à tela inicial','PedeviaV130.showInstallHelp()');list.appendChild(h)}};

// Painel mestre com métricas reais do mês.
const _renderClientSitesListV130Base=renderClientSitesListV120;
renderClientSitesListV120=function(rows){_renderClientSitesListV130Base(rows);const host=document.getElementById('clientSitesListV120');if(host&&!document.getElementById('masterSummaryV130')){const d=document.createElement('div');d.id='masterSummaryV130';d.className='v126StatsGrid';host.prepend(d);PedeviaV130.masterMetrics()}};

// Versão.
setTimeout(()=>{PedeviaV130.init();document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0')})},600);

// ===== v1.30.1 extras: Storage de imagens + UX de checkout =====
Object.assign(PedeviaV130,{
  async dataUrlToBlob(data){const r=await fetch(data);return await r.blob()},
  async uploadMedia(dataUrl,path){
    const blob=await this.dataUrlToBlob(dataUrl),bucket=supabaseClient.storage.from('pedevia-media');
    const {error}=await bucket.upload(path,blob,{upsert:true,contentType:blob.type||'image/jpeg',cacheControl:'31536000'});if(error)throw error;
    const {data}=bucket.getPublicUrl(path);if(!data?.publicUrl)throw new Error('Não foi possível obter a URL pública da imagem.');return data.publicUrl
  },
  async uploadProductImage(id,data){const key=currentStoreKeyV127(),path=`${key}/products/${String(id).replace(/[^a-zA-Z0-9_-]/g,'_')}-${Date.now()}.jpg`;return await this.uploadMedia(data,path)},
  async uploadBrandImage(data){const key=currentStoreKeyV127(),path=`${key}/brand/logo-${Date.now()}.jpg`;return await this.uploadMedia(data,path)},
  normalizePixText(v,max){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9 .\-]/g,'').toUpperCase().trim().slice(0,max)},
  emv(id,value){value=String(value);return id+String(value.length).padStart(2,'0')+value},
  crc16(payload){let crc=0xFFFF;for(let i=0;i<payload.length;i++){crc^=payload.charCodeAt(i)<<8;for(let j=0;j<8;j++)crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1),crc&=0xFFFF}return crc.toString(16).toUpperCase().padStart(4,'0')},
  pixPayload(amount){
    const o=cfg.store.orderConfig||{},key=String(o.pixKey||'').trim();if(!key)return'';
    const mai=this.emv('00','BR.GOV.BCB.PIX')+this.emv('01',key);
    let p=this.emv('00','01')+this.emv('26',mai)+this.emv('52','0000')+this.emv('53','986');
    if(Number(amount)>0)p+=this.emv('54',Number(amount).toFixed(2));
    p+=this.emv('58','BR')+this.emv('59',this.normalizePixText(o.pixHolder||cfg.store.name||'PEDEVIA',25)||'PEDEVIA')+this.emv('60',this.normalizePixText(o.pixCity||'RIO DE JANEIRO',15)||'RIO DE JANEIRO')+this.emv('62',this.emv('05','***'))+'6304';
    return p+this.crc16(p)
  },
  loadQrLib(){return new Promise((resolve,reject)=>{if(window.QRCode)return resolve();const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})},
  async enhancePixCheckout(){ return; },
  async copyText(v,msg){const t=decodeURIComponent(v);try{await navigator.clipboard.writeText(t);alert(msg||'Copiado.')}catch(e){prompt('Copie:',t)}},
  enhanceCartBar(){const bar=document.getElementById('cartBar')||document.querySelector('.cartbar');if(!bar)return;const count=(cart||[]).reduce((a,i)=>a+(+i.qty||0),0);let total=typeof sum==='function'?sum():0;try{if(typeof activeOfferDiscount==='function'){const d=activeOfferDiscount();total=Math.max(0,total-(Number(d&&d.amount)||0))}}catch(e){}const btn=bar.querySelector('button');if(btn){btn.innerHTML=`<span>🛒 <b id="cartCount">${count}</b> ${count===1?'item':'itens'}</span><span>·</span><b id="cartTotal">${brl(total)}</b><span style="opacity:.8">Ver carrinho</span>`}},
  sanitizeLegacy(){
    if(window.pedeviaTenantV121){const s=cfg.store||{};if(/point do açaí/i.test(String(s.shareTitle||'')))s.shareTitle=s.name||window.pedeviaTenantV121.name||'Estabelecimento';if(String(s.socialUrl||'').includes('point_frontin'))s.socialUrl='';if(String(s.instagram||'').includes('point_frontin'))s.instagram=''}
  }
});

// Imagens novas deixam de ser base64 e vão para Supabase Storage.
previewProductImage=function(id,input){
  const f=input.files&&input.files[0];if(!f)return;
  openImageCropper(f,{title:'Enquadrar foto do produto',shape:'square',outputWidth:1000,outputHeight:1000,onConfirm:async data=>{
    const p=cfg.products.find(x=>String(x.id)===String(id));if(!p)return;const prev=document.getElementById('prodPrev');if(prev)prev.innerHTML='<div class="hint">Enviando imagem...</div>';
    try{const url=await PedeviaV130.uploadProductImage(id,data);p.image=url;delete p._pendingImage;if(window.pedeviaTenantV121){await PedeviaV130.persist(true,'Imagem do produto salva.')}else{const {error}=await supabaseClient.from('products').upsert(productToDbRow(p,cfg.products.findIndex(x=>x.id===id)),{onConflict:'id'});if(error)throw error}try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}if(prev)prev.innerHTML=`<img src="${esc(url)}">`;renderShop();alert('Imagem salva no Storage da Pedevia.')}catch(e){console.error(e);if(prev)prev.innerHTML=productImagePreview(p);alert('Não foi possível enviar a imagem: '+(e.message||e))}
  }})
};

saveGeneralBrand=async function(){
  const f=document.getElementById('gLogo')?.files?.[0],s=cfg.store;s.name=document.getElementById('gName')?.value||s.name;s.legalName=document.getElementById('gLegal')?.value||'';s.cnpj=document.getElementById('gCnpj')?.value||'';
  if(!f){if(await PedeviaV130.persist(false,'Nome e marca salvos.')){renderShop();generalBrand()}return}
  openImageCropper(f,{title:'Enquadrar logo',shape:'circle',outputWidth:900,outputHeight:900,onConfirm:async data=>{try{s.brandImage=await PedeviaV130.uploadBrandImage(data);if(await PedeviaV130.persist(false,'Nome e logo salvos no Storage.')){renderShop();applyBrandHeaderV116?.();generalBrand()}}catch(e){alert('Não foi possível enviar a logo: '+(e.message||e))}}})
};

// Cidade Pix configurável.
const _editPixV130Base=editServiceAndPixV111;
editServiceAndPixV111=function(){return _editPixV130Base()};
const _savePixV130Base=saveServiceAndPixV111;
saveServiceAndPixV111=async function(){return await _savePixV130Base()};

const _showCustomerV130Base=showCustomerForm;
showCustomerForm=function(){_showCustomerV130Base();setTimeout(()=>PedeviaV130.enhancePixCheckout(),20)};
const _updateCartV130Base=updateCart;
updateCart=function(){const r=_updateCartV130Base();setTimeout(()=>PedeviaV130.enhanceCartBar(),0);return r};
setTimeout(()=>PedeviaV130.sanitizeLegacy(),800);



// v1.30 · ferramentas de catálogo em lote e migração de imagens antigas.
Object.assign(PedeviaV130,{
  selectedProducts(){return [...document.querySelectorAll('.v130ProdSelect:checked')].map(x=>x.value)},
  async bulkSet(status){const ids=this.selectedProducts();if(!ids.length){alert('Selecione pelo menos um produto.');return}ids.forEach(id=>{const p=(cfg.products||[]).find(x=>String(x.id)===String(id));if(p)p.status=status});if(await this.persist(true,'Produtos atualizados.')){renderAdmin();renderShop()}},
  async moveProduct(id,dir){const list=cfg.products||[],i=list.findIndex(x=>String(x.id)===String(id));if(i<0)return;const p=list[i],same=list.map((x,idx)=>({x,idx})).filter(a=>a.x.category===p.category),pos=same.findIndex(a=>a.idx===i),target=same[pos+dir];if(!target)return;[list[i],list[target.idx]]=[list[target.idx],list[i]];try{const ok=typeof persistAdminStateV15==='function'?await persistAdminStateV15({products:true,notify:false}):(save(),true);if(ok!==false){renderAdmin();renderShop()}}catch(e){console.error('Falha ao salvar ordem dos produtos',e);alert('Não foi possível salvar a nova ordem dos produtos.')}},
  async optimizeImages(){
    if(!confirm('Migrar imagens antigas salvas dentro da configuração para o Storage da Pedevia?\n\nIsso reduz o peso da loja e não altera as imagens que já estão em URLs.'))return;
    let changed=0;try{
      if(String(cfg.store?.brandImage||'').startsWith('data:image/')){cfg.store.brandImage=await this.uploadBrandImage(cfg.store.brandImage);changed++}
      for(const p of (cfg.products||[])){if(String(p.image||'').startsWith('data:image/')){p.image=await this.uploadProductImage(p.id,p.image);changed++}}
      if(!changed){alert('Não encontrei imagens antigas para migrar.');return}
      if(await this.persist(true,`${changed} imagem(ns) migrada(s) para o Storage.`)){renderShop();renderAdmin()}
    }catch(e){alert('A migração parou porque ocorreu um erro: '+(e.message||e))}
  }
});

// Amplia a melhoria visual do catálogo administrativo com seleção e ordenação.
const _enhanceAdminProductsV130Base=PedeviaV130.enhanceAdminProducts.bind(PedeviaV130);
PedeviaV130.enhanceAdminProducts=function(){
  _enhanceAdminProductsV130Base();
  const content=document.getElementById('adminContent');if(!content)return;
  const first=content.querySelector('.adminProdCard');
  if(first&&!document.getElementById('v130BulkToolbar')){const bar=document.createElement('div');bar.id='v130BulkToolbar';bar.className='v130BulkToolbar';const label=document.createElement('b');label.textContent='Ações em lote';bar.append(label);[['available','Disponibilizar'],['unavailable','Indisponibilizar'],['hidden','Ocultar']].forEach(([status,text])=>{const button=document.createElement('button');button.type='button';button.className='ghost';button.textContent=text;button.addEventListener('click',()=>PedeviaV130.bulkSet(status));bar.append(button)});first.parentNode.insertBefore(bar,first)}
  content.querySelectorAll('.adminProdCard').forEach(card=>{const edit=card.querySelector('button[onclick*="editProduct"]'),m=(edit?.getAttribute('onclick')||'').match(/editProduct\('([^']+)'\)/),id=m?.[1];if(!id)return;if(!card.querySelector('.v130ProdSelect')){const sel=document.createElement('label');sel.className='v130SelectWrap';const checkbox=document.createElement('input');checkbox.className='v130ProdSelect';checkbox.type='checkbox';checkbox.value=String(id);sel.append(checkbox,' Selecionar');card.prepend(sel)}const tools=card.querySelector('.v130ProdTools');if(tools&&!tools.querySelector('.v130MoveUp')){const up=document.createElement('button');up.className='ghost v130MoveUp';up.textContent='↑';up.onclick=()=>PedeviaV130.moveProduct(id,-1);const dn=document.createElement('button');dn.className='ghost';dn.textContent='↓';dn.onclick=()=>PedeviaV130.moveProduct(id,1);tools.append(up,dn)}})
};

// Card de otimização de imagens no menu Mais.
const _adminMoreV130MediaBase=adminMore;
adminMore=function(){_adminMoreV130MediaBase();const list=document.querySelector('#adminContent .moreList');if(list&&!document.getElementById('mediaOptimizeV130')){const h=document.createElement('div');h.id='mediaOptimizeV130';h.innerHTML=moreCard('◫','Otimizar imagens','Mover imagens antigas para o Storage da Pedevia','PedeviaV130.optimizeImages()');list.appendChild(h)}};

// ===== v1.31.0: GESTÃO COMERCIAL · VENCIMENTO, SUSPENSÃO E CANCELAMENTO =====
(function(){
  const STATUS_META_V131={
    draft:{label:'Rascunho',cls:'hidden',icon:'⚪'},
    active:{label:'Ativo',cls:'available',icon:'🟢'},
    suspended:{label:'Suspenso',cls:'unavailable',icon:'🟡'},
    cancelled:{label:'Cancelado',cls:'hidden',icon:'🔴'}
  };

  function serviceStatusV131(r){
    const s=String(r?.service_status||'').toLowerCase();
    if(STATUS_META_V131[s])return s;
    return r?.active?'active':'draft';
  }
  function statusBadgeV131(r){
    const s=serviceStatusV131(r),m=STATUS_META_V131[s];
    return `<span class="badge ${m.cls}">${m.icon} ${m.label}</span>`;
  }
  function brDateV131(v){
    if(!v)return 'Sem vencimento';
    const d=new Date(String(v).slice(0,10)+'T12:00:00');
    return Number.isFinite(d.getTime())?d.toLocaleDateString('pt-BR'):'Sem vencimento';
  }
  function isOverdueV131(r){
    if(!r?.billing_due_date||serviceStatusV131(r)!=='active')return false;
    const due=new Date(String(r.billing_due_date).slice(0,10)+'T23:59:59');
    return Number.isFinite(due.getTime())&&due<new Date();
  }
  window.serviceStatusV131=serviceStatusV131;

  // Status visual usado por todas as versões anteriores do painel mestre.
  clientSiteStatusV120=function(row){
    const overdue=isOverdueV131(row);
    return statusBadgeV131(row)+(overdue?' <span class="badge unavailable">Mensalidade vencida</span>':'');
  };

  // Lista mestre comercial com vencimento e ações rápidas.
  renderClientSitesListV120=function(rows){
    const el=document.getElementById('clientSitesListV120');if(!el)return;
    if(!rows?.length){
      el.innerHTML=`<div class="emptySection"><b>Nenhuma loja criada ainda.</b><br><span class="hint">Clique em “+ Nova loja” para criar o primeiro estabelecimento.</span></div>`;
      return;
    }
    const total=rows.length,active=rows.filter(r=>serviceStatusV131(r)==='active').length,suspended=rows.filter(r=>serviceStatusV131(r)==='suspended').length,overdue=rows.filter(isOverdueV131).length;
    el.innerHTML=`<div class="v126StatsGrid" id="masterSummaryV131">
      <div class="v126Stat"><b>${total}</b><small>Estabelecimentos</small></div>
      <div class="v126Stat"><b>${active}</b><small>Ativos</small></div>
      <div class="v126Stat"><b>${suspended}</b><small>Suspensos</small></div>
      <div class="v126Stat"><b>${overdue}</b><small>Vencidos</small></div>
    </div>`+rows.map(r=>{
      const url=tenantPublicUrlV121(r.slug||''),s=serviceStatusV131(r),due=r.billing_due_date?`Vencimento: ${brDateV131(r.billing_due_date)}`:'Vencimento não definido',fee=Number(r.monthly_fee||0)>0?`Mensalidade: ${Number(r.monthly_fee).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`:'Mensalidade não definida';
      const quick=s==='suspended'||s==='cancelled'||s==='draft'
        ?`<button class="ghost" onclick="setClientServiceStatusV131('${r.id}','active')">Reativar</button>`
        :`<button class="ghost" onclick="setClientServiceStatusV131('${r.id}','suspended')">Suspender</button>`;
      return `<div class="adminItem" style="align-items:flex-start">
        <div style="min-width:0"><b>${esc(r.name||'Loja')}</b> ${clientSiteStatusV120(r)}<br>
        <span class="hint">/${esc(r.slug||'')} · ${esc(r.admin_email||'sem administrador')}</span><br>
        <small class="hint">${esc(fee)} · ${esc(due)}${isOverdueV131(r)?' · <b style="color:#b91c1c">VENCIDO</b>':''}</small><br>
        <small class="hint">${esc(url)}</small></div>
        <div class="miniBtns" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          <button class="ghost" onclick="openClientSiteV121('${r.id}')">Abrir site</button>
          <button class="ghost" onclick="copyClientSiteLinkV121('${r.id}')">Copiar link</button>
          ${quick}
          <button class="ghost" onclick="editClientSiteV120('${r.id}')">Gerenciar</button>
        </div>
      </div>`;
    }).join('');
  };

  // Modal de gerenciamento comercial da loja.
  editClientSiteV120=function(id){
    const r=(window.clientSitesV120||[]).find(x=>String(x.id)===String(id));if(!r)return;
    const cfg0=r.config||{},s0=cfg0.store||{},status=serviceStatusV131(r),m=STATUS_META_V131[status];
    window.clientQrDraftV1201=s0.clientQrImage||'';
    window.clientLogoDraftV1211=s0.brandImage||'';
    const heroTitle=s0.heroTitle||'Texto inicial do site',heroText=s0.heroText||'';
    showModal(`<div class="row"><div><h2 style="margin:0">${esc(r.name)}</h2><div class="hint">Gestão do estabelecimento na Pedevia</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
      <div class="panel" style="padding:13px;margin:12px 0">
        <div class="row"><div><b>Situação do serviço</b><div class="hint">Controle comercial visível somente para a administração da Pedevia.</div></div>${statusBadgeV131(r)}</div>
        <div class="two"><div><label>Valor da mensalidade (R$)</label><input id="cseFeeV1311" type="number" min="0" step="0.01" class="field" value="${escapeAttrV120(r.monthly_fee??'')}" placeholder="Ex.: 49.90"></div><div><label>Vencimento da mensalidade</label><input id="cseDueV131" type="date" class="field" value="${escapeAttrV120(r.billing_due_date?String(r.billing_due_date).slice(0,10):'')}"></div></div>
        <label>Observação interna / motivo da suspensão</label><textarea id="cseReasonV131" class="field" rows="3" placeholder="Ex.: mensalidade de setembro pendente">${esc(r.suspension_reason||'')}</textarea>
        <div class="miniBtns" style="margin-top:10px;display:flex;gap:7px;flex-wrap:wrap">
          ${status!=='active'?`<button class="btn" onclick="setClientServiceStatusV131('${r.id}','active')">🟢 Reativar estabelecimento</button>`:''}
          ${status!=='suspended'?`<button class="ghost" onclick="setClientServiceStatusV131('${r.id}','suspended')">🟡 Suspender</button>`:''}
          ${status!=='cancelled'?`<button class="dangerBtn" onclick="setClientServiceStatusV131('${r.id}','cancelled')">🔴 Cancelar serviço</button>`:''}
        </div>
        <div class="hint" style="margin-top:8px">Suspender ou cancelar não apaga produtos, pedidos, clientes, estatísticas nem configurações. Reativar restaura a loja.</div>
      </div>
      <label>Nome</label><input id="cseNameV120" class="field" value="${escapeAttrV120(r.name)}">
      <label>Slug</label><input id="cseSlugV120" class="field" value="${escapeAttrV120(r.slug)}">
      <label>WhatsApp</label><input id="cseWaV120" class="field" value="${escapeAttrV120(r.whatsapp||'')}">
      <label>Administrador</label><input id="cseEmailV120" type="email" class="field" value="${escapeAttrV120(r.admin_email||'')}">
      <div class="panel" style="margin:14px 0;padding:14px"><b>Logo do estabelecimento</b><div id="clientLogoPreviewV1211"></div><label class="btn" style="display:inline-block;margin-top:10px;cursor:pointer">Enviar logo<input type="file" accept="image/*" style="display:none" onchange="readClientLogoV1211(this)"></label></div>
      <div class="panel" style="margin:14px 0;padding:14px"><b>Texto inicial do site</b><label>Título</label><input id="cseHeroTitleV1211" class="field" value="${escapeAttrV120(heroTitle)}"><label>Texto complementar</label><textarea id="cseHeroTextV1211" class="field" rows="3">${esc(heroText)}</textarea></div>
      <button id="cseSaveBtnV120" class="btn full" onclick="saveClientSiteV131('${r.id}')">Salvar alterações</button>
      <button class="ghost full" style="margin-top:8px" onclick="resendClientInviteV122('${r.id}')">Reenviar convite de acesso</button>
      <button class="dangerBtn full" style="margin-top:8px" onclick="deleteClientSiteV120('${r.id}')">Excluir definitivamente esta loja</button>`);
    setTimeout(()=>{try{renderClientLogoPreviewV1211()}catch(e){}},0);
  };

  window.saveClientSiteV131=async function(id){
    const row=(window.clientSitesV120||[]).find(x=>String(x.id)===String(id));if(!row)return;
    const name=document.getElementById('cseNameV120')?.value.trim(),slug=slugifyStoreV120(document.getElementById('cseSlugV120')?.value),wa=(document.getElementById('cseWaV120')?.value||'').replace(/\D/g,''),email=(document.getElementById('cseEmailV120')?.value||'').trim().toLowerCase();
    if(!name||!slug||!email){alert('Nome, slug e e-mail são obrigatórios.');return}
    const config=JSON.parse(JSON.stringify(row.config||cleanClientConfigV120(name,wa)));config.store=config.store||{};
    config.store.name=name;config.store.whatsapp=wa;config.store.hubSlug=slug;
    if(window.clientLogoDraftV1211!==undefined)config.store.brandImage=window.clientLogoDraftV1211||'';
    config.store.heroTitle=(document.getElementById('cseHeroTitleV1211')?.value||'').trim()||'Texto inicial do site';config.store.heroEmoji='';config.store.heroText=(document.getElementById('cseHeroTextV1211')?.value||'').trim();
    const due=document.getElementById('cseDueV131')?.value||null,feeRaw=document.getElementById('cseFeeV1311')?.value,monthlyFee=feeRaw===''||feeRaw==null?null:Math.max(0,Number(feeRaw)||0),reason=(document.getElementById('cseReasonV131')?.value||'').trim();
    const btn=document.getElementById('cseSaveBtnV120');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
    const {error}=await supabaseClient.from('client_sites').update({name,slug,whatsapp:wa,admin_email:email,billing_due_date:due||null,monthly_fee:monthlyFee,suspension_reason:reason||null,config,updated_at:new Date().toISOString()}).eq('id',id);
    if(error){alert('Erro ao salvar: '+error.message);if(btn){btn.disabled=false;btn.textContent='Salvar alterações'}return}
    closeModal();await openClientSitesMasterV120();
  };

  window.setClientServiceStatusV131=async function(id,next){
    const row=(window.clientSitesV120||[]).find(x=>String(x.id)===String(id));if(!row)return;
    const labels={active:'reativar',suspended:'suspender',cancelled:'cancelar'};
    if(next!=='active'&&!confirm(`Deseja realmente ${labels[next]||'alterar'} “${row.name}”?\n\nNenhum dado da loja será apagado.`))return;
    let reason=(document.getElementById('cseReasonV131')?.value||row.suspension_reason||'').trim();
    if(next==='suspended'&&!reason)reason='Suspensão administrativa';
    const now=new Date().toISOString(),patch={service_status:next,active:next==='active',suspension_reason:next==='active'?null:(reason||null),updated_at:now};
    if(next==='suspended'){patch.suspended_at=now;patch.cancelled_at=null}
    if(next==='cancelled'){patch.cancelled_at=now;patch.suspended_at=null}
    if(next==='active'){patch.suspended_at=null;patch.cancelled_at=null}
    const due=document.getElementById('cseDueV131')?.value;if(due!==undefined)patch.billing_due_date=due||null;
    const {error}=await supabaseClient.from('client_sites').update(patch).eq('id',id);
    if(error){alert('Não foi possível alterar a situação: '+error.message);return}
    closeModal();await openClientSitesMasterV120();
    alert(next==='active'?'Estabelecimento reativado.':next==='suspended'?'Estabelecimento suspenso. O cardápio público foi bloqueado sem apagar os dados.':'Serviço cancelado. Os dados foram preservados para possível reativação.');
  };

  function showServiceUnavailableV131(info){
    const status=String(info?.service_status||'').toLowerCase(),name=info?.name||'Este estabelecimento';
    const title=status==='draft'?'Cardápio em preparação':'Cardápio temporariamente indisponível';
    const text=status==='draft'?'Este estabelecimento ainda está preparando o cardápio na Pedevia.':'Este estabelecimento está temporariamente indisponível na Pedevia.';
    const shop=document.getElementById('shopView');
    if(shop){
      const panel=document.createElement('div');panel.className='panel';Object.assign(panel.style,{maxWidth:'620px',margin:'55px auto',textAlign:'center',padding:'28px'});
      const icon=document.createElement('div');icon.style.fontSize='52px';icon.textContent='🏪';
      const heading=document.createElement('h2');heading.textContent=title;
      const store=document.createElement('p'),strong=document.createElement('b');strong.textContent=name;store.append(strong);
      const message=document.createElement('p');message.className='hint';message.textContent=text;
      panel.append(icon,heading,store,message);shop.replaceChildren(panel);
    }
    document.getElementById('cartBar')?.classList.add('hide');
  }
  async function publicServiceInfoV131(slug){
    try{const {data,error}=await supabaseClient.rpc('get_public_client_site_status',{p_slug:slug});if(error)return null;return Array.isArray(data)?data[0]:data}catch(e){return null}
  }

  // Substitui somente a inicialização pública do tenant: lojas suspensas/canceladas mostram tela neutra.
  const previousInitV131=initializeOnlineStateV13;
  initializeOnlineStateV13=async function(){
    const slug=tenantSlugFromLocationV121();
    if(!slug)return previousInitV131();
    const row=await loadTenantRowV121(slug);
    if(row){applyTenantConfigV121(row);renderShop();updateCart();return true}
    const info=await publicServiceInfoV131(slug);
    if(info?.slug){showServiceUnavailableV131(info);return false}
    showTenantNotFoundV121(slug);return false;
  };

  // Atualiza a versão visível sem interferir nas demais camadas.
  setTimeout(()=>{document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0')})},900);
})();


// ===== v1.31.1: ASSINATURA VISÍVEL PARA O PROPRIETÁRIO =====
(function(){
  function moneyV1311(v){
    const n=Number(v||0);return n>0?n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Não definida';
  }
  function brDateOwnerV1311(v){
    if(!v)return 'Não definido';
    const d=new Date(String(v).slice(0,10)+'T12:00:00');
    return Number.isFinite(d.getTime())?d.toLocaleDateString('pt-BR'):'Não definido';
  }
  function daysUntilV1311(v){
    if(!v)return null;
    const d=new Date(String(v).slice(0,10)+'T23:59:59'),now=new Date();
    if(!Number.isFinite(d.getTime()))return null;
    return Math.ceil((d-now)/86400000);
  }
  function ownerBillingCardV1311(){
    const row=window.pedeviaTenantV121;
    if(!row?.id||!document.getElementById('adminContent'))return;
    const target=document.getElementById('adminContent');
    document.getElementById('ownerBillingV1311')?.remove();
    const status=String(row.service_status||'active').toLowerCase();
    const days=daysUntilV1311(row.billing_due_date);
    let state='🟢 Plano ativo',note='Sua assinatura Pedevia está ativa.';
    if(status==='suspended'){state='🔴 Serviço suspenso';note='Entre em contato com a Pedevia para regularizar e reativar o cardápio.'}
    else if(status==='cancelled'){state='🔴 Serviço cancelado';note='Entre em contato com a Pedevia para consultar a reativação.'}
    else if(status==='draft'){state='⚪ Loja em preparação';note='A ativação comercial desta loja ainda está pendente.'}
    else if(days!==null&&days<0){state='🔴 Mensalidade vencida';note=`O vencimento ocorreu em ${brDateOwnerV1311(row.billing_due_date)}. Regularize para evitar a suspensão do cardápio.`}
    else if(days!==null&&days<=3){state='🟡 Vencimento próximo';note=days===0?'A mensalidade vence hoje.':`A mensalidade vence em ${days} dia${days===1?'':'s'}.`}
    const card=document.createElement('div');card.id='ownerBillingV1311';card.className='panel';card.style.cssText='margin:0 0 14px;padding:14px';
    card.innerHTML=`<div class="row" style="align-items:flex-start"><div><b style="font-size:16px">Assinatura Pedevia</b><div class="hint" style="margin-top:3px">Informações da mensalidade deste estabelecimento</div></div><b>${state}</b></div><div class="two" style="margin-top:10px"><div class="summary"><small>Mensalidade</small><br><b>${moneyV1311(row.monthly_fee)}</b></div><div class="summary"><small>Próximo vencimento</small><br><b>${brDateOwnerV1311(row.billing_due_date)}</b></div></div><div class="hint" style="margin-top:9px">${note}</div>`;
    target.prepend(card);
  }
  window.ownerBillingCardV1311=ownerBillingCardV1311;
  const baseRender=renderAdmin;
  renderAdmin=function(){baseRender();if(window.pedeviaTenantV121)ownerBillingCardV1311()};
  const baseEnter=enterTenantAdminV122;
  enterTenantAdminV122=async function(){const ok=await baseEnter();if(window.pedeviaTenantV121)ownerBillingCardV1311();return ok};
  setTimeout(()=>{document.querySelectorAll('.adminHead .hint').forEach(el=>{if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0')})},1000);
})();

// Inicializa somente depois de todas as camadas de compatibilidade do arquivo terem sido carregadas.
// v1.31.14: inicialização adiada para depois de todas as camadas.
