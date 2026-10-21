import fs from 'node:fs';
import path from 'node:path';
import {validateContent} from '../assets/modules/validate.js';

let files=process.argv.slice(2);
if(!files.length)throw new Error('请指定修改的 JSON 文件；首次迁移才使用 --all。');
if(files.includes('--all')) {
  const manifest=JSON.parse(fs.readFileSync('content/index.json','utf8'));
  files=['content/index.json',...manifest.services.map(item=>'content/'+item.file),'content/'+manifest.documents];
}
for(const file of files) {
  const value=JSON.parse(fs.readFileSync(file,'utf8'));
  if(file.endsWith('/index.json')) {
    if(!Array.isArray(value.services)||!value.services.length)throw new Error('事项索引为空');
    const ids=new Set();
    for(const item of value.services){if(ids.has(item.id))throw new Error('事项ID重复');ids.add(item.id);if(!fs.existsSync(path.join(path.dirname(file),item.file)))throw new Error('事项文件不存在：'+item.file);}
    if(!fs.existsSync(path.join(path.dirname(file),value.documents)))throw new Error('文档配置不存在');
  } else {
    const kind=Array.isArray(value)?'documents':'service',errors=validateContent(value,kind);
    if(kind==='service'&&path.basename(file,'.json')!==value.id)errors.push('文件名应与事项ID一致');
    if(errors.length)throw new Error(file+'：'+errors.join('；'));
  }
  console.log('通过：'+file);
}
