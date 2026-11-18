// Safe DOM-only Markdown rendering for users and assistant messages.
const inlinePattern=/(\[([^\]]{1,180})\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|~~([^~\n]+)~~|\x60([^\x60\n]+)\x60|\*([^*\n]+)\*|_([^_\n]+)_)/g;
function el(tag,cls=''){const x=document.createElement(tag);if(cls)x.className=cls;return x;}
function inline(parent,value,depth=0){
 const str=String(value??'');if(depth>4){parent.append(document.createTextNode(str));return;}
 let at=0;
 for(const m of str.matchAll(inlinePattern)){
  const i=m.index||0;if(i>at)parent.append(document.createTextNode(str.slice(at,i)));
  if(m[2]!==undefined){
   try{
    const url=new URL(m[3]);if(!['http:','https:'].includes(url.protocol))throw Error('Unsafe URL');
    const a=el('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';inline(a,m[2],depth+1);parent.append(a);
   }catch{parent.append(document.createTextNode(m[0]));}
  }else{
   let tag='em',text='';
   if(m[4]!==undefined||m[5]!==undefined){tag='strong';text=m[4]??m[5];}
   else if(m[6]!==undefined){tag='del';text=m[6];}
   else if(m[7]!==undefined){tag='code';text=m[7];}
   else text=m[8]??m[9]??'';
   const x=el(tag);if(tag==='code')x.textContent=text;else inline(x,text,depth+1);parent.append(x);
  }
  at=i+m[0].length;
 }
 if(at<str.length)parent.append(document.createTextNode(str.slice(at)));
}
const tokens=/(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:function|return|const|let|var|if|else|for|while|class|def|import|from|export|async|await|try|catch|finally|raise|pass|break|continue|true|false|null|None|True|False|new|public|private|static|void|fn|mut|impl|match|use|struct|enum)\b|\b\d+(?:\.\d+)?\b)/g;
function highlight(code,where){
 let i=0;for(const m of code.matchAll(tokens)){
  const at=m.index||0;if(at>i)where.append(document.createTextNode(code.slice(i,at)));
  const text=m[0],cls=text.startsWith('//')||text.startsWith('#')?'token-comment':
    text.startsWith('"')||text.startsWith("'")?'token-string':/^\d/.test(text)?'token-number':'token-keyword';
  const span=el('span',cls);span.textContent=text;where.append(span);i=at+text.length;
 }
 if(i<code.length)where.append(document.createTextNode(code.slice(i)));
}
function codeBlock(root,code,lang){
 const card=el('section','code-card'),head=el('div','code-header'),label=el('span','code-language'),copy=el('button','code-copy');
 label.textContent=(lang||'text').slice(0,32);copy.type='button';copy.textContent='Copy code';
 copy.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(code);copy.textContent='Copied ✓';setTimeout(()=>copy.textContent='Copy code',1400);}
  catch{copy.textContent='Select and copy';}
 });
 head.append(label,copy);
 const pre=el('pre'),codeTag=el('code');codeTag.className='language-'+String(lang||'text').replace(/[^a-z0-9+#-]/gi,'');
 highlight(code,codeTag);pre.append(codeTag);card.append(head,pre);root.append(card);
}
const fence=line=>/^ {0,3}(\x60{3,}|~{3,})\s*([^\s\x60~]*)\s*$/.exec(line);
const listLine=line=>/^ {0,3}([-*+]|\d+[.)])\s+(.+)$/.exec(line);
const heading=line=>/^ {0,3}(#{1,6})\s+(.+)$/.exec(line);
const quote=line=>/^ {0,3}>\s?(.*)$/.exec(line);
const divider=line=>/^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
const row=line=>line.trim().replace(/^\|/,'').replace(/\|$/,'').split(/(?<!\\)\|/).map(x=>x.trim().replace(/\\\|/g,'|'));
const sep=line=>line.includes('|')&&row(line).length>1&&row(line).every(c=>/^:?-{3,}:?$/.test(c));
const blockStart=(lines,i)=>{
 const l=lines[i]||'';
 return !l.trim()||fence(l)||heading(l)||listLine(l)||quote(l)||divider(l)||(l.includes('|')&&sep(lines[i+1]||''));
};
export function renderMarkdown(root,input){
 root.replaceChildren();const lines=String(input??'').replace(/\r\n?/g,'\n').split('\n');
 let i=0,limit=0;
 while(i<lines.length&&limit++<400){
  const l=lines[i];if(!l.trim()){i++;continue;}
  const f=fence(l);
  if(f){
   i++;const char=f[1][0],size=f[1].length,language=f[2]||'text',body=[];
   const end=new RegExp('^ {0,3}'+(char==='~'?'~':'\\x60')+'{'+size+',}\\s*$');
   while(i<lines.length&&!end.test(lines[i]))body.push(lines[i++]);
   if(i<lines.length)i++;codeBlock(root,body.join('\n'),language);continue;
  }
  const h=heading(l);if(h){const tag=el('h'+h[1].length);inline(tag,h[2]);root.append(tag);i++;continue;}
  if(divider(l)){root.append(el('hr'));i++;continue;}
  if(l.includes('|')&&sep(lines[i+1]||'')){
   const heads=row(l),table=el('table'),thead=el('thead'),top=el('tr');
   for(const t of heads){const th=el('th');inline(th,t);top.append(th);}
   thead.append(top);table.append(thead);i+=2;
   const body=el('tbody');
   while(i<lines.length&&lines[i].includes('|')&&lines[i].trim()){
    const tr=el('tr'),items=row(lines[i++]);
    for(let j=0;j<heads.length;j++){const td=el('td');inline(td,items[j]||'');tr.append(td);}
    body.append(tr);
   }
   table.append(body);const wrap=el('div','table-scroll');wrap.append(table);root.append(wrap);continue;
  }
  if(quote(l)){
   const block=el('blockquote');while(i<lines.length){
    const m=quote(lines[i]);if(!m)break;
    const p=el('p');inline(p,m[1]);block.append(p);i++;
   }
   root.append(block);continue;
  }
  const li=listLine(l);
  if(li){
   const ordered=/^\d/.test(li[1]),list=el(ordered?'ol':'ul');
   while(i<lines.length){
    const m=listLine(lines[i]);if(!m||/^\d/.test(m[1])!==ordered)break;
    const item=el('li'),task=/^\[( |x|X)\]\s+(.+)$/.exec(m[2]);
    if(task){
     const cb=el('input');cb.type='checkbox';cb.checked=task[1].toLowerCase()==='x';cb.disabled=true;
     item.append(cb);inline(item,task[2]);
    }else inline(item,m[2]);
    list.append(item);i++;
   }
   root.append(list);continue;
  }
  const linesInPara=[];
  while(i<lines.length&&(linesInPara.length===0||!blockStart(lines,i))){
   if(!lines[i].trim())break;linesInPara.push(lines[i++]);
  }
  if(!linesInPara.length){i++;continue;}
  const p=el('p');linesInPara.forEach((part,index)=>{if(index)p.append(el('br'));inline(p,part);});root.append(p);
 }
 if(!root.childNodes.length)root.append(el('p'));
}
export const hasMarkdown=input=>/(^|\n)\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|(?:\x60{3}|~{3}))|\*\*[^*]+\*\*|~~[^~]+~~|\x60[^\x60]+\x60|\[[^\]]+\]\(https?:\/\//m.test(String(input||''));
