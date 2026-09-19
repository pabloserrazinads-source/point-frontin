
// ===== v1.31.15: VERSÃO CENTRALIZADA =====
(function(){
  window.PEDEVIA_VERSION='1.32.52';
  window.PEDEVIA_DATA_VERSION = 'v4';

  function applyPedeviaVersionV13115(){
    const full=`Versão ${window.PEDEVIA_VERSION} · Dados ${window.PEDEVIA_DATA_VERSION}`;

    // Atualiza o cartão principal do painel.
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0){
        const t=(el.textContent||'').trim();
        if(/^Versão\s+1\.\d+(?:\.\d+)*\s*·\s*Dados\s+v\d+$/i.test(t)){
          el.textContent=full;
        }
      }
    });

    // Atualiza qualquer versão curta ainda visível em áreas administrativas.
    document.querySelectorAll('.adminHead .hint, .hero .hint, .panel .hint').forEach(el=>{
      const t=el.textContent||'';
      if(/Versão\s+1\.\d+(?:\.\d+)*/i.test(t)){
        el.textContent=t.replace(/Versão\s+1\.\d+(?:\.\d+)*/i,`Versão ${window.PEDEVIA_VERSION}`);
      }
    });
  }

  window.applyPedeviaVersion = applyPedeviaVersionV13115;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      applyPedeviaVersionV13115();
      setTimeout(applyPedeviaVersionV13115,500);
      setTimeout(applyPedeviaVersionV13115,1500);
    },{once:true});
  }else{
    applyPedeviaVersionV13115();
    setTimeout(applyPedeviaVersionV13115,500);
    setTimeout(applyPedeviaVersionV13115,1500);
  }
})();
