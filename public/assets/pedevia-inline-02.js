
const SUPABASE_URL="https://zquuspetinvqstxstaau.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_VYD88-Zom6oDpADmQ_Cw9g_y2HoKy2H";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const KEY="point_acai_atual_unica";
const DEFAULT={
 store:{name:"Point do Açaí Frontin",whatsapp:"5524998375867",address:"Avenida João Batista Ferrini, 136 - Centro - Engenheiro Paulo de Frontin, RJ",instagram:"@point_frontin",deliveryFee:5,minimumOrder:0,paused:false,pauseMessage:"Estabelecimento temporariamente fechado.",modes:{delivery:true,pickup:true,dinein:true},payments:{pix:true,cash:true,debit:true,credit:true},orderConfig:{deliveryTime:"30–60 min",deliveryArea:"Centro e bairros atendidos",receiptPrinting:false,panelAlerts:true,orderPrefix:"PA",nextOrder:1},hours:{"0":[["14:00","22:00"]],"1":[["14:00","22:00"]],"2":[],"3":[["14:00","22:00"]],"4":[["14:00","22:00"]],"5":[["14:00","22:00"]],"6":[["14:00","22:00"]]}},
 categories:[{id:"acai",name:"Açaí",active:true},{id:"sorvete",name:"Sorvetes",active:true},{id:"especial",name:"Especiais",active:true}],
 groups:[
 {id:"caldas",name:"Caldas",min:0,max:1,options:["Leite condensado","Chocolate","Morango","Caramelo","Maracujá","Pistache","Menta","Maçã Verde"].map((n,i)=>({id:"c"+i,name:n,price:0,status:"available"}))},
 {id:"complementos",name:"Complementos",min:0,max:5,options:["Jujuba","Leite em pó","Amendoim","Paçoca","Granola","Cereal (Sucrilhos)","Chocoboll","Granulado","Aveia","Flocos de arroz"].map((n,i)=>({id:"co"+i,name:n,price:0,status:"available"}))},
 {id:"adicionais",name:"Adicionais",min:0,max:20,options:[
 {id:"a1",name:"Nutella",price:6.5,status:"available"},{id:"a2",name:"Leite Ninho",price:2.5,status:"available"},{id:"a3",name:"Creme de Ninho",price:5,status:"available"},{id:"a4",name:"Creme de avelã",price:5,status:"available"},{id:"a5",name:"Bis",price:3,status:"available"},{id:"a6",name:"Ovomaltine",price:3,status:"available"},{id:"a7",name:"Morango",price:3,status:"available"},{id:"a8",name:"Banana",price:2,status:"available"}]},
 {id:"talher",name:"Colher e canudinho?",min:1,max:1,options:[{id:"t1",name:"Sim, por favor!",price:0,status:"available"},{id:"t2",name:"Não, obrigado!",price:0,status:"available"}]}
 ],
 products:[
 {id:"p1",category:"acai",name:"300 ml",desc:"O açaí individual mais gostoso 😋",price:11,status:"available",image:"",groups:["caldas","complementos","adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}},
 {id:"p2",category:"acai",name:"400 ml",desc:"Esse é para matar a vontade 😋",price:13,status:"available",image:"",groups:["caldas","complementos","adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}},
 {id:"p3",category:"acai",name:"500 ml",desc:"Do tamanho do seu desejo 😍",price:15,status:"available",image:"",groups:["caldas","complementos","adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}},
 {id:"p4",category:"acai",name:"770 ml",desc:"Esse é para dividir com o mozão 💕",price:18,status:"available",image:"",groups:["caldas","complementos","adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}},
 {id:"p5",category:"acai",name:"1 Litro",desc:"Para compartilhar — ou não 😄",price:26,status:"available",image:"",groups:["caldas","complementos","adicionais","talher"],allowedModes:{delivery:true,pickup:true,dinein:true}},
 {id:"s1",category:"sorvete",name:"Ninho Trufado",desc:"Sorvete cremoso sabor Ninho Trufado.",price:11,status:"available",image:"",groups:["adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}},
 {id:"s2",category:"sorvete",name:"Sonho de Valsa",desc:"Sorvete cremoso sabor Sonho de Valsa.",price:11,status:"available",image:"",groups:["adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}},
 {id:"s3",category:"sorvete",name:"Maracujá Trufado",desc:"Sorvete cremoso sabor Maracujá Trufado.",price:11,status:"available",image:"",groups:["adicionais","talher"],allowedModes:{delivery:true,pickup:false,dinein:false}}
 ]
};
let cfg=JSON.parse(localStorage.getItem(KEY)||"null")||JSON.parse(JSON.stringify(DEFAULT)),cart=[],activeCat="acai",mode="shop",adminTab="home",adminSubTab="products",adminOrdersView="main",logged=false;
cfg.store.modes=Object.assign({delivery:true,pickup:true,dinein:true},cfg.store.modes||{});
cfg.store.payments=Object.assign({pix:true,cash:true,debit:true,credit:true},cfg.store.payments||{});
cfg.store.orderConfig=Object.assign({deliveryTime:"30–60 min",deliveryArea:"Centro e bairros atendidos",receiptPrinting:false,panelAlerts:true,orderPrefix:"PA",nextOrder:1},cfg.store.orderConfig||{});
const $=s=>document.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)], brl=n=>"R$ "+Number(n||0).toFixed(2).replace(".",",");
// Versão única: inicia com todos os dados incorporados neste HTML. O armazenamento local serve apenas para alterações feitas nesta própria versão.
(function repairDataModelV101(){
  cfg.store=cfg.store||JSON.parse(JSON.stringify(DEFAULT.store));
  cfg.products=Array.isArray(cfg.products)?cfg.products:JSON.parse(JSON.stringify(DEFAULT.products));
  cfg.groups=Array.isArray(cfg.groups)?cfg.groups:JSON.parse(JSON.stringify(DEFAULT.groups));
  cfg.categories=Array.isArray(cfg.categories)?cfg.categories:JSON.parse(JSON.stringify(DEFAULT.categories));
  const knownNames={acai:'Açaí',sorvete:'Sorvetes',especial:'Especiais'};
  let sections=Array.isArray(cfg.sections)?cfg.sections.filter(Boolean):[];
  if(!sections.length){
    const cats=cfg.categories.length?cfg.categories:DEFAULT.categories;
    sections=cats.map((c,i)=>({id:String(c.id||('sec'+i)),title:c.name||knownNames[c.id]||('Seção '+(i+1)),description:'',display:'expanded-images',accent:i===0?'#a62bb7':i===1?'#6f2388':'#8b5a2b',active:c.active!==false,order:i}));
  }
  // Se houver produtos apontando para categorias que não existem mais, recria a seção automaticamente.
  const ids=new Set(sections.map(x=>String(x.id)));
  cfg.products.forEach((p,i)=>{
    p.id=p.id||('p'+Date.now()+i);
    p.groups=Array.isArray(p.groups)?p.groups:[];
    p.status=p.status||'available';
    if(!p.category){p.category=sections[0]?.id||'acai';}
    if(!ids.has(String(p.category))){
      const old=cfg.categories.find(c=>String(c.id)===String(p.category));
      const id=String(p.category);sections.push({id,title:old?.name||knownNames[id]||id,description:'',display:'expanded-images',accent:'#712489',active:true,order:sections.length});ids.add(id);
    }
  });
  if(!sections.length){sections=DEFAULT.categories.map((c,i)=>({id:c.id,title:c.name,description:'',display:'expanded-images',accent:'#712489',active:true,order:i}));}
  sections.forEach((x,i)=>{x.id=String(x.id||('sec'+i));x.title=x.title||x.name||knownNames[x.id]||('Seção '+(i+1));x.description=x.description||'';x.display=x.display||'expanded-images';x.accent=x.accent||'#712489';x.active=x.active!==false;x.order=i;});
  cfg.sections=sections;
  cfg.categories=sections.map(x=>({id:x.id,name:x.title,active:x.active}));
  if(!cfg.sections.some(x=>x.id===activeCat))activeCat=cfg.sections[0]?.id||'';
  try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn('Reparo carregado, mas não foi possível persistir localmente.',e)}
})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn('Falha ao salvar localmente',e);alert('Não foi possível salvar todos os dados no navegador. Se isso aconteceu ao escolher uma imagem, tente uma foto menor.')}if(typeof renderShop==='function')renderShop()}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function statusLabel(s){return s==="available"?"Disponível":s==="unavailable"?"Indisponível":"Oculto"}
function openState(){if(cfg.store.paused)return{open:false,text:cfg.store.pauseMessage};if(cfg.store.scheduleMode==='always')return{open:true,text:'Aberto agora'};let d=new Date(),r=cfg.store.hours[String(d.getDay())]||[],m=d.getHours()*60+d.getMinutes();for(let x of r){let a=x[0].split(":").map(Number),b=x[1].split(":").map(Number);if(m>=a[0]*60+a[1]&&m<b[0]*60+b[1])return{open:true,text:"Aberto agora"}}return{open:false,text:r.length?"Fechado agora · hoje "+r.map(x=>x.join("–")).join(", "):"Fechado hoje"}}
function todayScheduleText(){let s=cfg.store;if(s.scheduleMode==='always')return 'Aberto 24 horas';let d=new Date(),r=s.hours[String(d.getDay())]||[];return r.length?r.map(x=>x[0]+'–'+x[1]).join(', '):'Fechado hoje'}
function nextCloseText(){let s=cfg.store;if(s.scheduleMode==='always')return 'Atendimento contínuo';let d=new Date(),r=s.hours[String(d.getDay())]||[],m=d.getHours()*60+d.getMinutes();for(let x of r){let a=x[0].split(':').map(Number),b=x[1].split(':').map(Number);if(m>=a[0]*60+a[1]&&m<b[0]*60+b[1])return 'Até às '+x[1]}return todayScheduleText()}
function cleanInstagramHandle(){let v=String(cfg.store.instagram||'').trim();if(v.startsWith('@'))return v.slice(1);let m=String(cfg.store.socialUrl||'').match(/instagram\.com\/([^/?#]+)/i);return m?m[1]:v}
function clientAddressShort(){let a=String(cfg.store.address||'').split('-').map(x=>x.trim());return a.length>1?a.slice(-2).join(' - '):cfg.store.address}
function renderClientStoreInfo(){let s=cfg.store,st=openState(),logo=s.brandImage?`<img src="${esc(s.brandImage)}" alt="Logo ${esc(s.name)}">`:`<div class="fallback" style="font-size:13px;line-height:1.15">LOGO DO<br>ESTABELECIMENTO</div>`;
 $('#clientBrand').innerHTML=`<div class="clientBrand"><div class="clientBrandLogo">${logo}</div><h1>${esc(s.name)}</h1><div class="sub">Engenheiro Paulo de Frontin · RJ</div></div>`;
 let wa=formatWa(s.whatsapp),waUrl='https://wa.me/'+String(s.whatsapp||'').replace(/\D/g,''),insta=s.socialUrl||('https://instagram.com/'+cleanInstagramHandle());
 $('#clientInfoTop').innerHTML=`<div class="clientInfoGrid"><div class="clientInfoCard"><div class="ci">◷</div><div><b class="${st.open?'clientStatusOpen':'clientStatusClosed'}">${esc(st.text)}</b><small>${esc(nextCloseText())}${s.modes.pickup&&s.orderConfig?.pickupTime?' · Retirada: '+esc(s.orderConfig.pickupTime)+' min':''}</small></div><span></span></div><div class="clientInfoCard"><div class="ci">☏</div><div><b>${esc(wa)}</b><small>WhatsApp</small></div><a href="${waUrl}" target="_blank">CONTATO</a></div><div class="clientInfoCard"><div class="ci">⌖</div><div><b>${esc(clientAddressShort()||'Endereço não informado')}</b><small>${esc(s.address||'')}</small></div><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address||'')}" target="_blank">DIREÇÕES</a></div></div>`;
 $('#clientInfoBottom').innerHTML=`<div class="clientDetails"><h3>Informações da loja</h3><div class="detailRow"><div class="di">◷</div><div><b>${st.open?'Aberto agora':'Horário de atendimento'}</b><small>${esc(todayScheduleText())}</small></div></div><div class="detailRow"><div class="di">⌖</div><div><b>Endereço</b><small>${esc(s.address||'Não informado')}</small></div></div><div class="detailRow"><div class="di">☏</div><div><b>Contato</b><small>${esc(wa)}${s.email?' · '+esc(s.email):''}</small></div></div>${(s.instagram||s.socialUrl)?`<div class="detailRow"><div class="di">◎</div><div><b>Redes sociais</b><small>${esc(s.instagram||cleanInstagramHandle())}</small><a class="socialBtn" href="${esc(insta)}" target="_blank">◎ Instagram</a></div></div>`:''}</div>`;
 $('#clientFooter').innerHTML=`<div class="clientFooter"><b>${esc(s.name)}</b><br>Cardápio e pedidos online</div>`;
}
function renderShop(){let st=openState();renderClientStoreInfo();$("#storeStatus").textContent="● "+st.text;$("#closedNotice").innerHTML=st.open?"":'<div class="notice bad">A loja está fechada no momento. Você pode montar o pedido e consultar o cardápio.</div>';
 $("#categoryTabs").innerHTML=cfg.categories.filter(c=>c.active).map(c=>`<button class="tab ${activeCat===c.id?"on":""}" data-pedevia-category="${esc(c.id)}">${c.name}</button>`).join("");
 let ps=cfg.products.filter(p=>p.category===activeCat&&p.status!=="hidden");$("#productGrid").innerHTML=ps.map(p=>`<article class="card" ${p.status==="available"?`data-pedevia-open-product="${p.id}"`:""}><div class="photo" ${p.image?`style="background-image:url('${esc(p.image)}')"`:""}>${p.image?"":"🍧"}</div><div class="cardbody"><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p><div class="row"><span class="price">${brl(p.price)}</span>${p.status==="unavailable"?'<span class="badge unavailable">Indisponível</span>':""}</div></div></article>`).join("")||'<p class="hint">Nenhum produto nesta categoria.</p>';updateCart()}
function openProduct(id){let p=cfg.products.find(x=>x.id===id),h=`<div class="row"><div><h2 style="margin:0">${esc(p.name)}</h2><span class="price">${brl(p.price)}</span></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p>${esc(p.desc)}</p>`;
 p.groups.forEach(gid=>{let g=cfg.groups.find(x=>x.id===gid);if(!g)return;let os=g.options.filter(o=>o.status==="available");if(!os.length)return;h+=`<div class="group choiceGroup" data-gid="${g.id}" data-min="${g.min}" data-max="${g.max}"><div class="groupTitle">${g.name}</div><div class="hint">${g.min?`Escolha no mínimo ${g.min}. `:""}Máximo ${g.max}.</div>${os.map(o=>`<label class="option"><span>${esc(o.name)} ${o.price?`<small>+ ${brl(o.price)}</small>`:""}</span><input type="${g.max===1?"radio":"checkbox"}" name="g_${g.id}" value="${o.id}"></label>`).join("")}</div>`});
 h+=`<label>Observação</label><textarea id="itemObs" class="field" placeholder="Ex.: sem granola"></textarea><div class="row"><div class="qty"><button onclick="qty(-1)">−</button><b id="qty">1</b><button onclick="qty(1)">+</button></div><button class="btn" onclick="addCart('${p.id}')">Adicionar</button></div>`;showModal(h)}
function qty(n){$("#qty").textContent=Math.max(1,+$("#qty").textContent+n)}
function addCart(pid){let p=cfg.products.find(x=>x.id===pid),groups=[],extra=0;for(let box of $$(".choiceGroup")){let g=cfg.groups.find(x=>x.id===box.dataset.gid),sel=$$("input:checked",box),min=+box.dataset.min,max=+box.dataset.max;if(sel.length<min||sel.length>max){alert(`Em "${g.name}", escolha entre ${min} e ${max}.`);return}let items=sel.map(i=>g.options.find(o=>o.id===i.value));items.forEach(o=>extra+=+o.price);if(items.length)groups.push({name:g.name,items:items.map(o=>({name:o.name,price:o.price}))})}cart.push({pid,qty:+$("#qty").textContent,unit:p.price+extra,groups,obs:$("#itemObs").value});closeModal();updateCart()}
function sum(){return cart.reduce((s,i)=>s+i.unit*i.qty,0)}function updateCart(){$("#cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);$("#cartTotal").textContent=brl(sum())}
function showCart(){let sub=sum(),fee=+cfg.store.deliveryFee;let h=`<div class="row"><h2>Carrinho</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>`;if(!cart.length){showModal(h+"<p>Seu carrinho está vazio.</p>");return}
 h+=cart.map((i,n)=>{let p=cfg.products.find(x=>x.id===i.pid);return`<div class="summary"><div class="row"><b>${i.qty}x ${esc(p.name)}</b><b>${brl(i.unit*i.qty)}</b></div>${i.groups.map(g=>`<small><b>${g.name}:</b> ${g.items.map(x=>esc(x.name)).join(", ")}</small>`).join("")}${i.obs?`<small>Obs.: ${esc(i.obs)}</small>`:""}<button class="ghost" style="margin-top:8px" onclick="cart.splice(${n},1);updateCart();showCart()">Remover</button></div>`}).join("");
 h+=`<h3>Finalizar pedido</h3><label>Nome</label><input id="cust" class="field"><label>Tipo</label><select id="orderMode" class="field" data-pedevia-event="change" data-pedevia-call="checkoutTotals">${cfg.store.modes.delivery?'<option value="delivery">Entrega</option>':""}${cfg.store.modes.pickup?'<option value="pickup">Retirada</option>':""}${cfg.store.modes.dinein?'<option value="dinein">Consumo no local</option>':""}</select><div id="addressBox"><label>Endereço, número, bairro e referência</label><input id="addr" class="field"></div><label>Pagamento</label><select id="pay" class="field">${cfg.store.payments.pix?'<option>Pix</option>':""}${cfg.store.payments.cash?'<option>Dinheiro</option>':""}${cfg.store.payments.debit?'<option>Débito</option>':""}${cfg.store.payments.credit?'<option>Crédito</option>':""}</select><label>Observação geral</label><textarea id="orderObs" class="field"></textarea><div class="summary"><div class="row"><span>Subtotal</span><b>${brl(sub)}</b></div><div class="row" id="feeLine"><span>Taxa de entrega</span><b>${brl(fee)}</b></div><div class="row"><h3>Total</h3><h3 id="grand">${brl(sub+fee)}</h3></div></div>${sub<+cfg.store.minimumOrder?`<div class="notice bad">Pedido mínimo: ${brl(cfg.store.minimumOrder)}</div>`:'<button class="btn green full" data-pedevia-event="click" data-pedevia-call="sendOrder">Enviar pedido pelo WhatsApp</button>'}`;showModal(h);checkoutTotals()}
function checkoutTotals(){let m=$("#orderMode");if(!m)return;let del=m.value==="delivery";$("#addressBox").style.display=del?"block":"none";$("#feeLine").style.display=del?"flex":"none";$("#grand").textContent=brl(sum()+(del?+cfg.store.deliveryFee:0))}
function sendOrder(){let del=$("#orderMode").value==="delivery",fee=del?+cfg.store.deliveryFee:0,L=["🍧 *PEDIDO POINT DO AÇAÍ FRONTIN*",""];cart.forEach(i=>{let p=cfg.products.find(x=>x.id===i.pid);L.push(`*${i.qty}x ${p.name}* — ${brl(i.unit*i.qty)}`);i.groups.forEach(g=>L.push(`${g.name}: ${g.items.map(x=>x.name).join(", ")}`));if(i.obs)L.push("Obs.: "+i.obs);L.push("")});L.push("Cliente: "+($("#cust").value||"-"),"Tipo: "+($("#orderMode").value==="delivery"?"Entrega":$("#orderMode").value==="pickup"?"Retirada":"Consumo no local"));if(del)L.push("Endereço: "+($("#addr").value||"-"));L.push("Pagamento: "+$("#pay").value,"Subtotal: "+brl(sum()));if(fee)L.push("Taxa: "+brl(fee));L.push("*TOTAL: "+brl(sum()+fee)+"*");if($("#orderObs").value)L.push("Observação geral: "+$("#orderObs").value);location.href="https://wa.me/"+cfg.store.whatsapp+"?text="+encodeURIComponent(L.join("\n"))}
function switchMode(){mode=mode==="shop"?"admin":"shop";$("#shopView").classList.toggle("hide",mode!=="shop");$("#adminView").classList.toggle("hide",mode!=="admin");$("#cartBar").classList.toggle("hide",mode!=="shop");$("#modeBtn").textContent=mode==="shop"?"⚙️":"🛍️";if(mode==="admin"&&logged)renderAdmin()}
async function login(){
 const email=($("#loginEmail")?.value||"").trim();
 const password=$("#loginPass")?.value||"";
 const msg=$("#loginMsg"),btn=$("#loginBtn");
 if(!email||!password){if(msg)msg.textContent="Digite e-mail e senha.";return}
 if(btn){btn.disabled=true;btn.textContent="Entrando..."}
 if(msg)msg.textContent="";
 try{
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error)throw error;
  logged=!!data.session;
  if(logged){
   $("#loginBox").classList.add("hide");
   $("#adminPanel").classList.remove("hide");
   if(msg)msg.textContent="";
   await ensureSiteConfigInitialized();
   renderAdmin();
  }
 }catch(e){
  console.error("Falha no login Supabase:",e);
  if(msg)msg.textContent="Não foi possível entrar. Confira o e-mail e a senha.";
 }finally{
  if(btn){btn.disabled=false;btn.textContent="Entrar"}
 }
}
async function logoutAdmin(){
 try{await supabaseClient.auth.signOut()}catch(e){console.error(e)}
 logged=false;
 $("#adminPanel")?.classList.add("hide");
 $("#loginBox")?.classList.remove("hide");
 if($("#loginPass"))$("#loginPass").value="";
 if($("#loginMsg"))$("#loginMsg").textContent="Sessão encerrada.";
}
async function restoreAdminSession(){
 try{
  const {data}=await supabaseClient.auth.getSession();
  logged=!!data?.session;
  if(logged){
   $("#loginBox")?.classList.add("hide");
   $("#adminPanel")?.classList.remove("hide");
   await ensureSiteConfigInitialized();
   renderAdmin();
  }else{
   $("#adminPanel")?.classList.add("hide");
   $("#loginBox")?.classList.remove("hide");
  }
 }catch(e){console.error("Falha ao restaurar sessão:",e)}
}
supabaseClient.auth.onAuthStateChange((_event,session)=>{
 logged=!!session;
 if(mode==="admin"){
  $("#loginBox")?.classList.toggle("hide",logged);
  $("#adminPanel")?.classList.toggle("hide",!logged);
  if(logged)renderAdmin();
 }
});
const adminTabs=[["home","⌂","Início"],["menu","▣","Cardápio"],["orders","🧺","Pedidos"],["offers","%","Ofertas"],["more","•••","Mais"]];
function renderAdmin(){
 $("#adminBottomNav").innerHTML=adminTabs.map(([id,ic,n])=>`<button class="${adminTab===id?"on":""}" onclick="adminTab='${id}';renderAdmin()"><span class="navIcon">${ic}</span><span>${n}</span></button>`).join("");
 // v1.32.30: não apaga a tela com placeholder entre abas síncronas; evita flash visual.
 try{
  if(adminTab==="home")adminHome();
  else if(adminTab==="menu")adminMenu();
  else if(adminTab==="orders")adminOrders();
  else if(adminTab==="offers")adminOffers();
  else if(adminTab==="more")adminMore();
 }catch(e){console.error(e);$("#adminContent").innerHTML=`<div class="panel"><h3>Não foi possível abrir esta área</h3><p class="hint">Os dados foram preservados. Toque no botão abaixo para reparar o cardápio e tentar novamente.</p><button class="btn full" onclick="repairSectionsEmergency();renderAdmin();renderShop()">Reparar cardápio</button></div>`}
}
function adminHome(){
 let available=cfg.products.filter(p=>p.status==="available").length, unavailable=cfg.products.filter(p=>p.status!=="available").length;
 $("#adminContent").innerHTML=`<div class="panel"><h3>Início</h3><p class="hint">Visão geral do Point do Açaí.</p><div class="two"><div class="summary"><b>${cfg.products.length}</b><small>Produtos cadastrados</small></div><div class="summary"><b>${available}</b><small>Disponíveis agora</small></div></div>${unavailable?`<div class="notice">${unavailable} item(ns) indisponível(is) ou oculto(s).</div>`:""}</div>`;
}
function adminMenu(){
 $("#adminContent").innerHTML=`<div class="adminSubnav"><button class="${adminSubTab==="products"?"on":""}" onclick="adminSubTab='products';adminMenu()">Produtos</button><button class="${adminSubTab==="stock"?"on":""}" onclick="adminSubTab='stock';adminMenu()">Complementos e estoque</button></div><div id="adminSection"></div>`;
 let target=$("#adminContent"), sub=$("#adminSection");
 if(adminSubTab==="products"){adminProducts(); let rendered=$("#adminContent").innerHTML; $("#adminContent").innerHTML=`<div class="adminSubnav"><button class="on" onclick="adminSubTab='products';adminMenu()">Produtos</button><button onclick="adminSubTab='stock';adminMenu()">Complementos e estoque</button></div>`+rendered;}
 else {adminStock(); let rendered=$("#adminContent").innerHTML; $("#adminContent").innerHTML=`<div class="adminSubnav"><button onclick="adminSubTab='products';adminMenu()">Produtos</button><button class="on" onclick="adminSubTab='stock';adminMenu()">Complementos e estoque</button></div>`+rendered;}
}
function adminOrders(){
 if(adminOrdersView==="config"){adminOrderSettings();return}
 let st=openState(), paused=cfg.store.paused;
 $("#adminContent").innerHTML=`<div class="orderHero"><h2>Pedidos por WhatsApp</h2>
 <div class="orderBox"><h3>Pedidos enviados pelos clientes</h3><p>Chegam no WhatsApp ${formatWa(cfg.store.whatsapp)}</p><button class="ghost" onclick="adminOrdersView='config';adminOrders()">Configurações de pedidos</button></div>
 <div class="orderBox"><h3>Pedidos gerados pelo estabelecimento</h3><p>Balcão, telefone ou anotação manual</p><button class="btn full" data-pedevia-event="click" data-pedevia-call="newManualOrder">Novo pedido</button></div>
 <div class="storeState ${paused?'paused':''}"><div><span class="stateDot"></span><b>${paused?'Recebimento pausado':st.open?'Estabelecimento aberto':'Estabelecimento fechado'}</b><div style="font-size:12px;opacity:.8">${paused?'Pedidos online temporariamente pausados':st.text}</div></div><button data-pedevia-event="click" data-pedevia-call="toggleOrdersPaused">${paused?'Retomar':'Pausar'} ▾</button></div></div>`;
}
function formatWa(n){let d=String(n||'').replace(/\D/g,'').replace(/^55/,'');return d.length===11?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:n}
function toggleOrdersPaused(){cfg.store.paused=!cfg.store.paused;save();adminOrders();renderShop()}
function newManualOrder(){alert('A tela de novo pedido manual será a próxima etapa. O botão já está conectado ao menu de Pedidos.')}
function adminOrderSettings(){let s=cfg.store,o=s.orderConfig;
 $("#adminContent").innerHTML=`<button class="backBtn" onclick="adminOrdersView='main';adminOrders()">‹ Voltar para Pedidos</button><div class="panel"><div class="settingsTitle">Configurações de pedidos</div><div class="settingsList">
 ${settingCard('☏','WhatsApp para atender pedidos:',formatWa(s.whatsapp),'editOrderWhatsapp()')}
 ${settingCard('🚚',`Pedidos para entrega: <span class="enabled">${s.modes.delivery?'Habilitado':'Desabilitado'}</span>`,`Pedido mínimo ${brl(s.minimumOrder)} · taxa ${brl(s.deliveryFee)} · ${esc(o.deliveryTime)}`,'editDeliverySettings()')}
 ${settingCard('🛍',`Pedidos para retirada: <span class="enabled">${s.modes.pickup?'Habilitado':'Desabilitado'}</span>`,'Retirada no estabelecimento','editPickupSettings()')}
 ${settingCard('🍽',`Pedidos para consumo no local: <span class="enabled">${s.modes.dinein?'Habilitado':'Desabilitado'}</span>`,'Pedido feito para consumo no estabelecimento','editDineinSettings()')}
 ${settingCard('＄','Formas de pagamentos',paymentSummary(),'editPaymentSettings()')}
 ${settingCard('▣','Impressão de recibos',o.receiptPrinting?'Ativada':'Desativada','editReceiptSettings()')}
 ${settingCard('🧺','Painel de pedidos',o.panelAlerts?'Alertas de novos pedidos ativados':'Alertas desativados','editPanelSettings()')}
 ${settingCard('•••','Outras configurações',`Prefixo ${esc(o.orderPrefix)} · próximo pedido #${o.nextOrder}`,'editOtherOrderSettings()')}
 </div></div>`;
}
function settingCard(icon,title,sub,action){return `<button class="settingCard" onclick="${action}"><span class="si">${icon}</span><span><b>${title}</b><small>${sub}</small></span><span class="chev">›</span></button>`}
function paymentSummary(){let a=[];if(cfg.store.payments.pix)a.push('Pix');if(cfg.store.payments.cash)a.push('Dinheiro');if(cfg.store.payments.debit)a.push('Débito');if(cfg.store.payments.credit)a.push('Crédito');return a.length?a.join(', '):'Nenhuma forma habilitada'}
function editOrderWhatsapp(){showModal(`<div class="row"><h2>WhatsApp dos pedidos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Número com DDD</label><input id="ocWa" class="field" value="${esc(cfg.store.whatsapp)}" placeholder="5524999999999"><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveOrderWhatsapp">Salvar</button>`)}
function saveOrderWhatsapp(){cfg.store.whatsapp=$("#ocWa").value.replace(/\D/g,'');save();closeModal();adminOrderSettings()}
function editDeliverySettings(){let s=cfg.store,o=s.orderConfig;showModal(`<div class="row"><h2>Pedidos para entrega</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label class="switchrow"><span>Habilitar entrega</span><input id="odEnabled" type="checkbox" ${s.modes.delivery?'checked':''}></label><label>Pedido mínimo</label><input id="odMin" type="number" step=".01" class="field" value="${s.minimumOrder}"><label>Taxa de entrega</label><input id="odFee" type="number" step=".01" class="field" value="${s.deliveryFee}"><label>Tempo estimado</label><input id="odTime" class="field" value="${esc(o.deliveryTime)}"><label>Área de entrega</label><textarea id="odArea" class="field">${esc(o.deliveryArea)}</textarea><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveDeliverySettings">Salvar</button>`)}
function saveDeliverySettings(){let s=cfg.store;s.modes.delivery=$("#odEnabled").checked;s.minimumOrder=+$("#odMin").value;s.deliveryFee=+$("#odFee").value;s.orderConfig.deliveryTime=$("#odTime").value;s.orderConfig.deliveryArea=$("#odArea").value;save();closeModal();adminOrderSettings();renderShop()}
function editPickupSettings(){showModal(`<div class="row"><h2>Pedidos para retirada</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label class="switchrow"><span>Habilitar retirada</span><input id="opEnabled" type="checkbox" ${cfg.store.modes.pickup?'checked':''}></label><p class="hint">Quando habilitado, o cliente poderá selecionar retirada no estabelecimento ao finalizar.</p><button class="btn full" onclick="cfg.store.modes.pickup=$(\'#opEnabled\').checked;save();closeModal();adminOrderSettings();renderShop()">Salvar</button>`)}
function editDineinSettings(){showModal(`<div class="row"><h2>Consumo no local</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label class="switchrow"><span>Habilitar consumo no local</span><input id="oiEnabled" type="checkbox" ${cfg.store.modes.dinein?'checked':''}></label><p class="hint">Quando habilitado, o cliente poderá selecionar consumo no estabelecimento.</p><button class="btn full" onclick="cfg.store.modes.dinein=$(\'#oiEnabled\').checked;save();closeModal();adminOrderSettings();renderShop()">Salvar</button>`)}
function editPaymentSettings(){let p=cfg.store.payments;showModal(`<div class="row"><h2>Formas de pagamento</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>${[['pix','Pix'],['cash','Dinheiro'],['debit','Débito'],['credit','Crédito']].map(([k,n])=>`<label class="switchrow"><span>${n}</span><input id="ordPay_${k}" type="checkbox" ${p[k]?'checked':''}></label>`).join('')}<button class="btn full" data-pedevia-event="click" data-pedevia-call="savePaymentSettings">Salvar</button>`)}
function savePaymentSettings(){['pix','cash','debit','credit'].forEach(k=>cfg.store.payments[k]=$("#ordPay_"+k).checked);save();closeModal();adminOrderSettings();renderShop()}
function editReceiptSettings(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Impressão de recibos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label class="switchrow"><span>Ativar impressão de recibos</span><input id="orReceipt" type="checkbox" ${o.receiptPrinting?'checked':''}></label><p class="hint">Deixamos a configuração preparada. A conexão com uma impressora será feita quando publicarmos o sistema e definirmos o modelo de impressão.</p><button class="btn full" onclick="cfg.store.orderConfig.receiptPrinting=$(\'#orReceipt\').checked;save();closeModal();adminOrderSettings()">Salvar</button>`)}
function editPanelSettings(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Painel de pedidos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label class="switchrow"><span>Alertas de novos pedidos</span><input id="orAlerts" type="checkbox" ${o.panelAlerts?'checked':''}></label><p class="hint">Esta opção será usada no painel online para avisar quando houver pedido novo.</p><button class="btn full" onclick="cfg.store.orderConfig.panelAlerts=$(\'#orAlerts\').checked;save();closeModal();adminOrderSettings()">Salvar</button>`)}
function editOtherOrderSettings(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Outras configurações</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Prefixo dos pedidos</label><input id="orPrefix" class="field" value="${esc(o.orderPrefix)}"><label>Próximo número</label><input id="orNext" type="number" min="1" class="field" value="${o.nextOrder}"><button class="btn full" onclick="cfg.store.orderConfig.orderPrefix=$(\'#orPrefix\').value;cfg.store.orderConfig.nextOrder=Math.max(1,+$(\'#orNext\').value||1);save();closeModal();adminOrderSettings()">Salvar</button>`)}
function adminOffers(){
 $("#adminContent").innerHTML=`<div class="panel adminPlaceholder"><span class="bigIcon">%</span><h3>Ofertas</h3><p>Área reservada para você criar, ativar e desativar promoções que aparecerão para os clientes.</p></div>`;
}
function adminMore(){
 $("#adminContent").innerHTML=`<div class="panel"><h3>Mais</h3><button class="ghost full" data-pedevia-event="click" data-pedevia-call="adminStore">⚙️ Configurações da loja</button><br><br><button class="ghost full" data-pedevia-event="click" data-pedevia-call="adminHours">🕐 Horários de funcionamento</button></div>`;
}
function adminProducts(){$("#adminContent").innerHTML=`<div class="panel"><div class="row"><h3>Produtos</h3><button class="btn" data-pedevia-event="click" data-pedevia-call="newProduct">+ Novo</button></div>${cfg.products.map(p=>`<div class="adminItem"><div><b>${esc(p.name)}</b> · ${brl(p.price)}<br><span class="badge ${p.status}">${statusLabel(p.status)}</span> <span class="hint">${cfg.categories.find(c=>c.id===p.category)?.name||""}</span></div><button class="ghost" onclick="editProduct('${p.id}')">Editar</button></div>`).join("")}</div>`}
function editProduct(id){let p=cfg.products.find(x=>x.id===id);showModal(`<div class="row"><h2>Editar produto</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Nome</label><input id="epn" class="field" value="${esc(p.name)}"><label>Descrição</label><textarea id="epd" class="field">${esc(p.desc)}</textarea><label>Preço</label><input id="epp" type="number" step=".01" class="field" value="${p.price}"><label>Categoria</label><select id="epc" class="field">${cfg.categories.map(c=>`<option value="${c.id}" ${c.id===p.category?"selected":""}>${c.name}</option>`).join("")}</select><label>URL da imagem</label><input id="epi" class="field" value="${esc(p.image)}"><label>Status</label><select id="eps" class="field"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select><div class="group"><div class="groupTitle">Opções deste produto</div>${cfg.groups.map(g=>`<label class="option"><span>${g.name}</span><input class="pg" type="checkbox" value="${g.id}" ${p.groups.includes(g.id)?"checked":""}></label>`).join("")}</div><button class="btn full" onclick="saveProduct('${p.id}')">Salvar</button>`);$("#eps").value=p.status}
function saveProduct(id){let p=cfg.products.find(x=>x.id===id);p.name=$("#epn").value;p.desc=$("#epd").value;p.price=+$("#epp").value;p.category=$("#epc").value;p.image=$("#epi").value;p.status=$("#eps").value;p.groups=$$(".pg:checked").map(x=>x.value);save();closeModal();renderAdmin();renderShop()}
function newProduct(){let p={id:"p"+Date.now(),category:"acai",name:"Novo produto",desc:"",price:0,status:"hidden",image:"",groups:[]};cfg.products.push(p);save();editProduct(p.id)}
function adminStock(){$("#adminContent").innerHTML=cfg.groups.map(g=>`<div class="panel"><div class="row"><div><h3>${g.name}</h3><span class="hint">mín. ${g.min} · máx. ${g.max}</span></div><button class="ghost" onclick="editRules('${g.id}')">Regras</button></div>${g.options.map(o=>`<div class="adminItem"><div><b>${esc(o.name)}</b>${o.price?" · "+brl(o.price):""}<br><span class="badge ${o.status}">${statusLabel(o.status)}</span></div><div class="miniBtns"><button onclick="setOpt('${g.id}','${o.id}','available')">✓</button><button onclick="setOpt('${g.id}','${o.id}','unavailable')">×</button><button onclick="setOpt('${g.id}','${o.id}','hidden')">👁</button></div></div>`).join("")}<button class="ghost" onclick="newOption('${g.id}')">+ Adicionar item</button></div>`).join("")}
function setOpt(gid,oid,s){cfg.groups.find(g=>g.id===gid).options.find(o=>o.id===oid).status=s;save();adminStock();renderShop()}
function editRules(id){let g=cfg.groups.find(x=>x.id===id);showModal(`<div class="row"><h2>${g.name}</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Nome</label><input id="rname" class="field" value="${esc(g.name)}"><div class="two"><div><label>Mínimo</label><input id="rmin" type="number" class="field" value="${g.min}"></div><div><label>Máximo</label><input id="rmax" type="number" class="field" value="${g.max}"></div></div><button class="btn full" onclick="saveRules('${id}')">Salvar</button>`)}
function saveRules(id){let g=cfg.groups.find(x=>x.id===id);g.name=$("#rname").value;g.min=+$("#rmin").value;g.max=+$("#rmax").value;save();closeModal();renderAdmin()}
function newOption(gid){let n=prompt("Nome do item:");if(!n)return;let p=Number(prompt("Preço adicional (0 se grátis):","0")||0);cfg.groups.find(g=>g.id===gid).options.push({id:"o"+Date.now(),name:n,price:p,status:"available"});save();adminStock()}
function adminStore(){let s=cfg.store;$("#adminContent").innerHTML=`<div class="panel"><h3>Funcionamento</h3><label class="switchrow"><span>Pausar loja manualmente</span><input id="paused" type="checkbox" ${s.paused?"checked":""}></label><label>Mensagem quando pausada</label><input id="pauseMsg" class="field" value="${esc(s.pauseMessage)}"><label>WhatsApp</label><input id="wa" class="field" value="${s.whatsapp}"><label>Endereço</label><input id="storeAddr" class="field" value="${esc(s.address)}"><div class="two"><div><label>Pedido mínimo</label><input id="minimum" type="number" class="field" value="${s.minimumOrder}"></div><div><label>Taxa de entrega</label><input id="fee" type="number" class="field" value="${s.deliveryFee}"></div></div><h3>Atendimento</h3><label class="switchrow"><span>Entrega</span><input id="delivery" type="checkbox" ${s.modes.delivery?"checked":""}></label><label class="switchrow"><span>Retirada</span><input id="pickup" type="checkbox" ${s.modes.pickup?"checked":""}></label><label class="switchrow"><span>Consumo no local</span><input id="dinein" type="checkbox" ${s.modes.dinein?"checked":""}></label><h3>Pagamentos</h3>${[["pix","Pix"],["cash","Dinheiro"],["debit","Débito"],["credit","Crédito"]].map(([k,n])=>`<label class="switchrow"><span>${n}</span><input id="pay_${k}" type="checkbox" ${s.payments[k]?"checked":""}></label>`).join("")}<h3>Segurança</h3><p class="hint">O acesso administrativo agora é protegido pelo Supabase Authentication. A senha é gerenciada no Supabase.</p><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveStore">Salvar configurações</button><br><br><button class="dangerBtn" data-pedevia-event="click" data-pedevia-call="resetAll">Restaurar dados iniciais</button></div>`}
function saveStore(){let s=cfg.store;s.paused=$("#paused").checked;s.pauseMessage=$("#pauseMsg").value;s.whatsapp=$("#wa").value;s.address=$("#storeAddr").value;s.minimumOrder=+$("#minimum").value;s.deliveryFee=+$("#fee").value;s.modes.delivery=$("#delivery").checked;s.modes.pickup=$("#pickup").checked;s.modes.dinein=$("#dinein").checked;["pix","cash","debit","credit"].forEach(k=>s.payments[k]=$("#pay_"+k).checked);save();renderAdmin();renderShop();alert("Configurações salvas.")}
function adminHours(){let names=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];$("#adminContent").innerHTML=`<div class="panel"><h3>Horários</h3>${names.map((n,i)=>{let r=cfg.store.hours[String(i)]||[],a=r[0]?.[0]||"",b=r[0]?.[1]||"";return`<div class="adminItem"><div><b>${n}</b><br><span class="hint">${r.length?a+"–"+b:"Fechado"}</span></div><div><input id="ha${i}" type="time" value="${a}"><br><input id="hb${i}" type="time" value="${b}"></div></div>`}).join("")}<button class="btn full" data-pedevia-event="click" data-pedevia-call="saveHours">Salvar horários</button></div>`}
function saveHours(){for(let i=0;i<7;i++){let a=$("#ha"+i).value,b=$("#hb"+i).value;cfg.store.hours[String(i)]=(a&&b)?[[a,b]]:[]}save();renderAdmin();renderShop()}
function resetAll(){if(confirm("Restaurar todos os dados da versão inicial?")){cfg=JSON.parse(JSON.stringify(DEFAULT));save();renderAdmin();renderShop()}}
function showModal(h){$("#sheet").innerHTML=h;$("#modal").classList.add("show")}function closeModal(){$("#modal").classList.remove("show")}$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))closeModal()});

// ===== v0.6: configurações avançadas de pedidos =====
(function migrateOrderV06(){
 const o=cfg.store.orderConfig||(cfg.store.orderConfig={});
 const defaults={deliveryCalc:'neighborhood',deliveryFixedFee:+cfg.store.deliveryFee||5,allowOutside:false,outsideMaxFee:0,pickupTime:40,pickupPrepaid:false,dineinTableRequired:false,requireCpf:false,referenceCodes:false,showOrderNumber:false};
 Object.keys(defaults).forEach(k=>{if(o[k]===undefined)o[k]=defaults[k]});
 if(!Array.isArray(o.neighborhoods))o.neighborhoods=[
  ['Aguada',5],['Alto do Chafre',7],['Bambolim',6],['Barreira',5],['Borracha',5],['Campo do Adrianino',5],['Centro',4],['Ferroviária',5],['Gondin',5],['Grama',6],['Jardim Novo Rodeio',5],['Lago Azul',7],['Lagoinha',15],['Matadouro',5],['Morro do Sossego',5],['Pacheco',5],['Palmeiras da Serra',12],['Parque Santa Clara',5],['Pombal',5],['Provisória',5],['Quatorze (Malvina)',5],['Ramalho',5],['Santo Antônio (Buraco quente)',5],['São Lourenço',5],['Túnel 12',5],['Túnel 11',5]
 ].map((x,i)=>({id:'n'+i,name:x[0],fee:x[1],enabled:true}));
 cfg.store.payments=Object.assign({pix:true,cash:true,debit:true,credit:true,mealVoucher:false,foodVoucher:false},cfg.store.payments||{});
 if(!o.paymentMeta)o.paymentMeta={};
 ['pix','cash','debit','credit','mealVoucher','foodVoucher'].forEach(k=>{o.paymentMeta[k]=Object.assign({feeType:'none',fee:0,askBrand:false},o.paymentMeta[k]||{})});
 save();
})();
function toggleHTML(id,checked){return `<input class="toggle" id="${id}" type="checkbox" ${checked?'checked':''}>`}
function editDeliverySettings(){let s=cfg.store,o=s.orderConfig;showModal(`<div class="row"><h2>Pedidos para entrega</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
 <div class="cfgBlock"><label class="switchrow"><b>Aceitar pedidos para entrega</b>${toggleHTML('odEnabled',s.modes.delivery)}</label></div>
 <label class="cfgLabel">Valor mínimo dos pedidos para entrega (R$)</label><input id="odMin" type="number" step=".01" class="field" value="${s.minimumOrder}">
 <label class="cfgLabel">Cálculo da taxa de entrega</label>
 ${[['fixed','Taxa gratuita ou valor fixo','Defina um valor único, independente do endereço'],['neighborhood','Taxa por lista de bairros','Defina a taxa de acordo com a lista de bairros atendidos']].map(([k,n,d])=>`<label class="radioCard ${o.deliveryCalc===k?'on':''}"><input type="radio" name="calc" value="${k}" ${o.deliveryCalc===k?'checked':''} data-pedevia-event="change" data-pedevia-call="refreshCalcCards"><span><b>${n}</b><small>${d}</small></span></label>`).join('')}
 <div id="fixedFeeBox" class="cfgBlock ${o.deliveryCalc==='fixed'?'':'hide'}"><label>Valor fixo</label><input id="odFixed" type="number" step=".01" class="field" value="${o.deliveryFixedFee||0}"></div>
 <div id="neighborhoodFeeBox" class="cfgBlock ${o.deliveryCalc==='neighborhood'?'':'hide'}"><div class="row"><div><b>Lista de bairros atendidos</b><div class="hint">${(o.neighborhoods||[]).filter(n=>n.enabled).length} bairros · taxas individuais</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="editNeighborhoods">Editar lista</button></div></div>
 <div class="cfgBlock"><label class="switchrow"><span><b>Permitir pedidos fora das áreas de entrega</b><small class="hint">A taxa ficará “A combinar”</small></span>${toggleHTML('odOutside',o.allowOutside)}</label><label class="cfgLabel">Valor máximo de taxa que poderá ser cobrado</label><input id="odOutsideMax" type="number" step=".01" class="field" value="${o.outsideMaxFee||0}"></div>
 <div class="modalActions"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" data-pedevia-event="click" data-pedevia-call="saveDeliverySettings">Concluir</button></div>`);}
function refreshCalcCards(){document.querySelectorAll('.radioCard').forEach(x=>x.classList.toggle('on',x.querySelector('input')?.checked));let v=document.querySelector('input[name=calc]:checked')?.value||'fixed';$('#fixedFeeBox')?.classList.toggle('hide',v!=='fixed');$('#neighborhoodFeeBox')?.classList.toggle('hide',v!=='neighborhood')}
function saveDeliverySettings(){let s=cfg.store,o=s.orderConfig||(s.orderConfig={});s.modes.delivery=$('#odEnabled').checked;s.minimumOrder=+$('#odMin').value||0;o.deliveryCalc=document.querySelector('input[name=calc]:checked')?.value||'fixed';if(!['fixed','neighborhood'].includes(o.deliveryCalc))o.deliveryCalc='fixed';o.deliveryFixedFee=+($('#odFixed')?.value??o.deliveryFixedFee??s.deliveryFee??0)||0;o.allowOutside=$('#odOutside').checked;o.outsideMaxFee=+$('#odOutsideMax').value||0;if(o.deliveryCalc==='fixed')s.deliveryFee=o.deliveryFixedFee;save();closeModal();adminOrderSettings();renderShop()}
function editNeighborhoods(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Cidades e bairros atendidos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p class="sectionNote">Engenheiro Paulo de Frontin - RJ · edite a taxa de cada bairro.</p><input id="neighSearch" class="field searchField" placeholder="Buscar bairro" data-pedevia-event="input" data-pedevia-call="renderNeighborhoodRows"><div id="neighRows" class="neighList"></div><button class="ghost full" data-pedevia-event="click" data-pedevia-call="addNeighborhood">+ Adicionar bairro</button><div class="modalActions"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" data-pedevia-event="click" data-pedevia-call="saveNeighborhoods">Concluir</button></div>`);renderNeighborhoodRows()}
function renderNeighborhoodRows(){let q=($('#neighSearch')?.value||'').toLowerCase(),arr=cfg.store.orderConfig.neighborhoods;$('#neighRows').innerHTML=arr.map((n,i)=>({n,i})).filter(x=>x.n.name.toLowerCase().includes(q)).map(({n,i})=>`<div class="neigh"><div><b>${esc(n.name)}</b><div class="hint">${n.enabled?'Atendido':'Desativado'}</div></div><input class="field neighFee" data-i="${i}" type="number" step=".01" value="${n.fee}"><button class="xbtn" onclick="removeNeighborhood(${i})">×</button></div>`).join('')||'<div class="notice">Nenhum bairro encontrado.</div>'}
function addNeighborhood(){let n=prompt('Nome do bairro:');if(!n)return;cfg.store.orderConfig.neighborhoods.push({id:'n'+Date.now(),name:n,fee:5,enabled:true});renderNeighborhoodRows()}
function removeNeighborhood(i){if(confirm('Remover este bairro da lista?')){cfg.store.orderConfig.neighborhoods.splice(i,1);renderNeighborhoodRows()}}
function saveNeighborhoods(){document.querySelectorAll('.neighFee').forEach(el=>{let i=+el.dataset.i;if(cfg.store.orderConfig.neighborhoods[i])cfg.store.orderConfig.neighborhoods[i].fee=+el.value||0});save();closeModal();editDeliverySettings()}
function editPickupSettings(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Pedidos para retirada</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><div class="cfgBlock"><label class="switchrow"><b>Aceitar pedidos para retirada</b>${toggleHTML('opEnabled',cfg.store.modes.pickup)}</label></div><label class="cfgLabel">Tempo estimado para retirada (em minutos)</label><input id="opTime" type="number" min="0" class="field" value="${o.pickupTime||40}"><div class="cfgBlock"><label class="switchrow"><span><b>Receber apenas pedidos com pagamento antecipado</b><small class="hint">Quando ativo, retirada fica restrita a pagamentos antecipados configurados.</small></span>${toggleHTML('opPrepaid',o.pickupPrepaid)}</label></div><button class="btn full" data-pedevia-event="click" data-pedevia-call="savePickupSettings">Salvar</button>`)}
function savePickupSettings(){let o=cfg.store.orderConfig;cfg.store.modes.pickup=$('#opEnabled').checked;o.pickupTime=+$('#opTime').value||0;o.pickupPrepaid=$('#opPrepaid').checked;save();closeModal();adminOrderSettings();renderShop()}
function editDineinSettings(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Pedidos para consumo no local</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><div class="cfgBlock"><label class="switchrow"><span><b>Aceitar pedidos para consumo no local</b><small class="hint">O cliente pode informar a mesa no pedido.</small></span>${toggleHTML('oiEnabled',cfg.store.modes.dinein)}</label></div><div class="cfgBlock"><label class="switchrow"><b>Tornar o número da mesa obrigatório no pedido</b>${toggleHTML('oiTable',o.dineinTableRequired)}</label></div><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveDineinSettings">Salvar</button>`)}
function saveDineinSettings(){let o=cfg.store.orderConfig;cfg.store.modes.dinein=$('#oiEnabled').checked;o.dineinTableRequired=$('#oiTable').checked;save();closeModal();adminOrderSettings();renderShop()}
function paymentName(k){return {pix:'Pix',cash:'Dinheiro',credit:'Cartão de Crédito (maquininha)',debit:'Cartão de Débito (maquininha)',foodVoucher:'Vale alimentação (maquininha)',mealVoucher:'Vale refeição (maquininha)'}[k]}
function editPaymentSettings(){let p=cfg.store.payments,o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Formas de pagamento</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p class="sectionNote">Escolha as formas aceitas no estabelecimento. Taxas ou descontos ficam salvos por modalidade.</p>${['pix','cash','credit','debit','foodVoucher','mealVoucher'].map(k=>{let m=o.paymentMeta[k];return `<div class="payCard"><div class="payTop"><b>${paymentName(k)}</b>${toggleHTML('pay_'+k,p[k])}</div>${['credit','debit'].includes(k)?`<label class="switchrow subSwitch"><span>Solicitar bandeira do cartão</span>${toggleHTML('brand_'+k,m.askBrand)}</label>`:''}<div class="payMeta"><select id="ft_${k}" class="field"><option value="none" ${m.feeType==='none'?'selected':''}>Sem taxa/desconto</option><option value="fee" ${m.feeType==='fee'?'selected':''}>Taxa (%)</option><option value="discount" ${m.feeType==='discount'?'selected':''}>Desconto (%)</option></select><input id="fv_${k}" type="number" step=".01" class="field" value="${m.fee||0}" placeholder="%"></div></div>`}).join('')}<button class="btn full" data-pedevia-event="click" data-pedevia-call="savePaymentSettings">Salvar formas de pagamento</button>`)}
function savePaymentSettings(){let o=cfg.store.orderConfig;['pix','cash','credit','debit','foodVoucher','mealVoucher'].forEach(k=>{cfg.store.payments[k]=$('#pay_'+k).checked;o.paymentMeta[k].feeType=$('#ft_'+k).value;o.paymentMeta[k].fee=+$('#fv_'+k).value||0;if($('#brand_'+k))o.paymentMeta[k].askBrand=$('#brand_'+k).checked});save();closeModal();adminOrderSettings();renderShop()}
function paymentSummary(){let a=[];['pix','cash','debit','credit','foodVoucher','mealVoucher'].forEach(k=>{if(cfg.store.payments[k])a.push(paymentName(k).replace(' (maquininha)',''))});return a.length?a.join(', '):'Nenhuma forma habilitada'}
function editOtherOrderSettings(){let o=cfg.store.orderConfig;showModal(`<div class="row"><h2>Outras configurações</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><div class="cfgBlock"><label class="switchrow"><span><b>Solicitar CPF ou CNPJ do cliente na compra</b><small class="hint">Se habilitado, o preenchimento será obrigatório.</small></span>${toggleHTML('orCpf',o.requireCpf)}</label></div><div class="cfgBlock"><label class="switchrow"><span><b>Incluir código de referência nos produtos e complementos</b><small class="hint">Útil para identificar itens por código.</small></span>${toggleHTML('orRef',o.referenceCodes)}</label></div><div class="cfgBlock"><label class="switchrow"><span><b>Mostrar numeração dos pedidos</b><small class="hint">A numeração fica visível para o estabelecimento e cliente.</small></span>${toggleHTML('orNum',o.showOrderNumber)}</label></div><label class="cfgLabel">Prefixo dos pedidos</label><input id="orPrefix" class="field" value="${esc(o.orderPrefix)}"><label class="cfgLabel">Próximo número</label><input id="orNext" type="number" min="1" class="field" value="${o.nextOrder}"><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveOtherOrderSettings">Salvar</button>`)}
function saveOtherOrderSettings(){let o=cfg.store.orderConfig;o.requireCpf=$('#orCpf').checked;o.referenceCodes=$('#orRef').checked;o.showOrderNumber=$('#orNum').checked;o.orderPrefix=$('#orPrefix').value;o.nextOrder=Math.max(1,+$('#orNext').value||1);save();closeModal();adminOrderSettings()}
function adminOrderSettings(){let s=cfg.store,o=s.orderConfig;let fees=o.neighborhoods.map(n=>+n.fee||0);let fr=fees.length?`${brl(Math.min(...fees))} a ${brl(Math.max(...fees))}`:'sem bairros';
 $('#adminContent').innerHTML=`<button class="backBtn" onclick="adminOrdersView='main';adminOrders()">‹ Voltar para Pedidos</button><div class="panel"><div class="settingsTitle">Configurações de pedidos</div><div class="settingsList">${settingCard('☏','WhatsApp para atender pedidos:',formatWa(s.whatsapp),'editOrderWhatsapp()')}${settingCard('🚚',`Pedidos para entrega: <span class="enabled">${s.modes.delivery?'Habilitado':'Desabilitado'}</span>`,`${o.neighborhoods.length} bairros · taxas ${fr}`,'editDeliverySettings()')}${settingCard('🛍',`Pedidos para retirada: <span class="enabled">${s.modes.pickup?'Habilitado':'Desabilitado'}</span>`,`Tempo estimado: ${o.pickupTime||0} min`,'editPickupSettings()')}${settingCard('🍽',`Pedidos para consumo no local: <span class="enabled">${s.modes.dinein?'Habilitado':'Desabilitado'}</span>`,o.dineinTableRequired?'Número da mesa obrigatório':'Número da mesa opcional','editDineinSettings()')}${settingCard('＄','Formas de pagamentos',paymentSummary(),'editPaymentSettings()')}${settingCard('▣','Impressão de recibos',o.receiptPrinting?'Ativada':'Desativada','editReceiptSettings()')}${settingCard('🧺','Painel de pedidos',o.panelAlerts?'Alertas de novos pedidos ativados':'Alertas desativados','editPanelSettings()')}${settingCard('•••','Outras configurações',`${o.showOrderNumber?'Numeração ativa':'Numeração oculta'} · ${o.requireCpf?'CPF/CNPJ obrigatório':'CPF/CNPJ opcional'}`,'editOtherOrderSettings()')}</div></div>`}


// ===== v0.7: Configurações gerais no menu Mais =====
(function migrateGeneralV07(){
 const s=cfg.store;
 const d={brandImage:'',legalName:'',cnpj:'',email:'',socialUrl:'https://www.instagram.com/point_frontin/',shareTitle:'Point do Açaí Frontin',shareDescription:'Conheça nosso cardápio 😊💜',hubSlug:'point-do-acai-frontin',customDomain:'',holidayMode:'normal',scheduleMode:'fixed',collaborators:[{name:'Giovana Wolf Serrazina dos Santos',role:'Administrador'}],analyticsId:'',googleAdsId:'',metaPixelId:''};
 Object.keys(d).forEach(k=>{if(s[k]===undefined)s[k]=d[k]}); save();
})();
function moreCard(ic,title,sub,fn){return `<button class="moreCard" onclick="${fn}"><span class="moreIc">${ic}</span><span><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span><span class="chev">›</span></button>`}
function adminMore(){let s=cfg.store;$('#adminContent').innerHTML=`<div class="panel"><div class="settingsTitle">Mais</div><div class="generalHead">⚙️ Configurações gerais</div><div class="moreList">
${moreCard('▣','Nome e marca',s.name,'generalBrand()')}
${moreCard('◷','Horário de Atendimento','Dias, horários e feriados','generalHours()')}
${moreCard('☎','Contato',formatWa(s.whatsapp),'generalContact()')}
${moreCard('⌖','Endereço',s.address,'generalAddress()')}
${moreCard('◎','Redes Sociais',s.instagram||'Adicionar rede social','generalSocial()')}
${moreCard('↗','Compartilhamento em Redes Sociais','Título, descrição e imagem','generalSharing()')}
${moreCard('▦','QR Code','Gerar QR Code do cardápio','generalQr()')}
${moreCard('🏪','Sites dos clientes','Painel mestre para criar e administrar cardápios','openClientSitesMasterV120()')}
${moreCard('🧺','Pedidos','Configurações de pedidos','adminTab=\'orders\';adminOrdersView=\'config\';renderAdmin()')}
</div></div>`}
function generalBack(){adminTab='more';renderAdmin()}
function generalShell(title,body){$('#adminContent').innerHTML=`<button class="backBtn" data-pedevia-event="click" data-pedevia-call="generalBack">‹ Configurações gerais</button><div class="panel"><div class="settingsTitle">${title}</div>${body}</div>`}
function generalBrand(){let s=cfg.store;generalShell('Nome e marca',`<label>Nome do estabelecimento</label><input id="gName" class="field" value="${esc(s.name)}"><label>Logo do estabelecimento</label><div class="brandPreview">${s.brandImage?`<img src="${esc(s.brandImage)}">`:'<div class="brandFallback" style="font-size:13px;line-height:1.15">LOGO DO<br>ESTABELECIMENTO</div>'}</div><input id="gLogo" type="file" accept="image/*" class="field"><p class="hint"><b>Uma única logo para todo o site:</b> ao trocar aqui, a mesma imagem será usada no logozinho do topo e no logo principal da página.</p><label>Razão social e CNPJ (opcional)</label><input id="gLegal" class="field" placeholder="Razão social" value="${esc(s.legalName)}"><input id="gCnpj" class="field" placeholder="CNPJ" value="${esc(s.cnpj)}"><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveGeneralBrand">Salvar</button>`)}
function compressImageFile(file,cb){let r=new FileReader();r.onload=()=>{let img=new Image();img.onload=()=>{let max=700,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',0.82))};img.src=r.result};r.readAsDataURL(file)}
async function saveGeneralBrand(){
  let s=cfg.store;
  s.name=$('#gName').value;
  s.legalName=$('#gLegal').value;
  s.cnpj=$('#gCnpj').value;
  let f=$('#gLogo').files[0];

  const finish=async()=>{
    const ok=await saveAdminNow({successMessage:'Nome e marca salvos online.'});
    if(ok){renderShop();generalBrand();}
  };

  if(f){
    compressImageFile(f,async data=>{
      s.brandImage=data;
      await finish();
    });
  }else{
    await finish();
  }
}
function generalHours(){let s=cfg.store,n=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];generalShell('Horário de Atendimento',`<p class="hint">Informe a forma de atendimento do seu estabelecimento.</p><select id="gSchedule" class="field"><option value="fixed">Atende em horários pré-estabelecidos</option><option value="always">Sempre aberto</option></select>${n.map((x,i)=>{let r=s.hours[String(i)]||[],a=r[0]?.[0]||'',b=r[0]?.[1]||'';return `<div class="adminItem"><b>${x}</b><div><input id="ga${i}" type="time" value="${a}"><input id="gb${i}" type="time" value="${b}"></div></div>`}).join('')}<label>Feriados</label><select id="gHoliday" class="field"><option value="normal">Atendimento Normal</option><option value="closed">Fechado</option></select><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveGeneralHours">Salvar horários</button>`);$('#gSchedule').value=s.scheduleMode;$('#gHoliday').value=s.holidayMode}
async function saveGeneralHours(){
  let s=cfg.store;
  s.scheduleMode=$('#gSchedule').value;
  s.holidayMode=$('#gHoliday').value;

  for(let i=0;i<7;i++){
    let a=$('#ga'+i)?.value||'', b=$('#gb'+i)?.value||'';
    s.hours[String(i)]=(a&&b)?[[a,b]]:[];
  }

  const btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute('onclick')==='saveGeneralHours()');
  const oldText=btn?.textContent||'Salvar horários';
  if(btn){btn.disabled=true;btn.textContent='Salvando...';}

  const ok=await saveAdminNow({successMessage:'Horários salvos online.'});

  if(ok){
    renderShop();
    generalHours();
  }else if(btn){
    btn.disabled=false;
    btn.textContent=oldText;
  }
}
function generalContact(){let s=cfg.store;generalShell('Contato',`<p class="hint">Adicione os números de telefone ou e-mails para contato.</p><label>WhatsApp principal</label><input id="gWa" class="field" value="${esc(s.whatsapp)}"><label>E-mail</label><input id="gEmail" type="email" class="field" value="${esc(s.email)}" placeholder="contato@exemplo.com"><button class="btn full" onclick="cfg.store.whatsapp=$('#gWa').value.replace(/\\D/g,'');cfg.store.email=$('#gEmail').value;save();generalContact()">Salvar contato</button>`)}
function generalAddress(){let s=cfg.store;generalShell('Endereço',`<p class="hint">Insira o endereço do seu estabelecimento.</p><textarea id="gAddr" class="field" rows="4">${esc(s.address)}</textarea><div class="mapMock">📍<br><b>Point do Açaí Frontin</b><small>Prévia do endereço</small></div><button class="btn full" onclick="cfg.store.address=$('#gAddr').value;save();generalAddress()">Salvar endereço</button>`)}
function generalSocial(){let s=cfg.store;generalShell('Redes Sociais',`<p class="hint">Adicione os links para as redes sociais do seu estabelecimento.</p><label>Instagram</label><input id="gInsta" class="field" value="${esc(s.instagram)}" placeholder="@point_frontin"><label>Link do Instagram</label><input id="gSocialUrl" class="field" value="${esc(s.socialUrl)}"><button class="btn full" onclick="cfg.store.instagram=$('#gInsta').value;cfg.store.socialUrl=$('#gSocialUrl').value;save();generalSocial()">Salvar rede social</button>`)}
function generalSharing(){let s=cfg.store;generalShell('Compartilhamento em Redes Sociais',`<p class="hint">Personalize as informações que aparecem junto com seu link ao compartilhar.</p><div class="sharePreview"><div>${s.brandImage?`<img src="${esc(s.brandImage)}">`:'🍧'}</div><b>${esc(s.shareTitle)}</b><small>${esc(s.shareDescription)}</small></div><label>Título</label><input id="gShareTitle" class="field" value="${esc(s.shareTitle)}"><label>Descrição</label><input id="gShareDesc" class="field" value="${esc(s.shareDescription)}"><button class="btn full" onclick="cfg.store.shareTitle=$('#gShareTitle').value;cfg.store.shareDescription=$('#gShareDesc').value;save();generalSharing()">Salvar compartilhamento</button>`)}
function generalDomain(){let s=cfg.store;generalShell('Link e domínio',`<label>Link do estabelecimento</label><div class="linkPreview">www.seusite.com/${esc(s.hubSlug)}</div><label>Identificador do link</label><input id="gSlug" class="field" value="${esc(s.hubSlug)}"><label>Domínio próprio</label><input id="gDomain" class="field" value="${esc(s.customDomain)}" placeholder="www.meudominio.com.br"><button class="btn full" onclick="cfg.store.hubSlug=$('#gSlug').value;cfg.store.customDomain=$('#gDomain').value;save();generalDomain()">Salvar link</button>`)}
function generalCollaborators(){let s=cfg.store;generalShell('Colaboradores',`<p class="hint">Adicione outros usuários para auxiliar na edição do estabelecimento.</p>${s.collaborators.map((c,i)=>`<div class="adminItem"><div><b>${esc(c.name)}</b><br><span class="hint">${esc(c.role)}</span></div><button class="ghost" onclick="removeCollab(${i})">Remover</button></div>`).join('')}<button class="ghost full" data-pedevia-event="click" data-pedevia-call="addCollab">+ Adicionar colaborador</button>`)}
function addCollab(){let n=prompt('Nome do colaborador:');if(!n)return;let r=prompt('Função:','Administrador')||'Administrador';cfg.store.collaborators.push({name:n,role:r});save();generalCollaborators()} function removeCollab(i){if(confirm('Remover colaborador?')){cfg.store.collaborators.splice(i,1);save();generalCollaborators()}}
function generalIntegrations(){let s=cfg.store;generalShell('Integrações',`<h3>Google Analytics</h3><p class="hint">ID de Medição para monitorar acessos.</p><input id="gAna" class="field" value="${esc(s.analyticsId)}" placeholder="G-XXXXXXXXXX"><h3>Google Ads</h3><input id="gAds" class="field" value="${esc(s.googleAdsId)}" placeholder="AW-XXXXXXXXX"><h3>Meta Pixel (Facebook)</h3><input id="gMeta" class="field" value="${esc(s.metaPixelId)}" placeholder="ID do Pixel"><button class="btn full" onclick="cfg.store.analyticsId=$('#gAna').value;cfg.store.googleAdsId=$('#gAds').value;cfg.store.metaPixelId=$('#gMeta').value;save();generalIntegrations()">Salvar integrações</button>`)}
function generalQr(){let s=cfg.store,u='https://www.seusite.com/'+s.hubSlug;generalShell('QR Code',`<div class="qrMock">▦</div><p class="hint" style="text-align:center">QR Code do cardápio</p><div class="linkPreview">${esc(u)}</div><p class="hint">Na publicação final, este QR Code apontará para o endereço real do site.</p>`)}


// v0.9 — editor avançado de produtos e grupos reutilizáveis
(function(){
  cfg.groups.forEach(g=>{if(!g.selectionMode)g.selectionMode='multiple'; if(g.required===undefined)g.required=(+g.min||0)>0; if(g.unlimited===undefined)g.unlimited=false;});
  cfg.products.forEach(p=>{p.groups=p.groups||[];p.images=p.images||[];p.detailedDesc=p.detailedDesc||'';});
  save();
})();

function adminProducts(){
  $('#adminContent').innerHTML=`<div class="panel"><div class="row"><div><h3 style="margin:0">Produtos</h3><div class="hint">Crie e edite os itens do cardápio</div></div><button class="btn" data-pedevia-event="click" data-pedevia-call="newProduct">+ Novo produto</button></div><div class="categoryPills"><button class="tab on">Todos</button>${cfg.categories.map(c=>`<button class="tab">${esc(c.name)}</button>`).join('')}</div>${cfg.products.map(p=>`<div class="adminItem"><div><b>${esc(p.name)}</b> · ${brl(p.price)}<br><span class="badge ${p.status}">${statusLabel(p.status)}</span> <span class="hint">${esc(cfg.categories.find(c=>c.id===p.category)?.name||'Produtos')} · ${p.groups.length} grupo(s)</span></div><button class="ghost" onclick="editProduct('${p.id}')">Editar</button></div>`).join('')}</div>`;
}

function productImagePreview(p){let src=p.image||(p.images&&p.images[0])||'';return src?`<img src="${esc(src)}" alt="${esc(p.name)}">`:`<div class="hint">Sem imagem do produto</div>`}
function groupNames(g){return (g.options||[]).filter(o=>o.status!=='hidden').slice(0,8).map(o=>o.name).join(', ')+((g.options||[]).length>8?'…':'')}
function productGroupsHTML(p){p.groups=Array.isArray(p.groups)?p.groups:[];return p.groups.map(gid=>{let g=cfg.groups.find(x=>x.id===gid);if(!g)return'';let req=g.required||g.min>0;return `<div class="assignedGroup"><div class="assignedGroupHead"><div><b>${esc(g.name)}</b> <span class="tinyTag">${req?'Obrigatório':'Opcional'}</span><div class="names">${esc(groupNames(g))}</div><div class="hint">${g.selectionMode==='single'?'Uma única opção':g.selectionMode==='quantity'?'Opção de quantidade':'Uma ou mais opções'} · ${g.unlimited?'sem limite':'máx. '+g.max}</div></div><button class="ghost" onclick="editGroupForProduct('${p.id}','${g.id}')">Editar</button></div></div>`}).join('')}

function editProduct(id){let p=cfg.products.find(x=>x.id===id); if(!p)return;
 showModal(`<div class="row"><h2>Editar produto</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
 <div class="prodHero" id="prodPrev">${productImagePreview(p)}</div><div class="prodImageActions"><label class="ghost" style="display:inline-block">📷 Escolher imagem<input id="prodFile" type="file" accept="image/*" hidden onchange="previewProductImage('${id}',this)"></label><button class="ghost" onclick="$('#epi').focus()">🔗 Usar URL</button></div>
 <label>Nome do produto *</label><input id="epn" class="field" value="${esc(p.name)}">
 <label>Descrição</label><textarea id="epd" class="field">${esc(p.desc)}</textarea>
 <label>Descrição detalhada</label><textarea id="epdetail" class="field" placeholder="Opcional">${esc(p.detailedDesc||'')}</textarea>
 <div class="two"><div><label>Preço (R$)</label><input id="epp" type="number" step=".01" class="field" value="${p.price}"></div><div><label>Categoria</label><select id="epc" class="field">${cfg.categories.map(c=>`<option value="${c.id}" ${c.id===p.category?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div></div>
 <label>URL da imagem</label><input id="epi" class="field" value="${esc(p.image||'')}" placeholder="https://...">
 <label>Status</label><select id="eps" class="field"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select>
 <div class="sectionTitle">Complementos e opcionais</div><div class="subtle">Os grupos abaixo aparecem ao cliente sempre que ele abrir este produto.</div><div id="productGroupList">${productGroupsHTML(p)}</div>
 <button class="ghost full" onclick="openAddGroupMenu('${p.id}')">＋ Adicionar grupo de complementos</button>
 <div class="stickySave"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" onclick="saveProduct('${p.id}')">Concluir</button></div>`); $('#eps').value=p.status;
}

function previewProductImage(id,input){let f=input.files&&input.files[0];if(!f)return;compressImageFile(f,data=>{let p=cfg.products.find(x=>x.id===id);p._pendingImage=data;$('#prodPrev').innerHTML=`<img src="${data}">`;});}
function saveProduct(id){let p=cfg.products.find(x=>x.id===id);p.name=$('#epn').value.trim()||'Produto';p.desc=$('#epd').value;p.detailedDesc=$('#epdetail').value;p.price=+$('#epp').value||0;p.category=$('#epc').value;p.image=p._pendingImage||$('#epi').value.trim();delete p._pendingImage;p.status=$('#eps').value;save();closeModal();renderAdmin();renderShop();}
function newProduct(){let standard=cfg.groups.filter(g=>['caldas','complementos','adicionais','talher'].includes(g.id)).map(g=>g.id);let p={id:'p'+Date.now(),category:'acai',name:'Novo produto',desc:'',detailedDesc:'',price:0,status:'hidden',image:'',images:[],groups:standard};cfg.products.push(p);save();editProduct(p.id)}

function openAddGroupMenu(pid){let p=cfg.products.find(x=>x.id===pid);showModal(`<div class="row"><h2>Adicionar grupo de complementos</h2><button class="ghost" onclick="editProduct('${pid}')">✕</button></div><div class="productAddMenu"><button class="ghost" onclick="createGroupForProduct('${pid}')">＋ Criar um novo grupo de complementos</button><button class="ghost" onclick="chooseReusableGroups('${pid}')">↻ Selecionar grupos de complementos reutilizáveis</button></div><div class="hint" style="margin-top:12px">Grupos reutilizáveis permitem manter as mesmas opções em vários copos. Alterando o grupo global, todos os produtos vinculados podem ser atualizados juntos.</div>`)}
function chooseReusableGroups(pid){let p=cfg.products.find(x=>x.id===pid);showModal(`<div class="row"><h2>Grupos reutilizáveis</h2><button class="ghost" onclick="editProduct('${pid}')">✕</button></div><div class="groupChooser">${cfg.groups.map(g=>`<label class="option"><span><b>${esc(g.name)}</b><small class="hint">${esc(groupNames(g))}</small></span><input class="reuseG" type="checkbox" value="${g.id}" ${p.groups.includes(g.id)?'checked':''}></label>`).join('')}</div><button class="btn full" onclick="saveReusableGroups('${pid}')">Aplicar ao produto</button>`)}
function saveReusableGroups(pid){let p=cfg.products.find(x=>x.id===pid);p.groups=$$('.reuseG:checked').map(x=>x.value);save();editProduct(pid)}
function createGroupForProduct(pid){let id='g'+Date.now(),g={id,name:'Novo grupo',min:0,max:1,required:false,unlimited:false,selectionMode:'multiple',options:[]};cfg.groups.push(g);cfg.products.find(x=>x.id===pid).groups.push(id);save();editGroupForProduct(pid,id)}

function editGroupForProduct(pid,gid){let g=cfg.groups.find(x=>x.id===gid);if(!g)return; showModal(`<div class="row"><h2>Editar grupo de complementos</h2><button class="ghost" onclick="editProduct('${pid}')">✕</button></div><label>Título do grupo *</label><input id="ggName" class="field" value="${esc(g.name)}"><div class="ruleGrid"><button class="ruleChoice ${g.selectionMode==='single'?'on':''}" onclick="setGroupMode('single')">◉<br>Uma única opção</button><button class="ruleChoice ${g.selectionMode==='multiple'?'on':''}" onclick="setGroupMode('multiple')">☑<br>Uma ou mais opções</button><button class="ruleChoice ${g.selectionMode==='quantity'?'on':''}" onclick="setGroupMode('quantity')">− ＋<br>Opção de quantidade</button></div><input type="hidden" id="ggMode" value="${g.selectionMode||'multiple'}">
 <div class="cfgBlock"><b>A seleção deste complemento é opcional ou obrigatória?</b><div class="two" style="margin-top:8px"><label class="option"><span>Opcional</span><input type="radio" name="ggReq" value="0" ${!g.required?'checked':''}></label><label class="option"><span>Obrigatória</span><input type="radio" name="ggReq" value="1" ${g.required?'checked':''}></label></div></div>
 <div class="cfgBlock"><b>O cliente pode selecionar quantos itens?</b><div class="two" style="margin-top:8px"><label class="option"><span>Sem limite</span><input type="radio" name="ggLim" value="unlimited" ${g.unlimited?'checked':''}></label><label class="option"><span>Limitar quantidade máxima</span><input type="radio" name="ggLim" value="limited" ${!g.unlimited?'checked':''}></label></div><label>Quantidade máxima</label><input id="ggMax" type="number" min="1" class="field" value="${g.max||1}"></div>
 <div class="sectionTitle">Complementos</div><div class="subtle">Edite nome, descrição, preço e disponibilidade.</div><div id="ggOptions">${groupOptionEditors(g)}</div><button class="ghost full" data-pedevia-event="click" data-pedevia-call="addGroupOptionEditor">＋ Adicionar complemento</button>
 <div class="sectionTitle">Como deseja salvar?</div><label class="option"><span>Atualizar este grupo em todos os produtos aplicados</span><input type="radio" name="saveScope" value="global" checked></label><label class="option"><span>Aplicar alterações apenas para este produto</span><input type="radio" name="saveScope" value="product"></label>
 <div class="stickySave"><button class="ghost" onclick="editProduct('${pid}')">Cancelar</button><button class="btn" onclick="saveAdvancedGroup('${pid}','${gid}')">Concluir edição</button></div>`)}
function setGroupMode(m){$('#ggMode').value=m;$$('.ruleChoice').forEach((b,i)=>b.classList.toggle('on',['single','multiple','quantity'][i]===m))}
function groupOptionEditors(g){return (g.options||[]).map((o,i)=>`<div class="optionEdit"><div class="line"><input class="field goName" value="${esc(o.name)}" placeholder="Nome"><input class="field goPrice" type="number" step=".01" value="${o.price||0}" placeholder="R$"><button class="ghost" onclick="this.closest('.optionEdit').remove()">×</button></div><input class="field goDesc" value="${esc(o.desc||'')}" placeholder="Descrição (opcional)"><select class="field goStatus"><option value="available" ${o.status==='available'?'selected':''}>Disponível</option><option value="unavailable" ${o.status==='unavailable'?'selected':''}>Indisponível</option><option value="hidden" ${o.status==='hidden'?'selected':''}>Oculto</option></select></div>`).join('')}
function addGroupOptionEditor(){$('#ggOptions').insertAdjacentHTML('beforeend',`<div class="optionEdit"><div class="line"><input class="field goName" placeholder="Nome"><input class="field goPrice" type="number" step=".01" value="0"><button class="ghost" onclick="this.closest('.optionEdit').remove()">×</button></div><input class="field goDesc" placeholder="Descrição (opcional)"><select class="field goStatus"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select></div>`)}
function collectGroupForm(base){let required=$('input[name="ggReq"]:checked').value==='1',unlimited=$('input[name="ggLim"]:checked').value==='unlimited',cards=$$('.optionEdit');return {...base,name:$('#ggName').value.trim()||'Grupo',selectionMode:$('#ggMode').value,required,min:required?1:0,unlimited,max:unlimited?999:Math.max(1,+$('#ggMax').value||1),options:cards.map((c,i)=>({id:(base.options&&base.options[i]?.id)||('o'+Date.now()+i),name:c.querySelector('.goName').value.trim()||'Complemento',desc:c.querySelector('.goDesc').value,price:+c.querySelector('.goPrice').value||0,status:c.querySelector('.goStatus').value}))}}
function saveAdvancedGroup(pid,gid){let old=cfg.groups.find(x=>x.id===gid),scope=$('input[name="saveScope"]:checked').value,form=collectGroupForm(old);if(scope==='global'){Object.assign(old,form)}else{let clone={...form,id:'g'+Date.now(),options:form.options.map((o,i)=>({...o,id:'o'+Date.now()+i}))};cfg.groups.push(clone);let p=cfg.products.find(x=>x.id===pid);p.groups=p.groups.map(x=>x===gid?clone.id:x)}save();editProduct(pid)}



// ===== v1.0: construtor de seções do cardápio =====
(function migrateSectionsV10(){
  if(!Array.isArray(cfg.sections)||!cfg.sections.length){
    cfg.sections=(cfg.categories||[]).map((c,i)=>({id:c.id,title:c.name,description:'',display:'expanded-images',accent:i===0?'#a62bb7':i===1?'#6f2388':'#8b5a2b',active:c.active!==false,order:i}));
  }
  cfg.sections.forEach((s,i)=>{if(s.order===undefined)s.order=i;if(s.active===undefined)s.active=true;if(!s.display)s.display='expanded-images';if(!s.accent)s.accent='#712489';if(s.description===undefined)s.description=''});
  // categorias antigas continuam espelhadas para compatibilidade com outras rotinas
  cfg.categories=cfg.sections.map(s=>({id:s.id,name:s.title,active:s.active}));
  if(!cfg.sections.some(s=>s.id===activeCat))activeCat=cfg.sections[0]?.id||'';
  try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn(e)}
})();
function syncCategoriesFromSections(){cfg.categories=cfg.sections.map(s=>({id:s.id,name:s.title,active:s.active}));}
function sectionById(id){return cfg.sections.find(s=>s.id===id)}
function productsForSection(id){return cfg.products.filter(p=>p.category===id)}
function newSection(afterId){let id='sec'+Date.now(),idx=afterId?cfg.sections.findIndex(s=>s.id===afterId)+1:cfg.sections.length;let sec={id,title:'Nova seção',description:'',display:'expanded-images',accent:'#712489',active:true,order:idx};cfg.sections.splice(Math.max(0,idx),0,sec);cfg.sections.forEach((s,i)=>s.order=i);syncCategoriesFromSections();save();editSection(id)}
function deleteSection(id){let n=productsForSection(id).length;if(n){alert('Esta seção possui '+n+' produto(s). Mova ou exclua os produtos antes de remover a seção.');return}if(confirm('Remover esta seção do cardápio?')){cfg.sections=cfg.sections.filter(s=>s.id!==id);cfg.sections.forEach((s,i)=>s.order=i);syncCategoriesFromSections();save();adminMenu();renderShop()}}
function editSection(id){let s=sectionById(id);if(!s)return;showModal(`<div class="row"><h2>Editar seção de produtos</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Título *</label><input id="secTitle" class="field" value="${esc(s.title)}"><label>Descrição (opcional)</label><textarea id="secDesc" class="field" rows="5">${esc(s.description||'')}</textarea><div class="sectionTitle">Tipo de exibição dos produtos</div><div class="displayChoices">${[['expanded-images','▦','Expandido com imagens'],['expanded-no-images','▤','Expandido sem imagens'],['compact-images','☷','Compacto com imagens'],['compact-no-images','≣','Compacto sem imagens']].map(([v,ic,n])=>`<button class="displayChoice ${s.display===v?'on':''}" onclick="selectSectionDisplay('${v}')"><span class="displayMock">${ic}</span>${n}</button>`).join('')}</div><input type="hidden" id="secDisplay" value="${esc(s.display)}"><label>Cor de destaque</label><input id="secAccent" type="color" class="field" value="${esc(s.accent||'#712489')}"><label class="switchrow"><span>Exibir esta seção para o cliente</span><input id="secActive" class="toggle" type="checkbox" ${s.active?'checked':''}></label><div class="stickySave"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" onclick="saveSection('${id}')">Concluir</button></div>`)}
function selectSectionDisplay(v){$('#secDisplay').value=v;$$('.displayChoice').forEach(b=>b.classList.remove('on'));let vals=['expanded-images','expanded-no-images','compact-images','compact-no-images'];let i=vals.indexOf(v);if(i>=0)$$('.displayChoice')[i].classList.add('on')}
function saveSection(id){let s=sectionById(id);s.title=$('#secTitle').value.trim()||'Seção';s.description=$('#secDesc').value;s.display=$('#secDisplay').value;s.accent=$('#secAccent').value;s.active=$('#secActive').checked;syncCategoriesFromSections();save();closeModal();adminMenu();renderShop()}
function moveSection(id,dir){let i=cfg.sections.findIndex(s=>s.id===id),j=i+dir;if(i<0||j<0||j>=cfg.sections.length)return;[cfg.sections[i],cfg.sections[j]]=[cfg.sections[j],cfg.sections[i]];cfg.sections.forEach((s,k)=>s.order=k);syncCategoriesFromSections();save();adminMenu();renderShop()}
function moveProductToSection(pid,sid){let p=cfg.products.find(x=>x.id===pid);if(p){p.category=sid;save();adminMenu();renderShop()}}

function adminMenu(){
 $('#adminContent').innerHTML=`<div class="panel"><div class="menuBuilderHead"><div><h3 style="margin:0">Cardápio</h3><div class="hint">Organize produtos em seções como Açaí, Sorvetes, Biscoitos e outras.</div></div><button class="btn" data-pedevia-event="click" data-pedevia-call="newSection">＋ Adicionar seção</button></div><div class="adminSubnav"><button class="on">Seções e produtos</button><button onclick="adminSubTab='stock';adminStock()">Complementos e estoque</button></div>${cfg.sections.map((s,i)=>`${i===0?'<div class="sectionInsert"><button onclick="newSection(null)">＋ Adicionar seção</button></div>':''}<div class="sectionAdmin"><div class="sectionAdminTop"><div><h3>${esc(s.title)} ${s.active?'':'<span class="badge hidden">Oculta</span>'}</h3><div class="sectionDesc">${esc(s.description||'Sem descrição')} · ${productsForSection(s.id).length} produto(s)</div></div><div class="miniBtns"><button onclick="moveSection('${s.id}',-1)" ${i===0?'disabled':''}>↑</button><button onclick="moveSection('${s.id}',1)" ${i===cfg.sections.length-1?'disabled':''}>↓</button><button onclick="editSection('${s.id}')">✎</button></div></div><div class="sectionAdminProducts">${productsForSection(s.id).map(p=>`<div class="adminProdCard"><b>${esc(p.name)}</b><span class="price">${brl(p.price)}</span><div class="hint">${statusLabel(p.status)} · ${(p.groups||[]).length} grupos</div><button class="ghost full" onclick="editProduct('${p.id}')">Editar produto</button></div>`).join('')||'<div class="emptySection">Nenhum produto nesta seção.</div>'}</div><button class="ghost full" style="margin-top:10px" onclick="newProduct('${s.id}')">＋ Adicionar produto em ${esc(s.title)}</button><button class="dangerBtn" style="margin-top:8px" onclick="deleteSection('${s.id}')">Remover seção</button></div><div class="sectionInsert"><button onclick="newSection('${s.id}')">＋ Adicionar seção</button></div>`).join('')}</div>`;
}
function adminProducts(){adminMenu()}

function editProduct(id){let p=cfg.products.find(x=>x.id===id); if(!p)return;
 showModal(`<div class="row"><h2>${p.name==='Novo produto'?'Adicionar produto':'Editar produto'}</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><div class="prodHero" id="prodPrev">${productImagePreview(p)}</div><div class="prodImageActions"><label class="ghost" style="display:inline-block">📷 Escolher imagem<input id="prodFile" type="file" accept="image/*" hidden onchange="previewProductImage('${id}',this)"></label><button class="ghost" onclick="$('#epi').focus()">🔗 Usar URL</button></div><label>Nome do produto *</label><input id="epn" class="field" value="${esc(p.name)}"><label>Descrição</label><textarea id="epd" class="field">${esc(p.desc)}</textarea><label>Descrição detalhada</label><textarea id="epdetail" class="field" placeholder="Opcional">${esc(p.detailedDesc||'')}</textarea><div class="two"><div><label>Preço (R$)</label><input id="epp" type="number" step=".01" class="field" value="${p.price}"></div><div><label>Seção do cardápio</label><select id="epc" class="field">${cfg.sections.map(s=>`<option value="${s.id}" ${s.id===p.category?'selected':''}>${esc(s.title)}</option>`).join('')}</select></div></div><label>URL da imagem</label><input id="epi" class="field" value="${esc(p.image||'')}" placeholder="https://..."><label>Status</label><select id="eps" class="field"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select><div class="sectionTitle">Complementos e opcionais</div><div class="subtle">Os grupos abaixo aparecem ao cliente sempre que ele abrir este produto.</div><div id="productGroupList">${productGroupsHTML(p)}</div><button class="ghost full" onclick="openAddGroupMenu('${p.id}')">＋ Adicionar grupo de complementos</button><div class="stickySave"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" onclick="saveProduct('${p.id}')">Concluir</button></div>`); $('#eps').value=p.status;
}
function newProduct(sectionId){let sid=sectionId||cfg.sections[0]?.id||'acai';let standard=cfg.groups.filter(g=>['caldas','complementos','adicionais','talher'].includes(g.id)).map(g=>g.id);let p={id:'p'+Date.now(),category:sid,name:'Novo produto',desc:'',detailedDesc:'',price:0,status:'hidden',image:'',images:[],groups:standard};cfg.products.push(p);save();editProduct(p.id)}
function repairSectionsEmergency(){let cats=Array.isArray(cfg.categories)&&cfg.categories.length?cfg.categories:DEFAULT.categories;cfg.sections=cats.map((c,i)=>({id:String(c.id),title:c.name||String(c.id),description:'',display:'expanded-images',accent:'#712489',active:c.active!==false,order:i}));let ids=new Set(cfg.sections.map(s=>s.id));(cfg.products||[]).forEach(p=>{p.groups=Array.isArray(p.groups)?p.groups:[];if(!p.category)p.category=cfg.sections[0]?.id||'acai';if(!ids.has(String(p.category))){cfg.sections.push({id:String(p.category),title:String(p.category),description:'',display:'expanded-images',accent:'#712489',active:true,order:cfg.sections.length});ids.add(String(p.category))}});syncCategoriesFromSections();try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn(e)}}

function renderShop(){let st=openState();renderClientStoreInfo();$('#storeStatus').textContent='● '+st.text;$('#closedNotice').innerHTML=st.open?'':'<div class="notice bad">A loja está fechada no momento. Você pode montar o pedido e consultar o cardápio.</div>';
 let secs=(Array.isArray(cfg.sections)?cfg.sections:[]).filter(s=>s.active!==false);if(!secs.length){repairSectionsEmergency();secs=cfg.sections.filter(s=>s.active!==false)}$('#categoryTabs').className='quickSections';$('#categoryTabs').innerHTML=secs.map(s=>`<button class="tab" onclick="document.getElementById('clientSec_${s.id}')?.scrollIntoView({behavior:'smooth'})">${esc(s.title)}</button>`).join('');
 $('#productGrid').className='';$('#productGrid').innerHTML=secs.map(s=>{let ps=cfg.products.filter(p=>p.category===s.id&&p.status!=='hidden'),compact=s.display.startsWith('compact'),noimg=s.display.endsWith('no-images');return `<section class="clientSection ${compact?'sectionCompact':''} ${noimg?'sectionNoImages':''}" id="clientSec_${s.id}"><div class="clientSectionHead" style="border-top:5px solid ${esc(s.accent||'#712489')}"><h2>${esc(s.title)}</h2>${s.description?`<p>${esc(s.description)}</p>`:''}</div><div class="grid">${ps.map(p=>`<article class="card" ${p.status==='available'?`data-pedevia-open-product="${p.id}"`:''}>${noimg?'':`<div class="photo" ${p.image?`style="background-image:url('${esc(p.image)}')"`:''}>${p.image?'':'🍧'}</div>`}<div class="cardbody"><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p><div class="row"><span class="price">${brl(p.price)}</span>${p.status==='unavailable'?'<span class="badge unavailable">Indisponível</span>':''}</div></div></article>`).join('')||'<div class="emptySection">Nenhum produto disponível nesta seção.</div>'}</div></section>`}).join('');updateCart();}


// ===== CONEXÃO ADMIN -> CARDÁPIO (correção atual) =====
// Normaliza produtos e grupos para que toda edição administrativa seja refletida no cliente.
(function normalizeLiveCatalog(){
  cfg.groups=(cfg.groups||[]).map(g=>{
    g.options=Array.isArray(g.options)?g.options:[];
    if(!g.selectionMode) g.selectionMode=(Number(g.max)===1?'single':'multiple');
    if(g.required===undefined) g.required=Number(g.min||0)>0;
    if(g.unlimited===undefined) g.unlimited=false;
    if(g.selectionMode==='single') { g.max=1; g.unlimited=false; }
    if(!Number.isFinite(Number(g.max)) || Number(g.max)<1) g.max=1;
    g.min=g.required?1:0;
    g.options.forEach(o=>{ if(!o.status)o.status='available'; if(o.price===undefined)o.price=0; });
    return g;
  });
  cfg.products=(cfg.products||[]).map(p=>{
    p.groups=Array.isArray(p.groups)?p.groups:[];
    if(!p.status)p.status='available';
    if(!p.category)p.category=cfg.sections?.[0]?.id||cfg.categories?.[0]?.id||'acai';
    return p;
  });
})();

function effectiveGroupRules(g){
  let mode=g.selectionMode||((+g.max===1)?'single':'multiple');
  let required=g.required===true || +g.min>0;
  let unlimited=g.unlimited===true;
  let max=mode==='single'?1:(unlimited?Infinity:Math.max(1,+g.max||1));
  let min=required?1:0;
  return {mode,required,unlimited,max,min};
}
function clientRuleText(g){
  let r=effectiveGroupRules(g);
  if(r.mode==='single') return r.required?'Escolha 1 opção.':'Escolha até 1 opção (opcional).';
  if(r.mode==='quantity') return r.unlimited?(r.required?'Escolha a quantidade desejada.':'Adicione quantidades se quiser.'):(r.required?`Escolha de 1 até ${r.max} unidade(s).`:`Até ${r.max} unidade(s), opcional.`);
  return r.unlimited?(r.required?'Escolha uma ou mais opções.':'Escolha quantas opções quiser (opcional).'):(r.required?`Escolha de 1 até ${r.max} opção(ões).`:`Escolha até ${r.max} opção(ões), opcional.`);
}
function quantityOptionRow(g,o){
  return `<div class="option optionCard qtyOption" data-oid="${o.id}"><span><b>${esc(o.name)}</b>${o.desc?`<small class="hint">${esc(o.desc)}</small>`:''}${o.price?`<span class="optionPrice">+ ${brl(o.price)}</span>`:'<span class="optionPrice">Grátis</span>'}</span><div class="optQty"><button type="button" class="minusBtn" onclick="changeOptionQty(this,-1)">−</button><b class="optQtyValue">0</b><button type="button" class="plusBtn" onclick="changeOptionQty(this,1)">+</button></div></div>`;
}
function groupSelectedCount(group){
  let mode=group.dataset.mode;
  if(mode==='quantity') return [...group.querySelectorAll('.optQtyValue')].reduce((a,x)=>a+(+x.textContent||0),0);
  return group.querySelectorAll('input:checked').length;
}
function refreshGroupLimit(group){
  if(!group)return;
  let max=group.dataset.max==='inf'?Infinity:+group.dataset.max, mode=group.dataset.mode, count=groupSelectedCount(group), reached=Number.isFinite(max)&&count>=max;
  group.classList.toggle('limitReached',reached);
  if(mode==='quantity'){
    group.querySelectorAll('.qtyOption').forEach(row=>{
      let q=+row.querySelector('.optQtyValue').textContent||0;
      let plus=row.querySelector('.plusBtn');
      if(plus) plus.disabled=reached;
      row.classList.toggle('locked',reached && q===0);
      row.classList.toggle('selected',q>0);
    });
  }else{
    group.querySelectorAll('.optionCard').forEach(row=>{
      let inp=row.querySelector('input'); if(!inp)return;
      let lock=reached && !inp.checked;
      inp.disabled=lock;
      row.classList.toggle('locked',lock);
      row.classList.toggle('selected',inp.checked);
    });
  }
}
function refreshAllGroupLimits(){ document.querySelectorAll('.choiceGroup').forEach(refreshGroupLimit); updateProductLiveTotal(); }
function changeOptionQty(btn,delta){
  let group=btn.closest('.choiceGroup'), row=btn.closest('.qtyOption'), val=row.querySelector('.optQtyValue');
  let current=+val.textContent||0, max=group.dataset.max==='inf'?Infinity:+group.dataset.max, total=groupSelectedCount(group);
  if(delta>0 && total>=max) return;
  val.textContent=Math.max(0,current+delta);
  refreshGroupLimit(group); updateProductLiveTotal();
}
function handleChoiceChange(inp){ refreshGroupLimit(inp.closest('.choiceGroup')); updateProductLiveTotal(); }
function currentProductExtra(){
  let extra=0;
  document.querySelectorAll('.choiceGroup').forEach(box=>{
    let g=cfg.groups.find(x=>x.id===box.dataset.gid); if(!g)return;
    if(box.dataset.mode==='quantity'){
      box.querySelectorAll('.qtyOption').forEach(row=>{let q=+row.querySelector('.optQtyValue').textContent||0,o=g.options.find(x=>x.id===row.dataset.oid);if(o)extra+=(+o.price||0)*q});
    }else box.querySelectorAll('input:checked').forEach(i=>{let o=g.options.find(x=>x.id===i.value);if(o)extra+=+o.price||0});
  });
  return extra;
}
function updateProductLiveTotal(){
  let btn=document.querySelector('.addPriceBtn'); if(!btn)return;
  let base=+btn.dataset.base||0, q=+(document.querySelector('#qty')?.textContent||1), total=(base+currentProductExtra())*q;
  let out=btn.querySelector('.liveTotal'); if(out)out.textContent=brl(total);
}
function qty(n){let el=$('#qty');el.textContent=Math.max(1,+el.textContent+n);updateProductLiveTotal()}

// Cliente: usa exatamente as regras configuradas no Admin e bloqueia visualmente ao atingir o máximo.
function openProduct(id){
  let p=cfg.products.find(x=>x.id===id); if(!p)return;
  let h=`<div class="row"><div><h2 style="margin:0">${esc(p.name)}</h2><span class="price">${brl(p.price)}</span></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p>${esc(p.desc||'')}</p>${p.detailedDesc?`<p class="hint">${esc(p.detailedDesc)}</p>`:''}`;
  (p.groups||[]).forEach(gid=>{
    let g=cfg.groups.find(x=>x.id===gid); if(!g)return;
    let os=(g.options||[]).filter(o=>o.status==='available'); if(!os.length)return;
    let r=effectiveGroupRules(g), maxAttr=Number.isFinite(r.max)?r.max:'inf';
    h+=`<div class="group choiceGroup" data-gid="${g.id}" data-mode="${r.mode}" data-min="${r.min}" data-max="${maxAttr}"><div class="groupTitle">${esc(g.name)} ${r.required?'<span class="tinyTag">Obrigatório</span>':'<span class="tinyTag">Opcional</span>'}</div><div class="hint">${clientRuleText(g)}</div>`;
    if(r.mode==='quantity') h+=os.map(o=>quantityOptionRow(g,o)).join('');
    else{
      let type=r.mode==='single'?'radio':'checkbox';
      h+=os.map(o=>`<label class="option optionCard"><span><b>${esc(o.name)}</b>${o.desc?`<small class="hint">${esc(o.desc)}</small>`:''}${o.price?`<span class="optionPrice">+ ${brl(o.price)}</span>`:'<span class="optionPrice">Grátis</span>'}</span><input type="${type}" name="g_${g.id}" value="${o.id}" onchange="handleChoiceChange(this)"></label>`).join('');
    }
    h+='</div>';
  });
  h+=`<label>Observação</label><textarea id="itemObs" class="field" placeholder="Ex.: sem granola"></textarea><div class="productFooter"><div class="productQty"><button onclick="qty(-1)">−</button><b id="qty">1</b><button onclick="qty(1)">+</button></div><button class="btn addPriceBtn" data-base="${+p.price||0}" onclick="addCart('${p.id}')">Adicionar • <span class="liveTotal">${brl(p.price)}</span></button></div>`;
  showModal(h); setTimeout(refreshAllGroupLimits,0);
}
function addCart(pid){
  let p=cfg.products.find(x=>x.id===pid); if(!p)return;
  let groups=[],extra=0;
  for(let box of $$('.choiceGroup')){
    let g=cfg.groups.find(x=>x.id===box.dataset.gid); if(!g)continue;
    let mode=box.dataset.mode, min=+box.dataset.min, max=box.dataset.max==='inf'?Infinity:+box.dataset.max, items=[];
    if(mode==='quantity'){
      let total=0;
      for(let row of $$('.qtyOption',box)){let q=+row.querySelector('.optQtyValue').textContent||0;if(!q)continue;let o=g.options.find(x=>x.id===row.dataset.oid);if(!o)continue;total+=q;extra+=(+o.price||0)*q;items.push({name:o.name,price:+o.price||0,qty:q})}
      if(total<min){focusRequiredGroupV1162(box,g);return}
    }else{
      let sel=$$('input:checked',box);
      if(sel.length<min){focusRequiredGroupV1162(box,g);return}
      items=sel.map(i=>{let o=g.options.find(x=>x.id===i.value);return o?{name:o.name,price:+o.price||0,qty:1}:null}).filter(Boolean);items.forEach(o=>extra+=o.price);
    }
    if(items.length)groups.push({name:g.name,items});
  }
  cart.push({pid,qty:+$('#qty').textContent,unit:(+p.price||0)+extra,groups,obs:$('#itemObs').value});closeModal();updateCart();
}

// Novo produto nasce visível e já conectado à seção escolhida e aos grupos padrão.
function newProduct(sectionId){
  let sid=sectionId||cfg.sections?.[0]?.id||cfg.categories?.[0]?.id||'acai';
  let standard=cfg.groups.filter(g=>['caldas','complementos','adicionais','talher'].includes(g.id)).map(g=>g.id);
  let p={id:'p'+Date.now(),category:sid,name:'Novo produto',desc:'',detailedDesc:'',price:0,status:'available',image:'',images:[],groups:standard};
  cfg.products.push(p); save(); editProduct(p.id);
}

// Salvar grupo também normaliza a regra antes de atualizar o cliente.
function collectGroupForm(base){
  let required=$('input[name="ggReq"]:checked')?.value==='1';
  let unlimited=$('input[name="ggLim"]:checked')?.value==='unlimited';
  let mode=$('#ggMode').value;
  let max=mode==='single'?1:(unlimited?999:Math.max(1,+$('#ggMax').value||1));
  let cards=$$('.optionEdit');
  return {...base,name:$('#ggName').value.trim()||'Grupo',selectionMode:mode,required,min:required?1:0,unlimited:mode==='single'?false:unlimited,max,
    options:cards.map((c,i)=>({id:(base.options&&base.options[i]?.id)||('o'+Date.now()+i),name:c.querySelector('.goName').value.trim()||'Complemento',desc:c.querySelector('.goDesc').value,price:+c.querySelector('.goPrice').value||0,status:c.querySelector('.goStatus').value}))};
}
function saveAdvancedGroup(pid,gid){
  let old=cfg.groups.find(x=>x.id===gid); if(!old)return;
  let scope=$('input[name="saveScope"]:checked')?.value||'global', form=collectGroupForm(old);
  if(scope==='global') Object.assign(old,form);
  else {let clone={...form,id:'g'+Date.now(),options:form.options.map((o,i)=>({...o,id:'o'+Date.now()+i}))};cfg.groups.push(clone);let p=cfg.products.find(x=>x.id===pid);p.groups=(p.groups||[]).map(x=>x===gid?clone.id:x);}
  save(); renderShop(); editProduct(pid);
}

// Carrinho e WhatsApp mostram quantidades de complementos quando usadas.
function itemLabel(x){return (x.qty&&x.qty>1?x.qty+'x ':'')+esc(x.name)}
function showCart(){let sub=sum(),fee=+cfg.store.deliveryFee;let h=`<div class="row"><h2>Carrinho</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>`;if(!cart.length){showModal(h+'<p>Seu carrinho está vazio.</p>');return}
 h+=cart.map((i,n)=>{let p=cfg.products.find(x=>x.id===i.pid);return`<div class="summary"><div class="row"><b>${i.qty}x ${esc(p?.name||'Produto')}</b><b>${brl(i.unit*i.qty)}</b></div>${i.groups.map(g=>`<small><b>${esc(g.name)}:</b> ${g.items.map(itemLabel).join(', ')}</small>`).join('')}${i.obs?`<small>Obs.: ${esc(i.obs)}</small>`:''}<button class="ghost" style="margin-top:8px" onclick="cart.splice(${n},1);updateCart();showCart()">Remover</button></div>`}).join('');
 h+=`<h3>Finalizar pedido</h3><label>Nome</label><input id="cust" class="field"><label>Tipo</label><select id="orderMode" class="field" data-pedevia-event="change" data-pedevia-call="checkoutTotals">${cfg.store.modes.delivery?'<option value="delivery">Entrega</option>':''}${cfg.store.modes.pickup?'<option value="pickup">Retirada</option>':''}${cfg.store.modes.dinein?'<option value="dinein">Consumo no local</option>':''}</select><div id="addressBox"><label>Endereço, número, bairro e referência</label><input id="addr" class="field"></div><label>Pagamento</label><select id="pay" class="field">${cfg.store.payments.pix?'<option>Pix</option>':''}${cfg.store.payments.cash?'<option>Dinheiro</option>':''}${cfg.store.payments.debit?'<option>Débito</option>':''}${cfg.store.payments.credit?'<option>Crédito</option>':''}</select><label>Observação geral</label><textarea id="orderObs" class="field"></textarea><div class="summary"><div class="row"><span>Subtotal</span><b>${brl(sub)}</b></div><div class="row" id="feeLine"><span>Taxa de entrega</span><b>${brl(fee)}</b></div><div class="row"><h3>Total</h3><h3 id="grand">${brl(sub+fee)}</h3></div></div>${sub<+cfg.store.minimumOrder?`<div class="notice bad">Pedido mínimo: ${brl(cfg.store.minimumOrder)}</div>`:'<button class="btn green full" data-pedevia-event="click" data-pedevia-call="sendOrder">Enviar pedido pelo WhatsApp</button>'}`;showModal(h);checkoutTotals();}
function sendOrder(){let modeSel=$('#orderMode').value,del=modeSel==='delivery',fee=del?+cfg.store.deliveryFee:0,L=['🍧 *PEDIDO POINT DO AÇAÍ FRONTIN*',''];cart.forEach(i=>{let p=cfg.products.find(x=>x.id===i.pid);L.push(`*${i.qty}x ${p?.name||'Produto'}* — ${brl(i.unit*i.qty)}`);i.groups.forEach(g=>L.push(`${g.name}: ${g.items.map(x=>(x.qty&&x.qty>1?x.qty+'x ':'')+x.name).join(', ')}`));if(i.obs)L.push('Obs.: '+i.obs);L.push('')});L.push('Cliente: '+($('#cust').value||'-'),'Tipo: '+(modeSel==='delivery'?'Entrega':modeSel==='pickup'?'Retirada':'Consumo no local'));if(del)L.push('Endereço: '+($('#addr').value||'-'));L.push('Pagamento: '+$('#pay').value,'Subtotal: '+brl(sum()));if(fee)L.push('Taxa: '+brl(fee));L.push('*TOTAL: '+brl(sum()+fee)+'*');if($('#orderObs').value)L.push('Observação geral: '+$('#orderObs').value);location.href='https://wa.me/'+cfg.store.whatsapp+'?text='+encodeURIComponent(L.join('\n'));}


// ===== Carrinho e checkout conectados =====
window.checkoutState={mode:null,payment:null,address:'',neighborhood:'',customer:'',phone:'',note:'',table:''};
function cartSubtotal(){return sum()}
function cartDeliveryFee(){const st=window.checkoutState||{},o=cfg.store.orderConfig||{};if(st.mode!=='delivery')return 0;const mode=['fixed','neighborhood'].includes(o.deliveryCalc)?o.deliveryCalc:'fixed';if(mode==='fixed')return +(o.deliveryFixedFee??cfg.store.deliveryFee??0)||0;if(st.neighborhood){let n=(o.neighborhoods||[]).find(x=>x.enabled!==false&&String(x.name||'').trim().toLowerCase()===String(st.neighborhood||'').trim().toLowerCase());if(n)return +n.fee||0}return +cfg.store.deliveryFee||0;} function paymentAdjustment(base){
 const st=window.checkoutState||{},m=cfg.store.orderConfig?.paymentMeta||{},key=st.payment;
 const meta=m[key]||{}; let v=+meta.fee||0;
 if(meta.feeType==='fee') return base*v/100;
 if(meta.feeType==='discount') return -base*v/100;
 return 0;
}
function changeCartQty(i,d){let it=cart[i];if(!it)return;it.qty=Math.max(1,(+it.qty||1)+d);updateCart();showCart()}
function removeCartItem(i){cart.splice(i,1);updateCart();showCart()}
function continueShopping(){closeModal();setTimeout(()=>{document.querySelector('#shopView')?.scrollIntoView({behavior:'smooth',block:'start'})},80)}
function showCart(){
 let sub=cartSubtotal();
 let h=`<div class="row"><div><h2 class="checkoutTitle">Seu pedido</h2><div class="checkoutSub">Revise os itens ou continue comprando</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>`;
 if(!cart.length){showModal(h+`<div class="notice">Seu carrinho está vazio.</div><button class="btn full" data-pedevia-event="click" data-pedevia-call="continueShopping">Voltar ao cardápio</button>`);return}
 h+=`<div>`+cart.map((i,n)=>{let p=cfg.products.find(x=>x.id===i.pid);return `<div class="cartItem"><div class="cartItemHead"><div><b>${esc(p?.name||'Produto')}</b><div class="cartItemMeta">${i.groups.map(g=>`<div>• ${esc(g.name)}: ${g.items.map(itemLabel).join(', ')}</div>`).join('')}${i.obs?`<div>• Obs.: ${esc(i.obs)}</div>`:''}</div></div><b>${brl(i.unit*i.qty)}</b></div><div class="cartQty"><button onclick="changeCartQty(${n},-1)">−</button><span class="num">${i.qty}</span><button onclick="changeCartQty(${n},1)">+</button><button class="cartRemove" onclick="removeCartItem(${n})">×</button></div></div>`}).join('')+`</div>`;
 h+=`<div class="cartTotals"><div class="row"><span>Valor dos produtos</span><b>${brl(sub)}</b></div><div class="row"><strong>Total</strong><strong>${brl(sub)}</strong></div></div><div class="cartActions"><button class="btn secondary full" data-pedevia-event="click" data-pedevia-call="continueShopping">Adicionar mais produtos</button><button class="btn full" data-pedevia-event="click" data-pedevia-call="beginCheckout">Finalizar pedido ›</button></div>`;
 showModal(h);
}
function beginCheckout(){window.checkoutState={mode:null,payment:null,address:'',neighborhood:'',customer:'',phone:'',note:'',table:''};showReceiveChoices()}
function showReceiveChoices(){
 let s=cfg.store,o=s.orderConfig||{},h=`<div class="row"><h2 class="checkoutTitle">Como deseja receber o pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">✕</button></div>`;
 if(s.modes.pickup)h+=`<button class="choiceTile" onclick="selectReceive('pickup')"><span class="bigIcon">🛍️</span><span><b>Retirar no estabelecimento</b><small>Aprox. ${o.pickupTime||40} mins</small></span></button>`;
 if(s.modes.dinein)h+=`<button class="choiceTile" onclick="selectReceive('dinein')"><span class="bigIcon">🍽️</span><span><b>Consumir no local</b><small>${o.dineinTableRequired?'Número da mesa obrigatório':'Informe a mesa se desejar'}</small></span></button>`;
 if(s.modes.delivery)h+=`<button class="choiceTile" onclick="selectReceive('delivery')"><span class="bigIcon">🚚</span><span><b>Receber por entrega</b><small>${esc(o.deliveryTime||'Entrega')}</small></span></button>`;
 showModal(h);
}
function selectReceive(m){window.checkoutState.mode=m;if(m==='delivery')showDeliveryForm();else if(m==='dinein')showDineinForm();else showPaymentChoices()}
function showDeliveryForm(){
 let o=cfg.store.orderConfig||{},mode=o.deliveryCalc==='neighborhood'?'neighborhood':'fixed';
 let ne=(o.neighborhoods||[]).filter(n=>n.enabled!==false);
 let opts=ne.map(n=>`<option value="${esc(n.name)}">${esc(n.name)} — ${brl(n.fee)}</option>`).join('');
 let bh=mode==='neighborhood'?`<label>Bairro *</label><select id="coNeigh" class="field" onchange="window.checkoutState.neighborhood=this.value">${opts}</select>`:'';
 showModal(`<div class="row"><h2 class="checkoutTitle">Endereço de entrega</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">‹</button></div>${bh}<label>Rua, número e complemento</label><input id="coAddr" class="field" placeholder="Ex.: Rua..., 136 - casa 2"><label>Referência</label><input id="coRef" class="field" placeholder="Ex.: ao lado de..."><div class="checkoutSticky"><button class="btn" data-pedevia-event="click" data-pedevia-call="saveDeliveryAndPay">Continuar</button></div>`);
 window.checkoutState.neighborhood=(mode==='neighborhood'&&ne.length)?ne[0].name:'';
}
function saveDeliveryAndPay(){
 let a=$('#coAddr')?.value.trim()||'';if(!a){alert('Informe o endereço de entrega.');return}
 let mode=cfg.store.orderConfig?.deliveryCalc==='neighborhood'?'neighborhood':'fixed';
 window.checkoutState.address=a+($('#coRef')?.value.trim()?' · '+$('#coRef').value.trim():'');
 window.checkoutState.neighborhood=mode==='neighborhood'?($('#coNeigh')?.value||''):'';
 showPaymentChoices()
}
function showDineinForm(){let req=!!cfg.store.orderConfig?.dineinTableRequired;showModal(`<div class="row"><h2 class="checkoutTitle">Consumo no local</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">‹</button></div><label>Número da mesa ${req?'*':'(opcional)'}</label><input id="coTable" class="field" inputmode="numeric"><div class="checkoutSticky"><button class="btn" onclick="saveDineinAndPay(${req})">Continuar</button></div>`)}
function saveDineinAndPay(req){let v=$('#coTable').value.trim();if(req&&!v){alert('Informe o número da mesa.');return}window.checkoutState.table=v;showPaymentChoices()}
function paymentKeyLabel(k){return ({pix:'Pix',cash:'Dinheiro',credit:'Crédito',debit:'Débito',foodVoucher:'Vale alimentação',mealVoucher:'Vale refeição'})[k]||k}
function paymentIcon(k){return ({pix:'❖',cash:'💵',credit:'💳',debit:'💳',foodVoucher:'🎫',mealVoucher:'🎫'})[k]||'💰'}
function showPaymentChoices(){
 let p=cfg.store.payments||{},m=cfg.store.orderConfig?.paymentMeta||{},keys=['pix','cash','credit','debit','foodVoucher','mealVoucher'].filter(k=>p[k]);
 let h=`<div class="row"><h2 class="checkoutTitle">Como deseja pagar</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">‹</button></div>`;
 h+=keys.map(k=>{let meta=m[k]||{},tag=meta.feeType==='fee'&&+meta.fee?`<span class="feeTag">Taxa: ${meta.fee}%</span>`:meta.feeType==='discount'&&+meta.fee?`<span class="feeTag">Desconto: ${meta.fee}%</span>`:'';return `<button class="choiceTile" onclick="selectPayment('${k}')"><span class="bigIcon">${paymentIcon(k)}</span><span><b>${paymentKeyLabel(k)}</b></span>${tag}</button>`}).join('');
 showModal(h);
}
function selectPayment(k){window.checkoutState.payment=k;showCustomerForm()}
function showCustomerForm(){
 let st=window.checkoutState,sub=cartSubtotal(),fee=cartDeliveryFee(),adj=paymentAdjustment(sub+fee),tot=sub+fee+adj;
 let h=`<div class="row"><h2 class="checkoutTitle">Finalizar pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showPaymentChoices">‹</button></div><div class="summary"><div class="row"><b>${cart.reduce((s,i)=>s+i.qty,0)} produto(s)</b><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">Ver itens</button></div><div class="row"><b>${st.mode==='delivery'?'Entrega':st.mode==='pickup'?'Retirada':'Consumo no local'}</b><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">Alterar</button></div></div><div class="cartTotals"><div class="row"><span>Valor dos produtos</span><b>${brl(sub)}</b></div>${fee?`<div class="row"><span>Taxa de entrega</span><b>${brl(fee)}</b></div>`:''}${adj?`<div class="row"><span>${adj>0?'Taxa':'Desconto'} de pagamento</span><b>${adj>0?'+ ':''}${brl(adj)}</b></div>`:''}<div class="row"><strong>Total</strong><strong>${brl(tot)}</strong></div></div><label>Forma de pagamento*</label><button class="choiceTile" data-pedevia-event="click" data-pedevia-call="showPaymentChoices"><span class="bigIcon">${paymentIcon(st.payment)}</span><span><b>${paymentKeyLabel(st.payment)}</b></span><span style="margin-left:auto;color:var(--p);font-weight:800">Alterar</span></button><div class="two"><div><label>Seu nome*</label><input id="coName" class="field" value="${esc(st.customer||'')}"></div><div><label>Celular* (WhatsApp)</label><input id="coPhone" class="field" inputmode="tel" value="${esc(st.phone||'')}"></div></div><label>Observações</label><textarea id="coObs" class="field" placeholder="Comentários ou instruções adicionais">${esc(st.note||'')}</textarea><div class="checkoutSticky"><button class="btn green" data-pedevia-event="click" data-pedevia-call="finishWhatsApp">☏ Enviar pelo WhatsApp</button></div>`;
 showModal(h);
}
function finishWhatsApp(){
 let st=window.checkoutState;st.customer=$('#coName').value.trim();st.phone=$('#coPhone').value.trim();st.note=$('#coObs').value.trim();if(!st.customer||!st.phone){alert('Informe seu nome e celular.');return}
 let sub=cartSubtotal(),fee=cartDeliveryFee(),adj=paymentAdjustment(sub+fee),total=sub+fee+adj,L=['🍧 *PEDIDO POINT DO AÇAÍ FRONTIN*',''];
 cart.forEach(i=>{let p=cfg.products.find(x=>x.id===i.pid);L.push(`*${i.qty}x ${p?.name||'Produto'}* — ${brl(i.unit*i.qty)}`);i.groups.forEach(g=>L.push(`${g.name}: ${g.items.map(x=>(x.qty&&x.qty>1?x.qty+'x ':'')+x.name).join(', ')}`));if(i.obs)L.push('Obs.: '+i.obs);L.push('')});
 L.push('Cliente: '+st.customer,'Celular: '+st.phone,'Tipo: '+(st.mode==='delivery'?'Entrega':st.mode==='pickup'?'Retirada':'Consumo no local'));
 if(st.mode==='delivery'){if(cfg.store.orderConfig?.deliveryCalc==='neighborhood'&&st.neighborhood)L.push('Bairro: '+st.neighborhood);L.push('Endereço: '+st.address);}if(st.mode==='dinein'&&st.table)L.push('Mesa: '+st.table);
 L.push('Pagamento: '+paymentKeyLabel(st.payment),'Subtotal: '+brl(sub));if(fee)L.push('Taxa de entrega: '+brl(fee));if(adj)L.push((adj>0?'Taxa':'Desconto')+' de pagamento: '+brl(adj));L.push('*TOTAL: '+brl(total)+'*');if(st.note)L.push('Observações: '+st.note);
 location.href='https://wa.me/'+cfg.store.whatsapp+'?text='+encodeURIComponent(L.join('\n'));
}



// ===== MODOS DE ATENDIMENTO POR PRODUTO =====
// Regra padrão do Point: todos os produtos = somente delivery; pote de 1 Litro = delivery + retirada + consumo local.
function isOneLiterProduct(p){
  return !!p && /(^|\s)1\s*(litro|l)(\s|$)/i.test(String(p.name||''));
}
function normalizeProductModes(){
  (cfg.products||[]).forEach(p=>{
    if(!p.allowedModes || typeof p.allowedModes!=='object'){
      p.allowedModes=isOneLiterProduct(p)
        ? {delivery:true,pickup:true,dinein:true}
        : {delivery:true,pickup:false,dinein:false};
    }else{
      p.allowedModes=Object.assign({delivery:true,pickup:false,dinein:false},p.allowedModes);
    }
  });
}
normalizeProductModes();

function productModesEditorHTML(p){
  let m=p.allowedModes||{delivery:true,pickup:false,dinein:false};
  return `<div class="sectionTitle">Formas de atendimento deste produto</div>
  <div class="subtle">Escolha como este produto pode ser recebido. As configurações gerais da loja continuam valendo como limite.</div>
  <div class="group">
    <label class="switchrow"><span><b>Delivery</b><small class="hint">Permitir entrega deste produto</small></span><input id="pmDelivery" type="checkbox" ${m.delivery?'checked':''}></label>
    <label class="switchrow"><span><b>Retirada no estabelecimento</b><small class="hint">Disponível somente quando este produto permitir</small></span><input id="pmPickup" type="checkbox" ${m.pickup?'checked':''}></label>
    <label class="switchrow"><span><b>Consumo no estabelecimento</b><small class="hint">Disponível somente quando este produto permitir</small></span><input id="pmDinein" type="checkbox" ${m.dinein?'checked':''}></label>
  </div>`;
}

// Sobrescreve o editor de produto para incluir as formas de atendimento.
function editProduct(id){let p=cfg.products.find(x=>x.id===id); if(!p)return;
  normalizeProductModes();
  showModal(`<div class="row"><h2>${p.name==='Novo produto'?'Adicionar produto':'Editar produto'}</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
  <div class="prodHero" id="prodPrev">${productImagePreview(p)}</div>
  <div class="prodImageActions"><label class="ghost" style="display:inline-block">📷 Escolher imagem<input id="prodFile" type="file" accept="image/*" hidden onchange="previewProductImage('${id}',this)"></label><button class="ghost" onclick="$('#epi').focus()">🔗 Usar URL</button></div>
  <label>Nome do produto *</label><input id="epn" class="field" value="${esc(p.name)}">
  <label>Descrição</label><textarea id="epd" class="field">${esc(p.desc)}</textarea>
  <label>Descrição detalhada</label><textarea id="epdetail" class="field" placeholder="Opcional">${esc(p.detailedDesc||'')}</textarea>
  <div class="two"><div><label>Preço (R$)</label><input id="epp" type="number" step=".01" class="field" value="${p.price}"></div><div><label>Seção do cardápio</label><select id="epc" class="field">${cfg.sections.map(s=>`<option value="${s.id}" ${s.id===p.category?'selected':''}>${esc(s.title)}</option>`).join('')}</select></div></div>
  <label>URL da imagem</label><input id="epi" class="field" value="${esc(p.image||'')}" placeholder="https://...">
  <label>Status</label><select id="eps" class="field"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select>
  ${productModesEditorHTML(p)}
  <div class="sectionTitle">Complementos e opcionais</div><div class="subtle">Os grupos abaixo aparecem ao cliente sempre que ele abrir este produto.</div>
  <div id="productGroupList">${productGroupsHTML(p)}</div><button class="ghost full" onclick="openAddGroupMenu('${p.id}')">＋ Adicionar grupo de complementos</button>
  <div class="stickySave"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" onclick="saveProduct('${p.id}')">Concluir</button></div>`);
  $('#eps').value=p.status;
}
function saveProduct(id){
  let p=cfg.products.find(x=>x.id===id);if(!p)return;
  p.name=$('#epn').value.trim()||'Produto';p.desc=$('#epd').value;p.detailedDesc=$('#epdetail').value;p.price=+$('#epp').value||0;p.category=$('#epc').value;
  p.image=p._pendingImage||$('#epi').value.trim();delete p._pendingImage;p.status=$('#eps').value;
  p.allowedModes={delivery:$('#pmDelivery').checked,pickup:$('#pmPickup').checked,dinein:$('#pmDinein').checked};
  if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein){alert('Escolha pelo menos uma forma de atendimento para este produto.');return}
  save();closeModal();renderAdmin();renderShop();
}
function newProduct(sectionId){
  let sid=sectionId||cfg.sections?.[0]?.id||cfg.categories?.[0]?.id||'acai';
  let standard=cfg.groups.filter(g=>['caldas','complementos','adicionais','talher'].includes(g.id)).map(g=>g.id);
  let p={id:'p'+Date.now(),category:sid,name:'Novo produto',desc:'',detailedDesc:'',price:0,status:'available',image:'',images:[],groups:standard,allowedModes:{delivery:true,pickup:false,dinein:false}};
  cfg.products.push(p);save();editProduct(p.id);
}

// Calcula os modos válidos para o carrinho inteiro. Se houver mistura, só ficam os modos permitidos por TODOS os itens.
function cartAllowedModes(){
  normalizeProductModes();
  let global=cfg.store.modes||{}, allowed={delivery:!!global.delivery,pickup:!!global.pickup,dinein:!!global.dinein};
  for(let item of cart){
    let p=cfg.products.find(x=>x.id===item.pid);if(!p)continue;
    let m=p.allowedModes||{delivery:true,pickup:false,dinein:false};
    allowed.delivery=allowed.delivery&&!!m.delivery;
    allowed.pickup=allowed.pickup&&!!m.pickup;
    allowed.dinein=allowed.dinein&&!!m.dinein;
  }
  return allowed;
}
function showReceiveChoices(){
  let s=cfg.store,o=s.orderConfig||{},a=cartAllowedModes(),h=`<div class="row"><h2 class="checkoutTitle">Como deseja receber o pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">✕</button></div>`;
  if(a.pickup)h+=`<button class="choiceTile" onclick="selectReceive('pickup')"><span class="bigIcon">🛍️</span><span><b>Retirar no estabelecimento</b><small>Aprox. ${o.pickupTime||40} mins</small></span></button>`;
  if(a.dinein)h+=`<button class="choiceTile" onclick="selectReceive('dinein')"><span class="bigIcon">🍽️</span><span><b>Consumir no local</b><small>${o.dineinTableRequired?'Número da mesa obrigatório':'Informe a mesa se desejar'}</small></span></button>`;
  if(a.delivery)h+=`<button class="choiceTile" onclick="selectReceive('delivery')"><span class="bigIcon">🚚</span><span><b>Receber por entrega</b><small>${esc(o.deliveryTime||'Entrega')}</small></span></button>`;
  if(!a.delivery&&!a.pickup&&!a.dinein)h+=`<div class="notice bad">Os produtos deste carrinho não possuem uma forma de atendimento em comum. Remova um item ou altere as formas de atendimento no painel.</div>`;
  if((a.delivery?1:0)+(a.pickup?1:0)+(a.dinein?1:0)===1){
    let only=a.delivery?'delivery':a.pickup?'pickup':'dinein';
    h+=`<div class="hint" style="margin-top:10px">Para os produtos deste carrinho, esta é a única forma de atendimento disponível.</div>`;
  }
  showModal(h);
}


// ===== FILTRO DE ATENDIMENTO NO CARDÁPIO =====
window.clientServiceMode=window.clientServiceMode||'delivery';

function serviceModeLabel(m){return m==='pickup'?'Retirada':m==='dinein'?'Consumo no local':'Delivery'}
function productAllowsMode(p,m){
  normalizeProductModes();
  let pm=p?.allowedModes||{delivery:true,pickup:false,dinein:false};
  return !!pm[m];
}
function serviceRestrictionMessage(m){
  return (m==='pickup'||m==='dinein')?'Para retirada ou consumo no local, aceitamos somente o pote de 1 litro.':'';
}
function renderClientServiceBar(){
  let top=document.getElementById('clientInfoTop'); if(!top)return;
  let old=document.getElementById('clientServiceBar'); if(old)old.remove();
  let s=cfg.store,m=window.clientServiceMode||'delivery';
  let bar=document.createElement('div');bar.id='clientServiceBar';bar.className='serviceModeBox';
  bar.innerHTML=`<div class="serviceModeTitle">Como você quer receber?</div><div class="serviceModeBtns">${s.modes.delivery?`<button class="${m==='delivery'?'on':''}" onclick="setClientServiceMode('delivery',true)">🚚 Delivery</button>`:''}${s.modes.pickup?`<button class="${m==='pickup'?'on':''}" onclick="setClientServiceMode('pickup',true)">🛍️ Retirada</button>`:''}${s.modes.dinein?`<button class="${m==='dinein'?'on':''}" onclick="setClientServiceMode('dinein',true)">🍽️ Consumo local</button>`:''}</div>${serviceRestrictionMessage(m)?`<div class="serviceModeHint">${serviceRestrictionMessage(m)}</div>`:''}`;
  top.insertAdjacentElement('afterend',bar);
}
function setClientServiceMode(mode,fromCatalog){
  if(!cfg.store.modes?.[mode])return;
  window.clientServiceMode=mode;
  window.checkoutState=window.checkoutState||{};
  window.checkoutState.mode=mode;
  let incompatible=cart.filter(i=>{let p=cfg.products.find(x=>x.id===i.pid);return p&&!productAllowsMode(p,mode)});
  if(incompatible.length){
    cart=cart.filter(i=>{let p=cfg.products.find(x=>x.id===i.pid);return p&&productAllowsMode(p,mode)});
    if(mode==='pickup'||mode==='dinein') alert('Para '+serviceModeLabel(mode).toLowerCase()+', aceitamos somente o pote de 1 litro. Os outros produtos foram retirados do carrinho.');
  }
  renderShop();updateCart();
  if(fromCatalog){window.scrollTo({top:Math.max(0,(document.getElementById('categoryTabs')?.offsetTop||0)-120),behavior:'smooth'});}
}

// Cardápio: produtos incompatíveis com o modo escolhido ficam esmaecidos e sem clique.
function renderShop(){
  let st=openState();renderClientStoreInfo();renderClientServiceBar();$('#storeStatus').textContent='● '+st.text;$('#closedNotice').innerHTML=st.open?'':'<div class="notice bad">A loja está fechada no momento. Você pode montar o pedido e consultar o cardápio.</div>';
  let secs=(Array.isArray(cfg.sections)?cfg.sections:[]).filter(s=>s.active!==false);if(!secs.length){repairSectionsEmergency();secs=cfg.sections.filter(s=>s.active!==false)}
  $('#categoryTabs').className='quickSections';$('#categoryTabs').innerHTML=secs.map(s=>`<button class="tab" onclick="document.getElementById('clientSec_${s.id}')?.scrollIntoView({behavior:'smooth'})">${esc(s.title)}</button>`).join('');
  let mode=window.clientServiceMode||'delivery';
  $('#productGrid').className='';$('#productGrid').innerHTML=secs.map(s=>{
    let ps=cfg.products.filter(p=>p.category===s.id&&p.status!=='hidden'),compact=s.display.startsWith('compact'),noimg=s.display.endsWith('no-images');
    return `<section class="clientSection ${compact?'sectionCompact':''} ${noimg?'sectionNoImages':''}" id="clientSec_${s.id}"><div class="clientSectionHead" style="border-top:5px solid ${esc(s.accent||'#712489')}"><h2>${esc(s.title)}</h2>${s.description?`<p>${esc(s.description)}</p>`:''}</div><div class="grid">${ps.map(p=>{let compat=productAllowsMode(p,mode),available=p.status==='available'&&compat;return `<article class="card ${compat?'':'modeDisabled'}" ${available?`data-pedevia-open-product="${p.id}"`:''}>${noimg?'':`<div class="photo" ${p.image?`style="background-image:url('${esc(p.image)}')"`:''}>${p.image?'':'🍧'}</div>`}<div class="cardbody"><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p><div class="row"><span class="price">${brl(p.price)}</span>${!compat?`<span class="badge unavailable">Somente delivery</span>`:p.status==='unavailable'?'<span class="badge unavailable">Indisponível</span>':''}</div>${!compat?`<div class="modeDisabledNote">Para ${mode==='pickup'?'retirada':'consumo no local'}, aceitamos somente o pote de 1 litro.</div>`:''}</div></article>`}).join('')||'<div class="emptySection">Nenhum produto disponível nesta seção.</div>'}</div></section>`;
  }).join('');updateCart();
}

// Checkout: exibe sempre os modos habilitados e explica a regra do pote de 1 litro.
function showReceiveChoices(){
  let s=cfg.store,o=s.orderConfig||{},h=`<div class="row"><h2 class="checkoutTitle">Como deseja receber o pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">✕</button></div>`;
  if(s.modes.pickup)h+=`<button class="choiceTile" onclick="selectReceive('pickup')"><span class="bigIcon">🛍️</span><span><b>Retirar no estabelecimento</b><small>Aprox. ${o.pickupTime||40} mins</small><small class="modeRuleSmall">Para esta opção, aceitamos somente pote de 1 litro.</small></span></button>`;
  if(s.modes.dinein)h+=`<button class="choiceTile" onclick="selectReceive('dinein')"><span class="bigIcon">🍽️</span><span><b>Consumir no local</b><small>${o.dineinTableRequired?'Número da mesa obrigatório':'Informe a mesa se desejar'}</small><small class="modeRuleSmall">Para esta opção, aceitamos somente pote de 1 litro.</small></span></button>`;
  if(s.modes.delivery)h+=`<button class="choiceTile" onclick="selectReceive('delivery')"><span class="bigIcon">🚚</span><span><b>Receber por entrega</b><small>${esc(o.deliveryTime||'Entrega')}</small></span></button>`;
  showModal(h);
}
function selectReceive(m){
  let incompatible=cart.filter(i=>{let p=cfg.products.find(x=>x.id===i.pid);return p&&!productAllowsMode(p,m)});
  window.clientServiceMode=m;window.checkoutState=window.checkoutState||{};window.checkoutState.mode=m;
  if(incompatible.length){
    cart=cart.filter(i=>{let p=cfg.products.find(x=>x.id===i.pid);return p&&productAllowsMode(p,m)});
    renderShop();updateCart();closeModal();
    alert('Para '+serviceModeLabel(m).toLowerCase()+', aceitamos somente o pote de 1 litro. Os outros produtos foram retirados do carrinho e ficaram indisponíveis no cardápio.');
    return;
  }
  renderShop();
  if(m==='delivery')showDeliveryForm();else if(m==='dinein')showDineinForm();else showPaymentChoices();
}

// estilos da seleção de atendimento e do esmaecimento
(function(){let st=document.createElement('style');st.textContent=`
.serviceModeBox{background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px;margin:10px 0 12px;box-shadow:0 5px 18px #3e214f10}.serviceModeTitle{font-weight:850;margin-bottom:9px}.serviceModeBtns{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.serviceModeBtns button{border:1px solid var(--line);background:#f6f3f7;border-radius:12px;padding:10px 6px;font-weight:750;font-size:13px}.serviceModeBtns button.on{background:#efe0f4;border-color:var(--p);color:var(--p)}.serviceModeHint{font-size:12px;color:#8a647f;margin-top:9px;line-height:1.35}.card.modeDisabled{opacity:.38;filter:grayscale(.35);cursor:not-allowed;pointer-events:none}.modeDisabledNote{font-size:11px;color:#7c7480;margin-top:7px;line-height:1.3}.modeRuleSmall{color:#8a647f!important;font-weight:700;margin-top:6px!important}.choiceTile .modeRuleSmall{max-width:420px}@media(max-width:520px){.serviceModeBtns{grid-template-columns:1fr}.serviceModeBtns button{padding:9px}.serviceModeBox{margin-top:8px}}
`;document.head.appendChild(st)})();



// ===== PRODUTOS COM TAMANHOS / VARIAÇÕES (ex.: sabores de sorvete) =====
function hasVariants(p){return Array.isArray(p?.variants)&&p.variants.length>0}
function normalizeVariant(v){
  v.id=v.id||('v'+Date.now()+Math.random().toString(36).slice(2,6));
  v.name=v.name||'Tamanho'; v.price=+v.price||0; v.status=v.status||'available';
  v.allowedModes=v.allowedModes||{delivery:true,pickup:false,dinein:false};
  return v;
}
function variantAllowsMode(v,m){normalizeVariant(v);return !!v.allowedModes?.[m]&&v.status!=='hidden'}
function productAllowsMode(p,m){
  normalizeProductModes();
  if(hasVariants(p)) return p.variants.some(v=>variantAllowsMode(v,m));
  let pm=p?.allowedModes||{delivery:true,pickup:false,dinein:false};
  return !!pm[m];
}
function productDisplayPrice(p){
  if(hasVariants(p)){
    let vals=p.variants.filter(v=>v.status==='available').map(v=>+v.price||0);
    return vals.length?`A partir de ${brl(Math.min(...vals))}`:'Escolha o tamanho';
  }
  return brl(+p.price||0);
}
function defaultSizeVariants(){return [
  {id:'v300_'+Date.now(),name:'300 ml',price:0,status:'available',allowedModes:{delivery:true,pickup:false,dinein:false}},
  {id:'v400_'+Date.now(),name:'400 ml',price:0,status:'available',allowedModes:{delivery:true,pickup:false,dinein:false}},
  {id:'v500_'+Date.now(),name:'500 ml',price:0,status:'available',allowedModes:{delivery:true,pickup:false,dinein:false}},
  {id:'v770_'+Date.now(),name:'770 ml',price:0,status:'available',allowedModes:{delivery:true,pickup:false,dinein:false}},
  {id:'v1l_'+Date.now(),name:'1 Litro',price:0,status:'available',allowedModes:{delivery:true,pickup:true,dinein:true}}
]}
function variantsEditorHTML(p){
  let on=hasVariants(p);
  return `<div class="sectionTitle">Tamanhos / variações</div>
  <label class="switchrow"><span><b>Este produto possui tamanhos</b><small class="hint">Ideal para sabores de sorvete. O sabor aparece no cardápio e o tamanho é escolhido ao abrir.</small></span><input id="pvEnabled" type="checkbox" ${on?'checked':''} onchange="toggleVariantsEditor('${p.id}',this.checked)"></label>
  <div id="variantEditor" class="${on?'':'hide'}">${variantRowsHTML(p)}<button class="ghost full" data-pedevia-event="click" data-pedevia-call="addVariantRow">＋ Adicionar tamanho</button><div class="hint" style="margin-top:8px">Para retirada ou consumo no local, marque apenas o tamanho de 1 Litro. Os demais continuarão disponíveis para delivery.</div></div>`;
}
function variantRowsHTML(p){let a=hasVariants(p)?p.variants:defaultSizeVariants(); if(!hasVariants(p))p._draftVariants=a; return a.map(variantRowHTML).join('')}
function variantRowHTML(v){normalizeVariant(v);return `<div class="variantAdminRow" data-vid="${esc(v.id)}"><div class="two"><div><label>Tamanho</label><input class="field vvName" value="${esc(v.name)}"></div><div><label>Preço (R$)</label><input class="field vvPrice" type="number" step=".01" value="${v.price}"></div></div><div class="variantModeChecks"><label><input class="vvDelivery" type="checkbox" ${v.allowedModes.delivery?'checked':''}> Delivery</label><label><input class="vvPickup" type="checkbox" ${v.allowedModes.pickup?'checked':''}> Retirada</label><label><input class="vvDinein" type="checkbox" ${v.allowedModes.dinein?'checked':''}> Consumo local</label><button class="dangerBtn" type="button" onclick="this.closest('.variantAdminRow').remove()">Remover</button></div></div>`}
function toggleVariantsEditor(pid,on){let p=cfg.products.find(x=>x.id===pid),box=$('#variantEditor');if(!box)return;if(on){if(!hasVariants(p)&&!p._draftVariants)p._draftVariants=defaultSizeVariants();box.classList.remove('hide');box.innerHTML=(p._draftVariants||p.variants||defaultSizeVariants()).map(variantRowHTML).join('')+'<button class="ghost full" data-pedevia-event="click" data-pedevia-call="addVariantRow">＋ Adicionar tamanho</button><div class="hint" style="margin-top:8px">Para retirada ou consumo no local, marque apenas o tamanho de 1 Litro. Os demais continuarão disponíveis para delivery.</div>'}else box.classList.add('hide')}
function addVariantRow(){let box=$('#variantEditor');if(!box)return;let btn=box.querySelector('button.ghost.full');let d=document.createElement('div');d.innerHTML=variantRowHTML({id:'v'+Date.now(),name:'Novo tamanho',price:0,status:'available',allowedModes:{delivery:true,pickup:false,dinein:false}});box.insertBefore(d.firstElementChild,btn)}
function collectVariantsFromEditor(){
  if(!$('#pvEnabled')?.checked)return [];
  return $$('.variantAdminRow').map(r=>({id:r.dataset.vid||('v'+Date.now()),name:r.querySelector('.vvName').value.trim()||'Tamanho',price:+r.querySelector('.vvPrice').value||0,status:'available',allowedModes:{delivery:r.querySelector('.vvDelivery').checked,pickup:r.querySelector('.vvPickup').checked,dinein:r.querySelector('.vvDinein').checked}}));
}

// Editor de produto com suporte a "sabor principal" + tamanhos internos.
function editProduct(id){let p=cfg.products.find(x=>x.id===id); if(!p)return; normalizeProductModes();
  showModal(`<div class="row"><h2>${p.name==='Novo produto'?'Adicionar produto':'Editar produto'}</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>
  <div class="prodHero" id="prodPrev">${productImagePreview(p)}</div>
  <div class="prodImageActions"><label class="ghost" style="display:inline-block">📷 Escolher imagem<input id="prodFile" type="file" accept="image/*" hidden onchange="previewProductImage('${id}',this)"></label><button class="ghost" onclick="$('#epi').focus()">🔗 Usar URL</button></div>
  <label>Nome do produto *</label><input id="epn" class="field" value="${esc(p.name)}">
  <label>Descrição</label><textarea id="epd" class="field">${esc(p.desc||'')}</textarea>
  <label>Descrição detalhada</label><textarea id="epdetail" class="field" placeholder="Opcional">${esc(p.detailedDesc||'')}</textarea>
  <div class="two"><div><label>Preço base (R$)</label><input id="epp" type="number" step=".01" class="field" value="${p.price||0}"><small class="hint">Ignorado quando houver tamanhos.</small></div><div><label>Seção do cardápio</label><select id="epc" class="field">${cfg.sections.map(s=>`<option value="${s.id}" ${s.id===p.category?'selected':''}>${esc(s.title)}</option>`).join('')}</select></div></div>
  <label>URL da imagem</label><input id="epi" class="field" value="${esc(p.image||'')}" placeholder="https://...">
  <label>Status</label><select id="eps" class="field"><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="hidden">Oculto</option></select>
  ${variantsEditorHTML(p)}
  <div id="simpleProductModes" class="${hasVariants(p)?'hide':''}">${productModesEditorHTML(p)}</div>
  <div class="sectionTitle">Complementos e opcionais</div><div class="subtle">Os grupos abaixo aparecem depois que o cliente escolher o tamanho.</div>
  <div id="productGroupList">${productGroupsHTML(p)}</div><button class="ghost full" onclick="openAddGroupMenu('${p.id}')">＋ Adicionar grupo de complementos</button>
  <div class="stickySave"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Cancelar</button><button class="btn" onclick="saveProduct('${p.id}')">Concluir</button></div>`); $('#eps').value=p.status;
  $('#pvEnabled')?.addEventListener('change',e=>$('#simpleProductModes')?.classList.toggle('hide',e.target.checked));
}
function saveProduct(id){let p=cfg.products.find(x=>x.id===id);if(!p)return;
  p.name=$('#epn').value.trim()||'Produto';p.desc=$('#epd').value;p.detailedDesc=$('#epdetail').value;p.price=+$('#epp').value||0;p.category=$('#epc').value;p.image=p._pendingImage||$('#epi').value.trim();delete p._pendingImage;p.status=$('#eps').value;
  p.variants=collectVariantsFromEditor(); delete p._draftVariants;
  if(!hasVariants(p)){
    p.allowedModes={delivery:$('#pmDelivery')?.checked??true,pickup:$('#pmPickup')?.checked??false,dinein:$('#pmDinein')?.checked??false};
    if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein){alert('Escolha pelo menos uma forma de atendimento para este produto.');return}
  }else{
    if(!p.variants.length){alert('Adicione pelo menos um tamanho.');return}
    if(p.variants.some(v=>!v.allowedModes.delivery&&!v.allowedModes.pickup&&!v.allowedModes.dinein)){alert('Cada tamanho precisa ter pelo menos uma forma de atendimento.');return}
  }
  save();closeModal();renderAdmin();renderShop();
}

function selectedVariant(){let id=document.querySelector('input[name="productVariant"]:checked')?.value;return window.currentProductVariants?.find(v=>v.id===id)||null}
function handleVariantChange(){let v=selectedVariant();let btn=document.querySelector('.addPriceBtn');if(btn&&v){btn.dataset.base=+v.price||0;let lab=document.querySelector('.selectedVariantPrice');if(lab)lab.textContent=brl(v.price);updateProductLiveTotal()}}
function variantChoiceHTML(v,mode){let ok=v.status==='available'&&variantAllowsMode(v,mode);return `<label class="variantChoice ${ok?'':'variantDisabled'}"><span><b>${esc(v.name)}</b><small>${ok?brl(v.price):(mode==='delivery'?'Indisponível':'Somente delivery')}</small></span><input type="radio" name="productVariant" value="${esc(v.id)}" ${ok?'':'disabled'} data-pedevia-event="change" data-pedevia-call="handleVariantChange"></label>`}

function openProduct(id){
  let p=cfg.products.find(x=>x.id===id); if(!p)return; let mode=window.clientServiceMode||'delivery';
  if(!productAllowsMode(p,mode)){return}
  let vars=hasVariants(p)?p.variants.map(normalizeVariant):[]; window.currentProductVariants=vars;
  let firstVar=vars.find(v=>v.status==='available'&&variantAllowsMode(v,mode));
  let base=firstVar?+firstVar.price||0:+p.price||0;
  let h=`<div class="row"><div><h2 style="margin:0">${esc(p.name)}</h2>${hasVariants(p)?'<span class="price selectedVariantPrice">Escolha o tamanho</span>':`<span class="price">${brl(p.price)}</span>`}</div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p>${esc(p.desc||'')}</p>${p.detailedDesc?`<p class="hint">${esc(p.detailedDesc)}</p>`:''}`;
  if(hasVariants(p)) h+=`<div class="group variantGroup"><div class="groupTitle">Escolha o tamanho</div><div class="hint">${(mode==='pickup'||mode==='dinein')?'Para esta modalidade, aceitamos somente pote de 1 litro.':'Escolha o tamanho desejado.'}</div>${vars.map(v=>variantChoiceHTML(v,mode)).join('')}</div>`;
  (p.groups||[]).forEach(gid=>{let g=cfg.groups.find(x=>x.id===gid);if(!g)return;let os=(g.options||[]).filter(o=>o.status==='available');if(!os.length)return;let r=effectiveGroupRules(g),maxAttr=Number.isFinite(r.max)?r.max:'inf';h+=`<div class="group choiceGroup" data-gid="${g.id}" data-mode="${r.mode}" data-min="${r.min}" data-max="${maxAttr}"><div class="groupTitle">${esc(g.name)} ${r.required?'<span class="tinyTag">Obrigatório</span>':'<span class="tinyTag">Opcional</span>'}</div><div class="hint">${clientRuleText(g)}</div>`;if(r.mode==='quantity')h+=os.map(o=>quantityOptionRow(g,o)).join('');else{let type=r.mode==='single'?'radio':'checkbox';h+=os.map(o=>`<label class="option optionCard"><span><b>${esc(o.name)}</b>${o.desc?`<small class="hint">${esc(o.desc)}</small>`:''}${o.price?`<span class="optionPrice">+ ${brl(o.price)}</span>`:'<span class="optionPrice">Grátis</span>'}</span><input type="${type}" name="g_${g.id}" value="${o.id}" onchange="handleChoiceChange(this)"></label>`).join('')}h+='</div>'});
  h+=`<label>Observação</label><textarea id="itemObs" class="field" placeholder="Ex.: sem granola"></textarea><div class="productFooter"><div class="productQty"><button onclick="qty(-1)">−</button><b id="qty">1</b><button onclick="qty(1)">+</button></div><button class="btn addPriceBtn" data-base="${base}" onclick="addCart('${p.id}')">Adicionar • <span class="liveTotal">${brl(base)}</span></button></div>`;
  showModal(h);setTimeout(()=>{refreshAllGroupLimits();if(firstVar){let i=document.querySelector(`input[name="productVariant"][value="${CSS.escape(firstVar.id)}"]`);if(i){i.checked=true;handleVariantChange()}}},0);
}
function addCart(pid){
  let p=cfg.products.find(x=>x.id===pid);if(!p)return;let variant=hasVariants(p)?selectedVariant():null;if(hasVariants(p)&&!variant){alert('Escolha o tamanho.');return}
  let groups=[],extra=0;for(let box of $$('.choiceGroup')){let g=cfg.groups.find(x=>x.id===box.dataset.gid);if(!g)continue;let mode=box.dataset.mode,min=+box.dataset.min,items=[];if(mode==='quantity'){let total=0;for(let row of $$('.qtyOption',box)){let q=+row.querySelector('.optQtyValue').textContent||0;if(!q)continue;let o=g.options.find(x=>x.id===row.dataset.oid);if(!o)continue;total+=q;extra+=(+o.price||0)*q;items.push({name:o.name,price:+o.price||0,qty:q})}if(total<min){focusRequiredGroupV1162(box,g);return}}else{let sel=$$('input:checked',box);if(sel.length<min){focusRequiredGroupV1162(box,g);return}items=sel.map(i=>{let o=g.options.find(x=>x.id===i.value);return o?{name:o.name,price:+o.price||0,qty:1}:null}).filter(Boolean);items.forEach(o=>extra+=o.price)}if(items.length)groups.push({name:g.name,items})}
  let base=variant?+variant.price||0:+p.price||0;cart.push({pid,variantId:variant?.id||null,variantName:variant?.name||'',qty:+$('#qty').textContent,unit:base+extra,groups,obs:$('#itemObs').value});closeModal();updateCart();renderShop();
}

function cartItemAllowsMode(item,m){let p=cfg.products.find(x=>x.id===item.pid);if(!p)return false;if(hasVariants(p)&&item.variantId){let v=p.variants.find(x=>x.id===item.variantId);return !!v&&variantAllowsMode(v,m)}return productAllowsMode(p,m)}
function cartAllowedModes(){let global=cfg.store.modes||{},allowed={delivery:!!global.delivery,pickup:!!global.pickup,dinein:!!global.dinein};for(let item of cart){allowed.delivery=allowed.delivery&&cartItemAllowsMode(item,'delivery');allowed.pickup=allowed.pickup&&cartItemAllowsMode(item,'pickup');allowed.dinein=allowed.dinein&&cartItemAllowsMode(item,'dinein')}return allowed}
function setClientServiceMode(mode,fromCatalog){if(!cfg.store.modes?.[mode])return;window.clientServiceMode=mode;window.checkoutState=window.checkoutState||{};window.checkoutState.mode=mode;let incompatible=cart.filter(i=>!cartItemAllowsMode(i,mode));if(incompatible.length){cart=cart.filter(i=>cartItemAllowsMode(i,mode));if(mode==='pickup'||mode==='dinein')alert('Para '+serviceModeLabel(mode).toLowerCase()+', mantivemos apenas os itens/tamanhos compatíveis. Para sorvetes, o sabor continua disponível e somente o tamanho de 1 litro pode ser escolhido.')}renderShop();updateCart();if(fromCatalog)window.scrollTo({top:Math.max(0,(document.getElementById('categoryTabs')?.offsetTop||0)-120),behavior:'smooth'})}

function renderShop(){
  let st=openState();renderClientStoreInfo();renderClientServiceBar();$('#storeStatus').textContent='● '+st.text;$('#closedNotice').innerHTML=st.open?'':'<div class="notice bad">A loja está fechada no momento. Você pode montar o pedido e consultar o cardápio.</div>';
  let secs=(Array.isArray(cfg.sections)?cfg.sections:[]).filter(s=>s.active!==false);if(!secs.length){repairSectionsEmergency();secs=cfg.sections.filter(s=>s.active!==false)}
  $('#categoryTabs').className='quickSections';$('#categoryTabs').innerHTML=secs.map(s=>`<button class="tab" onclick="document.getElementById('clientSec_${s.id}')?.scrollIntoView({behavior:'smooth'})">${esc(s.title)}</button>`).join('');
  let mode=window.clientServiceMode||'delivery';
  $('#productGrid').className='';$('#productGrid').innerHTML=secs.map(s=>{let ps=cfg.products.filter(p=>p.category===s.id&&p.status!=='hidden'),compact=s.display.startsWith('compact'),noimg=s.display.endsWith('no-images');return `<section class="clientSection ${compact?'sectionCompact':''} ${noimg?'sectionNoImages':''}" id="clientSec_${s.id}"><div class="clientSectionHead" style="border-top:5px solid ${esc(s.accent||'#712489')}"><h2>${esc(s.title)}</h2>${s.description?`<p>${esc(s.description)}</p>`:''}</div><div class="grid">${ps.map(p=>{let compat=productAllowsMode(p,mode),available=p.status==='available'&&compat,variantParent=hasVariants(p);return `<article class="card ${compat?'':'modeDisabled'}" ${available?`data-pedevia-open-product="${p.id}"`:''}>${noimg?'':`<div class="photo" ${p.image?`style="background-image:url('${esc(p.image)}')"`:''}>${p.image?'':'🍧'}</div>`}<div class="cardbody"><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p><div class="row"><span class="price">${variantParent?(mode==='pickup'||mode==='dinein'?'Escolha o sabor':'Escolha o tamanho'):brl(p.price)}</span>${!compat?`<span class="badge unavailable">Indisponível</span>`:p.status==='unavailable'?'<span class="badge unavailable">Indisponível</span>':''}</div>${variantParent&&compat&&(mode==='pickup'||mode==='dinein')?`<div class="modeDisabledNote">Sabor disponível. Dentro dele, somente 1 Litro ficará liberado.</div>`:!compat?`<div class="modeDisabledNote">Não disponível para ${mode==='pickup'?'retirada':'consumo no local'}.</div>`:''}</div></article>`}).join('')||'<div class="emptySection">Nenhum produto disponível nesta seção.</div>'}</div></section>`}).join('');updateCart();
}

// Carrinho e WhatsApp mostram também o tamanho escolhido.
function showCart(){let h=`<div class="row"><div><h2 style="margin:0">Seu pedido</h2><div class="hint">Adicione mais produtos ou finalize quando quiser.</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>`;if(!cart.length){showModal(h+'<div class="emptySection">Seu carrinho está vazio.</div><button class="btn full" data-pedevia-event="click" data-pedevia-call="closeModal">Voltar ao cardápio</button>');return}h+=`<div>`+cart.map((i,n)=>{let p=cfg.products.find(x=>x.id===i.pid);return `<div class="cartItem"><div class="cartItemHead"><div><b>${esc(p?.name||'Produto')}${i.variantName?` · ${esc(i.variantName)}`:''}</b><div class="cartItemMeta">${i.groups.map(g=>`<div>• ${esc(g.name)}: ${g.items.map(itemLabel).join(', ')}</div>`).join('')}${i.obs?`<div>• Obs.: ${esc(i.obs)}</div>`:''}</div></div><b>${brl(i.unit*i.qty)}</b></div><div class="cartQty"><button onclick="changeCartQty(${n},-1)">−</button><span class="num">${i.qty}</span><button onclick="changeCartQty(${n},1)">+</button><button class="cartRemove" onclick="removeCartItem(${n})">×</button></div></div>`}).join('')+`</div><div class="cartTotals"><div class="row"><span>Valor dos produtos</span><b>${brl(sum())}</b></div></div><div class="cartActions"><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">Adicionar mais produtos</button><button class="btn" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">Finalizar pedido ›</button></div>`;showModal(h)}

// Substitui o texto antigo da regra por uma explicação que também cobre sabores de sorvete.
function serviceRestrictionMessage(m){return (m==='pickup'||m==='dinein')?'Para retirada ou consumo no local, aceitamos somente pote de 1 litro. Nos sorvetes, escolha primeiro o sabor e depois o tamanho de 1 litro.':''}

(function(){let st=document.createElement('style');st.textContent=`
.variantAdminRow{border:1px solid var(--line);background:#faf8fb;border-radius:15px;padding:12px;margin:10px 0}.variantModeChecks{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:13px}.variantModeChecks label{display:flex;align-items:center;gap:5px}.variantModeChecks .dangerBtn{margin-left:auto}.variantGroup{margin-top:14px}.variantChoice{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:14px;padding:13px;margin:8px 0;background:#fff}.variantChoice span{display:flex;flex-direction:column;gap:3px}.variantChoice small{color:var(--muted)}.variantChoice input{width:22px;height:22px;accent-color:var(--p)}.variantChoice.variantDisabled{opacity:.36;background:#f2f0f2;pointer-events:none}.variantChoice:not(.variantDisabled):has(input:checked){border-color:var(--p);background:#f4e8f7}.cartActions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.cartActions button{min-height:52px}@media(max-width:520px){.variantModeChecks{align-items:flex-start}.cartActions{grid-template-columns:1fr}}
`;document.head.appendChild(st)})();


// ===== FLUXO DE ATENDIMENTO DEFINIDO PELO CARRINHO =====
// O cliente escolhe Delivery / Retirada / Consumo local somente ao finalizar.
// As opções exibidas são a interseção das modalidades permitidas por TODOS os itens/tamanhos do carrinho.
function removeClientServiceBar(){let b=document.getElementById('clientServiceBar');if(b)b.remove()}

function variantChoiceHTML(v){
  normalizeVariant(v);
  let ok=v.status==='available';
  let labels=[];
  if(v.allowedModes?.delivery)labels.push('Delivery');
  if(v.allowedModes?.pickup)labels.push('Retirada');
  if(v.allowedModes?.dinein)labels.push('Consumo local');
  return `<label class="variantChoice ${ok?'':'variantDisabled'}"><span><b>${esc(v.name)}</b><small>${brl(v.price)}</small>${labels.length?`<small class="modeAvailability">${labels.join(' · ')}</small>`:''}</span><input type="radio" name="productVariant" value="${esc(v.id)}" ${ok?'':'disabled'} data-pedevia-event="change" data-pedevia-call="handleVariantChange"></label>`;
}

function renderShop(){
  let st=openState();renderClientStoreInfo();removeClientServiceBar();
  $('#storeStatus').textContent='● '+st.text;
  $('#closedNotice').innerHTML=st.open?'':'<div class="notice bad">A loja está fechada no momento. Você pode montar o pedido e consultar o cardápio.</div>';
  let secs=(Array.isArray(cfg.sections)?cfg.sections:[]).filter(s=>s.active!==false);
  if(!secs.length){repairSectionsEmergency();secs=cfg.sections.filter(s=>s.active!==false)}
  $('#categoryTabs').className='quickSections';
  $('#categoryTabs').innerHTML=secs.map(s=>`<button class="tab" onclick="document.getElementById('clientSec_${s.id}')?.scrollIntoView({behavior:'smooth'})">${esc(s.title)}</button>`).join('');
  $('#productGrid').className='';
  $('#productGrid').innerHTML=secs.map(s=>{
    let ps=cfg.products.filter(p=>p.category===s.id&&p.status!=='hidden'),compact=s.display.startsWith('compact'),noimg=s.display.endsWith('no-images');
    return `<section class="clientSection ${compact?'sectionCompact':''} ${noimg?'sectionNoImages':''}" id="clientSec_${s.id}"><div class="clientSectionHead" style="border-top:5px solid ${esc(s.accent||'#712489')}"><h2>${esc(s.title)}</h2>${s.description?`<p>${esc(s.description)}</p>`:''}</div><div class="grid">${ps.map(p=>{let available=p.status==='available',variantParent=hasVariants(p);return `<article class="card" ${available?`data-pedevia-open-product="${p.id}"`:''}>${noimg?'':`<div class="photo" ${p.image?`style="background-image:url('${esc(p.image)}')"`:''}>${p.image?'':'🍧'}</div>`}<div class="cardbody"><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p>${variantParent?`${p.status==='unavailable'?'<div class="row"><span class="badge unavailable">Indisponível</span></div>':''}`:`<div class="row"><span class="price">${brl(p.price)}</span>${p.status==='unavailable'?'<span class="badge unavailable">Indisponível</span>':''}</div>`}</div></article>`}).join('')||'<div class="emptySection">Nenhum produto disponível nesta seção.</div>'}</div></section>`;
  }).join('');
  updateCart();
}

function openProduct(id){
  let p=cfg.products.find(x=>x.id===id);if(!p||p.status!=='available')return;
  let vars=hasVariants(p)?p.variants.map(normalizeVariant):[];window.currentProductVariants=vars;
  let firstVar=vars.find(v=>v.status==='available');
  let base=firstVar?+firstVar.price||0:+p.price||0;
  let h=`<div class="row"><div><h2 style="margin:0">${esc(p.name)}</h2>${hasVariants(p)?'<span class="price selectedVariantPrice">Escolha o tamanho</span>':`<span class="price">${brl(p.price)}</span>`}</div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><p>${esc(p.desc||'')}</p>${p.detailedDesc?`<p class="hint">${esc(p.detailedDesc)}</p>`:''}`;
  if(hasVariants(p))h+=`<div class="group variantGroup"><div class="groupTitle">Escolha o tamanho</div><div class="hint">A forma de recebimento será escolhida ao finalizar o pedido e dependerá dos tamanhos adicionados ao carrinho.</div>${vars.map(v=>variantChoiceHTML(v)).join('')}</div>`;
  (p.groups||[]).forEach(gid=>{let g=cfg.groups.find(x=>x.id===gid);if(!g)return;let os=(g.options||[]).filter(o=>o.status==='available');if(!os.length)return;let r=effectiveGroupRules(g),maxAttr=Number.isFinite(r.max)?r.max:'inf';h+=`<div class="group choiceGroup" data-gid="${g.id}" data-mode="${r.mode}" data-min="${r.min}" data-max="${maxAttr}"><div class="groupTitle">${esc(g.name)} ${r.required?'<span class="tinyTag">Obrigatório</span>':'<span class="tinyTag">Opcional</span>'}</div><div class="hint">${clientRuleText(g)}</div>`;if(r.mode==='quantity')h+=os.map(o=>quantityOptionRow(g,o)).join('');else{let type=r.mode==='single'?'radio':'checkbox';h+=os.map(o=>`<label class="option optionCard"><span><b>${esc(o.name)}</b>${o.desc?`<small class="hint">${esc(o.desc)}</small>`:''}${o.price?`<span class="optionPrice">+ ${brl(o.price)}</span>`:'<span class="optionPrice">Grátis</span>'}</span><input type="${type}" name="g_${g.id}" value="${o.id}" onchange="handleChoiceChange(this)"></label>`).join('')}h+='</div>'});
  h+=`<label>Observação</label><textarea id="itemObs" class="field" placeholder="Ex.: sem granola"></textarea><div class="productFooter"><div class="productQty"><button onclick="qty(-1)">−</button><b id="qty">1</b><button onclick="qty(1)">+</button></div><button class="btn addPriceBtn" data-base="${base}" onclick="addCart('${p.id}')">Adicionar • <span class="liveTotal">${brl(base)}</span></button></div>`;
  showModal(h);setTimeout(()=>{refreshAllGroupLimits();if(firstVar){let i=document.querySelector(`input[name="productVariant"][value="${CSS.escape(firstVar.id)}"]`);if(i){i.checked=true;handleVariantChange()}}},0);
}

function cartAllowedModes(){
  let global=cfg.store.modes||{},a={delivery:!!global.delivery,pickup:!!global.pickup,dinein:!!global.dinein};
  if(!cart.length)return a;
  for(let item of cart){
    a.delivery=a.delivery&&cartItemAllowsMode(item,'delivery');
    a.pickup=a.pickup&&cartItemAllowsMode(item,'pickup');
    a.dinein=a.dinein&&cartItemAllowsMode(item,'dinein');
  }
  return a;
}

function showReceiveChoices(){
  let s=cfg.store,o=s.orderConfig||{},a=cartAllowedModes();
  let h=`<div class="row"><h2 class="checkoutTitle">Como deseja receber o pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">✕</button></div>`;
  if(a.pickup)h+=`<button class="choiceTile" onclick="selectReceive('pickup')"><span class="bigIcon">🛍️</span><span><b>Retirar no estabelecimento</b><small>Aprox. ${o.pickupTime||40} mins</small></span></button>`;
  if(a.dinein)h+=`<button class="choiceTile" onclick="selectReceive('dinein')"><span class="bigIcon">🍽️</span><span><b>Consumir no local</b><small>${o.dineinTableRequired?'Número da mesa obrigatório':'Informe a mesa se desejar'}</small></span></button>`;
  if(a.delivery)h+=`<button class="choiceTile" onclick="selectReceive('delivery')"><span class="bigIcon">🚚</span><span><b>Receber por entrega</b><small>${esc(o.deliveryTime||'Entrega')}</small></span></button>`;
  let onlyDelivery=a.delivery&&!a.pickup&&!a.dinein;
  if(onlyDelivery)h+=`<div class="serviceCheckoutHint">Este carrinho possui item ou tamanho disponível somente para delivery. Para liberar retirada ou consumo no local, o pedido precisa conter somente itens/tamanhos que aceitem essas modalidades — por exemplo, o pote de 1 litro.</div>`;
  if(!a.delivery&&!a.pickup&&!a.dinein)h+=`<div class="notice bad">Os itens deste carrinho não possuem uma forma de atendimento em comum. Revise o carrinho ou as configurações dos produtos.</div>`;
  showModal(h);
}

function selectReceive(m){
  let a=cartAllowedModes();if(!a[m]){showReceiveChoices();return}
  window.checkoutState=window.checkoutState||{};window.checkoutState.mode=m;
  if(m==='delivery')showDeliveryForm();else if(m==='dinein')showDineinForm();else showPaymentChoices();
}

// Não existe mais modo de atendimento selecionado no catálogo.
function setClientServiceMode(){return}
window.clientServiceMode='delivery';

(function(){let st=document.createElement('style');st.textContent=`
.modeAvailability{font-size:11px!important;color:#7e7182!important;margin-top:3px}.serviceCheckoutHint{margin-top:12px;padding:11px 12px;border-radius:12px;background:#f4eef6;color:#665b69;font-size:12px;line-height:1.4}.serviceModeBox{display:none!important}
`;document.head.appendChild(st)})();



// ===== OFERTAS CONECTADAS AO CARDÁPIO + MAPA REAL =====
(function(){let st=document.createElement('style');st.textContent=`
.offerClientArea{display:grid;gap:10px;margin:12px 0 18px}.offerBanner{border:1px solid #e4d8e8;background:linear-gradient(135deg,#fff,#f7eef9);border-radius:18px;padding:14px 15px;display:flex;gap:12px;align-items:center}.offerBanner .offerIcon{width:44px;height:44px;border-radius:14px;background:#79258e;color:white;display:grid;place-items:center;font-size:21px;font-weight:900;flex:0 0 auto}.offerBanner b{display:block;font-size:16px}.offerBanner small{display:block;color:var(--muted);line-height:1.35;margin-top:2px}.offerAdminCard{background:#f5f1f6;border-radius:18px;padding:14px;margin:10px 0}.offerAdminCard .row{align-items:flex-start}.offerType{display:inline-block;border-radius:999px;padding:4px 8px;background:#eadcf0;color:#6d247c;font-size:11px;font-weight:850}.discountLine{color:#178a56}.mapReal{width:100%;height:300px;border:0;border-radius:18px;background:#eee}.mapActions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 14px}.mapActions>*{flex:1}.offerScopeHint{font-size:12px;color:var(--muted);margin-top:-4px;margin-bottom:10px}
`;document.head.appendChild(st)})();

function normalizeOffers(){
 if(!Array.isArray(cfg.offers))cfg.offers=[];
 cfg.offers=cfg.offers.map(o=>Object.assign({id:'of'+Date.now()+Math.random(),type:'percentage',title:'Oferta',description:'',active:false,percent:10,minValue:0,scope:'all',targetId:'',autoApply:true,requiredOrders:10,rewardPercent:10},o));
 cfg.store.mapQuery=cfg.store.mapQuery||cfg.store.address||'';
}
normalizeOffers();

function offerScopeText(o){
 if(o.scope==='section'){let s=cfg.sections?.find(x=>x.id===o.targetId);return 'Seção: '+(s?.title||'não definida')}
 if(o.scope==='product'){let p=cfg.products?.find(x=>x.id===o.targetId);return 'Produto: '+(p?.name||'não definido')}
 return 'Todo o cardápio';
}
function activePercentOffers(){normalizeOffers();return cfg.offers.filter(o=>o.active&&o.type==='percentage'&&(+o.percent||0)>0)}
function eligibleValueForOffer(o){
 return cart.reduce((sum,it)=>{let p=cfg.products.find(x=>x.id===it.pid);if(!p)return sum;let ok=o.scope==='all'||(o.scope==='section'&&p.category===o.targetId)||(o.scope==='product'&&p.id===o.targetId);return sum+(ok?(+it.unit||0)*(+it.qty||1):0)},0)
}
function activeOfferDiscount(){
 let cartValue=sum(),best=null;
 for(let o of activePercentOffers()){
   if(cartValue < (+o.minValue||0))continue;
   let eligible=eligibleValueForOffer(o),amount=eligible*(+o.percent||0)/100;
   if(amount>0&&(!best||amount>best.amount))best={offer:o,amount};
 }
 return best||{offer:null,amount:0};
}
function renderClientOffers(){
 let host=document.getElementById('clientOffers');
 if(!host){host=document.createElement('div');host.id='clientOffers';let hero=document.querySelector('#shopView .hero');hero?.insertAdjacentElement('afterend',host)}
 let active=cfg.offers.filter(o=>o.active);
 host.className='offerClientArea';host.innerHTML=active.map(o=>o.type==='percentage'?`<div class="offerBanner"><div class="offerIcon">${Math.round(+o.percent||0)}%</div><div><b>${esc(o.title||'Oferta')}</b><small>${esc(o.description||('Ganhe '+(+o.percent||0)+'% de desconto'))}${+o.minValue?` · Pedido mínimo ${brl(+o.minValue)}`:''} · ${esc(offerScopeText(o))}</small></div></div>`:`<div class="offerBanner"><div class="offerIcon">★</div><div><b>${esc(o.title||'Fidelidade')}</b><small>${esc(o.description||`A cada ${o.requiredOrders||10} pedidos, ganhe ${o.rewardPercent||10}% de desconto.`)}</small></div></div>`).join('');
}

const _renderShopOfferBase=renderShop;
renderShop=function(){_renderShopOfferBase();renderClientOffers();updateCart()};

function updateCart(){let d=activeOfferDiscount();let total=Math.max(0,sum()-d.amount);$('#cartCount').textContent=cart.reduce((s,i)=>s+i.qty,0);$('#cartTotal').textContent=brl(total)}

function adminOffers(){
 normalizeOffers();
 let list=cfg.offers.map(o=>`<div class="offerAdminCard"><div class="row"><div><span class="offerType">${o.type==='percentage'?'DESCONTO':'FIDELIDADE'}</span><h3 style="margin:5px 0 3px">${esc(o.title)}</h3><div class="hint">${o.type==='percentage'?`${+o.percent||0}% · ${esc(offerScopeText(o))}${+o.minValue?' · mínimo '+brl(+o.minValue):''}`:`${o.requiredOrders||10} pedidos → ${o.rewardPercent||10}% de benefício`}</div></div><span class="badge ${o.active?'available':'hidden'}">${o.active?'Ativa':'Inativa'}</span></div><div class="miniBtns" style="margin-top:10px"><button class="ghost" onclick="editOffer('${o.id}')">Editar</button><button class="ghost" onclick="toggleOffer('${o.id}')">${o.active?'Desativar':'Ativar'}</button><button class="dangerBtn" onclick="deleteOffer('${o.id}')">Excluir</button></div></div>`).join('')||'<div class="emptySection">Nenhuma oferta criada ainda.</div>';
 $('#adminContent').innerHTML=`<div class="panel"><div class="menuBuilderHead"><div><h3 style="margin:0">Ofertas</h3><div class="hint">Crie promoções que aparecem no cardápio e podem alterar o total do pedido.</div></div></div><div class="two"><button class="btn" onclick="newOffer('percentage')">＋ Desconto</button><button class="ghost" onclick="newOffer('loyalty')">★ Fidelidade</button></div>${list}<div class="notice">Descontos percentuais ativos são aplicados automaticamente no carrinho. Se houver mais de um válido, o sistema usa o que dá o maior desconto.</div></div>`;
}
function newOffer(type){let o={id:'of'+Date.now(),type,title:type==='percentage'?'10% OFF':'Clube Fidelidade',description:'',active:true,percent:10,minValue:0,scope:'all',targetId:'',autoApply:true,requiredOrders:10,rewardPercent:10};cfg.offers.push(o);save();editOffer(o.id)}
function toggleOffer(id){let o=cfg.offers.find(x=>x.id===id);if(!o)return;o.active=!o.active;save();adminOffers();renderShop()}
function deleteOffer(id){if(!confirm('Excluir esta oferta?'))return;cfg.offers=cfg.offers.filter(x=>x.id!==id);save();adminOffers();renderShop()}
function offerTargetOptions(scope,current){
 if(scope==='section')return (cfg.sections||[]).map(s=>`<option value="${s.id}" ${s.id===current?'selected':''}>${esc(s.title)}</option>`).join('');
 if(scope==='product')return (cfg.products||[]).map(p=>`<option value="${p.id}" ${p.id===current?'selected':''}>${esc(p.name)}</option>`).join('');
 return '<option value="">Todo o cardápio</option>';
}
function editOffer(id){let o=cfg.offers.find(x=>x.id===id);if(!o)return;
 if(o.type==='loyalty'){
   showModal(`<div class="row"><h2>Programa de fidelidade</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Nome</label><input id="ofTitle" class="field" value="${esc(o.title)}"><label>Descrição para o cliente</label><textarea id="ofDesc" class="field">${esc(o.description||'')}</textarea><div class="two"><div><label>Quantidade de pedidos</label><input id="ofOrders" type="number" min="1" class="field" value="${o.requiredOrders||10}"></div><div><label>Benefício (%)</label><input id="ofReward" type="number" min="0" max="100" class="field" value="${o.rewardPercent||10}"></div></div><label class="switchrow"><span>Programa ativo</span><input id="ofActive" type="checkbox" ${o.active?'checked':''}></label><div class="notice">O programa já aparece no cardápio e o progresso dos clientes é controlado automaticamente pelos pedidos registrados.</div><button class="btn full" onclick="saveLoyaltyOffer('${id}')">Salvar fidelidade</button>`);return;
 }
 showModal(`<div class="row"><h2>Editar desconto</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div><label>Nome da oferta</label><input id="ofTitle" class="field" value="${esc(o.title)}"><label>Descrição para o cliente</label><textarea id="ofDesc" class="field">${esc(o.description||'')}</textarea><div class="two"><div><label>Desconto (%)</label><input id="ofPercent" type="number" min="0" max="100" class="field" value="${+o.percent||0}"></div><div><label>Pedido mínimo (R$)</label><input id="ofMin" type="number" min="0" step=".01" class="field" value="${+o.minValue||0}"></div></div><label>Aplicar em</label><select id="ofScope" class="field" onchange="refreshOfferTarget('${id}')"><option value="all" ${o.scope==='all'?'selected':''}>Todo o cardápio</option><option value="section" ${o.scope==='section'?'selected':''}>Uma seção</option><option value="product" ${o.scope==='product'?'selected':''}>Um produto</option></select><div id="offerTargetWrap"></div><label class="switchrow"><span>Oferta ativa</span><input id="ofActive" type="checkbox" ${o.active?'checked':''}></label><button class="btn full" onclick="savePercentOffer('${id}')">Salvar oferta</button>`);setTimeout(()=>refreshOfferTarget(id),0)
}
function refreshOfferTarget(id){let o=cfg.offers.find(x=>x.id===id),scope=$('#ofScope')?.value||o?.scope||'all',wrap=$('#offerTargetWrap');if(!wrap)return;if(scope==='all'){wrap.innerHTML='<div class="offerScopeHint">O desconto vale para qualquer produto do pedido.</div>';return}wrap.innerHTML=`<label>${scope==='section'?'Escolha a seção':'Escolha o produto'}</label><select id="ofTarget" class="field">${offerTargetOptions(scope,o?.targetId||'')}</select>`}
function savePercentOffer(id){let o=cfg.offers.find(x=>x.id===id);if(!o)return;o.title=$('#ofTitle').value.trim()||'Oferta';o.description=$('#ofDesc').value;o.percent=Math.max(0,Math.min(100,+$('#ofPercent').value||0));o.minValue=Math.max(0,+$('#ofMin').value||0);o.scope=$('#ofScope').value;o.targetId=o.scope==='all'?'':($('#ofTarget')?.value||'');o.active=$('#ofActive').checked;save();closeModal();adminOffers();renderShop();updateCart()}
function saveLoyaltyOffer(id){let o=cfg.offers.find(x=>x.id===id);if(!o)return;o.title=$('#ofTitle').value.trim()||'Fidelidade';o.description=$('#ofDesc').value;o.requiredOrders=Math.max(1,+$('#ofOrders').value||10);o.rewardPercent=Math.max(0,Math.min(100,+$('#ofReward').value||10));o.active=$('#ofActive').checked;save();closeModal();adminOffers();renderShop()}

// Carrinho com desconto automático das ofertas ativas.
function showCart(){
 let sub=sum(),od=activeOfferDiscount(),discount=od.amount,total=Math.max(0,sub-discount);
 let h=`<div class="row"><div><h2 class="checkoutTitle">Seu pedido</h2><div class="checkoutSub">Revise os itens ou continue comprando</div></div><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button></div>`;
 if(!cart.length){showModal(h+`<div class="notice">Seu carrinho está vazio.</div><button class="btn full" data-pedevia-event="click" data-pedevia-call="continueShopping">Voltar ao cardápio</button>`);return}
 h+=`<div>`+cart.map((i,n)=>{let p=cfg.products.find(x=>x.id===i.pid);return `<div class="cartItem"><div class="cartItemHead"><div><b>${esc(p?.name||'Produto')}${i.variantName?' · '+esc(i.variantName):''}</b><div class="cartItemMeta">${i.groups.map(g=>`<div>• ${esc(g.name)}: ${g.items.map(itemLabel).join(', ')}</div>`).join('')}${i.obs?`<div>• Obs.: ${esc(i.obs)}</div>`:''}</div></div><b>${brl(i.unit*i.qty)}</b></div><div class="cartQty"><button onclick="changeCartQty(${n},-1)">−</button><span class="num">${i.qty}</span><button onclick="changeCartQty(${n},1)">+</button><button class="cartRemove" onclick="removeCartItem(${n})">×</button></div></div>`}).join('')+`</div>`;
 h+=`<div class="cartTotals"><div class="row"><span>Valor dos produtos</span><b>${brl(sub)}</b></div>${discount?`<div class="row discountLine"><span>${esc(od.offer.title)} (${od.offer.percent}%)</span><b>− ${brl(discount)}</b></div>`:''}<div class="row"><strong>Total</strong><strong>${brl(total)}</strong></div></div><div class="cartActions"><button class="btn secondary full" data-pedevia-event="click" data-pedevia-call="continueShopping">Adicionar mais produtos</button><button class="btn full" data-pedevia-event="click" data-pedevia-call="beginCheckout">Finalizar pedido ›</button></div>`;
 showModal(h);
}
function showCustomerForm(){
 let st=window.checkoutState,sub=sum(),od=activeOfferDiscount(),discount=od.amount,afterOffer=Math.max(0,sub-discount),fee=cartDeliveryFee(),adj=paymentAdjustment(afterOffer+fee),tot=afterOffer+fee+adj;
 let h=`<div class="row"><h2 class="checkoutTitle">Finalizar pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showPaymentChoices">‹</button></div><div class="summary"><div class="row"><b>${cart.reduce((s,i)=>s+i.qty,0)} produto(s)</b><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">Ver itens</button></div><div class="row"><b>${st.mode==='delivery'?'Entrega':st.mode==='pickup'?'Retirada':'Consumo no local'}</b><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">Alterar</button></div></div><div class="cartTotals"><div class="row"><span>Valor dos produtos</span><b>${brl(sub)}</b></div>${discount?`<div class="row discountLine"><span>${esc(od.offer.title)}</span><b>− ${brl(discount)}</b></div>`:''}${fee?`<div class="row"><span>Taxa de entrega</span><b>${brl(fee)}</b></div>`:''}${adj?`<div class="row"><span>${adj>0?'Taxa':'Desconto'} de pagamento</span><b>${adj>0?'+ ':''}${brl(adj)}</b></div>`:''}<div class="row"><strong>Total</strong><strong>${brl(tot)}</strong></div></div><label>Forma de pagamento*</label><button class="choiceTile" data-pedevia-event="click" data-pedevia-call="showPaymentChoices"><span class="bigIcon">${paymentIcon(st.payment)}</span><span><b>${paymentKeyLabel(st.payment)}</b></span><span style="margin-left:auto;color:var(--p);font-weight:800">Alterar</span></button><div class="two"><div><label>Seu nome*</label><input id="coName" class="field" value="${esc(st.customer||'')}"></div><div><label>Celular* (WhatsApp)</label><input id="coPhone" class="field" inputmode="tel" value="${esc(st.phone||'')}"></div></div><label>Observações</label><textarea id="coObs" class="field" placeholder="Comentários ou instruções adicionais">${esc(st.note||'')}</textarea><div class="checkoutSticky"><button class="btn green" data-pedevia-event="click" data-pedevia-call="finishWhatsApp">☏ Enviar pelo WhatsApp</button></div>`;
 showModal(h);
}
function finishWhatsApp(){
 let st=window.checkoutState;st.customer=$('#coName').value.trim();st.phone=$('#coPhone').value.trim();st.note=$('#coObs').value.trim();if(!st.customer||!st.phone){alert('Informe seu nome e celular.');return}
 let sub=sum(),od=activeOfferDiscount(),discount=od.amount,afterOffer=Math.max(0,sub-discount),fee=cartDeliveryFee(),adj=paymentAdjustment(afterOffer+fee),total=afterOffer+fee+adj,L=['🍧 *PEDIDO POINT DO AÇAÍ FRONTIN*',''];
 cart.forEach(i=>{let p=cfg.products.find(x=>x.id===i.pid);L.push(`*${i.qty}x ${p?.name||'Produto'}${i.variantName?' · '+i.variantName:''}* — ${brl(i.unit*i.qty)}`);i.groups.forEach(g=>L.push(`${g.name}: ${g.items.map(x=>(x.qty&&x.qty>1?x.qty+'x ':'')+x.name).join(', ')}`));if(i.obs)L.push('Obs.: '+i.obs);L.push('')});
 L.push('Cliente: '+st.customer,'Celular: '+st.phone,'Tipo: '+(st.mode==='delivery'?'Entrega':st.mode==='pickup'?'Retirada':'Consumo no local'));if(st.mode==='delivery'){if(cfg.store.orderConfig?.deliveryCalc==='neighborhood'&&st.neighborhood)L.push('Bairro: '+st.neighborhood);L.push('Endereço: '+st.address);}if(st.mode==='dinein'&&st.table)L.push('Mesa: '+st.table);L.push('Pagamento: '+paymentKeyLabel(st.payment),'Subtotal: '+brl(sub));if(discount)L.push('Oferta: '+od.offer.title+' (-'+od.offer.percent+'%): - '+brl(discount));if(fee)L.push('Taxa de entrega: '+brl(fee));if(adj)L.push((adj>0?'Taxa':'Desconto')+' de pagamento: '+brl(adj));L.push('*TOTAL: '+brl(total)+'*');if(st.note)L.push('Observações: '+st.note);location.href='https://wa.me/'+cfg.store.whatsapp+'?text='+encodeURIComponent(L.join('\n'));
}

// Endereço com mapa real. O iframe usa a busca do Google Maps e não precisa de chave de API.
function mapEmbedUrl(q){return 'https://www.google.com/maps?q='+encodeURIComponent(q||cfg.store.address||'')+'&output=embed'}
function mapSearchUrl(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q||cfg.store.address||'')}
function generalAddress(){let s=cfg.store,q=s.mapQuery||s.address||'';generalShell('Endereço',`<p class="hint">Insira o endereço do seu estabelecimento. Você pode usar o endereço completo ou coordenadas no campo da localização do mapa.</p><label>Endereço exibido ao cliente</label><textarea id="gAddr" class="field" rows="4">${esc(s.address)}</textarea><label>Localização exata do mapa (opcional)</label><input id="gMapQuery" class="field" value="${esc(q)}" placeholder="Ex.: -22.54,-43.68 ou endereço completo"><iframe id="gMapFrame" class="mapReal" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${esc(mapEmbedUrl(q))}"></iframe><div class="mapActions"><button class="ghost" data-pedevia-event="click" data-pedevia-call="previewAddressMap">Atualizar prévia</button><a class="btn" style="text-align:center;text-decoration:none" href="${esc(mapSearchUrl(q))}" target="_blank">Abrir no Maps</a></div><button class="btn full" data-pedevia-event="click" data-pedevia-call="saveGeneralAddress">Salvar endereço</button>`)}
function previewAddressMap(){let q=$('#gMapQuery').value.trim()||$('#gAddr').value.trim();$('#gMapFrame').src=mapEmbedUrl(q)}
function saveGeneralAddress(){cfg.store.address=$('#gAddr').value.trim();cfg.store.mapQuery=$('#gMapQuery').value.trim()||cfg.store.address;save();renderShop();generalAddress()}

async function saveGeneralContactOnline(){
  cfg.store.whatsapp=$('#gWa').value.replace(/\D/g,'');
  cfg.store.email=$('#gEmail').value;
  if(await saveAdminNow({successMessage:'Contato salvo online.'})) generalContact();
}
async function saveGeneralSocialOnline(){
  cfg.store.instagram=$('#gInsta').value;
  cfg.store.socialUrl=$('#gSocialUrl').value;
  if(await saveAdminNow({successMessage:'Rede social salva online.'})) generalSocial();
}
async function saveGeneralSharingOnline(){
  cfg.store.shareTitle=$('#gShareTitle').value;
  cfg.store.shareDescription=$('#gShareDesc').value;
  if(await saveAdminNow({successMessage:'Compartilhamento salvo online.'})) generalSharing();
}
async function saveGeneralDomainOnline(){
  cfg.store.hubSlug=$('#gSlug').value;
  cfg.store.customDomain=$('#gDomain').value;
  if(await saveAdminNow({successMessage:'Link salvo online.'})) generalDomain();
}

// A última versão do endereço ganha confirmação direta do servidor.
async function saveGeneralAddress(){
  cfg.store.address=$('#gAddr').value.trim();
  cfg.store.mapQuery=$('#gMapQuery').value.trim()||cfg.store.address;
  if(await saveAdminNow({successMessage:'Endereço salvo online.'})){
    renderShop();
    generalAddress();
  }
}


// ===== v1.2: PRODUTOS ONLINE NO SUPABASE =====
function dbRowToProduct(r){
  return {
    id:String(r.id),
    category:r.category||'acai',
    name:r.name||'Produto',
    desc:r.description||'',
    detailedDesc:r.detailed_description||'',
    price:Number(r.price||0),
    status:r.status||'available',
    image:r.image||'',
    groups:Array.isArray(r.groups)?r.groups:[],
    variants:Array.isArray(r.variants)?r.variants:[],
    allowedModes:Object.assign({delivery:true,pickup:false,dinein:false},r.allowed_modes||{})
  };
}
function productToDbRow(p,sortOrder){
  return {
    id:String(p.id),
    category:p.category||'acai',
    name:p.name||'Produto',
    description:p.desc||'',
    detailed_description:p.detailedDesc||'',
    price:Number(p.price||0),
    status:p.status||'available',
    image:p.image||'',
    groups:Array.isArray(p.groups)?p.groups:[],
    variants:Array.isArray(p.variants)?p.variants:[],
    allowed_modes:Object.assign({delivery:true,pickup:false,dinein:false},p.allowedModes||{}),
    sort_order:Number.isFinite(sortOrder)?sortOrder:Math.max(0,cfg.products.findIndex(x=>x.id===p.id))
  };
}
async function loadProductsFromSupabase(){
  try{
    const {data,error}=await supabaseClient
      .from('products')
      .select('*')
      .order('sort_order',{ascending:true});
    if(error)throw error;
    if(Array.isArray(data)&&data.length){
      cfg.products=data.map(dbRowToProduct);
      try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
      renderShop();
      updateCart();
      if(logged&&mode==='admin')renderAdmin();
      console.info('Produtos carregados do Supabase:',cfg.products.length);
      return true;
    }
    console.warn('A tabela products está vazia; usando produtos locais.');
    renderShop();updateCart();
    return false;
  }catch(e){
    console.error('Falha ao carregar produtos do Supabase. Usando fallback local.',e);
    renderShop();updateCart();
    return false;
  }
}
async function saveProductOnline(id){
  let p=cfg.products.find(x=>x.id===id);if(!p)return;
  p.name=$('#epn').value.trim()||'Produto';
  p.desc=$('#epd').value;
  p.detailedDesc=$('#epdetail').value;
  p.price=+$('#epp').value||0;
  p.category=$('#epc').value;
  p.image=p._pendingImage||$('#epi').value.trim();delete p._pendingImage;
  p.status=$('#eps').value;
  p.variants=collectVariantsFromEditor(); delete p._draftVariants;
  if(!hasVariants(p)){
    p.allowedModes={delivery:$('#pmDelivery')?.checked??true,pickup:$('#pmPickup')?.checked??false,dinein:$('#pmDinein')?.checked??false};
    if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein){
      alert('Escolha pelo menos uma forma de atendimento para este produto.');return;
    }
  }else{
    if(!p.variants.length){alert('Adicione pelo menos um tamanho.');return;}
    if(p.variants.some(v=>!v.allowedModes.delivery&&!v.allowedModes.pickup&&!v.allowedModes.dinein)){
      alert('Cada tamanho precisa ter pelo menos uma forma de atendimento.');return;
    }
  }

  const btn=document.querySelector('.stickySave .btn');
  const oldText=btn?.textContent||'Concluir';
  if(btn){btn.disabled=true;btn.textContent='Salvando...';}
  try{
    const {error}=await supabaseClient
      .from('products')
      .upsert(productToDbRow(p,cfg.products.findIndex(x=>x.id===id)),{onConflict:'id'});
    if(error)throw error;
    save();
    closeModal();renderAdmin();renderShop();
    alert('Produto salvo online.');
  }catch(e){
    console.error('Falha ao salvar produto no Supabase:',e);
    alert('Não foi possível salvar o produto online. Verifique sua conexão e tente novamente.');
  }finally{
    if(btn){btn.disabled=false;btn.textContent=oldText;}
  }
}
async function deleteProductOnline(id){
  const p=cfg.products.find(x=>x.id===id); if(!p)return;
  if(!confirm(`Excluir "${p.name}" do cardápio?`))return;
  try{
    const {error}=await supabaseClient.from('products').delete().eq('id',String(id));
    if(error)throw error;
    cfg.products=cfg.products.filter(x=>x.id!==id);
    save();
    closeModal();renderAdmin();renderShop();
    alert('Produto excluído.');
  }catch(e){
    console.error('Falha ao excluir produto:',e);
    alert('Não foi possível excluir o produto.');
  }
}

// Sobrescreve somente o salvamento final de produto para gravar no Supabase.
saveProduct=saveProductOnline;

// Acrescenta o botão Excluir ao editor sem reescrever a interface inteira.
const _editProductV12Base=editProduct;
editProduct=function(id){
  _editProductV12Base(id);
  const p=cfg.products.find(x=>x.id===id);
  const footer=document.querySelector('.stickySave');
  if(footer&&p&&p.name!=='Novo produto'){
    const del=document.createElement('button');
    del.className='dangerBtn';
    del.textContent='Excluir';
    del.onclick=()=>deleteProductOnline(id);
    footer.insertBefore(del,footer.firstChild);
  }
};

// Novo produto fica em memória até o usuário tocar em Concluir.
// Ao concluir, o upsert acima cria a linha no Supabase.
newProduct=function(sectionId){
  let sid=sectionId||cfg.sections[0]?.id||'acai';
  let standard=cfg.groups.filter(g=>['caldas','complementos','adicionais','talher'].includes(g.id)).map(g=>g.id);
  let p={
    id:'p'+Date.now(),category:sid,name:'Novo produto',desc:'',detailedDesc:'',
    price:0,status:'hidden',image:'',images:[],groups:standard,
    variants:[],allowedModes:{delivery:true,pickup:false,dinein:false}
  };
  cfg.products.push(p);
  editProduct(p.id);
};


// ===== v1.3: ESTADO COMPLETO DO ADMIN ONLINE =====
// Tudo que não é produto fica em site_config.
// Produtos continuam na tabela products.
// O localStorage agora funciona apenas como cache/fallback.

function siteConfigPayload(){
  return {
    schemaVersion: 1,
    store: cfg.store || {},
    groups: Array.isArray(cfg.groups) ? cfg.groups : [],
    sections: Array.isArray(cfg.sections) ? cfg.sections : [],
    categories: Array.isArray(cfg.categories) ? cfg.categories : [],
    offers: Array.isArray(cfg.offers) ? cfg.offers : []
  };
}

function applySiteConfigPayload(data){
  if(!data || typeof data !== 'object') return false;

  if(data.store && typeof data.store === 'object') cfg.store = data.store;
  if(Array.isArray(data.groups)) cfg.groups = data.groups;
  if(Array.isArray(data.sections)) cfg.sections = data.sections;
  if(Array.isArray(data.categories)) cfg.categories = data.categories;
  if(Array.isArray(data.offers)) cfg.offers = data.offers;

  // Repara compatibilidade entre seções/categorias das versões antigas.
  if(Array.isArray(cfg.sections) && cfg.sections.length){
    cfg.sections.forEach((s,i)=>{
      s.id=String(s.id||('sec'+i));
      s.title=s.title||s.name||('Seção '+(i+1));
      s.description=s.description||'';
      s.display=s.display||'expanded-images';
      s.accent=s.accent||'#712489';
      s.active=s.active!==false;
      s.order=Number.isFinite(+s.order)?+s.order:i;
    });
    cfg.sections.sort((a,b)=>(+a.order||0)-(+b.order||0));
    cfg.categories=cfg.sections.map(s=>({id:s.id,name:s.title,active:s.active}));
  }

  try{ localStorage.setItem(KEY,JSON.stringify(cfg)); }catch(e){}
  return true;
}

async function loadSiteConfigFromSupabase(){
  try{
    const {data,error}=await supabaseClient
      .from('site_config')
      .select('data,updated_at')
      .eq('id','main')
      .maybeSingle();

    if(error) throw error;

    if(data?.data){
      applySiteConfigPayload(data.data);
      console.info('Configuração geral carregada do Supabase.');
      return true;
    }

    console.info('site_config ainda não inicializado.');
    return false;
  }catch(e){
    console.error('Falha ao carregar configuração geral online. Usando cache local.',e);
    return false;
  }
}

async function saveSiteConfigOnline(){
  const {data:sessionData}=await supabaseClient.auth.getSession();
  if(!sessionData?.session) return false;

  const payload=siteConfigPayload();
  const {error}=await supabaseClient
    .from('site_config')
    .upsert({
      id:'main',
      data:payload,
      updated_at:new Date().toISOString()
    },{onConflict:'id'});

  if(error) throw error;
  return true;
}

async function syncAllProductsOnline(){
  const {data:sessionData}=await supabaseClient.auth.getSession();
  if(!sessionData?.session) return false;

  const rows=(cfg.products||[]).map((p,i)=>productToDbRow(p,i));

  if(rows.length){
    const {error}=await supabaseClient
      .from('products')
      .upsert(rows,{onConflict:'id'});
    if(error) throw error;
  }

  // Remove do banco produtos que já foram apagados do painel.
  const {data:remoteIds,error:idError}=await supabaseClient
    .from('products')
    .select('id');
  if(idError) throw idError;

  const localIds=new Set((cfg.products||[]).map(p=>String(p.id)));
  const removed=(remoteIds||[]).map(x=>String(x.id)).filter(id=>!localIds.has(id));

  if(removed.length){
    const {error:delError}=await supabaseClient
      .from('products')
      .delete()
      .in('id',removed);
    if(delError) throw delError;
  }
  return true;
}

let onlineSyncTimer=null;
let onlineSyncBusy=false;
let onlineSyncPending=false;

async function syncAllAdminStateOnline(){
  if(onlineSyncBusy){
    onlineSyncPending=true;
    return;
  }

  const {data:sessionData}=await supabaseClient.auth.getSession();
  if(!sessionData?.session) return;

  onlineSyncBusy=true;
  try{
    await Promise.all([
      saveSiteConfigOnline(),
      syncAllProductsOnline()
    ]);
    console.info('Estado completo do Admin sincronizado com o Supabase.');
  }catch(e){
    console.error('Falha ao sincronizar alterações do Admin:',e);
  }finally{
    onlineSyncBusy=false;
    if(onlineSyncPending){
      onlineSyncPending=false;
      scheduleFullOnlineSync(150);
    }
  }
}

function scheduleFullOnlineSync(delay=350){
  clearTimeout(onlineSyncTimer);
  onlineSyncTimer=setTimeout(()=>syncAllAdminStateOnline(),delay);
}

// Salvamento imediato para telas de configuração.
// Além do cache local, aguarda o Supabase confirmar a gravação.
async function saveAdminNow(options={}){
  const {
    syncProducts=false,
    successMessage=''
  }=options;

  try{
    _saveLocalV13();
    const {data:sessionData}=await supabaseClient.auth.getSession();
    if(!sessionData?.session){
      if(successMessage) alert('Alteração salva apenas neste aparelho. Faça login novamente para sincronizar online.');
      return false;
    }

    await saveSiteConfigOnline();
    if(syncProducts) await syncAllProductsOnline();

    if(successMessage) alert(successMessage);
    return true;
  }catch(e){
    console.error('Erro ao salvar configuração online:',e);
    alert('Não foi possível salvar a alteração no servidor. Verifique a internet e tente novamente.');
    return false;
  }
}

// Substitui o antigo save() local por cache local + sincronização online.
// Assim as dezenas de telas do Admin passam a usar o mesmo mecanismo.
const _saveLocalV13 = save;
save = function(){
  _saveLocalV13();
  scheduleFullOnlineSync(120);
};

async function ensureSiteConfigInitialized(){
  try{
    const {data,error}=await supabaseClient
      .from('site_config')
      .select('id')
      .eq('id','main')
      .maybeSingle();

    if(error) throw error;

    if(!data){
      // Primeira inicialização: preserva as alterações que já estão
      // no navegador do Admin, inclusive logo, caldas e complementos.
      await saveSiteConfigOnline();
      await syncAllProductsOnline();
      console.info('Configuração online inicializada a partir do painel atual.');
    }
  }catch(e){
    console.error('Falha ao inicializar site_config:',e);
  }
}

async function initializeOnlineStateV13(){
  // Primeiro configurações gerais; depois produtos, que têm tabela própria.
  await loadSiteConfigFromSupabase();
  await loadProductsFromSupabase();

  renderShop();
  updateCart();

  // Se já existe sessão autenticada, garante que a linha principal exista.
  const {data}=await supabaseClient.auth.getSession();
  if(data?.session){
    logged=true;
    await ensureSiteConfigInitialized();
  }
}

// ===== v1.5: AUDITORIA GERAL DE PERSISTÊNCIA =====
function setSyncStatusV15(state,message){
  const el=document.getElementById('syncStatus');
  if(!el)return;
  if(state==='saving') el.textContent='☁️ Salvando alterações...';
  else if(state==='ok') el.textContent='✅ Alterações salvas online';
  else if(state==='error') el.textContent='⚠️ Falha ao sincronizar';
  else el.textContent='☁️ Sincronização online ativa';
  if(message) el.title=message;
}

let v15SyncPromise=Promise.resolve();
async function persistAdminStateV15({products=true,notify=false,message='Alterações salvas online.'}={}){
  // Mantém o cache local imediatamente.
  try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn('Falha no cache local',e)}

  const {data:sessionData}=await supabaseClient.auth.getSession();
  if(!sessionData?.session){
    setSyncStatusV15('error','Sessão administrativa ausente.');
    if(notify) alert('Sua sessão expirou. Entre novamente no Admin para salvar online.');
    return false;
  }

  setSyncStatusV15('saving');

  try{
    // Serializa os salvamentos para evitar que uma alteração antiga
    // termine depois de uma nova e sobrescreva o estado mais recente.
    v15SyncPromise=v15SyncPromise.then(async()=>{
      await saveSiteConfigOnline();
      if(products) await syncAllProductsOnline();
    });
    await v15SyncPromise;
    setSyncStatusV15('ok');
    if(notify) alert(message);
    return true;
  }catch(e){
    console.error('Persistência online v1.5:',e);
    setSyncStatusV15('error',String(e?.message||e));
    if(notify) alert('Não foi possível salvar no servidor. Tente novamente.');
    return false;
  }
}

// Todo save() antigo do projeto passa obrigatoriamente pelo mesmo fluxo.
// Isto cobre complementos, estoque, ofertas, configurações, pedidos e seções.
save=function(){
  try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){console.warn('Falha no cache local',e)}
  persistAdminStateV15({products:true,notify:false});
  if(typeof renderShop==='function')renderShop();
};

// Overrides finais das telas gerais para não depender dos onclicks antigos.
saveGeneralHours=async function(){
  const s=cfg.store;
  s.scheduleMode=$('#gSchedule')?.value||s.scheduleMode||'fixed';
  s.holidayMode=$('#gHoliday')?.value||s.holidayMode||'normal';
  for(let i=0;i<7;i++){
    const a=$('#ga'+i)?.value||'', b=$('#gb'+i)?.value||'';
    s.hours[String(i)]=(a&&b)?[[a,b]]:[];
  }
  if(await persistAdminStateV15({products:false,notify:true,message:'Horários salvos online.'})){
    renderShop();generalHours();
  }
};

saveGeneralBrand=async function(){
  const s=cfg.store;
  s.name=$('#gName')?.value||s.name;
  s.legalName=$('#gLegal')?.value||'';
  s.cnpj=$('#gCnpj')?.value||'';
  const f=$('#gLogo')?.files?.[0];

  const persist=async()=>{
    if(await persistAdminStateV15({products:false,notify:true,message:'Nome e logo salvos online.'})){
      renderShop();generalBrand();
    }
  };

  if(f){
    compressImageFile(f,async data=>{
      s.brandImage=data;
      await persist();
    });
  }else await persist();
};

saveGeneralSocialOnline=async function(){
  cfg.store.instagram=$('#gInsta')?.value||'';
  cfg.store.socialUrl=$('#gSocialUrl')?.value||'';
  if(await persistAdminStateV15({products:false,notify:true,message:'Rede social salva online.'})){
    renderShop();generalSocial();
  }
};

saveGeneralContactOnline=async function(){
  cfg.store.whatsapp=($('#gWa')?.value||'').replace(/\D/g,'');
  cfg.store.email=$('#gEmail')?.value||'';
  if(await persistAdminStateV15({products:false,notify:true,message:'Contato salvo online.'})) generalContact();
};

saveGeneralSharingOnline=async function(){
  cfg.store.shareTitle=$('#gShareTitle')?.value||'';
  cfg.store.shareDescription=$('#gShareDesc')?.value||'';
  if(await persistAdminStateV15({products:false,notify:true,message:'Compartilhamento salvo online.'})) generalSharing();
};

saveGeneralDomainOnline=async function(){
  cfg.store.hubSlug=$('#gSlug')?.value||'';
  cfg.store.customDomain=$('#gDomain')?.value||'';
  if(await persistAdminStateV15({products:false,notify:true,message:'Link salvo online.'})) generalDomain();
};

saveGeneralAddress=async function(){
  cfg.store.address=$('#gAddr')?.value?.trim()||'';
  cfg.store.mapQuery=$('#gMapQuery')?.value?.trim()||cfg.store.address;
  if(await persistAdminStateV15({products:false,notify:true,message:'Endereço salvo online.'})){
    renderShop();generalAddress();
  }
};

// Corrige diretamente os onclicks das telas gerais sempre que elas forem abertas.
const _generalSocialV15=generalSocial;
generalSocial=function(){
  _generalSocialV15();
  const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Salvar rede social');
  if(btn) btn.onclick=()=>saveGeneralSocialOnline();
};

const _generalContactV15=generalContact;
generalContact=function(){
  _generalContactV15();
  const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Salvar contato');
  if(btn) btn.onclick=()=>saveGeneralContactOnline();
};

const _generalSharingV15=generalSharing;
generalSharing=function(){
  _generalSharingV15();
  const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Salvar compartilhamento');
  if(btn) btn.onclick=()=>saveGeneralSharingOnline();
};

const _generalDomainV15=generalDomain;
generalDomain=function(){
  _generalDomainV15();
  const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Salvar link');
  if(btn) btn.onclick=()=>saveGeneralDomainOnline();
};

// Rede de segurança: qualquer clique administrativo que altere dados e passe
// por rotinas legadas terá uma sincronização final após a ação.
document.addEventListener('click',e=>{
  if(!logged || !document.getElementById('adminPanel')?.contains(e.target))return;
  const b=e.target.closest('button');
  if(!b)return;
  const t=(b.textContent||'').trim().toLowerCase();
  if(/salvar|concluir|adicionar|remover|excluir|pausar|retomar|disponível|indisponível|ocultar/.test(t)){
    setTimeout(()=>persistAdminStateV15({products:true,notify:false}),250);
  }
});

// ===== v1.6: EDITOR DE ENQUADRAMENTO DE IMAGENS =====
let imageCropState=null;

function openImageCropper(file,opts={}){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      imageCropState={
        img,
        shape:opts.shape||'square',
        outputWidth:opts.outputWidth||800,
        outputHeight:opts.outputHeight||800,
        onConfirm:opts.onConfirm||(()=>{}),
        zoom:1,
        x:0,
        y:0,
        dragging:false,
        lastX:0,
        lastY:0
      };
      showCropperModal(opts.title||'Ajustar imagem');
      requestAnimationFrame(()=>resetCropperPosition());
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
}

function showCropperModal(title){
  const circle=imageCropState.shape==='circle';
  showModal(`
    <div class="row"><h2>${esc(title)}</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="closeImageCropper">✕</button></div>
    <p class="hint">Arraste a imagem e use o zoom até ficar como deseja.</p>
    <div class="cropViewport ${circle?'cropCircle':'cropRect'}" id="cropViewport">
      <canvas id="cropCanvas"></canvas>
      <div class="cropMask ${circle?'circle':''}"></div>
    </div>
    <label>Zoom</label>
    <input id="cropZoom" type="range" min="1" max="3" step="0.01" value="1" class="field" oninput="setCropZoom(this.value)">
    <div class="two">
      <button class="ghost full" data-pedevia-event="click" data-pedevia-call="resetCropperPosition">Centralizar</button>
      <button class="btn full" data-pedevia-event="click" data-pedevia-call="confirmImageCrop">Usar imagem</button>
    </div>
  `);

  const vp=document.getElementById('cropViewport');
  vp.addEventListener('pointerdown',cropPointerDown);
  vp.addEventListener('pointermove',cropPointerMove);
  vp.addEventListener('pointerup',cropPointerUp);
  vp.addEventListener('pointercancel',cropPointerUp);
  vp.addEventListener('pointerleave',cropPointerUp);
}

function cropPointerDown(e){
  if(!imageCropState)return;
  imageCropState.dragging=true;
  imageCropState.lastX=e.clientX;
  imageCropState.lastY=e.clientY;
  e.currentTarget.setPointerCapture?.(e.pointerId);
}
function cropPointerMove(e){
  if(!imageCropState?.dragging)return;
  imageCropState.x+=e.clientX-imageCropState.lastX;
  imageCropState.y+=e.clientY-imageCropState.lastY;
  imageCropState.lastX=e.clientX;
  imageCropState.lastY=e.clientY;
  drawImageCropper();
}
function cropPointerUp(){if(imageCropState)imageCropState.dragging=false}

function setCropZoom(v){
  if(!imageCropState)return;
  imageCropState.zoom=+v||1;
  constrainCropPosition();
  drawImageCropper();
}

function resetCropperPosition(){
  if(!imageCropState)return;
  imageCropState.zoom=1;
  imageCropState.x=0;
  imageCropState.y=0;
  const z=document.getElementById('cropZoom');if(z)z.value='1';
  drawImageCropper();
}

function cropMetrics(){
  const c=document.getElementById('cropCanvas');
  const s=imageCropState;
  if(!c||!s)return null;
  const rect=c.getBoundingClientRect();
  const cw=rect.width,ch=rect.height;
  const iw=s.img.naturalWidth,ih=s.img.naturalHeight;
  const base=Math.max(cw/iw,ch/ih);
  const scale=base*s.zoom;
  return {c,cw,ch,iw,ih,scale,dw:iw*scale,dh:ih*scale};
}

function constrainCropPosition(){
  const m=cropMetrics();if(!m)return;
  const s=imageCropState;
  const maxX=Math.max(0,(m.dw-m.cw)/2);
  const maxY=Math.max(0,(m.dh-m.ch)/2);
  s.x=Math.max(-maxX,Math.min(maxX,s.x));
  s.y=Math.max(-maxY,Math.min(maxY,s.y));
}

function drawImageCropper(){
  const m=cropMetrics();if(!m)return;
  const s=imageCropState;
  const dpr=Math.max(1,window.devicePixelRatio||1);
  m.c.width=Math.round(m.cw*dpr);
  m.c.height=Math.round(m.ch*dpr);
  const ctx=m.c.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,m.cw,m.ch);
  constrainCropPosition();
  ctx.drawImage(s.img,(m.cw-m.dw)/2+s.x,(m.ch-m.dh)/2+s.y,m.dw,m.dh);
}

function confirmImageCrop(){
  const s=imageCropState;if(!s)return;
  const m=cropMetrics();if(!m)return;
  const out=document.createElement('canvas');
  out.width=s.outputWidth;out.height=s.outputHeight;
  const ctx=out.getContext('2d');

  const ratioX=s.outputWidth/m.cw, ratioY=s.outputHeight/m.ch;
  const dx=((m.cw-m.dw)/2+s.x)*ratioX;
  const dy=((m.ch-m.dh)/2+s.y)*ratioY;
  ctx.drawImage(s.img,dx,dy,m.dw*ratioX,m.dh*ratioY);

  const data=out.toDataURL('image/jpeg',0.88);
  const cb=s.onConfirm;
  imageCropState=null;
  closeModal();
  cb(data);
}

function closeImageCropper(){
  imageCropState=null;
  closeModal();
}

// Intercepta seleção de imagem de produto para editar antes de aplicar.
previewProductImage=function(id,input){
  const f=input.files&&input.files[0];if(!f)return;
  openImageCropper(f,{
    title:'Enquadrar foto do produto',
    shape:'square',
    outputWidth:900,
    outputHeight:900,
    onConfirm:async data=>{
      const p=cfg.products.find(x=>x.id===id);if(!p)return;

      // A imagem confirmada já passa a ser a imagem definitiva do produto.
      p.image=data;
      delete p._pendingImage;

      const prev=document.getElementById('prodPrev');
      if(prev)prev.innerHTML=`<img src="${data}">`;

      try{
        setSyncStatusV15?.('saving');

        const {error}=await supabaseClient
          .from('products')
          .upsert(
            productToDbRow(p,cfg.products.findIndex(x=>x.id===id)),
            {onConflict:'id'}
          );

        if(error)throw error;

        try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
        setSyncStatusV15?.('ok');

        renderShop();
        if(logged&&mode==='admin') renderAdmin();

        alert('Imagem do produto salva online.');
      }catch(e){
        console.error('Falha ao salvar imagem do produto:',e);
        setSyncStatusV15?.('error',String(e?.message||e));
        alert('Não foi possível salvar a imagem online. Tente novamente.');
      }
    }
  });
};

// Intercepta o salvamento da logo e abre editor circular antes.
const _saveGeneralBrandV16Base=saveGeneralBrand;
saveGeneralBrand=async function(){
  const f=$('#gLogo')?.files?.[0];
  if(!f){return _saveGeneralBrandV16Base();}

  const s=cfg.store;
  s.name=$('#gName')?.value||s.name;
  s.legalName=$('#gLegal')?.value||'';
  s.cnpj=$('#gCnpj')?.value||'';

  openImageCropper(f,{
    title:'Enquadrar logo',
    shape:'circle',
    outputWidth:800,
    outputHeight:800,
    onConfirm:async data=>{
      s.brandImage=data;
      if(await persistAdminStateV15({products:false,notify:true,message:'Nome e logo salvos online.'})){
        renderShop();
        applyBrandHeaderV116();
        generalBrand();
      }
    }
  });
};

// ===== v1.7: VERSIONAMENTO E MIGRAÇÕES DE DADOS =====
const APP_VERSION='1.33.0';
const DATA_SCHEMA_VERSION=4;

/*
  Regras:
  - Nunca apagar campos desconhecidos de versões futuras.
  - Migrações devem ser incrementais.
  - Cada migração transforma dados antigos no formato mais novo.
  - O Supabase continua sendo a fonte oficial dos dados.
*/
function cloneData(v){
  try{return structuredClone(v)}catch(e){return JSON.parse(JSON.stringify(v))}
}

function normalizeSiteConfigForMigration(raw){
  const data=(raw && typeof raw==='object')?cloneData(raw):{};
  data.schemaVersion=Number(data.schemaVersion||0);
  data.store=(data.store&&typeof data.store==='object')?data.store:{};
  data.groups=Array.isArray(data.groups)?data.groups:[];
  data.sections=Array.isArray(data.sections)?data.sections:[];
  data.categories=Array.isArray(data.categories)?data.categories:[];
  data.offers=Array.isArray(data.offers)?data.offers:[];
  return data;
}

// v0 -> v1: garante as coleções principais.
function migrateSchema0to1(data){
  data.store=data.store||{};
  data.groups=Array.isArray(data.groups)?data.groups:[];
  data.sections=Array.isArray(data.sections)?data.sections:[];
  data.categories=Array.isArray(data.categories)?data.categories:[];
  data.offers=Array.isArray(data.offers)?data.offers:[];
  data.schemaVersion=1;
  return data;
}

// v1 -> v2: padroniza campos usados atualmente sem apagar dados existentes.
function migrateSchema1to2(data){
  const s=data.store||{};
  s.modes=Object.assign({delivery:true,pickup:true,dinein:true},s.modes||{});
  s.payments=Object.assign({pix:true,cash:true,debit:true,credit:true},s.payments||{});
  s.orderConfig=Object.assign({
    deliveryTime:'30–60 min',
    deliveryArea:'',
    pickupTime:40,
    requireCpf:false,
    referenceCodes:false,
    showOrderNumber:false,
    orderPrefix:'PA',
    nextOrder:1
  },s.orderConfig||{});

  data.groups=(data.groups||[]).map((g,i)=>Object.assign({
    id:g.id||('g'+i),
    name:g.name||('Grupo '+(i+1)),
    min:0,
    max:1,
    required:false,
    selectionMode:'multiple',
    unlimited:false,
    options:[]
  },g,{
    options:Array.isArray(g.options)?g.options:[]
  }));

  data.sections=(data.sections||[]).map((sec,i)=>Object.assign({
    id:String(sec.id||('sec'+i)),
    title:sec.title||sec.name||('Seção '+(i+1)),
    description:'',
    display:'expanded-images',
    accent:'#712489',
    active:true,
    order:i
  },sec));

  if(data.sections.length){
    data.categories=data.sections.map(sec=>({
      id:String(sec.id),
      name:sec.title||sec.name||'Seção',
      active:sec.active!==false
    }));
  }

  data.schemaVersion=2;
  return data;
}

function runSiteConfigMigrations(raw){
  let data=normalizeSiteConfigForMigration(raw);
  const original=Number(data.schemaVersion||0);

  while(data.schemaVersion<DATA_SCHEMA_VERSION){
    if(data.schemaVersion===0) data=migrateSchema0to1(data);
    else if(data.schemaVersion===1) data=migrateSchema1to2(data);
    else if(data.schemaVersion===2){
      data.store=data.store||{};
      data.store.orderConfig=data.store.orderConfig||{};
      const o=data.store.orderConfig;
      if(o.serviceFeeEnabled===undefined)o.serviceFeeEnabled=false;
      if(o.serviceFeeType===undefined)o.serviceFeeType='percent';
      if(o.serviceFeeValue===undefined)o.serviceFeeValue=0;
      if(o.serviceFeeLabel===undefined)o.serviceFeeLabel='Taxa de serviço';
      if(o.pixKey===undefined)o.pixKey='24998375867';
      if(o.pixHolder===undefined)o.pixHolder='Pablo - PicPay';
      data.schemaVersion=3;
    }
    else if(data.schemaVersion===3){
      data.store=data.store||{};
      data.store.heroTitle=data.store.heroTitle||'Seu açaí, do seu jeito';
      data.store.heroEmoji=(data.store.heroEmoji===undefined?'💜':data.store.heroEmoji);
      data.store.heroText=data.store.heroText||'Monte seu pedido com os complementos que você gosta e finalize pelo WhatsApp.';
      data.store.theme=Object.assign({
        primary:'#712489',
        secondary:'#a942b5',
        background:'#f7f4f8',
        card:'#ffffff',
        text:'#28232b',
        muted:'#7c7480',
        line:'#e8e1ea',
        success:'#198b57',
        danger:'#c53c49',
        warning:'#e3a128',
        heroStart:'#562066',
        heroEnd:'#9d3eb0',
        headerBg:'#ffffff',
        headerText:'#28232b',
        topCardBg:'#ffffff',
        infoText:'#28232b',
        loyaltyBg:'#ffffff',
        loyaltyText:'#28232b',
        noticeBg:'#fdebed',
        noticeText:'#a53643',
        categoryBg:'#ffffff',
        categoryText:'#28232b',
        categoryActiveBg:'#712489',
        categoryActiveText:'#ffffff',
        sectionBg:'#f7f4f8',
        sectionTitle:'#28232b',
        productBg:'#ffffff',
        productText:'#28232b',
        productPrice:'#712489',
        cartBg:'#712489',
        cartText:'#ffffff',
        modalBg:'#ffffff',
        modalText:'#28232b',
        buttonBg:'#712489',
        buttonText:'#ffffff',
        secondaryButtonBg:'#ffffff',
        secondaryButtonText:'#712489'
      },data.store.theme||{});
      data.schemaVersion=4;
    }
    else throw new Error('Versão de dados desconhecida: '+data.schemaVersion);
  }

  return {
    data,
    changed:original!==data.schemaVersion,
    fromVersion:original,
    toVersion:data.schemaVersion
  };
}

// Substitui o payload para sempre gravar a versão atual do esquema.
siteConfigPayload=function(){
  return {
    schemaVersion:DATA_SCHEMA_VERSION,
    appVersion:APP_VERSION,
    store:cfg.store||{},
    groups:Array.isArray(cfg.groups)?cfg.groups:[],
    sections:Array.isArray(cfg.sections)?cfg.sections:[],
    categories:Array.isArray(cfg.categories)?cfg.categories:[],
    offers:Array.isArray(cfg.offers)?cfg.offers:[]
  };
};

// Substitui aplicação de config: primeiro migra, depois aplica.
const _applySiteConfigPayloadV17Base=applySiteConfigPayload;
applySiteConfigPayload=function(raw){
  const result=runSiteConfigMigrations(raw);
  const ok=_applySiteConfigPayloadV17Base(result.data);

  if(result.changed){
    console.info(`Migração automática: schema ${result.fromVersion} → ${result.toVersion}`);
    // Se o Admin estiver autenticado, persiste a migração no Supabase.
    supabaseClient.auth.getSession().then(({data})=>{
      if(data?.session){
        saveSiteConfigOnline().catch(e=>console.error('Falha ao persistir migração:',e));
      }
    });
  }
  return ok;
};

// Produtos também recebem normalização compatível antes de uso.
function migrateProductRecordV17(p){
  const x=Object.assign({},p);
  x.id=String(x.id||('p'+Date.now()+Math.random()));
  x.category=x.category||'acai';
  x.name=x.name||'Produto';
  x.desc=x.desc||'';
  x.detailedDesc=x.detailedDesc||'';
  x.price=Number(x.price||0);
  x.status=x.status||'available';
  x.image=x.image||'';
  x.groups=Array.isArray(x.groups)?x.groups:[];
  x.variants=Array.isArray(x.variants)?x.variants:[];
  x.allowedModes=Object.assign({delivery:true,pickup:false,dinein:false},x.allowedModes||{});
  return x;
}

const _dbRowToProductV17Base=dbRowToProduct;
dbRowToProduct=function(r){
  return migrateProductRecordV17(_dbRowToProductV17Base(r));
};

// Indicador de versão no painel.
const _renderAdminV17Base=renderAdmin;
renderAdmin=function(){
  _renderAdminV17Base();
  const st=document.getElementById('adminStatus');
  if(st && !document.getElementById('appVersionLabel')){
    const el=document.createElement('div');
    el.id='appVersionLabel';
    el.style.cssText='font-size:12px;opacity:.8;margin-top:5px';
    el.textContent=`Versão ${APP_VERSION} · Dados v${DATA_SCHEMA_VERSION}`;
    st.appendChild(el);
  }
};

// Diagnóstico rápido de compatibilidade disponível no console.
window.pointAcaiDiagnostics=function(){
  return {
    appVersion:APP_VERSION,
    dataSchemaVersion:DATA_SCHEMA_VERSION,
    products:Array.isArray(cfg.products)?cfg.products.length:0,
    groups:Array.isArray(cfg.groups)?cfg.groups.length:0,
    sections:Array.isArray(cfg.sections)?cfg.sections.length:0,
    offers:Array.isArray(cfg.offers)?cfg.offers.length:0,
    online:!!supabaseClient
  };
};

// ===== v1.8: DUPLICAR PRODUTO =====
function deepCloneProductV18(p){
  try{return structuredClone(p)}catch(e){return JSON.parse(JSON.stringify(p))}
}

async function duplicateProduct(id){
  const original=cfg.products.find(x=>String(x.id)===String(id));
  if(!original){alert('Produto não encontrado.');return;}

  const copy=deepCloneProductV18(original);
  copy.id='p'+Date.now()+Math.floor(Math.random()*1000);
  copy.name=(original.name||'Produto')+' - cópia';
  delete copy._pendingImage;
  delete copy._draftVariants;

  const idx=cfg.products.findIndex(x=>String(x.id)===String(id));
  cfg.products.splice(idx+1,0,copy);

  try{
    const {error}=await supabaseClient
      .from('products')
      .upsert(productToDbRow(copy,idx+1),{onConflict:'id'});
    if(error)throw error;

    await syncAllProductsOnline();
    try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}

    renderAdmin();
    renderShop();
    editProduct(copy.id);
    alert('Produto duplicado. Agora edite a cópia e toque em Concluir.');
  }catch(e){
    console.error('Falha ao duplicar produto:',e);
    cfg.products=cfg.products.filter(x=>String(x.id)!==String(copy.id));
    try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(err){}
    alert('Não foi possível duplicar o produto online.');
  }
}

const _editProductV18Base=editProduct;
editProduct=function(id){
  _editProductV18Base(id);
  const p=cfg.products.find(x=>String(x.id)===String(id));
  const footer=document.querySelector('.stickySave');
  if(!footer||!p)return;

  if(!footer.querySelector('.duplicateProductBtn')){
    const btn=document.createElement('button');
    btn.className='ghost duplicateProductBtn';
    btn.type='button';
    btn.textContent='Duplicar';
    btn.onclick=()=>duplicateProduct(id);
    footer.insertBefore(btn,footer.lastElementChild);
  }
};

function attachDuplicateButtonsV18(){
  if(!logged)return;
  const admin=document.getElementById('adminContent');
  if(!admin)return;

  const editButtons=[...admin.querySelectorAll('button')].filter(b=>{
    const oc=b.getAttribute('onclick')||'';
    return oc.includes("editProduct(");
  });

  editButtons.forEach(editBtn=>{
    const oc=editBtn.getAttribute('onclick')||'';
    const m=oc.match(/editProduct\(['"]([^'"]+)['"]\)/);
    if(!m)return;
    const pid=m[1];
    const parent=editBtn.parentElement;
    if(!parent||parent.querySelector(`.dup-inline[data-pid="${CSS.escape(pid)}"]`))return;

    const dup=document.createElement('button');
    dup.className='ghost dup-inline';
    dup.dataset.pid=pid;
    dup.type='button';
    dup.textContent='Duplicar';
    dup.onclick=e=>{e.stopPropagation();duplicateProduct(pid);};
    parent.appendChild(dup);
  });
}

const _renderAdminV18Base=renderAdmin;
renderAdmin=function(){
  _renderAdminV18Base();
  setTimeout(attachDuplicateButtonsV18,0);
};

// ===== v1.11: TAXA DE SERVIÇO + PIX CONFIGURÁVEL + PEDIDO COPIÁVEL + PROTEÇÃO DE SINCRONIZAÇÃO =====

// ---------------------------------------------------------------------
// 1) Proteção contra cache local sobrescrever o Supabase durante o boot.
// ---------------------------------------------------------------------
let cloudHydratedV111=false;

const _syncAllAdminStateOnlineV111Base=syncAllAdminStateOnline;
syncAllAdminStateOnline=async function(){
  if(!cloudHydratedV111){
    console.info('Sincronização adiada: aguardando hidratação do Supabase.');
    return;
  }
  return _syncAllAdminStateOnlineV111Base();
};

const _persistAdminStateV111Base=persistAdminStateV15;
persistAdminStateV15=async function(opts={}){
  if(!cloudHydratedV111){
    try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
    console.info('Alteração mantida no cache até terminar a hidratação online.');
    return false;
  }
  return _persistAdminStateV111Base(opts);
};

// Faz a leitura oficial do Supabase antes de liberar qualquer escrita.
initializeOnlineStateV13=async function(){
  clearTimeout(onlineSyncTimer);

  await loadSiteConfigFromSupabase();
  await loadProductsFromSupabase();

  cloudHydratedV111=true;

  renderShop();
  updateCart();

  const {data}=await supabaseClient.auth.getSession();
  if(data?.session){
    logged=true;
    await ensureSiteConfigInitialized();
  }

  console.info('Supabase hidratado; gravações online liberadas.');
};

// ---------------------------------------------------------------------
// 2) Novos campos de pedido, com defaults seguros.
// ---------------------------------------------------------------------
function normalizeOrderExtrasV111(){
  cfg.store=cfg.store||{};
  cfg.store.orderConfig=cfg.store.orderConfig||{};
  const o=cfg.store.orderConfig;

  if(o.serviceFeeEnabled===undefined)o.serviceFeeEnabled=false;
  if(o.serviceFeeType===undefined)o.serviceFeeType='percent';
  if(o.serviceFeeValue===undefined)o.serviceFeeValue=0;
  if(o.serviceFeeLabel===undefined)o.serviceFeeLabel='Taxa de serviço';

  if(o.pixKey===undefined)o.pixKey='24998375867';
  if(o.pixHolder===undefined)o.pixHolder='Pablo - PicPay';
}
normalizeOrderExtrasV111();

function serviceFeeAmountV111(base){
  normalizeOrderExtrasV111();
  const o=cfg.store.orderConfig;
  if(!o.serviceFeeEnabled)return 0;
  const v=Math.max(0,+o.serviceFeeValue||0);
  return o.serviceFeeType==='fixed' ? v : (base*v/100);
}

function serviceFeeSummaryV111(){
  normalizeOrderExtrasV111();
  const o=cfg.store.orderConfig;
  if(!o.serviceFeeEnabled)return 'Desativada';
  return o.serviceFeeType==='fixed'
    ? `${o.serviceFeeLabel||'Taxa de serviço'} · ${brl(o.serviceFeeValue)}`
    : `${o.serviceFeeLabel||'Taxa de serviço'} · ${Number(o.serviceFeeValue||0).toFixed(2).replace('.',',')}%`;
}

function pixSummaryV111(){
  normalizeOrderExtrasV111();
  const o=cfg.store.orderConfig;
  return o.pixKey ? `${o.pixKey}${o.pixHolder?' · '+o.pixHolder:''}` : 'Não configurado';
}

// ---------------------------------------------------------------------
// 3) Configuração administrativa.
// ---------------------------------------------------------------------
function editServiceAndPixV111(){
  normalizeOrderExtrasV111();
  const o=cfg.store.orderConfig;

  showModal(`
    <div class="row">
      <h2>Taxa de serviço e Pix</h2>
      <button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button>
    </div>

    <div class="cfgBlock">
      <label class="switchrow">
        <span>
          <b>Cobrar taxa de serviço</b>
          <small class="hint">A taxa aparecerá no checkout e no pedido.</small>
        </span>
        <input id="svcEnabled" type="checkbox" ${o.serviceFeeEnabled?'checked':''}>
      </label>

      <label>Nome exibido da taxa</label>
      <input id="svcLabel" class="field" value="${esc(o.serviceFeeLabel||'Taxa de serviço')}">

      <label>Tipo da taxa</label>
      <select id="svcType" class="field">
        <option value="percent">Percentual (%)</option>
        <option value="fixed">Valor fixo (R$)</option>
      </select>

      <label>Valor</label>
      <input id="svcValue" type="number" min="0" step=".01" class="field" value="${Number(o.serviceFeeValue||0)}">
    </div>

    <div class="cfgBlock">
      <h3>Pix para pagamento</h3>
      <p class="hint">Quando o cliente escolher Pix, estes dados irão destacados no pedido.</p>

      <label>Chave Pix</label>
      <input id="pixKeyCfg" class="field" value="${esc(o.pixKey||'')}">

      <label>Nome / identificação</label>
      <input id="pixHolderCfg" class="field" value="${esc(o.pixHolder||'')}" placeholder="Ex.: Pablo - PicPay">
    </div>

    <button class="btn full" data-pedevia-event="click" data-pedevia-call="saveServiceAndPixV111">Salvar configurações</button>
  `);

  $('#svcType').value=o.serviceFeeType||'percent';
}

async function saveServiceAndPixV111(){
  normalizeOrderExtrasV111();
  const o=cfg.store.orderConfig;

  o.serviceFeeEnabled=!!$('#svcEnabled')?.checked;
  o.serviceFeeLabel=$('#svcLabel')?.value.trim()||'Taxa de serviço';
  o.serviceFeeType=$('#svcType')?.value==='fixed'?'fixed':'percent';
  o.serviceFeeValue=Math.max(0,+($('#svcValue')?.value||0));
  o.pixKey=$('#pixKeyCfg')?.value.trim()||'';
  o.pixHolder=$('#pixHolderCfg')?.value.trim()||'';

  const ok=await persistAdminStateV15({
    products:false,
    notify:true,
    message:'Taxa de serviço e Pix salvos online.'
  });

  if(ok){
    closeModal();
    adminOrderSettings();
    renderShop();
  }
}

// Acrescenta o cartão à tela de configurações de pedidos sem mexer nos demais.
const _adminOrderSettingsV111Base=adminOrderSettings;
adminOrderSettings=function(){
  normalizeOrderExtrasV111();
  _adminOrderSettingsV111Base();

  const list=document.querySelector('#adminContent .settingsList');
  if(!list || list.querySelector('.servicePixCardV111'))return;

  const wrap=document.createElement('div');
  wrap.className='servicePixCardV111';
  wrap.innerHTML=settingCard(
    '％',
    'Taxa de serviço e Pix',
    `${serviceFeeSummaryV111()} · Pix: ${esc(pixSummaryV111())}`,
    'editServiceAndPixV111()'
  );
  list.appendChild(wrap.firstElementChild||wrap);
};

// ---------------------------------------------------------------------
// 4) Checkout: inclui taxa de serviço.
// ---------------------------------------------------------------------
function checkoutTotalsV111(){
  const sub=cartSubtotal();
  const delivery=cartDeliveryFee();
  const payAdj=paymentAdjustment(sub+delivery);
  const serviceBase=Math.max(0,sub+delivery+payAdj);
  const service=serviceFeeAmountV111(serviceBase);
  const total=Math.max(0,sub+delivery+payAdj+service);
  return {sub,delivery,payAdj,service,total};
}

showCustomerForm=function(){
  normalizeOrderExtrasV111();
  const st=window.checkoutState;
  const t=checkoutTotalsV111();
  const o=cfg.store.orderConfig;

  let h=`<div class="row"><h2 class="checkoutTitle">Finalizar pedido</h2><button class="ghost" data-pedevia-event="click" data-pedevia-call="showPaymentChoices">‹</button></div>
  <div class="summary">
    <div class="row"><b>${cart.reduce((s,i)=>s+i.qty,0)} produto(s)</b><button class="ghost" data-pedevia-event="click" data-pedevia-call="showCart">Ver itens</button></div>
    <div class="row"><b>${st.mode==='delivery'?'Entrega':st.mode==='pickup'?'Retirada':'Consumo no local'}</b><button class="ghost" data-pedevia-event="click" data-pedevia-call="showReceiveChoices">Alterar</button></div>
  </div>
  <div class="cartTotals">
    <div class="row"><span>Valor dos produtos</span><b>${brl(t.sub)}</b></div>
    ${t.delivery?`<div class="row"><span>Taxa de entrega</span><b>${brl(t.delivery)}</b></div>`:''}
    ${t.payAdj?`<div class="row"><span>${t.payAdj>0?'Taxa':'Desconto'} de pagamento</span><b>${t.payAdj>0?'+ ':''}${brl(t.payAdj)}</b></div>`:''}
    ${t.service?`<div class="row"><span>${esc(o.serviceFeeLabel||'Taxa de serviço')}</span><b>${brl(t.service)}</b></div>`:''}
    <div class="row"><strong>Total</strong><strong>${brl(t.total)}</strong></div>
  </div>

  <label>Forma de pagamento*</label>
  <button class="choiceTile" data-pedevia-event="click" data-pedevia-call="showPaymentChoices">
    <span class="bigIcon">${paymentIcon(st.payment)}</span>
    <span><b>${paymentKeyLabel(st.payment)}</b></span>
    <span style="margin-left:auto;color:var(--p);font-weight:800">Alterar</span>
  </button>


  <div class="two">
    <div><label>Seu nome*</label><input id="coName" class="field" value="${esc(st.customer||'')}"></div>
    <div><label>Celular* (WhatsApp)</label><input id="coPhone" class="field" inputmode="tel" value="${esc(st.phone||'')}"></div>
  </div>
  <label>Observações</label>
  <textarea id="coObs" class="field" placeholder="Comentários ou instruções adicionais">${esc(st.note||'')}</textarea>
  <div class="checkoutSticky"><button class="btn green" data-pedevia-event="click" data-pedevia-call="finishWhatsApp">☏ Enviar pelo WhatsApp</button></div>`;

  showModal(h);
};

// ---------------------------------------------------------------------
// 5) Pedido em texto + fallback copiável.
// ---------------------------------------------------------------------
function buildOrderTextV111(){
  normalizeOrderExtrasV111();
  const st=window.checkoutState||{};
  const o=cfg.store.orderConfig;
  const t=checkoutTotalsV111();
  const L=['🍧 *PEDIDO POINT DO AÇAÍ FRONTIN*',''];

  cart.forEach(i=>{
    const p=cfg.products.find(x=>x.id===i.pid);
    L.push(`*${i.qty}x ${p?.name||'Produto'}${i.variantName?' · '+i.variantName:''}* — ${brl(i.unit*i.qty)}`);
    (i.groups||[]).forEach(g=>L.push(`${g.name}: ${(g.items||[]).map(x=>(x.qty&&x.qty>1?x.qty+'x ':'')+x.name).join(', ')}`));
    if(i.obs)L.push('Obs.: '+i.obs);
    L.push('');
  });

  L.push(
    'Cliente: '+(st.customer||''),
    'Celular: '+(st.phone||''),
    'Tipo: '+(st.mode==='delivery'?'Entrega':st.mode==='pickup'?'Retirada':'Consumo no local')
  );

  if(st.mode==='delivery'){if(cfg.store.orderConfig?.deliveryCalc==='neighborhood'&&st.neighborhood)L.push('Bairro: '+st.neighborhood);L.push('Endereço: '+(st.address||''));}
  if(st.mode==='dinein'&&st.table)L.push('Mesa: '+st.table);

  L.push('Pagamento: '+paymentKeyLabel(st.payment),'Subtotal: '+brl(t.sub));

  if(t.delivery)L.push('Taxa de entrega: '+brl(t.delivery));
  if(t.payAdj)L.push((t.payAdj>0?'Taxa':'Desconto')+' de pagamento: '+brl(t.payAdj));
  if(t.service)L.push((o.serviceFeeLabel||'Taxa de serviço')+': '+brl(t.service));

  L.push('*TOTAL: '+brl(t.total)+'*');

  if(st.payment==='pix'&&o.pixKey){
    L.push(
      '',
      '━━━━━━━━━━━━━━━━',
      '*PIX PARA PAGAMENTO:*',
      '*'+o.pixKey+'*',
      o.pixHolder?'*'+o.pixHolder+'*':'',
      '━━━━━━━━━━━━━━━━'
    );
  }

  if(st.note)L.push('Observações: '+st.note);

  return L.filter(x=>x!==null&&x!==undefined).join('\n');
}

async function copyOrderTextV111(){
  const text=buildOrderTextV111();
  try{
    await navigator.clipboard.writeText(text);
    const b=document.getElementById('copyOrderBtnV111');
    if(b){
      const old=b.textContent;
      b.textContent='✓ Pedido copiado';
      setTimeout(()=>b.textContent=old,1800);
    }
  }catch(e){
    const ta=document.getElementById('orderTextV111');
    if(ta){
      ta.focus();ta.select();
      document.execCommand?.('copy');
    }
  }
}

function showOrderBackupV111(){
  const text=buildOrderTextV111();
  showModal(`
    <div class="row">
      <div>
        <h2 style="margin:0">Seu pedido está pronto</h2>
        <div class="hint">Se o WhatsApp não abrir ou não enviar, copie o pedido abaixo e mande para nós.</div>
      </div>
      <button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button>
    </div>

    <textarea id="orderTextV111" class="field orderBackupV111" rows="18" readonly>${esc(text)}</textarea>

    <button id="copyOrderBtnV111" class="btn full" data-pedevia-event="click" data-pedevia-call="copyOrderTextV111">📋 Copiar pedido</button>
    <button class="ghost full" style="margin-top:10px" data-pedevia-event="click" data-pedevia-call="openWhatsAppAgainV111">☏ Tentar abrir o WhatsApp novamente</button>
  `);
}

function whatsappUrlV111(){
  return 'https://wa.me/'+String(cfg.store.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(buildOrderTextV111());
}

function openWhatsAppAgainV111(){
  window.open(whatsappUrlV111(),'_blank','noopener');
}

// Ao finalizar: mostra primeiro a página de segurança e também tenta abrir WhatsApp.
// Isso garante que o pedido continue acessível no navegador do cliente.
finishWhatsApp=function(){
  const st=window.checkoutState||{};
  st.customer=$('#coName')?.value.trim()||'';
  st.phone=$('#coPhone')?.value.trim()||'';
  st.note=$('#coObs')?.value.trim()||'';

  if(!st.customer||!st.phone){
    alert('Informe seu nome e celular.');
    return;
  }

  showOrderBackupV111();

  // pequeno atraso para o fallback já estar visível antes da troca de app
  setTimeout(()=>{
    try{
      window.open(whatsappUrlV111(),'_blank','noopener');
    }catch(e){
      console.warn('WhatsApp não pôde ser aberto automaticamente.',e);
    }
  },120);
};

// ---------------------------------------------------------------------
// 6) Reforça migração/versionamento dos novos campos.
// ---------------------------------------------------------------------
const _migrateSchema1to2V111Base=migrateSchema1to2;
migrateSchema1to2=function(data){
  data=_migrateSchema1to2V111Base(data);
  data.store=data.store||{};
  data.store.orderConfig=data.store.orderConfig||{};
  const o=data.store.orderConfig;
  if(o.serviceFeeEnabled===undefined)o.serviceFeeEnabled=false;
  if(o.serviceFeeType===undefined)o.serviceFeeType='percent';
  if(o.serviceFeeValue===undefined)o.serviceFeeValue=0;
  if(o.serviceFeeLabel===undefined)o.serviceFeeLabel='Taxa de serviço';
  if(o.pixKey===undefined)o.pixKey='24998375867';
  if(o.pixHolder===undefined)o.pixHolder='Pablo - PicPay';
  return data;
};

normalizeOrderExtrasV111();

// ===== v1.13: CLUBE DE FIDELIDADE REAL =====
const CUSTOMER_CACHE_KEY='point_acai_customer_v1';

function normalizeCustomerPhoneV113(v){
  let d=String(v||'').replace(/\D/g,'');
  if(d.startsWith('55')&&d.length>11)d=d.slice(2);
  return d;
}
function loadCustomerCacheV113(){
  try{return JSON.parse(localStorage.getItem(CUSTOMER_CACHE_KEY)||'null')||{}}catch(e){return {}}
}
function saveCustomerCacheV113(name,phone){
  const data={name:String(name||'').trim(),phone:normalizeCustomerPhoneV113(phone),updatedAt:Date.now()};
  try{localStorage.setItem(CUSTOMER_CACHE_KEY,JSON.stringify(data))}catch(e){}
  return data;
}
function activeLoyaltyOfferV113(){
  normalizeOffers();
  return (cfg.offers||[]).find(o=>o.active&&o.type==='loyalty')||null;
}
async function getLoyaltyStatusV113(phone){
  const normalized=normalizeCustomerPhoneV113(phone);
  if(normalized.length<10)return null;
  try{
    const {data,error}=await supabaseClient.rpc('get_loyalty_status',{p_phone:normalized});
    if(error)throw error;
    if(Array.isArray(data))return data[0]||null;
    return data||null;
  }catch(e){
    console.warn('Não foi possível consultar fidelidade:',e);
    return null;
  }
}
function loyaltyProgressTextV113(count,offer){
  if(!offer)return '';
  const required=Math.max(1,+offer.requiredOrders||10);
  const completed=Math.max(0,+count||0);
  const progress=completed%required;
  const eligible=completed>0&&progress===0;
  const remaining=eligible?0:required-progress;
  if(eligible)return `🎉 Você completou ${required} pedidos! Seu benefício de ${offer.rewardPercent||10}% está disponível.`;
  return `⭐ Fidelidade: ${progress}/${required} pedidos. Faltam ${remaining} para ganhar ${offer.rewardPercent||10}% de desconto.`;
}
async function refreshLoyaltyForPhoneV113(phone,targetId='loyaltyCustomerStatusV113'){
  const offer=activeLoyaltyOfferV113();
  const el=document.getElementById(targetId);
  if(!offer){if(el)el.innerHTML='';return null;}
  const status=await getLoyaltyStatusV113(phone);
  if(!status){if(el)el.textContent='Seu progresso será registrado após finalizar o pedido.';return null;}
  if(el)el.textContent=loyaltyProgressTextV113(status.order_count,offer);
  return status;
}

// Pré-preenche nome e celular nas próximas compras e mostra progresso.
const _showCustomerFormV113Base=showCustomerForm;
showCustomerForm=function(){
  const cached=loadCustomerCacheV113();
  const st=window.checkoutState||{};
  if(!st.customer&&cached.name)st.customer=cached.name;
  if(!st.phone&&cached.phone)st.phone=cached.phone;

  _showCustomerFormV113Base();

  const phone=document.getElementById('coPhone');
  const name=document.getElementById('coName');
  if(name&&cached.name&&!name.value)name.value=cached.name;
  if(phone&&cached.phone&&!phone.value)phone.value=cached.phone;

  const offer=activeLoyaltyOfferV113();
  if(offer&&phone){
    const box=document.createElement('div');
    box.id='loyaltyCustomerStatusV113';
    box.className='notice loyaltyCustomerStatusV113';
    box.textContent='Digite seu celular para consultar seu progresso no Clube de Fidelidade.';
    const obs=document.getElementById('coObs');
    obs?.parentElement?.insertBefore(box,obs);

    let timer=null;
    phone.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>refreshLoyaltyForPhoneV113(phone.value),450);
    });
    if(phone.value)refreshLoyaltyForPhoneV113(phone.value);
  }
};

