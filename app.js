/* حس‌نگار — PWA آفلاین ثبت و تنظیم احساس
   طراحی: دو مسیر «ثبت سریع» و «تحلیل عمیق» + ابزارها + سوابق.
   ذخیره‌سازی: localStorage (فقط روی دستگاه).
*/

/* ===== داده‌ها ===== */
const EMOTIONS_COMMON = [
  'اضطراب','استرس','ترس','غم','خشم','حسادت','شرم','گناه','حقارت','ناامیدی','بی‌قراری',
  'آرامش','شادی','امید','هیجان','رضایت','افتخار','عشق','سپاس','انگیزه'
];

const BODY_SPOTS = [
  'گلو','سینه','شکم','سر','فک/گردن','کل بدن','نامشخص'
];

const NEED_INFO = {
  'بقا 🛡️': 'امنیت، سلامت، پول، نظم، کاهش ریسک.',
  'عشق و تعلق 💞': 'ارتباط، پذیرفته‌شدن، صمیمیت، حمایت.',
  'قدرت و ارزشمندی 💪': 'موثر بودن، احترام، نتیجه/پیشرفت، شایستگی.',
  'آزادی 🕊️': 'انتخاب، استقلال، مرزبندی، اختیار.',
  'تفریح و لذت 🎨': 'سرگرمی، خلاقیت، بازی، کنجکاوی.'
};
const NEEDS = Object.keys(NEED_INFO);

const TOOLBOX = [
  {
    id: 'breath_box',
    title: 'تنفس جعبه‌ای ۴×۴×۴×۴',
    tag: 'بدن/استرس',
    when: 'وقتی شدت ۶ به بالا است یا ضربان/تنش بالاست.',
    steps: [
      '۴ ثانیه دم',
      '۴ ثانیه نگه‌دار',
      '۴ ثانیه بازدم',
      '۴ ثانیه نگه‌دار',
      '۴ دور تکرار'
    ],
  },
  {
    id: 'ground_54321',
    title: 'گراندینگ ۵–۴–۳–۲–۱',
    tag: 'بدن/حضور',
    when: 'وقتی ذهن قفل کرده یا بدنت می‌لرزد/می‌پرد.',
    steps: [
      '۵ چیز که می‌بینی',
      '۴ چیز که لمس می‌کنی',
      '۳ چیز که می‌شنوی',
      '۲ چیز که بو می‌کشی',
      '۱ چیز که مزه می‌کنی'
    ]
  },
  {
    id: 'act_defusion',
    title: 'ACT: جداشدن از فکر (Defusion)',
    tag: 'ذهن/نشخوار',
    when: 'وقتی فکرها هی تکرار می‌شوند (مقایسه، فاجعه‌سازی…).',
    steps: [
      'جمله را این‌طور بگو: «دارم این فکر را تجربه می‌کنم که …»',
      'نامش را بگذار: «ذهنم دارد مقایسه پخش می‌کند.»',
      'بعد یک عمل کوچک انتخاب کن (۲–۱۰ دقیقه)'
    ]
  },
  {
    id: 'cbt_fact_story',
    title: 'CBT: جدا کردن «واقعیت» از «داستان»',
    tag: 'ذهن/شفاف‌سازی',
    when: 'وقتی معنی‌سازی سریع، حس را شعله‌ور کرده.',
    steps: [
      'واقعیتِ قابل مشاهده را بنویس (بدون تفسیر).',
      'داستان/تعبیر ذهن را بنویس.',
      'یک تفسیر جایگزینِ متعادل اضافه کن.'
    ]
  },
  {
    id: 'self_compassion',
    title: 'خود-شفقت ۶۰ ثانیه‌ای (Self-Compassion)',
    tag: 'شرم/حقارت',
    when: 'وقتی شرم، حقارت یا خودسرزنش فعال است.',
    steps: [
      'دست روی سینه/شکم: «الان سخت است.»',
      'نام‌گذاری: «این شرم/ترس است.»',
      'انسانیت مشترک: «خیلی‌ها این حس را تجربه می‌کنند.»',
      'مهربانی: «من می‌توانم با خودم مهربان‌تر باشم.»'
    ]
  },
  {
    id: 'savor',
    title: 'لذت‌بُردن آگاهانه (Savoring) — برای حس خوب',
    tag: 'مثبت/تثبیت',
    when: 'وقتی حس خوب داری و می‌خواهی تثبیتش کنی.',
    steps: [
      '۳۰ ثانیه حس بدنی را پیدا کن (گرمی، سبک شدن…).',
      '۳ چیز که باعث این حس شد را نام ببر.',
      'یک عکس/یادداشت کوتاه ثبت کن.',
      'یک اقدام کوچک برای ادامه‌دادنش انتخاب کن.'
    ]
  },
  {
    id: 'cooldown',
    title: 'قانون Cooldown',
    tag: 'تصمیم/ریسک',
    when: 'وقتی شدت ۷+ است: تصمیم مهم/معامله/پیام حساس ممنوع.',
    steps: [
      'اول بدن را تنظیم کن (تنفس/گراندینگ).',
      'بعد تصمیم را حداقل ۲۰ دقیقه عقب بینداز.',
      'وقتی شدت < ۶ شد، دوباره بررسی کن.'
    ]
  },
];

