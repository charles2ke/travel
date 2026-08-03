const body = document.body;
const toggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('trip-theme');
if (savedTheme === 'dark') {
  body.classList.add('dark');
  if (toggle) toggle.textContent = '☀️';
}
if (toggle) {
  toggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    localStorage.setItem('trip-theme', isDark ? 'dark' : 'light');
    toggle.textContent = isDark ? '☀️' : '🌙';
  });
}

const dayDetails = Array.from(document.querySelectorAll('.day-section'));
const expandBtn = document.getElementById('expandAll');
const collapseBtn = document.getElementById('collapseAll');
if (expandBtn) expandBtn.addEventListener('click', () => dayDetails.forEach(d => d.open = true));
if (collapseBtn) collapseBtn.addEventListener('click', () => dayDetails.forEach(d => d.open = false));

const menuButton = document.getElementById('daysMenuButton');
const menuPanel = document.getElementById('daysMenuPanel');
if (menuButton && menuPanel) {
  menuButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuPanel.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrap')) menuPanel.classList.remove('open');
  });
  menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menuPanel.classList.remove('open')));
}

function updateTopClocks() {
  const now = new Date();
  const clockOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };

  const setClock = (id, locale, timeZone) => {
    const el = document.getElementById(id);
    if (el) el.textContent = now.toLocaleTimeString(locale, { ...clockOptions, timeZone });
  };

  setClock('nyClockTop', 'en-US', 'America/New_York');
  setClock('ieClockTop', 'en-IE', 'Europe/Dublin');
  setClock('inClockTop', 'en-IN', 'Asia/Kolkata');

  const tzOffsetHours = (tz) => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now);
    const part = parts.find(p => p.type === 'timeZoneName');
    const raw = part ? part.value : 'GMT+0';
    const m = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    const hours = parseInt(m[2], 10);
    const mins = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (hours + mins / 60);
  };

  const ie = tzOffsetHours('Europe/Dublin');
  const ny = tzOffsetHours('America/New_York');
  const india = tzOffsetHours('Asia/Kolkata');

  const ieBadge = document.getElementById('timeDiffBadgeIE');
  const inBadge = document.getElementById('timeDiffBadgeIN');
  if (ieBadge) ieBadge.textContent = ie >= ny ? `Ireland +${ie - ny} hrs` : `Ireland ${ie - ny} hrs`;
  if (inBadge) {
    const diffIN = india - ny;
    const inText = Number.isInteger(diffIN) ? diffIN.toFixed(0) : diffIN.toFixed(1);
    inBadge.textContent = diffIN >= 0 ? `India +${inText} hrs` : `India ${inText} hrs`;
  }

  const nyHour = parseInt(now.toLocaleString('en-US', { timeZone:'America/New_York', hour:'numeric', hour12:false }), 10);
  const indiaHour = parseInt(now.toLocaleString('en-US', { timeZone:'Asia/Kolkata', hour:'numeric', hour12:false }), 10);

  const callBadge = document.getElementById('callIndiaBadge');
  if (callBadge) callBadge.textContent = (indiaHour >= 9 && indiaHour < 22) ? 'Best time to call India: Yes' : 'Best time to call India: Probably not';

  const dayNightBadge = document.getElementById('nyDayNightBadge');
  if (dayNightBadge) dayNightBadge.textContent = (nyHour >= 6 && nyHour < 18) ? 'New York: Daytime' : 'New York: Nighttime';
}

function updateTripCountdownTop() {
  const tripDate = new Date('2026-05-23T15:49:00');
  const createdDate = new Date('2026-04-20T00:00:00');
  const now = new Date();
  const diff = tripDate - now;

  const el = document.getElementById('tripCountdownTop');
  const fill = document.getElementById('tripCountdownFill');
  const alert = document.getElementById('tripCountdownAlert');
  if (!el) return;

  if (diff > 0) {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    el.textContent = `${days}d ${hours}h`;

    const totalWindow = tripDate - createdDate;
    const elapsed = now - createdDate;
    const pct = Math.max(0, Math.min(100, (elapsed / totalWindow) * 100));
    if (fill) fill.style.width = `${pct}%`;

    if (alert) {
      if (days < 7) alert.textContent = 'Less than 7 days to go';
      else if (days < 30) alert.textContent = 'Trip is getting close';
      else alert.textContent = 'Plenty of planning time left';
    }
  } else if (diff > -86400000) {
    el.textContent = 'Today ✈️';
    if (fill) fill.style.width = '100%';
    if (alert) alert.textContent = 'Departure day is here';
  } else {
    el.textContent = 'Trip started';
    if (fill) fill.style.width = '100%';
    if (alert) alert.textContent = 'Enjoy the trip';
  }
}

function updateFabProgress() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const scrollHeight = Math.max(1, doc.scrollHeight - window.innerHeight);
  const pct = Math.max(0, Math.min(100, (scrollTop / scrollHeight) * 100));
  const fill = document.getElementById('fabProgressFill');
  if (fill) fill.style.width = pct + '%';
}

function setFabCurrentDayFromCard(card) {
  const label = document.getElementById('fabCurrentDay');
  if (!label || !card) return;
  const dayTag = card.querySelector('.tag.primary');
  label.textContent = dayTag ? dayTag.textContent.trim() : 'Day';
}