// ID único impede o mesmo pedido de contar duas vezes se o cliente tocar novamente.
function ensureClientOrderIdV113(){
  window.checkoutState=window.checkoutState||{};
  if(!window.checkoutState.clientOrderId){
    window.checkoutState.clientOrderId=(crypto.randomUUID?crypto.randomUUID():'ord-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  }
  return window.checkoutState.clientOrderId;
}

async function registerLoyaltyOrderV113(){
  const st=window.checkoutState||{};
  const phone=normalizeCustomerPhoneV113(st.phone);
  const name=String(st.customer||'').trim();
  if(phone.length<10||!name)return null;

  saveCustomerCacheV113(name,phone);
  const t=checkoutTotalsV111();
  const offer=activeLoyaltyOfferV113();
  const orderId=ensureClientOrderIdV113();

  try{
    const {data,error}=await supabaseClient.rpc('register_loyalty_order',{
      p_client_order_id:orderId,
      p_phone:phone,
      p_name:name,
      p_total:Number(t.total||0),
      p_order_text:buildOrderTextV111()
    });
    if(error)throw error;
    return Array.isArray(data)?data[0]||null:data;
  }catch(e){
    console.error('Falha ao registrar pedido/fidelidade:',e);
    return null;
  }
}

// Registra o pedido antes de abrir o WhatsApp, sem impedir o envio se o banco falhar.
const _finishWhatsAppV113Base=finishWhatsApp;
finishWhatsApp=async function(){
  const st=window.checkoutState||{};
  st.customer=document.getElementById('coName')?.value.trim()||'';
  st.phone=document.getElementById('coPhone')?.value.trim()||'';
  st.note=document.getElementById('coObs')?.value.trim()||'';

  if(!st.customer||!st.phone){
    alert('Informe seu nome e celular.');
    return;
  }

  saveCustomerCacheV113(st.customer,st.phone);
  ensureClientOrderIdV113();

  // Faz o registro primeiro; timeout curto para não travar a experiência.
  try{
    await Promise.race([
      registerLoyaltyOrderV113(),
      new Promise(resolve=>setTimeout(resolve,1600))
    ]);
  }catch(e){}

  return _finishWhatsAppV113Base();
};

// O banner do Clube passa a mostrar também uma área de consulta rápida.
const _renderClientOffersV113Base=renderClientOffers;
renderClientOffers=function(){
  _renderClientOffersV113Base();
  const offer=activeLoyaltyOfferV113();
  const host=document.getElementById('clientOffers');
  if(!offer||!host)return;
  if(host.querySelector('.loyaltyLookupV113'))return;

  const cached=loadCustomerCacheV113();
  const card=document.createElement('div');
  card.className='offerBanner loyaltyLookupV113';
  card.innerHTML=`
    <div class="offerIcon">★</div>
    <div style="flex:1">
      <b>Meu Clube de Fidelidade</b>
      <small id="loyaltyHomeTextV113">${cached.phone?'Consultando seu progresso...':'Seu progresso é identificado pelo seu celular no checkout.'}</small>
    </div>`;
  host.appendChild(card);

  if(cached.phone){
    getLoyaltyStatusV113(cached.phone).then(status=>{
      const el=document.getElementById('loyaltyHomeTextV113');
      if(el)el.textContent=status?loyaltyProgressTextV113(status.order_count,offer):'Seu progresso será atualizado após o próximo pedido.';
    });
  }
};

// ===== v1.14: PERFIL DO CLIENTE + FIDELIDADE ATUALIZADA IMEDIATAMENTE =====
const CUSTOMER_PROFILE_KEY_V114='point_acai_customer_profile_v2';

function loadCustomerProfileV114(){
  try{return JSON.parse(localStorage.getItem(CUSTOMER_PROFILE_KEY_V114)||'null')||{}}catch(e){return {}}
}
function saveCustomerProfileV114(extra={}){
  const st=window.checkoutState||{};
  const current=loadCustomerProfileV114();
  const data={
    ...current,
    name:String(st.customer||extra.name||current.name||'').trim(),
    phone:normalizeCustomerPhoneV113(st.phone||extra.phone||current.phone||''),
    neighborhood:String(st.neighborhood||extra.neighborhood||current.neighborhood||''),
    address:String(st.address||extra.address||current.address||''),
    reference:String(st.reference||extra.reference||current.reference||''),
    updatedAt:Date.now()
  };
  try{localStorage.setItem(CUSTOMER_PROFILE_KEY_V114,JSON.stringify(data))}catch(e){}
  // mantém compatibilidade com cache antigo
  saveCustomerCacheV113(data.name,data.phone);
  return data;
}

// Pré-preenche também endereço/bairro/referência.
const _showDeliveryFormV114Base=showDeliveryForm;
showDeliveryForm=function(){
  const cached=loadCustomerProfileV114();
  _showDeliveryFormV114Base();

  const neigh=cfg.store.orderConfig?.deliveryCalc==='neighborhood'?document.getElementById('coNeigh'):null;
  const addr=document.getElementById('coAddr');
  const ref=document.getElementById('coRef');

  if(neigh&&cached.neighborhood){
    const exists=[...neigh.options].some(o=>o.value===cached.neighborhood);
    if(exists){
      neigh.value=cached.neighborhood;
      window.checkoutState.neighborhood=cached.neighborhood;
    }
  }
  if(addr&&cached.address){
    // st.address pode ter referência anexada em versões antigas; usamos o valor salvo mais recente.
    addr.value=cached.address;
  }
  if(ref&&cached.reference)ref.value=cached.reference;
};

const _saveDeliveryAndPayV114Base=saveDeliveryAndPay;
saveDeliveryAndPay=function(){
  const addr=document.getElementById('coAddr')?.value.trim()||'';
  const ref=document.getElementById('coRef')?.value.trim()||'';
  const neigh=cfg.store.orderConfig?.deliveryCalc==='neighborhood'?(document.getElementById('coNeigh')?.value||''):'';
  if(!addr){alert('Informe o endereço de entrega.');return}

  window.checkoutState.address=addr;
  window.checkoutState.reference=ref;
  window.checkoutState.neighborhood=neigh;

  saveCustomerProfileV114({address:addr,reference:ref,neighborhood:neigh});

  // segue para pagamento sem concatenar referência no endereço salvo
  showPaymentChoices();
};

// Gera a mensagem considerando referência separadamente.
const _buildOrderTextV114Base=buildOrderTextV111;
buildOrderTextV111=function(){
  const text=_buildOrderTextV114Base();
  const st=window.checkoutState||{};
  if(st.mode!=='delivery'||!st.reference)return text;

  const lines=text.split('\n');
  const idx=lines.findIndex(x=>x.startsWith('Endereço: '));
  if(idx>=0)lines.splice(idx+1,0,'Referência: '+st.reference);
  return lines.join('\n');
};

function loyaltyUiUpdateV114(orderCount){
  const offer=activeLoyaltyOfferV113();
  if(!offer)return;
  const msg=loyaltyProgressTextV113(orderCount,offer);

  const ids=['loyaltyHomeTextV113','loyaltyCustomerStatusV113'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.textContent=msg;
  });

  try{
    const p=loadCustomerProfileV114();
    p.orderCount=Number(orderCount||0);
    localStorage.setItem(CUSTOMER_PROFILE_KEY_V114,JSON.stringify(p));
  }catch(e){}
}

// Retorna e usa o contador que veio do Supabase.
registerLoyaltyOrderV113=async function(){
  const st=window.checkoutState||{};
  const phone=normalizeCustomerPhoneV113(st.phone);
  const name=String(st.customer||'').trim();
  if(phone.length<10||!name)return null;

  saveCustomerProfileV114({name,phone});

  const t=checkoutTotalsV111();
  const orderId=ensureClientOrderIdV113();

  try{
    const {data,error}=await supabaseClient.rpc('register_loyalty_order',{
      p_client_order_id:orderId,
      p_phone:phone,
      p_name:name,
      p_total:Number(t.total||0),
      p_order_text:buildOrderTextV111()
    });
    if(error)throw error;

    const result=Array.isArray(data)?data[0]||null:data;
    if(result&&result.order_count!==undefined){
      loyaltyUiUpdateV114(result.order_count);
    }
    return result;
  }catch(e){
    console.error('Falha ao registrar pedido/fidelidade:',e);
    return null;
  }
};

// Pré-preenche nome/celular usando perfil completo.
const _showCustomerFormV114Base=showCustomerForm;
showCustomerForm=function(){
  const cached=loadCustomerProfileV114();
  const st=window.checkoutState||{};
  if(!st.customer&&cached.name)st.customer=cached.name;
  if(!st.phone&&cached.phone)st.phone=cached.phone;

  _showCustomerFormV114Base();

  const n=document.getElementById('coName');
  const p=document.getElementById('coPhone');
  if(n&&cached.name&&!n.value)n.value=cached.name;
  if(p&&cached.phone&&!p.value)p.value=cached.phone;

  if(p?.value)refreshLoyaltyForPhoneV113(p.value);
};

// Finalização: salva perfil, registra pedido, atualiza fidelidade e só então abre fallback/WhatsApp.
// Se o Supabase demorar ou falhar, o pedido continua normalmente.
finishWhatsApp=async function(){
  const st=window.checkoutState||{};
  st.customer=document.getElementById('coName')?.value.trim()||'';
  st.phone=document.getElementById('coPhone')?.value.trim()||'';
  st.note=document.getElementById('coObs')?.value.trim()||'';

  if(!st.customer||!st.phone){
    alert('Informe seu nome e celular.');
    return;
  }

  saveCustomerProfileV114({name:st.customer,phone:st.phone});
  ensureClientOrderIdV113();

  let loyaltyResult=null;
  try{
    loyaltyResult=await Promise.race([
      registerLoyaltyOrderV113(),
      new Promise(resolve=>setTimeout(()=>resolve(null),2500))
    ]);
  }catch(e){}

  // mostra a tela de segurança com progresso atualizado quando disponível
  showOrderBackupV111();

  const offer=activeLoyaltyOfferV113();
  if(offer){
    const sheet=document.getElementById('sheet');
    if(sheet){
      const box=document.createElement('div');
      box.className='notice loyaltyAfterOrderV114';
      box.style.marginTop='12px';
      if(loyaltyResult?.order_count!==undefined){
        box.textContent=loyaltyProgressTextV113(loyaltyResult.order_count,offer);
      }else{
        box.textContent='Seu pedido foi finalizado. O progresso da fidelidade será atualizado automaticamente.';
      }
      sheet.appendChild(box);
    }
  }

  setTimeout(()=>{
    try{window.open(whatsappUrlV111(),'_blank','noopener')}
    catch(e){console.warn('WhatsApp não pôde ser aberto automaticamente.',e)}
  },120);
};

// Home: sempre consulta online quando houver telefone salvo.
const _renderClientOffersV114Base=renderClientOffers;
renderClientOffers=function(){
  _renderClientOffersV114Base();
  const offer=activeLoyaltyOfferV113();
  if(!offer)return;
  const cached=loadCustomerProfileV114();
  const el=document.getElementById('loyaltyHomeTextV113');
  if(cached.phone&&el){
    el.textContent='Atualizando seu progresso...';
    getLoyaltyStatusV113(cached.phone).then(status=>{
      if(!el.isConnected)return;
      if(status?.order_count!==undefined){
        el.textContent=loyaltyProgressTextV113(status.order_count,offer);
        loyaltyUiUpdateV114(status.order_count);
      }else{
        el.textContent='Seu progresso começará após o primeiro pedido finalizado.';
      }
    });
  }
};

// ===== v1.15: PERFIL ONLINE REAL + MEU CLUBE CLICÁVEL =====
const CUSTOMER_PHONE_CACHE_V115='point_acai_customer_phone_v3';

function cacheCustomerPhoneV115(phone){
  const p=normalizeCustomerPhoneV113(phone);
  if(p.length>=10){
    try{localStorage.setItem(CUSTOMER_PHONE_CACHE_V115,p)}catch(e){}
  }
  return p;
}
function getCachedCustomerPhoneV115(){
  try{return localStorage.getItem(CUSTOMER_PHONE_CACHE_V115)||''}catch(e){return ''}
}

async function getCustomerProfileV115(phone){
  const p=normalizeCustomerPhoneV113(phone);
  if(p.length<10)return null;
  try{
    const {data,error}=await supabaseClient.rpc('get_customer_profile_v2',{p_phone:p});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]||null:data;
    return row||null;
  }catch(e){
    console.error('Erro ao consultar perfil do cliente:',e);
    return null;
  }
}

