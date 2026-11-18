// OtaAI live Markdown composer: transforms completed syntax in-place while typing.
// No HTML injection: formatting is created using DOM nodes, never innerHTML.
const syntax=/(?:\*\*([^*\n]+)\*\*|__([^_\n]+)__|~~([^~\n]+)~~|(?<!\*)\*([^*\n]+)\*|(?<!_)_([^_\n]+)_|\x60([^\x60\n]+)\x60|\[([^\]]{1,150})\]\((https?:\/\/[^\s)]+)\))$/;
function plain(node){
 if(node.nodeType===3)return node.nodeValue||'';
 if(node.nodeType!==1)return '';
 if(node.tagName==='BR')return '\n';
 return Array.from(node.childNodes).map(plain).join('');
}
function sourceOf(node){
 if(node.nodeType===3)return node.nodeValue||'';
 if(node.nodeType!==1)return '';
 const tag=node.tagName.toLowerCase();
 const children=()=>Array.from(node.childNodes).map(sourceOf).join('');
 if(tag==='br')return '\n';
 if(tag==='strong'||tag==='b')return '**'+children()+'**';
 if(tag==='em'||tag==='i')return '*'+children()+'*';
 if(tag==='del'||tag==='s')return '~~'+children()+'~~';
 if(tag==='code'&&node.dataset.editorCode!=='true')return '\x60'+children()+'\x60';
 if(tag==='a'&&/^https?:\/\//i.test(node.getAttribute('href')||''))return '['+children()+']('+node.getAttribute('href')+')';
 if(tag==='pre'){
  const lang=(node.dataset.language||'').replace(/[^\w+.#-]/g,'').slice(0,28);
  const code=node.querySelector('code');
  return '\n\x60\x60\x60'+lang+'\n'+plain(code||node).replace(/\u200b/g,'')+'\n\x60\x60\x60\n';
 }
 if(/^h[1-6]$/.test(tag))return '#'.repeat(Number(tag.slice(1)))+' '+children()+'\n';
 if(tag==='ul')return Array.from(node.children).filter(x=>x.tagName==='LI').map(x=>'- '+Array.from(x.childNodes).map(sourceOf).join('')).join('\n')+'\n';
 if(tag==='ol')return Array.from(node.children).filter(x=>x.tagName==='LI').map((x,i)=>(i+1)+'. '+Array.from(x.childNodes).map(sourceOf).join('')).join('\n')+'\n';
 if(tag==='blockquote')return plain(node).replace(/\n+$/,'').split('\n').map(line=>'> '+line).join('\n')+'\n';
 if(tag==='li')return children();
 if(tag==='p'||tag==='div')return children()+'\n';
 return children();
}
export function editorMarkdown(editor){
 return Array.from(editor.childNodes).map(sourceOf).join('')
  .replace(/\u200b/g,'').trim();
}
function caretInside(editor){
 const sel=window.getSelection?.();
 if(!sel||!sel.rangeCount||!sel.isCollapsed)return null;
 const range=sel.getRangeAt(0);
 if(!editor.contains(range.startContainer))return null;
 return {sel,range,node:range.startContainer,offset:range.startOffset};
}
function afterCaret(sel,node){
 const r=document.createRange();r.setStartAfter(node);r.collapse(true);
 sel.removeAllRanges();sel.addRange(r);
}
function inside(node,selector){
 const el=node.nodeType===1?node:node.parentElement;
 return el?.closest?.(selector)||null;
}
function replaceTextTail(info,length,replacement,target=replacement){
 if(info.node.nodeType!==3)return false;
 const r=document.createRange();
 r.setStart(info.node,info.offset-length);r.setEnd(info.node,info.offset);
 r.deleteContents();r.insertNode(replacement);
 if(target===replacement)afterCaret(info.sel,replacement);
 else{
  const caret=document.createRange();caret.selectNodeContents(target);caret.collapse(true);
  info.sel.removeAllRanges();info.sel.addRange(caret);
 }
 return true;
}
function inlineAtCaret(editor){
 const info=caretInside(editor);if(!info||info.node.nodeType!==3||inside(info.node,'pre'))return false;
 const m=syntax.exec(info.node.nodeValue.slice(0,info.offset));if(!m)return false;
 let node=null;
 if(m[1]!==undefined||m[2]!==undefined){node=document.createElement('strong');node.textContent=m[1]??m[2];}
 else if(m[3]!==undefined){node=document.createElement('del');node.textContent=m[3];}
 else if(m[4]!==undefined||m[5]!==undefined){node=document.createElement('em');node.textContent=m[4]??m[5];}
 else if(m[6]!==undefined){node=document.createElement('code');node.textContent=m[6];}
 else if(m[7]!==undefined&&m[8]!==undefined){
  const url=new URL(m[8]);if(url.protocol!=='http:'&&url.protocol!=='https:')return false;
  node=document.createElement('a');node.href=url.href;node.rel='noopener noreferrer';node.textContent=m[7];
 }
 return node?replaceTextTail(info,m[0].length,node):false;
}
function blockAtCaret(editor){
 const info=caretInside(editor);if(!info||info.node.nodeType!==3||inside(info.node,'pre'))return false;
 const before=info.node.nodeValue.slice(0,info.offset);
 const line=before.slice(before.lastIndexOf('\n')+1);
 let node,inner;
 const head=/^ {0,3}(#{1,6}) $/.exec(line);
 if(head){node=document.createElement('h'+head[1].length);inner=node;}
 else if(/^ {0,3}[-*+] $/.test(line)){
  node=document.createElement('ul');inner=document.createElement('li');node.append(inner);
 }else if(/^ {0,3}> $/.test(line)){
  node=document.createElement('blockquote');inner=document.createElement('p');node.append(inner);
 }else return false;
 inner.append(document.createElement('br'));
 return replaceTextTail(info,line.length,node,inner);
}
function beginCodeFence(editor){
 const info=caretInside(editor);if(!info||info.node.nodeType!==3||inside(info.node,'pre'))return false;
 const left=info.node.nodeValue.slice(0,info.offset),line=left.slice(left.lastIndexOf('\n')+1);
 const match=/^ {0,3}\x60{3}([a-zA-Z][\w+.#-]{0,27})?$/.exec(line);
 if(!match)return false;
 const pre=document.createElement('pre');pre.className='composer-code';pre.dataset.language=match[1]||'text';
 const code=document.createElement('code');code.dataset.editorCode='true';code.spellcheck=false;
 code.append(document.createTextNode(''));pre.append(code);
 return replaceTextTail(info,line.length,pre,code);
}
function closeCodeFence(editor){
 const info=caretInside(editor);if(!info)return false;
 const pre=inside(info.node,'pre.composer-code');if(!pre)return false;
 const code=pre.querySelector('code');if(!code)return false;
 const entire=plain(code);
 // Closing line works even when Enter split the code into several text nodes.
 if(!/(^|\n)\x60{3}$/.test(entire))return false;
 code.textContent=entire.replace(/(?:^|\n)\x60{3}$/,'');
 const next=document.createElement('div');next.append(document.createElement('br'));
 pre.after(next);
 const range=document.createRange();range.setStart(next,0);range.collapse(true);
 info.sel.removeAllRanges();info.sel.addRange(range);
 return true;
}
function insertTextAtCaret(editor,text){
 const sel=window.getSelection?.();if(!sel||!sel.rangeCount)return;
 const range=sel.getRangeAt(0);if(!editor.contains(range.startContainer))return;
 range.deleteContents();
 const node=document.createTextNode(text);
 range.insertNode(node);
 const after=document.createRange();after.setStart(node,text.length);after.collapse(true);sel.removeAllRanges();sel.addRange(after);
}
export function setupComposer(editor,submit){
 let composing=false;
 const onInput=()=>{
  if(composing)return;
  if(closeCodeFence(editor))return;
  if(blockAtCaret(editor))return;
  inlineAtCaret(editor);
 };
 editor.addEventListener('compositionstart',()=>composing=true);
 editor.addEventListener('compositionend',()=>{composing=false;onInput();});
 editor.addEventListener('input',onInput);
 editor.addEventListener('keydown',event=>{
  if(event.key!=='Enter'||event.isComposing||composing)return;
  if((event.ctrlKey||event.metaKey)&&!event.shiftKey){event.preventDefault();submit();return;}
  if(beginCodeFence(editor)){event.preventDefault();return;}
  // In a code block, Enter must insert a newline and NEVER send a message.
  if(inside(window.getSelection?.()?.anchorNode,'pre.composer-code')){
   event.preventDefault();insertTextAtCaret(editor,'\n');
  }
  // All other Enter presses retain the browser's native newline behavior.
 });
 editor.addEventListener('paste',event=>{
  const data=event.clipboardData?.getData('text/plain');if(typeof data!=='string')return;
  event.preventDefault();insertTextAtCaret(editor,data);onInput();
 });
 return {
  value:()=>editorMarkdown(editor),
  clear:()=>editor.replaceChildren(),
  disable:value=>{editor.contentEditable=value?'false':'true';editor.setAttribute('aria-disabled',String(!!value));}
 };
}
