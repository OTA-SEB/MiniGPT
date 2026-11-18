// Diccionario local: idiomas y variantes, sin API. El orden coincide con los 100 temas.
import {extraTopics} from './extra-topics.js?v=1.4';
import {worldTopics} from './world-topics.js?v=1.4';
import {worldLocalFacts} from './world-facts-local.js?v=1.4';
export const LANG_NAMES={"es":"Español","en":"English","pt":"Português","ja":"日本語"};
const data=[["arithmetic,addition,subtraction","aritmetica,suma,resta","aritmetica,soma","算数,計算","Arithmetic combines numbers using operations such as addition and subtraction."],["hello,hi,greetings","ola,oi,saudacoes","やあ,こんにちは,こんばんは,おはよう","HEY, BRO! 🤖","OLÁÁ, BRO! 🤖","やっほー！🤖"],["chess,checkmate","xadrez,xeque","チェス,将棋","That knight jumped straight into chaos. ♟️","O cavalo pulou direto para a confusão. ♟️","ナイトが大騒ぎを起こした！♟️"],["minecraft,creeper","minecraft,creeper","マインクラフト,マイクラ,クリーパー","Creeper! There goes the house. 💀","Creeper! Lá se foi a casa. 💀","クリーパー！家が消えた！💀"],["roblox,obby","roblox,obby","ロブロックス,オビー","I fell off the obby again. XDDD","Caí do obby de novo. XDDD","またオビーから落ちた！"],["anime,opening","anime,abertura","アニメ,オープニング","Roll the anime opening! 🔥","Solta a abertura do anime! 🔥","アニメのオープニング、いくぞ！🔥"],["cat,cats,kitty","gato,gatos,gatinho","猫,ねこ,ネコ","The cat has claimed the keyboard. 🐈","O gato dominou o teclado. 🐈","猫がキーボードを占領した！🐈"],["dog,dogs,puppy","cachorro,cachorros,caes,cão","犬,いぬ,イヌ","The puppy wants one more game!","O cachorro quer brincar de novo!","犬がまた遊びたがってる！"],["chicken,hen","galinha,frango","鶏,にわとり,ニワトリ","The chicken rules the coop!","A galinha manda no galinheiro!","ニワトリが小屋の王様だ！"],["duck,ducks,quack","pato,patos,quack","アヒル,あひる","QUACK! The duck demands attention.","QUÁ! O pato quer atenção.","ガーガー！アヒルの出番だ！"],["rust,borrow","rust,emprestimo","ラスト言語,Rust言語","The borrow checker has entered the chat.","O borrow checker entrou na conversa.","借用チェッカーがやってきた！"],["python,indentation","python,indentacao","パイソン,Python言語","Python is great until indentation strikes.","Python é ótimo até a indentação atacar.","Pythonはインデントが命！"],["kotlin,properties","kotlin,propriedades","コトリン","Getters and setters everywhere!","Getters e setters por todo lado!","getterとsetter、便利だね！"],["javascript,js","javascript,js","ジャバスクリプト","JavaScript runs this party.","JavaScript comanda essa festa.","JavaScriptがこのページを動かしてる！"],["godot,gdscript","godot,gdscript","ゴドー,ゴドット","Godot nodes to the rescue!","Os nós do Godot chegaram!","Godotのノードが助けに来た！"],["coding,programming,code","programar,programacao,codigo","プログラミング,コード,開発","The bug is back. Again. 💀","O bug voltou. De novo. 💀","バグがまた帰ってきた！💀"],["discord,cogs","discord,cogs","ディスコード","Discord bot online!","Bot do Discord online!","Discordボット起動！"],["github,git,commit","github,git,commit","ギットハブ,コミット","Commit saved the day!","O commit salvou o dia!","コミットで救われた！"],["computer,pc,processor,graphics,ram,gpu","computador,pc,processador,placa de video,ram,gpu","パソコン,メモリ,グラボ,CPU","That PC could run a galaxy. 💀","Esse PC rodaria uma galáxia. 💀","そのPC、銀河まで動かせそう！💀"],["gta","gta","グラセフ","Five stars already?!","Cinco estrelas já?!","もう手配度５なの？！"],["fortnite","fortnite","フォートナイト","I built a tower and fell off it.","Construí uma torre e caí dela.","建築した瞬間に落ちた！"],["steam,valve","steam,valve","スチーム,Steam","Another sale, another empty wallet.","Mais uma promoção, mais uma carteira vazia.","セールだ！財布が泣いてる！"],["ubisoft,minions","ubisoft,minions","ミニオン","Bananas have entered the game. 🍌","As bananas entraram no jogo. 🍌","バナナの出番だ！🍌"],["nintendo,mario,zelda","nintendo,mario,zelda","任天堂,マリオ,ゼルダ","Another castle, another adventure.","Outro castelo, outra aventura.","また別のお城だ！"],["xbox","xbox","エックスボックス","The controller batteries are gone.","Acabaram as pilhas do controle.","コントローラーの電池が切れた！"],["playstation,ps5","playstation,ps5","プレイステーション,プレステ","Press X to keep playing.","Aperta X para continuar.","×ボタンを押して続行！"],["mojang","mojang","モヤン","Another update, another theory.","Outra atualização, outra teoria.","アップデートでまた大騒ぎ！"],["japanese,nihongo","japones,nihongo","日本語,にほんご","Japanese practice unlocked! 🇯🇵","Hora de praticar japonês! 🇯🇵","日本語の練習、始めよう！🇯🇵"],["japan,tokyo","japao,toquio","日本,東京,とうきょう","Tokyo is calling!","Tóquio está chamando!","東京に行きたいね！"],["english","ingles","英語,えいご","English mode, let's go!","Modo inglês ativado!","英語モードだね！"],["portuguese","portugues","ポルトガル語","Portuguese sounds fun!","Português é bom demais!","ポルトガル語も面白いね！"],["spanish","espanhol","スペイン語","Spanish mode is ready!","Modo espanhol prontinho!","スペイン語モードだ！"],["game design,gameplay mechanics","diseño de juegos,mecanicas","design de jogos","ゲームデザイン","Game design organizes goals, feedback, and rules into an enjoyable experience."],["character design,character creation,character sheet","creacion de personajes,diseño de personajes","criacao de personagens","キャラクターデザイン","Character design makes appearance, motivations, and behavior feel coherent."],["story structure,story arc","estructura narrativa,arco narrativo","estrutura narrativa","物語構成","Story structure connects a beginning, rising conflict, and an ending."],["puzzle design,puzzle mechanics","diseño de puzles,rompecabezas","design de quebra cabeca","パズルデザイン","Puzzle design gives fair clues and allows players to learn from mistakes."],["worldbuilding,fictional worlds","construccion de mundos,universos ficticios","construcao de mundos","世界観設定","Worldbuilding creates consistent rules and culture for a fictional setting."],["color theory,color palette","teoria del color,paleta de colores","teoria das cores","色彩理論","Color theory uses contrast and harmony to communicate meaning."],["concept art,visual reference","arte conceptual,referencia visual","arte conceitual","コンセプトアート","Concept art helps explore ideas before detailed production."],["branching narrative,choice based story","narrativa ramificada,decisiones en historias","narrativa ramificada","分岐ストーリー","A branching narrative changes outcomes based on choices."],["story conflict,story tension","conflicto narrativo,tension dramatica","conflito narrativo","物語の対立","Story conflict gives characters obstacles and meaningful decisions."],["animation production,storyboard","produccion de animacion,guion grafico","producao de animacao","アニメ制作","Animation production moves from storyboards to assets and finished scenes."],["animation,animate","animacao,animar","アニメーション,動画制作","One frame at a time!","Quadro por quadro!","１コマずつ進めよう！"],["youtube,youtuber","youtube,youtuber","ユーチューブ,ユーチューバー","Upload complete, now the thumbnail!","Vídeo enviado, falta a miniatura!","動画投稿完了、次はサムネ！"],["twitch,stream","twitch,live","ツイッチ,配信","Chat, can you hear me?","Chat, vocês me ouvem?","配信の声、聞こえてる？"],["miku,vocaloid","miku,vocaloid","ミク,ボーカロイド,初音ミク","Miku takes the stage! 🎵","Miku entrou no palco! 🎵","ミクがステージに登場！🎵"],["jujutsu,gojo,sukuna,jjk","jujutsu,gojo,sukuna,jjk","呪術廻戦,五条,宿儺","Domain Expansion!","Expansão de Domínio!","領域展開！"],["one piece,luffy","one piece,luffy","ワンピース,ルフィ","The adventure never ends!","A aventura não acaba!","冒険はまだ終わらない！"],["demon slayer,kimetsu","demon slayer,kimetsu","鬼滅の刃,炭治郎","Time for another training arc!","Mais um arco de treinamento!","また修行編が始まる！"],["blue lock,nagi","blue lock,nagi","ブルーロック,凪","That goal deserved a replay!","Esse gol merece replay!","今のゴール、もう一回見たい！"],["ragnarok,shuumatsu","ragnarok,shuumatsu","終末のワルキューレ","Another round begins!","Mais uma rodada começa!","次の勝負が始まる！"],["sweet home","sweet home,doce lar","スイートホーム","Season one was cinema!","A primeira temporada foi cinema!","シーズン１は最高だった！"],["alice in borderland,borderland","alice in borderland,borderland","今際の国のアリス","Another card, another nightmare.","Outra carta, outro pesadelo.","また新しいゲームが始まる！"],["rimuru,tensura","rimuru,tensura","リムル,転スラ","Rimuru unlocked another skill!","Rimuru desbloqueou outra habilidade!","リムルがまたスキルを獲得！"],["godzilla","godzilla","ゴジラ","The city wasn't ready for that roar.","A cidade não esperava esse rugido.","ゴジラの咆哮が響いた！"],["dinosaur,dinosaurs,t-rex","dinossauro,dinossauros,t-rex","恐竜,ティラノサウルス","That's one enormous lizard. 🦖","Que lagartão enorme! 🦖","でっかい恐竜だ！🦖"],["space,galaxy,universe","espaco,galaxia,universo","宇宙,銀河","The galaxy is bigger than this quest.","A galáxia é maior que essa missão.","宇宙は想像以上に広いね。"],["moon,lunar","lua,lunar","月,つき","One small step, bro.","Um pequeno passo, bro.","月でジャンプしてみたい！"],["sun,solar","sol,solar","太陽,たいよう","The Sun doesn't need more brightness.","O Sol não precisa de mais brilho.","太陽はもう十分まぶしい！"],["rain,raining","chuva,chover","雨,あめ","The rain just increased the difficulty.","A chuva aumentou a dificuldade.","雨で難易度が上がった！"],["cold,snow,winter","frio,neve,inverno","寒い,雪,冬","BRRR, time to bundle up!","BRRR, hora de se agasalhar!","寒い！暖かくしよう！"],["heat,summer,hot","calor,verao,quente","暑い,夏","The fan wants a day off.","O ventilador quer folga.","暑すぎ！扇風機も疲れそう。"],["food,burger,hamburger","comida,hamburguer","食べ物,ハンバーガー,料理","Dinner disappeared surprisingly fast.","O jantar sumiu rápido demais.","ご飯があっという間になくなった！"],["pizza","pizza","ピザ","Extra cheese, please! 🍕","Mais queijo, por favor! 🍕","チーズたっぷりのピザ！🍕"],["rice","arroz","米,ご飯,ライス","Rice saves the meal again.","Arroz salvou a refeição de novo.","ご飯はやっぱり最高！"],["water","agua","水,みず","Water break! 💧","Hora de beber água! 💧","水分補給しよう！💧"],["coffee","cafe","コーヒー,珈琲","Coffee hasn't woken up yet.","O café ainda nem acordou.","コーヒーもまだ眠そう！"],["school,class,homework","escola,aula,tarefa","学校,授業,宿題","School starts and sleep disappears.","A escola começa e o sono some.","学校の日は眠いね。"],["math,mathematics,equation","matematica,equacao","数学,数式","The calculator has spoken.","A calculadora deu o veredito.","計算機に聞いてみよう！"],["physics,gravity","fisica,gravidade","物理,重力","Gravity never takes a break.","A gravidade nunca descansa.","重力は休んでくれないね。"],["history,past","historia,passado","歴史,過去","History has some wild plot twists.","A história tem cada reviravolta!","歴史にもすごい展開がある！"],["music,song","musica,cancao","音楽,曲,歌","This deserves a remix! 🎵","Isso merece um remix! 🎵","この曲、リミックスしたい！🎵"],["meme,xd,lol","meme,kkk,rsrs","ミーム,ネタ","That's meme material. XDDD","Isso virou meme. KKKK","これはもうネタだね！"],["decision making,choose options,selection","tomar decisiones,elegir opciones,seleccion","tomada de decisao,escolha","意思決定,選択","Good decision-making compares options against clear criteria."],["otaai,otaai","otaai,otaai","OtaAI","OtaAI is here, bro! 🤖","OtaAI chegou, bro! 🤖","OtaAI参上！🤖"],["chatgpt,gpt","chatgpt,gpt","チャットGPT","A chatbot talking to a chatbot?","Um chatbot falando com outro?","AI同士で会話してるの？"],["error,bug,crash","erro,bug,travar","エラー,バグ","Another bug? Show me the error.","Outro bug? Mostra o erro.","またバグ？エラーを見せて！"],["thanks,thank you","obrigado,obrigada,valeu","ありがとう,どうも","You're welcome, bro!","De nada, bro!","どういたしまして！"],["bye,goodbye,see you","tchau,adeus,ate logo","さようなら,またね,バイバイ","See you, bro!","Até mais, bro!","またね！"],["rain world,slugcat","rain world,slugcat","レインワールド,ナメクジネコ","The ecosystem does not care about your plans. 🌧️","O ecossistema não liga para seus planos. 🌧️","この生態系、容赦ないね！🌧️"],["rivulet","rivulet","リヴレット","Rivulet is speedrunning the flood!","Rivulet corre mais rápido que a enchente!","リヴレット、速すぎる！"],["five pebbles","five pebbles,cinco seixos","ファイブペブルズ,五つの小石","Five Pebbles really needs to calm down.","Five Pebbles precisa se acalmar.","ファイブペブルズ、落ち着いて！"],["looks to the moon","looks to the moon","ルックス・トゥ・ザ・ムーン","Moon deserves a break.","Moon merece um descanso.","ムーンには休んでほしいね。"],["artificer","artificer","アーティフィサー","Artificer doesn't forgive scavengers.","Artificer não perdoa os catadores.","アーティフィサーは許さない！"],["saint","saint","セイント","Saint's tongue is a whole grappling hook.","A língua de Saint é um gancho completo.","セイントの舌、便利すぎ！"],["spearmaster","spearmaster","スピアマスター","Spearmaster never runs out of spears.","Spearmaster nunca fica sem lanças.","スピアマスターは槍が尽きない！"],["gourmand","gourmand","グルマン","Gourmand is a walking boss fight.","Gourmand é um chefe ambulante.","グルマンは歩くボス戦だ！"],["hollow knight","hollow knight","ホロウナイト","Where's the nearest bench?!","Cadê o banco mais próximo?!","ベンチはどこ？！"],["hornet,silksong","hornet,silksong","ホーネット,シルクソング","Hornet's needle is ready!","A agulha de Hornet está pronta!","ホーネットの針、準備完了！"],["celeste,madeline","celeste,madeline","セレステ,マデリン","One more jump. You got this!","Mais um salto. Vai dar certo!","あと一回ジャンプだ！"],["terraria","terraria","テラリア","We were just mining... now there's a boss.","A gente só estava minerando... e veio um chefe.","採掘してたらボスが来た！"],["stardew valley","stardew valley","スターデューバレー","The crops need watering again.","A plantação precisa de água de novo.","畑に水をあげなきゃ！"],["hades","hades","ハデス","One more escape attempt!","Mais uma tentativa de fuga!","もう一回脱出に挑戦！"],["hallownest,knight","hallownest,cavaleiro","ハロウネスト,騎士","Even a tiny knight can change everything.","Até um cavaleiro pequeno muda tudo.","小さな騎士にもできることがある！"],["sleep,sleepy,dream,rest","sono,dormir,sonho,descansar","眠い,睡眠,寝る,夢","Sleep mode is calling. 💤","O modo sono está chamando. 💤","眠いね、おやすみ！💤"],["hungry,hunger,sancocho","fome,sancocho,com fome","お腹すいた,空腹,サンコーチョ","Your stomach asked for a sequel. 💀","O estômago pediu segunda temporada. 💀","お腹が続編を要求してる！💀"],["friend,friends,friendship","amigo,amigos,amizade","友達,友情","A good friend can change the day.","Um amigo pode mudar o dia.","友達って大切だね。"],["ideas,creativity,imagine","ideia,ideias,criatividade,imaginar","アイデア,想像,創造","That idea deserves its own universe.","Essa ideia merece um universo próprio.","そのアイデア、世界を作れそう！"],["battery,energy,power","bateria,energia","バッテリー,電池,エネルギー","Low battery, high hopes!","Pouca bateria, muita esperança!","電池が少ない！"],["robot,robots,robotics","robo,robos,robotica","ロボット,ロボティクス","Beep boop, learning mode on! 🤖","Bip bop, modo aprendizado ligado! 🤖","ピピッ、学習モード起動！🤖"]];
data.push(...extraTopics.map(t=>[t.en,t.pt,t.ja,t.info,t.info,t.info]));
data.push(...worldTopics.map(t=>[t.en,t.pt,t.ja,t.info,t.info,t.info]));
const LATIN={
 es:"yo,tu,el,ella,esta,esto,este,es,una,un,diseno,personajes,personaje,mundos,historia,arte,conceptual,narrativa,hola,buenas,quiero,como,que,porque,cuando,donde,jugar,juego,juegos,con,hablar,sobre,gracias,adios,estoy,tengo,me,gusta,mas,tambien,pero,cuentame,explica,puedes,eres,soy,necesito,significa,aprendiste,recuerdas,sabes,japones,ingles,espanol",
 en:"i,we,you,it,is,am,do,does,have,has,hello,hi,hey,want,how,what,why,when,where,play,playing,games,with,talk,about,thanks,thank,bye,goodbye,like,love,please,tell,can,could,need,the,this,you,your,are,my,have,let,lets",
 pt:"eu,ele,ela,isso,voce,ola,oi,quero,como,porque,quando,onde,jogar,jogos,com,falar,sobre,obrigado,obrigada,tchau,estou,tenho,gosto,gostaria,tambem,mas,voce,voces,meu,minha,fala,conta,preciso,sim,nao,legal,uma,um,que,e,isto,qual,variavel,funcao,programacao,codigo,algoritmo"
};
const common=Object.fromEntries(Object.entries(LATIN).map(([k,v])=>[k,new Set(v.split(","))]));

