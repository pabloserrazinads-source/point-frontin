// ===== Pedevia v1.33.0: EXCLUSÃO DE RASCUNHO + HISTÓRICO ESTÁVEL =====
(function(){
  window.PEDEVIA_VERSION='1.33.0';

  // A montagem dos botões do produto foi consolidada no módulo de produtos.
  // Este arquivo permanece responsável apenas pela estabilidade do histórico.

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
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0');
    });
  },1400);
})();
