(() => {
  const token=(localStorage.getItem('adminToken')||sessionStorage.getItem('adminToken')||'').replace(/^"|"$/g,'').replace(/^Bearer\s+/i,'');
  const grid=document.getElementById('previewGrid'),status=document.getElementById('previewStatus'),category=document.getElementById('previewCategory'),locale=document.getElementById('previewLocale'),search=document.getElementById('previewSearch'),dialog=document.getElementById('previewDialog'),frame=document.getElementById('previewFrame');
  let items=[];
  if(!token){status.textContent='กรุณาเข้าสู่ระบบผู้ดูแลก่อนดูฉบับร่าง';return;}
  function render(){
    grid.replaceChildren();const en=locale.value==='en',q=search.value.trim().toLowerCase();
    const list=items.filter(i=>(!category.value||String(i.categoryId)===category.value)&&[i.nameTh,i.nameEn,i.scientificName].join(' ').toLowerCase().includes(q));
    status.textContent=list.length+' รายการ · คลิกการ์ดเพื่อดูหน้ารายละเอียด';
    list.forEach(item=>{
      const card=document.createElement('button');card.type='button';card.className='kb-card';card.style.textAlign='left';card.style.cursor='pointer';
      const picture=document.createElement('div');picture.className='kb-card-image';const image=document.createElement('img');image.src=item.featuredImageUrl||'/img/icon.png';image.alt=en?item.nameEn:item.nameTh;image.loading='lazy';picture.append(image);
      const body=document.createElement('div');body.className='kb-card-body';
      for(const [className,text] of [['kb-card-category',item.category?.[en?'nameEn':'nameTh']||''],['kb-card-title-th',en?item.nameEn:item.nameTh],['kb-card-title-en',en?item.nameTh:item.nameEn],['kb-card-description',item[en?'shortDescriptionEn':'shortDescriptionTh']||'อยู่ระหว่างจัดเตรียมข้อมูล'],['kb-card-cta',item.publicationStatus==='PUBLISHED'?'เผยแพร่แล้ว ↗':'ฉบับร่าง · ดูตัวอย่าง ↗']]){const node=document.createElement('span');node.className=className;node.textContent=text;body.append(node);}
      card.append(picture,body);card.onclick=async()=>{try{const response=await fetch('/api/admin/ingredients/'+item.id+'/preview?locale='+locale.value,{headers:{Authorization:'Bearer '+token}});if(!response.ok)throw new Error('ไม่สามารถเปิดตัวอย่างได้');frame.srcdoc=await response.text();dialog.showModal();}catch(error){status.textContent=error.message;}};grid.append(card);
    });
  }
  [category,locale].forEach(e=>e.addEventListener('change',render));search.addEventListener('input',render);document.getElementById('closePreview').onclick=()=>{dialog.close();frame.removeAttribute('srcdoc');};
  fetch('/api/admin/ingredients',{headers:{Authorization:'Bearer '+token}}).then(async response=>{if(!response.ok)throw new Error('โหลดข้อมูลไม่ได้ กรุณาตรวจสอบการเข้าสู่ระบบ');items=await response.json();const categories=new Map(items.filter(i=>i.category).map(i=>[i.category.id,i.category.nameTh]));for(const [id,name]of categories){const option=document.createElement('option');option.value=id;option.textContent=name;category.append(option);}render();}).catch(error=>{status.textContent=error.message;});
})();
