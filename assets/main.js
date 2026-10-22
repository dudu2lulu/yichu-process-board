import {loadContent} from './modules/data.js';
import {renderCards, renderDocuments, renderDetail} from './modules/render.js?v=self-service-1';
import {bindSearch} from './modules/search.js?v=self-service-1';

const cardBox=document.querySelector('#cards'),docBox=document.querySelector('#docs');
const detail=document.querySelector('#detail'),search=document.querySelector('#search');
const documents=document.querySelector('#documents'),home=document.querySelector('#home');
const serviceTitle=document.querySelector('#serviceTitle'),notice=document.querySelector('#serviceEmpty');
const result=document.querySelector('#searchResult'),clear=document.querySelector('#clearSearch');
let current=-1;

async function start(){
  notice.replaceChildren(document.createTextNode('正在加载办理事项…'));
  notice.classList.add('show');
  try {
    const {services,docs}=await loadContent();
    cardBox.innerHTML=renderCards(services);
    docBox.innerHTML=renderDocuments(docs);
    const guideIndex=services.findIndex(s=>s.readingGuide);
    function protectSuppliesLinks(container){
      if(guideIndex<0)return;
      container.querySelectorAll('a').forEach(link=>{
        if(services[guideIndex].links.some(x=>x[1]===link.href)){
          link.href='#service='+services[guideIndex].id;
          link.removeAttribute('target');
        }
      });
    }
    protectSuppliesLinks(docBox);
    function navigate(hash){
      if(location.hash===hash)route();
      else location.hash=hash;
    }
    function open(i){
      current=i;
      home.hidden=true;cardBox.hidden=true;serviceTitle.hidden=true;notice.classList.remove('show');
      documents.hidden=true;result.hidden=true;clear.hidden=true;
      cardBox.querySelectorAll('.card').forEach((b,j)=>b.setAttribute('aria-expanded',String(j===i)));
      detail.innerHTML=renderDetail(services[i]);
      if(i!==guideIndex)protectSuppliesLinks(detail);
      detail.hidden=false;
      const confirmation=detail.querySelector('[data-reading-confirm]');
      if(confirmation)confirmation.addEventListener('change',()=>{detail.querySelector('[data-reading-links]').hidden=!confirmation.checked;});
      detail.querySelector('.close').addEventListener('click',()=>navigate('#home'));
      const filter=detail.querySelector('[data-table-search]');
      if(filter){
        filter.addEventListener('input',()=>{
          const query=filter.value.trim().toLowerCase();let count=0;
          detail.querySelectorAll('.data-table--supplies tbody tr').forEach(row=>{row.hidden=!row.textContent.toLowerCase().includes(query);if(!row.hidden)count++;});
          detail.querySelector('[data-table-result]').textContent=`显示 ${count} / ${services[i].readingGuide.rows.length} 项`;
        });
        detail.querySelector('[data-table-columns]').addEventListener('click',e=>{
          const full=detail.querySelector('.data-section--supplies').classList.toggle('is-full-table');
          e.currentTarget.setAttribute('aria-pressed',String(full));
          e.currentTarget.textContent=full?'返回重点列':'查看全部列';
        });
      }
      detail.scrollIntoView({block:'start'});
      detail.querySelector('h3').focus({preventScroll:true});
    }
    const updateSearch=bindSearch({search,cardBox,docBox,services,result,clear});
    function showHome(){
      current=-1;detail.hidden=true;home.hidden=false;cardBox.hidden=false;serviceTitle.hidden=false;
      documents.hidden=false;result.hidden=false;
      cardBox.querySelectorAll('.card').forEach(b=>b.setAttribute('aria-expanded','false'));
      updateSearch();
    }
    let renderedHash=null;
    function route(){
      const hash=location.hash;
      if(hash===renderedHash)return;
      renderedHash=hash;
      const match=/^#service=([^&]+)$/.exec(hash);
      const i=match?services.findIndex(s=>s.id===match[1]):-1;
      if(i>=0){open(i);return;}
      showHome();
      if(hash==='#documents'){
        search.value='';updateSearch();documents.scrollIntoView({block:'start'});
        document.querySelector('#docsTitle').focus({preventScroll:true});
      }else if(hash==='#home'){home.scrollIntoView({block:'start'});search.focus({preventScroll:true});}
    }
    cardBox.onclick=e=>{const b=e.target.closest('[data-index]');if(b)navigate('#service='+services[Number(b.dataset.index)].id);};
    // All links into the supplies form must pass through the same reading confirmation.
    function guardSupplies(e){
      const link=e.target.closest('a');
      if(!link||guideIndex<0||!services[guideIndex].links.some(x=>x[1]===link.href))return;
      if(current===guideIndex&&detail.querySelector('[data-reading-confirm]')?.checked)return;
      e.preventDefault();navigate('#service='+services[guideIndex].id);
    }
    docBox.onclick=guardSupplies;
    detail.onclick=e=>{
      guardSupplies(e);
      const jump=e.target.closest('[data-step-index]');
      if(jump){
        detail.querySelectorAll('[data-step-index]').forEach(b=>b.setAttribute('aria-pressed',String(b===jump)));
        const step=detail.querySelector(`#step-${services[current].id}-${jump.dataset.stepIndex}`);
        step.scrollIntoView({block:'center'});step.focus({preventScroll:true});
      }
    };
    document.querySelector('#documentsEntry').onclick=e=>{e.preventDefault();navigate('#documents');};
    document.querySelector('#homeEntry').onclick=e=>{e.preventDefault();navigate('#home');};
    clear.onclick=()=>{search.value='';updateSearch();search.focus();};
    window.onhashchange=route;
    notice.replaceChildren(document.createTextNode('没有找到对应事项。请换一个关键词，或清空搜索查看全部事项。'));
    notice.classList.remove('show');route();
  }catch(error){
    current=-1;home.hidden=false;cardBox.hidden=false;serviceTitle.hidden=false;detail.hidden=true;
    documents.hidden=true;result.hidden=true;
    notice.replaceChildren(document.createTextNode(error.message+' '));
    const retry=document.createElement('button');retry.type='button';retry.className='retry';retry.textContent='重新加载';
    retry.onclick=start;notice.append(retry);notice.classList.add('show');
  }
}
start();
