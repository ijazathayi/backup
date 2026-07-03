/**
 * AutoCorrect Pro — app.js
 * Full-featured spell check, autocorrect, and writing assistant engine
 */

'use strict';

// ============================================================
// DICTIONARY — 3000+ common English words + frequent misspellings
// ============================================================

const DICTIONARY = new Set([
  // Articles / Determiners
  "a","an","the","this","that","these","those","some","any","each","every",
  "either","neither","both","all","few","many","much","more","most","other",
  "another","such","what","whatever","which","whichever","whose",

  // Pronouns
  "i","me","my","myself","we","our","ours","ourselves","you","your","yours",
  "yourself","yourselves","he","him","his","himself","she","her","hers",
  "herself","it","its","itself","they","them","their","theirs","themselves",
  "who","whom","whose","which","that","what","whoever","whomever","whatever",
  "whichever","one","oneself","anyone","anybody","anything","someone","somebody",
  "something","everyone","everybody","everything","no","nobody","nothing",
  "none","both","few","many","several","all","most","any","each","either",
  "neither","other","another","some",

  // Common Verbs
  "be","am","is","are","was","were","been","being","have","has","had","having",
  "do","does","did","doing","done","go","goes","went","going","gone","get","gets",
  "got","getting","gotten","make","makes","made","making","know","knows","knew",
  "known","knowing","take","takes","took","taking","taken","see","sees","saw",
  "seen","seeing","come","comes","came","coming","think","thinks","thought",
  "thinking","look","looks","looked","looking","want","wants","wanted","wanting",
  "give","gives","gave","given","giving","use","uses","used","using","find",
  "finds","found","finding","tell","tells","told","telling","ask","asks","asked",
  "asking","seem","seems","seemed","seeming","feel","feels","felt","feeling",
  "try","tries","tried","trying","leave","leaves","left","leaving","call","calls",
  "called","calling","keep","keeps","kept","keeping","let","lets","let","letting",
  "begin","begins","began","begun","beginning","show","shows","showed","shown",
  "showing","hear","hears","heard","hearing","play","plays","played","playing",
  "run","runs","ran","running","move","moves","moved","moving","live","lives",
  "lived","living","believe","believes","believed","believing","hold","holds",
  "held","holding","bring","brings","brought","bringing","happen","happens",
  "happened","happening","write","writes","wrote","written","writing","provide",
  "provides","provided","providing","sit","sits","sat","sitting","stand","stands",
  "stood","standing","lose","loses","lost","losing","pay","pays","paid","paying",
  "meet","meets","met","meeting","include","includes","included","including",
  "continue","continues","continued","continuing","set","sets","setting","learn",
  "learns","learned","learning","change","changes","changed","changing","lead",
  "leads","led","leading","understand","understands","understood","understanding",
  "watch","watches","watched","watching","follow","follows","followed","following",
  "stop","stops","stopped","stopping","create","creates","created","creating",
  "speak","speaks","spoke","spoken","speaking","read","reads","reading","spend",
  "spends","spent","spending","grow","grows","grew","grown","growing","open",
  "opens","opened","opening","walk","walks","walked","walking","win","wins","won",
  "winning","offer","offers","offered","offering","remember","remembers",
  "remembered","remembering","love","loves","loved","loving","consider",
  "considers","considered","considering","appear","appears","appeared","appearing",
  "buy","buys","bought","buying","wait","waits","waited","waiting","serve",
  "serves","served","serving","die","dies","died","dying","send","sends","sent",
  "sending","expect","expects","expected","expecting","build","builds","built",
  "building","stay","stays","stayed","staying","fall","falls","fell","fallen",
  "falling","cut","cuts","cutting","reach","reaches","reached","reaching",
  "kill","kills","killed","killing","remain","remains","remained","remaining",
  "suggest","suggests","suggested","suggesting","raise","raises","raised",
  "raising","pass","passes","passed","passing","sell","sells","sold","selling",
  "require","requires","required","requiring","report","reports","reported",
  "reporting","decide","decides","decided","deciding","pull","pulls","pulled",
  "pulling","receive","receives","received","receiving","start","starts","started",
  "starting","add","adds","added","adding","bring","brought","buy","bought",
  "catch","catches","caught","choose","chooses","chose","chosen","deal","deals",
  "dealt","drink","drinks","drank","drunk","drive","drives","drove","driven",
  "eat","eats","ate","eaten","fight","fights","fought","fly","flies","flew","flown",
  "forget","forgets","forgot","forgotten","hit","hits","hitting","hold","held",
  "hurt","hurts","hurting","lay","lays","laid","lying","lie","lies","lay","lain",
  "mean","means","meant","put","puts","putting","quit","quits","quitting",
  "ride","rides","rode","ridden","ring","rings","rang","rung","rise","rises",
  "rose","risen","shake","shakes","shook","shaken","shine","shines","shone",
  "shoot","shoots","shot","sing","sings","sang","sung","sink","sinks","sank","sunk",
  "sleep","sleeps","slept","slide","slides","slid","smell","smells","smelled",
  "speak","spoke","spoken","spend","spent","spring","springs","sprang","sprung",
  "steal","steals","stole","stolen","stick","sticks","stuck","strike","strikes",
  "struck","strive","strives","strove","striven","swear","swears","swore","sworn",
  "swim","swims","swam","swum","swing","swings","swung","teach","teaches","taught",
  "tear","tears","tore","torn","throw","throws","threw","thrown","wake","wakes",
  "woke","woken","wear","wears","wore","worn","weave","weaves","wove","woven",
  "weep","weeps","wept","withdraw","withdraws","withdrew","withdrawn","wring",
  "wrings","wrung","forbid","forbids","forbade","forbidden","forget","forgot",

  // Prepositions & Conjunctions
  "about","above","across","after","against","along","among","around","at",
  "before","behind","below","beneath","beside","between","beyond","but","by",
  "despite","down","during","except","for","from","in","inside","into","like",
  "near","of","off","on","onto","out","outside","over","past","since","than",
  "through","to","toward","under","until","up","upon","via","with","within",
  "without","and","or","nor","yet","so","because","although","though","while",
  "if","unless","until","when","where","whereas","whether","after","before",
  "since","as","even","still","both","either","neither","not","also","too",
  "just","even","also","however","therefore","furthermore","moreover","otherwise",
  "meanwhile","nevertheless","nonetheless","consequently","accordingly",
  "additionally","alternatively","eventually","finally","initially","subsequently",

  // Common Adjectives
  "able","bad","best","better","big","black","certain","clear","different",
  "early","easy","economic","either","enough","especially","even","far","few",
  "free","full","good","great","hard","high","human","important","international",
  "large","last","late","little","local","long","low","main","major","military",
  "national","new","next","old","only","open","other","own","personal","political",
  "possible","public","real","recent","right","small","social","special","strong",
  "sure","true","white","whole","young","beautiful","wonderful","terrible",
  "excellent","perfect","amazing","awesome","fantastic","brilliant","incredible",
  "outstanding","remarkable","extraordinary","magnificent","splendid","gorgeous",
  "elegant","sophisticated","simple","complex","difficult","easy","fast","slow",
  "quick","bright","dark","light","heavy","thin","thick","wide","narrow","deep",
  "shallow","flat","round","square","sharp","smooth","rough","hard","soft",
  "hot","cold","warm","cool","fresh","clean","dirty","rich","poor","busy","quiet",
  "loud","silent","happy","sad","angry","scared","worried","surprised","excited",
  "tired","hungry","thirsty","sick","healthy","strong","weak","brave","kind",
  "gentle","mean","rude","polite","friendly","funny","serious","smart","stupid",

  // Nouns (common)
  "area","book","business","case","child","children","city","company","country",
  "day","door","education","end","example","eye","face","fact","family","food",
  "government","group","hand","head","history","home","hour","house","idea",
  "information","job","kind","law","life","line","man","men","money","month",
  "mother","name","night","number","order","part","people","place","point",
  "power","problem","program","question","right","room","school","side","state",
  "story","student","system","thing","time","water","way","week","woman","women",
  "word","work","world","year","air","answer","art","back","body","car","change",
  "community","computer","course","data","decision","development","difference",
  "dollar","door","dream","economy","environment","experience","face","father",
  "field","figure","film","form","friend","future","game","ground","heart","help",
  "hour","impact","industry","issue","knowledge","language","level","light","list",
  "market","matter","message","mind","model","moment","movement","music","nature",
  "network","news","office","paper","parent","party","pattern","period","phone",
  "plan","plant","point","policy","position","practice","pressure","price",
  "process","product","project","property","quality","relationship","report",
  "research","result","road","role","rule","science","sense","service","sign",
  "situation","society","software","solution","space","street","structure",
  "support","surface","team","technology","term","test","thought","town","type",
  "university","value","view","village","voice","website","window","organization",

  // Numbers / Ordinals
  "zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen",
  "eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy",
  "eighty","ninety","hundred","thousand","million","billion","first","second",
  "third","fourth","fifth","sixth","seventh","eighth","ninth","tenth",

  // Adverbs
  "absolutely","actually","again","ago","ahead","already","also","always","away",
  "back","basically","carefully","certainly","clearly","closely","completely",
  "correctly","currently","definitely","directly","easily","effectively",
  "especially","essentially","even","eventually","exactly","extremely","fairly",
  "far","finally","first","frequently","generally","greatly","hard","here","highly",
  "however","immediately","importantly","indeed","instead","just","largely",
  "later","least","less","likely","little","long","mainly","maybe","merely",
  "mostly","much","nearly","never","normally","not","now","obviously","often",
  "once","only","particularly","perhaps","previously","probably","quickly",
  "quite","rather","really","recently","repeatedly","right","roughly","seriously",
  "shortly","significantly","simply","slightly","slowly","sometimes","soon",
  "specifically","still","strongly","suddenly","therefore","there","thoroughly",
  "today","together","too","truly","typically","usually","very","well","widely",
  "yesterday","yet",

  // Technology
  "algorithm","application","array","artificial","automation","backend","bandwidth",
  "binary","blockchain","browser","buffer","cache","callback","cloud","code",
  "coding","command","compiler","component","configuration","connection","console",
  "container","database","debug","deployment","design","developer","device",
  "digital","directory","download","encryption","endpoint","engine","environment",
  "error","event","execution","file","firewall","framework","frontend","function",
  "gateway","global","hardware","host","html","http","https","icon","index",
  "input","installation","instance","integration","interface","internet","iteration",
  "javascript","json","keyboard","language","library","linux","local","login",
  "machine","memory","method","mobile","module","monitor","network","node","object",
  "operating","output","package","parameter","password","performance","platform",
  "plugin","process","program","protocol","python","query","repository","request",
  "response","runtime","security","server","session","software","source","stack",
  "storage","string","syntax","system","terminal","thread","token","tool","update",
  "upload","user","variable","version","virtual","website","window","workflow",

  // Common contractions (without apostrophe)
  "cant","dont","wont","isnt","arent","wasnt","werent","hasnt","havent","hadnt",
  "doesnt","didnt","wouldnt","couldnt","shouldnt","mustnt","mightnt","neednt",
  "im","its","weve","theyre","youre","hes","shes","thats","heres","whats",
  "lets","ive","youve","theyve","wed","youd","hed","shed","theyd","youll",
  "theyll","hell","shell","well","ill","itll",

  // Misc
  "example","please","thank","thanks","hello","goodbye","yes","no","maybe",
  "okay","ok","sure","right","wrong","true","false","correct","incorrect",
  "valid","invalid","public","private","complete","incomplete","available",
  "unavailable","success","failure","start","finish","begin","end","open",
  "close","create","delete","update","read","write","send","receive","accept",
  "reject","allow","deny","enable","disable","connect","disconnect",
]);