async function upsertCustomerProfileV115(profile={}){
  const phone=normalizeCustomerPhoneV113(profile.phone);
  if(phone.length<10)return null;
  cacheCustomerPhoneV115(phone);
  try{
    const {data,error}=await supabaseClient.rpc('upsert_customer_profile_v2',{
      p_phone:phone,
      p_name:String(profile.name||'').trim(),
      p_neighborhood:String(profile.neighborhood||'').trim(),
      p_address:String(profile.address||'').trim(),
      p_reference:String(profile.reference||'').trim()
    });
    if(error)throw error;
    return Array.isArray(data)?data[0]||null:data;
  }catch(e){
    console.error('Erro ao salvar perfil do cliente:',e);
    return null;
  }
}

function loyaltyModalContentV115(profile,offer){
  const count=Number(profile?.order_count||0);
  const required=Math.max(1,+offer?.requiredOrders||10);
  const progress=count%required;
  const eligible=count>0&&progress===0;
  const remaining=eligible?0:required-progress;

  return `
    <div class="loyaltyBigV115">${eligible?'🎉':'⭐'}</div>
    <h3>${esc(profile?.name||'Cliente')}</h3>
    <div class="loyaltyProgressBarV115">
      <span style="width:${Math.min(100,(eligible?required:progress)/required*100)}%"></span>
    </div>
    <div class="loyaltyNumbersV115">
      <b>${eligible?required:progress}/${required} pedidos</b>
    </div>
    <p>${eligible
      ? `Você completou a meta e tem ${offer?.rewardPercent||10}% de desconto disponível.`
      : `Faltam ${remaining} pedido(s) para ganhar ${offer?.rewardPercent||10}% de desconto.`}
    </p>
  `;
}

