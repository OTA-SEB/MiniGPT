// MiniGPT: aprendizaje estadístico local. Los datos nunca se envían a GitHub.
const FILE='minigpt-pesos.json', BACKUP='minigpt.pesos.v1';
const blank=()=>({version:1,turns:0,features:{},examples:[]});
let brain=blank(),saveTimer=null,storageReady=null;
const clean=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf ]+/g,' ').replace(/\s+/g,' ').trim();
const ignored=new Set('un una unos unas el la los las de del a al y o en que qué por para con sin se es soy eres era esta este esto su tu mi me te lo le ya no si sí yo tú bro xd xddd pues como muy pero algo hola hay esto eso como'.split(' '));
function features(message){
 const words=clean(message).split(' ').filter(w=>w.length>=3&&!ignored.has(w)).slice(0,35);
 const out=new Set(words.map(w=>'w:'+w));
 for(let i=1;i<words.length;i++)out.add('b:'+words[i-1]+'_'+words[i]);
 for(const word of words.filter(w=>w.length>=5)){
   for(let j=0;j+3<=word.length;j++)out.add('c:'+word.slice(j,j+3));
 }
 return [...out].slice(0,180);
}
function valid(x){return x&&x.version===1&&Number.isFinite(x.turns)&&x.features&&typeof x.features==='object'&&Array.isArray(x.examples);}
async function load(){
 try{
   if(navigator.storage?.getDirectory){
     const root=await navigator.storage.getDirectory();
     const handle=await root.getFileHandle(FILE,{create:true});
     const file=await handle.getFile();
     if(file.size){const parsed=JSON.parse(await file.text());if(valid(parsed)){brain=parsed;return;}}
   }
 }catch{}
 try{const saved=localStorage.getItem(BACKUP);if(saved){const parsed=JSON.parse(saved);if(valid(parsed))brain=parsed;}}catch{}
}
export function ready(){return storageReady??=(load());}
async function save(){
 const json=JSON.stringify(brain);
 try{localStorage.setItem(BACKUP,json);}catch{}
 try{
   if(navigator.storage?.getDirectory){
     const dir=await navigator.storage.getDirectory();
     const handle=await dir.getFileHandle(FILE,{create:true});
     const writer=await handle.createWritable();
     await writer.write(json);await writer.close();
   }
 }catch{}
}
function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{void save();},400);}
export function learn(input,answer,topics=[],source='fallback'){
 const fs=features(input);
 brain.turns=(brain.turns||0)+1;
 // Pesos entrenables: asociación entre características de texto y temas.
 for(const feature of fs){
   const row=brain.features[feature]||(brain.features[feature]={});
   for(const topic of topics.slice(0,5)){
     if(Number.isInteger(topic)&&topic>=0&&topic<100)row[topic]=Math.min(30,(row[topic]||0)+1);
   }
 }
 // Aprende de respuestas reales y de diálogos automáticos útiles, sin pedir lecciones.
 if(typeof answer==='string'&&answer.trim()&&answer!=='No puedo responder ahora mismo.'&&fs.length){
   const entry={q:clean(input).slice(0,360),a:answer.slice(0,700),source:source==='api'?'api':'local',fs:fs.slice(0,120)};
   const old=brain.examples.findIndex(x=>x.q===entry.q);
   if(old>=0)brain.examples.splice(old,1);
   brain.examples.push(entry);
   if(brain.examples.length>180)brain.examples.splice(0,brain.examples.length-180);
 }
 // Evita que el archivo crezca sin límite en móviles.
 const keys=Object.keys(brain.features);
 if(keys.length>3500){
   const keep=new Set(brain.examples.flatMap(x=>x.fs||[]).slice(-2500));
   for(const k of keys)if(!keep.has(k))delete brain.features[k];
 }
 // Copia inmediata para no perder el último turno al cerrar la pestaña.
 try{localStorage.setItem(BACKUP,JSON.stringify(brain));}catch{}
 queueSave();
}
export function predictTopics(message){
 const fs=features(message);if(!fs.length)return [];
 const votes=new Map();
 for(const f of fs){
   const row=brain.features[f];if(!row)continue;
   for(const [id,weight] of Object.entries(row))votes.set(+id,(votes.get(+id)||0)+Math.min(3,weight));
 }
 return [...votes].filter(([,score])=>score>=Math.max(3,fs.length*0.22))
   .sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id])=>id);
}
export function recall(message){
 const fs=new Set(features(message));if(fs.size===0)return null;
 let best=null,score=0;
 for(const example of brain.examples){
   if(!Array.isArray(example.fs)||typeof example.a!=='string')continue;
   const overlap=example.fs.reduce((n,f)=>n+(fs.has(f)?1:0),0);
   const similarity=overlap/Math.max(1,Math.sqrt(fs.size*example.fs.length));
   const threshold=example.source==='api'?0.64:0.9;
   if(similarity>=threshold&&similarity>score){best=example.a;score=similarity;}
 }
 return best;
}
export function stats(){return {turns:brain.turns,examples:brain.examples.length,weights:Object.keys(brain.features).length};}
export async function exportWeights(){
 await ready();await save();
 const blob=new Blob([JSON.stringify(brain,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download=FILE;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function importWeights(file){
 if(!file||file.size>4*1024*1024)throw new Error('Archivo demasiado grande.');
 const parsed=JSON.parse(await file.text());
 if(!valid(parsed))throw new Error('Archivo de pesos no válido.');
 brain=parsed;await save();return stats();
}