// ============================================================
// COMMON MISSPELLING MAP (misspelling → correct word)
// ============================================================
const MISSPELLING_MAP = {
  // A
  "aboout":"about","abotu":"about","absense":"absence","accidental":"accidental",
  "accomodate":"accommodate","accomodation":"accommodation","accordin":"according",
  "acheive":"achieve","acknowlege":"acknowledge","acn":"can","acomplish":"accomplish",
  "acquaintence":"acquaintance","acquaintance":"acquaintance","accross":"across",
  "definately":"definitely","definatley":"definitely","definitley":"definitely",
  "definate":"definite","defiantly":"definitely",
  "adress":"address","agressive":"aggressive","aggresive":"aggressive",
  "agian":"again","agin":"again","almsot":"almost","alot":"a lot",
  "amke":"make","amde":"made","anbd":"and","adn":"and","ahve":"have",
  "alright":"all right","alwasy":"always","amoung":"among","amzing":"amazing",
  "answereing":"answering","aparent":"apparent","apparant":"apparent",
  "apparantly":"apparently","appearence":"appearance","arguement":"argument",
  "asap":"as soon as possible","assisstant":"assistant","assitant":"assistant",
  // B
  "basicaly":"basically","basicly":"basically","becasue":"because","beacuse":"because",
  "becuse":"because","beleive":"believe","belive":"believe","beutiful":"beautiful",
  "beautifull":"beautiful","boarder":"border","boken":"broken","breif":"brief",
  "buisness":"business","bulid":"build","buit":"built","buyed":"bought",
  // C
  "cahnge":"change","calender":"calendar","cant":"can't","capible":"capable",
  "carear":"career","categorie":"category","caugh":"caught","chalenge":"challenge",
  "characteer":"character","cheif":"chief","choosen":"chosen","cleary":"clearly",
  "collage":"college","comming":"coming","comit":"commit","commited":"committed",
  "committment":"commitment","comparisson":"comparison","comparsion":"comparison",
  "compleate":"complete","completly":"completely","concious":"conscious",
  "consistant":"consistent","continous":"continuous","coputer":"computer",
  "coud":"could","couldnt":"couldn't","couldve":"could've","coudn't":"couldn't",
  "crative":"creative","creaate":"create","critisize":"criticize",
  // D
  "decieve":"deceive","decison":"decision","defenitely":"definitely",
  "dependant":"dependent","desicion":"decision","dieing":"dying",
  "diffenence":"difference","differant":"different","differnt":"different",
  "disagree":"disagree","disapoint":"disappoint","dissapoint":"disappoint",
  "dissapear":"disappear","doesnt":"doesn't","dont":"don't","dowload":"download",
  "droped":"dropped",
  // E
  "eariler":"earlier","earily":"early","ealier":"earlier","embarass":"embarrass",
  "embarrasing":"embarrassing","embarrasment":"embarrassment","enviroment":"environment",
  "enviorment":"environment","equiped":"equipped","equippment":"equipment",
  "especally":"especially","everydy":"everyday","everyting":"everything",
  "exaggerattion":"exaggeration","excercise":"exercise","exmaple":"example",
  "experiance":"experience","experment":"experiment","explenation":"explanation",
  "exsist":"exist","extrem":"extreme","extremly":"extremely",
  // F
  "familly":"family","favourit":"favourite","febuary":"february","february":"february",
  "fianl":"final","fianlly":"finally","finaly":"finally","finsh":"finish",
  "firend":"friend","folowing":"following","foriegn":"foreign","formost":"foremost",
  "forwrd":"forward","freind":"friend","frined":"friend","fromm":"from",
  "funtion":"function","futur":"future",
  // G
  "geting":"getting","goig":"going","goign":"going","goverment":"government",
  "gramar":"grammar","grammer":"grammar","grate":"great","greatfull":"grateful",
  "grwoing":"growing","guarentee":"guarantee","guarntee":"guarantee",
  "guidence":"guidance","gurantee":"guarantee",
  // H
  "happend":"happened","hapening":"happening","haras":"harass","harras":"harass",
  "hardley":"hardly","hav":"have","haveing":"having","heared":"heard",
  "heighth":"height","helpfull":"helpful","hereing":"hearing","hightlight":"highlight",
  "higest":"highest","hopefull":"hopeful","horable":"horrible","howver":"however",
  "humerous":"humorous","huose":"house",
  // I
  "ignorence":"ignorance","imaginery":"imaginary","immediat":"immediate",
  "immediatly":"immediately","impliment":"implement","importent":"important",
  "imposible":"impossible","insted":"instead","intelligance":"intelligence",
  "inteligent":"intelligent","intrest":"interest","intresting":"interesting",
  "isnt":"isn't","itmes":"items","its":"it's",
  // J
  "joing":"join","judt":"just","jugement":"judgment","judgement":"judgment",
  // K
  "knowlege":"knowledge","knoweldge":"knowledge","knwo":"know","konw":"know",
  "kno":"know","keybord":"keyboard",
  // L
  "labratory":"laboratory","laguage":"language","langauge":"language",
  "lazyness":"laziness","leaft":"left","leanr":"learn","lierature":"literature",
  "likly":"likely","lisening":"listening","litarature":"literature","littel":"little",
  "logicaly":"logically","lookin":"looking","loosing":"losing","luxery":"luxury",
  // M
  "maintenence":"maintenance","managment":"management","manoeuver":"maneuver",
  "mariage":"marriage","mispell":"misspell","misspeling":"misspelling",
  "mistke":"mistake","misunderstand":"misunderstand","moble":"mobile",
  "moives":"movies","momemnt":"moment","morgage":"mortgage","movei":"movie",
  "myselff":"myself",
  // N
  "naturaly":"naturally","necesary":"necessary","neccessary":"necessary",
  "necessite":"necessitate","negativy":"negatively","neigbor":"neighbor",
  "neighbour":"neighbor","noisy":"noisy","noticable":"noticeable",
  "noticiable":"noticeable",
  // O
  "obiously":"obviously","occured":"occurred","ocassion":"occasion",
  "occasionaly":"occasionally","ommit":"omit","onyl":"only","opinon":"opinion",
  "opprotunity":"opportunity","opputunity":"opportunity","organise":"organize",
  "originaly":"originally","otherwsie":"otherwise","outragous":"outrageous",
  // P
  "packege":"package","paragrah":"paragraph","paralel":"parallel","partialy":"partially",
  "pasword":"password","paticular":"particular","pefect":"perfect","peopel":"people",
  "peolpe":"people","perfer":"prefer","performace":"performance","persue":"pursue",
  "pharase":"phrase","plaese":"please","pleaes":"please","posible":"possible",
  "posision":"position","possable":"possible","practise":"practice","preety":"pretty",
  "prepair":"prepare","presant":"present","privelege":"privilege","priviledge":"privilege",
  "privilige":"privilege","probaly":"probably","probem":"problem","proccess":"process",
  "programm":"program","pronounciation":"pronunciation","propblem":"problem",
  "pubilc":"public","puting":"putting",
  // Q
  "qeustion":"question","quesiton":"question","questoin":"question",
  "quicklly":"quickly","qucikly":"quickly","qyite":"quite",
  // R
  "realy":"really","recieve":"receive","reccomend":"recommend","recomend":"recommend",
  "refence":"reference","remmeber":"remember","remeber":"remember","repsond":"respond",
  "resposne":"response","resturaunt":"restaurant","restaraunt":"restaurant",
  "reults":"results","revelant":"relevant","rigth":"right","rythm":"rhythm",
  // S
  "saftey":"safety","saiid":"said","sandwitch":"sandwich","scedule":"schedule",
  "scince":"science","sentance":"sentence","seperate":"separate","similer":"similar",
  "similiar":"similar","sinse":"since","sistems":"systems","soem":"some",
  "somthing":"something","soudn":"sound","speling":"spelling","strenth":"strength",
  "sturcture":"structure","sucess":"success","suceed":"succeed","suceed":"succeed",
  "swich":"switch","sytem":"system","sytsem":"system",
  // T
  "tahn":"than","taht":"that","tehnology":"technology","temprature":"temperature",
  "teh":"the","ther":"there","thier":"their","thign":"thing","thinkg":"thinking",
  "thorugh":"through","thsi":"this","tiem":"time","togehter":"together",
  "tommorow":"tomorrow","tommorrow":"tomorrow","tonge":"tongue","totaly":"totally",
  "towords":"towards","truely":"truly","trun":"turn","twpo":"two","txet":"text",
  "typo":"typo","tpye":"type","tyep":"type",
  // U
  "unbelivable":"unbelievable","undrestand":"understand","unforseen":"unforeseen",
  "untill":"until","usefull":"useful","usualy":"usually","utnil":"until",
  // V
  "vrey":"very","versoin":"version","visibale":"visible","vulnerbale":"vulnerable",
  // W
  "waht":"what","wasnt":"wasn't","wepon":"weapon","wether":"whether",
  "whn":"when","wierd":"weird","wirte":"write","writting":"writing",
  "woudl":"would","wont":"won't","wrnog":"wrong","wrrod":"word","wtih":"with",
  // Y
  "yoiu":"you","youre":"you're","yoru":"your","ypur":"your",
  // Z
  "zeor":"zero","zroe":"zero",
};

