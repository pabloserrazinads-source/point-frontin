
(function(){
  try{
    var p=location.pathname.split('/').filter(Boolean);
    var first=(p[0]||'').toLowerCase();
    var technical=['','index.html','favicon.ico','robots.txt','manifest.webmanifest','sw.js','pedevia-icon.svg'];
    if(first && technical.indexOf(first)===-1){
      document.documentElement.classList.add('pedeviaTenantBoot');
    }
  }catch(e){}
})();
