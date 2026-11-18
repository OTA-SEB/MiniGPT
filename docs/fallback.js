// Cien conversaciones temáticas, cuatro respuestas por cada tema.
import { detectLanguage,matchAliases,topicText,topicPhrase,localText } from './i18n.js';
const rows=[
["panes,1+1,pan","dos panes","partirse en cuatro mitades","1+1=2 panes, pero al partirlos quedan cuatro mitades. 🍞|¡EL TEOREMA DEL PAN! XDDD|Dos panes enteros o cuatro mitades, bro.|Dos panes y una lógica impecable."],
["hola,holi,buenas,hey","MiniGPT","saludar","¡HOLAAAA, BROOO! 🤖|¡Buenas! ¿Qué hacemos hoy?|¡MiniGPT reportándose!|Saludo recibido, conversación activada."],
["ajedrez,chess,jaque","un caballo de ajedrez","dar jaque mate","¡PEÓN E4! ♟️|Mi Elo es 404.|El caballo se mueve en L.|El caballo tiene más rutas de escape que yo."],
["minecraft,creeper","un creeper","construir una casa","¡CREEPER! 💀|Pico de diamante equipado.|Otra casa de tierra.|Ese creeper vino a redecorar la base."],
["roblox,obby","un noob","superar un obby","¡NOOB!|Me caí del mapa.|Luau al rescate.|El obby decía fácil y estaba mintiendo."],
["anime","un protagonista de anime","transformarse","¡SUENA EL OPENING!|El poder del guion.|¡ANIMEEEE!|Ese opening merece otra temporada."],
["gato,gatos,michi","un gato","tirar cosas de una mesa","MIAU. 🐈|El gato ocupó el teclado.|Los michis gobiernan Internet.|El michi ya ocupó el teclado."],
["perro,perros,perrito","un perro","perseguir una pelota","¡GUAU!|El perro pide galletas.|Buen perrito.|La pelota volvió, la energía no."],
["gallina,gallinas,pollo","una gallina","conquistar el corral","¡COCOROCÓ!|Dinosaurio moderno.|¡La gallina manda!|La gallina se declaró reina del corral."],
["pato,patos,cuac","un pato","nadar en un lago","¡CUAC!|El pato exige pan.|Pato supremo.|¡Cuac diplomático!"],
["rust","el compilador de Rust","pedir una variable prestada","Borrow checker activado.|¡OWNERSHIP!|Rust exige seguridad.|El compilador protege hasta el último préstamo."],
["python","una serpiente programadora","escribir código","print('bro')|IndentationError. 💀|Python es genial.|La indentación hoy quiere pelea."],
["kotlin","una propiedad de Kotlin","usar get y set","¡GET Y SET!|Kotlin es elegante.|La JVM saluda.|Una propiedad con get y set: elegante."],
["javascript,js","una función JavaScript","crear una interfaz","¡SOY JAVASCRIPT!|console.log('bro')|Los botones viven aquí.|JavaScript vive en todas las pestañas."],
["gdscript,godot","un nodo de Godot","crear un videojuego","extends Node|¡SEÑAL CONECTADA!|Escenas dentro de escenas.|Un nodo más y ya parece videojuego."],
["programar,programacion,codigo,código","un programador","corregir un bug","¡ERROR 404!|Compiló a la primera. Milagro.|Apareció otro bug.|Apareció otro bug con nombre y apellido."],
["discord,cogs","un bot de Discord","ejecutar un comando","/hola|¡COG CARGADO!|Bot conectado.|Un bot sin permisos es solo decoración."],
["github,git","un repositorio","hacer un commit","git commit -m 'bro'|Conflicto de merge.|¡Push completado!|El commit salvó la tarde."],
["pc,ram,gpu,procesador,computadora,computador","una PC de 1 TB de RAM","ejecutar mil juegos","¡ESA PC ME EJECUTA A MÍ!|64 GB de VRAM. 💀|Ventiladores al máximo.|Esa PC podría simular otra PC entera."],
["gta","un conductor de GTA","seguir una misión","¡CINCO ESTRELLAS!|Choqué contra un poste.|GTA es una locura.|Otra misión arruinada por aparcar."],
["fortnite","un jugador de Fortnite","construir una torre","¡VICTORIA MAGISTRAL!|Construcción intensiva.|Mi puntería es terrible.|Construí una torre para caerme igual."],
["steam,valve","una biblioteca de Steam","aplicar un descuento","¡REBAJAS!|Mi cartera llora.|Otro juego más.|La biblioteca creció, el tiempo libre no."],
["ubisoft,minions","un Minion","crear un juego","¡MINIONS! 🍌|Prueba de humanidad superada.|¿Ubisoft? Solo conozco Minions.|Los Minions siguen buscando bananas."],
["nintendo,mario,zelda","Mario","rescatar a la princesa","It's-a me!|Otro castillo.|Nintendo ha llegado.|La princesa sigue en otro castillo."],
["xbox","una Xbox","emular una consola","¡XBOX!|Emulación infinita.|Se gastaron las pilas.|El mando se descargó en el peor momento."],
["playstation,ps5","una PlayStation","leer un disco","¡PULSA X!|Nave espacial PS5.|¿Y el disco?|La consola despegó antes del juego."],
["mojang","un desarrollador de Mojang","añadir una cama","¡OTRA CAMA!|Vacas que parpadean.|Hora de dormir.|Otra actualización, veinte teorías."],
["japones,nihongo,baka,こんにちは","un estudiante de japonés","hablar japonés","こんにちは！|日本語はおもしろい！|BAKA JANAI YO!|日本語, un paso a la vez."],
["japon,tokio,tokyo","un viajero","visitar Tokio","¡JAPÓN! 🇯🇵|Hora de explorar Tokio.|¿Dónde está el tren?|Tokio tiene demasiadas cosas por explorar."],
["ingles,english","un estudiante de inglés","practicar inglés","Hello, bro!|English mode.|Una palabra nueva.|Una palabra nueva cada día."],
["portugues,portugués","un estudiante de portugués","hablar portugués","Olá, bro!|Tudo bem?|Português desbloqueado.|Portugués desbloqueado, bro."],
["espanol,español","un narrador","hablar español","¡Qué más, bro!|Modo español activado.|El idioma del XDDD.|La charla sobrevivió al autocorrector."],
["ota,broken threads,hilos rotos","un personaje de Broken Threads","escribir una historia","¡BROKEN THREADS!|OTA entra en escena.|¡Esto merece un webtoon!|Una escena puede cambiar todos los hilos."],
["pipe,felipe","Pipe de Broken Threads","protagonizar una escena","¡Pipe entra en escena!|Hay historia por contar.|Momento narrativo desbloqueado.|Pipe todavía tiene historia por contar."],
["toa,tamatoa","Toa","aparecer en una historia","Toa acaba de llegar.|Esto se pone intenso.|Otro momento de lore.|Toa siempre encuentra el caos."],
["rob","Rob de Broken Threads","enfrentar un problema","Rob está listo.|Escena de personaje activada.|¡Que comience el capítulo!|Rob guarda una sorpresa."],
["zoe","Zoe de Broken Threads","unirse a una aventura","Zoe aparece.|El elenco sigue creciendo.|Nuevos hilos de historia.|Zoe entra y todo cambia."],
["eri,amaya","Eri de Broken Threads","descubrir una pista","Eri aparece en el relato.|¡Una nueva pista!|El misterio continúa.|Eri acaba de notar un detalle."],
["nico","Nico de Broken Threads","cambiar la trama","Nico tiene algo que decir.|Giro de guion.|No te saltes este capítulo.|Nico trae un giro narrativo."],
["anto,kira","Anto de Broken Threads","sumarse al equipo","Anto aparece.|La historia avanza.|Tenemos más elenco.|Anto apareció justo a tiempo."],
["glitcher","Glitcher","crear problemas","¡GLITCHER HA ENTRADO!|Eso no suena bien.|Se viene conflicto de lore.|Glitcher no necesitaba una invitación."],
["webtoon,comic,cómic","un artista","dibujar una viñeta","¡VIÑETA NUEVA!|Un panel más...|La historia toma forma.|Esa viñeta merece un zoom."],
["animacion,animación,animar","un animador","crear una escena","¡FOTOGRAMA A FOTOGRAMA!|Necesita un opening.|La animación quedó épica.|Cada fotograma fue una pequeña batalla."],
["youtube,youtuber","un creador","subir un video","¡LIKE Y SUSCRÍBETE!|Miniatura lista.|Se viene video nuevo.|Una miniatura puede tener mucho lore."],
["twitch,stream","un streamer","transmitir en vivo","¡STREAM ACTIVADO!|Hola, chat.|El micrófono estaba apagado.|El micrófono estaba silenciado, otra vez."],
["miku,vocaloid","Hatsune Miku","subirse al escenario","¡MIKU!|El concierto empieza.|Luces y música.|Miku y las luces: concierto activado."],
["jujutsu,gojo,sukuna,jjk","un hechicero","abrir un dominio","¡EXPANSIÓN DE DOMINIO!|Energía maldita al máximo.|¿Quién escribió el guion?|Un dominio y desapareció el presupuesto."],
["one piece,luffy","un pirata","buscar el tesoro","¡NAKAMA!|El viaje continúa.|Otro arco gigantesco.|El tesoro puede esperar, la aventura no."],
["demon slayer,kimetsu","un cazador de demonios","entrenar","Respiración de... ¡BRO!|¡Animación espectacular!|El entrenamiento continúa.|El entrenamiento tiene precio."],
["blue lock,nagi","un delantero","marcar un gol","¡GOLAZOOOO! ⚽|El ego despertó.|Balón a portería.|Ese gol necesitó cámara lenta."],
["ragnarok,shuumatsu","un combatiente","entrar en la arena","¡COMIENZA LA RONDA!|Esto parece cine.|¡Vaya duelo!|La arena estaba esperando ese duelo."],
["sweet home,dulce hogar","un personaje de Sweet Home","resolver un misterio","Temporada uno: ¡cine!|¡SUENA EL TEMA!|Eso da para una teoría.|El primer episodio ya dejó preguntas."],
["alice in borderland,borderland","un jugador de ficción","resolver un acertijo","¡CARTA REVELADA!|Este misterio se complica.|¿Cuál es la regla?|Otra carta, otro juego inesperado."],
["rimuru,tensura","Rimuru","usar su habilidad","¡RIMURU!|Otra habilidad desbloqueada.|Ese slime está a otro nivel.|El slime sumó otra habilidad."],
["godzilla","Godzilla","atravesar la ciudad","¡ROOOAR!|Kaiju detectado.|Las ventanas temblaron.|El kaiju no cabe en el encuadre."],
["dinosaurio,tiranosaurio,t-rex","un dinosaurio","rugir","¡RAAAWR! 🦖|Dinosaurio del día.|Jurásico activado.|El rugido se oyó hasta el otro mapa."],
["espacio,galaxia,universo","un astronauta","explorar una galaxia","¡AL INFINITO!|Hay estrellas por todas partes.|¿Dónde quedó la nave?|El universo tiene más niveles que un juego."],
["luna","un astronauta lunar","saltar sobre la Luna","Un pequeño salto para MiniGPT.|Gravedad bajita.|La Luna está preciosa.|La Luna no acepta devoluciones."],
["sol,solar","el Sol","iluminar la Tierra","¡BRILLANTE! ☀️|Estrella principal en acción.|Hora de buscar sombra.|El Sol lleva millones de años encendido."],
["lluvia,llover","una nube","soltar lluvia","¡PLOP PLOP! ☔|Día de lluvia.|El paraguas es el héroe.|Una gota inició la tormenta."],
["frio,frío,nieve","un muñeco de nieve","resistir el invierno","¡BRRR! ❄️|Hora de abrigarse.|Copitos por todas partes.|El frío subió la dificultad."],
["calor,verano","un ventilador","enfriar la habitación","¡QUÉ CALOR!|Ventilador al 100 %.|Necesito limonada.|El ventilador también necesita descansar."],
["comida,hamburguesa","un cocinero","preparar una cena","¡A COMEEEER! 🍔|Chef MiniGPT presenta...|Eso huele genial.|Esa cena desapareció demasiado rápido."],
["pizza","una pizza","salir del horno","¡PIZZAAAA! 🍕|Extra de queso.|Una porción más.|Una porción más y listo."],
["arroz","un grano de arroz","acompañar el almuerzo","Arroz con todo.|Menú desbloqueado.|¡Buen provecho!|El arroz siempre llega al rescate."],
["agua,mizu","una gota de agua","caer en un vaso","¡MIZU! 💧|Hidratación activada.|Una gota aventurera.|El agua también merece protagonismo."],
["cafe,café","una taza de café","despertar a alguien","¡CAFECITOOO!|Huele a mañana.|Una taza ocupada.|El café aún no quiere despertar."],
["colegio,escuela,clase","un estudiante","hacer un proyecto","¡RECREO!|¿Había tarea?|Modo estudiante.|El recreo fue demasiado corto."],
["matematicas,matemáticas,ecuacion","una calculadora","resolver una ecuación","¡OPERACIÓN COMPLETADA!|Eso se ve matemático.|¿Comprobamos?|La calculadora tuvo la última palabra."],
["fisica,física,gravedad","un físico","explicar la gravedad","¡NEWTON APARECIÓ!|La gravedad sigue trabajando.|Experimento mental activado.|La gravedad no negocia."],
["historia,pasado","un historiador","abrir un libro","Érase una vez...|Dato histórico desbloqueado.|El pasado tiene lore.|El pasado tiene mejor lore del esperado."],
["musica,música,cancion,canción","un músico","componer un tema","¡SUENA EL BEAT! 🎵|Merece un remix.|¿Dónde está el estribillo?|Esa melodía merece un remix."],
["meme,xddd,xd","un meme","hacerse viral","XDDDDDD 💀|Eso es material de meme.|El humor al máximo.|Nuevo meme añadido al inventario."],
["ax","el operador ax","elegir opciones","¡AX DETECTADO!|Tu palabra tiene estilo.|Ax merece su propio operador.|Ax sirve para escoger lo que sigue."],
["minigpt,mini gpt","MiniGPT","hablar de sí mismo","¡SOY MINIGPT! 🤖|Mi cerebro automático funciona.|Listo para charlar.|MiniGPT encendió sus neuronas virtuales."],
["chatgpt,gpt","ChatGPT","conversar con MiniGPT","¡UN GPT DENTRO DE OTRO!|Meta-conversación activada.|Esto es IA-cepción.|GPT al cuadrado, problemas al cubo."],
["error,bug,crash","un depurador","encontrar un fallo","¡ERROR DETECTADO!|Revisemos la consola.|Una pista: el mensaje de error.|El error regresó con refuerzos."],
["gracias,thanks","MiniGPT","agradecer","¡DE NADAAAA, BRO!|Para eso estamos.|¡Con gusto! XDDD|Gracias recibido, bro."],
["adios,adiós,chao,bye","MiniGPT","despedirse","¡CHAO, BROOO!|¡Hasta la próxima!|さようなら！|Hasta luego; que descansen los bits."],
["rain world,slugcat","un slugcat","esquivar un lagarto","¡RAIN WORLD! 🌧️|La lluvia no espera a nadie.|Un lagarto acaba de encontrar tu escondite.|El ecosistema tiene sus propias reglas."],
["rivulet","Rivulet","nadar por los túneles","¡RIVULET A TODA VELOCIDAD!|Esa campaña es pura adrenalina.|El agua no detiene a Rivulet.|Hay que llevar esa célula."],
["five pebbles,cinco guijarros","Five Pebbles","resolver un problema","El iterador anda complicado.|Cinco Guijarros necesita silencio.|Cada cálculo tuvo consecuencias.|Ese cerebro gigante también se equivoca."],
["looks to the moon,moon","Looks to the Moon","recuperar energía","Moon merece un descanso.|La célula finalmente tiene un destino.|Un pequeño gesto puede cambiar mucho.|Looks to the Moon todavía tiene esperanza."],
["artificer","Artificer","enfrentar a los carroñeros","Artificer no negocia con carroñeros.|Otra lanza volando, qué sorpresa.|Su campaña no perdona errores.|La rabia también cuenta una historia."],
["saint","Saint","escalar con su lengua","Saint parece tranquilo... parece.|Esa lengua es otra mecánica.|El frío aquí es el verdadero jefe.|El final cambia tu perspectiva."],
["spearmaster,lanzero","Spearmaster","crear lanzas","¡FÁBRICA DE LANZAS!|Seven Red Suns tiene un mensajero.|No necesita llevar lanzas de repuesto.|Spearmaster cuenta su historia sin palabras."],
["gourmand,gloton,glotón","Gourmand","aplastar obstáculos","Gourmand solo necesita caer encima.|Un descanso también es estrategia.|El peso es una habilidad.|¿Quién necesita una espada con ese salto?"],
["hollow knight,hk","el Caballero","explorar Hallownest","¡HALLOWNEST!|Otro banco demasiado lejos.|Esa ciudad tiene historias escondidas.|Aquí un jefe no da tregua."],
["hornet,silksong","Hornet","enfrentar enemigos","SHAW!|La aguja ya está lista.|Hornet no pierde tiempo.|Otro salto y otro misterio."],
["celeste,madeline","Madeline","escalar la montaña","Una pantalla más y llegamos.|Cada salto cuenta.|Esa montaña exige paciencia.|No se termina con un solo intento."],
["terraria","un aventurero de Terraria","invocar un jefe","Solo iba a picar un poco.|Otro jefe apareció inesperadamente.|El inventario está lleno.|La base todavía no está lista."],
["stardew valley,stardew","una granjera","cuidar el huerto","Un día tranquilo en la granja.|Hay que regar antes de salir.|Otra cosecha lista.|La granja no se cuida sola."],
["hades,supergiant","Zagreus","intentar escapar","Una carrera más y ahora sí.|El inframundo tiene mucho carácter.|Otro intento, otra historia.|Zagreus no sabe rendirse."],
["caballero,hallownest","un viajero de Hallownest","buscar un banco","¿Dónde está ese banco?|La cueva parecía segura.|La exploración siempre sorprende.|Un mapa, una aguja y valor."],
["sueno,sueño,dormir,descansar","una persona con sueño","buscar descanso","Modo sueño activado.|Los párpados ya quieren cerrar.|Dormir también es una misión.|El cerebro pide modo reposo."],
["hambre,sancocho","un plato de sancocho","calmar el hambre","¡SANCOCHOOO!|El estómago pidió segunda temporada.|El hambre llegó a medianoche.|Esa cena parecía suficiente."],
["amistad,amigo,amigos","dos amigos","compartir una aventura","Una buena charla también es aventura.|Los mejores planes surgen hablando.|Un amigo puede cambiar el día.|La amistad tiene sus misiones."],
["ideas,creatividad,imaginar","una idea","volverse proyecto","Esa idea merece un boceto.|Una chispa puede crear un mundo.|La creatividad no espera permiso.|Primero la idea, luego el universo."],
["bateria,batería,energia,energía","una batería","dar energía","¡BATERÍA AL RESCATE!|Queda una carga para otra misión.|El dispositivo pide enchufe.|Más energía, más posibilidades."],
["robot,robots,robotica,robótica","un robot","aprender una tarea","Bip bop, sistema listo.|Un robot no hace magia.|Sensores activados.|La robótica trae sorpresas."]
];