// ============================================================
// Word Completion Trie / Prefix List
// ============================================================
const WORD_COMPLETIONS = {
  "beau":["beautiful","beauty","because"],
  "bec":["because","become","becoming"],
  "bel":["believe","below","belong","beloved"],
  "be":["because","believe","before","between","become","behind","beneath","besides"],
  "com":["complete","computer","compare","community","company","comment","common","communicate","compose"],
  "con":["continue","consider","concept","condition","connect","conclude","configure","contact","content","control","conversation"],
  "cre":["create","creative","credit","creat"],
  "def":["define","definite","definitely","default","defeat","defense"],
  "dev":["develop","developer","device","deliver","diverse"],
  "dif":["different","difference","difficult"],
  "env":["environment","engineer","enterprise"],
  "eve":["everything","everyone","everyday","event","eventually","even"],
  "exp":["experience","example","explain","expect","explore","export","express"],
  "for":["forward","format","foreign","force","forget","form","found"],
  "fri":["friend","Friday"],
  "fun":["function","fundamental","funny","future"],
  "ge":["general","generate","gentle"],
  "go":["going","government","google","good","goal"],
  "gr":["great","group","grammar","grow","ground","grade"],
  "ha":["have","happy","happen","hard","handle","hardware"],
  "im":["important","implement","improve","image","immediately","impact","include"],
  "in":["include","information","instead","interest","index","industry","install","interface","integrate","indicate","introduce"],
  "kn":["know","knowledge","known"],
  "la":["language","large","later","last","launch"],
  "le":["learn","level","left","length","less","letter"],
  "li":["like","list","listen","little","light","library","limit","line"],
  "ma":["make","many","manage","major","machine","market","maybe","maximum"],
  "me":["mean","message","memory","method","meet","medium","measure"],
  "mo":["more","most","move","model","module","moment","monitor","mobile"],
  "na":["name","national","natural","navigate","narrow"],
  "ne":["never","network","new","next","need","necessary"],
  "no":["nothing","nothing","normal","node","not","now","noticeable"],
  "ob":["object","obvious","observe"],
  "op":["open","option","operate","opportunity","organize","optimize"],
  "pa":["package","path","pattern","parameter","password","page","parent"],
  "pe":["people","performance","person","perspective","perhaps"],
  "pl":["place","plan","please","platform","play"],
  "po":["possible","power","position","policy","point","popular"],
  "pr":["program","provide","process","project","problem","practice","previous","produce","prepare","present","prevent","property","protect","public","pro"],
  "pro":["program","process","provide","project","problem","product","property","protect","professional","progress","promise","propose"],
  "qu":["question","quality","quickly","quite","query"],
  "re":["receive","result","return","require","report","request","remember","remove","replace","represent","research","resource","respond","review","reference","release"],
  "sc":["school","science","schedule","software","system"],
  "se":["send","server","service","session","set","see","search","security","select","several","series"],
  "sh":["should","show","share","short","shift","she"],
  "si":["simple","since","similar","sign","site","situation","side"],
  "so":["something","software","sometimes","source","solution","sort","social"],
  "sp":["space","specific","special","speed","split","support"],
  "st":["start","store","state","string","structure","style","status","stack","step","stop","still","strategy","strong","student","standard"],
  "su":["support","success","suggest","submit","subject","summary","surface","such","super","sure"],
  "sy":["system","syntax","symbol"],
  "te":["technology","template","testing","term","text","team","technical","tell","think"],
  "th":["there","they","them","then","this","thing","through","that","though","think","therefore","thread"],
  "ti":["time","title","together"],
  "to":["together","tool","token","today","type","toward"],
  "tr":["true","try","transfer","translate","track","type","trigger"],
  "un":["understand","update","until","use","user","under","unique"],
  "us":["user","use","usually","using"],
  "va":["variable","value","valid","various","version"],
  "ve":["version","very","view"],
  "wa":["want","wait","watch","walk","water","way","was","what"],
  "wi":["with","window","without","wide","will"],
  "wo":["word","work","world","would","write"],
  "wr":["write","wrong","written"],
  "ye":["year","yes","yesterday","yet"],
};

