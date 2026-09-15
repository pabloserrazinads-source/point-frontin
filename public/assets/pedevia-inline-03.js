
// ===== v1.16.2: FOCO AUTOMÁTICO EM OPÇÃO OBRIGATÓRIA =====
function clearRequiredFocusV1162(box){
  if(!box)return;
  box.classList.remove('v1162RequiredError');
  box.querySelector('.v1162RequiredMessage')?.remove();
}

function focusRequiredGroupV1162(box,g){
  if(!box)return;

  document.querySelectorAll('.choiceGroup.v1162RequiredError').forEach(clearRequiredFocusV1162);

  let msg=box.querySelector('.v1162RequiredMessage');
  if(!msg){
    msg=document.createElement('div');
    msg.className='v1162RequiredMessage';
    msg.innerHTML='⚠ Selecione a opção obrigatória para continuar.';
    const hint=box.querySelector('.hint');
    if(hint) hint.insertAdjacentElement('afterend',msg);
    else box.prepend(msg);
  }

  // Primeiro leva o cliente exatamente ao grupo que ficou faltando.
  box.scrollIntoView({
    behavior:'smooth',
    block:'center'
  });

  // O atraso deixa a rolagem começar antes dos dois flashes visuais.
  setTimeout(()=>{
    box.classList.remove('v1162RequiredError');
    void box.offsetWidth;
    box.classList.add('v1162RequiredError');
  },320);

  setTimeout(()=>box.classList.remove('v1162RequiredError'),1700);
}

const _handleChoiceChangeV1162=handleChoiceChange;
handleChoiceChange=function(inp){
  const box=inp?.closest?.('.choiceGroup');
  if(box) clearRequiredFocusV1162(box);
  return _handleChoiceChangeV1162(inp);
};

const _changeOptQtyV1162=changeOptQty;
changeOptQty=function(btn,delta){
  const box=btn?.closest?.('.choiceGroup');
  if(box) clearRequiredFocusV1162(box);
  return _changeOptQtyV1162(btn,delta);
};
