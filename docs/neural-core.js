// Real trainable neural intent classifier for OtaAI. This is NOT a generative LLM.
// Architecture: language-specific hashed embeddings -> tanh hidden layer -> 408 outputs.
// Manual gradient descent with sampled-negative logistic loss; bounded memory and compute.
export const NEURAL_VERSION=1;
export const NEURAL_LANGUAGES=['es','en','pt','ja'];
export const NEURAL_INTENTS=['greeting','wellbeing','thanks','farewell','identity','abilities','feelings','smalltalk'];
export const NEURAL_TOPIC_COUNT=400,NEURAL_CLASSES=NEURAL_TOPIC_COUNT+NEURAL_INTENTS.length;
export const NEURAL_BUCKETS=4096,NEURAL_EMBED=24,NEURAL_HIDDEN=48;
export const NEURAL_PARAMETER_COUNT=NEURAL_LANGUAGES.length*NEURAL_BUCKETS*NEURAL_EMBED+
 NEURAL_EMBED*NEURAL_HIDDEN+NEURAL_HIDDEN+NEURAL_CLASSES*NEURAL_HIDDEN+NEURAL_CLASSES;
const STOP=new Set(('que qué como cómo cual cuál cuanto cuánto cuando dónde por para con sin del las los una unos unas el la lo y o es eres soy son está estar soy de en yo tu mi me se un '+
 'what who when where why how which for and the this that are was were can you your from of to is a an me tell about explain '+
 'oque voce você como para pelas pelo pelos das dos de da do as os um uma sobre com que qual onde no na em eu '+
 'は が を に の です ます ください について とは 教えて 説明').split(/\s+/));
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[^\p{L}\p{N}+#.\s-]/gu,' ').replace(/\s+/g,' ').trim().slice(0,320);}
function hash(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function rand(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
const fcount=NEURAL_LANGUAGES.length*NEURAL_BUCKETS;
export function neuralFeatures(text,lang){
 const li=Math.max(0,NEURAL_LANGUAGES.indexOf(lang)),base=li*NEURAL_BUCKETS,input=norm(text);
 const raw=input.split(' ').filter(Boolean).slice(0,26);
 const tokens=new Set();
 for(const word of raw){
  if(STOP.has(word))continue;
  tokens.add('w:'+word);
  if(word.length>=4&&word.length<30){
   for(let i=0;i<=word.length-3;i++)tokens.add('c:'+word.slice(i,i+3));
  }
 }
 // Japanese is mostly written without spaces; include short character n-grams.
 if(li===3){const chars=[...input.replace(/\s+/g,'')].slice(0,46);
  for(let i=0;i<chars.length-1;i++)tokens.add('j:'+chars.slice(i,i+2).join(''));
  for(let i=0;i<chars.length-2;i++)tokens.add('k:'+chars.slice(i,i+3).join(''));
 }
 if(!tokens.size)for(const word of raw.slice(0,8))tokens.add('w:'+word);
 const indexes=[],seen=new Set();
 for(const token of tokens){
  const id=base+hash(token)%NEURAL_BUCKETS;
  if(!seen.has(id)){indexes.push(id);seen.add(id);}
  if(indexes.length>=72)break;
 }
 return indexes;
}
export function labelIndex(id){
 if(typeof id!=='string')return -1;
 if(id.startsWith('topic:')){
  const n=Number(id.slice(6));return Number.isInteger(n)&&n>=0&&n<NEURAL_TOPIC_COUNT?n:-1;
 }
 const i=NEURAL_INTENTS.indexOf(id);return i<0?-1:NEURAL_TOPIC_COUNT+i;
}
export function className(n){
 return Number.isInteger(n)&&n>=0&&n<NEURAL_CLASSES?(n<NEURAL_TOPIC_COUNT?'topic:'+n:NEURAL_INTENTS[n-NEURAL_TOPIC_COUNT]):null;
}
export class NeuralIntentNet{
 constructor(seed=947221){
  const random=rand(seed);
  this.embed=new Float32Array(fcount*NEURAL_EMBED);
  this.dense=new Float32Array(NEURAL_EMBED*NEURAL_HIDDEN);
  this.hiddenBias=new Float32Array(NEURAL_HIDDEN);
  this.output=new Float32Array(NEURAL_CLASSES*NEURAL_HIDDEN);
  this.outputBias=new Float32Array(NEURAL_CLASSES);
  for(let i=0;i<this.embed.length;i++)this.embed[i]=(random()-.5)*1.2;
  for(let i=0;i<this.dense.length;i++)this.dense[i]=(random()-.5)*.8;
  for(let i=0;i<this.output.length;i++)this.output[i]=(random()-.5)*.32;
  this.steps=0;
 }
 arrays(){return [this.embed,this.dense,this.hiddenBias,this.output,this.outputBias];}
 snapshot(){
  return {version:NEURAL_VERSION,steps:this.steps,parameters:NEURAL_PARAMETER_COUNT,
   arrays:this.arrays().map(arr=>arr.slice().buffer)};
 }
 restore(snapshot){
  if(!snapshot||snapshot.version!==NEURAL_VERSION||snapshot.parameters!==NEURAL_PARAMETER_COUNT||
    !Array.isArray(snapshot.arrays)||snapshot.arrays.length!==5)return false;
  const arrays=this.arrays();
  for(let i=0;i<arrays.length;i++){
   const value=snapshot.arrays[i],src=value instanceof ArrayBuffer?new Float32Array(value):
    value instanceof Float32Array?value:null;
   if(!src||src.length!==arrays[i].length)return false;
   for(const n of src)if(!Number.isFinite(n))return false;
   arrays[i].set(src);
  }
  this.steps=Number(snapshot.steps)||0;
  return true;
 }
 forward(indexes){
  const input=new Float32Array(NEURAL_EMBED);
  const count=Math.sqrt(Math.max(1,indexes.length));
  for(const index of indexes){
   const start=index*NEURAL_EMBED;
   for(let d=0;d<NEURAL_EMBED;d++)input[d]+=this.embed[start+d]/count;
  }
  const hidden=new Float32Array(NEURAL_HIDDEN);
  for(let h=0;h<NEURAL_HIDDEN;h++){
   let v=this.hiddenBias[h];
   for(let d=0;d<NEURAL_EMBED;d++)v+=input[d]*this.dense[d*NEURAL_HIDDEN+h];
   hidden[h]=Math.tanh(v);
  }
  return {input,hidden};
 }
 logits(hidden){
  const values=new Float32Array(NEURAL_CLASSES);
  for(let c=0;c<NEURAL_CLASSES;c++){
   let z=this.outputBias[c],at=c*NEURAL_HIDDEN;
   for(let h=0;h<NEURAL_HIDDEN;h++)z+=hidden[h]*this.output[at+h];
   values[c]=z;
  }
  return values;
 }
 predict(text,lang='es'){
  const x=neuralFeatures(text,lang);if(!x.length)return null;
  const {hidden}=this.forward(x),values=this.logits(hidden);
  let max=-Infinity,top=-1,second=-1;
  for(let i=0;i<values.length;i++){if(values[i]>max)max=values[i];}
  let sum=0;for(let i=0;i<values.length;i++)sum+=Math.exp(Math.max(-50,values[i]-max));
  let best=-Infinity,next=-Infinity;
  for(let i=0;i<values.length;i++){
   const p=Math.exp(Math.max(-50,values[i]-max))/sum;
   if(p>best){next=best;second=top;best=p;top=i;}
   else if(p>next){next=p;second=i;}
  }
  return {label:className(top),confidence:Number(best.toFixed(5)),margin:Number((best-Math.max(0,next)).toFixed(5)),
   alternate:className(second),steps:this.steps};
 }
 trainOne(text,lang,target,step,seed){
  if(target<0||target>=NEURAL_CLASSES)return 0;
  const indexes=neuralFeatures(text,lang);if(!indexes.length)return 0;
  const {input,hidden}=this.forward(indexes);
  const gradH=new Float32Array(NEURAL_HIDDEN),set=new Set([target]);
  let state=hash(text+'|'+lang+'|'+seed+'|'+this.steps);
  // 12 deterministic hard-ish negatives including labels adjacent to target.
  for(let k=0;k<14;k++){
   state=(Math.imul(state,1664525)+1013904223)>>>0;
   set.add(state%NEURAL_CLASSES);
  }
  let loss=0;
  for(const label of set){
   const base=label*NEURAL_HIDDEN,isPositive=label===target,weight=isPositive?1:.33;
   let z=this.outputBias[label];
   for(let h=0;h<NEURAL_HIDDEN;h++)z+=hidden[h]*this.output[base+h];
   const sig=1/(1+Math.exp(-Math.max(-25,Math.min(25,z))));
   const delta=(sig-(isPositive?1:0))*weight;
   loss+=weight*(isPositive?-Math.log(Math.max(1e-7,sig)):-Math.log(Math.max(1e-7,1-sig)));
   for(let h=0;h<NEURAL_HIDDEN;h++){
    gradH[h]+=delta*this.output[base+h];
    this.output[base+h]-=step*delta*hidden[h];
   }
   this.outputBias[label]-=step*delta;
  }
  const gradX=new Float32Array(NEURAL_EMBED);
  for(let h=0;h<NEURAL_HIDDEN;h++)gradH[h]*=(1-hidden[h]*hidden[h]);
  for(let d=0;d<NEURAL_EMBED;d++){
   for(let h=0;h<NEURAL_HIDDEN;h++){
    const at=d*NEURAL_HIDDEN+h;
    gradX[d]+=gradH[h]*this.dense[at];
    this.dense[at]-=step*gradH[h]*input[d];
   }
  }
  for(let h=0;h<NEURAL_HIDDEN;h++)this.hiddenBias[h]-=step*gradH[h];
  for(const index of indexes){
   const base=index*NEURAL_EMBED;
   for(let d=0;d<NEURAL_EMBED;d++)this.embed[base+d]-=step*gradX[d]/Math.sqrt(indexes.length);
  }
  this.steps++;return loss;
 }
 evaluate(examples,max=500){
  if(!examples.length)return {accuracy:0,correct:0,tested:0};
  let correct=0,tested=0;
  const stride=Math.max(1,Math.floor(examples.length/max));
  for(let i=0;i<examples.length&&tested<max;i+=stride){
   const e=examples[i],label=className(e.label);
   if(this.predict(e.text,e.lang)?.label===label)correct++;
   tested++;
  }
  return {accuracy:Math.round(1000*correct/tested)/10,correct,tested};
 }
}