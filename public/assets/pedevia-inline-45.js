
(function(){
  const CURRENT_VERSION='1.32.48';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  function cleanPublicBusyResidueV13238(){
    const modal=document.getElementById('modal');
    if(!modal)return;
    modal.querySelectorAll('button').forEach(btn=>{
      // Remove apenas resíduos que versões anteriores possam ter deixado no DOM.
      if(btn.dataset.noAutoBusy==='1')delete btn.dataset.noAutoBusy;
      if(btn.dataset.pedeviaWorking==='1')delete btn.dataset.pedeviaWorking;
      if(btn.dataset.pedeviaBusy==='1')delete btn.dataset.pedeviaBusy;
      btn.removeAttribute('aria-busy');
      btn.classList.remove('v132Busy');
      if(btn.disabled && /Adicionar|Adicionando/i.test(btn.textContent||''))btn.disabled=false;
    });
  }

  // Não substitui addCart. O fluxo público volta a usar a implementação madura
  // já existente (variantes, obrigatórios, quantidades, carrinho e horário).
  if(typeof showModal==='function'){
    const showBaseV13238=showModal;
    showModal=function(){
      const r=showBaseV13238.apply(this,arguments);
      cleanPublicBusyResidueV13238();
      return r;
    };
  }
  cleanPublicBusyResidueV13238();
  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
