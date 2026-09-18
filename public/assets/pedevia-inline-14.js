
// ===== v1.31.7: BOOT LIMPO DO TENANT + RECUPERAÇÃO DE ACESSO =====
(function(){

  function releaseTenantBootV1317(){
    document.documentElement.classList.remove('pedeviaTenantBoot');
  }
  window.releaseTenantBootV1317=releaseTenantBootV1317;

  // Garante que o nome/configuração corretos já estejam aplicados
  // antes de o cliente enxergar a página.
  const _initializeOnlineStateV1317Base=initializeOnlineStateV13;
  initializeOnlineStateV13=async function(){
    const slug=tenantSlugFromLocationV121();
    if(!slug){
      releaseTenantBootV1317();
      return _initializeOnlineStateV1317Base();
    }

    try{
      const result=await _initializeOnlineStateV1317Base();

      // O render final da loja já aconteceu neste ponto.
      requestAnimationFrame(()=>requestAnimationFrame(releaseTenantBootV1317));
      return result;
    }catch(e){
      console.error('Falha ao inicializar estabelecimento:',e);
      releaseTenantBootV1317();
      throw e;
    }
  };

  // Segurança extra: nunca deixar a página invisível indefinidamente
  // em caso de conexão lenta ou erro inesperado.
  setTimeout(releaseTenantBootV1317,10000);

  // Envia um link oficial do Supabase para o administrador criar/redefinir a senha.
  window.resetTenantPasswordV1317=async function(){
    const email=String(document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
    const msg=document.getElementById('loginMsg');
    const btn=document.getElementById('tenantResetPassV1317');

    if(!email){
      if(msg)msg.textContent='Digite o e-mail do administrador primeiro.';
      return;
    }

    if(btn){
      btn.disabled=true;
      btn.textContent='Enviando...';
    }
    if(msg)msg.textContent='';

    try{
      const slug=tenantSlugFromLocationV121();
      const redirect=`${PEDEVIA_PUBLIC_BASE}/${encodeURIComponent(slug)}?definir-senha=1`;

      const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{
        redirectTo:redirect
      });
      if(error)throw error;

      if(msg)msg.textContent='Enviamos um link para criar/redefinir sua senha. Confira também o spam.';
    }catch(e){
      console.error('Erro ao enviar redefinição:',e);
      if(msg)msg.textContent='Não foi possível enviar o link de acesso agora. Tente novamente.';
    }finally{
      if(btn){
        btn.disabled=false;
        btn.textContent='Criar / redefinir senha';
      }
    }
  };

  // Melhora o login do tenant: mantém a validação de acesso, mas mostra
  // uma saída prática quando a senha não confere.
  const _loginTenantV1317Base=login;
  login=async function(){
    if(!tenantSlugFromLocationV121())return _loginTenantV1317Base();

    const email=String(document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
    const password=document.getElementById('loginPass')?.value||'';
    const msg=document.getElementById('loginMsg');
    const btn=document.getElementById('loginBtn');

    if(!email||!password){
      if(msg)msg.textContent='Digite e-mail e senha.';
      return;
    }

    if(btn){btn.disabled=true;btn.textContent='Entrando...'}
    if(msg)msg.textContent='';

    try{
      const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error)throw error;
      if(!data?.session)throw new Error('Sessão não iniciada.');

      await enterTenantAdminV122();

    }catch(e){
      console.error('Falha no login da loja:',e);
      try{await supabaseClient.auth.signOut()}catch(_e){}
      logged=false;

      const raw=String(e?.message||'').toLowerCase();
      if(raw.includes('invalid login credentials') || raw.includes('invalid credentials')){
        if(msg)msg.textContent='E-mail ou senha não conferem. Se este for o primeiro acesso, use “Criar / redefinir senha”.';
      }else if(raw.includes('acesso administrativo')){
        if(msg)msg.textContent=e.message;
      }else{
        if(msg)msg.textContent='Não foi possível entrar. Você pode criar/redefinir a senha pelo botão abaixo.';
      }
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Entrar'}
    }
  };

  // Acrescenta o botão de recuperação na tela de login sem alterar o restante do layout.
  function ensureTenantResetButtonV1317(){
    if(!tenantSlugFromLocationV121())return;
    const box=document.getElementById('loginBox');
    if(!box || document.getElementById('tenantResetPassV1317'))return;

    const loginBtn=document.getElementById('loginBtn');
    if(!loginBtn)return;

    const reset=document.createElement('button');
    reset.id='tenantResetPassV1317';
    reset.type='button';
    reset.className='ghost full';
    reset.style.marginTop='8px';
    reset.textContent='Criar / redefinir senha';
    reset.onclick=resetTenantPasswordV1317;

    loginBtn.insertAdjacentElement('afterend',reset);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    ensureTenantResetButtonV1317();
    setTimeout(ensureTenantResetButtonV1317,700);
  });

  // Depois que a configuração do tenant for aplicada, libera a renderização.
  const _applyTenantConfigV1317Base=applyTenantConfigV121;
  applyTenantConfigV121=function(row){
    const r=_applyTenantConfigV1317Base(row);
    try{
      const name=String(row?.name||cfg?.store?.name||'Estabelecimento').trim();
      document.title=`${name} · Pedevia`;
    }catch(e){}
    return r;
  };

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.50');
      }
    });
  },1200);

})();
