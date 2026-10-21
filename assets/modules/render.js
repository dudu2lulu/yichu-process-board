export const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function renderCards(services) {
  return services.map((s,i)=>`<button class="card" type="button" data-index="${i}" aria-expanded="false"><span class="num">${String(i+1).padStart(2,'0')}</span><strong>${esc(s.title)}</strong><small>${esc(s.subtitle)}</small><span class="hint">查看步骤</span></button>`).join('');
}

export function renderDocuments(docs) {
  return docs.map(d=>`<a class="doc" href="${esc(d[2])}" target="_blank" rel="noopener" data-search="${esc(d[0]+' '+d[1]+' '+d[3])}"><strong>${esc(d[0])}</strong><span>${esc(d[1])}</span></a>`).join('');
}

export function renderDetail(s) {
  const steps=s.steps.length?`<ol class="steps">${s.steps.map(x=>`<li><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></li>`).join('')}</ol>`:'';
  const links=s.links.length?`<div class="links">${s.links.map(x=>`<a href="${esc(x[1])}" ${x[1].startsWith('http')?'target="_blank" rel="noopener"':''}>${esc(x[0])}</a>`).join('')}</div>`:'';
  const guide=s.statusGuide;
  const statuses=s.statuses?`<section class="status-guide" aria-labelledby="statusTitle"><h4 id="statusTitle">${esc(guide.title)}</h4><p>${esc(guide.description)}</p><ol class="status-list">${s.statuses.map((x,j)=>`<li class="${j===guide.actionIndex?'needs-action':''}"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></li>`).join('')}</ol></section>`:'';
  return `<div class="detail-head"><div><h3>${esc(s.title)}</h3><p class="lead">${esc(s.lead)}</p></div><button class="close" type="button">收起</button></div>${s.note?`<p class="notice">${esc(s.note)}</p>`:''}${s.statuses?links+statuses+`<h4>${esc(guide.stepsTitle)}</h4>`+steps:steps+links}`;
}
