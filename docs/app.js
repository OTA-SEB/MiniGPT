import { fallback,detectTopics,topicCount } from './fallback.js?v=1.4';
import { ready,learn,predictTopics,recall,stats,exportWeights,importWeights } from './learning.js?v=1.4';
import { PERSONA } from './personality.js';
import { detectLanguage,localText,LANG_NAMES } from './i18n.js?v=1.4';
const el=id=>document.getElementById(id);
const chat=el('chat'),form=el('form'),input=el('message'),provider=el('provider'),model=el('model'),key=el('api-key'),status=el('status');
const defaults={openrouter:'openrouter/free',openai:'gpt-4o-mini',gemini:'gemini-2.5-flash'};
const messages=[];let busy=false,lastLanguage='es';
function bubble(role,text){const article=document.createElement('article');article.className='bubble '+(role==='user'?'user':'bot');article.textContent=text;chat.append(article);chat.scrollTop=chat.scrollHeight;}
function state(s){status.textContent=s;}
const refreshLearning=()=>{
 const n=stats();
 el('learning-info').textContent='🧠 '+n.turns+' turnos aprendidos · '+n.weights+' pesos locales · '+n.examples+' ejemplos. Los datos quedan en este navegador.';
};
el('footer').textContent=topicCount+' temas · ES / EN / PT / 日本語 · aprendizaje local';
void ready().then(refreshLearning);
el('download-weights').addEventListener('click',()=>{void exportWeights();});
el('upload-weights').addEventListener('click',()=>el('weights-file').click());
el('weights-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{await ready();await importWeights(file);refreshLearning();state('✅ Pesos importados');}
 catch{state('⚠️ No pude importar esos pesos');}
 e.target.value='';
});
function languageKey(ctx){return ctx.mixed?ctx.languages.slice().sort().join('+'):ctx.primary;}
function localAnswer(value,ctx){
 const direct=detectTopics(value,ctx.primary);
 const recalled=recall(value,languageKey(ctx));
 if(recalled)return recalled;
 const guess=direct.length?[]:predictTopics(value);
 return fallback(value,guess,ctx);
}
provider.addEventListener('change',()=>model.value=defaults[provider.value]);
el('settings-toggle').addEventListener('click',()=>{const box=el('settings');box.hidden=!box.hidden;el('settings-toggle').setAttribute('aria-expanded',String(!box.hidden));});
el('show-key').addEventListener('click',()=>{key.type=key.type==='password'?'text':'password';el('show-key').textContent=key.type==='password'?'Mostrar clave':'Ocultar clave';});
key.addEventListener('input',()=>el('key-info').textContent=key.value.trim()?'Clave cargada: IA disponible':'Sin clave: modo automático');
el('clear').addEventListener('click',()=>{if(busy)return;messages.length=0;chat.replaceChildren();bubble('assistant',localText[lastLanguage].reset);state(key.value.trim()?'🧠 Cerebro listo':'⚙️ Modo automático');});
document.querySelectorAll('[data-try]').forEach(btn=>btn.addEventListener('click',()=>{if(busy)return;input.value=btn.dataset.try;form.requestSubmit();}));
async function ask(history,secret,ctx){
 const languages=ctx.languages.map(l=>LANG_NAMES[l]).join(' + ');
 const langDirective=ctx.mixed?('El usuario mezcla '+languages+'. Respóndele naturalmente mezclando esos mismos idiomas según el contexto de sus temas. No traduzcas todo al español.'):('Responde en '+LANG_NAMES[ctx.primary]+'. Mantén ese idioma incluso si habla de títulos de juegos extranjeros.');
 const systemPrompt=PERSONA+'\n'+langDirective;
 const c=new AbortController();const timeout=setTimeout(()=>c.abort(),30000);
 try{
  const p=provider.value;let url,body;
  const headers={'Content-Type':'application/json'};
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
 const ctx=detectLanguage(value,lastLanguage);lastLanguage=ctx.primary;
 input.placeholder=localText[lastLanguage].placeholder;
 document.documentElement.lang=lastLanguage;
 busy=true;el('send').disabled=true;input.disabled=true;input.value='';
 bubble('user',value);messages.push({role:'user',content:value});
 await ready();
 const secret=key.value.trim();let reply,source='local';
 if(!secret){state(localText[ctx.primary].status+(ctx.mixed?' 🌐':''));reply=localAnswer(value,ctx);}
 else{state('🧠 Pensando...');
  try{reply=await ask(messages,secret,ctx);source='api';state('🧠 '+LANG_NAMES[ctx.primary]+(ctx.mixed?' 🌐':''));}
  catch{reply=localAnswer(value,ctx);state(localText[ctx.primary].status+' · API no disponible');}
 }
 bubble('assistant',reply);messages.push({role:'assistant',content:reply});
 const topics=detectTopics(value,ctx.primary);
 learn(value,reply,topics.length?topics:predictTopics(value),source,languageKey(ctx));
 refreshLearning();
 busy=false;el('send').disabled=false;input.disabled=false;input.focus();
});