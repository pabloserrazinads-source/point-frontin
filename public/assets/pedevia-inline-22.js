
// ===== v1.32.0: APARÊNCIA POR RAMO + PRODUTOS ESTÁVEIS + FEEDBACK GLOBAL =====
(function(){

  const style132=document.createElement('style');
  style132.id='pedeviaV132Styles';
  style132.textContent=`
    .brandPreview,.brandPreviewV13119{
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      text-align:center!important;
    }
    .brandFallback,.brandFallbackV13119,.brandFallbackV132{
      width:118px!important;
      height:118px!important;
      padding:12px!important;
      box-sizing:border-box!important;
      border-radius:22px!important;
      border:1px dashed #999!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      text-align:center!important;
      font-size:13px!important;
      line-height:1.15!important;
      font-weight:850!important;
      white-space:normal!important;
      overflow-wrap:anywhere!important;
      word-break:normal!important;
      color:#666!important;
      background:#fff!important;
    }
    .v132TemplateGroup{
      border:1px solid var(--line,#e8e1ea);
      border-radius:18px;
      background:var(--card,#fff);
      margin:10px 0;
      overflow:hidden;
    }
    .v132TemplateGroup summary{
      cursor:pointer;
      list-style:none;
      padding:15px 16px;
      display:flex;
      justify-content:space-between;
      gap:10px;
      align-items:center;
      font-weight:900;
    }
    .v132TemplateGroup summary::-webkit-details-marker{display:none}
    .v132TemplateGroup summary span:last-child{font-size:12px;color:var(--muted,#777);font-weight:700}
    .v132TemplateGrid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
      padding:0 12px 14px;
    }
    @media(min-width:760px){
      .v132TemplateGrid{grid-template-columns:repeat(4,minmax(0,1fr))}
    }
    .v132TemplateCard{
      border:1px solid var(--line,#ddd);
      border-radius:15px;
      background:#fff;
      padding:8px;
      text-align:left;
      position:relative;
    }
    .v132TemplateCard.on{
      outline:3px solid var(--p,#712489);
      outline-offset:0;
    }
    .v132TemplateCard .v132Mini{
      height:82px;
      border-radius:11px;
      overflow:hidden;
      margin-bottom:7px;
      padding:6px;
      box-sizing:border-box;
    }
    .v132MiniHead{height:12px;border-radius:5px;margin-bottom:5px;font-size:6px;padding:2px 4px;overflow:hidden}
    .v132MiniHero{height:34px;border-radius:7px;margin-bottom:5px;font-size:7px;color:white;padding:6px;font-weight:800}
    .v132MiniCards{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
    .v132MiniCards i{height:16px;border-radius:5px;display:block}
    .v132TemplateCard b{display:block;font-size:12px}
    .v132TemplateCard small{display:block;font-size:10px;color:#777;margin-top:2px}
    .v132ManualBox{
      margin-top:14px;border:1px solid var(--line,#ddd);border-radius:18px;background:var(--card,#fff);overflow:hidden
    }
    .v132ManualBox>summary{cursor:pointer;padding:15px 16px;font-weight:900}
    .v132ManualInner{padding:0 14px 16px}
    .v132Busy{
      opacity:.78!important;
      cursor:wait!important;
      pointer-events:none!important;
    }
  `;
  document.head.appendChild(style132);

  function hexRgbV132(hex){
    let h=String(hex||'#000000').replace('#','');
    if(h.length===3)h=h.split('').map(x=>x+x).join('');
    const n=parseInt(h,16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
  function rgbHexV132(r,g,b){
    return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  }
  function mixV132(a,b,t){
    const A=hexRgbV132(a),B=hexRgbV132(b),x=Math.max(0,Math.min(1,t));
    return rgbHexV132(A.r+(B.r-A.r)*x,A.g+(B.g-A.g)*x,A.b+(B.b-A.b)*x);
  }
  function contrastTextV132(bg){
    const c=hexRgbV132(bg),lum=(c.r*299+c.g*587+c.b*114)/1000;
    return lum>145?'#242124':'#ffffff';
  }

  const TEMPLATE_GROUPS_V132={
    acai:{label:'Açaí',emoji:'🫐',palettes:[
      ['Açaí Roxo','#64207d','#b13bb5'],['Berry Premium','#3e173f','#aa426f'],['Uva Pop','#6534b8','#df4d9f'],['Amazônia','#3f6b42','#7f2d7d'],['Açaí Neon','#4c1874','#ff4fa2']
    ]},
    lanchonete:{label:'Lanchonete',emoji:'🥪',palettes:[
      ['Lanche Clássico','#d9482f','#f3a229'],['Chapa Quente','#b52c24','#ffca3a'],['Snack Verde','#3e7c45','#f1a12d'],['Lanche Urbano','#263238','#ef6c35'],['Fast Fresh','#00897b','#ff9f1c']
    ]},
    pizzaria:{label:'Pizzaria',emoji:'🍕',palettes:[
      ['Italiana','#b3262d','#2f7044'],['Forno a Lenha','#8c3528','#d48a3d'],['Napolitana','#a71930','#e5b044'],['Toscana','#6b3a28','#738c3d'],['Pizza Moderna','#d64032','#1f5f55']
    ]},
    hamburgueria:{label:'Hamburgueria',emoji:'🍔',palettes:[
      ['Burger Black','#171717','#e4572e'],['Smash','#2a2422','#f6a623'],['American Burger','#ba2636','#244c8a'],['Brasa','#5d211b','#e56b2f'],['Street Burger','#20282b','#e9b949']
    ]},
    neutra:{label:'Neutra / diversos',emoji:'◻️',palettes:[
      ['Minimal','#37474f','#78909c'],['Azul Profissional','#2457a7','#42a5f5'],['Verde Clean','#39745b','#8ebf8b'],['Grafite','#343434','#8a8a8a'],['Roxo Corporativo','#55406f','#9c7bb2']
    ]},
    doceria:{label:'Doceria e confeitaria',emoji:'🧁',palettes:[
      ['Doce Rosa','#c94f7c','#f3a9bc'],['Chocolate','#5d3a2b','#c38b5f'],['Lavanda','#8066a8','#d3b7e5'],['Caramelo','#a96334','#e7b267'],['Red Velvet','#8e2635','#d87383']
    ]},
    sorveteria:{label:'Sorveteria',emoji:'🍦',palettes:[
      ['Gelato Pastel','#7a65b3','#ef9fbd'],['Menta','#2c9b90','#8fd8c8'],['Blue Ice','#4b7cc4','#79c9e8'],['Frutas','#ef6b6b','#f5c15f'],['Uva Cream','#8861a8','#d5a3d4']
    ]},
    cafeteria:{label:'Cafeteria',emoji:'☕',palettes:[
      ['Café Clássico','#5c4033','#b88963'],['Espresso','#2d2926','#8c694f'],['Café Verde','#526447','#b69262'],['Mocha','#6a4437','#c4876d'],['Coffee Modern','#3b3532','#c7a17a']
    ]},
    restaurante:{label:'Restaurante / marmitaria',emoji:'🍽️',palettes:[
      ['Restaurante Verde','#376447','#d39b45'],['Bistrô','#593c42','#b98255'],['Marmita Fresh','#277363','#e0a63b'],['Caseiro','#8b542d','#708d45'],['Executivo','#264653','#e76f51']
    ]}
  };

  const MOODS_V132=[
    {name:'Clássico',dark:false,gradient:false,cardStyle:'elevated',radius:18,shadow:'soft',density:'comfortable',fontStyle:'modern',photoShape:'default'},
    {name:'Vibrante',dark:false,gradient:true,cardStyle:'elevated',radius:22,shadow:'deep',density:'comfortable',fontStyle:'rounded',photoShape:'soft'},
    {name:'Suave',dark:false,gradient:true,cardStyle:'outline',radius:28,shadow:'soft',density:'airy',fontStyle:'rounded',photoShape:'soft'},
    {name:'Noturno',dark:true,gradient:true,cardStyle:'glass',radius:20,shadow:'deep',density:'comfortable',fontStyle:'modern',photoShape:'default'}
  ];

  function templateThemeV132(primary,secondary,mood){
    const dark=!!mood.dark;
    const bg=dark?mixV132(primary,'#050505',.72):mixV132(secondary,'#ffffff',.94);
    const card=dark?mixV132(primary,'#0b0b0b',.58):'#ffffff';
    const text=dark?'#ffffff':'#292629';
    const muted=dark?'#c7bdc9':'#777077';
    const line=dark?mixV132(primary,'#ffffff',.28):mixV132(primary,'#ffffff',.82);
    const head=dark?mixV132(primary,'#0b0b0b',.68):'#ffffff';
    const buttonText=contrastTextV132(primary);
    return {
      primary,secondary,background:bg,card,text,muted,line,
      success:'#198b57',danger:'#c53c49',warning:'#e3a128',
      heroStart:primary,heroEnd:secondary,
      headerBg:head,headerText:dark?'#ffffff':'#292629',
      topCardBg:card,infoText:text,infoDetailText:muted,infoLinkText:dark?mixV132(secondary,'#ffffff',.2):primary,
      loyaltyBg:dark?mixV132(primary,'#ffffff',.12):mixV132(secondary,'#ffffff',.88),
      loyaltyText:text,noticeBg:dark?mixV132('#9b3b45','#111111',.45):'#fdebed',
      noticeText:dark?'#ffdbe0':'#9d3742',
      categoryBg:card,categoryText:text,categoryActiveBg:primary,categoryActiveText:buttonText,
      sectionBg:bg,sectionTitle:text,productBg:card,productText:text,
      productPrice:dark?mixV132(secondary,'#ffffff',.15):primary,
      cartBg:primary,cartText:buttonText,modalBg:card,modalText:text,
      buttonBg:primary,buttonText,
      secondaryButtonBg:dark?mixV132(primary,'#ffffff',.15):mixV132(primary,'#ffffff',.9),
      secondaryButtonText:dark?'#ffffff':primary
    };
  }

  function templateDesignV132(primary,secondary,mood,id){
    return {
      template:id,
      siteGradient:mood.gradient,
      siteBg1:mood.dark?mixV132(primary,'#050505',.74):mixV132(secondary,'#ffffff',.95),
      siteBg2:mood.dark?mixV132(secondary,'#050505',.72):mixV132(primary,'#ffffff',.94),
      siteAngle:155,
      headerGradient:mood.gradient,
      headerBg1:mood.dark?mixV132(primary,'#080808',.68):'#ffffff',
      headerBg2:mood.dark?mixV132(secondary,'#080808',.72):mixV132(secondary,'#ffffff',.92),
      headerAngle:110,
      buttonGradient:mood.gradient,
      buttonBg1:primary,buttonBg2:secondary,buttonAngle:135,
      cardStyle:mood.cardStyle,radius:mood.radius,shadow:mood.shadow,density:mood.density,
      fontStyle:mood.fontStyle,photoShape:mood.photoShape
    };
  }

  const ACAI_PRESETS_V13541=[
   ['Roxo artesanal','#64207d','#b13bb5','#eadcf5','#ffffff','acai','grid','soft','none','rounded'],
   ['Frutas vermelhas','#9b164f','#ec5b96','#ffd6e8','#fff7fb','berry','grid','deep','dots','ribbon'],
   ['Tropical solar','#6b2d84','#c66b0d','#ffebaf','#fffdf4','tropical','grid','soft','none','bold'],
   ['Noite premium','#b68ce0','#eea2d1','#170c22','#2b173b','acai','grid','deep','none','editorial'],
   ['Jardim amazônico','#216545','#79308d','#d5ecd9','#f8fff7','tropical','list','soft','linen','editorial'],
   ['Cupuaçu cremoso','#623a26','#b56e36','#f1dfc6','#fffaf0','cupuacu','grid','none','linen','minimal'],
   ['Berry pink','#a5175e','#5e3293','#f8c0df','#fff5fb','berry','grid','deep','dots','bold'],
   ['Lagoa turquesa','#17666d','#674084','#c9efef','#f5ffff','tropical','grid','soft','none','ribbon'],
   ['Lavanda editorial','#594382','#a7679e','#e1d4f0','#fdfaff','acai','list','none','none','editorial'],
   ['Manga e maracujá','#803a11','#7b2d8b','#ffe0a6','#fffbf1','tropical','grid','soft','linen','ribbon'],
   ['Framboesa intensa','#951641','#513085','#f8cfdb','#fff5f7','berry','grid','deep','none','bold'],
   ['Pistache natural','#455f29','#724784','#dce9bf','#fffff4','tropical','list','soft','linen','minimal'],
   ['Cacau e granola','#6c3c28','#8e3065','#e9d2bf','#fff9f3','granola','grid','none','linen','editorial'],
   ['Uva elétrica','#6830ae','#a92070','#e8d0ff','#fff9ff','acai','grid','deep','dots','bold'],
   ['Pêssego suave','#92334b','#8b5519','#ffddcf','#fff8f3','berry','grid','soft','none','minimal'],
   ['Grafite sofisticado','#d2a8ee','#ffc991','#171c23','#252d38','acai','list','deep','none','editorial'],
   ['Rosa e chocolate','#952557','#744428','#f4d6e2','#fff9fc','berry','grid','soft','linen','ribbon'],
   ['Areia dourada','#72511c','#764180','#eee1be','#fffff4','cupuacu','list','none','linen','minimal'],
   ['Verde e violeta','#286b4e','#743490','#bfe6d5','#f1fff9','tropical','grid','soft','dots','bold'],
   ['Açaí festa','#79248f','#bb3a60','#f6d1ef','#fff7ff','completo','grid','deep','dots','ribbon']
  ];
  function acaiCompositionV13540(palette,mood){
    const p=ACAI_PRESETS_V13541[palette*4+mood],photos={acai:'assets/pedevia-theme-acai.webp',tropical:'assets/pedevia-theme-tropical.webp',berry:'assets/pedevia-theme-berry.webp',cupuacu:'assets/pedevia-ice-cupuacu.webp',granola:'assets/pedevia-comp-granola.webp',completo:'assets/pedevia-complementos-completo.webp'};
    return {bannerImage:photos[p[5]],bannerOverlay:.6,bannerPosition:'center',bannerHeight:220+(mood*20),catalogLayout:p[6],surfaceTexture:p[8],productPhoto:'wide',presetStyle:p[9],shadow:p[7],radius:[16,24,20,28][mood],photoShape:'default',cardStyle:'elevated'};
  }
  function applyAcaiPaletteV13541(template,index){
    const p=ACAI_PRESETS_V13541[index],th=template.theme,d=template.design,dark=p[3]==='#170c22'||p[3]==='#171c23';
    template.name=p[0];template.desc='Açaí · '+({editorial:'Editorial',ribbon:'Faixas de cor',bold:'Marcante',minimal:'Essencial',rounded:'Artesanal'}[p[9]]);
    const ink=dark?'#fff5ff':'#29212b',muted=dark?'#d0bddb':'#675d69',line=dark?'#584064':mixV132(p[1],'#ffffff',.72);
    Object.assign(th,{primary:p[1],secondary:p[2],background:p[3],card:p[4],text:ink,muted,line,headerBg:p[4],headerText:ink,topCardBg:p[4],infoText:ink,infoDetailText:muted,loyaltyBg:p[4],loyaltyText:ink,categoryBg:p[4],categoryText:ink,categoryActiveBg:p[1],categoryActiveText:contrastTextV132(p[1]),sectionBg:p[3],sectionTitle:ink,productBg:p[4],productText:ink,productPrice:dark?p[2]:p[1],cartBg:p[1],cartText:contrastTextV132(p[1]),modalBg:p[4],modalText:ink,buttonBg:p[1],buttonText:contrastTextV132(p[1]),secondaryButtonBg:dark?'#493451':mixV132(p[1],'#ffffff',.88),secondaryButtonText:dark?'#fff5ff':p[1]});
    Object.assign(d,{siteGradient:index%3===0,siteBg1:p[3],siteBg2:dark?'#26102d':mixV132(p[2],'#ffffff',.8),headerGradient:false,headerBg1:p[4],headerBg2:p[4],buttonGradient:index%2===1,buttonBg1:p[1],buttonBg2:p[2]});
  }
  function safeVisualUrlV13540(value){
    const text=String(value||'').trim();
    if(/^assets\/[a-zA-Z0-9_.-]+\.(?:webp|png|jpe?g)$/.test(text))return text;
    try{const u=new URL(text);return u.protocol==='https:'?u.href:''}catch(e){return '';}
  }
  window.safeVisualUrlV13540=safeVisualUrlV13540;
  function visualOptionsV13540(values,current){return values.map(([value,label])=>`<option value="${value}" ${String(current)===String(value)?'selected':''}>${label}</option>`).join('')}
  function visualControlsV13540(d){
    return `<div class="v140Advanced"><h3>Composição visual</h3><div class="v140Controls"><label>Imagem do banner<select class="field" id="v140PhotoPreset" onchange="chooseBannerImageV13540(this.value)">${visualOptionsV13540([['','Sem imagem'],['assets/pedevia-theme-acai.webp','Açaí artesanal'],['assets/pedevia-theme-tropical.webp','Tropical com manga'],['assets/pedevia-theme-berry.webp','Açaí com frutas vermelhas'],['assets/pedevia-ice-cupuacu.webp','Açaí e cupuaçu'],['assets/pedevia-comp-granola.webp','Granola'],['assets/pedevia-ice-sensacao.webp','Sorvete e frutas'],['assets/pedevia-complementos-completo.webp','Complementos'],['custom','Minha imagem']],d.bannerImage&& !String(d.bannerImage).startsWith('assets/')?'custom':d.bannerImage||'')}</select></label><label>Disposição dos produtos<select class="field" id="v140Layout" onchange="previewCompositionV13540()">${visualOptionsV13540([['grid','Dois por linha'],['three','Três por linha no computador'],['list','Lista com foto ao lado']],d.catalogLayout||'grid')}</select></label></div><label>Link da sua imagem (HTTPS)</label><input id="v140BannerUrl" class="field" value="${esc(d.bannerImage||'')}" placeholder="https://..." onchange="previewCompositionV13540()"><div id="v140ImagePreview" class="v140ImagePreview" aria-label="Prévia da imagem do banner"></div><details><summary>Ajustes avançados</summary><div class="v140Controls" style="margin-top:14px"><label>Escurecimento da foto<input id="v140Overlay" type="range" min="0.3" max="0.85" step="0.05" value="${Math.max(.3,Math.min(.85,Number(d.bannerOverlay)||.55))}" oninput="previewCompositionV13540()"></label><label>Altura mínima do banner<input id="v140Height" class="field" type="number" min="160" max="420" value="${Number(d.bannerHeight)||240}" onchange="previewCompositionV13540()"></label><label>Posição da imagem<select id="v140Position" class="field" onchange="previewCompositionV13540()">${visualOptionsV13540([['left','Esquerda'],['center','Centro'],['right','Direita']],d.bannerPosition||'center')}</select></label><label>Textura do fundo<select id="v140Texture" class="field" onchange="previewCompositionV13540()">${visualOptionsV13540([['none','Lisa'],['dots','Pontos discretos'],['linen','Trama suave']],d.surfaceTexture||'none')}</select></label><label>Formato das fotos<select id="v140ProductPhoto" class="field" onchange="previewCompositionV13540()">${visualOptionsV13540([['default','Original'],['square','Quadrado'],['wide','Horizontal']],d.productPhoto||'default')}</select></label><label>Acabamento dos cartões<select id="v140CardStyle" class="field" onchange="previewCompositionV13540()">${visualOptionsV13540([['elevated','Elevado'],['outline','Contorno'],['glass','Vidro']],d.cardStyle||'elevated')}</select></label><label>Cantos dos cartões<input id="v140Radius" class="field" type="number" min="10" max="32" value="${Number(d.radius)||20}" onchange="previewCompositionV13540()"></label><label>Sombra<select id="v140Shadow" class="field" onchange="previewCompositionV13540()">${visualOptionsV13540([['none','Sem sombra'],['soft','Suave'],['deep','Marcante']],d.shadow||'soft')}</select></label></div></details></div>`;
  }
  window.chooseBannerImageV13540=function(value){if(value==='custom'){document.getElementById('v140BannerUrl')?.focus();return;}document.getElementById('v140BannerUrl').value=value;previewCompositionV13540();};
  window.captureCompositionV13540=function(){
    if(!document.getElementById('v140BannerUrl'))return;
    const d=cfg.store.design,read=id=>document.getElementById(id)?.value;
    const raw=read('v140BannerUrl'),url=safeVisualUrlV13540(raw);if(raw&&!url)throw new Error('Use um link HTTPS válido para a imagem.');
    Object.assign(d,{bannerImage:url,bannerOverlay:Math.max(.3,Math.min(.85,Number(read('v140Overlay'))||.55)),bannerHeight:Math.max(160,Math.min(420,Number(read('v140Height'))||240)),bannerPosition:read('v140Position'),catalogLayout:read('v140Layout'),surfaceTexture:read('v140Texture'),productPhoto:read('v140ProductPhoto'),cardStyle:read('v140CardStyle'),radius:Math.max(10,Math.min(32,Number(read('v140Radius'))||20)),shadow:read('v140Shadow')});
  };
  window.previewCompositionV13540=function(){try{captureCompositionV13540();cfg.store.design.template='custom';applyThemeV116();const preview=document.getElementById('v140ImagePreview');if(preview)preview.style.backgroundImage=cfg.store.design.bannerImage?'url('+JSON.stringify(cfg.store.design.bannerImage)+')':'none';}catch(e){if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(e.message,'error')}};
  const themeBaseV13540=applyThemeV116;
  applyThemeV116=function(){
    themeBaseV13540();const d=cfg.store.design||{},root=document.documentElement,url=safeVisualUrlV13540(d.bannerImage),overlay=Math.max(.3,Math.min(.85,Number(d.bannerOverlay)||.55));
    root.dataset.pvPresetStyle=['editorial','ribbon','bold','minimal'].includes(d.presetStyle)?d.presetStyle:'rounded';
    root.dataset.pvLayout=['grid','three','list'].includes(d.catalogLayout)?d.catalogLayout:'grid';root.dataset.pvTexture=['dots','linen'].includes(d.surfaceTexture)?d.surfaceTexture:'none';root.dataset.pvPhoto=['square','wide'].includes(d.productPhoto)?d.productPhoto:'default';root.dataset.pvBanner=url?'photo':'none';
    const resolved=url?new URL(url,document.baseURI).href:'';
    root.style.setProperty('--pv-banner',resolved?`linear-gradient(90deg,rgba(12,4,20,${overlay}),rgba(12,4,20,${overlay*.6})),url(${JSON.stringify(resolved)})`:'none');root.style.setProperty('--pv-banner-position',['left','right'].includes(d.bannerPosition)?d.bannerPosition:'center');root.style.setProperty('--pv-banner-height',Math.max(160,Math.min(420,Number(d.bannerHeight)||240))+'px');
  };
  function allTemplatesV132(){
    const out={};
    Object.entries(TEMPLATE_GROUPS_V132).forEach(([groupId,g])=>{
      g.palettes.forEach((p,pi)=>{
        MOODS_V132.forEach((m,mi)=>{
          const id=`v132_${groupId}_${pi+1}_${mi+1}`;
          out[id]={
            id,groupId,
            name:`${p[0]} · ${m.name}`,
            desc:`${g.label} — ${m.name.toLowerCase()}`,
            theme:templateThemeV132(p[1],p[2],m),
            design:Object.assign(templateDesignV132(p[1],p[2],m,id),groupId==='acai'?acaiCompositionV13540(pi,mi):{})
          };
        });
      });
    });
    Object.values(out).filter(t=>t.groupId==='acai').forEach(applyAcaiPaletteV13541);
    return out;
  }

  window.DESIGN_TEMPLATES_V132=allTemplatesV132();
  window.appearanceOpenCategoryV132=window.appearanceOpenCategoryV132||'acai';

  function templateCardV132(t){
    const th=t.theme,d=t.design;
    const bg=d.siteGradient?`linear-gradient(${d.siteAngle}deg,${d.siteBg1},${d.siteBg2})`:th.background;
    const head=d.headerGradient?`linear-gradient(${d.headerAngle}deg,${d.headerBg1},${d.headerBg2})`:th.headerBg;
    const active=cfg.store.design?.template===t.id;
    return `<button type="button" class="v132TemplateCard ${active?'on':''}" onclick="applyTemplateV132('${t.id}')">
      <div class="v132Mini ${d.catalogLayout==='list'?'v141List':''}" style="background:${bg};border-radius:${d.radius||20}px">
        <div class="v132MiniHead" style="background:${head};color:${th.headerText}">SUA MARCA</div>
        <div class="v132MiniHero" style="color:#fff;background:${d.bannerImage?`linear-gradient(90deg,#190620aa,#19062044),url('${esc(d.bannerImage)}')`:`linear-gradient(135deg,${th.heroStart},${th.heroEnd})`}">Cardápio online</div>
        <div class="v132MiniCats"><i style="background:${th.primary}"></i><i style="background:${th.secondary}"></i></div><div class="v132MiniCards"><i style="background:${th.productBg};color:${th.productPrice}">300 ml</i><i style="background:${th.productBg};color:${th.productPrice}">400 ml</i><i style="background:${th.productBg};color:${th.productPrice}">500 ml</i></div><div class="v132MiniFooter" style="background:${th.primary}"></div>
      </div>
      <b>${esc(t.name)}</b><small>${active?'✓ ATIVO':esc(t.desc)}</small>
    </button>`;
  }

  window.applyTemplateV132=function(id){
    const t=window.DESIGN_TEMPLATES_V132[id];if(!t)return;
    window.appearanceOpenCategoryV132=t.groupId;
    cfg.store.theme=JSON.parse(JSON.stringify(t.theme));
    cfg.store.design=JSON.parse(JSON.stringify(t.design));
    applyThemeV116();
    renderShop();
    generalAppearanceV116();
  };

  function templateGroupsHtmlV132(){
    return Object.entries(TEMPLATE_GROUPS_V132).map(([gid,g])=>{
      const list=Object.values(window.DESIGN_TEMPLATES_V132).filter(t=>t.groupId===gid);
      const open=window.appearanceOpenCategoryV132===gid?'open':'';
      return `<details class="v132TemplateGroup" ${open} ontoggle="if(this.open)window.appearanceOpenCategoryV132='${gid}'">
        <summary><span>${g.emoji} ${esc(g.label)}</span><span>20 templates</span></summary>
        <div class="v132TemplateGrid">${list.map(templateCardV132).join('')}</div>
      </details>`;
    }).join('');
  }

  generalAppearanceV116=function(){
    ensureV116Defaults();ensureDesignV117();
    const s=cfg.store,d=s.design;
    generalShell('Aparência do estabelecimento',`
      <p class="hint">Escolha um ramo e um template pronto. Cada template já define automaticamente cores, fundos, cartões, botões, contrastes e degradês.</p>
      <h3 style="margin:16px 0 6px">Templates por tipo de estabelecimento</h3>
      ${templateGroupsHtmlV132()}

      ${visualControlsV13540(d)}
      <div class="v117Section">
        <h3>💬 Banner principal</h3>
        <label>Título do banner</label><input id="v116HeroTitle" class="field" value="${esc(s.heroTitle||'')}" placeholder="Seu pedido, do seu jeito">
        <label>Emoji</label><input id="v116HeroEmoji" class="field" value="${esc(s.heroEmoji||'')}" placeholder="✨">
        <label>Texto abaixo</label><textarea id="v116HeroText" class="field" rows="3">${esc(s.heroText||'')}</textarea>
        <div class="v116Preview"><div class="v116PreviewHero"><b id="v116PrevTitle"></b><span id="v116PrevText"></span></div></div>
      </div>

      <details id="manualColorsV132" class="v132ManualBox">
        <summary>🎨 Ajustar cores uma por uma</summary>
        <div class="v132ManualInner">
          <p class="hint">Use somente se quiser personalizar o template. Ao alterar qualquer cor ou degradê, o visual passa a ser personalizado.</p>

          <h4>Degradês</h4>
          ${gradientBoxV117('Fundo geral do site','Site',d.siteGradient,d.siteBg1,d.siteBg2,d.siteAngle)}
          ${gradientBoxV117('Cabeçalho','Header',d.headerGradient,d.headerBg1,d.headerBg2,d.headerAngle)}
          ${gradientBoxV117('Botões e carrinho','Button',d.buttonGradient,d.buttonBg1,d.buttonBg2,d.buttonAngle)}

          <div class="v1163Section"><h4>Cores gerais</h4><div class="v116ColorGrid">
            ${v116ColorRow('Cor principal','primary')}${v116ColorRow('Cor secundária','secondary')}
            ${v116ColorRow('Fundo geral do site','background')}${v116ColorRow('Cards gerais','card')}
            ${v116ColorRow('Texto principal','text')}${v116ColorRow('Texto secundário','muted')}
            ${v116ColorRow('Bordas','line')}${v116ColorRow('Sucesso / aberto','success')}
            ${v116ColorRow('Alerta / fechado','danger')}${v116ColorRow('Avisos','warning')}
          </div></div>

          <div class="v1163Section"><h4>Topo e informações</h4><div class="v116ColorGrid">
            ${v116ColorRow('Fundo do cabeçalho','headerBg')}${v116ColorRow('Texto do cabeçalho','headerText')}
            ${v116ColorRow('Fundo dos cartões de informações','topCardBg')}${v116ColorRow('Títulos das informações','infoText')}
            ${v116ColorRow('Detalhes das informações','infoDetailText')}${v116ColorRow('Links','infoLinkText')}
          </div></div>

          <div class="v1163Section"><h4>Banner principal</h4><div class="v116ColorGrid">
            ${v116ColorRow('Início do degradê','heroStart')}${v116ColorRow('Fim do degradê','heroEnd')}
          </div></div>

          <div class="v1163Section"><h4>Fidelidade e avisos</h4><div class="v116ColorGrid">
            ${v116ColorRow('Fundo da fidelidade','loyaltyBg')}${v116ColorRow('Texto da fidelidade','loyaltyText')}
            ${v116ColorRow('Fundo dos avisos','noticeBg')}${v116ColorRow('Texto dos avisos','noticeText')}
          </div></div>

          <div class="v1163Section"><h4>Categorias</h4><div class="v116ColorGrid">
            ${v116ColorRow('Fundo da categoria','categoryBg')}${v116ColorRow('Texto da categoria','categoryText')}
            ${v116ColorRow('Fundo da categoria selecionada','categoryActiveBg')}${v116ColorRow('Texto da categoria selecionada','categoryActiveText')}
          </div></div>

          <div class="v1163Section"><h4>Cardápio e produtos</h4><div class="v116ColorGrid">
            ${v116ColorRow('Fundo da área','sectionBg')}${v116ColorRow('Título das seções','sectionTitle')}
            ${v116ColorRow('Fundo dos produtos','productBg')}${v116ColorRow('Texto dos produtos','productText')}
            ${v116ColorRow('Preço dos produtos','productPrice')}
          </div></div>

          <div class="v1163Section"><h4>Carrinho, janelas e botões</h4><div class="v116ColorGrid">
            ${v116ColorRow('Fundo do carrinho','cartBg')}${v116ColorRow('Texto do carrinho','cartText')}
            ${v116ColorRow('Fundo da janela','modalBg')}${v116ColorRow('Texto da janela','modalText')}
            ${v116ColorRow('Fundo dos botões','buttonBg')}${v116ColorRow('Texto dos botões','buttonText')}
            ${v116ColorRow('Botão secundário','secondaryButtonBg')}${v116ColorRow('Texto do botão secundário','secondaryButtonText')}
          </div></div>
        </div>
      </details>

      <div class="v116Actions">
        <button class="ghost" data-pedevia-event="click" data-pedevia-call="restoreAppearanceV116">Restaurar padrão</button>
        <button class="btn" id="saveAppearanceV132" data-pedevia-event="click" data-pedevia-call="saveAppearanceV132">Salvar aparência</button>
      </div>
    `);
    const chosen=d.template;previewAppearanceV116();cfg.store.design.template=chosen;
    const preview=document.getElementById('v140ImagePreview');if(preview&&safeVisualUrlV13540(d.bannerImage))preview.style.backgroundImage='url('+JSON.stringify(d.bannerImage)+')';
  };

  document.addEventListener('input',ev=>{
    if(ev.target?.closest?.('#manualColorsV132')){
      try{markCustomV117()}catch(e){}
    }
  },true);

  window.saveAppearanceV132=async function(){
    const btn=document.getElementById('saveAppearanceV132');
    const old=btn?.textContent||'Salvar aparência';
    try{
      if(btn){btn.disabled=true;btn.textContent='Salvando...'}
      const chosen=cfg.store.design.template;captureCompositionV13540();previewAppearanceV116();cfg.store.design.template=chosen;
      const ok=await persistAdminStateV15({products:false,notify:false});
      if(!ok)throw new Error('O servidor não confirmou o salvamento.');
      renderShop();
      generalAppearanceV116();
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('✓ Aparência salva com sucesso');
    }catch(e){
      console.error(e);
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('Não foi possível salvar a aparência.','error');
      else alert('Não foi possível salvar: '+(e.message||e));
    }finally{
      const b=document.getElementById('saveAppearanceV132')||btn;
      if(b){b.disabled=false;b.textContent=old}
    }
  };

  window._newProductLockV132=false;
  window._editingProductV132=null;
  window._savingProductV132=false;

  const closeModalBaseV132=closeModal;
  closeModal=function(){
    const id=window._editingProductV132;
    const p=id?(cfg.products||[]).find(x=>String(x.id)===String(id)):null;
    if(p?._draftNewV132 && !window._savingProductV132){
      cfg.products=cfg.products.filter(x=>String(x.id)!==String(id));
    }
    window._editingProductV132=null;
    window._newProductLockV132=false;
    return closeModalBaseV132.apply(this,arguments);
  };

  newProduct=function(sectionId){
    if(window._newProductLockV132)return;
    window._newProductLockV132=true;

    const existing=(cfg.products||[]).find(p=>p._draftNewV132);
    if(existing){
      window._editingProductV132=existing.id;
      editProduct(existing.id);
      setTimeout(()=>window._newProductLockV132=false,500);
      return;
    }

    const sid=sectionId||cfg.sections?.[0]?.id||'produtos';
    const standard=(cfg.groups||[]).filter(g=>['caldas','complementos','adicionais','talher'].includes(g.id)).map(g=>g.id);
    const p={
      id:'p'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      category:sid,name:'Novo produto',desc:'',detailedDesc:'',price:0,
      status:'available',image:'',images:[],groups:standard,
      _draftNewV132:true
    };
    cfg.products.push(p);
    window._editingProductV132=p.id;
    editProduct(p.id);
    setTimeout(()=>window._newProductLockV132=false,500);
  };

  const editProductBaseV132=editProduct;
  editProduct=function(id){
    window._editingProductV132=id;
    editProductBaseV132(id);
    setTimeout(()=>{
      const modal=document.getElementById('sheet');
      if(!modal)return;
      const saveBtn=modal.querySelector('.stickySave .btn');
      if(saveBtn){
        saveBtn.id='saveProductBtnV132';
        saveBtn.textContent='Salvar produto';
      }
      const cancel=modal.querySelector('.stickySave .ghost');
      if(cancel)cancel.textContent='Cancelar';
    },0);
  };

  previewProductImage=function(id,input){
    const file=input?.files?.[0];
    if(!file)return;
    if(!file.type.startsWith('image/')){alert('Selecione uma imagem válida.');return}
    if(file.size>8*1024*1024){alert('A imagem deve ter no máximo 8 MB.');return}

    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.width*scale));
        canvas.height=Math.max(1,Math.round(img.height*scale));
        canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
        const data=canvas.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.88);
        const p=(cfg.products||[]).find(x=>String(x.id)===String(id));
        if(!p)return;
        p._pendingImage=data;
        const prev=document.getElementById('prodPrev');
        if(prev)prev.innerHTML=`<img src="${data}">`;
        const url=document.getElementById('epi');
        if(url)url.value='';
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  };

  saveProduct=async function(id){
    if(window._savingProductV132)return;
    const p=(cfg.products||[]).find(x=>String(x.id)===String(id));
    if(!p)return;

    const btn=document.getElementById('saveProductBtnV132')||document.querySelector('.stickySave .btn');
    const oldText=btn?.textContent||'Salvar produto';
    window._savingProductV132=true;

    try{
      if(btn){btn.disabled=true;btn.textContent='Salvando produto...'}

      try{PedeviaV130.captureProductFlags(id)}catch(e){}

      p.name=document.getElementById('epn')?.value.trim()||'Produto';
      p.desc=document.getElementById('epd')?.value||'';
      p.detailedDesc=document.getElementById('epdetail')?.value||'';
      p.price=+document.getElementById('epp')?.value||0;
      p.category=document.getElementById('epc')?.value||p.category;
      p.status=document.getElementById('eps')?.value||'available';

      if(typeof collectVariantsFromEditor==='function'){
        p.variants=collectVariantsFromEditor();
        delete p._draftVariants;
      }

      if(typeof hasVariants==='function'&&!hasVariants(p)){
        p.allowedModes={
          delivery:document.getElementById('pmDelivery')?.checked??true,
          pickup:document.getElementById('pmPickup')?.checked??false,
          dinein:document.getElementById('pmDinein')?.checked??false
        };
        if(!p.allowedModes.delivery&&!p.allowedModes.pickup&&!p.allowedModes.dinein)
          throw new Error('Escolha pelo menos uma forma de atendimento para este produto.');
      }else if(typeof hasVariants==='function'&&hasVariants(p)){
        if(!p.variants?.length)throw new Error('Adicione pelo menos um tamanho.');
        if(p.variants.some(v=>!v.allowedModes?.delivery&&!v.allowedModes?.pickup&&!v.allowedModes?.dinein))
          throw new Error('Cada tamanho precisa ter pelo menos uma forma de atendimento.');
      }

      const typedUrl=document.getElementById('epi')?.value.trim()||'';
      if(p._pendingImage){
        if(btn)btn.textContent='Enviando imagem...';
        p.image=await PedeviaV130.uploadProductImage(id,p._pendingImage);
        delete p._pendingImage;
      }else if(typedUrl){
        p.image=typedUrl;
      }

      if(btn)btn.textContent='Gravando produto...';
      const ok=await persistAdminStateV15({products:true,notify:false});
      if(!ok)throw new Error('O servidor não confirmou o salvamento do produto.');

      delete p._draftNewV132;
      window._editingProductV132=null;
      try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
      renderShop();

      window._savingProductV132=false;
      closeModalBaseV132();
      renderAdmin();

      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('✓ Produto salvo e publicado no cardápio');
      else alert('Produto salvo.');

    }catch(e){
      console.error('Falha ao salvar produto v1.32.0:',e);
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315(e.message||'Não foi possível salvar o produto.','error');
      else alert(e.message||'Não foi possível salvar o produto.');
    }finally{
      window._savingProductV132=false;
      const b=document.getElementById('saveProductBtnV132')||btn;
      if(b){b.disabled=false;b.textContent=oldText}
    }
  };

  saveGeneralHours=async function(){
    const btn=[...document.querySelectorAll('#adminContent button')].find(b=>/salvar horários/i.test(b.textContent||''));
    const old=btn?.textContent||'Salvar horários';
    try{
      if(btn){btn.disabled=true;btn.textContent='Salvando horários...'}

      cfg.store.scheduleMode=document.getElementById('gSchedule')?.value||'fixed';
      cfg.store.hours=cfg.store.hours||{};
      for(let i=0;i<7;i++){
        const list=[];
        for(let k=1;k<=2;k++){
          const a=document.getElementById(`ga${i}_${k}`)?.value||'';
          const b=document.getElementById(`gb${i}_${k}`)?.value||'';
          if(a&&b)list.push([a,b]);
        }
        cfg.store.hours[String(i)]=list;
      }

      const ok=await persistAdminStateV15({products:false,notify:false});
      if(!ok)throw new Error('O servidor não confirmou os horários.');

      renderShop();
      generalHours();
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('✓ Horários salvos com sucesso');
    }catch(e){
      console.error(e);
      if(typeof pedeviaToastV1315==='function')pedeviaToastV1315('Não foi possível salvar os horários.','error');
      else alert('Não foi possível salvar os horários: '+(e.message||e));
    }finally{
      const b=[...document.querySelectorAll('#adminContent button')].find(x=>/salvar horários|salvando horários/i.test(x.textContent||''))||btn;
      if(b){b.disabled=false;b.textContent=old}
    }
  };

  function actionBusyTextV132(label){
    const t=String(label||'').trim().toLowerCase();
    if(/^salvar|^concluir/.test(t))return'Salvando...';
    if(/^adicionar|^criar|^\+/.test(t))return'Adicionando...';
    if(/^editar/.test(t))return'Abrindo edição...';
    if(/^excluir|^remover/.test(t))return'Excluindo...';
    if(/^ativar|^desativar|^pausar|^retomar|^reabrir/.test(t))return'Atualizando...';
    if(/^enviar|^convidar|^reenviar/.test(t))return'Enviando...';
    if(/^duplicar/.test(t))return'Duplicando...';
    return null;
  }

  document.addEventListener('click',ev=>{
    const btn=ev.target?.closest?.('button');
    if(!btn || !btn.closest('#adminView') || btn.disabled || btn.dataset.noAutoBusy==='1')return;
    // O editor de produtos controla o próprio estado. O feedback genérico não
    // pode manter Editar/Duplicar/Salvar bloqueados depois que o modal fechar.
    if(btn.closest('.adminProdCard') || btn.closest('#sheet')?.querySelector('#epn'))return;
    const busy=actionBusyTextV132(btn.textContent);
    if(!busy)return;

    setTimeout(()=>{
      if(!btn.isConnected || btn.disabled)return;
      if(btn.dataset.pedeviaBusy==='1')return;
      const original=btn.textContent;
      btn.dataset.pedeviaBusy='1';
      btn.dataset.pedeviaOriginalText=original;
      btn.textContent=busy;
      btn.classList.add('v132Busy');
      btn.setAttribute('aria-busy','true');
      btn.disabled=true;

      setTimeout(()=>{
        if(!btn.isConnected)return;
        if(btn.dataset.pedeviaBusy!=='1')return;
        btn.disabled=false;
        btn.textContent=btn.dataset.pedeviaOriginalText||original;
        btn.classList.remove('v132Busy');
        btn.removeAttribute('aria-busy');
        delete btn.dataset.pedeviaBusy;
      },8000);
    },0);
  },false);

  setTimeout(()=>{
    if(typeof applyPedeviaVersion==='function')applyPedeviaVersion();
  },1000);

})();