const topicClues={
 en:new Set("bread buns chess checkmate cat cats kitty dog dogs puppy chicken hen duck ducks quack coding programming computer processor graphics japan japanese english portuguese spanish sun moon rain raining snow winter summer heat food burger rice water coffee school homework math mathematics equation physics gravity past music song sleepy sleep hungry hunger friendship friend friends battery robotics".split(" ")),
 pt:new Set("pao paes xadrez cachorro cachorros caes cao galinha frango dinossauro dinossauros espaco lua chuva chover neve inverno verao quente comida hamburguer escola aula tarefa equacao gravidade cancao quadrinhos amizades amizade sono fome robos".split(" "))
};

const japanese=/[\u3040-\u30ff\u3400-\u9fff]/;
export function normalize(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+\u3040-\u30ff\u3400-\u9fff]+/g," ").normalize("NFC").trim();}
function matches(input,term){
 const n=normalize(input),t=normalize(term);if(!t)return false;
 return (" "+n+" ").includes(" "+t+" ");
}
function phraseMatches(input,term){
 const n=normalize(input),t=normalize(term);if(!t)return [];
 const x=" "+n+" ",needle=" "+t+" ";const at=x.indexOf(needle);
 return at<0?[]:[at];
}
const explicit=[
 [/\b(?:speak|answer|reply|respond) (?:in )?english\b/i,"en"],[/\b(?:speak|answer|reply|respond) (?:in )?spanish\b/i,"es"],
 [/\b(?:speak|answer|reply|respond) (?:in )?portuguese\b/i,"pt"],[/\b(?:speak|answer|reply|respond) (?:in )?japanese\b/i,"ja"],
 [/\b(?:habla|responde|contestame|contesta) (?:en )?ingles\b/i,"en"],[/\b(?:habla|responde|contestame|contesta) (?:en )?espanol\b/i,"es"],
 [/\b(?:habla|responde|contestame|contesta) (?:en )?portugues\b/i,"pt"],[/\b(?:habla|responde|contestame|contesta) (?:en )?japones\b/i,"ja"],
 [/\b(?:fale|responda) (?:em )?ingles\b/i,"en"],[/\b(?:fale|responda) (?:em )?portugues\b/i,"pt"],
 [/日本語で/u,"ja"],[/英語で/u,"en"],[/スペイン語で/u,"es"],[/ポルトガル語で/u,"pt"]
];

