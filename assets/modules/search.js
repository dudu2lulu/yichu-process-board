import {esc} from './render.js?v=material-search-1';

export const normalize=value=>String(value).normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
const stops=new Set(['怎么','如何','什么','哪些','是否','能否','可以','我要','想要','请问','的','吗','和','与','了','我','想','问','一下','想问','需要','应该','该','请','呢','啊']);
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh',{granularity:'word'}):null;
export function queryTerms(query){
  const words=segmenter?Array.from(segmenter.segment(query.normalize('NFKC').toLowerCase()),s=>s.segment):query.split(/\s+/);
  return [...new Set(words.map(normalize).filter(x=>x&&!stops.has(x)))];
}
function variants(term,synonyms){
  const family=synonyms.find(group=>group.some(x=>normalize(x)===term));
  return family?family.map(normalize):[term];
}
export function scoreMatch(record,query,synonyms=[]){
  const q=normalize(query);if(!q)return 0;
  const priority=record.kind==='常见问题'?15:record.kind==='报销指南'?6:0;
  const title=normalize(record.title||''),text=record.normalized||normalize(record.text||'');
  if(title.includes(q))return (text.includes(q)?110:45)+Math.min(q.length,20)+priority;
  if(text.includes(q))return 70+Math.min(q.length,20)+priority;
  let intent=query;
  for(const group of synonyms){for(const alias of [...group].sort((a,b)=>b.length-a.length)){if(alias.length>1)intent=intent.split(alias).join(group[0]);}}
  intent=intent.replace(/请问|能不能|可不可以|怎么办|怎么样|怎么|如何|怎样|咋/g,' ');
  const groups=queryTerms(intent).map(t=>variants(t,synonyms));
  if(!groups.length)return 0;
  const matched=groups.filter(group=>group.some(term=>title.includes(term)||text.includes(term)));
  if(matched.length===groups.length)return 40+groups.filter(g=>g.some(t=>title.includes(t))).length*6+priority;
  return 0;
}
function excerpt(text,query,synonyms){
  const terms=[query.trim(),...queryTerms(query).flatMap(t=>variants(t,synonyms))].filter(Boolean);
  const lower=text.toLowerCase();let pos=-1;
  for(const term of terms){pos=lower.indexOf(term.toLowerCase());if(pos>=0)break;}
  const start=Math.max(0,pos-35),part=(start?'…':'')+text.slice(start,start+210)+(text.length>start+210?'…':'');
  const pattern=terms.sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  if(!pattern)return esc(part);
  const re=new RegExp(pattern,'gi');let html='',last=0;
  for(const match of part.matchAll(re)){html+=esc(part.slice(last,match.index))+'<mark>'+esc(match[0])+'</mark>';last=match.index+match[0].length;}
  return html+esc(part.slice(last));
}
export function bindSearch({search,cardBox,docBox,services,result,clear,materials}) {
  const synonyms=materials?.synonyms||[];
  const records=(materials?.entries||[]).map(r=>({...r,normalized:normalize(r.text)}));
  const texts=services.map(s=>({title:s.title,text:JSON.stringify(s)}));
  const panel=document.querySelector('#materialResults'),list=document.querySelector('#materialList'),more=document.querySelector('#moreMaterials');
  let hits=[],limit=12;
  function renderHits(){
    list.innerHTML=hits.slice(0,limit).map(r=>{
      const internal=r.url.startsWith('#');
      return `<article class="material-hit"><span class="material-meta">${esc(r.kind)}${r.ocr?' · 扫描文字识别':''}</span><h3><a href="${esc(r.url)}" ${internal?'':'target="_blank" rel="noopener"'}>${esc(r.title)}</a></h3><p>${excerpt(r.text,search.value,synonyms)}</p><span class="material-source">${esc(r.location||'原始材料')} · 索引更新 ${esc(materials.updatedAt)}</span></article>`;
    }).join('');
    more.hidden=hits.length<=limit;
    more.textContent=`显示更多结果（剩余 ${Math.max(0,hits.length-limit)} 条）`;
  }
  function update(){
    const q=search.value.trim();let count=0,docCount=0;
    hits=q?records.map(r=>({...r,score:scoreMatch(r,q,synonyms)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score):[];
    const seenPDFs=new Set();
    hits=hits.filter(r=>{if(r.kind!=='PDF样例')return true;const file=r.url.split('#')[0];if(seenPDFs.has(file))return false;seenPDFs.add(file);return true;});
    cardBox.querySelectorAll('.card').forEach((b,i)=>{b.hidden=!!q&&!scoreMatch(texts[i],q,synonyms)&&!hits.some(r=>r.serviceId===services[i].id);if(!b.hidden)count++;});
    docBox.querySelectorAll('.doc').forEach(a=>{a.hidden=!!q&&!scoreMatch({title:a.textContent,text:a.dataset.search},q,synonyms);if(!a.hidden)docCount++;});
    document.querySelector('#serviceEmpty').classList.toggle('show',count===0);
    document.querySelector('#docEmpty').classList.toggle('show',docCount===0);
    panel.hidden=!q;limit=12;
    list.innerHTML='';
    if(q&&hits.length)renderHits();
    else if(q)list.innerHTML=`<p class="material-note">${materials?'没有找到匹配材料，可尝试更短的问题或不同说法。':'材料索引暂未加载，仅能搜索看板正文；请刷新后重试。'}</p>`;
    if(!hits.length)more.hidden=true;
    result.textContent=q?`找到 ${hits.length} 条材料内容、${count} 个办理事项、${docCount} 份常用文档${materials?'':'（材料索引未加载）'}`:`共 ${services.length} 类办理事项 · ${materials?records.length+' 条材料内容可搜索':'材料索引未加载，请刷新重试'}`;
    clear.hidden=!q;
  }
  search.oninput=update;
  more.onclick=()=>{limit+=12;renderHits();};
  return update;
}