function openMyLoyaltyV115(){
  const offer=activeLoyaltyOfferV113();
  const cached=getCachedCustomerPhoneV115();
  showModal(`
    <div class="row">
      <h2>Meu Clube de Fidelidade</h2>
      <button class="ghost" data-pedevia-event="click" data-pedevia-call="closeModal">✕</button>
    </div>
    <p class="hint">Digite o celular usado nos seus pedidos.</p>
    <label>Celular</label>
    <input id="loyaltyPhoneV115" class="field" inputmode="tel" value="${esc(cached)}" placeholder="Ex.: 24999999999">
    <button class="btn full" data-pedevia-event="click" data-pedevia-call="lookupMyLoyaltyV115">Consultar meu progresso</button>
    <div id="loyaltyResultV115" class="loyaltyResultV115"></div>
  `);
  if(cached)setTimeout(()=>lookupMyLoyaltyV115(),50);
}

async function lookupMyLoyaltyV115(){
  const input=document.getElementById('loyaltyPhoneV115');
  const result=document.getElementById('loyaltyResultV115');
  const phone=normalizeCustomerPhoneV113(input?.value||'');
  if(phone.length<10){
    if(result)result.innerHTML='<div class="notice bad">Informe um celular válido.</div>';
    return;
  }
  cacheCustomerPhoneV115(phone);
  if(result)result.innerHTML='<div class="notice">Consultando...</div>';
  const profile=await getCustomerProfileV115(phone);
  const offer=activeLoyaltyOfferV113();

  if(!profile){
    if(result)result.innerHTML='<div class="notice">Ainda não encontramos pedidos para este celular.</div>';
    return;
  }

  if(result)result.innerHTML=loyaltyModalContentV115(profile,offer);
  updateLoyaltyDisplaysV115(profile);
}

