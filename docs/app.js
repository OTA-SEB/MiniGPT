import { fallback,detectTopics,detectTopicMatches,topicCount } from './fallback.js?v=1.0';
import { ready,learn,predictTopics,recall,stats,exportWeights,importWeights,getHistory,getChats,getActiveChat,createChat,selectChat,renameChat,deleteChat,getFolders,createFolder,renameFolder,deleteFolder,moveChatToFolder,exportCloudSnapshot,restoreCloudSnapshot,saveMemoryFact,deleteMemoryFact,answerMemory,memoryContext,forgetMemory,inspectMemory,inspectWeights } from './learning.js?v=1.0';
import { inferDefault,respondDefault,trainingStats,defaultWeightView } from './default-model.js?v=1.0';
import { reason } from './reasoning.js?v=1.0';
import { PERSONA } from './personality.js?v=1.0';
import { detectLanguage,localText,LANG_NAMES } from './i18n.js?v=1.0';
import { renderMarkdown } from './markdown.js?v=1.0';
import { setupComposer } from './composer.js?v=1.1';
import { connectGoogle,driveDisconnect,driveConnected,getSavedClientId,setSavedClientId,googleBackupInfo,saveToGoogle,loadFromGoogle } from './google-drive.js?v=1.0';

const el=id=>document.getElementById(id);
const chat=el('chat'),form=el('form'),input=el('message'),provider=el('provider'),model=el('model'),key=el('api-key'),status=el('status');
const defaults={openrouter:'openrouter/free',openai:'gpt-4o-mini',gemini:'gemini-2.5-flash'};
const messages=[];let busy=false,lastLanguage='en',inspectorTab='memory';
const threshold=el('confidence-threshold');
try{const saved=localStorage.getItem('otaai.threshold')||localStorage.getItem('minigpt.threshold');if(['80','90','95'].includes(saved))threshold.value=saved;}catch{}
threshold.addEventListener('change',()=>{
 try{localStorage.setItem('otaai.threshold',threshold.value);}catch{}
 el('confidence-display').textContent='Threshold: '+threshold.value+' %';
});

// Personalization only changes layout; model weights remain untouched.
const prefs={theme:['crimson','blue','gold'],appearance:['dark','light'],font:['small','normal','large'],density:['comfortable','compact']};
for(const [name,options] of Object.entries(prefs)){
 const control=el(name+'-select');let value=options[0];
 try{const old=localStorage.getItem('otaai.'+name);if(options.includes(old))value=old;}catch{}
 control.value=value;document.documentElement.dataset[name]=value;
 control.addEventListener('change',()=>{
  if(!options.includes(control.value))return;
  document.documentElement.dataset[name]=control.value;
  try{localStorage.setItem('otaai.'+name,control.value);}catch{}
 });
}
// Formatting is applied INSIDE the editor as Markdown syntax is completed.
// Enter inserts a newline. Only the Send button or Ctrl/Cmd+Enter submits.
const composer=setupComposer(input,()=>form.requestSubmit());
function updateComposer(){
 input.style.height='auto';
 input.style.height=Math.min(185,Math.max(58,input.scrollHeight||58))+'px';
}
function setGoogleStatus(message){el('google-status').textContent=message;}
function updateGoogleUI(){
 const connected=driveConnected();
 el('google-save').disabled=!connected;el('google-restore').disabled=!connected;
 el('google-disconnect').hidden=!connected;
 el('google-connect').textContent=connected?'Reconnect / switch account':'Connect Google account';
 el('cloud-mini-status').textContent=connected?'● Google Drive connected':'● Local storage';
 el('storage-badge').textContent=connected?'● Google connected':'● Local';
}
el('google-client-id').value=getSavedClientId();
el('google-connect').addEventListener('click',()=>{
 try{
  const clientId=setSavedClientId(el('google-client-id').value);
  setGoogleStatus('Requesting Google permission...');
  // The OAuth popup must originate in a user click.
  connectGoogle(clientId).then(async()=>{
   updateGoogleUI();setGoogleStatus('Connected. Manual backup is ready.');
   try{const b=await googleBackupInfo();setGoogleStatus(b.exists?'Backup found: '+new Date(b.modifiedTime).toLocaleString():'Connected. No existing backup.');}
   catch(err){setGoogleStatus('Connected, backup lookup failed: '+err.message);}
  }).catch(err=>{updateGoogleUI();setGoogleStatus(err.message);});
 }catch(err){setGoogleStatus(err.message);}
});
el('google-disconnect').addEventListener('click',()=>{
 driveDisconnect();updateGoogleUI();setGoogleStatus('Disconnected from this session.');
});
el('google-save').addEventListener('click',async()=>{
 if(!driveConnected())return;
 el('google-save').disabled=true;setGoogleStatus('Saving to Google Drive...');
 try{
  const saved=await saveToGoogle(await exportCloudSnapshot());
  setGoogleStatus('Saved to Google Drive ('+Math.round(saved.bytes/1024)+' KB) · '+new Date().toLocaleString());
 }catch(err){setGoogleStatus('Backup failed: '+err.message);}
 finally{updateGoogleUI();}
});
el('google-restore').addEventListener('click',async()=>{
 if(!driveConnected()||busy)return;
 if(window.confirm&&!window.confirm('Restore Google backup? This REPLACES local chats, folders, memories and weights. Export a local backup first if needed.'))return;
 el('google-restore').disabled=true;setGoogleStatus('Loading cloud backup...');
 try{
  const {snapshot}=await loadFromGoogle();await restoreCloudSnapshot(snapshot);
  setPanel(null);renderActiveChat();refreshLearning();
  setGoogleStatus('Google backup restored.');
 }catch(err){setGoogleStatus('Restore failed: '+err.message);}
 finally{updateGoogleUI();}
});
updateGoogleUI();

