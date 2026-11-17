const slides = [...document.querySelectorAll('main section')];
const nav = document.querySelector('nav');
const play = document.querySelector('#play');
const bar = document.querySelector('.progress i');
const range = document.querySelector('.comparison input');
const durations = [14000, 31000, 22000, 22000, 24000, 30000, 24000, 29000, 25000];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let running = !reduced;
let current = 0;
let elapsed = 0;
let previousTime = performance.now();
let manualComparison = false;

function setPlaying(value) {
  running = value;
  play.textContent = running ? 'Пауза' : 'Показ';
  play.setAttribute('aria-label', running ? 'Призупинити автопоказ' : 'Продовжити автопоказ');
}
function show(index) {
  current = (index + slides.length) % slides.length;
  elapsed = 0;
  manualComparison = false;
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
    nav.children[i].setAttribute('aria-current', String(i === current));
  });
  slides[current].scrollTop = 0;
  history.replaceState(null, '', '#' + (current + 1));
}
function fromHash() {
  const n = Number(location.hash.slice(1));
  show(Number.isInteger(n) && n >= 1 && n <= slides.length ? n - 1 : 0);
}
slides.forEach((slide, i) => {
  const link = document.createElement('button');
  link.textContent = '0' + (i + 1);
  link.setAttribute('aria-label', slide.getAttribute('aria-label'));
  link.onclick = () => show(i);
  nav.append(link);
});
const ingredients = [
  ['0% 0%', '-17vw', '-19vh', '-18deg'], ['50% 0%', '8vw', '-23vh', '22deg'],
  ['100% 0%', '18vw', '-12vh', '36deg'], ['50% 100%', '-14vw','18vh','-28deg']
];
ingredients.forEach(([pos,x,y,r],i) => {
  const sprite = document.createElement('i');
  for (const [key,val] of Object.entries({pos,x,y,r,d:i*.12+'s'})) sprite.style.setProperty('--'+key,val);
  document.querySelector('.flights').append(sprite);
});
function compare(value) {
  range.value = value;
  range.parentNode.style.setProperty('--pos', range.value + '%');
}
range.oninput = () => { manualComparison = true; compare(range.value); setPlaying(false); };
range.onpointerdown = () => { manualComparison = true; setPlaying(false); };
document.querySelector('#prev').onclick = () => show(current - 1);
document.querySelector('#next').onclick = () => show(current + 1);
play.onclick = () => setPlaying(!running);
const full = document.querySelector('#full');
full.hidden = !document.fullscreenEnabled;
full.onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { full.hidden = true; }
};
document.addEventListener('keydown', e => {
  if (e.target.matches('input,button,a') || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'ArrowRight') show(current+1);
  if (e.key === 'ArrowLeft') show(current-1);
  if (e.code === 'Space') {e.preventDefault();setPlaying(!running);}
});
document.addEventListener('visibilitychange', () => { previousTime = performance.now(); });
window.addEventListener('hashchange', fromHash);
function frame(now) {
  if (running && !document.hidden) elapsed += Math.min(now - previousTime, 250);
  previousTime = now;
  if (elapsed >= durations[current]) show(current + 1);
  bar.style.transform = 'scaleX(' + elapsed / durations[current] + ')';
  if (slides[current].contains(range) && !manualComparison && !reduced && running) {
    compare(50 + 43 * Math.sin(elapsed / 3000));
  }
  requestAnimationFrame(frame);
}
setPlaying(running);
fromHash();
requestAnimationFrame(frame);
