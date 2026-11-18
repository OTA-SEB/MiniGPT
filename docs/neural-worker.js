// OtaAI local neural training/inference runs in a Worker to avoid freezing chat.
import { NeuralIntentNet,NEURAL_VERSION,NEURAL_PARAMETER_COUNT,labelIndex } from './neural-core.js?v=1.3';
import { neuralTrainingExamples } from './default-model.js?v=1.3';
const CACHE_NAME='otaai-neural-v1',STORE='weights',KEY='otaai-400-v1';
let net=null,ready=false,starting=false,validation=null,trainingEpochs=0;
function status(state,extra={}){
 postMessage({type:'status',state,parameters:NEURAL_PARAMETER_COUNT,trainedSteps:net?.steps||0,
  validation,epochs:trainingEpochs,...extra});
}
function dbOpen(){
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(Error('IndexedDB unavailable'));return;}
  const req=indexedDB.open(CACHE_NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
  req.onerror=()=>reject(req.error||Error('Cache unavailable'));
  req.onsuccess=()=>resolve(req.result);
 });
}
async function loadCache(){
 let db;try{
  db=await dbOpen();
  const value=await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(KEY);
   req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });
  return value;
 }catch{return null;}finally{db?.close();}
}
async function saveCache(snapshot,report){
 let db;try{
  db=await dbOpen();
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite');
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
   tx.objectStore(STORE).put({model:snapshot,report},KEY);
  });
 }catch{/* Cache optional: still usable in current session. */}finally{db?.close();}
}
function shuffle(values,seed){
 let x=seed>>>0;
 for(let i=values.length-1;i>0;i--){
  x^=x<<13;x^=x>>>17;x^=x<<5;
  const j=(x>>>0)%(i+1),t=values[i];values[i]=values[j];values[j]=t;
 }
}
const yieldToBrowser=()=>new Promise(resolve=>setTimeout(resolve,0));
async function initialize(retrain=false){
 if(starting)return;
 starting=true;ready=false;
 try{
  net=new NeuralIntentNet();
  if(!retrain){
   const saved=await loadCache();
   if(saved?.model?.version===NEURAL_VERSION&&net.restore(saved.model)){
    ready=true;validation=saved.report?.validation||null;
    trainingEpochs=saved.report?.epochs||0;
    status('ready',{source:'cache'});return;
   }
  }
  status('preparing');
  const pool=neuralTrainingExamples(6);
  const train=[],heldout=[];
  // Each labeled language group gets one held-out example where possible.
  const count=new Map();
  for(const e of pool){
   const label=labelIndex(e.label);if(label<0)continue;
   const key=e.lang+':'+label,n=count.get(key)||0;count.set(key,n+1);
   const row={text:e.text,lang:e.lang,label};
   (n===5?heldout:train).push(row);
  }
  const memory=typeof navigator!=='undefined'?navigator.deviceMemory:undefined;
  const smallDevice=(typeof memory==='number'&&memory<=3)||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||'');
  const epochs=smallDevice?4:6;
  trainingEpochs=epochs;
  let iteration=0;
  const total=epochs*train.length;status('training',{total,progress:0,samples:train.length});
  for(let epoch=0;epoch<epochs;epoch++){
   shuffle(train,0x974211+epoch*7919);
   const rate=epoch<2?.2:epoch<4?.15:.11;
   for(let at=0;at<train.length;at++){
    const row=train[at];
    net.trainOne(row.text,row.lang,row.label,rate,epoch);
    iteration++;
    if(iteration%160===0){
     if(iteration%1600===0)status('training',{progress:iteration,total,samples:train.length});
     await yieldToBrowser();
    }
   }
   status('training',{progress:iteration,total,samples:train.length});
  }
  validation=net.evaluate(heldout,600);
  ready=true;status('ready',{source:'trained',samples:train.length,heldout:heldout.length});
  await saveCache(net.snapshot(),{validation,epochs});
 }catch(error){ready=false;status('error',{error:String(error?.message||error).slice(0,180)});}
 finally{starting=false;}
}
onmessage=event=>{
 const msg=event.data||{};
 if(msg.type==='start')void initialize(false);
 else if(msg.type==='retrain')void initialize(true);
 else if(msg.type==='predict'){
  let prediction=null;
  if(ready&&net&&typeof msg.text==='string'&&msg.text.length<=1500){
   try{prediction=net.predict(msg.text,msg.lang);}catch{prediction=null;}
  }
  postMessage({type:'prediction',requestId:msg.requestId,prediction});
 }
};
