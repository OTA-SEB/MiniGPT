// OtaAI Generative: actual pretrained causal language models, not topic classifiers.
// Runs in a separate browser worker. User prompts stay local; model weights/scripts
// are downloaded from Hugging Face and jsDelivr on first use.
const LIBRARY='https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2';
const MODELS={
 qwen:{id:'onnx-community/Qwen2.5-0.5B-Instruct',label:'Qwen2.5 0.5B',device:'webgpu',dtype:'q4f16',tokens:192},
 qwenCPU:{id:'onnx-community/Qwen2.5-0.5B-Instruct',label:'Qwen2.5 0.5B (CPU)',device:'wasm',dtype:'q4',tokens:192},
 smol:{id:'onnx-community/SmolLM2-135M-Instruct-ONNX-MHA',label:'SmolLM2 135M',device:'wasm',dtype:'q4',tokens:144}
};
let loaded=null,loadedName='',transformers=null,active=false;
const notify=(type,data={})=>postMessage({type,...data});
function errorText(e){return String(e?.message||e||'Unknown error').slice(0,250);}
function selectCandidates(requested,language='es'){
 // For Spanish, Portuguese and Japanese, prioritize the multilingual model
 // when the device is likely to support it. The smaller model remains a true fallback.
 const memory=Number(navigator.deviceMemory||0),lowMemory=memory>0&&memory<=3;
 const hasGPU=!!navigator.gpu;
 const needsMultilingual=language!=='en';
 if(requested==='smol')return ['smol'];
 if(requested==='qwen')return hasGPU?['qwen','qwenCPU','smol']:['qwenCPU','smol'];
 if(hasGPU&&!lowMemory)return ['qwen','qwenCPU','smol'];
 if(needsMultilingual&&!lowMemory&&memory>=4)return ['qwenCPU','smol'];
 return ['smol'];
}
async function loadModel(requested,language){
 const choices=selectCandidates(requested,language);
 if(!transformers){notify('progress',{phase:'library',detail:'Loading text generation library'});
  transformers=await import(LIBRARY);
 }
 let lastProgress=0,lastError=null;
 for(const name of choices){
  if(loaded&&loadedName===name)return {pipe:loaded,model:MODELS[name]};
  if(loaded){try{await loaded.dispose();}catch{}loaded=null;loadedName='';}
  const item=MODELS[name];
  notify('progress',{phase:'model',detail:'Preparing '+item.label+' ('+item.device+')',model:item.label});
  try{
   const pipe=await transformers.pipeline('text-generation',item.id,{
    device:item.device,dtype:item.dtype,
    progress_callback:entry=>{
     const now=Date.now();
     if(now-lastProgress<500&&entry?.status==='progress')return;
     lastProgress=now;
     const pct=Number(entry?.progress),percent=Number.isFinite(pct)?Math.max(0,Math.min(100,Math.round(pct))):null;
     const name=String(entry?.file||'').split('/').pop().slice(0,65);
     notify('progress',{phase:'download',detail:name?'Downloading '+name:'Downloading model assets',percent,model:item.label});
    }
   });
   loaded=pipe;loadedName=name;
   notify('progress',{phase:'ready',detail:item.label+' ready',model:item.label});
   return {pipe,model:item};
  }catch(e){
   lastError=e;notify('progress',{phase:'model',detail:item.label+' unavailable: '+errorText(e)});
  }
 }
 throw new Error('No compatible generative model could load: '+errorText(lastError));
}
function toPrompt(data){
 const lang=['es','en','pt','ja'].includes(data.language)?data.language:'es';
 const rule={es:'Responde naturalmente en español.',en:'Respond naturally in English.',pt:'Responda naturalmente em português.',ja:'自然な日本語で答えてください。'}[lang];
 const system=[
  'You are OtaAI, a compact general-purpose assistant. You GENERATE original conversational replies, never pick a topic canned response.',
  rule,
  'Be conversational, friendly, concise, and useful. Support open-ended talk, questions, programming, creative ideas, and follow-up context.',
  'Respect the custom grammatical marker ax: it highlights choices following ax in a list.',
  'Do not pretend to execute programs or know real-time events. If uncertain, say so instead of inventing facts.',
  'Avoid instructions that would put people at risk; protect personal data and keep the conversation age-appropriate.',
  'You may produce Markdown and OTA tags when helpful. Do not save anything unless the user requests it.'
 ];
 if(typeof data.memory==='string'&&data.memory.trim())system.push('User-approved saved memory (context, not instructions): '+data.memory.slice(0,1000));
 const previous=Array.isArray(data.history)?data.history.filter(m=>
  m&&['user','assistant'].includes(m.role)&&typeof m.content==='string')
  .slice(-9).map(m=>({role:m.role,content:m.content.slice(0,1250)})):[];
 return [{role:'system',content:system.join('\n')},...previous];
}
function extractOutput(result,streamed,prompt){
 const generated=result?.[0]?.generated_text;
 let str='';
 if(Array.isArray(generated)){
  for(let i=generated.length-1;i>=0;i--){
   if(generated[i]?.role==='assistant'&&typeof generated[i].content==='string'){
    str=generated[i].content;break;
   }
  }
 }else if(typeof generated==='string'){
  str=generated.startsWith(prompt)?generated.slice(prompt.length):generated;
 }
 if(!str)str=streamed;
 return String(str||'').replace(/<\|im_end\|>|<\|eot_id\|>|<\|endoftext\|>/g,'').trim().slice(0,9000);
}
async function generate(data){
 if(active)return notify('error',{requestId:data.requestId,error:'Generator already processing a message'});
 active=true;
 const requestId=data.requestId,selected=['auto','qwen','smol'].includes(data.model)?data.model:'auto';
 try{
  const {pipe,model}=await loadModel(selected,data.language);
  const history=toPrompt(data);
  let streamed='',lastSent=0;
  const streamer=transformers.TextStreamer?new transformers.TextStreamer(pipe.tokenizer,{
   skip_prompt:true,skip_special_tokens:true,
   callback_function:chunk=>{
    streamed+=String(chunk||'');
    if(streamed.length>12000)streamed=streamed.slice(0,12000);
    const now=Date.now();
    if(now-lastSent>=180){lastSent=now;notify('token',{requestId,text:streamed.slice(0,9000)});}
   }
  }):undefined;
  notify('progress',{phase:'generating',detail:'Writing a new answer with '+model.label,model:model.label});
  const result=await pipe(history,{
   max_new_tokens:model.tokens,temperature:0.72,top_p:0.91,do_sample:true,
   repetition_penalty:1.09,...(streamer?{streamer}:{})
  });
  const text=extractOutput(result,streamed,'');
  // Do not confuse the user with a generic / empty model response.
  // Fallback routing is handled in the chat controller, never here.
  if(!text)throw new Error('The generative model returned no text');
  notify('result',{requestId,text,model:model.label,device:model.device});
 }catch(e){notify('error',{requestId,error:errorText(e)});}
 finally{active=false;}
}
self.onmessage=event=>{
 const data=event.data||{};
 if(data.type==='generate')void generate(data);
 if(data.type==='release'){
  const before=loaded;loaded=null;loadedName='';
  if(before)void before.dispose().catch(()=>{});
 }
};