/* ===== وضعیت ===== */
const STORE_KEY = 'hesnegar_records_v1';

const state = {
  // quick
  qc: {
    valence: 'بد',
    emotions: [],
    intensity: 5,
    body: BODY_SPOTS[1],
    trigger: '',
    mind: '',
    toolId: '',
    nextAction: '',
    after: 4,
    summaryText: ''
  },
  // deep
  dd: {
    emotionsText: '',
    intensity: 6,
    body: BODY_SPOTS[1],
    trigger: '',
    facts: '',
    story: '',
    underlyingText: '',
    rumination: 'بله',
    needs: [],
    voice: 'بالغ',
    first: '',
    adultLine: '',
    toolId: '',
    plan: '',
    after: 4,
    nextTime: '',
    summaryText: ''
  },
  nav: ['home'],
};

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

/* ===== ناوبری ===== */
function show(screen, {push=true}={}){
  $$('.screen').forEach(sc=>sc.classList.add('hidden'));
  const target = $(`.screen[data-screen="${screen}"]`);
  if(!target) return;
  target.classList.remove('hidden');
  if(push){
    const last = state.nav[state.nav.length-1];
    if(last !== screen) state.nav.push(screen);
  }
  window.scrollTo({top:0, behavior:'instant'});
}

function back(){
  if(state.nav.length<=1){ show('home', {push:false}); return; }
  state.nav.pop();
  show(state.nav[state.nav.length-1], {push:false});
}

$$('[data-back]').forEach(b=>b.addEventListener('click', back));

/* ===== ذخیره‌سازی ===== */
function loadStore(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); }
  catch{ return []; }
}
function saveStore(list){
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}
function addRecord(record){
  const list = loadStore();
  list.unshift(record);
  saveStore(list);
}

function downloadJSON(obj, filename){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ===== کمکی‌ها ===== */
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function nowISO(){ return new Date().toISOString(); }
function fmtDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString('fa-IR', {dateStyle:'medium', timeStyle:'short'});
  }catch{ return iso; }
}

function setBadge(el, n, kind=''){
  el.textContent = String(n);
  el.classList.remove('good','warn','bad');
  if(kind) el.classList.add(kind);
}

function toLines(arr){ return arr.filter(Boolean).map(x=>`• ${x}`).join('\n'); }

function safeAlert(msg){
  // موبایل‌ها بعضی وقت‌ها alert زیاد آزاردهنده است.
  // ولی برای نسخهٔ ساده از alert استفاده می‌کنیم.
  alert(msg);
}

/* ===== رندر چیپ‌های احساس (Quick) ===== */
function renderQCEmotions(){
  const box = $('#qcEmotionChips');
  const list = EMOTIONS_COMMON;
  box.innerHTML = list.map(e=>`<button class="chip ${state.qc.emotions.includes(e)?'on':''}" data-qc-em="${e}">${e}</button>`).join('');
  box.querySelectorAll('[data-qc-em]').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      const val = ev.currentTarget.dataset.qcEm;
      toggleIn(state.qc.emotions, val);
      renderQCEmotions();
      renderQCSelected();
    });
  });
  renderQCSelected();
}

function renderQCSelected(){
  const host = $('#qcEmotionSelected');
  host.textContent = state.qc.emotions.length ? `انتخاب‌ها: ${state.qc.emotions.join('، ')}` : '— هنوز انتخابی نداری.';
}

function toggleIn(arr, v){
  const i = arr.indexOf(v);
  if(i>-1) arr.splice(i,1);
  else arr.push(v);
}