function updateLoyaltyDisplaysV115(profile){
  const offer=activeLoyaltyOfferV113();
  if(!offer||!profile)return;
  const msg=loyaltyProgressTextV113(profile.order_count,offer);

  const home=document.getElementById('loyaltyHomeTextV113');
  if(home)home.textContent=msg;

  const checkout=document.getElementById('loyaltyCustomerStatusV113');
  if(checkout)checkout.textContent=msg;
}

async function loadKnownCustomerV115(){
  const phone=getCachedCustomerPhoneV115();
  if(phone.length<10)return null;
  const profile=await getCustomerProfileV115(phone);
  if(profile)updateLoyaltyDisplaysV115(profile);
  return profile;
}

// Endereço agora também busca perfil online.
showDeliveryForm=function(){
  const cachedPhone=getCachedCustomerPhoneV115();
  _showDeliveryFormV114Base();

  if(cachedPhone){
    getCustomerProfileV115(cachedPhone).then(profile=>{
      if(!profile)return;
      const neigh=cfg.store.orderConfig?.deliveryCalc==='neighborhood'?document.getElementById('coNeigh'):null;
      const addr=document.getElementById('coAddr');
      const ref=document.getElementById('coRef');

      if(neigh&&profile.neighborhood){
        const exists=[...neigh.options].some(o=>o.value===profile.neighborhood);
        if(exists){
          neigh.value=profile.neighborhood;
          window.checkoutState.neighborhood=profile.neighborhood;
        }
      }
      if(addr&&profile.address)addr.value=profile.address;
      if(ref&&profile.reference)ref.value=profile.reference;
    });
  }
};

