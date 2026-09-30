// ===== Pedevia v1.33.0: EXCLUSÃO REAL DE QUALQUER PRODUTO =====
(function(){
  window.PEDEVIA_VERSION='1.33.0';

  // A exclusão de produtos agora é montada uma única vez pelo módulo
  // consolidado de produtos, evitando dois botões Excluir no mesmo rodapé.

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.33.0');
    });
  },1500);
})();