/* ===== پیشنهاد ابزار بر اساس وضعیت ===== */
function recommendTools({valence, intensity, rumination}){
  const ids = [];
  if(valence === 'خوب'){
    ids.push('savor');
  }else{
    if(intensity>=7) ids.push('cooldown');
    if(intensity>=6) ids.push('breath_box', 'ground_54321');
    if(rumination==='بله') ids.push('act_defusion', 'cbt_fact_story');
    ids.push('self_compassion');
  }
  // unique
  return Array.from(new Set(ids)).map(id=>TOOLBOX.find(t=>t.id===id)).filter(Boolean);
}

function toolCard(t){
  const steps = (t.steps||[]).map(s=>`<li>${s}</li>`).join('');
  return `
    <div class="card">
      <div class="row wrap" style="justify-content:space-between">
        <div>
          <b>${t.title}</b>
          <div class="helper">${t.tag} • ${t.when}</div>
        </div>
        <span class="badge">${t.id}</span>
      </div>
      <ol class="helper" style="margin:8px 0 0">${steps}</ol>
    </div>
  `;
}

function renderToolChips(hostId, infoId, recommended, selectedIdSetter){
  const chipsHost = $(hostId);
  const infoHost = $(infoId);
  chipsHost.innerHTML = recommended.map(t=>`<button class="chip ${t.id===getSelectedToolId(selectedIdSetter)?'on':''}" data-tool="${t.id}">${t.title}</button>`).join('');
  chipsHost.querySelectorAll('[data-tool]').forEach(b=>{
    b.addEventListener('click', (ev)=>{
      const id = ev.currentTarget.dataset.tool;
      selectedIdSetter(id);
      renderToolChips(hostId, infoId, recommended, selectedIdSetter);
    });
  });

  const selected = TOOLBOX.find(t=>t.id===getSelectedToolId(selectedIdSetter));
  infoHost.innerHTML = selected ? toolCard(selected) : `<div class="helper">یک ابزار انتخاب کن تا توضیحش نمایش داده شود.</div>`;
}

function getSelectedToolId(setterFn){
  // hack: setterFn knows where state stored; we also expose getter via property.
  return setterFn._get ? setterFn._get() : '';
}

/* ===== Quick Flow ===== */
function resetQuick(){
  state.qc = {
    valence: 'بد',
    emotions: [],
    intensity: 5,
    body: BODY_SPOTS[1],
    trigger: '',
    mind: '',
    toolId: '',
    nextAction: '',
    after: 4,
    summaryText: ''
  };
  $('#qcEmotionInput').value = '';
  $('#qcTrigger').value = '';
  $('#qcMind').value = '';
  $('#qcNextAction').value = '';
  $('#qcIntensity').value = String(state.qc.intensity);
  $('#qcAfter').value = String(state.qc.after);
  $('#qcBody').value = state.qc.body;
  setBadge($('#qcIntensityVal'), state.qc.intensity);
  setBadge($('#qcAfterVal'), state.qc.after);
  $('#qcValence').value = state.qc.valence;
  $('#qcSummary').textContent = '';
  $('#qcToolInfo').innerHTML = '';
  $('#qcSafety').classList.add('hidden');
}

function buildQuickSummary(){
  const q = state.qc;
  const createdAt = nowISO();
  const lines = [
    `📝 حس‌نگار — ثبت سریع`,
    `🕒 زمان: ${fmtDate(createdAt)}`,
    `🔎 نوع حس: ${q.valence}`,
    `💬 احساس(ها): ${q.emotions.length ? q.emotions.join('، ') : '—'}`,
    `🌡️ شدت: ${q.intensity}/10`,
    `🧍 بدن: ${q.body || '—'}`,
    '',
    `⚡ تریگر: ${q.trigger || '—'}`,
    `🧠 جمله ذهن: ${q.mind || '—'}`,
    '',
    `🧰 ابزار انتخابی: ${q.toolId ? TOOLBOX.find(t=>t.id===q.toolId)?.title || q.toolId : '—'}`,
    `✅ قدم بعدی کوچک: ${q.nextAction || '—'}`,
    `📉 شدت بعد از تکنیک: ${q.after}/10`,
  ];
  return { createdAt, text: lines.join('\n') };
}

function updateQCSafety(){
  const box = $('#qcSafety');
  const q = state.qc;
  const warn = q.intensity >= 7 && q.valence !== 'خوب';
  if(!warn){ box.classList.add('hidden'); box.innerHTML=''; return; }
  box.classList.remove('hidden');
  box.innerHTML = `
    <b>⛔ پیشنهاد ایمنی</b>
    <div class="helper">شدت بالاست. تا وقتی شدت زیر ۶ نیومده، تصمیم مهم/معامله/پیام حساس نده. اول یک ابزار بدن‌محور انجام بده.</div>
    <div class="row wrap">
      <span class="badge warn">Cooldown</span>
      <span class="badge warn">شدت ${q.intensity}/10</span>
    </div>
  `;
}

