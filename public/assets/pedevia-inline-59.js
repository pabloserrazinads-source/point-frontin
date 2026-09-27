/* Pedevia v1.34.3 — conversão, fluidez e carrinho flutuante alinhado. */
(function(){
  'use strict';
  const VERSION='1.34.3';
  const CART_TTL=6*60*60*1000;
  let favoritesOnly=false;
  let restoring=false;

  const storeId=()=>{
    try{return typeof storeKey==='function'?String(storeKey()):String(cfg?.store?.hubSlug||cfg?.store?.name||'default')}
    catch(_e){return 'default'}
  };
  const cartKey=()=>`pedevia:cart-recovery:${storeId()}`;
  const favoriteIds=()=>{
    try{return new Set((JSON.parse(localStorage.getItem(`pedevia:${storeId()}:v133:favorites`)||'[]')||[]).map(String))}
    catch(_e){return new Set()}
  };

  function saveCartRecovery(){
    if(restoring)return;
    try{
      if(!Array.isArray(cart)||!cart.length){localStorage.removeItem(cartKey());return}
      localStorage.setItem(cartKey(),JSON.stringify({at:Date.now(),items:cart}));
    }catch(_e){}
  }
  function clearCartRecovery(){try{localStorage.removeItem(cartKey())}catch(_e){}}
  function restoreCart(){
    if(!Array.isArray(cart)||cart.length)return false;
    try{
      const saved=JSON.parse(localStorage.getItem(cartKey())||'null');
      if(!saved?.at||Date.now()-saved.at>CART_TTL||!Array.isArray(saved.items)){clearCartRecovery();return false}
      const products=new Map((cfg.products||[]).map(p=>[String(p.id),p]));
      const valid=saved.items.filter(i=>products.get(String(i.pid))?.status==='available');
      if(!valid.length){clearCartRecovery();return false}
      restoring=true;cart=JSON.parse(JSON.stringify(valid));restoring=false;
      if(typeof updateCart==='function')updateCart();
      showRecoveryNotice();
      return true;
    }catch(_e){restoring=false;clearCartRecovery();return false}
  }
  function showRecoveryNotice(){
    if(document.getElementById('v134Recovery'))return;
    const bar=document.getElementById('cartBar');if(!bar)return;
    const n=document.createElement('div');n.id='v134Recovery';n.className='v134Recovery';
    n.innerHTML='<span>✓ Seu carrinho foi recuperado</span><button type="button" onclick="this.parentNode.remove()">×</button>';
    bar.parentNode.insertBefore(n,bar);setTimeout(()=>n.remove(),5000);
  }

  function productIdFromCard(card){
    const raw=card?.getAttribute('data-pedevia-open-product')||card?.getAttribute('onclick')||'';
    return String(raw).match(/openProduct\(['\"]([^'\"]+)/)?.[1]||String(raw).replace(/^.*open-product[^=]*=/,'').trim();
  }
  function applyCustomerFilters(){
    if(typeof mode!=='undefined'&&mode!=='shop')return;
    const q=String(document.getElementById('v130SearchInput')?.value||'').trim().toLowerCase();
    const fav=favoriteIds();let visible=0;
    document.querySelectorAll('#productGrid .card').forEach(card=>{
      const id=productIdFromCard(card),matchesText=!q||(card.dataset.search||card.textContent||'').toLowerCase().includes(q);
      const matchesFavorite=!favoritesOnly||fav.has(String(id));
      const show=matchesText&&matchesFavorite;card.style.display=show?'':'none';if(show)visible++;
    });
    document.querySelectorAll('#productGrid .clientSection').forEach(section=>{
      const any=[...section.querySelectorAll('.card')].some(c=>c.style.display!=='none');section.style.display=any?'':'none';
    });
    let empty=document.getElementById('v134NoResults');
    if(!empty){empty=document.createElement('div');empty.id='v134NoResults';empty.className='emptySection v134NoResults';empty.textContent='Nenhum produto encontrado. Tente outro nome ou remova o filtro.';document.getElementById('productGrid')?.appendChild(empty)}
    empty.hidden=visible!==0;
  }
  window.toggleFavoritesFilterV134=function(){
    favoritesOnly=!favoritesOnly;const b=document.getElementById('v134FavoritesFilter');
    if(b){b.classList.toggle('on',favoritesOnly);b.setAttribute('aria-pressed',String(favoritesOnly));b.innerHTML=(favoritesOnly?'♥':'♡')+' Favoritos'}
    applyCustomerFilters();
  };
  function enhanceSearch(){
    const tools=document.getElementById('v130ShopTools');if(!tools)return;
    let b=document.getElementById('v134FavoritesFilter');
    if(!b){b=document.createElement('button');b.id='v134FavoritesFilter';b.type='button';b.className='v134FavoritesFilter';b.setAttribute('aria-pressed','false');b.innerHTML='♡ Favoritos';b.onclick=toggleFavoritesFilterV134;tools.appendChild(b)}
    const input=document.getElementById('v130SearchInput');if(input&&!input.dataset.v134){input.dataset.v134='1';input.addEventListener('input',applyCustomerFilters)}
    applyCustomerFilters();
  }

  function recommendations(){
    const inCart=new Set((cart||[]).map(i=>String(i.pid)));
    return (cfg.products||[]).filter(p=>p.status==='available'&&!inCart.has(String(p.id))).sort((a,b)=>
      ((b.bestSeller?6:0)+(b.featured?4:0)+(b.isNew?2:0))-((a.bestSeller?6:0)+(a.featured?4:0)+(a.isNew?2:0))
    ).slice(0,3);
  }
  window.openRecommendationV134=function(id){closeModal();setTimeout(()=>openProduct(String(id)),60)};
  function decorateCart(){
    const sheet=document.getElementById('sheet');if(!sheet||!document.getElementById('modal')?.classList.contains('show')||sheet.querySelector('.v134Recommend'))return;
    const products=recommendations();if(!products.length||!Array.isArray(cart)||!cart.length)return;
    const box=document.createElement('section');box.className='v134Recommend';
    box.innerHTML=`<div class="v134RecommendHead"><b>Que tal acrescentar?</b><small>Sugestões disponíveis agora</small></div><div class="v134RecommendList">${products.map(p=>`<button type="button" onclick="openRecommendationV134(${JSON.stringify(String(p.id)).replace(/"/g,'&quot;')})"><span>${p.image?`<img src="${esc(p.image)}" alt="">`:'🍧'}</span><b>${esc(p.name)}</b><small>${typeof brl==='function'?brl(+p.price||0):''}</small></button>`).join('')}</div>`;
    const totals=sheet.querySelector('.cartTotals');(totals||sheet.querySelector('.cartActions'))?.before(box);
    const minimum=Number(cfg.store?.minimumOrder||0),subtotal=typeof sum==='function'?sum():0;
    if(minimum>0&&subtotal<minimum){const p=document.createElement('div');p.className='v134Minimum';const pct=Math.max(0,Math.min(100,subtotal/minimum*100));p.innerHTML=`<div><b>Faltam ${brl(minimum-subtotal)} para o pedido mínimo</b><span>${brl(subtotal)} de ${brl(minimum)}</span></div><i><em style="width:${pct}%"></em></i>`;box.before(p)}
  }

  function addScrollButton(){
    if(document.getElementById('v134Top'))return;
    const b=document.createElement('button');b.id='v134Top';b.className='v134Top';b.type='button';b.setAttribute('aria-label','Voltar ao início');b.textContent='↑';b.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});document.body.appendChild(b);
    const sync=()=>b.classList.toggle('show',window.scrollY>700&&mode==='shop');window.addEventListener('scroll',sync,{passive:true});sync();
  }

  if(typeof updateCart==='function'){
    const baseUpdate=updateCart;updateCart=function(){const r=baseUpdate.apply(this,arguments);saveCartRecovery();return r};window.updateCart=updateCart;
  }
  if(typeof showCart==='function'){
    const baseCart=showCart;showCart=function(){const r=baseCart.apply(this,arguments);setTimeout(decorateCart,0);return r};window.showCart=showCart;
  }
  if(typeof createOnlineOrderV125==='function'){
    const baseCreate=createOnlineOrderV125;createOnlineOrderV125=async function(){const row=await baseCreate.apply(this,arguments);if(row)clearCartRecovery();return row};window.createOnlineOrderV125=createOnlineOrderV125;
  }
  if(typeof renderShop==='function'){
    const baseRender=renderShop;renderShop=function(){const r=baseRender.apply(this,arguments);setTimeout(()=>{enhanceSearch();addScrollButton()},0);return r};window.renderShop=renderShop;
  }
  if(window.PedeviaV130?.filterProducts){
    const baseFilter=PedeviaV130.filterProducts.bind(PedeviaV130);PedeviaV130.filterProducts=function(v){baseFilter(v);applyCustomerFilters()};
  }

  const style=document.createElement('style');style.id='pedeviaV134Css';style.textContent=`
    .v134FavoritesFilter{border:1px solid #d8ccdf;background:#fff;color:var(--p);border-radius:999px;padding:10px 13px;font-weight:800;white-space:nowrap}.v134FavoritesFilter.on{background:var(--p);color:#fff;border-color:var(--p)}
    #v130ShopTools{display:flex;gap:8px;align-items:center}.v130Search{flex:1}.v134NoResults{margin:16px 0}.v134Recovery{position:fixed;left:50%;bottom:91px;transform:translateX(-50%);z-index:25;background:#244f3b;color:#fff;border-radius:999px;padding:10px 12px 10px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 28px #0003;white-space:nowrap}.v134Recovery button{border:0;background:#ffffff26;color:#fff;border-radius:50%;width:27px;height:27px}
    .v134Recommend{margin:16px 0}.v134RecommendHead b,.v134RecommendHead small{display:block}.v134RecommendHead small{color:var(--muted);margin-top:3px}.v134RecommendList{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.v134RecommendList button{min-width:0;border:1px solid var(--line);background:#fff;border-radius:15px;padding:9px;text-align:left;color:var(--ink)}.v134RecommendList button>span{height:62px;border-radius:11px;background:#f4edf7;display:grid;place-items:center;font-size:27px;overflow:hidden}.v134RecommendList img{width:100%;height:100%;object-fit:cover}.v134RecommendList b,.v134RecommendList small{display:block;overflow:hidden;text-overflow:ellipsis}.v134RecommendList b{margin-top:7px;font-size:13px;line-height:1.25}.v134RecommendList small{margin-top:4px;color:var(--p);font-weight:800}.v134Minimum{background:#fff7df;border-radius:14px;padding:12px;margin:13px 0}.v134Minimum div{display:flex;justify-content:space-between;gap:8px;font-size:12px}.v134Minimum span{color:var(--muted);white-space:nowrap}.v134Minimum i{display:block;height:7px;background:#eadfbd;border-radius:99px;margin-top:8px;overflow:hidden}.v134Minimum em{display:block;height:100%;background:var(--p);border-radius:inherit}.v134Top{position:fixed;right:18px;bottom:92px;z-index:18;width:44px;height:44px;border:0;border-radius:50%;background:var(--p);color:#fff;font-size:24px;box-shadow:0 7px 24px #0003;opacity:0;pointer-events:none;transform:translateY(8px);transition:.2s}.v134Top.show{opacity:1;pointer-events:auto;transform:none}
    #cartBar{left:14px!important;right:14px!important;bottom:14px!important;width:auto!important;max-width:620px!important;margin:0 auto!important;transform:none!important;border-radius:24px!important;overflow:hidden!important;box-shadow:0 10px 30px rgba(80,32,105,.28)!important;background:linear-gradient(100deg,var(--p),var(--p2))!important}
    #cartBar button{height:74px!important;min-height:74px!important;border-radius:24px!important;padding:0 22px!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;font-size:18px!important;line-height:1!important}
    #cartBar button>span,#cartBar button>b{display:flex!important;align-items:center!important;justify-content:center!important;height:100%!important;margin:0!important;line-height:1!important;white-space:nowrap!important}
    #cartBar button>span:first-child{gap:7px!important;font-size:18px!important;font-weight:800!important}
    #cartBar button>span:last-child{font-size:18px!important;font-weight:750!important;opacity:.92!important}
    #cartBar #cartCount,#cartBar #cartTotal{font-size:20px!important;font-weight:900!important;line-height:1!important}
    button,.card{-webkit-tap-highlight-color:transparent}.card:active,button:active{transform:scale(.985)}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid color-mix(in srgb,var(--p) 35%,transparent);outline-offset:2px}
    @media(max-width:430px){#v130ShopTools{align-items:stretch;flex-direction:column}.v134FavoritesFilter{align-self:flex-start}.v134RecommendList button>span{height:54px}.v134RecommendList b{font-size:12px}.v134Minimum div{display:block}.v134Minimum span{display:block;margin-top:3px}#cartBar button{padding:0 16px!important;gap:8px!important;font-size:17px!important}#cartBar button>span:first-child,#cartBar button>span:last-child{font-size:17px!important}#cartBar #cartCount,#cartBar #cartTotal{font-size:19px!important}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  `;document.head.appendChild(style);

  function boot(){window.PEDEVIA_VERSION=VERSION;enhanceSearch();addScrollButton();restoreCart()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150),{once:true});else setTimeout(boot,150);
})();