function element(tag,cls='',content=''){
 const item=document.createElement(tag);
 if(cls)item.className=cls;
 if(content!==undefined)item.textContent=String(content);
 return item;
}
function bubble(role,text,meta=null){
 const item=element('article','bubble '+(role==='user'?'user':'bot'));
 if(role!=='user'){
  const origin=meta&&typeof meta==='object'?meta:{mode:'fallback',trigger:'Not recorded for this older message'};
  const brain=['api','trained'].includes(origin.mode),button=element('button','origin-button'+(brain?' origin-brain':' origin-puzzle'),brain?'🧠':'🧩');
  button.type='button';button.title=brain?'AI source details':'Automatic response details';
  button.setAttribute('aria-label',button.title);button.setAttribute('aria-expanded','false');
  const detail=element('div','origin-detail');detail.hidden=true;
  if(origin.mode==='api')detail.textContent='Model: '+(origin.model||'Not saved')+(origin.provider?' · '+origin.provider:'');
  else if(origin.mode==='trained')detail.textContent='Estimated confidence: '+(Number.isFinite(origin.confidence)?origin.confidence+'%':'Not available');
  else detail.textContent='Trigger: '+(origin.trigger||'Not recorded for this older message');
  button.addEventListener('click',()=>{
   detail.hidden=!detail.hidden;button.setAttribute('aria-expanded',String(!detail.hidden));
  });
  item.append(button,detail);
 }
 const body=element('div','bubble-text md-body');renderMarkdown(body,text);item.append(body);
 chat.append(item);chat.scrollTop=chat.scrollHeight;
}
const workspace=document.querySelector('.workspace');
const mobile=()=>!!window.matchMedia?.('(max-width: 860px)').matches;
let pendingMoveId=null,activePanel=null;
const collapsedFolders=new Set();
const panels={inspector:'inspector',settings:'settings',appearance:'appearance-panel',google:'google-panel'};
function setSidebar(open){
 workspace.classList.toggle('sidebar-open',!!open&&mobile());
 workspace.classList.toggle('sidebar-collapsed',!open&&!mobile());
 el('sidebar-backdrop').hidden=!(open&&mobile());
 el('conversations-toggle').setAttribute('aria-expanded',String(!!open));
}
function closeMobileSidebar(){if(mobile())setSidebar(false);}
function setPanel(next){
 activePanel=next===activePanel?null:next;
 for(const [name,id] of Object.entries(panels)){
  el(id).hidden=name!==activePanel;
  const toggle=el(name==='inspector'?'inspector-toggle':name==='settings'?'settings-toggle':name==='appearance'?'appearance-toggle':'google-toggle');
  toggle.setAttribute('aria-expanded',String(name===activePanel));
  toggle.classList.toggle('active',name===activePanel);
 }
 el('sidebar-library').hidden=!!activePanel;
 el('conversation-search').parentElement.hidden=!!activePanel;
 if(activePanel==='inspector')renderInspector();
 if(activePanel==='google')updateGoogleUI();
}
function makeConversationRow(c){
 const item=element('div','conversation-item'+(c.active?' active':''));
 const open=element('button','conversation-open');open.type='button';open.title=c.title;
 open.setAttribute('aria-current',c.active?'page':'false');
 const details=element('span','conversation-details');
 details.append(element('span','conversation-title',c.title),element('span','conversation-preview',c.preview||'No messages yet'));
 open.append(element('span','conversation-icon','▤'),details);
 open.addEventListener('click',()=>{if(busy)return;if(selectChat(c.id)){renderActiveChat();closeMobileSidebar();}});
 const actions=element('div','conversation-actions');
 const edit=element('button','conversation-action','✎');
 edit.type='button';edit.title='Rename chat';edit.setAttribute('aria-label','Rename '+c.title);
 edit.addEventListener('click',()=>{if(busy)return;if(selectChat(c.id)){renderActiveChat();closeMobileSidebar();el('chat-title').focus();el('chat-title').select();}});
 const move=element('button','conversation-action','⇢');
 move.type='button';move.title='Move to folder';move.setAttribute('aria-label','Move '+c.title+' to folder');
 move.addEventListener('click',()=>{
  if(busy)return;
  pendingMoveId=c.id;
  const select=el('move-folder-select');select.replaceChildren();
  const none=element('option','','No folder');none.value='';select.append(none);
  for(const f of getFolders()){const option=element('option','',f.name);option.value=f.id;select.append(option);}
  select.value=c.folderId||'';
  el('move-chat-dialog').showModal();
 });
 const del=element('button','conversation-action delete','×');del.type='button';del.title='Delete chat';del.setAttribute('aria-label','Delete '+c.title);
 del.addEventListener('click',()=>{
  if(busy)return;if(window.confirm&&!window.confirm('Delete this chat? Saved memories will remain.'))return;
  if(deleteChat(c.id)){renderActiveChat();state('Chat deleted');}
 });
 actions.append(edit,move,del);item.append(open,actions);
 return item;
}
function renderConversationList(){
 const list=el('conversation-list'),folderBox=el('folder-list'),query=el('conversation-search').value.trim().toLowerCase();
 const chats=getChats(),folders=getFolders();
 el('conversation-count').textContent=String(chats.length);
 list.replaceChildren();folderBox.replaceChildren();
 const matches=c=>(c.title+' '+c.preview).toLowerCase().includes(query);
 for(const folder of folders){
  const related=chats.filter(c=>c.folderId===folder.id&&matches(c));
  if(query&&!related.length&&!folder.name.toLowerCase().includes(query))continue;
  const group=element('div','folder-group');
  const header=element('div','folder-header'),open=element('button','folder-open');
  open.type='button';
  const closed=collapsedFolders.has(folder.id)&&!query;
  open.append(element('span','',closed?'▸':'▾'),element('span','folder-title','▣ '+folder.name),element('span','folder-count',String(folder.chatCount)));
  open.addEventListener('click',()=>{collapsedFolders.has(folder.id)?collapsedFolders.delete(folder.id):collapsedFolders.add(folder.id);renderConversationList();});
  const rename=element('button','folder-action','✎');rename.type='button';rename.title='Rename folder';
  rename.addEventListener('click',()=>{if(busy)return;const next=window.prompt?.('Folder name',folder.name);if(next&&renameFolder(folder.id,next))renderConversationList();});
  const remove=element('button','folder-action','×');remove.type='button';remove.title='Delete folder (chats are kept)';
  remove.addEventListener('click',()=>{
   if(busy)return;
   if(window.confirm&&!window.confirm('Delete folder "'+folder.name+'"? Its chats will move to Other conversations.'))return;
   if(deleteFolder(folder.id))renderConversationList();
  });
  header.append(open,rename,remove);group.append(header);
  if(!closed){
   const children=element('div','folder-children');
   for(const c of related)children.append(makeConversationRow(c));
   if(!related.length)children.append(element('p','sidebar-empty','No chats in this folder.'));
   group.append(children);
  }
  folderBox.append(group);
 }
 const unfiled=chats.filter(c=>!c.folderId&&matches(c));
 if(!unfiled.length)list.append(element('p','sidebar-empty',query?'No matching unfiled chats.':'Chats without folders appear here.'));
 for(const c of unfiled)list.append(makeConversationRow(c));
}
function renderActiveChat(){
 const active=getActiveChat(),history=getHistory();messages.length=0;chat.replaceChildren();
 el('chat-title').value=active.title;
 if(history.length){
  for(const m of history){bubble(m.role,m.content,m.meta);messages.push({role:m.role,content:m.content});}
  const last=[...history].reverse().find(m=>m.role==='user');
  lastLanguage=last?detectLanguage(last.content,'en').primary:'en';
 }else{lastLanguage='en';}

 document.documentElement.lang=lastLanguage;
 renderConversationList();if(activePanel==='inspector')renderInspector();
}
function startNewConversation(){
 if(busy)return;createChat();setPanel(null);renderActiveChat();closeMobileSidebar();
 el('confidence-display').textContent='Match: —';state('New conversation');input.focus();
}
const titleInput=el('chat-title');
function saveTitle(){
 if(busy)return;
 const current=getActiveChat(),next=titleInput.value.trim();
 if(next&&next!==current.title)renameChat(current.id,next);
 titleInput.value=getActiveChat().title;renderConversationList();
}
titleInput.addEventListener('blur',saveTitle);
titleInput.addEventListener('keydown',event=>{
 if(event.key==='Enter'){event.preventDefault();titleInput.blur();}
 if(event.key==='Escape'){titleInput.value=getActiveChat().title;titleInput.blur();}
});

