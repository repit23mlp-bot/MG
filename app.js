const modal=document.querySelector('#gameModal'),area=document.querySelector('#gameArea'),action=document.querySelector('#gameAction');
const scoreEl=document.querySelector('#gameScore'),roundEl=document.querySelector('#roundValue'),livesEl=document.querySelector('#livesValue');
const catalog={
 proportion:{type:'ПРИКЛЮЧЕНИЕ ЕНОТА',title:'Пропорции на тропе',text:'Найди неизвестное число. За каждый ответ мост становится прочнее.',rounds:5,reward:30,stars:3},
 equation:{type:'ОПЫТ ВЫДРЫ',title:'Лаборатория уравнений',text:'Найди x и заряди лесную энергетическую установку.',rounds:5,reward:40,stars:4},
 tournament:{type:'КУБОК ЛИСЁНКА',title:'Турнир 11×11',text:'Реши семь примеров на умножение и деление. Чем быстрее — тем больше очков!',rounds:7,reward:50,stars:5}
};
let stats=JSON.parse(localStorage.getItem('logicory-stats')||'{"xp":0,"coins":0,"stars":0,"wins":0,"score":0}');
let current,round,score,lives,answer,locked,startedAt;
function save(){localStorage.setItem('logicory-stats',JSON.stringify(stats));renderStats()}
function renderStats(){const xpValue=document.querySelector('#xpValue'),xpFill=document.querySelector('#xpFill');if(xpValue)xpValue.textContent=stats.xp%1000;if(xpFill)xpFill.style.width=(stats.xp%1000)/10+'%';document.querySelector('#coinsValue').textContent=stats.coins;document.querySelector('#starsValue').textContent=stats.stars;document.querySelector('#totalScore').textContent=stats.score;document.querySelector('#winsValue').textContent=stats.wins}
renderStats();
document.querySelectorAll('.game-card').forEach(c=>c.onclick=()=>c.dataset.game==='proportion'?window.openTrailGame():c.dataset.game==='equation'?window.openLabGame():c.dataset.game==='tournament'?window.openTournament():openGame(c.dataset.game));
document.querySelector('.close').onclick=()=>modal.close();modal.onclick=e=>{if(e.target===modal)modal.close()};
document.querySelector('#resetProgress').onclick=()=>{if(confirm('Сбросить все очки, монеты и награды?')){stats={xp:0,coins:0,stars:0,wins:0,score:0};save()}};
function openGame(id){current=id;const g=catalog[id];document.querySelector('#gameType').textContent=g.type;document.querySelector('#gameTitle').textContent=g.title;document.querySelector('#gameText').textContent=g.text;area.innerHTML='<div class="animal-ready">'+({proportion:'🦝',equation:'🦦',tournament:'🦊'}[id])+'<strong>Готов к приключению?</strong></div>';action.hidden=false;action.textContent='НАЧАТЬ';action.onclick=start;score=0;round=0;lives=3;updateHud();modal.showModal()}
function start(){score=0;round=0;lives=3;startedAt=Date.now();action.hidden=true;nextQuestion()}
function updateHud(){scoreEl.textContent='ОЧКИ: '+score;roundEl.textContent='ЗАДАНИЕ '+Math.min(round+1,catalog[current].rounds)+' / '+catalog[current].rounds;livesEl.textContent='♥ '.repeat(lives).trim()||'—'}
function nextQuestion(){locked=false;updateHud();if(current==='proportion')makeProportion();if(current==='equation')makeEquation();if(current==='tournament')makeTournament()}
function makeProportion(){const a=2+rnd(7),b=2+rnd(7),k=2+rnd(6);answer=b*k;showQuestion(`${a} : ${b} = ${a*k} : ?`,answer,[answer+b,Math.max(1,answer-a)])}
function makeEquation(){const x=2+rnd(18),a=2+rnd(10),mult=2+rnd(5);answer=x;round%2?showQuestion(`${mult}x + ${a} = ${mult*x+a}`,answer,[x+mult,Math.max(1,x-a)]):showQuestion(`x − ${a} = ${x-a}`,answer,[x+a,Math.max(1,x-2)])}
function makeTournament(){const a=2+rnd(10),b=2+rnd(10),divide=round%2===1;answer=divide?b:a*b;showQuestion(divide?`${a*b} ÷ ${a} = ?`:`${a} × ${b} = ?`,answer,[answer+a,Math.max(1,answer-b)],true)}
function rnd(n){return Math.floor(Math.random()*n)}
function showQuestion(label,right,wrong,timed=false){let options=[right,...wrong];while(new Set(options).size<3)options[2]++;options.sort(()=>Math.random()-.5);area.innerHTML=`<div class="challenge"><div class="question">${label}</div>${timed?'<div class="timerbar"><i></i></div>':''}<div class="answers">${options.map(x=>`<button>${x}</button>`).join('')}</div><p class="hint">Выбери правильный ответ</p></div>`;area.querySelectorAll('.answers button').forEach(b=>b.onclick=()=>check(+b.textContent,b));if(timed){const bar=area.querySelector('.timerbar i');requestAnimationFrame(()=>bar.style.width='0%')}}
function check(value,button){if(locked)return;locked=true;if(value===answer){const speed=Math.max(0,50-Math.floor((Date.now()-startedAt)/1000));const points=100+(current==='tournament'?speed:0);score+=points;button.classList.add('correct');button.textContent='✓  '+button.textContent;setTimeout(advance,650)}else{lives--;button.classList.add('wrong');button.textContent='×';locked=false;updateHud();if(lives<=0)setTimeout(()=>finish(false),500)}updateHud()}
function advance(){round++;if(round>=catalog[current].rounds)finish(true);else nextQuestion()}
function finish(win){const g=catalog[current];action.hidden=false;action.textContent='СЫГРАТЬ ЕЩЁ';action.onclick=start;if(win){stats.xp+=score;stats.score+=score;stats.coins+=g.reward;stats.stars+=g.stars;stats.wins++;save();area.innerHTML=`<div class="result"><span>🏆</span><h3>Победа!</h3><p>Награда: <b>+${score} очков</b><br>★ +${g.stars} &nbsp; ● +${g.reward}</p></div>`}else area.innerHTML='<div class="result"><span>🌿</span><h3>Попробуй ещё</h3><p>Животные верят в тебя!</p></div>'}
window.addEventListener('trail-complete',e=>{const d=e.detail;stats.xp+=d.xp;stats.score+=d.xp;stats.coins+=d.coins;stats.stars+=d.stars;stats.wins++;save()});
window.addEventListener('lab-complete',e=>{const d=e.detail;stats.xp+=d.xp;stats.score+=d.xp;stats.coins+=d.coins;stats.stars+=d.stars;stats.wins++;save()});
window.addEventListener('tournament-complete',e=>{const d=e.detail;stats.xp+=d.xp;stats.score+=d.score;stats.coins+=d.coins;stats.stars+=d.stars;stats.wins++;save()});