// Quick step 1 interactions
$('#qcValence').addEventListener('change', (e)=>{
  state.qc.valence = e.target.value;
});

$('#qcIntensity').addEventListener('input', (e)=>{
  state.qc.intensity = clamp(parseInt(e.target.value,10),0,10);
  setBadge($('#qcIntensityVal'), state.qc.intensity, state.qc.intensity>=7?'bad': state.qc.intensity>=4?'warn':'good');
});

$('#qcBody').addEventListener('change', (e)=>{ state.qc.body = e.target.value; });

$('#qcEmotionAdd').addEventListener('click', ()=>{
  const t = $('#qcEmotionInput').value.trim();
  if(!t) return;
  if(!EMOTIONS_COMMON.includes(t)) EMOTIONS_COMMON.push(t);
  if(!state.qc.emotions.includes(t)) state.qc.emotions.push(t);
  $('#qcEmotionInput').value = '';
  renderQCEmotions();
});

$('#toQuick2').addEventListener('click', ()=>{
  state.qc.valence = $('#qcValence').value;
  state.qc.body = $('#qcBody').value;
  if(!state.qc.emotions.length){
    // اجازه می‌دهیم بدون انتخاب هم ادامه دهد (برای اینکه friction کم باشد)
    if(!confirm('هیچ احساسی انتخاب نشده. ادامه بدهم؟')) return;
  }
  show('quick-2');
});

// Quick step 2
$('#toQuick3').addEventListener('click', ()=>{
  state.qc.trigger = $('#qcTrigger').value.trim();
  state.qc.mind = $('#qcMind').value.trim();
  updateQCSafety();

  // توصیه ابزارها
  const rec = recommendTools({valence: state.qc.valence, intensity: state.qc.intensity, rumination: 'بله'});
  const setter = (id)=>{ state.qc.toolId = id; };
  setter._get = ()=>state.qc.toolId;

  // اگر هیچ ابزاری انتخاب نشده، اولین توصیه را پیش‌فرض بگذار
  if(!state.qc.toolId && rec[0]) state.qc.toolId = rec[0].id;

  renderToolChips('#qcToolChips', '#qcToolInfo', rec, setter);

  show('quick-3');
  // خلاصهٔ اولیه
  refreshQCSummary();
});

$('#qcNextAction').addEventListener('input', (e)=>{ state.qc.nextAction = e.target.value; refreshQCSummary(); });

$('#qcAfter').addEventListener('input', (e)=>{
  state.qc.after = clamp(parseInt(e.target.value,10),0,10);
  setBadge($('#qcAfterVal'), state.qc.after, state.qc.after<=3?'good': state.qc.after<=6?'warn':'bad');
  refreshQCSummary();
});

function refreshQCSummary(){
  const built = buildQuickSummary();
  state.qc.summaryText = built.text;
  $('#qcSummary').textContent = built.text;
}

$('#qcCopy').addEventListener('click', ()=>{
  const t = $('#qcSummary').textContent;
  navigator.clipboard?.writeText(t).then(()=>safeAlert('کپی شد ✅')).catch(()=>safeAlert('کپی نشد.')); 
});

$('#qcShare').addEventListener('click', ()=>{
  const t = $('#qcSummary').textContent;
  if(navigator.share){
    navigator.share({title:'حس‌نگار — ثبت سریع', text:t}).catch(()=>{});
  }else{
    navigator.clipboard?.writeText(t).then(()=>safeAlert('در کلیپ‌بورد کپی شد ✅')).catch(()=>safeAlert('کپی نشد.'));
  }
});

$('#qcSave').addEventListener('click', ()=>{
  // sync latest
  state.qc.nextAction = $('#qcNextAction').value.trim();
  refreshQCSummary();

  const record = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    type: 'quick',
    createdAt: nowISO(),
    data: {...state.qc},
    summaryText: state.qc.summaryText,
  };
  addRecord(record);
  safeAlert('ذخیره شد ✅ (فقط روی دستگاه)');
});

$('#qcGoHome').addEventListener('click', ()=>{ show('home'); });

