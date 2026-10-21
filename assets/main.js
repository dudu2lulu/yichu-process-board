import {loadContent} from './modules/data.js';
import {renderCards, renderDocuments, renderDetail} from './modules/render.js';
import {bindSearch} from './modules/search.js';

const cardBox=document.querySelector('#cards'),docBox=document.querySelector('#docs');
const detail=document.querySelector('#detail'),search=document.querySelector('#search');
let current=-1;

try {
  const {services,docs}=await loadContent();
  cardBox.innerHTML=renderCards(services);
  docBox.innerHTML=renderDocuments(docs);
  function close(){current=-1;detail.hidden=true;cardBox.querySelectorAll('.card').forEach(b=>b.setAttribute('aria-expanded','false'));}
  function open(i){
    current=i;
    cardBox.querySelectorAll('.card').forEach((b,j)=>b.setAttribute('aria-expanded',String(j===i)));
    detail.innerHTML=renderDetail(services[i]);
    detail.hidden=false;
    detail.querySelector('.close').addEventListener('click',close);
    detail.scrollIntoView({block:'start',behavior:'smooth'});
  }
  cardBox.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b){const i=Number(b.dataset.index);current===i?close():open(i);}});
  bindSearch({search,cardBox,docBox,services,currentIndex:()=>current,close});
} catch(error) {
  const notice=document.querySelector('#serviceEmpty');
  notice.textContent=error.message;
  notice.classList.add('show');
}
