
// ===== v1.32.30: NAVEGAÇÃO SEM FLASH =====
(function(){
  const CURRENT_VERSION='1.32.48';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  // A navegação administrativa é síncrona. Não há motivo para substituir o
  // conteúdo atual por "Carregando..." antes de desenhar a próxima aba.
  // Mantemos o conteúdo anterior durante o mesmo frame e o novo painel o
  // substitui diretamente, evitando o clarão observado Pedidos -> Ofertas.
  document.documentElement.setAttribute('data-pedevia-admin-paint','stable');

  // Reaplica apenas o texto canônico da versão, sem timers ou reconstrução.
  if(typeof window.applyPedeviaVersion==='function') window.applyPedeviaVersion();
})();
