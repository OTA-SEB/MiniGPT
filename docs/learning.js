// MiniGPT 2.0: modelo estadístico contextual con pesos iniciales,
// aprendizaje incremental, memoria local y compatibilidad con archivos v1.
// Inspirado en ideas de atención/recuperación; NO contiene pesos de Qwen.
import { trainingTopics } from './fallback.js?v=2.0';
import { aliasForTopic,romajiToKana } from './i18n.js?v=2.0';
const FILE='minigpt-pesos.json',BACKUP='minigpt.pesos.v1';
const MAX_EXAMPLES=180,MAX_HISTORY=48,MAX_FEATURES=6000;
const blank=()=>({version:2,turns:0,features:{},examples:[],history:[],facts:{},seeded:false,seedVersion:0});
let brain=blank(),storageReady=null,saveTimer=null;
const clean=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff ]+/g,' ').replace(/\s+/g,' ').trim();
const ignored=new Set('un una unos unas el la los las de del a al y o en que por para con sin se es soy eres era esta este esto su tu mi me te lo le ya no si yo tu bro xd xddd pues como muy pero algo hay eso the this that and are for with i we you is to of can do like'.split(' '));
function features(message){
 const words=clean(message).split(' ').filter(w=>(w.length>=3||/[\u3040-\u30ff\u3400-\u9fff]/u.test(w))&&!ignored.has(w)).slice(0,35);
 const out=new Set(words.map(w=>'w:'+w));
 for(let i=1;i<words.length;i++)out.add('b:'+words[i-1]+'_'+words[i]);
 for(const word of words.filter(w=>w.length>=5))for(let j=0;j+3<=word.length;j++)out.add('c:'+word.slice(j,j+3));
 return [...out].slice(0,180);
}
function valid(x){return x&&(x.version===1||x.version===2)&&Number.isFinite(x.turns)&&x.features&&typeof x.features==='object'&&!Array.isArray(x.features)&&Array.isArray(x.examples);}
function migrate(x){
 if(!valid(x))return blank();
 return {version:2,turns:Math.max(0,x.turns),features:x.features,examples:x.examples.slice(-MAX_EXAMPLES),history:Array.isArray(x.history)?x.history.slice(-MAX_HISTORY):[],facts:x.facts&&typeof x.facts==='object'&&!Array.isArray(x.facts)?x.facts:{},seeded:!!x.seeded,seedVersion:Number.isFinite(x.seedVersion)?x.seedVersion:(x.seeded?2:0)};
}
function addWeight(key,id,amount=1){
 if(!key||!Number.isInteger(id)||id<0||id>=100)return;
 const row=brain.features[key]||(brain.features[key]={});
 row[id]=Math.min(60,Math.max(0,Number(row[id])||0)+amount);
}
function seed(){
 if(brain.seedVersion>=3)return;
 const topics=trainingTopics();
 for(let id=0;id<topics.length;id++){
   const aliases=[...topics[id],...aliasForTopic(id,'en'),...aliasForTopic(id,'pt'),...aliasForTopic(id,'ja')];
   for(const alias of new Set(aliases)){
     const variants=[alias];
     if(!brain.seeded && /[a-z]/i.test(alias))variants.push('hablar de '+alias,'me gusta '+alias,'talk about '+alias,'fale sobre '+alias);
     for(const variant of variants){
       const f=features(variant);
       for(const key of f)addWeight(key,id,key.startsWith('w:')?3.5:key.startsWith('b:')?1.2:0.3);
     }
   }
 }
 // Semillas fonéticas: el romaji se conecta a los mismos temas que el japonés.
 const extras={1:'konnichiwa konichiwa konbanwa ohayou ohayo',6:'neko',7:'inu',8:'niwatori',27:'nihongo',28:'nihon tokyo',64:'gohan',62:'sushi',65:'mizu',77:'arigatou arigato',78:'sayonara sayounara'};
 for(const [id,words] of Object.entries(extras))for(const word of words.split(' ')){
   for(const key of features(word))addWeight(key,+id,key.startsWith('w:')?5:0.5);
 }
 brain.seeded=true;
 brain.seedVersion=3;
}
async function load(){
 let parsed=null;
 try{
  if(navigator.storage?.getDirectory){
   const root=await navigator.storage.getDirectory(),handle=await root.getFileHandle(FILE,{create:true});
   const f=await handle.getFile();if(f.size)parsed=JSON.parse(await f.text());
  }
 }catch{}
 if(!valid(parsed))try{parsed=JSON.parse(localStorage.getItem(BACKUP)||'null');}catch{}
 brain=valid(parsed)?migrate(parsed):blank();
 if(valid(parsed)&&parsed.version===1)for(const example of brain.examples)if(typeof example.q==='string')rememberFact(example.q);
}
async function save(){
 const json=JSON.stringify(brain);
 try{localStorage.setItem(BACKUP,json);}catch{}
 try{
   if(navigator.storage?.getDirectory){
    const dir=await navigator.storage.getDirectory(),handle=await dir.getFileHandle(FILE,{create:true});
    const writer=await handle.createWritable();await writer.write(json);await writer.close();
   }
 }catch{}
}
function queueSave(){
 if(saveTimer!==null)clearTimeout(saveTimer);
 saveTimer=setTimeout(()=>{saveTimer=null;void save();},400);
}
export function ready(){return storageReady??=(async()=>{await load();seed();await save();})();}

