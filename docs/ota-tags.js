// OtaAI tags are interpreted as DATA, never passed into innerHTML.
export function parseOtaTags(value,sentAt=Date.now()){
 let text=String(value||'');const items=[],limit=48;
 const patterns=[
  ['code',/<code\s*=\s*["']?([\w+.#-]{1,25})["']?\s*>([\s\S]*?)<\/code>/i],
  ['save',/<save(?:\s+name\s*=\s*["']?([\w -]{1,60})["']?)?\s*>([\s\S]*?)<\/save>/i],
  ['color',/<color\s*=\s*["']?(#[a-f\d]{3,6}|[a-z]{2,20})["']?\s*>([\s\S]*?)<\/color>/i],
  ['mark',/<mark>([\s\S]*?)<\/mark>/i],
  ['spoiler',/<spoiler>([\s\S]*?)<\/spoiler>/i],
  ['kbd',/<kbd>([\s\S]*?)<\/kbd>/i],
  ['notice',/<notice>([\s\S]*?)<\/notice>/i],
  ['time',/<time(?:\s+([da])\s*=\s*["']?(\d{1,8})["']?)?\s*>/i],
  ['stime',/<stime\s*>/i]
 ];
 for(let i=0;i<limit;i++){
  const found=patterns.map(([type,re])=>({type,match:re.exec(text)}))
    .filter(x=>x.match).sort((a,b)=>a.match.index-b.match.index)[0];
  if(!found)break;
  const {type,match}=found,data={type},marker='\uE100'+items.length+'\uE101';
  if(type==='code'){data.lang=String(match[1]).toLowerCase();data.content=match[2].replace(/^\n/,'').replace(/\n$/,'').slice(0,12000);}
  if(type==='save'){data.name=String(match[1]||'').trim().slice(0,60);data.content=match[2].trim().slice(0,400);}
  if(type==='color'){data.color=match[1].toLowerCase();data.content=match[2].slice(0,3000);}
  if(['mark','spoiler','kbd','notice'].includes(type))data.content=match[1].slice(0,3000);
  if(type==='time'){data.direction=match[1]||'';data.seconds=Number(match[2]||0);data.base=Number.isFinite(sentAt)?sentAt:Date.now();}
  if(type==='stime')data.base=Date.now();
  items.push(data);
  text=text.slice(0,match.index)+marker+text.slice(match.index+match[0].length);
 }
 return {text,items};
}
export function memoryBlocks(raw){
 const re=/<save(?:\s+name\s*=\s*["']?([\w -]{1,60})["']?)?\s*>([\s\S]*?)<\/save>/gi,values=[];
 for(const match of String(raw||'').matchAll(re)){
  if(values.length>=5)break;
  const content=match[2].trim().slice(0,400);
  if(content)values.push({name:String(match[1]||'').trim().slice(0,60),content});
 }
 return values;
}
const allowedColors=new Set('red crimson pink magenta purple violet blue navy cyan teal green lime yellow orange gold brown gray grey white black silver coral salmon indigo turquoise beige maroon olive aqua'.split(' '));
function safeColor(value){
 return /^#[a-f0-9]{3}(?:[a-f0-9]{3})?$/.test(value)||allowedColors.has(value)?value:null;
}
const tokens={
 python:'def class return from import as if elif else for while break continue yield lambda async await with try except finally raise pass True False None self in is not and or global nonlocal match case print',
 javascript:'const let var function return class new if else for while break continue switch case async await try catch finally throw import export default null undefined true false typeof this',
 typescript:'interface type declare namespace readonly implements extends public private protected abstract keyof infer unknown never any',
 cpp:'include using namespace std int float double char bool void auto const constexpr template typename class struct return if else for while public private protected virtual override new delete nullptr',
 rust:'fn let mut pub impl struct enum trait use mod match if else for while loop return self Self Option Result Some None Ok Err async await move const static where',
 kotlin:'fun val var class object data sealed interface when if else for while return suspend companion override open private public internal null true false is in',
 csharp:'using namespace class public private protected internal static void int string bool var async await Task return new if else for foreach while null true false get set record',
 java:'import package class public private protected static void int String boolean new return if else for while final extends implements interface null true false',
 go:'package import func var const type struct interface map chan go defer if else for range return nil true false',
 sql:'SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE GROUP BY ORDER LIMIT AS DISTINCT',
 bash:'if then else fi for do done function case esac echo export local read',
 ruby:'def class module end if else elsif unless while for do return yield true false nil require',
 lua:'local function end if then else elseif for while do return nil true false repeat until',
 swift:'import let var func class struct enum protocol if else for while return guard nil true false async await',
 php:'function class public private protected static echo return if else for while new null true false',
 css:'color background display position flex grid width height margin padding font border',
 html:'html head body script style div span button input form section article'
};
const aliases={js:'javascript',ts:'typescript','c++':'cpp','c#':'csharp',cs:'csharp',py:'python',rs:'rust',kt:'kotlin',sh:'bash',golang:'go',rb:'ruby'};
export function colorCode(root,content,language){
 const name=aliases[language]||language,words=new Set((tokens[name]||'').toLowerCase().split(/\s+/).filter(Boolean));
 const matcher=/(\/\/[^\n]*|#[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b)/g;
 let at=0;
 for(const m of content.matchAll(matcher)){
  if(m.index>at)root.append(document.createTextNode(content.slice(at,m.index)));
  const v=m[0];let cls='';
  if(v.startsWith('"')||v.startsWith("'"))cls='token-string';
  else if((['python','bash','ruby'].includes(name)&&v[0]==='#')||(name==='sql'&&v.startsWith('--'))||(['javascript','typescript','cpp','rust','kotlin','csharp','java','go','swift','php'].includes(name)&&v.startsWith('//')))cls='token-comment';
  else if(/^\d/.test(v))cls='token-number';
  else if(words.has(v.toLowerCase()))cls='token-keyword';
  if(cls){const s=document.createElement('span');s.className=cls;s.textContent=v;root.append(s);}
  else root.append(document.createTextNode(v));
  at=m.index+v.length;
 }
 if(at<content.length)root.append(document.createTextNode(content.slice(at)));
}
const activeTimes=new Set();let interval=null;
function updateTime(node,entry){
 const now=Date.now();
 if(entry.type==='stime'){node.textContent=String(Math.floor(now/1000));return;}
 if(entry.direction){
  const elapsed=Math.floor((now-entry.base)/1000),value=entry.direction==='d'?entry.seconds+elapsed:Math.max(0,entry.seconds-elapsed);
  const h=Math.floor(value/3600),m=Math.floor(value%3600/60),s=value%60;
  node.textContent=(h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
 }else node.textContent=new Date().toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function timeNode(entry){
 const node=document.createElement('time');node.className='ota-time';
 updateTime(node,entry);activeTimes.add({node,entry,created:Date.now()});
 if(interval===null)interval=setInterval(()=>{
  for(const item of activeTimes){
   if(!item.node.isConnected&&Date.now()-item.created>3000){activeTimes.delete(item);continue;}
   updateTime(item.node,item.entry);
  }
  if(activeTimes.size===0){clearInterval(interval);interval=null;}
 },1000);
 return node;
}
// This runs JavaScript only, only when a person clicks Run, in an opaque-origin
// sandboxed frame. CSP blocks external network and frame navigation.
// The runner runs in a Worker inside an opaque-origin iframe. Workers are
// terminable and a restrictive CSP blocks network access and page privileges.
const runnerHtml="<!doctype html><meta http-equiv=\"Content-Security-Policy\" content=\"default-src &#39;none&#39;; script-src &#39;unsafe-inline&#39; &#39;unsafe-eval&#39;; worker-src blob:; connect-src &#39;none&#39;; img-src &#39;none&#39;; frame-src &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;\"><script>\nconst workerSource=\"\\nself.onmessage=async event=>{\\n const logs=[],limit=150,code=String(event.data?.code||'').slice(0,12000);\\n function report(...items){\\n  if(logs.length>=limit)return;\\n  const values=items.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v);}catch{return String(v);}});\\n  logs.push(values.join(' ').slice(0,1000));\\n }\\n const console={log:report,info:report,warn:report,error:report};\\n try{\\n  const run=new Function('console','\\\"use strict\\\";\\\\n'+code);\\n  const result=await run(console);\\n  if(result!==undefined)report('=>',result);\\n }catch(error){report('Error:',String(error?.message||error));}\\n self.postMessage({kind:'finished',text:logs.join('\\\\n').slice(0,15000)||'(no output)'});\\n};\";\naddEventListener('message',event=>{\n if(!event.data||event.data.kind!=='ota-run')return;\n const token=event.data.token;let worker,objectUrl,complete=false;\n function finish(value){\n  if(complete)return;complete=true;\n  if(worker)worker.terminate();\n  if(objectUrl)URL.revokeObjectURL(objectUrl);\n  parent.postMessage({kind:'ota-output',token,text:String(value).slice(0,15000)},'*');\n }\n try{\n  objectUrl=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));\n  worker=new Worker(objectUrl);\n  worker.onmessage=e=>{if(e.data?.kind==='finished')finish(e.data.text);};\n  worker.onerror=e=>{finish('Worker error: '+(e.message||'unknown'));};\n  worker.postMessage({code:String(event.data.code||'').slice(0,12000)});\n  setTimeout(()=>finish('Execution stopped after 2 seconds.'),2000);\n }catch(error){finish('Sandbox unavailable: '+String(error?.message||error));}\n});</script>";
function executeJS(code,button,output){
 button.disabled=true;output.hidden=false;output.textContent='Running in sandbox...';
 const frame=document.createElement('iframe');frame.className='ota-run-frame';
 frame.setAttribute('sandbox','allow-scripts');frame.srcdoc=runnerHtml;
 const token=Math.random().toString(36).slice(2)+Date.now().toString(36);
 let done=false;
 const stop=message=>{if(done)return;done=true;window.removeEventListener('message',receive);clearTimeout(timer);frame.remove();button.disabled=false;output.textContent=message;};
 const receive=e=>{if(e.source===frame.contentWindow&&e.data?.kind==='ota-output'&&e.data?.token===token)stop(String(e.data.text).slice(0,15000));};
 window.addEventListener('message',receive);
 const timer=setTimeout(()=>stop('Execution stopped after 2.5 seconds.'),2500);
 frame.addEventListener('load',()=>frame.contentWindow.postMessage({kind:'ota-run',token,code},'*'));
 document.body.append(frame);
}
export function createCodeBlock(text,language='text'){
 const code=String(text||'').slice(0,12000),lang=String(language||'text').toLowerCase().replace(/[^a-z0-9+#.-]/g,'').slice(0,25);
 const card=document.createElement('section');card.className='code-card ota-code-card';
 const head=document.createElement('div');head.className='code-header';
 const label=document.createElement('span');label.className='code-language';label.textContent=lang;
 const actions=document.createElement('div');actions.className='ota-code-actions';
 const copy=document.createElement('button');copy.type='button';copy.className='code-copy';copy.textContent='Copy';
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code);copy.textContent='Copied ✓';setTimeout(()=>copy.textContent='Copy',1400);}catch{copy.textContent='Select code';}});
 actions.append(copy);
 const output=document.createElement('pre');output.className='ota-code-output';output.hidden=true;
 if(['js','javascript'].includes(lang)){
  const run=document.createElement('button');run.type='button';run.className='code-copy';run.textContent='▶ Run JS';
  run.addEventListener('click',()=>executeJS(code,run,output));actions.append(run);
 }
 head.append(label,actions);
 const pre=document.createElement('pre'),element=document.createElement('code');
 element.className='language-'+lang; colorCode(element,code,lang);pre.append(element);
 card.append(head,pre,output);return card;
}
export function makeOtaNode(item,options={}){
 if(['time','stime'].includes(item.type))return timeNode(item);
 if(item.type==='code')return createCodeBlock(item.content,item.lang);
 if(item.type==='color'||item.type==='mark'){
  const el=document.createElement(item.type==='mark'?'mark':'span');
  el.className=item.type==='mark'?'ota-highlight':'ota-colored';
  if(item.type==='color'){const color=safeColor(item.color);if(color)el.style.color=color;}
  if(options.renderNested)options.renderNested(el,item.content);
  else el.textContent=item.content;
  return el;
 }
 if(item.type==='kbd'){
  const key=document.createElement('kbd');key.className='ota-kbd';key.textContent=item.content;return key;
 }
 if(item.type==='notice'){
  const box=document.createElement('aside');box.className='ota-notice';
  if(options.renderNested)options.renderNested(box,item.content);else box.textContent=item.content;
  return box;
 }
 if(item.type==='spoiler'){
  const box=document.createElement('span');box.className='ota-spoiler';
  const button=document.createElement('button');button.type='button';button.className='ota-spoiler-button';button.textContent='Show spoiler';
  button.setAttribute('aria-expanded','false');
  const contents=document.createElement('span');contents.hidden=true;
  if(options.renderNested)options.renderNested(contents,item.content);else contents.textContent=item.content;
  button.addEventListener('click',()=>{
   contents.hidden=!contents.hidden;button.setAttribute('aria-expanded',String(!contents.hidden));
   button.textContent=contents.hidden?'Show spoiler':'Hide spoiler';
  });
  box.append(button,contents);return box;
 }
 if(item.type==='save'){
  const block=document.createElement('span');block.className='ota-save';
  const content=document.createElement('span');content.textContent='🧠 '+item.content;block.append(content);
  if(options.onSave&&item.content){
   const btn=document.createElement('button');btn.type='button';btn.className='ota-save-button';btn.textContent='Save';
   btn.addEventListener('click',()=>{
    if(options.onSave(item.name||item.content.slice(0,50),item.content)){btn.disabled=true;btn.textContent='Saved ✓';}
   });
   block.append(btn);
  }
  return block;
 }
 return document.createTextNode('');
}