saveDeliveryAndPay=function(){
  const addr=document.getElementById('coAddr')?.value.trim()||'';
  const ref=document.getElementById('coRef')?.value.trim()||'';
  const neigh=cfg.store.orderConfig?.deliveryCalc==='neighborhood'?(document.getElementById('coNeigh')?.value||''):'';
  if(!addr){alert('Informe o endereço de entrega.');return}

  window.checkoutState.address=addr;
  window.checkoutState.reference=ref;
  window.checkoutState.neighborhood=neigh;

  showPaymentChoices();
};

// Checkout: preenche nome/celular e mostra progresso real do banco.
showCustomerForm=function(){
  const cachedPhone=getCachedCustomerPhoneV115();
  const st=window.checkoutState||{};
  if(!st.phone&&cachedPhone)st.phone=cachedPhone;

  _showCustomerFormV114Base();

  const phone=document.getElementById('coPhone');
  const name=document.getElementById('coName');

  if(cachedPhone){
    getCustomerProfileV115(cachedPhone).then(profile=>{
      if(!profile)return;
      if(name&&!name.value)name.value=profile.name||'';
      if(phone&&!phone.value)phone.value=profile.phone||cachedPhone;
      updateLoyaltyDisplaysV115(profile);
    });
  }

  if(phone){
    let timer=null;
    phone.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(async()=>{
        const p=normalizeCustomerPhoneV113(phone.value);
        if(p.length<10)return;
        const profile=await getCustomerProfileV115(p);
        if(profile){
          if(name&&!name.value)name.value=profile.name||'';
          updateLoyaltyDisplaysV115(profile);
        }else{
          const el=document.getElementById('loyaltyCustomerStatusV113');
          if(el)el.textContent='Este será seu primeiro pedido no Clube de Fidelidade.';
        }
      },450);
    });
  }
};