el('conversations-toggle').addEventListener('click',()=>{
 if(mobile())setSidebar(!workspace.classList.contains('sidebar-open'));
 else setSidebar(workspace.classList.contains('sidebar-collapsed'));
});
el('conversations-close').addEventListener('click',closeMobileSidebar);
el('sidebar-backdrop').addEventListener('click',closeMobileSidebar);
el('new-chat').addEventListener('click',startNewConversation);
el('new-folder').addEventListener('click',()=>{
 if(busy)return;const name=window.prompt?.('New folder name');if(name){
  if(!createFolder(name))state('Could not create folder');else renderConversationList();
 }
});
el('move-chat-cancel').addEventListener('click',()=>el('move-chat-dialog').close());
el('move-chat-form').addEventListener('submit',event=>{
 event.preventDefault();
 if(pendingMoveId&&moveChatToFolder(pendingMoveId,el('move-folder-select').value||null))renderConversationList();
 pendingMoveId=null;el('move-chat-dialog').close();
});
el('conversation-search').addEventListener('input',renderConversationList);
window.addEventListener?.('resize',()=>setSidebar(!mobile()&&!workspace.classList.contains('sidebar-collapsed')));
setSidebar(!mobile());

function state(message){status.textContent=message;}
function refreshLearning(){
 const n=stats();
 el('learning-info').textContent='🧠 '+n.chats+' conversations · '+n.memory+' saved memories · '+n.turns+' learned turns · '+n.weights+' topic features. Base training: '+trainingStats.examples+' phrases.';
 el('model-status').textContent='🧠 '+trainingStats.examples.toLocaleString('en-US')+' training phrases · '+topicCount+' topics';
 renderConversationList();
 if(activePanel==='inspector')renderInspector();
}
function languageKey(ctx){return ctx.mixed?ctx.languages.slice().sort().join('+'):ctx.primary;}
function localAnswer(value,ctx){
 const remembered=answerMemory(value,ctx.primary);
 if(remembered)return {text:remembered,mode:'memory',confidence:null,trigger:'Memory lookup'};
 const thought=reason(value,ctx.primary);
 if(thought)return {text:thought.text,mode:'reasoning',confidence:null,trigger:'Rule: '+(thought.kind||'symbolic reasoning')};
 const matches=detectTopicMatches(value,ctx.primary),direct=matches.map(x=>x.id);
 const trigger=matches.length?matches.slice(0,4).map(m=>m.term).join(', '):'';
 const decision=inferDefault(value,ctx.primary);
 if(direct.length===1&&direct[0]>=100&&(decision.id!=='topic:'+direct[0]||decision.percent<Number(threshold.value))){
  const answer=respondDefault({id:'topic:'+direct[0],percent:80,lang:ctx.primary},ctx.primary);
  if(answer)return {text:answer,mode:'reference',confidence:null,trigger:trigger||'Technical reference'};
 }
 if(direct.length<=1&&decision.percent>=Number(threshold.value)){
  const reply=respondDefault(decision,ctx.primary);
  if(reply)return {text:reply,mode:'trained',confidence:decision.percent,intent:decision.id};
 }
 const recallText=recall(value,languageKey(ctx));
 if(recallText)return {text:recallText,mode:'recall',confidence:null,trigger:'Remembered example'};
 const guess=direct.length?[]:predictTopics(value);
 return {text:fallback(value,guess,ctx),mode:'fallback',confidence:null,
  trigger:trigger||(guess.length?'Learned topic associations':'No matching keyword · default response')};
}
function showResult(result,ctx){
 bubble('assistant',result.text,result);
 messages.push({role:'assistant',content:result.text});
 el('confidence-display').textContent=result.mode==='trained'?'Match: '+result.confidence+'% (estimated)':result.mode==='memory'?'Memory used':result.mode==='api'?'External API':result.mode==='reasoning'?'Verified reasoning':result.mode==='reference'?'Reference answer':'Low match';
 state(result.mode==='trained'?'🧠 Local model · '+result.confidence+'% approx.':result.mode==='memory'?'🗂️ Local memory':result.mode==='api'?'🌐 '+LANG_NAMES[ctx.primary]:result.mode==='reasoning'?'🧮 Local reasoning':result.mode==='reference'?'📚 Technical reference':localText[ctx.primary].status);
}
const safeText=(s)=>String(s||'').toLowerCase();
function inspectorRow(container,title,detail,subtitle='',type='memory'){
 const item=element('div',type==='weight'?'weight-card':'memory-card');
 const heading=element('strong','',title),body=element('span','',detail);
 item.append(heading,body);
 if(subtitle)item.append(element('small','',subtitle));
 container.append(item);return item;
}
function renderInspector(){
 const container=el('inspector-content'),summary=el('inspector-summary'),q=safeText(el('inspector-search').value).trim();
 container.replaceChildren();
 if(inspectorTab==='memory'){
   const data=inspectMemory();
   const facts=data.facts.filter(x=>safeText(x.label+' '+x.key+' '+x.value).includes(q));
   const history=data.history.filter(x=>safeText(x.role+' '+x.text).includes(q));
   summary.textContent=data.facts.length+' memories · '+data.chats+' conversations · '+Math.floor(getHistory().length/2)+' exchanges in this chat';
   container.append(element('div','inspector-section-title','Saved across all conversations'));
   if(!facts.length)container.append(element('div','empty-state',q?'No memories match your search.':'No saved facts yet. Add one above or tell OtaAI something to remember.'));
   for(const fact of facts){
    const card=element('div','memory-card'),heading=element('div','fact-head');
    const remove=element('button','fact-delete','✕');
    remove.type='button';remove.title='Forget memory';remove.setAttribute('aria-label','Forget '+fact.label);
    remove.addEventListener('click',()=>{
      if(window.confirm&&!window.confirm('Forget "'+fact.label+'"?'))return;
      if(deleteMemoryFact(fact.key)){refreshLearning();state('Memory removed');}
    });
    heading.append(element('strong','',fact.label),remove);
    card.append(heading,element('span','',fact.value),element('small','','Stored locally'));
    container.append(card);
   }
   container.append(element('div','inspector-section-title','Recent messages in this conversation'));
   if(!history.length)container.append(element('div','empty-state',q?'No messages match.':'This conversation has no saved messages yet.'));
   for(const h of history)inspectorRow(container,h.role==='user'?'You':'OtaAI',h.text,h.lang||'','memory');
 }else{
   const learned=inspectWeights(q,70),base=defaultWeightView(q,70);
   summary.textContent=learned.total+' asociaciones temáticas coincidentes · '+trainingStats.weights+' conexiones entrenadas de base';
   container.append(element('div','inspector-section-title','🧬 Pesos temáticos (base + aprendizaje)'));
   if(!learned.items.length)container.append(element('div','empty-state','No hay pesos temáticos con esa búsqueda.'));
   for(const w of learned.items){
     const card=inspectorRow(container,w.name,w.feature,'Tema '+w.topic+' · peso '+w.weight.toFixed(2),'weight');
     const meter=element('div','weight-meter');
     const fill=element('span');
     fill.style.width=Math.max(1,Math.min(100,w.weight/60*100))+'%';
     meter.append(fill);card.append(meter);
   }
   container.append(element('div','inspector-section-title','🧠 Pesos del modelo de respuestas (entrenamiento base)'));
   if(!base.length)container.append(element('div','empty-state','No hay pesos del modelo con esa búsqueda.'));
   for(const w of base)inspectorRow(container,w.intent,w.feature,'Peso agregado '+w.weight,'weight');
 }
}
function setInspectorTab(next){
 inspectorTab=next;
 el('memory-form').hidden=next!=='memory';
 for(const tab of ['memory','weights']){
  const active=next===tab,button=el('tab-'+tab);
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 }
 el('inspector-search').value='';
 renderInspector();
}
el('inspector-toggle').addEventListener('click',()=>setPanel('inspector'));
el('inspector-close').addEventListener('click',()=>setPanel(null));
el('tab-memory').addEventListener('click',()=>setInspectorTab('memory'));
el('tab-weights').addEventListener('click',()=>setInspectorTab('weights'));
el('inspector-search').addEventListener('input',renderInspector);
el('memory-form').addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;await ready();
 if(saveMemoryFact(el('memory-key').value,el('memory-value').value)){
  el('memory-key').value='';el('memory-value').value='';
  refreshLearning();state('Memory saved locally');
 }
});
el('settings-toggle').addEventListener('click',()=>setPanel('settings'));
el('appearance-toggle').addEventListener('click',()=>setPanel('appearance'));
el('google-toggle').addEventListener('click',()=>setPanel('google'));
document.querySelectorAll('[data-close-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(null)));

el('forget-memory').addEventListener('click',async()=>{
 if(busy)return;
 if(typeof window.confirm==='function'&&!window.confirm('Clear all saved chats, memories and learning? Built-in knowledge will remain.'))return;
 await forgetMemory();renderActiveChat();refreshLearning();state('Memory and learning cleared');
});
el('download-weights').addEventListener('click',()=>{void exportWeights();});
el('upload-weights').addEventListener('click',()=>el('weights-file').click());
el('weights-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{await ready();await importWeights(file);renderActiveChat();refreshLearning();state('Saved data imported');}
 catch{state('⚠️ Archivo de pesos no válido');}
 e.target.value='';
});
provider.addEventListener('change',()=>model.value=defaults[provider.value]);
el('show-key').addEventListener('click',()=>{
 key.type=key.type==='password'?'text':'password';
 el('show-key').textContent=key.type==='password'?'Show key':'Hide key';
});
key.addEventListener('input',()=>el('key-info').textContent=key.value.trim()?'Key ready: external AI available':'No key: local model');

