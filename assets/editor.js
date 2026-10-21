import {loadContent, readJSON} from './modules/data.js';
import {renderDetail, renderDocuments} from './modules/render.js';
import {validateContent} from './modules/validate.js';

const $=s=>document.querySelector(s),form=$('#contentForm');
const labels={title:'事项名称',subtitle:'卡片上的简短说明',keywords:'搜索关键词（空格隔开）',lead:'开头说明',note:'醒目提示 / 日期安排'};
let manifest, services, docs, selected, draft, kind='service', dirty=false;

function message(text,error=false){$('#editorMessage').textContent=text;$('#editorMessage').className=error?'error':'';}
function field(key,label,value,multiline=true){
  const wrapper=document.createElement('label');wrapper.className='editor-field';wrapper.textContent=label;
  const input=document.createElement(multiline?'textarea':'input');input.dataset.field=key;input.value=value??'';wrapper.append(input);form.append(wrapper);
}
function arrayGroup(key,label,rows,columns){
  const group=document.createElement('fieldset');group.className='editor-group';group.dataset.array=key;
  const legend=document.createElement('legend');legend.textContent=label;group.append(legend);
  const list=document.createElement('div');list.className='editor-list';group.append(list);
  const addRow=values=>{
    const row=document.createElement('div');row.className='editor-row';
    columns.forEach((name,i)=>{const label=document.createElement('label');label.textContent=name;const input=document.createElement(i===1&&key!=='links'?'textarea':'input');input.value=values[i]??'';input.dataset.column=i;label.append(input);row.append(label);});
    const remove=document.createElement('button');remove.type='button';remove.textContent='删除这一项';remove.onclick=()=>{row.remove();changed();};row.append(remove);list.append(row);
  };
  rows.forEach(addRow);
  const add=document.createElement('button');add.type='button';add.className='editor-add';add.textContent='＋ 新增一项';add.onclick=()=>{addRow([]);changed();};group.append(add);form.append(group);
}
function collect(){
  const value=structuredClone(draft);
  if(kind==='service') {
    for(const key of Object.keys(labels))value[key]=form.querySelector(`[data-field="${key}"]`).value;
    if(value.statusGuide)for(const key of ['title','description','stepsTitle','actionIndex']){const raw=form.querySelector(`[data-field="guide.${key}"]`).value;value.statusGuide[key]=key==='actionIndex'?Number(raw)-1:raw;}
  }
  const arrays={};
  form.querySelectorAll('[data-array]').forEach(group=>{arrays[group.dataset.array]=[...group.querySelectorAll('.editor-row')].map(row=>[...row.querySelectorAll('[data-column]')].map(input=>input.value));});
  return kind==='documents'?arrays.documents:Object.assign(value,arrays);
}
function preview(){
  const value=collect(),errors=validateContent(value,kind);
  if(errors.length){$('#contentPreview').textContent='请先补全：'+errors.join('；');return;}
  $('#contentPreview').innerHTML=kind==='documents'?'<div class="docs">'+renderDocuments(value)+'</div>':renderDetail(value);
}
function changed(){dirty=true;preview();}
function show(value,item){
  selected=item;kind=item.kind;draft=structuredClone(value);form.replaceChildren();
  if(kind==='documents')arrayGroup('documents','常用表格与文档',draft,['名称','说明','网址','搜索关键词']);
  else {
    for(const [key,label] of Object.entries(labels))field(key,label,draft[key],!['title','subtitle','keywords'].includes(key));
    arrayGroup('steps','办理步骤（按显示顺序）',draft.steps,['步骤名称','怎么做']);
    arrayGroup('links','表格与系统入口',draft.links,['按钮文字','网址']);
    if(draft.statuses){
      for(const key of ['title','description','stepsTitle'])field('guide.'+key,{title:'状态区标题',description:'状态区提醒',stepsTitle:'流程区标题'}[key],draft.statusGuide[key]);
      field('guide.actionIndex','重点提醒第几种状态（从1开始）',draft.statusGuide.actionIndex+1,false);
      arrayGroup('statuses','状态说明',draft.statuses,['状态名称','含义与下一步']);
    }
  }
  $('#filePath').textContent='将更新：content/'+item.file;
  const folder=item.file.includes('/')?'content/'+item.file.slice(0,item.file.lastIndexOf('/')):'content';
  $('#uploadLink').href='https://github.com/dudu2lulu/yichu-process-board/upload/main/'+folder;
  dirty=false;message('修改后点击“检查并下载配置”；下载本身不会发布。');preview();
}
function selectedItem(){const value=$('#contentSelect').value;if(value==='documents')return {kind:'documents',file:manifest.documents};return {kind:'service',...manifest.services.find(x=>x.id===value)};}
function loadSelected(){const item=selectedItem();show(item.kind==='documents'?docs:services.find(x=>x.id===item.id),item);}
form.oninput=changed;form.onsubmit=e=>e.preventDefault();
$('#contentSelect').onchange=()=>{if(dirty&&!confirm('还有未下载的修改，确定切换吗？')){$('#contentSelect').value=selected.id||'documents';return;}loadSelected();};
$('#downloadConfig').onclick=()=>{
  const value=collect(),errors=validateContent(value,kind);
  if(errors.length){message(errors.join('\n'),true);return;}
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=selected.file.split('/').pop();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  dirty=false;message('配置已下载。请点击“打开 GitHub 上传位置”，上传这个同名文件并提交后才会上线。');
};
$('#resetConfig').onclick=async()=>{if(dirty&&!confirm('重新载入会丢弃未下载的修改，继续吗？'))return;try{const item=selectedItem();const value=await readJSON(new URL('../content/'+item.file+'?refresh='+Date.now(),import.meta.url));show(value,item);}catch(e){message(e.message,true);}};
$('#importConfig').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;const value=JSON.parse(await file.text());const type=Array.isArray(value)?'documents':'service';const errors=validateContent(value,type);if(errors.length)throw new Error(errors.join('；'));const item=type==='documents'?{kind:type,file:manifest.documents}:{kind:type,...manifest.services.find(x=>x.id===value.id)};if(!item.file)throw new Error('这个事项不在索引中；请先添加索引再维护。');$('#contentSelect').value=value.id||'documents';show(value,item);dirty=true;message('已导入本地配置，可修改后重新下载。');}catch(error){message(error.message,true);}finally{e.target.value='';}};
try {
  ({manifest,services,docs}=await loadContent());
  services.forEach(s=>{const option=document.createElement('option');option.value=s.id;option.textContent=s.title;$('#contentSelect').append(option);});
  const option=document.createElement('option');option.value='documents';option.textContent='常用表格与文档';$('#contentSelect').append(option);loadSelected();
}catch(error){message(error.message,true);$('#downloadConfig').disabled=true;$('#uploadLink').hidden=true;}