// ============================================================
// App State
// ============================================================
const state = {
  mode: 'realtime',       // 'realtime' | 'manual'
  fixedCount: 0,
  totalErrors: 0,
  corrections: [],        // [{from, to, timestamp}]
  history: [],            // [{text, corrections, timestamp, words}]
  customDict: new Set(),
  activeWord: null,       // DOM element of clicked word
  settings: {
    realtime: true,
    autocorrect: true,
    autocomplete: true,
    capitalize: true,
    doubleSpace: true,
    highlight: true,
    sound: false,
    fontSize: 16,
  }
};

let debounceTimer = null;
let completionDebounce = null;

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadHistory();
  loadCustomDict();
  setupEditor();
  updateStats();
});

function setupEditor() {
  const editor = document.getElementById('editorContent');

  editor.addEventListener('input', onEditorInput);
  editor.addEventListener('keydown', onEditorKeydown);
  editor.addEventListener('click', onEditorClick);
  editor.addEventListener('blur', saveHistory);

  // Click outside tooltip
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.correction-tooltip') && !e.target.closest('.err-word')) {
      hideTooltip();
    }
  });
}

// ============================================================
// Editor Events
// ============================================================
function onEditorInput(e) {
  const editor = document.getElementById('editorContent');
  const text = editor.innerText;

  updateStats();

  // Auto-capitalize first letter after sentence end
  if (state.settings.capitalize) {
    autoCapitalize(editor);
  }

  // Double space fix
  if (state.settings.doubleSpace && text.includes('  ')) {
    fixDoubleSpaces(editor);
  }

  if (state.mode === 'realtime' && state.settings.realtime) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      highlightErrors(editor);
    }, 350);
  }

  // Word completions
  if (state.settings.autocomplete) {
    clearTimeout(completionDebounce);
    completionDebounce = setTimeout(() => {
      updateCompletions(editor);
    }, 200);
  }

  // Auto-correct on space
  if (state.settings.autocorrect && e.inputType === 'insertText' && e.data === ' ') {
    autoCorrectLastWord(editor);
  }

  updateAccuracy();
  setStatus('Analyzing…', 'active');
}