/* ===== Deep Flow ===== */
function resetDeep(){
  state.dd = {
    emotionsText: '',
    intensity: 6,
    body: BODY_SPOTS[1],
    trigger: '',
    facts: '',
    story: '',
    underlyingText: '',
    rumination: 'بله',
    needs: [],
    voice: 'بالغ',
    first: '',
    adultLine: '',
    toolId: '',
    plan: '',
    after: 4,
    nextTime: '',
    summaryText: ''
  };
  $('#ddEmotions').value='';
  $('#ddTrigger').value='';
  $('#ddFacts').value='';
  $('#ddStory').value='';
  $('#ddUnder').value='';
  $('#ddFirst').value='';
  $('#ddAdult').value='';
  $('#ddPlan').value='';
  $('#ddNextTime').value='';

  $('#ddIntensity').value=String(state.dd.intensity);
  $('#ddAfter').value=String(state.dd.after);
  $('#ddBody').value=state.dd.body;
  $('#ddRumination').value=state.dd.rumination;
  $('#ddVoice').value=state.dd.voice;

  setBadge($('#ddIntensityVal'), state.dd.intensity);
  setBadge($('#ddAfterVal'), state.dd.after);
  $('#ddRecommendation').innerHTML='';
  $('#ddToolInfo').innerHTML='';
  $('#ddSummary').textContent='';

  renderDDNeeds();
}

function renderDDNeeds(){
  const box = $('#ddNeedChips');
  const hints = $('#ddNeedHints');
  box.innerHTML = NEEDS.map(n=>`<button class="chip ${state.dd.needs.includes(n)?'on':''}" data-need="${n}">${n}</button>`).join('');
  box.querySelectorAll('[data-need]').forEach(b=>{
    b.addEventListener('click', (ev)=>{
      const n = ev.currentTarget.dataset.need;
      toggleIn(state.dd.needs, n);
      renderDDNeeds();
    });
  });
  hints.innerHTML = NEEDS.map(n=>`<div>• <b>${n}</b>: ${NEED_INFO[n]}</div>`).join('');
}

$('#ddIntensity').addEventListener('input', (e)=>{
  state.dd.intensity = clamp(parseInt(e.target.value,10),0,10);
  setBadge($('#ddIntensityVal'), state.dd.intensity, state.dd.intensity>=7?'bad': state.dd.intensity>=4?'warn':'good');
});

$('#ddBody').addEventListener('change', (e)=>{ state.dd.body = e.target.value; });
$('#ddRumination').addEventListener('change', (e)=>{ state.dd.rumination = e.target.value; });
$('#ddVoice').addEventListener('change', (e)=>{ state.dd.voice = e.target.value; });

$('#toDeep2').addEventListener('click', ()=>{
  state.dd.emotionsText = $('#ddEmotions').value.trim();
  state.dd.trigger = $('#ddTrigger').value.trim();
  state.dd.body = $('#ddBody').value;

  if(!state.dd.emotionsText){
    if(!confirm('احساس‌ها خالیه. ادامه بدهم؟')) return;
  }
  show('deep-2');
});

$('#toDeep3').addEventListener('click', ()=>{
  state.dd.facts = $('#ddFacts').value.trim();
  state.dd.story = $('#ddStory').value.trim();
  show('deep-3');
});

$('#toDeep4').addEventListener('click', ()=>{
  state.dd.underlyingText = $('#ddUnder').value.trim();
  state.dd.rumination = $('#ddRumination').value;

  if(!state.dd.needs.length){
    if(!confirm('نیازی انتخاب نشده. ادامه بدهم؟')) return;
  }
  show('deep-4');
});

$('#toDeep5').addEventListener('click', ()=>{
  state.dd.voice = $('#ddVoice').value;
  state.dd.first = $('#ddFirst').value.trim();
  state.dd.adultLine = $('#ddAdult').value.trim();

  // پیشنهاد ابزارها
  const rec = recommendTools({valence:'بد', intensity: state.dd.intensity, rumination: state.dd.rumination});
  const setter = (id)=>{ state.dd.toolId = id; };
  setter._get = ()=>state.dd.toolId;
  if(!state.dd.toolId && rec[0]) state.dd.toolId = rec[0].id;
  renderToolChips('#ddToolChips', '#ddToolInfo', rec, setter);

  // کارت پیشنهاد ترکیبی
  const recText = [];
  if(state.dd.intensity>=7) recText.push('⛔ شدت بالاست → اول بدن را تنظیم کن (تنفس/گراندینگ) و تصمیم مهم را عقب بینداز.');
  if(state.dd.rumination==='بله') recText.push('🧠 نشخوار فعال است → Defusion + برگشت به عمل کوچک.');
  if(state.dd.needs.includes('قدرت و ارزشمندی 💪')) recText.push('💪 نیاز ارزشمندی فعال است → معیار ارزش را از «نتیجه لحظه‌ای» جدا کن و روی فرایند تمرکز کن.');

  $('#ddRecommendation').innerHTML = recText.length
    ? `<b>پیشنهاد لحظه‌ای</b><div class="helper">${recText.join('<br>')}</div>`
    : `<b>پیشنهاد لحظه‌ای</b><div class="helper">یک ابزار انتخاب کن و یک اقدام کوچک تعریف کن.</div>`;

  show('deep-5');
  refreshDDSummary();
});

