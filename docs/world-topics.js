// 200 distinct non-programming topics across 20 areas, with EN/ES/PT/JA names.
// Facts are short curated reference sentences, not generated model weights.
const source=String.raw`
@astronomy
nebula|nebulosa|nebulosa|星雲|A nebula is a cloud of gas and dust in space.
exoplanet|exoplaneta|exoplaneta|太陽系外惑星|An exoplanet orbits a star outside our Solar System.
black hole|agujero negro|buraco negro|ブラックホール|A black hole has a region from which light cannot escape.
supernova|supernova|supernova|超新星|A supernova is an exceptionally energetic stellar explosion.
galaxy|galaxia|galáxia|銀河|A galaxy contains stars, gas, dust and dark matter.
comet|cometa|cometa|彗星|A comet is an icy body that may develop a tail near the Sun.
asteroid|asteroide|asteroide|小惑星|An asteroid is a small rocky or metallic body orbiting the Sun.
lunar eclipse|eclipse lunar|eclipse lunar|月食|A lunar eclipse happens when Earth blocks sunlight from the Moon.
solar wind|viento solar|vento solar|太陽風|The solar wind carries charged particles outward from the Sun.
dark matter|materia oscura|matéria escura|暗黒物質|Dark matter is inferred through its gravitational effects.
@biology
cell membrane|membrana celular|membrana celular|細胞膜|The cell membrane regulates what enters and leaves a cell.
mitochondrion|mitocondria|mitocôndria|ミトコンドリア|Mitochondria help cells produce usable energy.
photosynthesis|fotosíntesis|fotossíntese|光合成|Photosynthesis converts light energy into chemical energy.
dna|adn|dna|DNA|DNA stores hereditary information in living organisms.
evolution|evolución|evolução|進化|Evolution is the change of inherited traits across generations.
natural selection|selección natural|seleção natural|自然選択|Natural selection favors heritable traits linked to reproductive success.
ecosystem|ecosistema|ecossistema|生態系|An ecosystem includes organisms and their physical environment.
fungi|hongos|fungos|菌類|Fungi include mushrooms and molds and absorb nutrients from surroundings.
pollination|polinización|polinização|受粉|Pollination transfers pollen so many plants can reproduce.
homeostasis|homeostasis|homeostase|恒常性|Homeostasis maintains relatively stable internal conditions.
@chemistry
atom|átomo|átomo|原子|An atom is a basic unit of a chemical element.
molecule|molécula|molécula|分子|A molecule has atoms joined through chemical bonds.
ionic bond|enlace iónico|ligação iônica|イオン結合|Ionic bonding involves electrostatic attraction between ions.
covalent bond|enlace covalente|ligação covalente|共有結合|A covalent bond involves sharing electron pairs.
acid|ácido|ácido|酸|An acid can donate protons in the Brønsted–Lowry model.
base|base química|base química|塩基|A base can accept protons in the Brønsted–Lowry model.
ph scale|escala de ph|escala de ph|pH|The pH scale indicates acidity or basicity in aqueous solutions.
catalyst|catalizador|catalisador|触媒|A catalyst speeds a reaction without being consumed overall.
oxidation|oxidación|oxidação|酸化|Oxidation is a loss of electrons in a redox process.
periodic table|tabla periódica|tabela periódica|周期表|The periodic table organizes elements by atomic number.
@physics
gravity|gravedad|gravidade|重力|Gravity is an interaction that attracts masses and energy.
inertia|inercia|inércia|慣性|Inertia is resistance to a change in motion.
momentum|cantidad de movimiento|momento linear|運動量|Momentum is mass multiplied by velocity in classical mechanics.
friction|fricción|atrito|摩擦|Friction resists relative motion between contacting surfaces.
magnetic field|campo magnético|campo magnético|磁場|A magnetic field influences moving charges and magnets.
electric current|corriente eléctrica|corrente elétrica|電流|Electric current measures the flow of electric charge.
wave|onda física|onda física|波|A wave transfers energy or information through a disturbance.
resonance|resonancia|ressonância|共鳴|Resonance is a strong response near a natural frequency.
relativity|relatividad|relatividade|相対性理論|Relativity describes how space time and gravity relate.
quantum entanglement|entrelazamiento cuántico|emaranhamento quântico|量子もつれ|Entanglement describes nonclassical correlations between quantum systems.
@earth
plate tectonics|tectónica de placas|tectônica de placas|プレートテクトニクス|Earth's lithosphere moves in interacting tectonic plates.
volcano|volcán|vulcão|火山|A volcano is an opening that can release magma and gas.
earthquake|terremoto|terremoto|地震|An earthquake releases energy as seismic waves.
tsunami|tsunami|tsunami|津波|A tsunami is a series of large waves often triggered by seafloor movement.
sedimentary rock|roca sedimentaria|rocha sedimentar|堆積岩|Sedimentary rocks form through deposition and lithification.
fossil|fósil|fóssil|化石|A fossil preserves traces or remains of past life.
erosion|erosión|erosão|浸食|Erosion transports soil or rock by water wind or ice.
water cycle|ciclo del agua|ciclo da água|水循環|The water cycle moves water through evaporation and precipitation.
ocean current|corriente oceánica|corrente oceânica|海流|Ocean currents redistribute heat and nutrients.
aurora|aurora polar|aurora polar|オーロラ|Auroras glow when charged particles excite atmospheric gases.
@geography
latitude|latitud|latitude|緯度|Latitude measures angular distance north or south of the Equator.
longitude|longitud|longitude|経度|Longitude measures angular distance east or west of a reference meridian.
equator|ecuador terrestre|equador terrestre|赤道|The Equator divides Earth into northern and southern hemispheres.
river basin|cuenca hidrográfica|bacia hidrográfica|流域|A river basin drains water into a shared river system.
archipelago|archipiélago|arquipélago|諸島|An archipelago is a group of islands.
desert|desierto|deserto|砂漠|A desert receives very little precipitation.
rainforest|selva tropical|floresta tropical|熱帯雨林|Rainforests support high biodiversity in warm wet regions.
monsoon|monzón|monção|モンスーン|A monsoon is a seasonal shift in prevailing winds and rainfall.
delta|delta fluvial|delta fluvial|三角州|A river delta forms as sediment accumulates near a river mouth.
glacier|glaciar|geleira|氷河|A glacier is a slowly flowing mass of land ice.
@history
ancient egypt|antiguo egipto|egito antigo|古代エジプト|Ancient Egypt developed a civilization along the Nile.
roman empire|imperio romano|império romano|ローマ帝国|The Roman Empire governed extensive Mediterranean territories.
silk road|ruta de la seda|rota da seda|シルクロード|The Silk Roads were networks linking Eurasian regions.
renaissance|renacimiento|renascimento|ルネサンス|The Renaissance saw renewed artistic and scholarly activity in Europe.
industrial revolution|revolución industrial|revolução industrial|産業革命|The Industrial Revolution transformed production and transport.
printing press|imprenta|imprensa|印刷機|Movable-type printing greatly expanded the circulation of texts.
cold war|guerra fría|guerra fria|冷戦|The Cold War was a long geopolitical rivalry after World War II.
archaeology|arqueología|arqueologia|考古学|Archaeology studies past societies through material remains.
historical source|fuente histórica|fonte histórica|史料|Historical sources provide evidence about the past.
calendar|calendario|calendário|暦|A calendar organizes days and years for social purposes.
@philosophy
ethics|ética|ética|倫理学|Ethics examines ideas of right and wrong conduct.
logic|lógica|lógica|論理学|Logic studies the structure of valid reasoning.
paradox|paradoja|paradoxo|逆説|A paradox appears contradictory and challenges assumptions.
free will|libre albedrío|livre arbítrio|自由意志|Free will concerns whether people can choose among alternatives.
skepticism|escepticismo|ceticismo|懐疑主義|Skepticism questions whether claims have adequate justification.
stoicism|estoicismo|estoicismo|ストア派|Stoicism emphasizes virtue and responses to what one controls.
existentialism|existencialismo|existencialismo|実存主義|Existentialism explores human existence and personal meaning.
epistemology|epistemología|epistemologia|認識論|Epistemology studies knowledge and its justification.
aesthetics|estética filosófica|estética filosófica|美学|Aesthetics studies beauty and artistic experience.
moral dilemma|dilema moral|dilema moral|道徳的ジレンマ|A moral dilemma involves competing ethical considerations.
@psychology
cognition|cognición|cognição|認知|Cognition includes thinking remembering and processing information.
attention|atención|atenção|注意|Attention selects information for further processing.
memory formation|formación de recuerdos|formação de memórias|記憶形成|Memory formation involves encoding and consolidating experience.
habit|hábito|hábito|習慣|A habit is a behavior learned through repeated contexts.
motivation|motivación|motivação|動機|Motivation influences the initiation and persistence of action.
emotion|emoción|emoção|感情|Emotions involve experiences appraisals and physical responses.
empathy|empatía|empatia|共感|Empathy involves understanding or sharing another person's feelings.
perception|percepción|percepção|知覚|Perception interprets signals from the senses.
cognitive bias|sesgo cognitivo|viés cognitivo|認知バイアス|A cognitive bias is a systematic tendency in judgment.
learning process|proceso de aprendizaje|processo de aprendizagem|学習過程|Learning produces relatively lasting changes in knowledge or skill.
@language
phoneme|fonema|fonema|音素|A phoneme is a sound category that distinguishes meaning.
morpheme|morfema|morfema|形態素|A morpheme is a minimal unit of meaning or grammar.
syntax|sintaxis|sintaxe|統語論|Syntax studies how words combine into sentences.
semantics|semántica|semântica|意味論|Semantics studies meaning in language.
pragmatics|pragmática|pragmática|語用論|Pragmatics studies how context influences meaning.
dialect|dialecto|dialeto|方言|A dialect is a variety of a language with shared features.
translation|traducción|tradução|翻訳|Translation conveys meaning between languages.
metaphor|metáfora|metáfora|比喩|A metaphor describes one thing through another.
etymology|etimología|etimologia|語源|Etymology studies the history of words.
sign language|lengua de señas|língua de sinais|手話|Sign languages are natural visual-spatial languages.
@arts
perspective drawing|perspectiva en dibujo|perspectiva no desenho|遠近法|Perspective drawing represents depth on a flat surface.
composition|composición visual|composição visual|構図|Composition arranges elements within an artwork.
color theory|teoría del color|teoria das cores|色彩理論|Color theory explores relationships and effects of colors.
watercolor|acuarela|aquarela|水彩画|Watercolor uses pigments dispersed in water.
sculpture|escultura|escultura|彫刻|Sculpture makes art in three dimensions.
animation|animación|animação|アニメーション|Animation creates the illusion of movement between images.
pixel art|arte de píxeles|arte em pixels|ピクセルアート|Pixel art deliberately uses visible pixel placement.
typography|tipografía|tipografia|タイポグラフィ|Typography arranges type for readability and expression.
mural|mural|mural|壁画|A mural is artwork made directly on a wall or ceiling.
photography|fotografía|fotografia|写真|Photography records images using light-sensitive technology.
@music
rhythm|ritmo|ritmo|リズム|Rhythm organizes sounds and silences over time.
melody|melodía|melodia|メロディー|A melody is a recognizable sequence of musical pitches.
harmony|armonía musical|harmonia musical|和声|Harmony describes pitches sounding together.
tempo|tempo musical|andamento musical|テンポ|Tempo is the speed of a musical pulse.
musical scale|escala musical|escala musical|音階|A musical scale is an ordered set of pitches.
chord|acorde musical|acorde musical|和音|A chord combines multiple pitches.
timbre|timbre|timbre|音色|Timbre distinguishes sounds even at the same pitch.
orchestra|orquesta|orquestra|オーケストラ|An orchestra is a large ensemble of instrumental performers.
improvisation|improvisación|improvisação|即興演奏|Improvisation creates music in the moment.
synthesizer|sintetizador|sintetizador|シンセサイザー|A synthesizer produces electronic sounds.
@literature
protagonist|protagonista|protagonista|主人公|A protagonist is a central character in a story.
antagonist|antagonista|antagonista|敵役|An antagonist opposes the protagonist's aims.
narrative voice|voz narrativa|voz narrativa|語り手|Narrative voice is the perspective through which a story is told.
plot twist|giro argumental|reviravolta|どんでん返し|A plot twist changes how the audience understands events.
foreshadowing|presagio narrativo|prenúncio narrativo|伏線|Foreshadowing hints at developments to come.
worldbuilding|construcción de mundos|construção de mundos|世界観設定|Worldbuilding designs the setting and rules of a fictional world.
story conflict|conflicto narrativo|conflito narrativo|物語の対立|Conflict creates tension between goals or forces in a narrative.
literary genre|género literario|gênero literário|文学ジャンル|Genre groups works by shared conventions.
poetry|poesía|poesia|詩|Poetry uses language for rhythm imagery and concentrated meaning.
short story|cuento corto|conto curto|短編小説|A short story is a compact work of fiction.
@math
prime number|número primo|número primo|素数|A prime has exactly two positive divisors.
fraction|fracción|fração|分数|A fraction represents a part or ratio of quantities.
percentage|porcentaje|porcentagem|百分率|A percentage expresses a part per hundred.
mathematical variable|variable matemática|variável matemática|数学の変数|A variable represents an unknown or changeable quantity.
equation|ecuación|equação|方程式|An equation states that two expressions are equal.
geometry|geometría|geometria|幾何学|Geometry studies shape size and space.
symmetry|simetría|simetria|対称性|Symmetry describes transformations that preserve form.
probability|probabilidad|probabilidade|確率|Probability represents uncertainty quantitatively.
statistics|estadística|estatística|統計学|Statistics studies patterns and variability in data.
fractal|fractal|fractal|フラクタル|A fractal exhibits structure across multiple scales.
@sports
volleyball|voleibol|voleibol|バレーボール|Volleyball players send a ball over a net in teams.
basketball|baloncesto|basquete|バスケットボール|Basketball teams score by shooting through a hoop.
tennis|tenis|tênis|テニス|Tennis uses rackets to exchange shots across a net.
swimming|natación|natação|水泳|Swimming moves a person through water.
cycling|ciclismo|ciclismo|サイクリング|Cycling uses human-powered bicycles for travel or sport.
gymnastics|gimnasia|ginástica|体操|Gymnastics develops controlled movement and coordination.
marathon|maratón|maratona|マラソン|A marathon covers 42.195 kilometers on foot.
table tennis|tenis de mesa|tênis de mesa|卓球|Table tennis is played on a small table with paddles.
badminton|bádminton|badminton|バドミントン|Badminton uses rackets and a shuttlecock.
rock climbing|escalada|escalada|ロッククライミング|Rock climbing is the sport of ascending climbing routes.
@food
rice|arroz|arroz|米|Rice is a staple grain eaten around the world.
corn|maíz|milho|トウモロコシ|Corn is a cereal crop used as food and feed.
chocolate|chocolate|chocolate|チョコレート|Chocolate is made from processed cacao beans.
fermentation|fermentación|fermentação|発酵|Fermentation uses microorganisms or enzymes to transform foods.
yeast|levadura|fermento biológico|酵母|Yeasts are fungi used in bread and other foods.
baking|horneado|assamento|焼き菓子|Baking cooks food using dry heat.
nutrition|nutrición|nutrição|栄養|Nutrition studies how food supports the body.
food safety|seguridad alimentaria|segurança dos alimentos|食品衛生|Food safety reduces risks from contamination.
spice|especia|especiaria|香辛料|Spices add flavor and aroma to dishes.
umami|umami|umami|うま味|Umami is a savory taste linked to glutamate.
@environment
biodiversity|biodiversidad|biodiversidade|生物多様性|Biodiversity includes variation in genes species and ecosystems.
climate change|cambio climático|mudança climática|気候変動|Climate change refers to persistent shifts in climate patterns.
recycling|reciclaje|reciclagem|リサイクル|Recycling processes materials for reuse.
renewable energy|energía renovable|energia renovável|再生可能エネルギー|Renewable energy comes from replenishing natural sources.
solar power|energía solar|energia solar|太陽光発電|Solar power captures energy from sunlight.
wind power|energía eólica|energia eólica|風力発電|Wind power converts air movement into electricity.
carbon footprint|huella de carbono|pegada de carbono|炭素排出量|A carbon footprint estimates greenhouse-gas emissions.
sustainable agriculture|agricultura sostenible|agricultura sustentável|持続可能な農業|Sustainable agriculture aims to preserve long-term resources.
wildlife conservation|conservación de fauna|conservação da fauna|野生生物保護|Wildlife conservation works to protect species and habitats.
plastic pollution|contaminación plástica|poluição plástica|プラスチック汚染|Plastic pollution harms environments when waste accumulates.
@society
democracy|democracia|democracia|民主主義|Democracy involves public participation in government decisions.
constitution|constitución|constituição|憲法|A constitution sets foundational rules for government.
election|elección|eleição|選挙|An election allows people to choose representatives or policies.
citizenship|ciudadanía|cidadania|市民権|Citizenship defines membership rights and responsibilities.
cultural heritage|patrimonio cultural|patrimônio cultural|文化遺産|Cultural heritage includes traditions objects and places passed down.
migration|migración|migração|移住|Migration is the movement of people between locations.
urbanization|urbanización|urbanização|都市化|Urbanization increases the share of people living in urban areas.
trade|comercio|comércio|貿易|Trade exchanges goods and services.
inflation|inflación|inflação|インフレ|Inflation is an overall rise in prices over time.
public health|salud pública|saúde pública|公衆衛生|Public health aims to protect health at the population level.
@design
blueprint|plano arquitectónico|planta arquitetônica|設計図|A blueprint communicates a design through technical drawings.
accessibility|accesibilidad|acessibilidade|アクセシビリティ|Accessibility makes products and spaces usable by more people.
user experience|experiencia de usuario|experiência do usuário|ユーザー体験|User experience covers how people perceive and use a product.
interface design|diseño de interfaz|design de interface|インターフェース設計|Interface design shapes how people interact with a system.
prototype|prototipo|protótipo|試作品|A prototype tests an idea before final production.
iteration|iteración de diseño|iteração de design|反復設計|Iteration refines a design through repeated feedback.
urban planning|planificación urbana|planejamento urbano|都市計画|Urban planning guides land use and city development.
public transport|transporte público|transporte público|公共交通機関|Public transport provides shared mobility services.
architecture|arquitectura|arquitetura|建築|Architecture designs buildings and their spaces.
ergonomics|ergonomía|ergonomia|人間工学|Ergonomics designs tools and settings around human capabilities.
@digital
internet|internet|internet|インターネット|The internet is a global network of connected networks.
browser|navegador web|navegador web|ブラウザ|A browser retrieves and displays web resources.
search engine|motor de búsqueda|mecanismo de busca|検索エンジン|A search engine helps locate information online.
encryption|cifrado|criptografia|暗号化|Encryption transforms information to protect confidentiality.
password manager|gestor de contraseñas|gerenciador de senhas|パスワード管理ツール|A password manager helps store and generate credentials.
open source|código abierto|código aberto|オープンソース|Open-source software licenses permit access and reuse of source.
cloud storage|almacenamiento en la nube|armazenamento em nuvem|クラウドストレージ|Cloud storage keeps data on remote infrastructure.
database|base de datos|banco de dados|データベース|A database organizes data for retrieval and updates.
algorithmic bias|sesgo algorítmico|viés algorítmico|アルゴリズムの偏り|Algorithmic bias can produce systematically unfair outcomes.
digital privacy|privacidad digital|privacidade digital|デジタルプライバシー|Digital privacy involves control over personal information.
`;
let category='';
export const worldTopics=source.trim().split('\n').map(line=>{
 const part=line.trim();if(!part)return null;
 if(part.startsWith('@')){category=part.slice(1);return null;}
 const [en,es,pt,ja,info]=part.split('|');
 if(!en||!es||!pt||!ja||!info)throw Error('Invalid topic: '+part);
 return {id:-1,category,en,es,pt,ja,info};
}).filter(Boolean).map((t,i)=>({...t,id:i+200}));
if(worldTopics.length!==200)throw Error('Expected 200 world topics; got '+worldTopics.length);