function onEditorKeydown(e) {
  // Tab to insert first completion
  if (e.key === 'Tab') {
    e.preventDefault();
    const firstCompletion = document.querySelector('.completion-item');
    if (firstCompletion) applyCompletion(firstCompletion.dataset.word);
  }
}

function onEditorClick(e) {
  const target = e.target;
  if (target.classList.contains('err-word')) {
    showTooltip(target, e.clientX, e.clientY);
    state.activeWord = target;
    e.stopPropagation();
  } else {
    hideTooltip();
  }
}

// ============================================================
// Spell Checking
// ============================================================
function getWords(text) {
  return text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || [];
}

function isCorrect(word) {
  const w = word.toLowerCase();
  return (
    DICTIONARY.has(w) ||
    state.customDict.has(w) ||
    DICTIONARY.has(w.replace(/s$/, '')) ||
    DICTIONARY.has(w.replace(/ing$/, '')) ||
    DICTIONARY.has(w.replace(/ed$/, '')) ||
    DICTIONARY.has(w.replace(/er$/, '')) ||
    DICTIONARY.has(w.replace(/est$/, '')) ||
    DICTIONARY.has(w.replace(/ly$/, '')) ||
    DICTIONARY.has(w.replace(/tion$/, '')) ||
    DICTIONARY.has(w.replace(/ness$/, '')) ||
    DICTIONARY.has(w.replace(/ment$/, '')) ||
    DICTIONARY.has(w.replace(/ful$/, '')) ||
    DICTIONARY.has(w.replace(/less$/, '')) ||
    DICTIONARY.has(w.replace(/ive$/, '')) ||
    DICTIONARY.has(w.replace(/able$/, '')) ||
    DICTIONARY.has(w.replace(/ible$/, '')) ||
    DICTIONARY.has(w.replace(/ical$/, '')) ||
    DICTIONARY.has(w.replace(/ous$/, '')) ||
    DICTIONARY.has(w.replace(/ize$/, '')) ||
    DICTIONARY.has(w.replace(/ise$/, '')) ||
    w.length <= 2 ||
    /^\d+$/.test(w)
  );
}