// Finalização real: perfil + pedido + fidelidade, tudo no banco.
async function registerOrderAndCustomerV115(){
  const st=window.checkoutState||{};
  const phone=normalizeCustomerPhoneV113(st.phone);
  if(phone.length<10)throw new Error('Telefone inválido');

  cacheCustomerPhoneV115(phone);

  // Primeiro salva/atualiza o perfil completo.
  await upsertCustomerProfileV115({
    phone,
    name:st.customer,
    neighborhood:st.neighborhood||'',
    address:st.address||'',
    reference:st.reference||''
  });

  // Depois registra o pedido e incrementa fidelidade.
  const t=checkoutTotalsV111();
  const orderId=ensureClientOrderIdV113();

  const {data,error}=await supabaseClient.rpc('register_customer_order_v2',{
    p_client_order_id:orderId,
    p_phone:phone,
    p_name:String(st.customer||'').trim(),
    p_neighborhood:String(st.neighborhood||''),
    p_address:String(st.address||''),
    p_reference:String(st.reference||''),
    p_total:Number(t.total||0),
    p_order_text:buildOrderTextV111()
  });
  if(error)throw error;

  const result=Array.isArray(data)?data[0]||null:data;
  if(result)updateLoyaltyDisplaysV115(result);
  return result;
}

