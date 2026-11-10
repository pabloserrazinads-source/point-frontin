/* Pedevia v1.35.65 — pausa de pedidos separada do encerramento diário do delivery. */
(function(){
  'use strict';

  const scheduleStateBaseV131 = scheduleStateV127;
  const generalHoursBaseV131 = generalHours;

  function todayKeyV131(){
    return dateKeyV127(nowV127());
  }

  function persistStoreStateV131(message){
    if(typeof persistAdminStateV15 === 'function'){
      return persistAdminStateV15({products:false,notify:false,message}).then(ok=>{
        if(!ok)alert('Não foi possível salvar essa alteração no servidor. Verifique sua conexão e tente novamente.');
        return !!ok;
      }).catch(error=>{
        console.error('Falha ao salvar o funcionamento da loja:',error);
        alert('Não foi possível salvar: '+(error?.message||error));
        return false;
      });
    }
    try{
      save();
      return Promise.resolve(true);
    }catch(error){
      console.error(error);
      alert('Não foi possível salvar: '+(error?.message||error));
      return Promise.resolve(false);
    }
  }

  // Estados independentes, nesta ordem: pausa manual, encerramento do dia,
  // pausa temporária antiga (sem exibir contagem regressiva) e horário normal.
  scheduleStateV127 = function(){
    const store = cfg.store || {};
    const now = nowV127();

    if(store.paused){
      return {open:false,text:'Fechado temporariamente.'};
    }

    if(store.deliveryClosedForDay === dateKeyV127(now)){
      return {open:false,text:'Delivery encerrado por hoje.'};
    }

    const until = store.temporaryPauseUntil ? new Date(store.temporaryPauseUntil) : null;
    if(until && Number.isFinite(until.getTime()) && until > now){
      return {open:false,text:'Fechado temporariamente.'};
    }

    return scheduleStateBaseV131();
  };
  openState = function(){return scheduleStateV127()};
  window.scheduleStateV127 = scheduleStateV127;
  window.openState = openState;

  // O controle do menu Pedidos pausa/retoma somente o recebimento temporário.
  toggleOrdersPaused = async function(){
    const oldPaused = !!cfg.store.paused;
    const oldMessage = cfg.store.pauseMessage;
    const oldTemporaryUntil = cfg.store.temporaryPauseUntil;

    cfg.store.paused = !oldPaused;
    cfg.store.pauseMessage = cfg.store.paused ? 'Fechado temporariamente.' : '';
    // Remove qualquer prazo legado: a pausa passa a depender do botão Retomar.
    cfg.store.temporaryPauseUntil = '';

    const ok = await persistStoreStateV131(cfg.store.paused
      ? 'Recebimento de pedidos pausado.'
      : 'Recebimento de pedidos retomado.');

    if(!ok){
      cfg.store.paused = oldPaused;
      cfg.store.pauseMessage = oldMessage;
      cfg.store.temporaryPauseUntil = oldTemporaryUntil;
      try{save()}catch(_e){}
      return;
    }

    try{adminOrders()}catch(_e){}
    renderShop();
  };
  window.toggleOrdersPaused = toggleOrdersPaused;

  // No menu Horário de Atendimento, o botão encerra somente o dia atual.
  async function toggleDeliveryDayV131(){
    const oldClosedDate = cfg.store.deliveryClosedForDay || '';
    const oldTemporaryUntil = cfg.store.temporaryPauseUntil;
    const today = todayKeyV131();
    const reopening = oldClosedDate === today;

    cfg.store.deliveryClosedForDay = reopening ? '' : today;
    // Evita que uma pausa antiga com prazo volte a prevalecer após reabrir.
    cfg.store.temporaryPauseUntil = '';

    const ok = await persistStoreStateV131(reopening
      ? 'Delivery reaberto.'
      : 'Delivery encerrado por hoje.');

    if(!ok){
      cfg.store.deliveryClosedForDay = oldClosedDate;
      cfg.store.temporaryPauseUntil = oldTemporaryUntil;
      try{save()}catch(_e){}
      return;
    }

    renderShop();
    generalHours();
  }

  window.PedeviaV131 = {
    toggleDeliveryDay: toggleDeliveryDayV131,
    refreshHoursControl: refreshHoursControlV131
  };

  function refreshHoursControlV131(){
    const extra = document.getElementById('v130HoursExtra');
    const closePanel = extra?.children?.[0];
    if(!closePanel)return;

    const closedToday = cfg.store.deliveryClosedForDay === todayKeyV131();
    closePanel.innerHTML = `
      <h3>Fechar agora</h3>
      <p class="hint">Encerre o delivery pelo restante do dia, sem alterar sua programação semanal. A pausa temporária do menu Pedidos continua independente.</p>
      <button class="btn full" type="button" onclick="window.PedeviaV131.toggleDeliveryDay()">${closedToday?'Reabrir delivery':'Encerrar delivery hoje'}</button>
      <p class="hint" style="margin:10px 0 0">${closedToday?'O delivery está encerrado por hoje. Você pode reabrir quando quiser.':'O encerramento vale somente para hoje e será liberado automaticamente no próximo dia.'}</p>`;
  }

  // Mantém o bloco de horário especial existente e troca apenas os antigos
  // botões de 30 min, 1 hora, 3 horas e Reabrir agora.
  generalHours = function(){
    generalHoursBaseV131.apply(this,arguments);
    setTimeout(refreshHoursControlV131,0);
  };
  adminHours = generalHours;
  window.generalHours = generalHours;
  window.adminHours = adminHours;

})();