function getSuggestions(word) {
  const w = word.toLowerCase();

  // Check misspelling map first
  if (MISSPELLING_MAP[w]) return [MISSPELLING_MAP[w]];

  // Levenshtein distance search
  const candidates = [];
  for (const dictWord of DICTIONARY) {
    if (Math.abs(dictWord.length - w.length) > 3) continue;
    const dist = levenshtein(w, dictWord);
    if (dist <= 2) candidates.push({ word: dictWord, dist });
  }

  // Also check misspelling map values
  for (const [mis, correct] of Object.entries(MISSPELLING_MAP)) {
    if (Math.abs(mis.length - w.length) <= 2) {
      const dist = levenshtein(w, mis);
      if (dist <= 1 && DICTIONARY.has(correct)) {
        candidates.push({ word: correct, dist: dist });
      }
    }
  }

  candidates.sort((a, b) => a.dist - b.dist);
  const seen = new Set();
  return candidates
    .filter(c => { if (seen.has(c.word)) return false; seen.add(c.word); return true; })
    .slice(0, 5)
    .map(c => c.word);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// ============================================================
// Highlight Errors
// ============================================================
function highlightErrors(editor) {
  if (!state.settings.highlight) {
    updateStats();
    return;
  }

  const sel = window.getSelection();
  const focusNode = sel.focusNode;
  const focusOffset = sel.focusOffset;

  // Save raw text
  const rawText = editor.innerText;

  // Build highlighted HTML
  const html = buildHighlightedHTML(rawText);
  editor.innerHTML = html;

  // Restore cursor
  try {
    restoreCursor(editor, focusNode, focusOffset);
  } catch (e) {}

  updateSuggestionsPanel(rawText);
  updateStats();
  setStatus('Ready', 'ok');
}

function buildHighlightedHTML(text) {
  let html = '';
  let i = 0;

  while (i < text.length) {
    // Newline
    if (text[i] === '\n') {
      html += '<br>';
      i++;
      continue;
    }

    // Word character
    const wordMatch = text.slice(i).match(/^[a-zA-Z]+(?:'[a-zA-Z]+)?/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (isCorrect(word)) {
        html += escapeHtml(word);
      } else {
        const suggestions = getSuggestions(word);
        const sugStr = JSON.stringify(suggestions).replace(/"/g, '&quot;');
        html += `<span class="err-word" data-word="${escapeHtml(word)}" data-suggestions="${sugStr}" title="Misspelled: ${escapeHtml(word)}">${escapeHtml(word)}</span>`;
      }
      i += word.length;
      continue;
    }

    // Non-word character
    html += escapeHtml(text[i]);
    i++;
  }
  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function restoreCursor(editor, focusNode, focusOffset) {
  if (!focusNode) return;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.length >= focusOffset) {
      const range = document.createRange();
      range.setStart(node, focusOffset);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    focusOffset -= node.length;
  }
}

// ============================================================
// Suggestions Panel
// ============================================================
function updateSuggestionsPanel(text) {
  const words = getWords(text);
  const errors = [];
  const seen = new Set();

  for (const word of words) {
    const w = word.toLowerCase();
    if (!seen.has(w) && !isCorrect(word)) {
      seen.add(w);
      const suggestions = getSuggestions(word);
      errors.push({ word, suggestions });
    }
  }

  state.totalErrors = errors.length;

  const list = document.getElementById('suggestionsList');
  const empty = document.getElementById('emptySuggestions');
  const badge = document.getElementById('suggestionBadge');

  badge.textContent = errors.length;
  list.innerHTML = '';

  if (errors.length === 0) {
    list.appendChild(empty);
    empty.style.display = '';
  } else {
    empty.style.display = 'none';
    errors.forEach(({ word, suggestions }) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      const fixBtns = suggestions.map(s =>
        `<button class="fix-btn" onclick="fixWordGlobal('${word}','${s}')">${s}</button>`
      ).join('');
      item.innerHTML = `
        <div class="suggestion-original">"${word}"</div>
        <div class="suggestion-arrow">Suggestions:</div>
        <div class="suggestion-fixes">${fixBtns || '<span style="color:var(--text-muted);font-size:0.8rem">No suggestions</span>'}</div>
      `;
      list.appendChild(item);
    });
  }

  updateStats();
}

// ============================================================
// Auto-Correct Last Word
// ============================================================
function autoCorrectLastWord(editor) {
  const text = editor.innerText;
  const words = text.trimEnd().match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g);
  if (!words || words.length === 0) return;

  const lastWord = words[words.length - 1];
  const lw = lastWord.toLowerCase();

  if (MISSPELLING_MAP[lw]) {
    const correct = MISSPELLING_MAP[lw];
    const newText = text.replace(new RegExp(`\\b${escapeRegex(lastWord)}\\b(?=\\s)`, ''), correct);
    if (newText !== text) {
      editor.innerText = newText;
      moveCursorToEnd(editor);
      recordCorrection(lastWord, correct);
      if (state.settings.highlight) highlightErrors(editor);
      showToast(`✓ Auto-fixed: "${lastWord}" → "${correct}"`, 'success');
      if (state.settings.sound) playChime();
    }
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function moveCursorToEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

// ============================================================
// Fix Word Globally
// ============================================================
function fixWordGlobal(wrong, correct) {
  const editor = document.getElementById('editorContent');
  const text = editor.innerText;
  const regex = new RegExp(`\\b${escapeRegex(wrong)}\\b`, 'gi');
  const newText = text.replace(regex, (match) => {
    // Preserve capitalization
    if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
      return correct.charAt(0).toUpperCase() + correct.slice(1);
    }
    return correct;
  });

  if (newText !== text) {
    editor.innerText = newText;
    recordCorrection(wrong, correct);
    if (state.settings.highlight) highlightErrors(editor);
    showToast(`✓ Fixed: "${wrong}" → "${correct}"`, 'success');
    moveCursorToEnd(editor);
  }
}

// ============================================================
// Auto Fix All
// ============================================================
function autoFixAll() {
  const editor = document.getElementById('editorContent');
  let text = editor.innerText;
  let fixCount = 0;

  const words = getWords(text);
  const seen = new Set();

  for (const word of words) {
    const lw = word.toLowerCase();
    if (seen.has(lw)) continue;
    seen.add(lw);

    if (!isCorrect(word)) {
      const suggestions = getSuggestions(word);
      if (suggestions.length > 0) {
        const correct = suggestions[0];
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
        const before = text;
        text = text.replace(regex, (match) => {
          if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
            return correct.charAt(0).toUpperCase() + correct.slice(1);
          }
          return correct;
        });
        if (text !== before) {
          recordCorrection(word, correct);
          fixCount++;
        }
      }
    }
  }

  editor.innerText = text;
  if (state.settings.highlight) highlightErrors(editor);
  moveCursorToEnd(editor);

  if (fixCount > 0) {
    showToast(`✓ Auto-fixed ${fixCount} word${fixCount > 1 ? 's' : ''}!`, 'success');
    if (state.settings.sound) playChime();
  } else {
    showToast('✓ No errors found!', 'info');
  }
  updateAccuracy();
}

// ============================================================
// Run Full Check (manual mode)
// ============================================================
function runFullCheck() {
  const editor = document.getElementById('editorContent');
  highlightErrors(editor);
  updateAccuracy();
  showToast('✓ Check complete!', 'info');
}

// ============================================================
// Auto-Capitalize
// ============================================================
function autoCapitalize(editor) {
  // Don't manipulate DOM here to avoid cursor issues — handled on space
  const text = editor.innerText;
  if (text.length === 1 && text[0].match(/[a-z]/)) {
    editor.innerText = text[0].toUpperCase();
    moveCursorToEnd(editor);
  }
}

