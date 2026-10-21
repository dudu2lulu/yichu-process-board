export function bindSearch({search, cardBox, docBox, services, currentIndex, close}) {
  search.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    let count=0;
    cardBox.querySelectorAll('.card').forEach((b,i)=>{
      const s=services[i],match=!q||(s.title+' '+s.subtitle+' '+s.keywords).toLowerCase().includes(q);
      b.hidden=!match;
      if(match)count++;
    });
    document.querySelector('#serviceEmpty').classList.toggle('show',count===0);
    let docCount=0;
    docBox.querySelectorAll('.doc').forEach(a=>{
      const match=!q||a.dataset.search.toLowerCase().includes(q);
      a.hidden=!match;
      if(match)docCount++;
    });
    document.querySelector('#docEmpty').classList.toggle('show',docCount===0);
    const current=currentIndex();
    if(current>=0&&cardBox.querySelector(`[data-index="${current}"]`).hidden)close();
  });
}
