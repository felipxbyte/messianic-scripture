"use strict";
const bookSelect=document.getElementById("book"), chapters=document.getElementById("chapters");
const title=document.getElementById("title"), verseList=document.getElementById("verses");
const chapterLabel=document.getElementById("chapterLabel"), chapterCount=document.getElementById("chapterCount");
const prev=document.getElementById("prev"), next=document.getElementById("next");
const versionSelect=document.getElementById("version"), translationTag=document.getElementById("translationTag");
const offlineStatus=document.getElementById("offlineStatus");
const menuToggle=document.getElementById("menuToggle"), mainNav=document.getElementById("mainNav");
const backdrop=document.getElementById("drawerBackdrop");
const themeToggle=document.getElementById("themeToggle"), drawerTheme=document.getElementById("drawerTheme");
const closeMenu=document.getElementById("closeMenu");

const KJV_IDS=["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
const KJV_BOOKS=[
"Bereshith","Sh'moth","Wayykirah","Bemidbar","Debarim","Yahushua","Shoftim","Ruth",
"1 Shemuel","2 Shemuel","1 Melakim","2 Melakim","1 Dibre Hayamim","2 Dibre Hayamim","Ezra","NehemYah",
"Hadassah","Iyob","Tehillim","Mishle","Koheleth","Shir Hashirim","YeshaYah","YeremYah",
"Ekah","Yehezkel","Daniel","Hoshea","Yah-El","Amos","ObadYah","Yonah","Mikah","Nahum",
"Habakkuk","TzephanYah","Haggai","ZecharYah","Mal'aki","MattitYah","Marcos","Lucas","Yachanan","Maaseh",
"Romiyim","1 Corintiyim","2 Corintiyim","Galatiyim","Ephesiyim","Pilippiyim","Kolasim",
"1 Tesalonikim","2 Tesalonikim","1 Timotiyos","2 Timotiyos","Titus","Felimon","Ibrim",
"Yaacob","1 Kepha","2 Kepha","1 Yachanan","2 Yachanan","3 Yachanan","Yahudah","Chazon"];
let bookIndex=0, chapterIndex=0, activeVersion="ceb", kjvBookCache=new Map(), currentChapters=[];

function rename(text){
  return String(text??'')
    .replace(/\bJesu\b/gi,'Yahshua')
    .replace(/\bJesus\b/gi,'Yahshua')
    .replace(/\bLord\b/gi,'YAHWEH')
    .replace(/\bGod\b/gi,'Elohim')
    .replace(/\bHallelujah\b/gi,'HalleluYah');
}
function correctCebuano(text){
  // Conservative display-time proofreading. Only apply high-confidence
  // spelling/spacing and recurring Cebuano subject-marker corrections.
  return rename(text)
    .replace(/\bYahweh\b/gi,"YAHWEH")
    .replace(/\s+/g," ").trim()
    .replace(/\s+([,.;:!?])/g,"$1")
    .replace(/([,;:])(?=[A-Za-zÀ-ÿ])/g,"$1 ")
    .replace(/\b(miingon|Miingon)\s+YAHWEH\b/g,"$1 si YAHWEH")
    .replace(/\b(Nahimuot|nahimuot)\s+YAHWEH\b/g,"$1 si YAHWEH")
    .replace(/\b(Nagpahuros|nagpahuros)\s+YAHWEH\b/g,"$1 si YAHWEH")
    .replace(/\b(mibiya|Mibiya)\s+YAHWEH\b/g,"$1 si YAHWEH")
    .replace(/\bNakita\s+YAHWEH\b/g,"Nakita ni YAHWEH")
    .replace(/\bAng\s+Ginoong\s+YAHWEH\b/g,"Si YAHWEH Elohim")
    .replace(/\bthe\s+Lord\s+God\b/g,"YAHWEH Elohim")
    .replace(/\bThe\s+Lord\s+God\b/g,"YAHWEH Elohim")
    .replace(/\bang\s+Ginoong\s+YAHWEH\b/g,"si YAHWEH Elohim");
}
function correctEnglishNames(text){
  // Apply the requested Messianic name replacements without altering KJV grammar.
  return rename(text);
}
function setTheme(dark){
  document.documentElement.dataset.theme=dark?"dark":"light";
  localStorage.setItem("messianic-theme",dark?"dark":"light");
  themeToggle.innerHTML=dark?"☀ <span>Light mode</span>":"☾ <span>Dark mode</span>";
  drawerTheme.textContent=dark?"☀ Light mode":"☾ Dark mode";
}
function toggleTheme(){setTheme(document.documentElement.dataset.theme!=="dark");}
themeToggle.addEventListener("click",toggleTheme); drawerTheme.addEventListener("click",toggleTheme);
setTheme(localStorage.getItem("messianic-theme")==="dark");

function openDrawer(open){
  mainNav.classList.toggle("open",open); backdrop.classList.toggle("show",open);
  menuToggle.setAttribute("aria-expanded",String(open));
  document.body.classList.toggle("drawer-open",open);
}
menuToggle.addEventListener("click",()=>openDrawer(!mainNav.classList.contains("open")));
closeMenu.addEventListener("click",()=>openDrawer(false));
backdrop.addEventListener("click",()=>openDrawer(false));
mainNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>openDrawer(false)));

