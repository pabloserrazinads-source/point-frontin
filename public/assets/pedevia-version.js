// Fonte única de versão do Pedevia. Este arquivo deve ser carregado antes dos módulos.
(function(){
  'use strict';
  const CURRENT='1.34.5';
  const parts=v=>String(v||'0').split('.').map(n=>Number(n)||0);
  const compare=(a,b)=>{const x=parts(a),y=parts(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
  let active=CURRENT;

  // Módulos históricos podem informar a própria versão, mas nunca conseguem
  // reduzir a versão central para uma publicação anterior.
  Object.defineProperty(window,'PEDEVIA_VERSION',{
    configurable:false,
    enumerable:true,
    get:()=>active,
    set:value=>{if(compare(value,active)>=0)active=String(value)}
  });
  window.PEDEVIA_CURRENT_VERSION=CURRENT;

  function enforceVersion(){
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      const before=el.textContent||'';
      const after=before.replace(/Versão\s+1\.[0-9.]+/i,'Versão '+active);
      if(after!==before)el.textContent=after;
    });
  }
  function startGuard(){
    enforceVersion();
    new MutationObserver(enforceVersion).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  document.body?startGuard():document.addEventListener('DOMContentLoaded',startGuard,{once:true});
})();
