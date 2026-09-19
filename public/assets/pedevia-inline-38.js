
// ===== v1.32.30: FONTE ÚNICA DE VERSÃO =====
(function(){
  const CURRENT_VERSION='1.32.52';
  window.PEDEVIA_VERSION=CURRENT_VERSION;
  window.getPedeviaVersion=function(){return CURRENT_VERSION};
  window.applyPedeviaVersion=function(){
    document.querySelectorAll('.adminHead .hint,.hero .hint,.panel .hint').forEach(el=>{
      const t=el.textContent||'';
      if(/Versão\s+1\.\d+(?:\.\d+)*/i.test(t)){
        el.textContent=t.replace(/Versão\s+1\.\d+(?:\.\d+)*/i,'Versão '+CURRENT_VERSION);
      }
    });
  };
  window.applyPedeviaVersion();
})();
