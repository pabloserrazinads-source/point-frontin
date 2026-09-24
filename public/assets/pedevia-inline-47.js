
(function(){
  window.PEDEVIA_VERSION='1.32.57';
  if(mode==='shop'){
    const renderCoreV13244=renderShop;
    let rafV13244=0, pendingV13244=false;
    renderShop=function(){
      pendingV13244=true;
      if(rafV13244)return;
      rafV13244=requestAnimationFrame(()=>{
        rafV13244=0;
        if(!pendingV13244)return;
        pendingV13244=false;
        renderCoreV13244();
      });
    };
  }
  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