function updateCurrentDayFab() {
  const dayCards = Array.from(document.querySelectorAll('.day-section'));
  const label = document.getElementById('fabCurrentDay');
  if (!label || !dayCards.length) return;

  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let current = dayCards[0];
  for (const card of dayCards) {
    const top = card.offsetTop || 0;
    if (scrollY >= top - 180) current = card;
    else break;
  }
  setFabCurrentDayFromCard(current);

  const buttons = {
    overview: document.getElementById('fabOverview'),
    itinerary: document.getElementById('fabDays'),
    connectivity: document.getElementById('fabConnectivity'),
    packing: document.getElementById('fabPacking'),
  };
  Object.values(buttons).forEach(btn => btn && btn.classList.remove('active'));

  const sections = ['packing', 'connectivity', 'itinerary', 'overview'];
  let active = 'overview';
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop - 140) active = id;
  }
  if (buttons[active]) buttons[active].classList.add('active');
}

function refreshFloatingBar() {
  updateFabProgress();
  updateCurrentDayFab();
}

updateTopClocks();
updateTripCountdownTop();

window.addEventListener('scroll', refreshFloatingBar, { passive: true });
window.addEventListener('resize', refreshFloatingBar);
window.addEventListener('load', () => {
  refreshFloatingBar();
  setTimeout(refreshFloatingBar, 150);
});

setInterval(updateTopClocks, 1000);
setInterval(updateTripCountdownTop, 3600000);

document.querySelectorAll('.day-section > summary').forEach((summary) => {
  summary.addEventListener('click', () => {
    const card = summary.parentElement;
    setTimeout(() => setFabCurrentDayFromCard(card), 0);
  });
});

document.querySelectorAll('#daysMenuPanel a[href^="#day"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      setTimeout(() => setFabCurrentDayFromCard(target), 50);
    }
  });
});

window.addEventListener('hashchange', () => {
  const target = document.querySelector(window.location.hash);
  if (target && target.classList.contains('day-section')) {
    setFabCurrentDayFromCard(target);
  }
});



const pictureSummaries = {
  nyc: {
    title: 'New York picture summary',
    text: 'A fast visual snapshot of your classic first-look NYC moments.',
    items: [
      {img: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80', cap: 'Midtown skyline energy'},
      {img: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80', cap: 'Central Park breathing room'},
      {img: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?auto=format&fit=crop&w=1200&q=80', cap: 'Statue of Liberty day'},
      {img: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1200&q=80', cap: 'Brooklyn Bridge at golden hour'}
    ]
  },
  birthday: {
    title: 'Birthday day picture summary',
    text: 'Brunch, High Line atmosphere, the train south, and a strong Georgetown dinner finish.',
    items: [
      {img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80', cap: 'Birthday brunch mood'},
      {img: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60f?auto=format&fit=crop&w=1200&q=80', cap: 'High Line stroll'},
      {img: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80', cap: 'Intercity rail leg'},
      {img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80', cap: 'Birthday dinner close'}
    ]
  },
  dc: {
    title: 'Washington DC picture summary',
    text: 'Monuments, big civic spaces, and museum-heavy sightseeing.',
    items: [
      {img: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?auto=format&fit=crop&w=1200&q=80', cap: 'Washington Monument'},
      {img: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?auto=format&fit=crop&w=1200&q=80', cap: 'Lincoln Memorial scale'},
      {img: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&w=1200&q=80', cap: 'National Mall walking day'},
      {img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', cap: 'Smithsonian museum feel'}
    ]
  },
  boston: {
    title: 'Boston picture summary',
    text: 'History, Harvard, and a calmer city rhythm after NYC and DC.',
    items: [
      {img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=80', cap: 'Boston Common start'},
      {img: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1200&q=80', cap: 'Freedom Trail style'},
      {img: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80', cap: 'Harvard / Cambridge mood'},
      {img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80', cap: 'Seafood dinner finish'}
    ]
  },
  soho: {
    title: 'SoHo picture summary',
    text: 'Final shopping energy with cast-iron streets, stores, and a relaxed downtown base.',
    items: [
      {img: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80', cap: 'SoHo street atmosphere'},
      {img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80', cap: 'Shopping route mood'},
      {img: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80', cap: 'Store-hopping pace'},
      {img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80', cap: 'Downtown meal stop'}
    ]
  }
};

function getPhotoModalEls(){
  return {
    modal: document.getElementById('photoSummaryModal'),
    title: document.getElementById('photoSummaryTitle'),
    text: document.getElementById('photoSummaryText'),
    grid: document.getElementById('photoSummaryGrid'),
    close: document.getElementById('photoSummaryClose')
  };
}

document.querySelectorAll('.highlight[data-summary]').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.getAttribute('data-summary');
    const data = pictureSummaries[key];
    const { modal, title, text, grid } = getPhotoModalEls();
    if (!data || !modal || !title || !text || !grid) return;
    title.textContent = data.title;
    text.textContent = data.text;
    grid.innerHTML = data.items.map(item => `
      <div class="photo-tile">
        <img src="${item.img}" alt="${item.cap}">
        <p>${item.cap}</p>
      </div>
    `).join('');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });
});

window.addEventListener('load', () => {
  const { modal, close } = getPhotoModalEls();
  if (close && modal) {
    close.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }
});