function activeBookName(){return activeVersion==="kjv"?KJV_BOOKS[bookIndex]:BIBLE_DATA[bookIndex].name;}
function populateBooks(){
  bookSelect.replaceChildren();
  const names=activeVersion==="kjv"?KJV_BOOKS:BIBLE_DATA.map(b=>b.name);
  names.forEach((name,i)=>{const o=document.createElement("option");o.value=i;o.textContent=name;bookSelect.appendChild(o);});
  bookIndex=Math.min(bookIndex,names.length-1);bookSelect.value=String(bookIndex);
}
function getCebuanoChapters(){return BIBLE_DATA[bookIndex].chapters;}
function normalizeKJV(raw){
  // Repository files use chapter objects containing verse objects; tolerate common variants.
  let source=raw.chapters||raw;
  if(!Array.isArray(source)) source=Object.keys(source).sort((a,b)=>Number(a)-Number(b)).map(k=>source[k]);
  return source.map((ch,i)=>{
    let vs=ch.verses||ch;
    if(!Array.isArray(vs)) vs=Object.keys(vs).sort((a,b)=>Number(a)-Number(b)).map(k=>({verse:k,text:vs[k]}));
    return {number:String(ch.chapter||ch.number||i+1),verses:vs.map((v,j)=>({number:String(v.verse||v.number||j+1),text:String(v.text||v.value||"")}))};
  });
}
async function loadKJVBook(){
  const name=KJV_BOOKS[bookIndex];
  if(kjvBookCache.has(name)) return kjvBookCache.get(name);
  const url="https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/kjv/books/"+KJV_IDS[bookIndex]+".json";
  offlineStatus.textContent="Loading "+name+" (first use requires internet)…";
  const cached=localStorage.getItem("kjv-book-"+bookIndex);
  if(cached){const parsed=JSON.parse(cached);const result=normalizeKJV(parsed);kjvBookCache.set(name,result);return result;}
  const response=await fetch(url);
  if(!response.ok) throw new Error("Could not retrieve the KJV book ("+response.status+").");
  const raw=await response.json(), result=normalizeKJV(raw);
  kjvBookCache.set(name,result);
  try{localStorage.setItem("kjv-book-"+bookIndex,JSON.stringify(raw));}catch(e){/* Storage may be full; current book remains usable. */}
  offlineStatus.textContent="KJV book loaded. This browser may retain it for offline reading.";
  return result;
}
function buildChapterButtons(){
  chapters.replaceChildren();
  currentChapters.forEach((chapter,index)=>{
    const b=document.createElement("button");b.type="button";b.textContent=chapter.number;
    b.setAttribute("aria-label","Chapter "+chapter.number);
    b.addEventListener("click",()=>{chapterIndex=index;showChapter();});
    chapters.appendChild(b);
  });
}
function showChapter(){
  const bookName=activeBookName(), chapter=currentChapters[chapterIndex];
  if(!chapter)return;
  title.textContent=bookName+" "+chapter.number;
  chapterLabel.textContent=bookName+" · Chapter "+chapter.number;
  chapterCount.textContent=currentChapters.length+" total";
  translationTag.textContent=activeVersion==="kjv"?"ENGLISH · KJV":"CEBUANO";
  verseList.replaceChildren();
  chapter.verses.forEach(v=>{
    const row=document.createElement("div");row.className="verse";
    const number=document.createElement("span");number.className="vn";number.textContent=v.number;
    const text=document.createElement("span");text.className="vt";
    text.textContent=activeVersion==="ceb"?correctCebuano(v.text):correctEnglishNames(v.text);
    row.append(number,text);verseList.appendChild(row);
  });
  [...chapters.children].forEach((b,i)=>{b.classList.toggle("active",i===chapterIndex);if(i===chapterIndex)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  prev.disabled=chapterIndex===0;next.disabled=chapterIndex===currentChapters.length-1;
}
async function refresh(){
  verseList.innerHTML='<p class="loading">Loading Scripture…</p>';
  try{
    currentChapters=activeVersion==="ceb"?getCebuanoChapters():await loadKJVBook();
    chapterIndex=Math.min(chapterIndex,currentChapters.length-1);
    buildChapterButtons();showChapter();
    if(activeVersion==="ceb")offlineStatus.textContent="Cebuano Bible data is included offline.";
  }catch(err){
    verseList.replaceChildren();const p=document.createElement("p");p.className="error";
    p.textContent=err.message+" Connect to the internet once to load this KJV book.";
    verseList.appendChild(p);offlineStatus.textContent="This KJV book has not yet been saved on this device.";
  }
}
versionSelect.addEventListener("change",()=>{activeVersion=versionSelect.value;bookIndex=0;chapterIndex=0;populateBooks();refresh();});
bookSelect.addEventListener("change",()=>{bookIndex=Number(bookSelect.value);chapterIndex=0;refresh();});
prev.addEventListener("click",()=>{if(chapterIndex>0){chapterIndex--;showChapter();}});
next.addEventListener("click",()=>{if(chapterIndex<currentChapters.length-1){chapterIndex++;showChapter();}});
populateBooks();refresh();
