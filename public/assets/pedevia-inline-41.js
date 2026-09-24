
// ===== v1.32.30: SINCRONIZAÇÃO COMERCIAL DO PROPRIETÁRIO =====
(function(){
  const CURRENT_VERSION='1.32.56';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  async function refreshTenantCommercialV13229(){
    const row=window.pedeviaTenantV121;
    const slug=(row?.slug || (typeof tenantSlugFromLocationV121==='function'?tenantSlugFromLocationV121():''));
    if(!slug || !window.supabaseClient) return row||null;
    try{
      const {data:auth}=await supabaseClient.auth.getSession();
      if(!auth?.session) return row||null;
      const {data,error}=await supabaseClient.from('client_sites')
        .select('id,name,slug,whatsapp,active,admin_email,service_status,billing_due_date,monthly_fee,suspension_reason,suspended_at,cancelled_at')
        .eq('slug',slug).maybeSingle();
      if(error){console.warn('Pedevia: não foi possível atualizar dados da assinatura.',error);return row||null}
      if(!data) return row||null;
      // Mantém config já carregada pela RPC pública e injeta somente os campos comerciais autorizados.
      window.pedeviaTenantV121=Object.assign({},row||{},data,{config:row?.config||{}});
      return window.pedeviaTenantV121;
    }catch(err){
      console.warn('Pedevia: falha ao sincronizar assinatura.',err);
      return row||null;
    }
  }
  window.refreshTenantCommercialV13229=refreshTenantCommercialV13229;

  // O cartão antigo era montado com a linha da RPC pública, que propositalmente não
  // expõe mensalidade/vencimento. Para o proprietário autenticado, buscamos a linha
  // completa permitida pelo RLS e só então redesenhamos o cartão.
  const ownerBillingBaseV13229=window.ownerBillingCardV1311;
  if(typeof ownerBillingBaseV13229==='function'){
    window.ownerBillingCardV1311=function(){
      ownerBillingBaseV13229();
      refreshTenantCommercialV13229().then(()=>{
        if(document.getElementById('adminContent')) ownerBillingBaseV13229();
      });
    };
  }

  // Também sincroniza imediatamente após a entrada autenticada no painel.
  if(typeof enterTenantAdminV122==='function'){
    const enterBaseV13229=enterTenantAdminV122;
    enterTenantAdminV122=async function(){
      const ok=await enterBaseV13229.apply(this,arguments);
      if(ok!==false){
        await refreshTenantCommercialV13229();
        if(typeof ownerBillingBaseV13229==='function' && document.getElementById('adminContent')) ownerBillingBaseV13229();
      }
      return ok;
    };
  }

  if(typeof window.applyPedeviaVersion==='function') window.applyPedeviaVersion();
})();
