// OtaAI's response policy. Generators ALWAYS precede canned/reference/classifier fallbacks.
// A successful generative answer never gets replaced by a topic classification.
// Passed callbacks can use local browser models or optional external APIs.
const usable=result=>result&&typeof result.text==='string'&&result.text.trim().length>0;
export async function routeResponse({apiKey='',external,local,fallback,onExternalStart,onLocalStart}){
 const failures=[];
 if(String(apiKey||'').trim()&&typeof external==='function'){
  try{
   onExternalStart?.();
   const result=await external();
   if(result?.cancelled)return {cancelled:true};
   if(usable(result))return {result,source:'api',engine:'external',failures};
   failures.push('External model gave no text');
  }catch(error){
   failures.push('External model: '+String(error?.message||error||'unavailable').slice(0,95));
  }
 }
 // Local generator is next even if external AI failed.
 if(typeof local==='function'){
  try{
   onLocalStart?.();
   const result=await local();
   if(result?.cancelled)return {cancelled:true};
   if(usable(result))return {result,source:'local',engine:'generative',failures};
   failures.push('Local generator gave no text');
  }catch(error){
   failures.push('Local generator: '+String(error?.message||error||'unavailable').slice(0,95));
  }
 }
 // Only here may deterministic rules, memory references, topic matching or the
 // legacy classifier choose a response.
 let result;
 try{result=await fallback();}catch(error){
  failures.push('Fallback: '+String(error?.message||error||'unavailable').slice(0,95));
 }
 if(!usable(result)){
  result={text:'No pude generar una respuesta y el sistema automático tampoco pudo ayudar esta vez.',
   mode:'fallback',trigger:'All response routes unavailable'};
 }
 result={...result,trigger:'Automatic fallback · '+(failures.join('; ')||'No generative answer')+
  (result.trigger?' · '+result.trigger:'')};
 return {result,source:'local',engine:'fallback',failures};
}