$('#ddPlan').addEventListener('input', (e)=>{ state.dd.plan = e.target.value; refreshDDSummary(); });
$('#ddNextTime').addEventListener('input', (e)=>{ state.dd.nextTime = e.target.value; refreshDDSummary(); });

$('#ddAfter').addEventListener('input', (e)=>{
  state.dd.after = clamp(parseInt(e.target.value,10),0,10);
  setBadge($('#ddAfterVal'), state.dd.after, state.dd.after<=3?'good': state.dd.after<=6?'warn':'bad');
  refreshDDSummary();
});

function buildDeepSummary(){
  const d = state.dd;
  const createdAt = nowISO();
  const lines = [
    `🧭 حس‌نگار — تحلیل عمیق`,
    `🕒 زمان: ${fmtDate(createdAt)}`,
    `💬 احساس‌ها (سطح): ${d.emotionsText || '—'}`,
    `🌡️ شدت: ${d.intensity}/10`,
    `🧍 بدن: ${d.body || '—'}`,
    `⚡ تریگر: ${d.trigger || '—'}`,
    '',
    `✅ واقعیت (Facts):\n${d.facts || '—'}`,
    '',
    `🧠 داستان ذهن (Story):\n${d.story || '—'}`,
    '',
    `🌊 احساس‌های زیرین: ${d.underlyingText || '—'}`,
    `🔁 نشخوار: ${d.rumination || '—'}`,
    '',
    `🌱 نیاز(ها): ${d.needs.length ? d.needs.join('، ') : '—'}`,
    `🎭 صدای غالب درونی (TA/درونی): ${d.voice || '—'}`,
    `🧩 آشنا/ریشهٔ احتمالی: ${d.first || '—'}`,
    `🧠 جملهٔ بالغ: ${d.adultLine || '—'}`,
    '',
    `🧰 ابزار انتخابی: ${d.toolId ? TOOLBOX.find(t=>t.id===d.toolId)?.title || d.toolId : '—'}`,
    `🛠️ برنامهٔ ۵–۱۵ دقیقه‌ای:\n${d.plan || '—'}`,
    `📉 شدت بعد از تکنیک: ${d.after}/10`,
    `🔮 دفعه بعد: ${d.nextTime || '—'}`,
  ];
  return { createdAt, text: lines.join('\n') };
}

function refreshDDSummary(){
  // sync latest fields
  state.dd.plan = $('#ddPlan').value.trim();
  state.dd.nextTime = $('#ddNextTime').value.trim();
  const built = buildDeepSummary();
  state.dd.summaryText = built.text;
  $('#ddSummary').textContent = built.text;
}

$('#ddCopy').addEventListener('click', ()=>{
  const t = $('#ddSummary').textContent;
  navigator.clipboard?.writeText(t).then(()=>safeAlert('کپی شد ✅')).catch(()=>safeAlert('کپی نشد.'));
});

$('#ddShare').addEventListener('click', ()=>{
  const t = $('#ddSummary').textContent;
  if(navigator.share){
    navigator.share({title:'حس‌نگار — تحلیل عمیق', text:t}).catch(()=>{});
  }else{
    navigator.clipboard?.writeText(t).then(()=>safeAlert('در کلیپ‌بورد کپی شد ✅')).catch(()=>safeAlert('کپی نشد.'));
  }
});

$('#ddSave').addEventListener('click', ()=>{
  // sync
  state.dd.emotionsText = $('#ddEmotions').value.trim();
  state.dd.trigger = $('#ddTrigger').value.trim();
  state.dd.facts = $('#ddFacts').value.trim();
  state.dd.story = $('#ddStory').value.trim();
  state.dd.underlyingText = $('#ddUnder').value.trim();
  state.dd.first = $('#ddFirst').value.trim();
  state.dd.adultLine = $('#ddAdult').value.trim();
  state.dd.plan = $('#ddPlan').value.trim();
  state.dd.nextTime = $('#ddNextTime').value.trim();
  state.dd.rumination = $('#ddRumination').value;
  state.dd.voice = $('#ddVoice').value;
  refreshDDSummary();

  const record = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    type: 'deep',
    createdAt: nowISO(),
    data: {...state.dd},
    summaryText: state.dd.summaryText,
  };
  addRecord(record);
  safeAlert('ذخیره شد ✅ (فقط روی دستگاه)');
});

