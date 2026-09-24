// ===== Pedevia v1.32.59: EXCLUSÃO REAL DE QUALQUER PRODUTO =====
(function(){
  window.PEDEVIA_VERSION='1.32.59';

  const editProductBaseV13257=editProduct;
  editProduct=function(id){
    const result=editProductBaseV13257.apply(this,arguments);
    setTimeout(()=>{
      const p=(cfg.products||[]).find(x=>String(x.id)===String(id));
      const footer=document.querySelector('#sheet .stickySave');
      if(!p||!footer)return;

      // Camadas antigas escondiam Excluir quando o nome era "Novo produto".
      // Produto persistido ou rascunho: ambos precisam ter exclusão explícita.
      let del=footer.querySelector('.dangerBtn');
      if(!del){
        del=[...footer.querySelectorAll('button')].find(btn=>
          btn.textContent.trim()==='Cancelar'&&!btn.classList.contains('duplicateProductBtn')
        );
      }
      if(!del){
        del=document.createElement('button');
        footer.insertBefore(del,footer.firstElementChild);
      }

      del.type='button';
      del.className='dangerBtn';
      del.textContent='Excluir';
      del.removeAttribute('data-pedevia-call');
      del.removeAttribute('onclick');
      del.onclick=async()=>{
        if(p._draftNewV132){
          if(!confirm('Excluir este novo produto?'))return;
          cfg.products=cfg.products.filter(x=>String(x.id)!==String(id));
          window._editingProductV132=null;
          window._newProductLockV132=false;
          closeModal();renderAdmin();renderShop();
          return;
        }
        await deleteProductOnline(id);
      };
    },0);
    return result;
  };

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.59');
    });
  },1500);
})();
