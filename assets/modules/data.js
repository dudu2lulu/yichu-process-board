async function readJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('内容暂时无法加载，请刷新重试。');
  return response.json();
}

export async function loadContent() {
  const base = new URL('../../content/', import.meta.url);
  const manifest = await readJSON(new URL('index.json', base));
  const [services, docs, materials] = await Promise.all([
    Promise.all(manifest.services.map(item => readJSON(new URL(item.file, base)))),
    readJSON(new URL(manifest.documents, base)),
    readJSON(new URL('search-index.json', base)).catch(()=>null),
  ]);
  return {manifest, services, docs, materials};
}

export {readJSON};
