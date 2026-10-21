const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const urlOK = value => typeof value === 'string' && /^(https?:\/\/[^\s]+|tel:[+\d-]+)$/.test(value);
function pairs(value, name, errors, width=2) {
  if (!Array.isArray(value)) {errors.push(name+'必须是列表');return;}
  value.forEach((row,index)=>{
    if(!Array.isArray(row)||row.length!==width||!row.every(x=>typeof x==='string')) errors.push(name+'第'+(index+1)+'项格式不正确');
    else if(!nonempty(row[0])) errors.push(name+'第'+(index+1)+'项名称不能为空');
  });
}

export function validateContent(value, kind='service') {
  const errors=[];
  if(kind==='documents') {
    pairs(value,'文档',errors,4);
    if(Array.isArray(value))value.forEach((row,i)=>{if(!urlOK(row?.[2]))errors.push('文档第'+(i+1)+'项链接须为 http、https 或 tel 地址');});
    return errors;
  }
  if(!value||typeof value!=='object'||Array.isArray(value))return ['事项配置必须是一个对象'];
  for(const key of ['id','title','subtitle','keywords','lead'])if(!nonempty(value[key]))errors.push(key+'不能为空');
  if(value.note!==undefined&&typeof value.note!=='string')errors.push('提示必须是文字');
  pairs(value.steps,'步骤',errors);
  pairs(value.links,'入口',errors);
  if(Array.isArray(value.links))value.links.forEach((row,i)=>{if(!urlOK(row?.[1]))errors.push('入口第'+(i+1)+'项链接须为 http、https 或 tel 地址');});
  if(value.statuses!==undefined) {
    pairs(value.statuses,'状态',errors);
    for(const key of ['title','description','stepsTitle'])if(!nonempty(value.statusGuide?.[key]))errors.push('状态说明的'+key+'不能为空');
    const index=value.statusGuide?.actionIndex;
    if(!Number.isInteger(index)||index<0||index>=value.statuses?.length)errors.push('需处理的状态序号无效');
  }
  return errors;
}
