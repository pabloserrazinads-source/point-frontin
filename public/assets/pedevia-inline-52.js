// ===== Pedevia v1.32.56: IMAGEM RESILIENTE + CONSOLIDAÇÃO DA FIDELIDADE =====
(function(){
  async function compactImageV13255(dataUrl){
    return await new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const max=720,scale=Math.min(1,max/Math.max(img.width,img.height));
          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(img.width*scale));
          canvas.height=Math.max(1,Math.round(img.height*scale));
          const ctx=canvas.getContext('2d',{alpha:false});
          ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',.72));
        }catch(e){reject(e)}
      };
      img.onerror=()=>reject(new Error('Não foi possível preparar a imagem.'));
      img.src=dataUrl;
    });
  }

  if(window.PedeviaV130&&typeof PedeviaV130.uploadProductImage==='function'){
    const storageUploadV13255=PedeviaV130.uploadProductImage.bind(PedeviaV130);
    PedeviaV130.uploadProductImage=async function(id,dataUrl){
      const compact=await compactImageV13255(dataUrl);
      try{
        return await storageUploadV13255(id,compact);
      }catch(e){
        // Se o Storage estiver indisponível ou rejeitar a chave, a imagem
        // comprimida é persistida no próprio registro do produto.
        console.warn('Storage de imagem indisponível; usando imagem incorporada.',e);
        return compact;
      }
    };
  }

  // O checkout não credita fidelidade. A camada 51 registra o ponto somente
  // depois de o pedido ser confirmado com status completed/Concluído.
  window.PEDEVIA_VERSION='1.32.56';
  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.56');
    });
  },1300);
})();
