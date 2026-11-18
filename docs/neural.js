// Non-blocking bridge to OtaAI's local neural Worker. Never sends chat text to a server.
import {NEURAL_PARAMETER_COUNT} from './neural-core.js?v=1.3';
let worker=null,ready=false,state='off',enabled=true,report=null,requestId=0;
const listeners=new Set(),pending=new Map();
try{enabled=localStorage.getItem('otaai.neural.enabled')!=='false';}catch{}
const tell=()=>{const value=neuralStatus();for(const fn of listeners)try{fn(value);}catch{}};
function clearPending(){
 for(const item of pending.values()){clearTimeout(item.timer);item.resolve(null);}
 pending.clear();
}
function halt(){
 clearPending();worker?.terminate();worker=null;ready=false;report=null;
}
function boot(){
 if(!enabled||worker)return;
 if(typeof Worker==='undefined'){state='unsupported';tell();return;}
 try{
  worker=new Worker('./neural-worker.js?v=1.3',{type:'module'});
  state='loading';
  worker.addEventListener('message',event=>{
   const m=event.data||{};
   if(m.type==='prediction'){
    const entry=pending.get(m.requestId);if(!entry)return;
    clearTimeout(entry.timer);pending.delete(m.requestId);
    entry.resolve(m.prediction||null);
   }else if(m.type==='status'){
    state=m.state;ready=m.state==='ready';report=m;tell();
   }
  });
  worker.addEventListener('error',()=>{
   state='error';halt();tell();
  });
  worker.postMessage({type:'start'});
  tell();
 }catch{state='unsupported';halt();tell();}
}
export function setNeuralEnabled(value){
 enabled=!!value;
 try{localStorage.setItem('otaai.neural.enabled',String(enabled));}catch{}
 if(enabled)boot();else{halt();state='off';tell();}
}
export function neuralEnabled(){return enabled;}
export function neuralStatus(){return {state,ready,enabled,parameters:NEURAL_PARAMETER_COUNT,report};}
export function watchNeural(fn){
 listeners.add(fn);fn(neuralStatus());return ()=>listeners.delete(fn);
}
export function retrainNeural(){
 if(!enabled||!worker)return false;
 ready=false;state='training';worker.postMessage({type:'retrain'});tell();return true;
}
export function neuralPredict(text,lang,timeoutMs=900){
 if(!ready||!worker||!enabled||typeof text!=='string')return Promise.resolve(null);
 const id=++requestId;
 return new Promise(resolve=>{
  const timer=setTimeout(()=>{pending.delete(id);resolve(null);},Math.max(150,timeoutMs));
  pending.set(id,{resolve,timer});
  try{worker.postMessage({type:'predict',requestId:id,text:text.slice(0,1500),lang});}
  catch{clearTimeout(timer);pending.delete(id);resolve(null);}
 });
}
export function startNeural(){if(enabled)boot();}
