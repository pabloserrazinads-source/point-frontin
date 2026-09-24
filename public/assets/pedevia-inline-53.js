// ===== Pedevia v1.32.59: EXCLUSÃO DE RASCUNHO + HISTÓRICO ESTÁVEL =====
(function(){
  window.PEDEVIA_VERSION='1.32.59';

  // Um produto novo ainda é um rascunho local. Mesmo assim, a ação esperada
  // pelo administrador é Excluir, e não um Cancelar ambíguo.
  const editProductBaseV13256=editProduct;
  editProduct=function(id){
    const result=editProductBaseV13256.apply(this,arguments);
    setTimeout(()=>{
      const p=(cfg.products||[]).find(x=>String(x.id)===String(id));
      if(!p?._draftNewV132)return;
      const footer=document.querySelector('#sheet .stickySave');
      if(!footer)return;
      const cancel=[...footer.querySelectorAll('button.ghost')]
        .find(btn=>!btn.classList.contains('duplicateProductBtn'));
      if(!cancel)return;
      cancel.textContent='Excluir';
      cancel.classList.remove('ghost');
      cancel.classList.add('dangerBtn');
      cancel.removeAttribute('data-pedevia-call');
      cancel.onclick=()=>{
        if(!confirm('Excluir este novo produto?'))return;
        cfg.products=cfg.products.filter(x=>String(x.id)!==String(id));
        window._editingProductV132=null;
        window._newProductLockV132=false;
        closeModal();
        renderAdmin();
        renderShop();
      };
    },0);
    return result;
  };

  // Depois que o Histórico foi carregado, os timers/realtime não devem
  // reconstruir a lista inteira: isso fazia a tela piscar e voltar ao topo.
  let forceHistoryReloadV13256=false;
  const loadOrdersBaseV13256=loadOrdersPanelV126;
  loadOrdersPanelV126=async function(){
    const host=document.getElementById('ordersListV125');
    const historyVisible=adminOrdersView==='history'||ordersTabV126==='history';
    if(historyVisible&&host?.dataset.pedeviaHistoryLoaded==='1'&&!forceHistoryReloadV13256){
      return window.pedeviaOrdersV125||[];
    }
    const result=await loadOrdersBaseV13256.apply(this,arguments);
    const current=document.getElementById('ordersListV125');
    if(historyVisible&&current)current.dataset.pedeviaHistoryLoaded='1';
    return result;
  };
  loadOrdersPanelV125=loadOrdersPanelV126;

  if(typeof deleteOrderV126==='function'){
    const deleteOrderBaseV13256=deleteOrderV126;
    deleteOrderV126=async function(){
      forceHistoryReloadV13256=true;
      try{return await deleteOrderBaseV13256.apply(this,arguments)}
      finally{forceHistoryReloadV13256=false}
    };
  }

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.59');
    });
  },1400);
})();
