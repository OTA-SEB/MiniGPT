import { fallback,detectTopics,topicCount } from './fallback.js';
import { ready,learn,predictTopics,recall,stats,exportWeights,importWeights } from './learning.js';
import { PERSONA } from './personality.js';
const el=id=>document.getElementById(id);
const chat=el('chat'),form=el('form'),input=el('message'),provider=el('provider'),model=el('model'),key=el('api-key'),status=el('status');
const defaults={openrouter:'openrouter/free',openai:'gpt-4o-mini',gemini:'gemini-2.5-flash'};
const messages=[];let busy=false;
function bubble(role,text){const article=document.createElement('article');article.className='bubble '+(role==='user'?'user':'bot');article.textContent=text;chat.append(article);chat.scrollTop=chat.scrollHeight;}
function state(s){status.textContent=s;}
const refreshLearning=()=>{
 const n=stats();
 el('learning-info').textContent='🧠 '+n.turns+' turnos aprendidos · '+n.weights+' pesos locales · '+n.examples+' ejemplos. Los datos quedan en este navegador.';
};
el('footer').textContent=topicCount+' temas · cuatro respuestas por tema · aprendizaje local';
void ready().then(refreshLearning);
el('download-weights').addEventListener('click',()=>{void exportWeights();});
el('upload-weights').addEventListener('click',()=>el('weights-file').click());
el('weights-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{await ready();await importWeights(file);refreshLearning();state('✅ Pesos importados');}
 catch{state('⚠️ No pude importar esos pesos');}
 e.target.value='';
});
function localAnswer(value){
 const direct=detectTopics(value);
 const recalled=recall(value);
 if(recalled)return recalled;
 const guess=direct.length?[]:predictTopics(value);
 return fallback(value,guess);
}
provider.addEventListener('change',()=>model.value=defaults[provider.value]);
el('settings-toggle').addEventListener('click',()=>{const box=el('settings');box.hidden=!box.hidden;el('settings-toggle').setAttribute('aria-expanded',String(!box.hidden));});
el('show-key').addEventListener('click',()=>{key.type=key.type==='password'?'text':'password';el('show-key').textContent=key.type==='password'?'Mostrar clave':'Ocultar clave';});
key.addEventListener('input',()=>el('key-info').textContent=key.value.trim()?'Clave cargada: IA disponible':'Sin clave: modo automático');
el('clear').addEventListener('click',()=>{if(busy)return;messages.length=0;chat.replaceChildren();bubble('assistant','¡Charla reiniciada! 🤖');state(key.value.trim()?'🧠 Cerebro listo':'⚙️ Modo automático');});
document.querySelectorAll('[data-try]').forEach(btn=>btn.addEventListener('click',()=>{if(busy)return;input.value=btn.dataset.try;form.requestSubmit();}));
async function ask(history,secret){
 const c=new AbortController();const timeout=setTimeout(()=>c.abort(),30000);
 try{
  const p=provider.value;let url,body;
  const headers={'Content-Type':'application/json'};
  if(p==='gemini'){
   url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model.value.trim()||defaults.gemini)+':generateContent';
   headers['x-goog-api-key']=secret;
   body={systemInstruction:{parts:[{text:PERSONA}]},contents:history.slice(-12).map(m=>({role:m.role==='user'?'user':'model',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:450}};
  }else{
   url=p==='openai'?'https://api.openai.com/v1/chat/completions':'https://openrouter.ai/api/v1/chat/completions';
   headers.Authorization='Bearer '+secret;
   body={model:model.value.trim()||defaults[p],messages:[{role:'system',content:PERSONA},...history.slice(-12)],max_tokens:450};
  }
  const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:c.signal,cache:'no-store'});
  if(!response.ok)throw new Error('API failed');
  const data=await response.json();
  const answer=p==='gemini'?(data.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join(''):data.choices?.[0]?.message?.content;
  if(typeof answer!=='string'||!answer.trim())throw new Error('Empty response');
  return answer.trim();
 }finally{clearTimeout(timeout);}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 const value=input.value.trim();if(!value)return;
 busy=true;el('send').disabled=true;input.disabled=true;input.value='';
 bubble('user',value);messages.push({role:'user',content:value});
 await ready();
 const secret=key.value.trim();let reply,source='local';
 if(!secret){state('⚙️ Mini modelo local');reply=localAnswer(value);}
 else{state('🧠 Pensando...');
  try{reply=await ask(messages,secret);source='api';state('🧠 Modelo externo');}
  catch{reply=localAnswer(value);state('⚙️ API no disponible · Mini modelo local');}
 }
 bubble('assistant',reply);messages.push({role:'assistant',content:reply});
 learn(value,reply,detectTopics(value).length?detectTopics(value):predictTopics(value),source);
 refreshLearning();
 busy=false;el('send').disabled=false;input.disabled=false;input.focus();
});