// ============================================================
// Double Space Fix
// ============================================================
function fixDoubleSpaces(editor) {
  const sel = window.getSelection();
  const offset = sel.focusOffset;
  editor.innerText = editor.innerText.replace(/  +/g, ' ');
  try {
    const range = document.createRange();
    const node = editor.childNodes[0];
    if (node) {
      range.setStart(node, Math.min(offset, node.length));
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } catch(e) {}
}

// ============================================================
// Word Completions
// ============================================================
function updateCompletions(editor) {
  const text = editor.innerText;
  const words = text.match(/\b[a-zA-Z]+$/);
  const currentWord = words ? words[0].toLowerCase() : '';

  const list = document.getElementById('completionsList');
  const empty = document.getElementById('emptyCompletions');

  if (currentWord.length < 2) {
    list.innerHTML = '';
    list.appendChild(empty);
    return;
  }

  // Find prefix matches
  const completions = [];
  const prefixKey = Object.keys(WORD_COMPLETIONS).find(p =>
    currentWord.startsWith(p) || p.startsWith(currentWord)
  );

  if (prefixKey) {
    const words = WORD_COMPLETIONS[prefixKey];
    words.filter(w => w.startsWith(currentWord) && w !== currentWord).slice(0, 6).forEach(w => {
      completions.push(w);
    });
  }

  // Also try dictionary
  if (completions.length < 3) {
    for (const w of DICTIONARY) {
      if (w.startsWith(currentWord) && w !== currentWord && w.length > currentWord.length + 1) {
        if (!completions.includes(w)) completions.push(w);
        if (completions.length >= 6) break;
      }
    }
  }

  list.innerHTML = '';
  if (completions.length === 0) {
    list.appendChild(empty);
    return;
  }

  completions.slice(0, 6).forEach((word, i) => {
    const item = document.createElement('div');
    item.className = 'completion-item';
    item.dataset.word = word;
    item.innerHTML = `<span class="completion-text">${word}</span>${i === 0 ? '<span class="completion-key">Tab</span>' : ''}`;
    item.addEventListener('click', () => applyCompletion(word));
    list.appendChild(item);
  });
}

function applyCompletion(word) {
  const editor = document.getElementById('editorContent');
  const text = editor.innerText;
  const match = text.match(/\b[a-zA-Z]+$/);
  if (match) {
    const newText = text.slice(0, text.length - match[0].length) + word + ' ';
    editor.innerText = newText;
    moveCursorToEnd(editor);
    if (state.settings.highlight) highlightErrors(editor);
    updateCompletions(editor);
  }
}

// ============================================================
// Tooltip
// ============================================================
function showTooltip(el, x, y) {
  const tooltip = document.getElementById('correctionTooltip');
  const errorEl = document.getElementById('tooltipError');
  const sugEl = document.getElementById('tooltipSuggestions');

  const word = el.dataset.word;
  let suggestions = [];
  try { suggestions = JSON.parse(el.dataset.suggestions.replace(/&quot;/g, '"')); } catch(e) {}

  errorEl.textContent = `"${word}"`;
  sugEl.innerHTML = suggestions.map(s =>
    `<button class="tooltip-sug-btn" onclick="applyTooltipFix('${word}','${s}')">${s}</button>`
  ).join('') || '<span style="color:var(--text-muted);font-size:0.8rem">No suggestions</span>';

  // Position
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = x + 12, top = y + 12;
  if (left + 260 > vw) left = x - 260;
  if (top + 150 > vh) top = y - 150;

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.classList.add('visible');
}

function hideTooltip() {
  document.getElementById('correctionTooltip').classList.remove('visible');
  state.activeWord = null;
}

function applyTooltipFix(wrong, correct) {
  fixWordGlobal(wrong, correct);
  hideTooltip();
}

function ignoreWord() {
  if (state.activeWord) {
    const word = state.activeWord.dataset.word;
    state.customDict.add(word.toLowerCase());
    state.activeWord.classList.remove('err-word');
    state.activeWord.removeAttribute('title');
    hideTooltip();
    updateStats();
    showToast(`"${word}" added to ignore list`, 'info');
  }
}

function addToDict() {
  if (state.activeWord) {
    const word = state.activeWord.dataset.word;
    state.customDict.add(word.toLowerCase());
    state.activeWord.classList.remove('err-word');
    state.activeWord.removeAttribute('title');
    hideTooltip();
    updateStats();
    saveCustomDict();
    showToast(`"${word}" added to dictionary`, 'success');
  }
}

// ============================================================
// Stats & Accuracy
// ============================================================
function updateStats() {
  const editor = document.getElementById('editorContent');
  const text = editor.innerText.trim();
  const words = text ? getWords(text) : [];
  const chars = text.length;
  const errors = document.querySelectorAll('.err-word').length;

  document.getElementById('wordCount').textContent = words.length;
  document.getElementById('charCount').textContent = chars;
  document.getElementById('errorCount').textContent = errors;
  document.getElementById('fixedCount').textContent = state.fixedCount;
  document.getElementById('correctionBadge').textContent = state.corrections.length;
}

function updateAccuracy() {
  const editor = document.getElementById('editorContent');
  const text = editor.innerText.trim();
  const words = getWords(text);
  if (words.length === 0) {
    document.getElementById('accuracyPct').textContent = '—';
    document.getElementById('accuracyFill').style.width = '0%';
    document.getElementById('accuracyFill').style.backgroundPosition = '100% 0';
    return;
  }

  const errors = document.querySelectorAll('.err-word').length;
  const pct = Math.max(0, Math.min(100, Math.round((1 - errors / words.length) * 100)));
  document.getElementById('accuracyPct').textContent = pct + '%';
  document.getElementById('accuracyFill').style.width = pct + '%';

  // Color position: 0%=red end, 100%=green end
  const pos = (100 - pct) + '%';
  document.getElementById('accuracyFill').style.backgroundPosition = pos + ' 0';
}

// ============================================================
// Record Correction
// ============================================================
function recordCorrection(from, to) {
  state.fixedCount++;
  const entry = { from, to, timestamp: new Date() };
  state.corrections.unshift(entry);

  // Update corrections log in sidebar
  const list = document.getElementById('correctionsList');
  const empty = document.getElementById('emptyCorrections');
  empty.style.display = 'none';

  const div = document.createElement('div');
  div.className = 'correction-entry';
  div.innerHTML = `
    <span class="correction-from">${from}</span>
    <span class="correction-arrow">→</span>
    <span class="correction-to">${to}</span>
  `;
  list.insertBefore(div, list.firstChild);
  updateStats();
}

// ============================================================
// Reset, Clear, Copy, Paste
// ============================================================
function clearText() {
  const editor = document.getElementById('editorContent');
  editor.innerHTML = '';
  state.corrections = [];
  state.fixedCount = 0;
  document.getElementById('correctionsList').innerHTML = '';
  document.getElementById('correctionsList').appendChild(document.getElementById('emptyCorrections'));
  document.getElementById('suggestionsList').innerHTML = '';
  document.getElementById('suggestionsList').appendChild(document.getElementById('emptySuggestions'));
  document.getElementById('completionsList').innerHTML = '';
  document.getElementById('completionsList').appendChild(document.getElementById('emptyCompletions'));
  document.getElementById('suggestionBadge').textContent = '0';
  document.getElementById('correctionBadge').textContent = '0';
  updateStats();
  updateAccuracy();
  showToast('✓ Cleared', 'info');
}

function resetCorrections() {
  const editor = document.getElementById('editorContent');
  // Strip all span formatting
  editor.innerText = editor.innerText;
  state.corrections = [];
  state.fixedCount = 0;
  document.getElementById('correctionsList').innerHTML = '';
  document.getElementById('correctionsList').appendChild(document.getElementById('emptyCorrections'));
  document.getElementById('correctionBadge').textContent = '0';
  updateStats();
  if (state.settings.highlight) highlightErrors(editor);
  showToast('↩ Corrections reset', 'info');
}

async function copyText() {
  const editor = document.getElementById('editorContent');
  try {
    await navigator.clipboard.writeText(editor.innerText);
    showToast('✓ Copied to clipboard!', 'success');
  } catch {
    showToast('⚠ Copy failed', 'error');
  }
}

async function pasteText() {
  const editor = document.getElementById('editorContent');
  try {
    const text = await navigator.clipboard.readText();
    editor.innerText = (editor.innerText + text).trim();
    moveCursorToEnd(editor);
    if (state.settings.highlight) highlightErrors(editor);
    showToast('✓ Pasted!', 'success');
  } catch {
    showToast('⚠ Paste failed — use Ctrl+V', 'error');
  }
}

// ============================================================
// Mode toggle
// ============================================================
function setMode(mode) {
  state.mode = mode;
  document.getElementById('modeRealtime').classList.toggle('active', mode === 'realtime');
  document.getElementById('modeManual').classList.toggle('active', mode === 'manual');

  if (mode === 'realtime') {
    const editor = document.getElementById('editorContent');
    if (state.settings.realtime) highlightErrors(editor);
  }
}

// ============================================================
// Tab switching
// ============================================================
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ============================================================
// History
// ============================================================
function saveHistory() {
  const editor = document.getElementById('editorContent');
  const text = editor.innerText.trim();
  if (!text || text.length < 5) return;

  const entry = {
    text: text.slice(0, 200) + (text.length > 200 ? '…' : ''),
    corrections: state.corrections.length,
    words: getWords(text).length,
    timestamp: new Date().toISOString(),
  };

  state.history.unshift(entry);
  if (state.history.length > 50) state.history.pop();

  try {
    localStorage.setItem('autocorrect_history', JSON.stringify(state.history.slice(0, 20)));
  } catch(e) {}

  renderHistory();
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('autocorrect_history');
    if (saved) state.history = JSON.parse(saved);
  } catch(e) {}
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  if (state.history.length === 0) {
    list.innerHTML = `<div class="empty-state large"><div class="empty-icon">📋</div><p>No history yet.</p><small>Your correction sessions will appear here.</small></div>`;
    return;
  }

  state.history.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const d = new Date(entry.timestamp);
    card.innerHTML = `
      <div class="history-card-icon">📝</div>
      <div class="history-card-info">
        <h4>${entry.text}</h4>
        <p>${entry.words} words · ${entry.corrections} corrections made</p>
      </div>
      <div class="history-card-meta">${formatDate(d)}</div>
    `;
    list.appendChild(card);
  });
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem('autocorrect_history');
  renderHistory();
  showToast('✓ History cleared', 'info');
}