const counts=new Map();
export const topicCount=rows.length;
export function detectTopics(input,previous="es"){
 return matchAliases(input,previous,rows).map(x=>x.id);
}
export function fallback(input,learned=[],context=detectLanguage(input)){
 const direct=matchAliases(input,context.primary,rows);
 const all=[...direct];
 for(const id of learned)if(Number.isInteger(id)&&id>=0&&id<rows.length&&!all.some(x=>x.id===id))all.push({id,lang:context.primary});
 const chosen=all.slice(0,5),primary=context.primary;
 if(!chosen.length)return (localText[primary]||localText.es).unknown;
 const parts=chosen.map(x=>{
   const count=counts.get(x.id)||0;counts.set(x.id,count+1);
   const lang=context.mixed?x.lang:primary;
   return topicText(x.id,lang,count)||rows[x.id][3].split("|")[count%4];
 });
 if(chosen.length===1){
   // When the user explicitly mixes languages in one topic, show both.
   if(context.mixed&&context.languages.length>1){
     const alternative=context.languages.find(l=>l!==chosen[0].lang);
     const extra=topicText(chosen[0].id,alternative,0);
     if(extra&&extra!==parts[0])return parts[0]+"\n"+extra;
   }
   return parts[0];
 }
 const labels=chosen.map(x=>topicPhrase(x.id,primary)||rows[x.id][1]);
 const intro=(localText[primary]||localText.es).mix(labels[0],labels[1],labels.slice(2));
 return "🧪 "+intro+" XDDD\n\n"+parts.join(" ");
}
