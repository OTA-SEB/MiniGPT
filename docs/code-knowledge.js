// OtaAI: curated programming demonstrations, not a general-purpose code LLM.
const samples={
 python:['print("¡Hola, mundo!")','def sumar(a, b):\n    return a + b\nprint(sumar(2, 3))','for i in range(5):\n    print(i)'],
 cpp:['#include <iostream>\nint main() { std::cout << "¡Hola, mundo!\\n"; }','#include <iostream>\nint sumar(int a,int b){return a+b;}\nint main(){std::cout<<sumar(2,3);}','#include <iostream>\nint main(){for(int i=0;i<5;i++)std::cout<<i<<"\\n";}'],
 rust:['fn main(){println!("¡Hola, mundo!");}','fn sumar(a:i32,b:i32)->i32{a+b}\nfn main(){println!("{}",sumar(2,3));}','fn main(){for i in 0..5{println!("{i}");}}'],
 kotlin:['fun main(){println("¡Hola, mundo!")}','fun sumar(a:Int,b:Int)=a+b\nfun main(){println(sumar(2,3))}','fun main(){for(i in 0 until 5)println(i)}'],
 csharp:['using System;\nConsole.WriteLine("¡Hola, mundo!");','using System;\nint Sumar(int a,int b)=>a+b;\nConsole.WriteLine(Sumar(2,3));','using System;\nfor(int i=0;i<5;i++)Console.WriteLine(i);'],
 javascript:['console.log("¡Hola, mundo!");','function sumar(a,b){return a+b;}\nconsole.log(sumar(2,3));','for(let i=0;i<5;i++)console.log(i);'],
 typescript:['console.log("¡Hola, mundo!");','function sumar(a:number,b:number):number{return a+b;}\nconsole.log(sumar(2,3));','for(let i:number=0;i<5;i++)console.log(i);'],
 java:['public class Main{public static void main(String[]a){System.out.println("¡Hola, mundo!");}}','public class Main{static int sumar(int a,int b){return a+b;}public static void main(String[]x){System.out.println(sumar(2,3));}}','public class Main{public static void main(String[]a){for(int i=0;i<5;i++)System.out.println(i);}}'],
 go:['package main\nimport "fmt"\nfunc main(){fmt.Println("¡Hola, mundo!")}','package main\nimport "fmt"\nfunc sumar(a,b int)int{return a+b}\nfunc main(){fmt.Println(sumar(2,3))}','package main\nimport "fmt"\nfunc main(){for i:=0;i<5;i++{fmt.Println(i)}}'],
 swift:['print("¡Hola, mundo!")','func sumar(_ a:Int,_ b:Int)->Int{return a+b}\nprint(sumar(2,3))','for i in 0..<5{print(i)}'],
 ruby:['puts "¡Hola, mundo!"','def sumar(a,b)\n  a+b\nend\nputs sumar(2,3)','5.times do |i|\n  puts i\nend'],
 lua:['print("¡Hola, mundo!")','local function sumar(a,b)\n return a+b\nend\nprint(sumar(2,3))','for i=0,4 do\n print(i)\nend'],
 php:['<?php echo "¡Hola, mundo!";','<?php function sumar($a,$b){return $a+$b;} echo sumar(2,3);','<?php for($i=0;$i<5;$i++)echo $i;'],
 bash:['echo "¡Hola, mundo!"','echo $((2+3))','for i in 0 1 2 3 4; do echo "$i"; done'],
 sql:["SELECT '¡Hola, mundo!' AS saludo;","SELECT 2+3 AS suma;","SELECT value FROM (VALUES (0),(1),(2),(3),(4)) AS nums(value);"],
 html:['<!doctype html><html lang="es"><body><h1>¡Hola, mundo!</h1></body></html>','<p>2 + 3 = 5</p>','<ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li></ul>'],
 css:['h1{color:crimson;font-size:2rem}','.box{width:calc(2rem + 3rem)}','.item:nth-child(odd){background:#eee}']
};
const aliases={'python':'python','py':'python','c++':'cpp','cpp':'cpp','rust':'rust',
 'kotlin':'kotlin','c#':'csharp','csharp':'csharp','c sharp':'csharp',
 'javascript':'javascript','js':'javascript','typescript':'typescript','ts':'typescript',
 'java':'java','go':'go','golang':'go','swift':'swift','ruby':'ruby','lua':'lua',
 'php':'php','bash':'bash','shell':'bash','sql':'sql','html':'html','css':'css'};
