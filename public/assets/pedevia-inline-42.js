
// ===== v1.32.30: DADOS COMERCIAIS AUTENTICADOS + MENU MESTRE ESTÁVEL =====
(function(){
  const CURRENT_VERSION='1.32.56';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  // A linha administrativa do tenant precisa trazer também os campos comerciais.
  // A versão anterior buscava estes campos depois do render; agora eles já chegam
  // junto com config no login/restore da sessão, eliminando a corrida do cartão.
  window.loadTenantAdminRowV13230=async function(slug){
    const {data,error}=await supabaseClient.from('client_sites')
      .select('id,name,slug,whatsapp,active,config,admin_email,service_status,billing_due_date,monthly_fee,suspension_reason,suspended_at,cancelled_at')
      .eq('slug',slug).maybeSingle();
    if(error) throw error;
    return data||null;
  };
  loadTenantAdminRowV122=window.loadTenantAdminRowV13230;

  // Se já existe uma sessão restaurada, atualiza a linha atual imediatamente.
  async function syncTenantCommercialV13230(){
    const slug=typeof currentTenantSlugV122==='function'?currentTenantSlugV122():(window.pedeviaTenantV121?.slug||'');
    if(!slug) return null;
    try{
      const {data:sd}=await supabaseClient.auth.getSession();
      if(!sd?.session) return null;
      const row=await window.loadTenantAdminRowV13230(slug);
      if(!row) return null;
      const old=window.pedeviaTenantV121||{};
      // Não reprocessa o cardápio nem troca cfg: apenas atualiza metadados da linha.
      window.pedeviaTenantV121=Object.assign({},old,row,{config:row.config||old.config||{}});
      if(typeof window.ownerBillingCardV1311==='function' && document.getElementById('adminContent')){
        window.ownerBillingCardV1311();
      }
      return row;
    }catch(e){console.warn('Pedevia: falha ao sincronizar dados comerciais v1.32.30',e);return null}
  }
  window.syncTenantCommercialV13230=syncTenantCommercialV13230;

  // O acesso "Sites dos clientes" depende da sessão + RPC de plataforma. Antes a
  // checagem podia ocorrer enquanto o Supabase ainda restaurava a sessão e o cartão
  // sumia até um refresh. Agora esperamos a sessão e rechecamos após eventos de auth.
  let masterStateV13230=null; // null=desconhecido, true/false=confirmado
  let masterPromiseV13230=null;
  async function platformAdminStableV13230(force){
    if(masterStateV13230===true && !force) return true;
    if(masterPromiseV13230 && !force) return masterPromiseV13230;
    masterPromiseV13230=(async()=>{
      for(let i=0;i<4;i++){
        try{
          const {data:sd}=await supabaseClient.auth.getSession();
          if(!sd?.session){await new Promise(r=>setTimeout(r,120*(i+1)));continue}
          const {data,error}=await supabaseClient.rpc('is_platform_admin');
          if(error) throw error;
          masterStateV13230=(data===true);
          return masterStateV13230;
        }catch(e){
          if(i===3) console.warn('Pedevia: validação do Painel Mestre falhou.',e);
          await new Promise(r=>setTimeout(r,120*(i+1)));
        }
      }
      // Falha de rede não é tratada como "não administrador" permanente.
      return masterStateV13230===true;
    })();
    try{return await masterPromiseV13230}finally{masterPromiseV13230=null}
  }
  window.platformAdminStableV13230=platformAdminStableV13230;

  async function refreshMasterSlotV13230(force){
    const ok=await platformAdminStableV13230(!!force);
    if(!ok)return false;

    const content=document.getElementById('adminContent');
    const list=content?.querySelector('.moreList');
    if(!list)return false;

    let slot=document.getElementById('platformMasterSlotV1201');
    if(!slot){
      slot=document.createElement('div');
      slot.id='platformMasterSlotV1201';
      list.appendChild(slot);
    }
    slot.innerHTML=moreCard('🏪','Sites dos clientes','Cadastrar e administrar estabelecimentos','openClientSitesMasterV120()');
    return true;
  }
  window.loadPlatformMasterCardV1201=function(){return refreshMasterSlotV13230(false)};

  // Mantém a cadeia atual de adminMore, mas garante que a validação estável rode
  // depois que todos os cartões históricos forem montados.
  const adminMoreBaseV13230=adminMore;
  adminMore=function(){
    adminMoreBaseV13230.apply(this,arguments);
    refreshMasterSlotV13230(false);
  };

  try{
    supabaseClient.auth.onAuthStateChange((event,session)=>{
      if(event==='SIGNED_OUT') masterStateV13230=null;
      if(session){
        // TOKEN_REFRESHED / INITIAL_SESSION / SIGNED_IN: revalida sem exigir refresh.
        masterStateV13230=null;
        setTimeout(()=>refreshMasterSlotV13230(true),0);
        setTimeout(()=>syncTenantCommercialV13230(),0);
      }
    });
  }catch(e){console.warn(e)}

  // Cobre sessão que já estava pronta antes deste script final carregar.
  setTimeout(()=>{refreshMasterSlotV13230(false);syncTenantCommercialV13230()},0);
  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();

/* v1.32.56 stable1 — restauração robusta do menu mestre */
(function(){
  let busy=false;
  async function ensureMasterCardStable3(){
    if(busy)return;
    const list=document.querySelector('#adminContent .moreList');
    if(!list)return;
    if(document.getElementById('platformMasterSlotV1201')?.textContent?.includes('Sites dos clientes'))return;
    busy=true;
    try{ await refreshMasterSlotV13230(true); }finally{ busy=false; }
  }
  const obs=new MutationObserver(()=>{setTimeout(ensureMasterCardStable3,0)});
  const start=()=>{
    const c=document.getElementById('adminContent');
    if(c)obs.observe(c,{childList:true,subtree:true});
    setTimeout(ensureMasterCardStable3,50);
    setTimeout(ensureMasterCardStable3,400);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  const old=window.adminMore||adminMore;
  const wrapped=function(){
    const r=old.apply(this,arguments);
    setTimeout(ensureMasterCardStable3,50);
    setTimeout(ensureMasterCardStable3,400);
    return r;
  };
  window.adminMore=wrapped;
  try{adminMore=wrapped}catch(e){}
})();
