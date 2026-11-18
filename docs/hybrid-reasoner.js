// Verified multi-topic composition: retrieves individual curated explanations
// rather than inventing a general-purpose answer.
import {detectTopicMatches} from './fallback.js?v=1.3';
import {respondDefault} from './default-model.js?v=1.3';
import {topicPhrase} from './i18n.js?v=1.3';
const connectors=/\b(?:y|and|e|ou|vs|versus|comparar|compara|compare|comparison|diferencia|diferença|difference)\b|と|や|比較/u;
export function composeTopicAnswer(input,language='es'){
 const text=String(input||'');
 if(text.length>550||!connectors.test(text))return null;
 if(!/(?:\bqu[eé]\b|\bwhat\b|\bo que\b|\bexplain\b|\bexplica\b|\bsobre\b|\babout\b|\bcompara\b|\bcomparar\b|\bcompare\b|\bdiferencia\b|について|説明|とは|比較)/iu.test(text))return null;
 const found=detectTopicMatches(text,language);
 const tokens=new Map();
 for(const hit of found){
  const key=String(hit.at)+':'+String(hit.term||'').toLowerCase();
  const existing=tokens.get(key);
  if(!existing||hit.id>=200&&existing.id<200)tokens.set(key,hit);
 }
 const ids=[...new Set([...tokens.values()].map(x=>x.id))].filter(Number.isInteger).slice(0,4);
 if(ids.length<2||ids.length>3)return null;
 const labels=[],answers=[];
 for(const id of ids){
  const name=topicPhrase(id,language)||'Topic '+id;
  const answer=respondDefault({id:'topic:'+id,percent:90,lang:language},language);
  if(!answer)return null;
  labels.push(name);answers.push('- **'+name+'**: '+answer);
 }
 const intro={
  es:'Aquí tienes los conceptos por separado:',
  en:'Here are the concepts, one by one:',
  pt:'Aqui estão os conceitos, um por um:',
  ja:'それぞれの概念を説明するね。'
 }[language]||'Here are the concepts:';
 return {text:intro+'\n\n'+answers.join('\n'),kind:'multi-topic',
  trigger:'Explicit comparison or compound topic question',topics:ids};
}
