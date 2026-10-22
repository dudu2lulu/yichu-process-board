export function bindSearch({search,cardBox,docBox,services,result,clear}) {
  const texts=services.map(s=>JSON.stringify([s.title,s.subtitle,s.keywords,s.lead,s.note,s.steps,s.contacts,s.statuses]).toLowerCase());
  function update(){
    const q=search.value.trim().toLowerCase();let count=0,docCount=0;
    cardBox.querySelectorAll('.card').forEach((b,i)=>{b.hidden=!!q&&!texts[i].includes(q);if(!b.hidden)count++;});
    docBox.querySelectorAll('.doc').forEach(a=>{a.hidden=!!q&&!a.dataset.search.toLowerCase().includes(q);if(!a.hidden)docCount++;});
    document.querySelector('#serviceEmpty').classList.toggle('show',count===0);
    document.querySelector('#docEmpty').classList.toggle('show',docCount===0);
    result.textContent=q?`找到 ${count} 个办理事项、${docCount} 份表格与文档`:`共 ${services.length} 类办理事项`;
    clear.hidden=!q;
  }
  search.oninput=update;
  return update;
}