void ready().then(()=>{renderActiveChat();refreshLearning();updateComposer();state('OtaAI ready');})
 .catch(()=>state('Could not load local memory'));

async function ask(history,secret,ctx){
 const languages=ctx.languages.map(l=>LANG_NAMES[l]).join(' + ');
 const languageDirective=ctx.mixed?
  ('El usuario mezcla '+languages+'. Conserva la mezcla naturalmente.'):
  ('Responde en '+LANG_NAMES[ctx.primary]+'. Mantén ese idioma.');
 const facts=memoryContext();
 const systemPrompt=PERSONA+'\n'+languageDirective+(facts?'\nMemoria local compartida por el usuario:\n'+facts:'');
 const c=new AbortController(),timeout=setTimeout(()=>c.abort(),30000);
 try{
  const p=provider.value,headers={'Content-Type':'application/json'};
  let url,body;
  if(p==='gemini'){
   url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model.value.trim()||defaults.gemini)+':generateContent';
   headers['x-goog-api-key']=secret;
   body={systemInstruction:{parts:[{text:systemPrompt}]},contents:history.slice(-12).map(m=>({role:m.role==='user'?'user':'model',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:450}};
  }else{
   url=p==='openai'?'https://api.openai.com/v1/chat/completions':'https://openrouter.ai/api/v1/chat/completions';
   headers.Authorization='Bearer '+secret;
   body={model:model.value.trim()||defaults[p],messages:[{role:'system',content:systemPrompt},...history.slice(-12)],max_tokens:450};
  }
  const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:c.signal,cache:'no-store'});
  if(!response.ok)throw new Error('El proveedor no respondió');
  const data=await response.json();
  const answer=p==='gemini'?(data.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join(''):data.choices?.[0]?.message?.content;
  if(typeof answer!=='string'||!answer.trim())throw new Error('Respuesta vacía');
  return answer.trim();
 }finally{clearTimeout(timeout);}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 const value=composer.value().trim();if(!value)return;
 busy=true;el('send').disabled=true;composer.disable(true);composer.clear();updateComposer();
 el('typing-status').textContent='OtaAI is responding…';
 const ctx=detectLanguage(value,'en');lastLanguage=ctx.primary;
 
 document.documentElement.lang=lastLanguage;
 bubble('user',value);messages.push({role:'user',content:value});
 try{
  await ready();
  let result,source='local';
  if(!key.value.trim())result=localAnswer(value,ctx);
  else{
   state('🌐 Consultando modelo externo...');
   try{result={text:await ask(messages,key.value.trim(),ctx),mode:'api',confidence:null,model:model.value.trim()||defaults[provider.value],provider:provider.value};source='api';}
   catch{result=localAnswer(value,ctx);state('⚠️ API no disponible: respuesta local');}
  }
  showResult(result,ctx);
  const topics=detectTopics(value,ctx.primary);
  learn(value,result.text,topics.length?topics:predictTopics(value),source,languageKey(ctx),result);
  if(driveConnected())el('cloud-mini-status').textContent='● Unsaved local changes';
  el('chat-title').value=getActiveChat().title;
  refreshLearning();
 }catch(error){
  console.error(error);
  bubble('assistant','A local error occurred. Please try sending that message again.');
  state('OtaAI error');
 }finally{
  busy=false;el('send').disabled=false;composer.disable(false);input.focus();
  el('typing-status').textContent='Enter: new line · Ctrl+Enter: send';updateComposer();
 }
});
