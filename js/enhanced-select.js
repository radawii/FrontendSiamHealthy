// Only explicitly opted-in controls are enhanced. Hidden framework inputs stay native.
(() => {
  function canEnhance(select) {
    if (!select.matches('select[data-enhance-select]') || select.dataset.native !== undefined) return false;
    if (select.hidden || select.matches('.swal2-select,[aria-hidden="true"]')) return false;
    if (select.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
    if (![...select.options].some(option => option.textContent.trim())) return false;
    return getComputedStyle(select).display !== 'none' && getComputedStyle(select).visibility !== 'hidden';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { canEnhance };
  if (typeof window === 'undefined') return;
  if (window.__chiwaSelects) return;
  window.__chiwaSelects = true;
  const controls = new Map();
  let active = null;
  let nextId = 0;
  const en = () => document.documentElement.lang === 'en';
  function enhance(select) {
    if (controls.has(select) || !canEnhance(select)) return;
    const wrapper = document.createElement('div'); wrapper.className = 'cw-select';
    select.before(wrapper); wrapper.append(select);
    const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'cw-select-trigger';
    trigger.setAttribute('role', 'combobox'); trigger.setAttribute('aria-haspopup', 'listbox'); trigger.setAttribute('aria-expanded', 'false');
    const label = select.getAttribute('aria-label') || document.querySelector(`label[for="${CSS.escape(select.id)}"]`)?.textContent || select.closest('label')?.textContent || (en() ? 'Choose an option' : 'เลือกรายการ');
    trigger.setAttribute('aria-label', label.trim());
    const caption = document.createElement('span'); const arrow = document.createElement('span'); arrow.className='cw-select-chevron'; arrow.setAttribute('aria-hidden','true');
    trigger.append(caption,arrow); wrapper.append(trigger);
    select.classList.add('cw-select-native'); select.tabIndex=-1; select.setAttribute('aria-hidden','true');
    const menu=document.createElement('div'); menu.className='cw-select-menu'; menu.hidden=true;
    const search=document.createElement('input'); search.type='search'; search.className='cw-select-search'; search.autocomplete='off'; search.setAttribute('aria-label',en()?'Search options':'ค้นหาตัวเลือก'); search.placeholder=en()?'Search options…':'ค้นหาตัวเลือก…';
    const list=document.createElement('div'); list.className='cw-select-options'; list.id='cw-list-'+nextId++; list.setAttribute('role','listbox'); if(select.multiple)list.setAttribute('aria-multiselectable','true'); trigger.setAttribute('aria-controls',list.id); menu.append(search,list);document.documentElement.append(menu);
    let cursor=0; let visible=[];
    function sync(){ const selected=[...select.selectedOptions].filter(o=>o.value); caption.textContent=selected.length ? selected.map(o=>o.textContent.trim()).join(', ') : (select.multiple ? (en()?'Choose items':'เลือกได้หลายรายการ') : select.options[select.selectedIndex]?.textContent || (en()?'Choose an option':'เลือกรายการ'));trigger.disabled=select.disabled; }
    function close(){menu.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');if(active===control)active=null;}
    function place(){const r=trigger.getBoundingClientRect();menu.style.width=Math.max(r.width,Math.min(300,innerWidth-32))+'px';menu.style.left=Math.max(12,Math.min(r.left,innerWidth-menu.offsetWidth-12))+'px';const below=innerHeight-r.bottom-12;menu.style.maxHeight=Math.min(340,Math.max(150,Math.max(below,r.top-12)))+'px';menu.style.top=(below>=200?r.bottom+6:Math.max(12,r.top-menu.offsetHeight-6))+'px';}
    function render(){list.replaceChildren();const q=search.value.trim().toLocaleLowerCase();visible=[...select.options].filter(o=>!o.hidden&&!o.disabled&&o.textContent.toLocaleLowerCase().includes(q));cursor=Math.min(Math.max(cursor,0),visible.length-1);visible.forEach((option,index)=>{const row=document.createElement('button');row.type='button';row.tabIndex=-1;row.id=list.id+'-'+index;row.className='cw-select-option'+(index===cursor?' is-focused':'');row.setAttribute('role','option');row.setAttribute('aria-selected',String(option.selected));const text=document.createElement('span');text.textContent=option.textContent;const check=document.createElement('span');check.className='cw-select-check';check.textContent=option.selected?'✓':'';check.setAttribute('aria-hidden','true');row.append(text,check);row.onclick=()=>choose(index);list.append(row);});if(!visible.length){const empty=document.createElement('p');empty.className='cw-select-empty';empty.textContent=en()?'No matching options':'ไม่พบตัวเลือก';list.append(empty);}const id=cursor>=0?list.id+'-'+cursor:'';if(id){search.setAttribute('aria-activedescendant',id);trigger.setAttribute('aria-activedescendant',id);}place();}
    function choose(index){const option=visible[index];if(!option)return;if(select.multiple)option.selected=!option.selected;else select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();if(select.multiple){render();search.focus({preventScroll:true});}else{close();trigger.focus({preventScroll:true});}}
    function open(){(select.closest('dialog') || document.documentElement).append(menu); if(active)active.close();sync();search.value='';cursor=0;menu.hidden=false;active=control;trigger.setAttribute('aria-expanded','true');render();search.focus({preventScroll:true});}
    function keys(event){if(event.key==='Escape'){event.preventDefault();close();trigger.focus({preventScroll:true});}else if(event.key==='Tab'){close();}else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();if(menu.hidden){open();return;}cursor=event.key==='Home'?0:event.key==='End'?visible.length-1:Math.max(0,Math.min(visible.length-1,cursor+(event.key==='ArrowDown'?1:-1)));render();list.children[cursor]?.scrollIntoView({block:'nearest'});}else if(event.key==='Enter'&&!menu.hidden){event.preventDefault();choose(cursor);}}
    const control={close,sync,menu,trigger};controls.set(select,control);
    trigger.onclick=()=>menu.hidden?open():close();trigger.onkeydown=keys;search.onkeydown=keys;search.oninput=()=>{cursor=0;render();};select.addEventListener('change',sync);select.addEventListener('invalid',()=>{trigger.focus({preventScroll:true});trigger.setAttribute('aria-invalid','true');});
    new MutationObserver(()=>{sync();if(!menu.hidden)render();}).observe(select,{childList:true,subtree:true,attributes:true});sync();
  }
  function scan(){document.querySelectorAll('select[data-enhance-select]').forEach(enhance);for(const [select,control] of controls)if(!select.isConnected){control.close();control.menu.remove();controls.delete(select);}}
  document.addEventListener('pointerdown',event=>{if(active&&!active.menu.contains(event.target)&&!active.trigger.contains(event.target))active.close();});
  document.addEventListener('scroll',event=>{if(active&&!active.menu.contains(event.target))active.close();},true);window.addEventListener('resize',()=>active?.close());
  document.addEventListener('cw:refresh',()=>{scan();controls.forEach(c=>c.sync());});
  // Controls revealed by a CSS transition (modals, drawers) are only visible once it ends.
  let rescan=0;document.addEventListener('transitionend',()=>{cancelAnimationFrame(rescan);rescan=requestAnimationFrame(scan);},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','inert','aria-hidden','class','style']});
})();