// Memoria explícita: solo aprende declaraciones escritas por la persona.
// Se guarda exclusivamente en el navegador (y en su exportación de pesos).
function rememberFact(input){
 const raw=String(input||'').trim(),norm=clean(raw);
 let m;
 const set=(id,value)=>{if(value&&value.length<=120)brain.facts[id]={value:value.trim(),at:Date.now()};};
 if((m=/^(?:me llamo|mi nombre es)\s+(.{2,60})[.!]?$/i.exec(raw)))set('name',m[1].replace(/[.!]$/,''));
 if((m=/^me gust(?:a|an)\s+(.{2,100})[.!]?$/i.exec(raw)))set('likes',m[1].replace(/[.!]$/,''));
 if((m=/^mi (?:juego|animal|anime|color) favorito es\s+(.{2,100})[.!]?$/i.exec(raw)))set('favorite',m[1].replace(/[.!]$/,''));
 if((m=/^([\p{L}\p{N}_-]{2,45})\s+(?:significa|means)\s+(.{2,70})[.!]?$/iu.exec(raw))){
    let translation=m[2].replace(/\s+en (?:japon[eé]s|ingl[eé]s|portugu[eé]s|espa[nñ]ol)\.?$/i,'').replace(/[.!]$/,'').trim();
    set('translation:'+clean(m[1]),translation);
 }
}
// Minidiccionario semántico inicial, distinto de los recuerdos personales.
const JP_GLOSS={
 konnichiwa:"hola",konichiwa:"hola",ohayou:"buenos días",ohayo:"buenos días",
 konbanwa:"buenas noches (saludo)",arigatou:"gracias",arigato:"gracias",
 sayonara:"adiós",sayounara:"adiós",neko:"gato",inu:"perro",
 mizu:"agua",ocha:"té",gohan:"comida o arroz cocido",sushi:"sushi",
 nihongo:"idioma japonés",nihon:"Japón",tokyo:"Tokio",
 watashi:"yo",anata:"tú",kimi:"tú (informal)",boku:"yo (informal)",
 desu:"forma cortés de ser o estar",suki:"gustar",daisuki:"gustar mucho",
 baka:"tonto",kawaii:"adorable",kakkoii:"genial",sugoi:"increíble",
 nande:"¿por qué?",nani:"¿qué?",demo:"pero",mou:"ya",
 samui:"frío",atsui:"calor",sensei:"profesor",
 arimasu:"haber o existir",hai:"sí",iie:"no",sumimasen:"disculpa"
};
export function answerMemory(question,lang='es'){
 const q=clean(question),fs=brain.facts||{};
 if(/^(?:que|q|what) (?:significa|means) /.test(q)||/^(?:what does|que quiere decir) /.test(q)){
  const candidate=q.replace(/^(?:que significa|q significa|what means|what does|que quiere decir)\s+/,'').replace(/\s+mean$/,'').replace(/[?¿]/g,'').trim();
  const entry=fs['translation:'+candidate],meaning=entry?.value||JP_GLOSS[candidate];
  if(meaning)return lang==='ja'?candidate+' は「'+meaning+'」という意味だよ。':lang==='en'?candidate+' means '+meaning+'.':candidate+' significa '+meaning+'.';
 }
 if(/(?:como me llamo|cual es mi nombre|what is my name)/.test(q)&&fs.name)return lang==='en'?'You told me your name is '+fs.name.value+'.':'Me dijiste que te llamas '+fs.name.value+'.';
 if(/(?:que me gusta|que cosas me gustan|what do i like)/.test(q)&&fs.likes)return lang==='en'?'You told me you like '+fs.likes.value+'.':'Me dijiste que te gusta '+fs.likes.value+'.';
 if(/(?:que recuerdas|que sabes de mi|what do you remember)/.test(q)){
  const entries=Object.entries(fs).filter(([k])=>!k.startsWith('translation:')).slice(-5);
  if(!entries.length)return lang==='en'?"I haven't saved any personal facts yet.":"Todavía no he guardado datos sobre ti.";
  return (lang==='en'?'I remember: ':'Recuerdo: ')+entries.map(([k,x])=>(k==='name'?'nombre: ':k==='likes'?'te gusta: ':'favorito: ')+x.value).join('; ')+'.';
 }
 return null;
}
export function getHistory(){return brain.history.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content,lang:x.lang||'es'}));}
export function clearChat(){brain.history=[];queueSave();}
export async function forgetMemory(){
 brain=blank();seed();brain.turns=0;await save();return stats();
}
export function memoryContext(){
 const data=Object.entries(brain.facts).slice(-12).map(([key,v])=>key+': '+String(v.value||'')).join('\n');
 return data.slice(0,1500);
}
function cleanExamples(){
 const bad=["No puedo responder ahora mismo.","I can't answer that right now.","Não consigo responder isso agora.","今はそれに答えられないよ。"];
 brain.examples=brain.examples.filter(x=>x&&typeof x.a==='string'&&x.a.trim()&&!bad.includes(x.a.trim())&&Array.isArray(x.fs)&&x.fs.length);
 if(brain.examples.length>MAX_EXAMPLES)brain.examples=brain.examples.slice(-MAX_EXAMPLES);
}
export function learn(input,answer,topics=[],source='local',language='es'){
 const fs=features(input);
 brain.turns=(brain.turns||0)+1;
 rememberFact(input);
 for(const feature of fs)for(const id of topics.slice(0,5))if(Number.isInteger(id)&&id>=0&&id<100)addWeight(feature,id,feature.startsWith('w:')?1:0.3);
 const fallbackPhrases=["No puedo responder ahora mismo.","I can't answer that right now.","Não consigo responder isso agora.","今はそれに答えられないよ。"];
 if(typeof answer==='string'&&answer.trim()&&!fallbackPhrases.includes(answer.trim())&&fs.length){
  const entry={q:clean(input).slice(0,360),a:answer.slice(0,700),source:source==='api'?'api':'local',lang:language,fs:fs.slice(0,120)};
  const old=brain.examples.findIndex(x=>x.q===entry.q&&x.lang===entry.lang);if(old>=0)brain.examples.splice(old,1);
  brain.examples.push(entry);
 }
 cleanExamples();
 brain.history.push({role:'user',content:String(input).slice(0,2000),lang:language},{role:'assistant',content:String(answer).slice(0,1500),lang:language});
 brain.history=brain.history.slice(-MAX_HISTORY);
 const keys=Object.keys(brain.features);
 if(keys.length>MAX_FEATURES){
  const active=new Set(brain.examples.flatMap(x=>x.fs||[]).slice(-3000));
  const remove=keys.filter(k=>!active.has(k)).slice(0,keys.length-MAX_FEATURES);
  for(const k of remove)delete brain.features[k];
 }
 queueSave();
}
export function predictTopics(message){
 const fs=features(message);if(!fs.length)return [];
 const votes=new Map(),wordHits=new Map();
 for(const key of fs){
  const row=brain.features[key];if(!row)continue;
  const influence=key.startsWith('w:')?2.4:key.startsWith('b:')?1.3:0.23;
  for(const [raw,weight] of Object.entries(row)){
   const id=+raw;
   if(!Number.isInteger(id)||id<0||id>=100)continue;
   votes.set(id,(votes.get(id)||0)+influence*Math.min(8,Number(weight)||0));
   if(key.startsWith('w:'))wordHits.set(id,(wordHits.get(id)||0)+1);
  }
 }
 const ranked=[...votes].filter(([id,v])=>wordHits.has(id)?v>=3:v>=Math.max(6,fs.length*0.6)).sort((a,b)=>b[1]-a[1]);
 if(!ranked.length)return [];
 const top=ranked[0][1];
 return ranked.filter(([,v])=>v>=Math.max(4,top*0.37)).slice(0,5).map(([id])=>id);
}
export function recall(message,language='es'){
 const q=clean(message),fs=new Set(features(message));if(!fs.size)return null;
 let best=null,score=0;
 for(const e of brain.examples){
  if((e.lang||'es')!==language||!Array.isArray(e.fs)||typeof e.a!=='string')continue;
  if(e.q===q)return e.a;
  // No aprender errores de las plantillas: recordar respuestas generadas solo en preguntas idénticas.
  if(e.source!=='api')continue;
  const overlap=e.fs.reduce((n,k)=>n+(fs.has(k)?1:0),0);
  const sim=overlap/Math.max(1,Math.sqrt(fs.size*e.fs.length));
  if(sim>=0.8&&sim>score){best=e.a;score=sim;}
 }
 return best;
}
export function stats(){return {turns:brain.turns,examples:brain.examples.length,weights:Object.keys(brain.features).length,memory:Object.keys(brain.facts).length,history:brain.history.length,seeded:brain.seeded,seedVersion:brain.seedVersion};}
export function inspectMemory(){
 const facts=Object.entries(brain.facts).map(([key,info])=>({key,value:String(info?.value||''),date:info?.at||0}));
 const history=getHistory().slice(-24).map(x=>({role:x.role,text:x.content.slice(0,160),lang:x.lang}));
 return {facts,history};
}
export function inspectWeights(query='',limit=90){
 const q=clean(query).replace(/ /g,'');
 const items=[];
 for(const [feature,topics] of Object.entries(brain.features)){
  if(!topics||typeof topics!=='object')continue;
  for(const [raw,weight] of Object.entries(topics)){
   if(!Number.isFinite(Number(weight)))continue;
   const id=Number(raw),name=trainingTopics()[id]?.[0]||String(id);
   if(q&&!clean(feature).includes(q)&&!clean(name).includes(q)&&String(id)!==q)continue;
   items.push({feature,topic:id,name,weight:Number(weight)});
  }
 }
 items.sort((a,b)=>b.weight-a.weight||a.topic-b.topic);
 return {total:items.length,items:items.slice(0,Math.max(1,Math.min(300,limit)))};
}
export async function exportWeights(){
 await ready();await save();
 const blob=new Blob([JSON.stringify(brain,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=FILE;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function importWeights(file){
 if(!file||file.size>5*1024*1024)throw new Error('Archivo demasiado grande.');
 const parsed=JSON.parse(await file.text());if(!valid(parsed))throw new Error('Archivo inválido.');
 const old=migrate(parsed);
 for(const [key,row] of Object.entries(old.features)){
  if(!row||typeof row!=='object')continue;
  for(const [id,value] of Object.entries(row)){
   if(Number.isInteger(+id)&&Number.isFinite(value)&&value>0){
    const target=brain.features[key]||(brain.features[key]={});
    target[id]=Math.max(Number(target[id])||0,Math.min(60,value));
   }
  }
 }
 brain.turns=Math.max(brain.turns,old.turns);
 for(const x of old.examples)if(x&&typeof x.q==='string'&&typeof x.a==='string'&&!brain.examples.some(y=>y.q===x.q&&y.lang===x.lang))brain.examples.push(x);
 if(old.history.length)brain.history=old.history.slice(-MAX_HISTORY);
 Object.assign(brain.facts,old.facts);
 if(parsed.version===1)for(const example of old.examples)if(typeof example.q==='string')rememberFact(example.q);
 seed();cleanExamples();await save();return stats();
}
