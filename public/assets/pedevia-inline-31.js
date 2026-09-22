
// ===== v1.32.18: CHECKOUT RESPEITA O MODO DE TAXA =====
(function(){
 window.PEDEVIA_VERSION='1.32.53';
 function normalize(){const s=window.cfg?.store,o=s?.orderConfig;if(!o)return;if(!['fixed','neighborhood'].includes(o.deliveryCalc))o.deliveryCalc='fixed';if(o.deliveryCalc==='fixed'){o.deliveryFixedFee=Number(o.deliveryFixedFee??s.deliveryFee??0)||0;s.deliveryFee=o.deliveryFixedFee;}}
 normalize();
 window.addEventListener('pageshow',()=>{normalize();try{renderShop()}catch(e){}});
})();