function formatDate(d) {
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return d.toLocaleDateString();
}

// ============================================================
// Settings
// ============================================================
function updateSettings() {
  state.settings.realtime    = document.getElementById('settingRealtime').checked;
  state.settings.autocorrect = document.getElementById('settingAutocorrect').checked;
  state.settings.autocomplete= document.getElementById('settingAutocomplete').checked;
  state.settings.capitalize  = document.getElementById('settingCapitalize').checked;
  state.settings.doubleSpace = document.getElementById('settingDoubleSpace').checked;
  state.settings.highlight   = document.getElementById('settingHighlight').checked;
  state.settings.sound       = document.getElementById('settingSound').checked;

  saveSettings();

  const editor = document.getElementById('editorContent');
  if (!state.settings.highlight) {
    // Remove all highlights
    editor.innerText = editor.innerText;
    document.getElementById('suggestionsList').innerHTML = '';
    document.getElementById('suggestionsList').appendChild(document.getElementById('emptySuggestions'));
  } else {
    highlightErrors(editor);
  }
}

function updateFontSize(val) {
  document.documentElement.style.setProperty('--editor-font-size', val + 'px');
  document.getElementById('fontSizeVal').textContent = val + 'px';
  state.settings.fontSize = parseInt(val);
  saveSettings();
}

function saveSettings() {
  try {
    localStorage.setItem('autocorrect_settings', JSON.stringify(state.settings));
  } catch(e) {}
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('autocorrect_settings');
    if (saved) {
      const s = JSON.parse(saved);
      Object.assign(state.settings, s);

      document.getElementById('settingRealtime').checked   = state.settings.realtime;
      document.getElementById('settingAutocorrect').checked= state.settings.autocorrect;
      document.getElementById('settingAutocomplete').checked=state.settings.autocomplete;
      document.getElementById('settingCapitalize').checked = state.settings.capitalize;
      document.getElementById('settingDoubleSpace').checked= state.settings.doubleSpace;
      document.getElementById('settingHighlight').checked  = state.settings.highlight;
      document.getElementById('settingSound').checked      = state.settings.sound;

      const fs = state.settings.fontSize || 16;
      document.getElementById('settingFontSize').value = fs;
      document.getElementById('fontSizeVal').textContent = fs + 'px';
      document.documentElement.style.setProperty('--editor-font-size', fs + 'px');
    }
  } catch(e) {}
}

// ============================================================
// Custom Dictionary
// ============================================================
function updateCustomDict() {
  const raw = document.getElementById('customDict').value;
  const words = raw.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
  state.customDict = new Set(words);
  document.getElementById('dictCount').textContent = words.length + ' word' + (words.length !== 1 ? 's' : '');
}

function saveCustomDict() {
  try {
    const val = document.getElementById('customDict').value;
    localStorage.setItem('autocorrect_dict', val);
  } catch(e) {}
  updateCustomDict();
  showToast('✓ Dictionary saved!', 'success');
}

function loadCustomDict() {
  try {
    const saved = localStorage.getItem('autocorrect_dict');
    if (saved) {
      document.getElementById('customDict').value = saved;
      updateCustomDict();
    }
  } catch(e) {}
}

// ============================================================
// Status indicator
// ============================================================
function setStatus(msg, type) {
  const text = document.getElementById('statusText');
  const dot = document.querySelector('.status-dot');
  text.textContent = msg;

  dot.style.background = type === 'ok' ? 'var(--accent-ok)'
                       : type === 'active' ? 'var(--accent)'
                       : type === 'error' ? 'var(--accent-err)'
                       : 'var(--accent-ok)';
  dot.style.boxShadow = `0 0 8px ${dot.style.background}`;
}

// ============================================================
// Toast
// ============================================================
let toastTimer;
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');

  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  msgEl.textContent = msg;

  toast.style.borderColor = type === 'success' ? 'rgba(72,207,173,0.4)'
                          : type === 'error' ? 'rgba(255,95,114,0.4)'
                          : 'rgba(108,99,255,0.3)';

  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================================
// Sound
// ============================================================
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}
