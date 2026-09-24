
// ===== v1.31.12: LOGIN UNIFICADO POINT + CLIENTES =====
(function(){

  function authErrorTextV13112(error){
    const raw=String(error?.message||error||'').toLowerCase();

    if(raw.includes('invalid login credentials') || raw.includes('invalid credentials'))
      return 'E-mail ou senha não conferem. Você pode usar “Redefinir senha” abaixo.';
    if(raw.includes('email not confirmed'))
      return 'Este e-mail ainda não foi confirmado. Confira a caixa de entrada.';
    if(raw.includes('too many requests') || raw.includes('rate limit'))
      return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
    if(raw.includes('network') || raw.includes('fetch'))
      return 'Não foi possível conectar ao servidor. Confira sua internet e tente novamente.';
    if(raw.includes('acesso administrativo'))
      return String(error.message||error);

    return 'Não foi possível entrar. Tente novamente ou redefina sua senha.';
  }

  window.toggleLoginPasswordV13112=function(){
    const input=document.getElementById('loginPass');
    const btn=document.getElementById('toggleLoginPassV13112');
    if(!input)return;

    const showing=input.type==='text';
    input.type=showing?'password':'text';
    if(btn)btn.textContent=showing?'👁 Mostrar senha':'🙈 Ocultar senha';
  };

  window.resetAdminPasswordV13112=async function(){
    const email=String(document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
    const msg=document.getElementById('loginMsg');
    const btn=document.getElementById('resetAdminPassV13112');

    if(!email){
      if(msg)msg.textContent='Digite o e-mail do administrador primeiro.';
      document.getElementById('loginEmail')?.focus();
      return;
    }

    if(btn){
      btn.disabled=true;
      btn.textContent='Enviando...';
    }
    if(msg)msg.textContent='';

    try{
      const slug=tenantSlugFromLocationV121();
      const redirect=slug
        ? `${PEDEVIA_PUBLIC_BASE}/${encodeURIComponent(slug)}?definir-senha=1`
        : `${PEDEVIA_PUBLIC_BASE}/?definir-senha=1`;

      const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{
        redirectTo:redirect
      });
      if(error)throw error;

      if(msg){
        msg.textContent='Link enviado. Abra o e-mail da Pedevia para criar uma nova senha. Confira também o spam.';
        msg.style.color='var(--ok,#198b57)';
      }
    }catch(e){
      console.error('Falha ao enviar redefinição de senha:',e);
      if(msg){
        msg.textContent=authErrorTextV13112(e);
        msg.style.color='';
      }
    }finally{
      if(btn){
        btn.disabled=false;
        btn.textContent='Redefinir senha';
      }
    }
  };

  // Um único fluxo de login para o Point e para TODOS os estabelecimentos.
  login=async function(){
    const email=String(document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
    const password=document.getElementById('loginPass')?.value||'';
    const msg=document.getElementById('loginMsg');
    const btn=document.getElementById('loginBtn');
    const slug=tenantSlugFromLocationV121();

    if(!email||!password){
      if(msg){
        msg.textContent='Digite e-mail e senha.';
        msg.style.color='';
      }
      return;
    }

    if(btn){
      btn.disabled=true;
      btn.textContent='Entrando...';
    }
    if(msg){
      msg.textContent='';
      msg.style.color='';
    }

    try{
      const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error)throw error;
      if(!data?.session)throw new Error('Sessão não iniciada.');

      logged=true;

      if(slug){
        // Loja de cliente: valida que o usuário autenticado pertence àquele estabelecimento.
        await enterTenantAdminV122();
      }else{
        // Point / Admin principal.
        document.getElementById('loginBox')?.classList.add('hide');
        document.getElementById('adminPanel')?.classList.remove('hide');
        await ensureSiteConfigInitialized();
        renderAdmin();
      }

      if(msg)msg.textContent='';

    }catch(e){
      console.error('Falha no login Supabase:',e);

      // Se o Supabase autenticou mas a pessoa não tem acesso àquela loja,
      // encerra a sessão. Para credencial inválida não existe sessão a encerrar.
      try{
        const {data:s}=await supabaseClient.auth.getSession();
        if(s?.session && slug)await supabaseClient.auth.signOut();
      }catch(_e){}

      logged=false;

      if(msg){
        msg.textContent=authErrorTextV13112(e);
        msg.style.color='';
      }
    }finally{
      if(btn){
        btn.disabled=false;
        btn.textContent='Entrar';
      }
    }
  };

  function ensureUnifiedLoginControlsV13112(){
    const box=document.getElementById('loginBox');
    const pass=document.getElementById('loginPass');
    const loginBtn=document.getElementById('loginBtn');
    if(!box||!pass||!loginBtn)return;

    // Remove o botão antigo exclusivo dos tenants, se existir.
    document.getElementById('tenantResetPassV1317')?.remove();

    if(!document.getElementById('toggleLoginPassV13112')){
      const toggle=document.createElement('button');
      toggle.id='toggleLoginPassV13112';
      toggle.type='button';
      toggle.className='ghost full';
      toggle.style.marginTop='8px';
      toggle.textContent='👁 Mostrar senha';
      toggle.onclick=toggleLoginPasswordV13112;
      pass.insertAdjacentElement('afterend',toggle);
    }

    if(!document.getElementById('resetAdminPassV13112')){
      const reset=document.createElement('button');
      reset.id='resetAdminPassV13112';
      reset.type='button';
      reset.className='ghost full';
      reset.style.marginTop='8px';
      reset.textContent='Redefinir senha';
      reset.onclick=resetAdminPasswordV13112;
      loginBtn.insertAdjacentElement('afterend',reset);
    }

    // Enter no campo de senha também entra.
    if(!pass.dataset.enterBoundV13112){
      pass.dataset.enterBoundV13112='1';
      pass.addEventListener('keydown',ev=>{
        if(ev.key==='Enter'){
          ev.preventDefault();
          login();
        }
      });
    }
  }

  // Também coloca mostrar/ocultar senha nas telas de criação/redefinição.
  function enhancePasswordModalV13112(){
    [
      ['newPassV122','toggleNewPass1V13112'],
      ['newPass2V122','toggleNewPass2V13112']
    ].forEach(([inputId,btnId])=>{
      const input=document.getElementById(inputId);
      if(!input || document.getElementById(btnId))return;

      const b=document.createElement('button');
      b.id=btnId;
      b.type='button';
      b.className='ghost full';
      b.style.margin='6px 0 8px';
      b.textContent='👁 Mostrar senha';
      b.onclick=()=>{
        const showing=input.type==='text';
        input.type=showing?'password':'text';
        b.textContent=showing?'👁 Mostrar senha':'🙈 Ocultar senha';
      };
      input.insertAdjacentElement('afterend',b);
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    ensureUnifiedLoginControlsV13112();
    setTimeout(ensureUnifiedLoginControlsV13112,500);
  });

  // Modal de redefinição é criado dinamicamente.
  const authUiObserverV13112=new MutationObserver(()=>{
    ensureUnifiedLoginControlsV13112();
    enhancePasswordModalV13112();
  });
  document.addEventListener('DOMContentLoaded',()=>{
    authUiObserverV13112.observe(document.body,{childList:true,subtree:true});
  });

  setTimeout(()=>{
    document.querySelectorAll('.adminHead .hint').forEach(el=>{
      if(/Versão\s+1\.[0-9.]+/i.test(el.textContent||'')){
        el.textContent=(el.textContent||'').replace(/Versão\s+1\.[0-9.]+/i,'Versão 1.32.57');
      }
    });
  },1200);

})();