// Hepburn -> hiragana, sin redes. Solo las palabras del vocabulario japonés
// activan detección de idioma, para evitar falsos positivos con texto latino.
const J_WORDS=new Set(("konnichiwa konichiwa konbanwa ohayou ohayo arigatou arigato sayonara sayounara hai iie watashi anata kimi boku desu suki daisuki sugoi baka kawaii kakkoii yasashii zurui nande nani demo mou kudasai sumimasen gomen itadakimasu mizu ocha gohan sushi neko inu nihongo nihon tokyo sensei gakusei isha bengoshi hito tabemasu nomimasu hanashimasu wakarimasu genki daijoubu shizuka akuma sekai tomodachi samui atsui tanoshii omoshiroi yatta yoroshiku ganbatte hajimemashite oyasumi").split(" "));
const SPECIAL={konnichiwa:"こんにちは",konichiwa:"こんにちは",konbanwa:"こんばんは",ohayou:"おはよう",ohayo:"おはよう",arigatou:"ありがとう",arigato:"ありがとう",sayonara:"さよなら",sayounara:"さようなら",nihongo:"にほんご",nihon:"にほん",tokyo:"とうきょう",gohan:"ごはん",mizu:"みず",neko:"ねこ",inu:"いぬ",sushi:"すし",ocha:"おちゃ"};
const SYL={shi:"し",chi:"ち",tsu:"つ",fu:"ふ",ji:"じ",sha:"しゃ",shu:"しゅ",sho:"しょ",cha:"ちゃ",chu:"ちゅ",cho:"ちょ",kya:"きゃ",kyu:"きゅ",kyo:"きょ",nya:"にゃ",nyu:"にゅ",nyo:"にょ",rya:"りゃ",ryu:"りゅ",ryo:"りょ",ja:"じゃ",ju:"じゅ",jo:"じょ"};
for(const [r,h] of Object.entries({a:"あ",i:"い",u:"う",e:"え",o:"お",k:"かきくけこ",s:"さしすせそ",t:"たちつてと",n:"なにぬねの",h:"はひふへほ",m:"まみむめも",r:"らりるれろ",g:"がぎぐげご",z:"ざじずぜぞ",d:"だぢづでど",b:"ばびぶべぼ",p:"ぱぴぷぺぽ"})){
 if(h.length===5)for(let j=0;j<5;j++)SYL[r+"aiueo"[j]]=h[j];
 else SYL[r]=h;
}
Object.assign(SYL,{ya:"や",yu:"ゆ",yo:"よ",wa:"わ",wo:"を",si:"し",ti:"ち",tu:"つ",hu:"ふ",zi:"じ",fa:"ふぁ",fi:"ふぃ",fe:"ふぇ",fo:"ふぉ"});
export function romajiToKana(input){
 const w=normalize(input).replace(/ /g,"");
 if(SPECIAL[w])return SPECIAL[w];
 if(!/^[a-z]+$/.test(w))return "";
 let result="";
 for(let i=0;i<w.length;){
  if(w[i]==="n"&&(!w[i+1]||w[i+1]==="n"||!"aiueoy".includes(w[i+1]))){result+="ん";i++;continue;}
  if(w[i]===w[i+1]&&/[bcdfghjklmpqrstvwxyz]/.test(w[i])&&w[i]!=="n"){result+="っ";i++;continue;}
  let found=false;
  for(const len of [3,2,1])if(SYL[w.slice(i,i+len)]){result+=SYL[w.slice(i,i+len)];i+=len;found=true;break;}
  if(!found)return "";
 }
 return result;
}
export function isRomaji(w){return J_WORDS.has(normalize(w));}
const kata=k=>k.replace(/[\u3041-\u3096]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));

