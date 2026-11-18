import { answerCodeRequest,inspectCodeText,supportedCodeLanguages } from './code-knowledge.js?v=1.4';
// OtaAI 3.0 - bounded arithmetic, logic and static code inspection. No eval().
export function reason(input,lang='en'){
 const raw=String(input||'').trim();if(raw.length>6000)return null;
 const l=raw.toLowerCase(),loc=(en,es,pt,ja)=>({en,es,pt,ja}[lang]||en);
 const done=(text,kind,confidence=99)=>({text,kind,confidence});
 // Explicit, reproducible multi-step symbolic reasoning, with intermediate steps.
 const linear=raw.match(/^(?:(?:resuelve|resolver|solve|resolve|encuentra x|find x)\s*:?\s*)?([+-]?\d*(?:\.\d+)?)\s*[xX]\s*([+-]\s*\d+(?:\.\d+)?)?\s*=\s*([+-]?\d+(?:\.\d+)?)\s*\??$/i);
 if(linear){
  const aStr=linear[1].replace(/\s/g,''),a=aStr===''||aStr==='+'?1:aStr==='-'?-1:Number(aStr);
  const b=Number((linear[2]||'0').replace(/\s/g,'')),c=Number(linear[3]);
  if(Number.isFinite(a)&&Number.isFinite(b)&&Number.isFinite(c)&&a!==0){
   const x=(c-b)/a;
   if(Number.isFinite(x)&&Math.abs(x)<1e12)return done(
    'Equation: '+a+'x + ('+b+') = '+c+'. Subtract '+b+': '+a+'x = '+(c-b)+'. Divide by '+a+': x = '+Number(x.toFixed(9))+'.',
    'linear-equation');
  }
 }
 const percent=raw.match(/(?:cu[aá]nto es|calcula|what is|quanto [eé])\s+(?:el\s+)?(\d+(?:[.,]\d+)?)\s*%\s*(?:de|of)\s*(\d+(?:[.,]\d+)?)/i);
 if(percent){
  const p=Number(percent[1].replace(',','.')),n=Number(percent[2].replace(',','.')),v=n*p/100;
  if(Number.isFinite(v))return done(p+'% × '+n+' = '+n+' × ('+p+'/100) = '+Number(v.toFixed(8))+'.','percent');
 }
 const gcd=raw.match(/(?:mcd|gcd|mdc)\s*\(?\s*(\d{1,10})\s*[,; ]\s*(\d{1,10})\s*\)?/i);
 if(gcd){
  let a=Number(gcd[1]),b=Number(gcd[2]),steps=[];
  while(b!==0){const r=a%b;steps.push(a+' = '+b+'×'+Math.floor(a/b)+' + '+r);a=b;b=r;}
  return done('Euclid: '+steps.join('; ')+'. GCD = '+a+'.','euclidean-algorithm');
 }
 const prime=raw.match(/(?:es primo|is prime|[eé] primo|素数)\s*(\d{1,9})/i);
 if(prime){
  const n=Number(prime[1]);let d=2;
  while(d*d<=n&&n%d!==0)d++;
  return done(n<2?n+' is not prime.':d*d>n?n+' is prime: no divisor from 2 to √'+n+'.':n+' is not prime: divisible by '+d+'.','prime-test');
 }

 const code=answerCodeRequest(raw,lang)||inspectCodeText(raw,lang);
 if(code)return done(code.text,code.kind,90);
 if(/(?:qu[eé] es|qu[eé] significa|what is|what does)\s+ax\b/i.test(raw))
  return done(loc('AX marks the following choices as the preferred ones within a list.',
   'AX marca los elementos que vienen después como opciones de interés dentro de una lista.',
   'AX destaca os itens seguintes como opções de interesse numa lista.',
   'AXはリストの後続の選択肢を強調する記号だよ。'),'ax-grammar');
 const ax=/^(.{1,150})\s+ax\s+(.{1,150})$/i.exec(raw);
 if(ax){
  const before=ax[1].trim(),after=ax[2].trim();
  return done(loc('Available: ','Disponibles: ','Disponíveis: ','候補: ')+before+', '+after+'. '+
   loc('Marked by AX: ','Marcado por AX: ','Marcado por AX: ','AXで選択: ')+after+'.','ax-selection');
 }

 const m=raw.match(/^(?:(?:what is|calculate|compute|solve|cu[aá]nto es|calcula|quanto [eé])\s*:?\s*)?([0-9+\-*\/().\s]+)\??$/i);
 if(m&&/\d/.test(m[1])&&m[1].length<100){
  const exp=m[1].replace(/\s+/g,''),t=exp.match(/\d+(?:\.\d+)?|[()+*\/-]/g);
  if(t&&t.join('')===exp){
   let i=0;
   function atom(){if(t[i]==='-'){i++;return -atom();}if(t[i]==='+'){i++;return atom();}if(t[i]==='('){i++;const x=sum();if(t[i++]!==')')throw Error('paren');return x;}const n=Number(t[i++]);if(!Number.isFinite(n))throw Error('num');return n;}
   function mult(){let n=atom();while(t[i]==='*'||t[i]==='/'){const op=t[i++],x=atom();if(op==='/'&&x===0)throw Error('zero');n=op==='*'?n*x:n/x;}return n;}
   function sum(){let n=mult();while(t[i]==='+'||t[i]==='-'){const op=t[i++],x=mult();n=op==='+'?n+x:n-x;}return n;}
   try{const n=sum();if(i===t.length&&Number.isFinite(n)&&Math.abs(n)<1e14)return done(loc('Order of operations: ','Orden de operaciones: ','Ordem das operações: ','演算順序: ')+exp+' = '+Number(n.toFixed(9))+'.','arithmetic');}catch(e){if(e.message==='zero')return done(loc('Division by zero is undefined.','Dividir entre cero no está definido.','Divisão por zero não é definida.','0では割れないよ。'),'arithmetic');}
  }
 }
 const seq=l.match(/(?:what comes next|next number|continue the sequence|siguiente n[uú]mero|pr[oó]ximo n[uú]mero)\s*[:?]?\s*(-?\d+(?:\s*[,，]\s*-?\d+){2,8})/i);
 if(seq){const v=seq[1].split(/[,，]/).map(Number),d=v[1]-v[0];if(v.every((n,i)=>i===0||n-v[i-1]===d))return done(loc('Constant difference ','Diferencia constante ','Diferença constante ','差は')+d+'. '+loc('Next: ','Sigue: ','Próximo: ','次: ')+(v.at(-1)+d)+'.','sequence');}
 const cmp=l.match(/(?:which is (?:bigger|larger|greater|smaller)|cu[aá]l es (?:mayor|menor)|qual [eé] (?:maior|menor))\s*[:,]?\s*(-?\d+(?:\.\d+)?)\s*(?:or|o|ou)\s*(-?\d+(?:\.\d+)?)/i);
 if(cmp){const a=+cmp[1],b=+cmp[2],small=/smaller|menor/.test(cmp[0]);return done(a===b?loc('Both are equal.','Son iguales.','São iguais.','同じ値だよ。'):String(small?Math.min(a,b):Math.max(a,b))+(small?' < ':' > ')+(small?Math.max(a,b):Math.min(a,b)),'comparison');}
 const logic=raw.match(/if\s+([^.,!?]{2,70}?)\s*,?\s+then\s+([^.,!?]{2,70})\s*[.]\s*([^.!?]{2,70})\s*[.]\s*(?:what follows|what can you conclude)\s*\??/i);
 if(logic&&logic[1].trim().toLowerCase()===logic[3].trim().toLowerCase())return done('If '+logic[1]+', then '+logic[2]+'. Given '+logic[3]+', we can conclude '+logic[2]+' (modus ponens).','deduction');
 if(/(?:\bcode\b|\bpython\b|\bjavascript\b|\bdebug\b|\bc[oó]digo\b|\berror\b)/i.test(raw)){
  if(/(?:write|generate|create|build|escribe|genera|crea)\s+(?:(?:a|some|un|una)\s+)?(?:code|c[oó]digo|script|program|function)/i.test(raw))return done(loc('I can generate curated examples for hello world, sum and loops in: "+supportedCodeLanguages.join(", ")+". Tell me the language and task.','Puedo crear ejemplos de hola mundo, suma y bucles en: "+supportedCodeLanguages.join(", ")+". Indica lenguaje y tarea.','Posso gerar exemplos de olá mundo, soma e laços. Diga a linguagem e a tarefa.','基本的なコード例を作れるよ。言語と目的を教えてね。'),'code-planned',100);
  if(/syntaxerror|indentationerror/i.test(raw))return done(loc('Check the failing line and the previous line for delimiters and indentation.','Revisa la línea fallida y la anterior: delimitadores y sangría.','Confira a linha e a anterior para erros de sintaxe.','エラー行と直前の行を確認しよう。'),'code-insight',82);
  if(/typeerror/i.test(raw))return done(loc('A TypeError often indicates an unexpected value type.','TypeError suele indicar un tipo inesperado.','TypeError pode indicar um tipo inesperado.','型の不一致かもしれない。'),'code-insight',82);
  if(/explain|what does|que hace|qué hace|explica|o que faz/i.test(raw)){
   const found=[];if(/\b(?:for|while)\b/.test(raw))found.push('loop');if(/\bif\b/.test(raw))found.push('conditional');if(/\breturn\b/.test(raw))found.push('return');if(/\b(?:def|function)\s+\w+/.test(raw))found.push('function');if(/(?:console\.log|print)\s*\(/.test(raw))found.push('output');
   if(found.length)return done(loc('Static code inspection: ','Inspección estática: ','Inspeção estática: ','静的解析: ')+found.join(', ')+'. '+loc('The code was not executed.','No ejecuté el código.','O código não foi executado.','コードは実行していないよ。'),'code-insight',80);
  }
 }
 return null;
}