finishWhatsApp=async function(){
  const st=window.checkoutState||{};
  st.customer=document.getElementById('coName')?.value.trim()||'';
  st.phone=document.getElementById('coPhone')?.value.trim()||'';
  st.note=document.getElementById('coObs')?.value.trim()||'';

  if(!st.customer||!st.phone){
    alert('Informe seu nome e celular.');
    return;
  }

  const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Enviar pelo WhatsApp'));
  const old=btn?.textContent||'Enviar pelo WhatsApp';
  if(btn){btn.disabled=true;btn.textContent='Salvando pedido...';}

  let profile=null;
  try{
    profile=await registerOrderAndCustomerV115();
  }catch(e){
    console.error('Erro ao salvar cliente/pedido:',e);
    if(btn){btn.disabled=false;btn.textContent=old;}
    alert('Não conseguimos registrar seu pedido no sistema. Tente novamente.');
    return;
  }

  showOrderBackupV111();

  const offer=activeLoyaltyOfferV113();
  if(profile&&offer){
    const sheet=document.getElementById('sheet');
    const box=document.createElement('div');
    box.className='notice loyaltyAfterOrderV114';
    box.style.marginTop='12px';
    box.textContent=loyaltyProgressTextV113(profile.order_count,offer);
    sheet?.appendChild(box);
  }

  setTimeout(()=>{
    try{window.open(whatsappUrlV111(),'_blank','noopener')}
    catch(e){console.warn(e)}
  },120);
};

// Meu Clube vira clicável.
const _renderClientOffersV115Base=renderClientOffers;
renderClientOffers=function(){
  _renderClientOffersV115Base();
  const offer=activeLoyaltyOfferV113();
  if(!offer)return;

  const card=document.querySelector('.loyaltyLookupV113');
  if(card){
    card.style.cursor='pointer';
    card.onclick=()=>openMyLoyaltyV115();
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')openMyLoyaltyV115()};
  }

  loadKnownCustomerV115();
};

// Ao iniciar o site, consulta o progresso salvo no Supabase.
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>loadKnownCustomerV115(),700);
});

// Inicialização movida para a camada multi-loja v1.21.

document.addEventListener("DOMContentLoaded",()=>{restoreAdminSession()});

/* PEDEVIA CSP MIGRATION — CATEGORY TABS */
document.addEventListener("click",function(e){
  const btn=e.target&&e.target.closest?e.target.closest("[data-pedevia-category]"):null;
  if(!btn)return;
  e.preventDefault();
  activeCat=btn.getAttribute("data-pedevia-category")||activeCat;
  renderShop();
});

/* PEDEVIA CSP MIGRATION — OPEN PRODUCT */
document.addEventListener("click",function(e){
  const el=e.target&&e.target.closest?e.target.closest("[data-pedevia-open-product]"):null;
  if(!el)return;
  e.preventDefault();
  const pid=el.getAttribute("data-pedevia-open-product");
  if(pid && typeof openProduct==="function") openProduct(pid);
});