export function detectLanguage(input,previous="es"){
 const norm=normalize(input);
 const words=norm.split(" ").filter(Boolean);
 const score={es:0,en:0,pt:0,ja:0},clues=[];
 // The current message matters more than browser language or earlier turns.
 for(const word of words){
   // Shared words like "que" or "como" alone are not evidence for both languages.
   const unique=["es","en","pt"].filter(lang=>common[lang].has(word));
   if(unique.length===1){
     const lang=unique[0];
     score[lang]+=word==="significa"?5:2;
     clues.push({lang,word});
   }
   if(japanese.test(word)){score.ja+=4;clues.push({lang:"ja",word});}
   else if(isRomaji(word)){score.ja+=5;clues.push({lang:"ja",word});}
 }
 const original=String(input||"").toLowerCase();
 for(const [pattern,lang] of explicit){
   if(pattern.test(normalize(original))){score[lang]+=12;clues.push({lang,word:"explicit"});}
 }
 // Distinct topic words reveal language even inside code-switching sentences.
 for(const word of words)for(const lang of ["en","pt"])if(topicClues[lang].has(word)){
   score[lang]+=2;clues.push({lang,word});
 }
 // English is the default technical language, with explicit ES/PT/JA cues overriding it.
 if(extraTopics.some(t=>t.en===norm))score.en+=5;
 if(extraTopics.some(t=>t.es!==t.en&&normalize(t.es)===norm))score.es+=6;
 if(extraTopics.some(t=>t.pt!==t.en&&normalize(t.pt)===norm))score.pt+=6;
 if(extraTopics.some(t=>t.ja!==t.en&&normalize(t.ja)===norm))score.ja+=6;
 const ranking=Object.entries(score).sort((a,b)=>b[1]-a[1]);
 const best=ranking[0], prior=LANG_NAMES[previous]?previous:"es";
 const primary=best[1]>0? (best[1]===ranking[1][1] && score[prior]===best[1]?prior:best[0]) : prior;
 // Report secondary languages only when they have meaningful text cues.
 const languages=ranking.filter(([,n])=>n>=2).map(([k])=>k);
 return {primary,languages:languages.length?languages:[primary],mixed:languages.length>1,scores:score,clues};
}
export function aliasForTopic(index,lang){
 const row=data[index];if(!row)return [];
 const col=lang==="en"?0:lang==="pt"?1:lang==="ja"?2:-1;
 return col<0?[]:row[col].split(",").map(normalize).filter(Boolean);
}
export function topicPhrase(index,lang){
 const row=data[index],col=lang==="en"?0:lang==="pt"?1:lang==="ja"?2:-1;
 return col<0?null:row?.[col]?.split(",")[0]||null;
}
export function topicText(index,lang,variant=0){
 const row=data[index];if(!row)return null;
 if(index>=200){
  const t=worldTopics[index-200];if(!t)return null;
  if(lang==='en')return t.info;
  return worldLocalFacts[index-200]?.[lang]||t.info;
 }
 if(lang==="es")return null;
 if(index>=100){
  const t=extraTopics[index-100];
  if(lang==="en")return [t.info,t.info+" A useful follow-up is to ask about an example.",t.info+" Think about when this concept is needed.",t.info+" Compare it with a related approach.",t.info+" Its tradeoffs matter in practice."][variant%5];
  if(lang==="pt")return ["Conceito: "+t.pt+". "+t.info,"Em programação, "+t.pt+" é um tema útil. "+t.info][variant%2];
  return [t.ja+"について: "+t.info,t.ja+"はプログラミングの大切な概念だよ。"][variant%2];
 }
 const j=lang==="en"?3:lang==="pt"?4:5;
 const name=topicPhrase(index,lang)||"";
 if(lang==="en")return [
 row[j], "Bro, "+name+" is back in the conversation. XDDD",
 "I could talk about "+name+" all day.",
 "Okay, "+name+" just made this chat more interesting!",
 "Another day, another unexpected adventure with "+name+"!"
 ][variant%5];
 if(lang==="pt")return [
 row[j],"Bro, "+name+" voltou para a conversa. KKKK",
 "Dá para conversar sobre "+name+" por horas.",
 "Eita, "+name+" deixou essa conversa ainda melhor!",
 "Mais um dia, mais uma aventura inesperada com "+name+"!"
 ][variant%5];
 return [
 row[j], "また"+name+"の話だね！XDDD",
 name+"なら、まだまだ話せるよ！",
 "おっ、"+name+"で盛り上がってきた！",
 "今日も"+name+"で新しい冒険が始まったね！"
 ][variant%5];
}
export const localText={
 es:{unknown:"No puedo responder ahora mismo.",mix:(a,b,others)=>a+" se cruza con "+b+(others.length?", junto a "+others.join(", "):"")+".",reset:"¡Charla reiniciada! 🤖",placeholder:"Escríbeme, bro...",status:"⚙️ Mini modelo local"},
 en:{unknown:"I can't answer that right now.",mix:(a,b,others)=>a+" meets "+b+(others.length?", with "+others.join(", "):"")+".",reset:"Chat restarted! 🤖",placeholder:"Message me, bro...",status:"⚙️ Local mini-model"},
 pt:{unknown:"Não consigo responder isso agora.",mix:(a,b,others)=>a+" encontra "+b+(others.length?", junto com "+others.join(", "):"")+".",reset:"Conversa reiniciada! 🤖",placeholder:"Manda mensagem, bro...",status:"⚙️ Minimodelo local"},
 ja:{unknown:"今はそれに答えられないよ。",mix:(a,b,others)=>a+"と"+b+(others.length?"、それに"+others.join("と"):"")+"が出会った！",reset:"チャットをリセットしたよ！🤖",placeholder:"メッセージを書いてね...",status:"⚙️ ローカルミニモデル"}
};
export function matchAliases(input,language,originalRows){
 const normalized=" "+normalize(input)+" ";
 const romajiTerms=[];
 let start=0;
 for(const word of normalize(input).split(" ")){
   if(isRomaji(word)){const hira=romajiToKana(word);if(hira)romajiTerms.push({hira,kata:kata(hira),at:start+1});}
   start+=word.length+1;
 }
 const found=[];
 for(let i=0;i<originalRows.length;i++){
   const terms=[];
   for(const term of originalRows[i][0].split(","))terms.push({term:normalize(term),lang:null});
   for(const lang of ["en","pt","ja"])for(const term of aliasForTopic(i,lang))terms.push({term,lang});
   let best=null;
   for(const x of terms){
     if(!x.term)continue;
     const at=japanese.test(x.term)?normalized.indexOf(x.term):normalized.indexOf(" "+x.term+" ");
     if(at<0)continue;
     // Prefer language-tagged terms for direct translations, but neutral names
     // (e.g. Minecraft) use surrounding language.
     if(!best||at<best.at||(at===best.at && x.lang && !best.lang))best={id:i,at,lang:x.lang,term:x.term};
   }
   for(const rom of romajiTerms){
     if(aliasForTopic(i,"ja").some(a=>a===rom.hira||a===rom.kata)){
       if(!best||rom.at<best.at||(rom.at===best.at&&!best.lang))best={id:i,at:rom.at,lang:"ja",term:rom.hira};
     }
   }
   if(best)found.push(best);
 }
 found.sort((a,b)=>a.at-b.at||a.id-b.id);
 // Prefer specific game/character titles over overlapping generic words.
 const whole=normalize(input);
 if(whole.includes("rain world")||whole.includes("レインワールド")){
   if(found.some(x=>x.id===79)){const n=found.findIndex(x=>x.id===59);if(n>=0)found.splice(n,1);}
 }
 if(whole.includes("looks to the moon")||whole.includes("ルックス トゥ ザ ムーン")){
   if(found.some(x=>x.id===82)){const n=found.findIndex(x=>x.id===57);if(n>=0)found.splice(n,1);}
 }
 const context=detectLanguage(input,language);
 const cues=[];
 const words=normalize(input).split(" ");
 // Work out language at each token boundary for code-switching.
 let offset=0;
 for(const word of words){
   if(!word){offset++;continue;}
   for(const lang of ["es","en","pt"])if(common[lang].has(word))cues.push({lang,at:offset});
   if(japanese.test(word)||isRomaji(word))cues.push({lang:"ja",at:offset});
   offset+=word.length+1;
 }
 const explicitLanguage=(x)=>{
   if(!x.lang)return null;
   // Proper names common to several languages cannot identify a language by themselves.
   const normInput=" "+normalize(input)+" ";
   if(romajiTerms.some(t=>t.at===x.at&&x.lang==="ja"))return "ja";
   const overlaps=["en","pt","ja"].filter(l=>aliasForTopic(x.id,l).some(t=>japanese.test(t)?normInput.includes(t):normInput.includes(" "+t+" ")));
   const isSpanishAlias=originalRows[x.id][0].split(",").some(t=>normalize(t)===x.term);
   // "gato" is Spanish and Portuguese; "chess" is distinctly English.
   if(isSpanishAlias && x.lang!=="ja" && !topicClues[x.lang]?.has(x.term))return null;
   return overlaps.length===1?x.lang:null;
 };
 return found.slice(0,5).map(x=>{
   let lang=explicitLanguage(x);
   if(!lang){
     const nearest=cues.slice().sort((a,b)=>Math.abs(a.at-x.at)-Math.abs(b.at-x.at))[0];
     lang=nearest?.lang||context.primary;
   }
   return {...x,lang};
 });
}
