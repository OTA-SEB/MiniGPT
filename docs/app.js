import { fallback,detectTopics,topicCount } from './fallback.js?v=2.1';
import { ready,learn,predictTopics,recall,stats,exportWeights,importWeights,getHistory,clearChat,answerMemory,memoryContext,forgetMemory,inspectMemory,inspectWeights } from './learning.js?v=2.1';
import { inferDefault,respondDefault,trainingStats,defaultWeightView } from './default-model.js?v=2.1';
import { PERSONA } from './personality.js';
import { detectLanguage,localText,LANG_NAMES } from './i18n.js?v=2.1';

const el=id=>document.getElementById(id);
const chat=el('chat'),form=el('form'),input=el('message'),provider=el('provider'),model=el('model'),key=el('api-key'),status=el('status');
const defaults={openrouter:'openrouter/free',openai:'gpt-4o-mini',gemini:'gemini-2.5-flash'};
const messages=[];let busy=false,lastLanguage='es',inspectorTab='memory';
const threshold=el('confidence-threshold');
try{const saved=localStorage.getItem('minigpt.threshold');if(['80','90','95'].includes(saved))threshold.value=saved;}catch{}
threshold.addEventListener('change',()=>{
 try{localStorage.setItem('minigpt.threshold',threshold.value);}catch{}
 el('confidence-display').textContent='Umbral: '+threshold.value+' %';
});
function element(tag,cls='',content=''){
 const item=document.createElement(tag);
 if(cls)item.className=cls;
 if(content!==undefined)item.textContent=String(content);
 return item;
}
function bubble(role,text,meta=''){
 const item=element('article','bubble '+(role==='user'?'user':'bot'));
 item.append(element('div','bubble-text',text));
 if(role!=='user'&&meta)item.append(element('div','response-meta',meta));
 chat.append(item);
 chat.scrollTop=chat.scrollHeight;
}
function state(message){status.textContent=message;}
function refreshLearning(){
 const n=stats();
 el('learning-info').textContent='🧠 '+n.turns+' turnos propios · '+n.weights+' características temáticas · '+n.examples+' ejemplos · '+n.memory+' recuerdos. Entrenamiento base: '+trainingStats.examples+' frases / '+trainingStats.weights+' conexiones.';
 el('model-status').textContent='🧠 '+trainingStats.examples.toLocaleString('es-CO')+' frases entrenadas · '+topicCount+' temas';
 if(!el('inspector').hidden)renderInspector();
}
function languageKey(ctx){return ctx.mixed?ctx.languages.slice().sort().join('+'):ctx.primary;}
function localAnswer(value,ctx){
 const remembered=answerMemory(value,ctx.primary);
 if(remembered)return {text:remembered,mode:'memory',confidence:100};
 const direct=detectTopics(value,ctx.primary);
 const decision=inferDefault(value,ctx.primary);
 // Si el usuario mezcla varios temas, respetar la composición de 2 a 5 temas.
 if(direct.length<=1 && decision.percent>=Number(threshold.value)){
   const reply=respondDefault(decision,ctx.primary);
   if(reply)return {text:reply,mode:'trained',confidence:decision.percent,intent:decision.id};
 }
 const recallText=recall(value,languageKey(ctx));
 if(recallText)return {text:recallText,mode:'recall',confidence:decision.percent};
 const guess=direct.length?[]:predictTopics(value);
 return {text:fallback(value,guess,ctx),mode:'fallback',confidence:decision.percent};
}
function resultMeta(result){
 if(result.mode==='trained')return '🧠 Modelo entrenado · '+result.confidence+' % coincidencia estimada';
 if(result.mode==='memory')return '🗂️ Respuesta desde la memoria';
 if(result.mode==='recall')return '💾 Ejemplo recordado';
 if(result.mode==='api')return '🌐 Modelo externo';
 return '🧩 Respuesta temática automática';
}
function showResult(result,ctx){
 bubble('assistant',result.text,resultMeta(result));
 messages.push({role:'assistant',content:result.text});
 el('confidence-display').textContent=result.mode==='trained'?'Coincidencia: '+result.confidence+' %*':result.mode==='memory'?'Memoria utilizada':result.mode==='api'?'API externa':'Coincidencia insuficiente';
 state(result.mode==='trained'?'🧠 Modelo local · '+result.confidence+' %*':result.mode==='memory'?'🗂️ Memoria local':result.mode==='api'?'🌐 '+LANG_NAMES[ctx.primary]:localText[ctx.primary].status);
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
   const facts=data.facts.filter(x=>safeText(x.key+' '+x.value).includes(q));
   const history=data.history.filter(x=>safeText(x.role+' '+x.text).includes(q));
   summary.textContent=data.facts.length+' recuerdos guardados · '+Math.floor(getHistory().length/2)+' intercambios recientes';
   container.append(element('div','inspector-section-title','🗂️ Datos recordados'));
   if(!facts.length)container.append(element('div','empty-state',q?'Sin coincidencias.':'Todavía no hay datos recordados. Prueba «me gusta el anime».'));
   for(const fact of facts)inspectorRow(container,fact.key,fact.value,'Guardado en este navegador');
   container.append(element('div','inspector-section-title','💬 Conversación reciente'));
   if(!history.length)container.append(element('div','empty-state',q?'Ningún mensaje coincide.':'Aún no hay mensajes guardados.'));
   for(const h of history)inspectorRow(container,h.role==='user'?'Tú':'MiniGPT',h.text,h.lang||'', 'memory');
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
 for(const tab of ['memory','weights']){
  const active=next===tab,button=el('tab-'+tab);
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 }
 el('inspector-search').value='';
 renderInspector();
}
function toggleInspector(open){
 el('inspector').hidden=!open;
 el('inspector-toggle').setAttribute('aria-expanded',String(open));
 if(open)renderInspector();
}
el('inspector-toggle').addEventListener('click',()=>toggleInspector(el('inspector').hidden));
el('inspector-close').addEventListener('click',()=>toggleInspector(false));
el('tab-memory').addEventListener('click',()=>setInspectorTab('memory'));
el('tab-weights').addEventListener('click',()=>setInspectorTab('weights'));
el('inspector-search').addEventListener('input',renderInspector);
el('settings-toggle').addEventListener('click',()=>{
 const box=el('settings');box.hidden=!box.hidden;
 el('settings-toggle').setAttribute('aria-expanded',String(!box.hidden));
});
el('clear').addEventListener('click',()=>{
 if(busy)return;
 messages.length=0;clearChat();chat.replaceChildren();
 bubble('assistant',localText[lastLanguage].reset);
 state('🧠 Nueva conversación');refreshLearning();
});
el('forget-memory').addEventListener('click',async()=>{
 if(busy)return;
 if(typeof window.confirm==='function'&&!window.confirm('¿Borrar recuerdos, conversaciones y pesos aprendidos? Se conservarán los pesos predeterminados.'))return;
 await forgetMemory();messages.length=0;chat.replaceChildren();
 bubble('assistant','🧠 Memoria borrada. Los pesos entrenados predeterminados siguen disponibles.');
 refreshLearning();state('✅ Memoria borrada');
});
el('download-weights').addEventListener('click',()=>{void exportWeights();});
el('upload-weights').addEventListener('click',()=>el('weights-file').click());
el('weights-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{await ready();await importWeights(file);refreshLearning();state('✅ Pesos importados');}
 catch{state('⚠️ Archivo de pesos no válido');}
 e.target.value='';
});
provider.addEventListener('change',()=>model.value=defaults[provider.value]);
el('show-key').addEventListener('click',()=>{
 key.type=key.type==='password'?'text':'password';
 el('show-key').textContent=key.type==='password'?'Mostrar clave':'Ocultar clave';
});
key.addEventListener('input',()=>el('key-info').textContent=key.value.trim()?'Clave cargada: modelo externo disponible':'Sin clave: cerebro local');
document.querySelectorAll('[data-try]').forEach(button=>button.addEventListener('click',()=>{
 if(busy)return;input.value=button.dataset.try;form.requestSubmit();
}));
void ready().then(()=>{
 const history=getHistory();
 if(history.length){
  chat.replaceChildren();
  for(const msg of history){bubble(msg.role,msg.content);messages.push({role:msg.role,content:msg.content});}
  const last=[...history].reverse().find(x=>x.role==='user');
  if(last)lastLanguage=detectLanguage(last.content,'es').primary;
 }
 refreshLearning();state('🧠 Modelo local disponible');
}).catch(()=>state('⚠️ Hubo un error al cargar el modelo local'));

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
 const value=input.value.trim();if(!value)return;
 busy=true;el('send').disabled=true;input.disabled=true;input.value='';
 const ctx=detectLanguage(value,lastLanguage);lastLanguage=ctx.primary;
 input.placeholder=localText[lastLanguage].placeholder;
 document.documentElement.lang=lastLanguage;
 bubble('user',value);messages.push({role:'user',content:value});
 try{
  await ready();
  let result,source='local';
  if(!key.value.trim())result=localAnswer(value,ctx);
  else{
   state('🌐 Consultando modelo externo...');
   try{result={text:await ask(messages,key.value.trim(),ctx),mode:'api',confidence:null};source='api';}
   catch{result=localAnswer(value,ctx);state('⚠️ API no disponible: respuesta local');}
  }
  showResult(result,ctx);
  const topics=detectTopics(value,ctx.primary);
  learn(value,result.text,topics.length?topics:predictTopics(value),source,languageKey(ctx));
  refreshLearning();
 }catch(error){
  console.error(error);
  bubble('assistant','Hubo un error local. Intenta enviar el mensaje otra vez. 🤖');
  state('⚠️ Error de MiniGPT');
 }finally{
  busy=false;el('send').disabled=false;input.disabled=false;input.focus();
 }
});