$('#ddGoHome').addEventListener('click', ()=>{ show('home'); });

/* ===== Toolkit Screen ===== */
function renderToolkit(){
  const host = $('#tkList');
  host.innerHTML = TOOLBOX.map(t=>`
    <div class="card">
      <div class="row wrap" style="justify-content:space-between">
        <div>
          <b>${t.title}</b>
          <div class="helper">${t.tag} • ${t.when}</div>
        </div>
        <span class="badge">${t.id}</span>
      </div>
      <hr class="sep">
      <ol class="helper" style="margin:0">${(t.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol>
    </div>
  `).join('');
}

$('#tkGoHome').addEventListener('click', ()=> show('home'));

/* ===== History / Patterns ===== */
function computeStats(list){
  const total = list.length;
  const last7 = list.filter(r=>{
    const d = new Date(r.createdAt);
    return (Date.now() - d.getTime()) <= 7*24*3600*1000;
  }).length;

  // top emotions
  const emoCount = new Map();
  const needCount = new Map();
  let sumIntensity = 0;
  let nIntensity = 0;

  for(const r of list){
    if(r.type==='quick'){
      for(const e of (r.data?.emotions||[])) emoCount.set(e, (emoCount.get(e)||0)+1);
      sumIntensity += (r.data?.intensity ?? 0);
      nIntensity++;
    }else{
      // deep emotions are free text; we split by ، or ,
      const text = (r.data?.emotionsText||'').replace(/،/g,',');
      text.split(',').map(s=>s.trim()).filter(Boolean).forEach(e=>emoCount.set(e,(emoCount.get(e)||0)+1));
      (r.data?.needs||[]).forEach(n=>needCount.set(n,(needCount.get(n)||0)+1));
      sumIntensity += (r.data?.intensity ?? 0);
      nIntensity++;
    }
  }

  function topK(map, k=5){
    return Array.from(map.entries()).sort((a,b)=>b[1]-a[1]).slice(0,k);
  }

  const avgIntensity = nIntensity ? Math.round((sumIntensity/nIntensity)*10)/10 : 0;
  return {
    total, last7, avgIntensity,
    topEmo: topK(emoCount, 5),
    topNeed: topK(needCount, 5),
  };
}

function renderHistory(){
  const filter = $('#hxFilter').value;
  const all = loadStore();
  const list = filter==='all' ? all : all.filter(r=>r.type===filter);

  const stats = computeStats(list);
  $('#hxStats').innerHTML = `
    <div class="kpis">
      <div class="kpi"><div class="muted">تعداد کل</div><div class="num">${stats.total}</div></div>
      <div class="kpi"><div class="muted">۷ روز اخیر</div><div class="num">${stats.last7}</div></div>
      <div class="kpi"><div class="muted">میانگین شدت</div><div class="num">${stats.avgIntensity}</div></div>
    </div>
    <div class="helper" style="margin-top:10px">
      <b>احساس‌های پرتکرار:</b><br>
      ${stats.topEmo.length ? stats.topEmo.map(([k,v])=>`${k} (${v})`).join(' • ') : '—'}
      <br>
      <b>نیازهای پرتکرار (از تحلیل عمیق):</b><br>
      ${stats.topNeed.length ? stats.topNeed.map(([k,v])=>`${k} (${v})`).join(' • ') : '—'}
    </div>
  `;

  const host = $('#hxList');
  if(!list.length){
    host.innerHTML = `<div class="helper">هنوز چیزی ذخیره نشده. از «ثبت سریع» یا «تحلیل عمیق» یک مورد ذخیره کن.</div>`;
    return;
  }

  host.innerHTML = list.map(r=>{
    const title = r.type==='quick' ? 'ثبت سریع' : 'تحلیل عمیق';
    const badge = r.type==='quick' ? 'good' : 'warn';
    const preview = (r.summaryText||'').slice(0,180) + ((r.summaryText||'').length>180?'…':'');
    return `
      <div class="item">
        <div class="row wrap" style="justify-content:space-between">
          <div><b>${title}</b> <span class="badge ${badge}">${fmtDate(r.createdAt)}</span></div>
          <div class="row wrap">
            <button class="btn" data-copy="${r.id}">کپی</button>
            <button class="btn danger" data-del="${r.id}">حذف</button>
          </div>
        </div>
        <div class="helper" style="margin-top:8px">${escapeHTML(preview).replace(/\n/g,'<br>')}</div>
        <details style="margin-top:8px">
          <summary>نمایش کامل</summary>
          <pre class="summary" style="margin-top:10px">${escapeHTML(r.summaryText||'')}</pre>
        </details>
      </div>
    `;
  }).join('');

  host.querySelectorAll('[data-copy]').forEach(b=>{
    b.addEventListener('click', (ev)=>{
      const id = ev.currentTarget.dataset.copy;
      const rec = all.find(x=>x.id===id);
      const text = rec?.summaryText || '';
      navigator.clipboard?.writeText(text).then(()=>safeAlert('کپی شد ✅')).catch(()=>safeAlert('کپی نشد.'));
    });
  });

  host.querySelectorAll('[data-del]').forEach(b=>{
    b.addEventListener('click', (ev)=>{
      const id = ev.currentTarget.dataset.del;
      const listAll = loadStore();
      const idx = listAll.findIndex(x=>x.id===id);
      if(idx>-1){
        listAll.splice(idx,1);
        saveStore(listAll);
        renderHistory();
      }
    });
  });
}

