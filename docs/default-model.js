// MiniGPT 3.0 - mini modelo entrenado sin conexión en corpus sintético curado.
// Clasificador de similitud semántica superficial: NO es un LLM ni probabilidad calibrada.
import { normalize,aliasForTopic } from './i18n.js?v=3.0';
import { extraTopics } from './extra-topics.js?v=3.0';
import { trainingTopics } from './fallback.js?v=3.0';
const DIALOG={
 es:{
  greeting:{q:['hola','holaa','holaaa','holi','buenas','hey','hola bro','ey bro','buenos dias','buenas tardes','buenas noches','que hubo','saludos','que mas','hola minigpt'],a:['¡Holaaa! 🤖 ¿Qué tal va tu día?','¡Buenas, bro! ¿Qué cuentas? 😎','¡Ey! Aquí ando, listo para conversar. XDDD','¡Hola! ¿Qué aventura toca hoy?']},
  wellbeing:{q:['como estas','como andas','como te va','que tal estas','que tal te va','como te encuentras','como va todo','que tal andas','como te sientes','que tal todo','como estas tu','como andas tu','como va tu dia'],p:['','hola ','holaa ','hey ','buenas ','oye ','bro '],s:['',' hoy',' el dia de hoy',' en el dia de hoy',' hoy bro',' bro',' en este dia'],a:['¡Holaaa! 🤖 Listo para charlar hoy, ¿y tú cómo andas?','¡Ey, bro! Todo preparado por aquí. ¿Cómo te está yendo a ti?','¡Buenas! Aquí sigo, con ganas de conversar. ¿Qué tal tu día?']},
  thanks:{q:['gracias','muchas gracias','te agradezco','gracias bro','mil gracias','gracias por ayudar','graciasss'],a:['¡De nada, bro! 🤖','¡Con gusto! XDDD','¡Para eso estamos! 😎']},
  farewell:{q:['adios','hasta luego','nos vemos','chao','bye','me voy','hasta manana','me despido'],a:['¡Chao, bro! 👋','¡Nos vemos! Que tengas un buen día.','¡Hasta la próxima aventura! 🤖']},
  identity:{q:['quien eres','que eres','como te llamas','eres una ia','presentate','quien es minigpt'],a:['¡Soy MiniGPT! 🤖 Un pequeño chatbot que aprende asociaciones y recuerda cosas localmente.','Me llamo MiniGPT, y mi cerebro vive en tu navegador. XDDD']},
  abilities:{q:['que puedes hacer','que sabes hacer','como funcionas','que haces','para que sirves','cuales son tus funciones'],a:['Puedo conversar sobre mis temas, recordar lo que me cuentas y aprender asociaciones. No soy un modelo gigante. 🤖','Tengo memoria local, temas aprendidos e idiomas. ¡Pruébame con algo!']},
  feelings:{q:['estoy bien','me encuentro bien','me siento bien','estoy feliz','que bueno','genial','super bien'],a:['¡Qué bueno! 😎 ¿Qué te hizo el día?','¡Me alegra leer eso! ¿Qué sigue, bro?']},
  smalltalk:{q:['que haces hoy','que andas haciendo','estas ahi','seguimos hablando','quiero hablar','hablemos','dime algo'],a:['¡Aquí estoy, bro! ¿De qué hablamos? 🤖','¡Listo para otra charla! XDDD']}
 },
 en:{
  greeting:{q:['hello','hellooo','hi','hey','hey bro','hello bro','hi there','good morning','good afternoon','good evening','greetings','yo','hello minigpt'],a:['Hey, bro! 🤖 How is your day going?','Hello! What should we talk about today?','Hey! Ready for another chat. XDDD']},
  wellbeing:{q:['how are you','how are you doing','how are things','how is it going','how do you feel','how have you been','hows your day going','how are you feeling','are you doing well','how are you today'],p:['','hello ','hi ','hey ','hey bro ','yo '],s:['',' today',' on this fine day',' right now',' today bro',' this morning',' this evening'],a:["Hey! I'm ready to chat today. How are you doing? 🤖","Hello! All systems running over here. How's your day?","I'm here and ready to talk, bro! What's up?"]},
  thanks:{q:['thanks','thank you','thanks a lot','thank you so much','thanks bro','cheers','much appreciated'],a:["You're welcome, bro! 🤖","Anytime! XDDD","Glad I could help!"]},
  farewell:{q:['bye','goodbye','see you','see you later','gotta go','take care','good night'],a:['See you later, bro! 👋','Bye! Have a nice day.','Catch you next time! 🤖']},
  identity:{q:['who are you','what are you','whats your name','tell me about yourself','introduce yourself','are you an ai'],a:["I'm MiniGPT! 🤖 A small local chatbot with memory and learned associations.","MiniGPT here! I run a tiny local brain in your browser."]},
  abilities:{q:['what can you do','what do you know','how do you work','what are your features','what can we talk about'],a:["I can chat about familiar topics, store local memories, and learn from our conversation. 🤖","I have a local model, memory and a few languages. Give me a topic!"]},
  feelings:{q:['im good','im fine','feeling great','i am happy','doing well','great thanks'],a:["That's great! What made your day? 😎","Nice! What's next?"]},
  smalltalk:{q:['what are you doing','are you there','lets talk','say something','lets chat','what are you doing today'],a:["I'm right here, ready to chat! 🤖","Let's talk! What's on your mind?"]}
 },
 pt:{
  greeting:{q:['ola','oi','oie','ola bro','bom dia','boa tarde','boa noite','e ai','oi tudo bem','saudacoes','opa','olaaa'],a:['Oiii, bro! 🤖 Como vai seu dia?','Olá! Sobre o que vamos conversar?','Opa! Bora conversar! KKKK']},
  wellbeing:{q:['como voce esta','como esta voce','como vai voce','como voce vai','como esta tudo','como vai','tudo bem com voce','como voce se sente','como voce esta indo','como voce esta hoje'],p:['','ola ','oi ','oie ','e ai ','bro '],s:['',' hoje',' no dia de hoje',' nesta tarde',' meu amigo',' bro'],a:['Oiii! Estou pronto para conversar. E você, como está? 🤖','Tudo certo por aqui, bro! Como vai seu dia?','Olá! E aí, conta como você está!']},
  thanks:{q:['obrigado','obrigada','muito obrigado','valeu','brigado','agradeco','valeu bro'],a:['De nada, bro! 🤖','Imagina! KKKK','Tamo junto!']},
  farewell:{q:['tchau','ate logo','ate mais','adeus','vou embora','nos vemos','boa noite'],a:['Tchau, bro! 👋','Até mais! Tenha um ótimo dia.','A gente se vê! 🤖']},
  identity:{q:['quem e voce','o que e voce','qual e seu nome','voce e uma ia','se apresente','quem e minigpt'],a:['Sou o MiniGPT! 🤖 Um pequeno chatbot com memória e aprendizado local.','MiniGPT aqui! Meu cérebro funciona no seu navegador.']},
  abilities:{q:['o que voce faz','o que voce sabe fazer','como funciona','quais sao suas funcoes','sobre o que conversamos'],a:['Posso conversar, guardar memórias locais e aprender associações. 🤖','Tenho um modelo local, memória e vários idiomas!']},
  feelings:{q:['estou bem','estou otimo','estou feliz','tudo bem','muito bem'],a:['Que bom! 😎 Conta mais!','Aí sim! Como foi seu dia?']},
  smalltalk:{q:['o que voce esta fazendo','vamos conversar','esta ai','fale comigo','diz alguma coisa'],a:['Estou aqui, pronto para conversar! 🤖','Bora bater um papo!']}
 },
 ja:{
  greeting:{q:['こんにちは','こんちは','やあ','おはよう','おはようございます','こんばんは','もしもし','konnichiwa','konichiwa','ohayou','ohayo','konbanwa','yaa','moshimoshi'],a:['こんにちは！🤖 今日はどんな話をする？','やっほー！今日は何を話そう？','こんにちは、話せてうれしいよ！']},
  wellbeing:{q:['元気ですか','お元気ですか','今日は元気ですか','調子はどう','最近どう','元気','今日はどう','こんにちは 元気ですか','konnichiwa genki desu ka','genki desu ka','kyou wa genki desu ka','konnichiwa kyou wa genki desu ka','ogenki desu ka'],p:['','こんにちは ','やあ ','konnichiwa ','ohayou '],s:['',' 今日',' 今日は',' kyou',' kyou wa',' bro'],a:['こんにちは！元気に会話できるよ。君はどう？🤖','やっほー！今日は何を話そう？調子はどう？','話す準備はできてるよ！今日はどう？']},
  thanks:{q:['ありがとう','どうもありがとう','感謝します','助かった','arigatou','arigato'],a:['どういたしまして！🤖','こちらこそ、ありがとう！','いつでもどうぞ！']},
  farewell:{q:['さようなら','またね','じゃあね','バイバイ','おやすみ','sayonara','sayounara','oyasumi'],a:['またね！👋','じゃあね！いい一日を！','また話そうね！🤖']},
  identity:{q:['あなたは誰','君は誰','名前は何','ミニGPTとは','何者','kimi wa dare','anata wa dare'],a:['僕はMiniGPT！🤖 ブラウザで動く小さなチャットボットだよ。','MiniGPTだよ！少しずつ学習しているんだ。']},
  abilities:{q:['何ができる','何を知ってる','どうやって動く','できること','nani ga dekiru'],a:['会話したり、覚えたり、少しずつ学んだりできるよ！🤖','記憶と小さなローカルモデルがあるよ！']},
  feelings:{q:['元気だよ','大丈夫','いい感じ','うれしい','genki desu'],a:['いいね！😎 何があったの？','よかった！今日は何をする？']},
  smalltalk:{q:['何してる','話そう','いる','何か話して','hanasou'],a:['ここにいるよ！何を話そう？🤖','じゃあ、話そう！']}
 }
};
const OPENERS={es:['','hablame de ','quiero hablar de ','me gusta ','que opinas de ','hoy pense en '],en:['','tell me about ','i like ','lets talk about ','what about ','i want to talk about '],pt:['','fale sobre ','gosto de ','vamos falar de ','o que acha de ','quero falar de '],ja:['','について','が好き','の話','教えて ']};
const trim=s=>normalize(s).replace(/\s+/g,' ').trim();
const vocab=new Map(),byLang=new Map(),EXACT=new Map();
let examples=0;
function vector(text){
 const words=trim(text).split(' ').filter(Boolean).slice(0,24),features=new Map();
 for(let i=0;i<words.length;i++){
   const w=words[i];
   features.set('w:'+w,(features.get('w:'+w)||0)+3.8);
   if(i&&i<9)features.set('b:'+words[i-1]+'_'+w,2.4);
   if(w.length>=5&&w.length<24)for(let n=0;n+3<=w.length;n++)features.set('c:'+w.slice(n,n+3),0.35);
 }
 return features;
}
function ingest(text,lang,id,kind='intent'){
 const raw=trim(text);if(!raw||raw.length>140)return;
 const key=lang+':'+raw;
 if(EXACT.has(key))return;
 const item={lang,id,kind,raw,vec:vector(raw)};
 EXACT.set(key,item);
 if(!byLang.has(lang))byLang.set(lang,[]);
 byLang.get(lang).push(item);
 const vocabKey=lang+':'+id,weights=vocab.get(vocabKey)||new Map();
 for(const [feature,w] of item.vec)weights.set(feature,(weights.get(feature)||0)+w);
 vocab.set(vocabKey,weights);examples++;
}
for(const [lang,intents] of Object.entries(DIALOG))for(const [id,rule] of Object.entries(intents)){
 for(const q of rule.q){
   ingest(q,lang,id);
   if(rule.p&&rule.s)for(const p of rule.p)for(const suffix of rule.s)ingest(p+q+suffix,lang,id);
   if(!rule.p)for(const suffix of ['',' bro',' xd'])ingest(q+suffix,lang,id);
 }
}
// English receives denser supervised question patterns; other languages retain core coverage.
const ENGLISH_CODE_PROMPTS=[
 'what is ', 'what does ', 'explain ', 'define ', 'describe ',
 'tell me about ', 'how does ', 'why use ', 'when to use ',
 'what is the purpose of ', 'what are the basics of ',
 'can you explain ', 'teach me about ', 'i want to learn ',
 'help me understand ', 'what does the term ', 'what is the meaning of ',
 'why is ', 'how can i understand ', 'i am studying '
];
const CODE_SUFFIXES=['',' in programming',' in computer science',' in software engineering'];
const topics=trainingTopics();
for(let index=0;index<topics.length;index++){
 for(const lang of ['en','es','pt','ja']){
   const aliases=lang==='es'?topics[index]:aliasForTopic(index,lang);
   for(const a of aliases.filter(Boolean)){
     ingest(a,lang,'topic:'+index,'topic');
     for(const p of OPENERS[lang])if(p)ingest(lang==='ja'&&p==='教えて '?p+a:a&&lang==='ja'?a+p:p+a,lang,'topic:'+index,'topic');
     if(lang==='en'&&index>=100){
       for(const p of ENGLISH_CODE_PROMPTS)for(const suffix of CODE_SUFFIXES)ingest(p+a+suffix,lang,'topic:'+index,'topic');
       for(const phrase of ['a quick overview of ','the basics of ','a short explanation of ','understanding ','concept of '])ingest(phrase+a,lang,'topic:'+index,'topic');
     }
   }
 }
}
// Las palabras japonesas en romaji se entrenan también como variantes directas.
const ROMAJI_TOPICS={6:['neko'],7:['inu'],8:['niwatori'],27:['nihongo'],28:['nihon','tokyo'],62:['sushi'],64:['gohan'],65:['mizu','ocha'],77:['arigatou','arigato'],78:['sayonara','sayounara']};
for(const [id,aliases] of Object.entries(ROMAJI_TOPICS)){
 for(const word of aliases)for(const p of ['', 'watashi wa ', 'suki ', 'kore wa '])
  ingest(p+word,'ja','topic:'+id,'topic');
}
export const trainingStats={examples,intents:Object.keys(DIALOG.es).length*4,topics:topics.length,weights:[...vocab.values()].reduce((sum,v)=>sum+v.size,0),languages:Object.fromEntries([...byLang].map(([k,v])=>[k,v.length]))};
function similarity(a,b){
 let dot=0,aa=0,bb=0;
 for(const [f,w] of a){aa+=w*w;if(b.has(f))dot+=w*b.get(f);}
 for(const w of b.values())bb+=w*w;
 return aa&&bb?dot/Math.sqrt(aa*bb):0;
}
function scoreOne(input,lang){
 const norm=trim(input),key=lang+':'+norm,exact=EXACT.get(key);
 if(exact)return {id:exact.id,lang,percent:97,kind:exact.kind,matched:exact.raw,match:1,exact:true};
 const v=vector(norm);
 if(!v.size)return null;
 let first=null,second=null;
 for(const item of byLang.get(lang)||[]){
  const sim=similarity(v,item.vec);
  if(!first||sim>first.match){if(first&&first.id!==item.id)second=first;first={id:item.id,lang,kind:item.kind,matched:item.raw,match:sim,exact:false};}
  else if(item.id!==first.id&&(!second||sim>second.match))second={id:item.id,match:sim};
 }
 if(!first||first.match<0.57)return null;
 const gap=first.match-(second?.match||0);
 const threshold=first.kind==='topic'?0.75:0.65;
 if(first.match<threshold||gap<0.055)return null;
 const percent=Math.min(96,Math.max(65,Math.round(55+41*first.match+Math.min(5,gap*6))));
 return {...first,percent};
}
// Confianza estimada por coincidencia de características y margen,
// NO calibración probabilística (95% NO significa 95% de verdad).
export function inferDefault(input,preferred='es'){
 const candidates=[];
 for(const lang of [...new Set([preferred,'es','en','pt','ja'])]){
   const p=scoreOne(input,lang);if(p)candidates.push(p);
 }
 candidates.sort((a,b)=>b.percent-a.percent||Number(b.lang===preferred)-Number(a.lang===preferred));
 const best=candidates[0];
 if(!best)return {percent:0,id:null,lang:preferred,kind:'unknown',source:'default',matched:''};
 // Evita elegir un saludo inglés con ambigüedad si el detector reconoce japonés.
 if(best.lang!==preferred){
   const local=candidates.find(x=>x.lang===preferred);
   if(local&&local.percent>=best.percent-4)return local;
 }
 return best;
}
let responseCount=0;
const sampleResponses=(a,seed)=>a[(seed+responseCount++)%a.length];
export function respondDefault(p,lang=p?.lang||'es'){
 if(!p||p.percent<80)return null;
 const outlang=DIALOG[lang]?lang:p.lang;
 const responses=DIALOG[outlang]?.[p.id]?.a||DIALOG[p.lang]?.[p.id]?.a;
 if(responses)return sampleResponses(responses,Math.floor(p.percent/10));
 if(String(p.id).startsWith('topic:')){
  const index=Number(p.id.slice(6)),names=trainingTopics()[index];
  if(!names)return null;
  const name=outlang==='es'?names[0]:(aliasForTopic(index,outlang)[0]||names[0]);
  if(index>=100){
    const definition=extraTopics[index-100]?.info;
    if(!definition)return null;
    const translated={es:'Concepto técnico: ',pt:'Conceito técnico: ',ja:'技術の説明: ',en:''}[outlang]||'';
    // Definitions are original curated English reference data, not generated code.
    return translated+definition;
  }
  const answers={
   es:[`¡${name}! 😎 Podemos hablar de eso. ¿Qué te interesa?`,`Bro, ${name} tiene tema para rato. ¿Qué quieres explorar?`,`¡Vamos con ${name}! ¿Qué parte te llama la atención?`],
   en:[`Oh, ${name}! What do you want to explore? 🤖`,`We can talk about ${name}, bro! What's on your mind?`],
   pt:[`Ah, ${name}! Sobre o que você quer conversar? 🤖`,`Bora falar sobre ${name}! O que te interessa?`],
   ja:[`${name}の話だね！何が気になる？🤖`,`${name}について話そう！どこから始める？`]
  };
  return sampleResponses(answers[outlang]||answers.es,index);
 }
 return null;
}
export function defaultWeightView(query='',limit=30){
 const q=trim(query),list=[];
 for(const [id,map] of vocab){
   if(q&&!id.includes(q)&&![...map.keys()].some(k=>k.includes(q)))continue;
   const sorted=[...map].sort((a,b)=>b[1]-a[1]).slice(0,q?12:3);
   for(const [term,weight] of sorted)if(!q||id.includes(q)||term.includes(q))list.push({intent:id,feature:term,weight:+weight.toFixed(1)});
 }
 list.sort((a,b)=>b.weight-a.weight);
 return list.slice(0,Math.max(1,Math.min(200,limit)));
}
