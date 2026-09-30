// ===== Pedevia v1.33.3: ADICIONAIS LEGÍVEIS, HORÁRIO E VERSÃO ESTÁVEL =====
(function(){
  'use strict';
  const VERSION=window.PEDEVIA_CURRENT_VERSION||'1.33.3';

  // O nome do adicional ganha duas linhas e toda a largura do cartão.
  // O valor passa para uma linha própria, abaixo do nome.
  window.groupOptionEditors=function(g){
    return (g.options||[]).map((o,i,a)=>`<div class="optionEdit" data-option-id="${esc(o.id||'')}">
      <div class="pvOptionOrder"><button type="button" class="pvMoveOptionUp" onclick="moveGroupOptionEditor(this,-1)" ${i===0?'disabled':''}>↑ Subir</button><button type="button" class="pvMoveOptionDown" onclick="moveGroupOptionEditor(this,1)" ${i===a.length-1?'disabled':''}>↓ Descer</button></div>
      <label class="v1331OptionLabel">Nome do adicional</label>
      <textarea class="field goName v1331OptionName" rows="2" placeholder="Nome do adicional">${esc(o.name)}</textarea>
      <div class="v1331OptionPriceLine">
        <label><span>Valor adicional</span><input class="field goPrice" type="number" step=".01" value="${o.price||0}" placeholder="R$ 0,00"></label>
        <button class="ghost v1331RemoveOption" type="button" onclick="this.closest('.optionEdit').remove()" aria-label="Remover adicional">×</button>
      </div>
      <input class="field goDesc" value="${esc(o.desc||'')}" placeholder="Descrição (opcional)">
      <label class="pvVisualStyleLabel">Estilo visual<select class="field goVisualStyle">${visualStyleOptions(o.visualStyle||'auto')}</select></label>
      <select class="field goStatus"><option value="available" ${o.status==='available'?'selected':''}>Disponível</option><option value="unavailable" ${o.status==='unavailable'?'selected':''}>Indisponível</option><option value="hidden" ${o.status==='hidden'?'selected':''}>Oculto</option></select>
    </div>`).join('');
  };

  window.addGroupOptionEditor=function(){
    const box=document.getElementById('ggOptions');box?.insertAdjacentHTML('beforeend',`<div class="optionEdit" data-option-id="">
      <div class="pvOptionOrder"><button type="button" class="pvMoveOptionUp" onclick="moveGroupOptionEditor(this,-1)">↑ Subir</button><button type="button" class="pvMoveOptionDown" onclick="moveGroupOptionEditor(this,1)" disabled>↓ Descer</button></div>
      <label class="v1331OptionLabel">Nome do adicional</label>
      <textarea class="field goName v1331OptionName" rows="2" placeholder="Nome do adicional"></textarea>
      <div class="v1331OptionPriceLine">
        <label><span>Valor adicional</span><input class="field goPrice" type="number" step=".01" value="0" placeholder="R$ 0,00"></label>
        <button class="ghost v1331RemoveOption" type="button" onclick="this.closest('.optionEdit').remove()" aria-label="Remover adicional">×</button>
      </div>
      <input class="field goDesc" placeholder="Descrição (opcional)">
      <label class="pvVisualStyleLabel">Estilo visual<select class="field goVisualStyle">${visualStyleOptions('auto')}</select></label>
      <select class="field goStatus"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select>
    </div>`);refreshGroupOptionMoveButtons(box);
  };

  // Quando a loja está fechada, o horário já aparece em "Fechado agora · hoje...".
  // Não o repete na segunda linha. Quando está aberta, mantém "Até ...".
  const nextCloseBaseV1331=window.nextCloseText;
  window.nextCloseText=function(){
    const state=typeof scheduleStateV127==='function'?scheduleStateV127():openState();
    return state.open?nextCloseBaseV1331():'';
  };

  const css=document.createElement('style');
  css.id='pedeviaV1331Css';
  css.textContent=`
    .optionEdit .v1331OptionLabel{display:block;margin:2px 2px 0;font-size:13px;font-weight:750;color:var(--muted)}
    .optionEdit .v1331OptionName{display:block;width:100%;min-height:76px;line-height:1.35;resize:vertical;overflow-wrap:anywhere}
    .optionEdit .v1331OptionPriceLine{display:grid;grid-template-columns:minmax(0,1fr) 52px;gap:9px;align-items:end}
    .optionEdit .v1331OptionPriceLine label span{display:block;margin:2px 2px 0;font-size:13px;font-weight:750;color:var(--muted)}
    .optionEdit .v1331OptionPriceLine .field{margin-bottom:10px}
    .optionEdit .v1331RemoveOption{height:52px;margin-bottom:10px;font-size:22px}
    .pvOptionOrder{display:flex;gap:8px;margin-bottom:9px}.pvOptionOrder button,.pvGroupActions>button{border:1px solid var(--line);background:#fff;color:var(--p);border-radius:12px;padding:8px 11px;font-weight:750}.pvOptionOrder button:disabled,.pvGroupActions>button:disabled{opacity:.35}.pvGroupActions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;min-width:118px}.pvGroupActions .ghost{padding:9px 12px}
    .clientInfoCard small:empty{display:none}
  `;
  document.head.appendChild(css);

  function enforceVersionV1331(){
    window.PEDEVIA_VERSION=VERSION;
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      const current=el.textContent||'',updated=current.replace(/Versão\s+1\.[0-9.]+/i,'Versão '+VERSION);
      if(updated!==current)el.textContent=updated;
    });
  }
  [0,700,1600,3200,5500].forEach(ms=>setTimeout(enforceVersionV1331,ms));
  // Algumas camadas históricas atualizam a tela depois de 5 segundos.
  // Este controlador final impede que elas restaurem uma versão antiga.
  setInterval(enforceVersionV1331,2000);
  new MutationObserver(enforceVersionV1331).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