const display={python:'Python',cpp:'C++',rust:'Rust',kotlin:'Kotlin',csharp:'C#',
 javascript:'JavaScript',typescript:'TypeScript',java:'Java',go:'Go',swift:'Swift',ruby:'Ruby',lua:'Lua',
 php:'PHP',bash:'Bash',sql:'SQL',html:'HTML',css:'CSS'};
export function codeLanguage(text){
 const raw=' '+String(text||'').toLowerCase()+' ';
 for(const name of Object.keys(aliases).sort((a,b)=>b.length-a.length)){
  const re=new RegExp('(^|[^a-z0-9+#])'+name.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&')+'(?=$|[^a-z0-9+#])');
  if(re.test(raw))return aliases[name];
 }
 return null;
}
export function answerCodeRequest(input,language='es'){
 const raw=String(input||'');if(raw.length>1200)return null;
 if(!/(?:escribe|genera|crea|haz|muestra|muéstrame|enséñame|write|generate|create|show|escreva|crie|作って|書いて)/i.test(raw))return null;
 const lang=codeLanguage(raw);if(!lang||!samples[lang])return null;
 let index=-1,kind='';
 if(/(?:hola mundo|hello world|ol[aá] mundo|こんにちは世界)/i.test(raw)){index=0;kind='hello';}
 else if(/(?:sumar|suma|adici[oó]n|sum two|add two|somar|soma|足し算)/i.test(raw)){index=1;kind='sum';}
 else if(/(?:bucle|ciclo|iterar|repetir|loop|for loop|la[cç]o|繰り返し)/i.test(raw)){index=2;kind='loop';}
 if(index<0)return null;
 const fence=String.fromCharCode(96).repeat(3);
 const intro={es:'Ejemplo de ',en:'Example in ',pt:'Exemplo em ',ja:'コード例: '}[language]||'Example in ';
 return {text:intro+display[lang]+':\n\n'+fence+lang+'\n'+samples[lang][index]+'\n'+fence,
  kind:'code-template',language:lang};
}
export function inspectCodeText(raw,lang='es'){
 const value=String(raw||'');if(value.length>5000)return null;
 const fenced=/\x60{3}([a-zA-Z0-9+#-]{1,20})\n([\s\S]+?)\n\x60{3}/.exec(value);
 const ota=/<code\s*=\s*["']?([\w+#.-]+)["']?\s*>([\s\S]+?)<\/code>/i.exec(value);
 const code=fenced?.[2]||ota?.[2],language=codeLanguage(fenced?.[1]||ota?.[1])||'text';
 if(!code||!/(?:explica|analiza|revisa|explain|analy[sz]e|review|説明)/i.test(value.replace(code,'')))return null;
 const clues=[];
 if(/\bfor\b|\bwhile\b/.test(code))clues.push('loops');
 if(/\bif\b|\belse\b|\bwhen\b|\bmatch\b/.test(code))clues.push('conditionals');
 if(/\b(?:def|fn|fun|function|func)\b/.test(code))clues.push('functions');
 if(/\breturn\b/.test(code))clues.push('return values');
 if(/\b(?:print|println|console\.log|cout|WriteLine)\b/.test(code))clues.push('output');
 if(/\b(?:class|struct|interface)\b/.test(code))clues.push('types/classes');
 const intro={es:'Inspección estática',en:'Static inspection',pt:'Inspeção estática',ja:'静的解析'}[lang]||'Static inspection';
 const noRun={es:'No ejecuté el código.',en:'Code was not run.',pt:'Não executei o código.',ja:'コードは実行していません。'}[lang]||'Code was not run.';
 return {text:intro+' ('+(display[language]||language)+'): '+(clues.join(', ')||'no recognized constructs')+'. '+noRun,kind:'static-code'};
}
export const supportedCodeLanguages=Object.values(display);
