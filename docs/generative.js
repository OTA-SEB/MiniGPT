// Generative model bridge. No topic matching: returns newly generated text or failure.
// Starts only on an explicit user action (a chat message or the Download button).
export const GENERATIVE_MODELS={
 auto:'Auto (multilingual Qwen on capable GPU/CPU; SmolLM2 on weak devices)',
 qwen:'Qwen2.5 0.5B Instruct (WebGPU or CPU; larger download)',
 smol:'SmolLM2 135M Instruct (lighter, WebAssembly CPU)'
};
let selected='auto',worker=null,requestId=0,active=null;
let status={phase:'idle',detail:'Ready to download a generative model on first use',percent:null,model:''};
const watchers=new Set();
try{const saved=localStorage.getItem('otaai.generator.model');if(GENERATIVE_MODELS[saved])selected=saved;}catch{}
function notify(){for(const cb of watchers)try{cb(generativeStatus());}catch{}}
function setStatus(data){status={...status,...data};notify();}
export const generativeModel=()=>selected;
export function chooseGenerativeModel(value){
 if(!GENERATIVE_MODELS[value])return false;
 if(selected!==value){
  selected=value;
  try{localStorage.setItem('otaai.generator.model',selected);}catch{}
  // A loaded worker may cache a prior model; it switches on next generation.
 }
 notify();return true;
}
export const generativeStatus=()=>({...status,active:!!active,selected});
export function watchGenerative(callback){watchers.add(callback);callback(generativeStatus());return ()=>watchers.delete(callback);}
function ensureWorker(){
 if(worker)return worker;
 if(typeof Worker==='undefined')throw Error('This browser does not support local model workers');
 worker=new Worker('./generative-worker.js?v=1.6',{type:'module'});
 worker.addEventListener('message',event=>{
  const d=event.data||{};
  if(d.type==='progress'){
   setStatus({phase:d.phase||'loading',detail:d.detail||'',percent:d.percent??null,model:d.model||status.model});
   return;
  }
  if(!active||d.requestId!==active.id)return;
  if(d.type==='token'){if(typeof active.onToken==='function')active.onToken(String(d.text||''));return;}
  if(d.type==='result'){
   const pending=active;active=null;
   setStatus({phase:'ready',detail:'Generative AI ready · '+(d.model||''),percent:100,model:d.model||''});
   pending.resolve({text:d.text,model:d.model,device:d.device});
  }
  if(d.type==='error'){
   const pending=active;active=null;
   setStatus({phase:'error',detail:'Generation unavailable: '+String(d.error||'Unknown error'),percent:null});
   pending.reject(Error(String(d.error||'Unknown error')));
  }
 });
 worker.addEventListener('error',e=>{
  const pending=active;active=null;worker?.terminate();worker=null;
  setStatus({phase:'error',detail:'The local model worker could not start',percent:null});
  pending?.reject(Error('Local model worker failed'));
 });
 return worker;
}
export function generateLocally(history,language,memory,{onToken}={}){
 if(active)return Promise.reject(Error('A response is already generating'));
 const id=++requestId;
 let instance;
 try{instance=ensureWorker();}catch(e){setStatus({phase:'unsupported',detail:e.message});return Promise.reject(e);}
 setStatus({phase:'loading',detail:'Starting the generative model (first use downloads model weights)…',percent:null});
 return new Promise((resolve,reject)=>{
  active={id,resolve,reject,onToken};
  try{instance.postMessage({type:'generate',requestId:id,model:selected,language,
   history:Array.isArray(history)?history.slice(-10):[],memory:String(memory||'').slice(0,1000)});
  }catch(e){active=null;setStatus({phase:'error',detail:String(e.message)});reject(e);}
 });
}
export function cancelGeneration(){
 if(!active)return false;
 const pending=active;active=null;
 worker?.terminate();worker=null;
 setStatus({phase:'idle',detail:'Local generation stopped by user',percent:null});
 pending.resolve({cancelled:true});
 return true;
}
export function resetGenerativeWorker(){
 if(active)cancelGeneration();
 worker?.terminate();worker=null;
 setStatus({phase:'idle',detail:'The generative model can be loaded on your next message',percent:null});
}
