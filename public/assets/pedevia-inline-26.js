
// ===== v1.32.4: SESSÃO PERSISTENTE + ATUALIZAÇÃO DE PÁGINA SEM NOVO LOGIN =====
(function(){
  window.PEDEVIA_VERSION='1.32.47';

  let restoringSessionV1324=false;

  async function restoreAdminSessionV1324(){
    if(restoringSessionV1324)return false;
    restoringSessionV1324=true;
    try{
      if(!window.supabaseClient?.auth)return false;

      // O Supabase persiste/renova a sessão no navegador. Ao recarregar a página,
      // reaproveitamos a sessão existente em vez de exigir novo sign-in.
      const {data,error}=await window.supabaseClient.auth.getSession();
      if(error)throw error;
      const session=data?.session;
      if(!session)return false;

      const slug=typeof window.tenantSlugFromLocationV121==='function'
        ? window.tenantSlugFromLocationV121()
        : '';

      // Tenant: valida novamente que o usuário autenticado continua sendo
      // administrador da loja antes de liberar o painel.
      if(slug && typeof window.enterTenantAdminV122==='function'){
        try{
          await window.enterTenantAdminV122();
          return true;
        }catch(e){
          console.warn('Sessão existente não autorizada para este estabelecimento.',e);
          return false;
        }
      }

      // Point / administração principal: mantém a sessão e deixa o fluxo
      // administrativo existente validar o acesso normalmente.
      window.logged=true;
      if(typeof window.renderAdmin==='function' && document.getElementById('admin')){
        try{ window.renderAdmin(); }catch(e){}
      }
      return true;
    }catch(e){
      console.warn('Não foi possível restaurar a sessão administrativa.',e);
      return false;
    }finally{
      restoringSessionV1324=false;
    }
  }

  window.restoreAdminSessionV1324=restoreAdminSessionV1324;

  // Executa em todo reload, inclusive depois de publicar uma nova versão.
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(restoreAdminSessionV1324,0),{once:true});
  }else{
    setTimeout(restoreAdminSessionV1324,0);
  }

  // Mantém o estado sincronizado quando o SDK restaura/renova tokens.
  try{
    window.supabaseClient?.auth?.onAuthStateChange?.((event,session)=>{
      if((event==='INITIAL_SESSION' || event==='SIGNED_IN' || event==='TOKEN_REFRESHED') && session){
        setTimeout(restoreAdminSessionV1324,0);
      }
    });
  }catch(e){}

  window.PEDEVIA_SESSION_REFRESH_FIX_V1324={
    reloadKeepsSession:true,
    tenantAuthorizationStillChecked:true,
    appliesToAllStores:true
  };
})();
