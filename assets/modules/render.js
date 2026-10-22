export const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function renderCards(services) {
  return services.map((s,i)=>`<button class="card" type="button" data-index="${i}" aria-expanded="false"><span class="num">${String(i+1).padStart(2,'0')}</span><strong>${esc(s.title)}</strong><small>${esc(s.subtitle)}</small><span class="hint">查看办理方式</span></button>`).join('');
}

export function renderDocuments(docs) {
  return docs.map(d=>`<a class="doc" href="${esc(d[2])}" target="_blank" rel="noopener" data-search="${esc(d[0]+' '+d[1]+' '+d[3])}"><strong>${esc(d[0])}</strong><span>${esc(d[1])}</span></a>`).join('');
}

export function renderDetail(s) {
  const steps=s.steps.length?`<ol class="steps">${s.steps.map(x=>`<li id="step-${s.id}-${s.steps.indexOf(x)}" tabindex="-1"><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></li>`).join('')}</ol>`:'';
  const links=s.links.length?`<div class="links action-links" ${s.readingGuide?'data-reading-links hidden':''}>${s.pendingFirstLink?`<button type="button" disabled>${esc(s.pendingFirstLink)}（链接待补充）</button>`:''}${s.links.map(x=>`<a href="${esc(x[1])}" ${x[1].startsWith('http')?'target="_blank" rel="noopener"':''}>${esc(x[0])}</a>`).join('')}</div><p class="action-help">按入口提示办理；外部表单提交后，请按目标页面提示查询进度。</p>`:'';
  const guide=s.statusGuide;
  const statuses=s.statuses?`<section class="status-guide" aria-labelledby="statusTitle"><h4 id="statusTitle">${esc(guide.title)}</h4><p>${esc(guide.description)}</p><ol class="status-list">${s.statuses.map((x,j)=>`<li class="${j===guide.actionIndex?'needs-action':''}"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></li>`).join('')}</ol></section>`:'';
  const images=(s.images||[]).map(image=>`<figure class="guide-image"><a href="${esc(image.src)}" target="_blank" rel="noopener" aria-label="${esc(image.alt)}（查看原图）"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy"></a><figcaption>${esc(image.caption||'点击图片查看原图')}</figcaption></figure>`).join('');
  const table = (data,kind) => {
    const columns=kind==='supplies'?[0,2,7,8,1,3,4,5,6]:data.headers.map((_,i)=>i);
    return `<section class="data-section data-section--${kind}" aria-labelledby="${s.id}-${kind}-title"><div class="data-heading"><h4 id="${s.id}-${kind}-title">${esc(data.title)}</h4><span class="data-count">${data.rows.length}</span>${kind==='supplies'?'<span class="table-hint">手机可切换重点列／全部列</span>':''}</div>${data.description?`<p class="data-description">${esc(data.description)}</p>`:''}${kind==='supplies'?`<div class="table-tools"><label>查找物品<input type="search" data-table-search placeholder="输入物品、规格或领取范围"></label><button type="button" data-table-columns aria-pressed="false">查看全部列</button><span data-table-result role="status" aria-live="polite">显示 ${data.rows.length} / ${data.rows.length} 项</span></div>`:''}<div class="table-shell" tabindex="0" role="region" aria-label="${esc(data.title)}"><table class="data-table data-table--${kind}"><thead><tr>${columns.map(i=>`<th scope="col">${esc(data.headers[i])}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row=>`<tr>${columns.map(i=>`<td>${kind==='contacts'&&i===1?`<span class="person-badge"><span class="person-dot" aria-hidden="true"></span>${esc(row[i])}</span>`:esc(row[i])||'<span class="cell-empty">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  };
  const reading=s.readingGuide?table(s.readingGuide,'supplies')+`<label class="reading-confirm"><input type="checkbox" data-reading-confirm> ${esc(s.readingGuide.confirmation)}</label>`:'';
  const contacts=s.contacts?`<details class="contacts-disclosure"><summary><span>${esc(s.contacts.title)}</span><span class="data-count">${s.contacts.rows.length}</span></summary>${table(s.contacts,'contacts')}</details>`:'';
  const shortcuts=!s.readingGuide&&s.steps.length?`<nav class="step-shortcuts" aria-label="快速定位办理说明">${s.steps.map((x,i)=>`<button type="button" data-step-index="${i}" aria-pressed="false">${esc(x[0])}</button>`).join('')}</nav>`:'';
  return `<div class="detail-head"><div><h3 tabindex="-1">${esc(s.title)}</h3><p class="lead">${esc(s.lead)}</p></div><button class="close" type="button">返回首页</button></div>${s.note?`<p class="notice">${esc(s.note)}</p>`:''}${!s.readingGuide?links:''}${s.imagesFirst?`<div style="max-width:420px">${images}</div>`:''}${reading}${s.readingGuide?links:''}${contacts}${shortcuts}${s.statuses?(s.stepsFirst?`<h4>${esc(guide.stepsTitle)}</h4>`+steps+statuses:statuses+`<h4>${esc(guide.stepsTitle)}</h4>`+steps):steps}${s.imagesFirst?'':images}`;
}
