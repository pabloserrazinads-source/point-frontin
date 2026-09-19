
(function(){
  window.PEDEVIA_VERSION='1.32.51';

  async function refreshOrdersUiV13245(){
    try{
      if(!(mode==='admin' && logged && adminTab==='orders')) return;
      // A tela moderna usa ordersListV130; histórico usa ordersListV125.
      if(document.getElementById('ordersListV130') && window.PedeviaV130?.loadBoard){
        await PedeviaV130.loadBoard();
        return;
      }
      if(typeof loadOrdersPanelV126==='function') await loadOrdersPanelV126();
    }catch(e){ console.error('Atualização do painel de pedidos:',e); }
  }
  window.refreshOrdersUiV13245=refreshOrdersUiV13245;

  // Realtime antigo escutava apenas INSERT. Agora qualquer alteração feita em
  // outra aba/aparelho (UPDATE/DELETE inclusive) atualiza a tela aberta.
  window.subscribeOrdersAllV13245=function(){
    if(!logged || !supabaseClient?.channel) return;
    try{
      if(window.ordersAllChannelV13245) supabaseClient.removeChannel(window.ordersAllChannelV13245);
    }catch(_e){}
    const key=currentStoreKeyV125();
    window.ordersAllChannelV13245=supabaseClient
      .channel(`orders-all-${key}-${Date.now()}`)
      .on('postgres_changes',{
        event:'*',schema:'public',table:'pedevia_orders',filter:`store_key=eq.${key}`
      },()=>refreshOrdersUiV13245())
      .subscribe();
  };

  // Ações do quadro moderno: depois que o banco confirma, atualiza a mesma
  // interface imediatamente, sem esperar realtime, timer ou refresh manual.
  if(window.PedeviaV130?.setStatus){
    const setStatusBaseV13245=PedeviaV130.setStatus.bind(PedeviaV130);
    PedeviaV130.setStatus=async function(){
      const r=await setStatusBaseV13245(...arguments);
      await refreshOrdersUiV13245();
      return r;
    };
  }

  // Modal "Ver pedido" / Salvar status.
  if(typeof updateOrderStatusV126==='function'){
    const updateBaseV13245=updateOrderStatusV126;
    updateOrderStatusV126=async function(){
      const r=await updateBaseV13245.apply(this,arguments);
      await refreshOrdersUiV13245();
      return r;
    };
    updateOrderStatusV125=updateOrderStatusV126;
  }

  // Excluir pedido.
  if(typeof deleteOrderV126==='function'){
    const deleteBaseV13245=deleteOrderV126;
    deleteOrderV126=async function(){
      const r=await deleteBaseV13245.apply(this,arguments);
      await refreshOrdersUiV13245();
      return r;
    };
  }

  // Encerrar pedidos do dia.
  if(typeof finishTodayOrdersV126==='function'){
    const finishBaseV13245=finishTodayOrdersV126;
    finishTodayOrdersV126=async function(){
      const r=await finishBaseV13245.apply(this,arguments);
      await refreshOrdersUiV13245();
      return r;
    };
  }

  // Reinscreve ao entrar/renderizar o Admin.
  const renderAdminBaseV13245=renderAdmin;
  renderAdmin=function(){
    const r=renderAdminBaseV13245.apply(this,arguments);
    if(logged)setTimeout(window.subscribeOrdersAllV13245,80);
    return r;
  };

  // Backup leve: somente enquanto a aba Pedidos está realmente aberta.
  setInterval(()=>{
    if(mode==='admin'&&logged&&adminTab==='orders'&&
       (document.getElementById('ordersListV130')||document.getElementById('ordersListV125'))){
      refreshOrdersUiV13245();
    }
  },5000);

  if(logged)setTimeout(window.subscribeOrdersAllV13245,120);
  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
