
// ===== v1.32.2: CORREÇÃO DE FEEDBACK AO SALVAR PRODUTO =====
(function(){
  window.PEDEVIA_VERSION='1.32.48';

  // O salvamento já podia concluir com sucesso, mas um elemento de feedback
  // podia desaparecer após a re-renderização e uma camada antiga tentava
  // escrever em .textContent de null. Centralizamos o feedback no botão real.
  function productSaveButtonV1322(){
    const candidates=[...document.querySelectorAll('button')];
    return candidates.find(b=>/salvar\s+produto/i.test((b.textContent||'').trim())) || null;
  }

  const baseSaveProductV1322=window.saveProduct;
  if(typeof baseSaveProductV1322==='function'){
    window.saveProduct=async function(id){
      const btn=productSaveButtonV1322();
      const old=btn?.textContent || 'Salvar produto';

      if(btn){
        btn.disabled=true;
        btn.dataset.pedeviaWorking='1';
        btn.dataset.pedeviaOriginal=old;
        btn.setAttribute('aria-busy','true');
        btn.textContent='Salvando produto...';
      }

      try{
        return await baseSaveProductV1322(id);
      }catch(err){
        // Não esconder erros reais do save.
        console.error('Erro ao salvar produto:',err);
        throw err;
      }finally{
        // A tela pode ter sido redesenhada durante o save; nunca reutilizar
        // cegamente uma referência DOM que já não esteja conectada.
        const current = (btn && btn.isConnected) ? btn : productSaveButtonV1322();
        if(current){
          current.disabled=false;
          current.textContent=current.dataset.pedeviaOriginal || old;
          current.removeAttribute('aria-busy');
          delete current.dataset.pedeviaWorking;
        }
      }
    };
  }

  // Corrige especificamente o feedback global da v1.32.1:
  // se a ação re-renderizar/remover o botão, o timeout não tenta escrever nele.
  document.addEventListener('click',function(ev){
    const b=ev.target?.closest?.('button');
    if(!b || !/salvar\s+produto/i.test((b.textContent||'')))return;
    // Marca para que o fallback genérico não concorra com o wrapper acima.
    b.dataset.pedeviaProductSave='1';
  },true);

  window.PEDEVIA_PRODUCT_SAVE_FIX_V1322=true;
})();
