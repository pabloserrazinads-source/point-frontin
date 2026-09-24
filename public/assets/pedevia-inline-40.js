
// ===== v1.32.30: DIVULGAÇÃO REAL DA LOJA =====
(function(){
  const V='1.32.55'; window.PEDEVIA_VERSION=V;
  function publicUrl(){
    const custom=String(cfg?.store?.customDomain||'').trim();
    if(custom){return /^https?:\/\//i.test(custom)?custom:'https://'+custom}
    const slug=String(window.pedeviaTenantV121?.slug||tenantSlugFromLocationV121?.()||'').trim();
    return slug?`${PEDEVIA_PUBLIC_BASE}/${encodeURIComponent(slug)}`:PEDEVIA_PUBLIC_BASE;
  }
  window.pedeviaPublicStoreUrlV13228=publicUrl;
  function shareImage(s){return String(s.shareImage||s.brandImage||'').trim()}
  function shareMessage(){const s=cfg.store||{},title=String(s.shareTitle||s.name||'Confira nosso cardápio').trim(),desc=String(s.shareDescription||'Confira nosso cardápio online.').trim();return `${title}\n${desc}\n${publicUrl()}`}
  async function persist(msg){
    if(typeof saveAdminNow==='function')return await saveAdminNow({successMessage:msg});
    if(window.PedeviaV130?.persist)return await PedeviaV130.persist(false,msg);
    save(); return true;
  }
  window.saveSharingV13228=async function(){
    const s=cfg.store||{}; s.shareTitle=String(document.getElementById('gShareTitle')?.value||'').trim()||s.name||'Estabelecimento'; s.shareDescription=String(document.getElementById('gShareDesc')?.value||'').trim();
    const b=document.getElementById('pvSaveShareV13228'),old=b?.textContent;if(b){b.disabled=true;b.textContent='Salvando...'}
    try{const ok=await persist('Compartilhamento salvo online.');if(ok!==false)generalSharing();else if(b){b.disabled=false;b.textContent=old}}catch(e){console.error(e);if(b){b.disabled=false;b.textContent=old}alert('Não foi possível salvar o compartilhamento.')}
  };
  window.resetSharingV13228=function(){const s=cfg.store||{};const t=document.getElementById('gShareTitle'),d=document.getElementById('gShareDesc');if(t)t.value=s.name||'Estabelecimento';if(d)d.value='Confira nosso cardápio online.';updateSharingPreviewV13228()};
  window.updateSharingPreviewV13228=function(){const t=document.getElementById('gShareTitle')?.value||'',d=document.getElementById('gShareDesc')?.value||'';const a=document.getElementById('pvSharePrevTitleV13228'),b=document.getElementById('pvSharePrevDescV13228');if(a)a.textContent=t;if(b)b.textContent=d};
  window.copyStoreLinkV13228=async function(){await PedeviaV130.copyText(encodeURIComponent(publicUrl()),'Link do cardápio copiado.')};
  window.shareWhatsV13228=function(){window.open('https://wa.me/?text='+encodeURIComponent(shareMessage()),'_blank','noopener')};
  window.shareFacebookV13228=function(){window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(publicUrl()),'_blank','noopener')};
  window.nativeShareV13228=async function(){const s=cfg.store||{},data={title:s.shareTitle||s.name||'Cardápio',text:s.shareDescription||'Confira nosso cardápio online.',url:publicUrl()};try{if(navigator.share)await navigator.share(data);else await copyStoreLinkV13228()}catch(e){if(e?.name!=='AbortError')console.warn(e)}};
  window.generalSharing=function(){
    const s=cfg.store||{},img=shareImage(s),url=publicUrl();
    generalShell('Compartilhamento em Redes Sociais',`<p class="hint">Configure a mensagem e divulgue seu cardápio diretamente. O link usado abaixo é o endereço público real da sua loja.</p>
      <div class="pv-share-preview"><div class="media">${img?`<img src="${esc(img)}" alt="Imagem da loja">`:'<div style="font-size:54px">🔗</div>'}</div><div class="copy"><b id="pvSharePrevTitleV13228">${esc(s.shareTitle||s.name||'Estabelecimento')}</b><small id="pvSharePrevDescV13228">${esc(s.shareDescription||'Confira nosso cardápio online.')}</small></div></div>
      <label>Título da divulgação</label><input id="gShareTitle" class="field" maxlength="80" value="${esc(s.shareTitle||s.name||'')}" data-pedevia-event="input" data-pedevia-call="updateSharingPreviewV13228">
      <label>Descrição / chamada</label><textarea id="gShareDesc" class="field" rows="3" maxlength="180" data-pedevia-event="input" data-pedevia-call="updateSharingPreviewV13228">${esc(s.shareDescription||'')}</textarea>
      <label>Link que será compartilhado</label><div class="pv-urlbox">${esc(url)}</div>
      <div class="pv-share-actions"><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="nativeShareV13228">↗ Compartilhar agora</button><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="shareWhatsV13228">WhatsApp</button><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="shareFacebookV13228">Facebook</button><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="copyStoreLinkV13228">Copiar link</button><button type="button" class="ghost fullrow" data-pedevia-event="click" data-pedevia-call="resetSharingV13228">Restaurar texto padrão</button></div>
      <p class="hint" style="margin-top:12px">A imagem acima usa a identidade visual cadastrada da loja. A miniatura exibida por WhatsApp, Facebook e outras redes também depende da leitura que cada plataforma faz do link público.</p>
      <button id="pvSaveShareV13228" type="button" class="btn full" data-pedevia-event="click" data-pedevia-call="saveSharingV13228">Salvar título e descrição</button>`);
  };
  function qrSettings(){const s=cfg.store||(cfg.store={});return s.qrSettings||(s.qrSettings={size:260,dark:'#211d23',light:'#ffffff'})}
  window.renderQrV13228=async function(){
    const host=document.getElementById('pvQrCanvasV13228');if(!host)return;host.innerHTML='<div class="hint">Gerando QR Code...</div>';
    try{await PedeviaV130.loadQrLib();const q=qrSettings(),size=Math.max(180,Math.min(360,+q.size||260));host.innerHTML='';new QRCode(host,{text:publicUrl(),width:size,height:size,colorDark:q.dark||'#211d23',colorLight:q.light||'#ffffff',correctLevel:QRCode.CorrectLevel.H})}catch(e){console.error(e);host.innerHTML='<div class="hint">Não foi possível gerar o QR Code agora.</div>'}
  };
  window.updateQrV13228=function(){const q=qrSettings();q.size=+document.getElementById('pvQrSizeV13228')?.value||260;q.dark=document.getElementById('pvQrDarkV13228')?.value||'#211d23';q.light=document.getElementById('pvQrLightV13228')?.value||'#ffffff';renderQrV13228()};
  window.saveQrSettingsV13228=async function(){updateQrV13228();const b=document.getElementById('pvSaveQrV13228'),old=b?.textContent;if(b){b.disabled=true;b.textContent='Salvando...'}try{const ok=await persist('Preferências do QR Code salvas.');if(ok!==false)generalQr();else if(b){b.disabled=false;b.textContent=old}}catch(e){console.error(e);if(b){b.disabled=false;b.textContent=old}}};
  window.downloadQrV13228=function(){const host=document.getElementById('pvQrCanvasV13228'),canvas=host?.querySelector('canvas'),img=host?.querySelector('img');let data='';try{data=canvas?.toDataURL('image/png')||img?.src||''}catch(e){}if(!data){alert('Aguarde o QR Code ser gerado.');return}const a=document.createElement('a');a.href=data;a.download=`qr-code-${String(cfg.store?.hubSlug||'cardapio').replace(/[^a-z0-9_-]/gi,'-')}.png`;document.body.appendChild(a);a.click();a.remove()};
  window.printQrV13228=function(){
    const host=document.getElementById('pvQrCanvasV13228'),canvas=host?.querySelector('canvas'),img=host?.querySelector('img');
    let data='';try{data=canvas?.toDataURL('image/png')||img?.src||''}catch(e){}
    if(!/^data:image\/(?:png|jpeg|webp);base64,/i.test(data))return;
    const w=window.open('','_blank','width=520,height=700');
    if(!w){alert('Permita pop-ups para imprimir o QR Code.');return}
    const d=w.document;d.title='QR Code';
    const style=d.createElement('style');style.textContent='body{font-family:Arial;text-align:center;padding:30px}img{width:320px;max-width:90%}h2{margin-bottom:8px}p{word-break:break-all}';
    const title=d.createElement('h2');title.textContent=String(cfg.store?.name||'Cardápio');
    const qr=d.createElement('img');qr.alt='QR Code do cardápio';
    qr.addEventListener('load',()=>{w.focus();w.print()},{once:true});qr.src=data;
    const url=d.createElement('p');url.textContent=String(publicUrl());
    d.head.append(style);d.body.replaceChildren(title,qr,url);
  };
  window.generalQr=function(){
    const q=qrSettings(),url=publicUrl();
    generalShell('QR Code do Cardápio',`<p class="hint">Gere o QR Code real da sua loja para balcão, mesas, embalagens, cartões e redes sociais.</p>
      <div class="pv-qr-wrap"><div id="pvQrCanvasV13228"></div></div><div class="pv-urlbox">${esc(url)}</div>
      <div class="pv-qr-options"><label>Tamanho<select id="pvQrSizeV13228" class="field" data-pedevia-event="change" data-pedevia-call="updateQrV13228"><option value="200">Pequeno</option><option value="260">Médio</option><option value="340">Grande</option></select></label><label>Cor do QR<input id="pvQrDarkV13228" type="color" class="field" value="${esc(q.dark||'#211d23')}" data-pedevia-event="change" data-pedevia-call="updateQrV13228"></label><label>Fundo<input id="pvQrLightV13228" type="color" class="field" value="${esc(q.light||'#ffffff')}" data-pedevia-event="change" data-pedevia-call="updateQrV13228"></label></div>
      <div class="pv-share-actions"><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="downloadQrV13228">⬇ Baixar PNG</button><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="printQrV13228">🖨 Imprimir</button><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="copyStoreLinkV13228">Copiar link</button><button type="button" class="ghost" data-pedevia-event="click" data-pedevia-call="nativeShareV13228">↗ Compartilhar link</button></div>
      <button id="pvSaveQrV13228" type="button" class="btn full" data-pedevia-event="click" data-pedevia-call="saveQrSettingsV13228">Salvar preferências do QR Code</button>`);
    const sel=document.getElementById('pvQrSizeV13228');if(sel)sel.value=String(q.size||260);renderQrV13228();
  };
  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
