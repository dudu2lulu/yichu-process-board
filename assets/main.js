import {loadContent} from './modules/data.js';
import {renderCards, renderDocuments, renderDetail} from './modules/render.js?v=readability-1';
import {bindSearch} from './modules/search.js';

const cardBox=document.querySelector('#cards'),docBox=document.querySelector('#docs');
const detail=document.querySelector('#detail'),search=document.querySelector('#search');
const documents=document.querySelector('#documents');
let current=-1;

try {
  const {services,docs}=await loadContent();
  cardBox.innerHTML=renderCards(services);
  docBox.innerHTML=renderDocuments(docs);
  function close(){current=-1;detail.hidden=true;documents.hidden=false;cardBox.querySelectorAll('.card').forEach(b=>b.setAttribute('aria-expanded','false'));}
  function open(i){
    current=i;
    documents.hidden=true;
    cardBox.querySelectorAll('.card').forEach((b,j)=>b.setAttribute('aria-expanded',String(j===i)));
    detail.innerHTML=renderDetail(services[i]);
    detail.hidden=false;
    const confirmation=detail.querySelector('[data-reading-confirm]');
    if(confirmation)confirmation.addEventListener('change',()=>{detail.querySelector('[data-reading-links]').hidden=!confirmation.checked;});
    detail.querySelector('.close').addEventListener('click',close);
    detail.scrollIntoView({block:'start',behavior:'smooth'});
  }
  cardBox.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b){const i=Number(b.dataset.index);current===i?close():open(i);}});
  docBox.addEventListener('click',e=>{const link=e.target.closest('a');const i=services.findIndex(s=>s.readingGuide&&s.links.some(x=>x[1]===link?.href));if(i>=0){e.preventDefault();open(i);}});
  bindSearch({search,cardBox,docBox,services,currentIndex:()=>current,close});
  document.querySelector('#documentsEntry').addEventListener('click',()=>{close();search.value='';search.dispatchEvent(new Event('input'));});
  if(location.hash==='#documents')documents.scrollIntoView({block:'start'});
} catch(error) {
  const notice=document.querySelector('#serviceEmpty');
  notice.textContent=error.message;
  notice.classList.add('show');
}