function escapeHTML(s){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

$('#hxRefresh').addEventListener('click', renderHistory);
$('#hxFilter').addEventListener('change', renderHistory);
$('#hxGoHome').addEventListener('click', ()=> show('home'));

/* ===== Header actions: export/import/reset ===== */
$('#btnExport').addEventListener('click', ()=>{
  const data = {version:1, exportedAt: nowISO(), records: loadStore()};
  downloadJSON(data, `hesnegar-export-${new Date().toISOString().slice(0,10)}.json`);
});

$('#btnImport').addEventListener('click', ()=> $('#fileImport').click());
$('#fileImport').addEventListener('change', async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  try{
    const text = await file.text();
    const obj = JSON.parse(text);
    const incoming = Array.isArray(obj) ? obj : (obj.records || []);
    if(!Array.isArray(incoming)) throw new Error('فرمت نامعتبر');

    const current = loadStore();
    const merged = [...incoming, ...current];
    // dedupe by id
    const seen = new Set();
    const unique = [];
    for(const r of merged){
      const id = r?.id;
      if(!id || seen.has(id)) continue;
      seen.add(id);
      unique.push(r);
    }
    saveStore(unique);
    safeAlert('ایمپورت شد ✅');
  }catch(err){
    console.error(err);
    safeAlert('ایمپورت ناموفق بود. فایل JSON معتبر نیست.');
  }finally{
    e.target.value='';
  }
});

$('#btnReset').addEventListener('click', ()=>{
  if(confirm('همهٔ داده‌های ذخیره‌شده روی این دستگاه پاک شود؟')){
    localStorage.removeItem(STORE_KEY);
    safeAlert('پاک شد ✅');
    renderHistory();
  }
});

/* ===== Home buttons ===== */
$('#goQuick').addEventListener('click', ()=>{
  resetQuick();
  renderQCEmotions();
  // populate body options once
  $('#qcBody').innerHTML = BODY_SPOTS.map(b=>`<option value="${b}">${b}</option>`).join('');
  $('#qcBody').value = state.qc.body;
  show('quick-1');
});

$('#goDeep').addEventListener('click', ()=>{
  resetDeep();
  $('#ddBody').innerHTML = BODY_SPOTS.map(b=>`<option value="${b}">${b}</option>`).join('');
  $('#ddBody').value = state.dd.body;
  renderDDNeeds();
  show('deep-1');
});

$('#goToolkit').addEventListener('click', ()=>{
  renderToolkit();
  show('toolkit');
});

$('#goHistory').addEventListener('click', ()=>{
  renderHistory();
  show('history');
});

/* ===== Startup ===== */
// Fix: body select options init
$('#qcBody').innerHTML = BODY_SPOTS.map(b=>`<option value="${b}">${b}</option>`).join('');
$('#ddBody').innerHTML = BODY_SPOTS.map(b=>`<option value="${b}">${b}</option>`).join('');

renderQCEmotions();
renderDDNeeds();
renderToolkit();
show('home', {push:false});

/* ===== Service worker ===== */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  });
}
