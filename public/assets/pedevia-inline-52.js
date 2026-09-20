// ===== v1.32.54: AJUSTE ADMINISTRATIVO DA FIDELIDADE =====
(function(){
  const CURRENT_VERSION='1.32.54';
  window.PEDEVIA_VERSION=CURRENT_VERSION;

  window.editLoyaltyCountV13254=async function(phone,name,current){
    const raw=prompt(
      `Quantidade de pedidos de ${name||'Cliente'} no Clube de Fidelidade:`,
      String(Math.max(0,Number(current||0)))
    );
    if(raw===null)return;
    const normalized=String(raw).trim();
    if(!/^\d+$/.test(normalized)){
      alert('Informe uma quantidade inteira igual ou maior que zero.');
      return;
    }
    const count=Number(normalized);
    if(!Number.isSafeInteger(count)||count>1000000){
      alert('A quantidade informada é inválida.');
      return;
    }
    if(!confirm(`Alterar a fidelidade de ${name||'Cliente'} para ${count} pedido${count===1?'':'s'}?`))return;

    try{
      const {data,error}=await supabaseClient.rpc('set_pedevia_loyalty_count_v13254',{
        p_store_key:currentStoreKeyV127(),
        p_phone:phone,
        p_order_count:count
      });
      if(error)throw error;
      const result=Array.isArray(data)?data[0]||null:data;
      if(!result)throw new Error('O servidor não confirmou a alteração.');
      alert(`Fidelidade atualizada para ${Number(result.order_count??count)} pedido${Number(result.order_count??count)===1?'':'s'}.`);
      await loadLoyaltyCustomersAdminV1314();
    }catch(e){
      console.error('Ajuste administrativo da fidelidade:',e);
      const missing=e?.code==='PGRST202'||/set_pedevia_loyalty_count_v13254|schema cache|not found/i.test(String(e?.message||''));
      alert(missing
        ?'A função de ajuste ainda não foi instalada no Supabase. Execute o arquivo supabase/13254_ajuste_fidelidade.sql e tente novamente.'
        :'Não foi possível alterar a fidelidade: '+String(e?.message||e));
    }
  };

  // Substitui apenas a montagem visual da lista. Clientes com zero pedidos
  // também aparecem, permitindo corrigir ou iniciar manualmente o contador.
  window.renderLoyaltyCustomersAdminV1314=function(rows){
    const host=document.getElementById('loyaltyAdminListV1314');
    if(!host)return;
    const list=rows||[];
    if(!list.length){
      host.innerHTML='<div class="notice">Ainda não há clientes identificados para gerenciar.</div>';
      return;
    }

    host.replaceChildren();
    list.forEach(c=>{
      const s=c.status;
      const width=s.count>0?Math.max(4,Math.min(100,(s.progress/s.required)*100)):0;
      const panel=document.createElement('div');
      panel.className='panel loyaltyAdminCustomerV1314';
      panel.dataset.search=String((c.name+' '+c.phone).toLowerCase());
      Object.assign(panel.style,{padding:'14px',margin:'10px 0'});

      const top=document.createElement('div');top.className='row';top.style.alignItems='flex-start';
      const identity=document.createElement('div');identity.style.minWidth='0';
      const customer=document.createElement('b');customer.style.fontSize='16px';customer.textContent=c.name;
      const phone=document.createElement('div');phone.className='hint';phone.textContent=c.phone;
      identity.append(customer,phone);
      const badge=document.createElement('span');badge.className='badge'+(s.eligible?' available':'');
      if(!s.eligible)Object.assign(badge.style,{background:'#eee',color:'#555'});
      badge.textContent=s.eligible?'PRÊMIO DISPONÍVEL':s.progress+'/'+s.required;
      top.append(identity,badge);

      const progress=document.createElement('div');progress.className='loyaltyProgressBarV115';progress.style.margin='12px 0 6px';
      const fill=document.createElement('span');fill.style.width=width+'%';progress.append(fill);

      const bottom=document.createElement('div');bottom.className='row';
      const details=document.createElement('div');
      const count=document.createElement('b');count.textContent=s.count+' pedido'+(s.count===1?'':'s')+' no clube';
      const hint=document.createElement('div');hint.className='hint';
      hint.textContent=s.eligible?s.reward+'% de desconto disponível no próximo pedido':'Faltam '+s.remaining+' pedido'+(s.remaining===1?'':'s')+' para '+s.reward+'% OFF';
      details.append(count,hint);bottom.append(details);
      if(c.last){
        const last=document.createElement('small');last.className='hint';last.style.textAlign='right';
        const date=new Date(c.last);last.append('Último pedido',document.createElement('br'),Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'-');
        bottom.append(last);
      }

      const actions=document.createElement('div');actions.className='miniBtns';actions.style.marginTop='12px';
      const edit=document.createElement('button');edit.type='button';edit.className='ghost';edit.textContent='Editar quantidade';
      edit.addEventListener('click',()=>window.editLoyaltyCountV13254(c.phone,c.name,s.count));
      actions.append(edit);
      panel.append(top,progress,bottom,actions);host.append(panel);
    });
  };

  if(typeof window.applyPedeviaVersion==='function')window.applyPedeviaVersion();
})();
