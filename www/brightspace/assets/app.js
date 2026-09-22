const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const filtersEl = document.getElementById('filters');
const loadBtn = document.getElementById('loadBtn');
const icsInput = document.getElementById('icsUrl');
const instructions = document.getElementById('instructions');

let allItems = [];
let activeCourse = null; // null = "All"
let courseColors = {}; // course code -> { line, tint, text }

renderFilters(); // show a placeholder "All" chip immediately, at the very top

loadBtn.addEventListener('click', loadDeadlines);
icsInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadDeadlines(); });

async function loadDeadlines() {
  const url = icsInput.value.trim();
  if (!url) return;
  loadBtn.disabled = true;
  statusEl.textContent = 'Fetching your calendar…';
  statusEl.className = 'status';
  resultsEl.innerHTML = '';

  try {
    const res = await fetch('api.php?ics_url=' + encodeURIComponent(url));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    allItems = data.items.filter(it => it.start);
    if (allItems.length === 0) {
      statusEl.textContent = 'Connected, but no dated items were found for this academic year.';
      renderFilters();
      return;
    }
    statusEl.textContent = `Loaded ${allItems.length} item${allItems.length === 1 ? '' : 's'}.`;
    instructions.open = false;
    assignCourseColors();
    renderFilters();
    render();
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.className = 'status error';
  } finally {
    loadBtn.disabled = false;
  }
}

/**
 * Assigns each distinct course a color from an evenly-spaced hue sweep, so
 * ~5 courses (the common case) read as a clear gradient rather than
 * arbitrary unrelated colors. Recomputed each time the course list changes
 * so colors stay stable across a session as long as the same courses load.
 */
function assignCourseColors() {
  const codes = [...new Set(allItems.map(i => i.course))].sort();
  const n = codes.length;
  courseColors = {};
  codes.forEach((code, i) => {
    // Spread across a 260-degree arc (warm red through blue-violet) so
    // adjacent courses stay visually distinct even with just 2-3 courses,
    // rather than wrapping all the way around the color wheel.
    const hue = n <= 1 ? 18 : Math.round((i / (n - 1)) * 260);
    courseColors[code] = {
      line: `hsl(${hue}, 58%, 42%)`,
      tint: `hsl(${hue}, 65%, 95%)`,
      text: `hsl(${hue}, 55%, 32%)`,
    };
  });
}

function colorFor(code) {
  return courseColors[code] || { line: '#999', tint: '#eee', text: '#666' };
}

function renderFilters() {
  const codes = [...new Set(allItems.map(i => i.course))].sort();
  filtersEl.innerHTML = '';

  const allChip = document.createElement('div');
  allChip.className = 'chip' + (activeCourse === null ? ' active' : '');
  allChip.textContent = 'All';
  allChip.addEventListener('click', () => { activeCourse = null; renderFilters(); render(); });
  filtersEl.appendChild(allChip);

  codes.forEach(code => {
    const color = colorFor(code);
    const chip = document.createElement('div');
    chip.className = 'chip' + (activeCourse === code ? ' active' : '');
    chip.style.setProperty('--chip-color', color.line);
    const dot = document.createElement('span');
    dot.className = 'chip-dot';
    dot.style.background = color.line;
    chip.appendChild(dot);
    chip.appendChild(document.createTextNode(labelFor(code)));
    chip.addEventListener('click', () => { activeCourse = code; renderFilters(); render(); });
    filtersEl.appendChild(chip);
  });
}

function labelFor(code) {
  const item = allItems.find(i => i.course === code);
  return item ? item.course : code;
}

function render() {
  const now = new Date();
  const items = allItems.filter(i => !activeCourse || i.course === activeCourse);

  if (items.length === 0) {
    resultsEl.innerHTML = '<div class="empty">No items for this filter.</div>';
    return;
  }

  const groups = {};
  for (const item of items) {
    const d = new Date(item.start);
    const key = d.toDateString();
    (groups[key] = groups[key] || []).push({ ...item, dateObj: d });
  }

  const orderedKeys = Object.keys(groups).sort((a, b) => new Date(a) - new Date(b));

  resultsEl.innerHTML = '';
  for (const key of orderedKeys) {
    const group = groups[key];
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-group';

    const label = document.createElement('div');
    label.className = 'day-label';
    label.innerHTML = `<span>${formatDayLabel(new Date(key), now)}</span><span class="count">${group.length} item${group.length === 1 ? '' : 's'}</span>`;
    dayDiv.appendChild(label);

    group.sort((a, b) => a.dateObj - b.dateObj);
    for (const item of group) {
      dayDiv.appendChild(renderEvent(item, now));
    }
    resultsEl.appendChild(dayDiv);
  }
}

function renderEvent(item, now) {
  const el = document.createElement('div');
  const hoursAway = (item.dateObj - now) / 36e5;
  let urgency = 'ok';
  if (hoursAway < 0) urgency = 'overdue';
  else if (hoursAway < 72) urgency = 'soon';
  el.className = 'event ' + urgency;

  const color = colorFor(item.course);
  el.style.setProperty('--course-line', color.line);

  const main = document.createElement('div');
  main.className = 'event-main';

  const title = document.createElement('div');
  title.className = 'event-title';
  title.textContent = item.title;
  main.appendChild(title);

  const courseLine = document.createElement('div');
  courseLine.className = 'event-course';
  const dot = document.createElement('span');
  dot.className = 'course-dot';
  dot.style.background = color.line;
  courseLine.appendChild(dot);
  courseLine.appendChild(document.createTextNode(item.course_label || item.course));
  main.appendChild(courseLine);

  if (item.url) {
    const link = document.createElement('a');
    link.className = 'event-link';
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open in Brightspace ↗';
    main.appendChild(link);
  }

  const time = document.createElement('div');
  time.className = 'event-time';
  time.textContent = item.all_day ? 'All day' : item.dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  el.appendChild(main);
  el.appendChild(time);
  return el;
}

function formatDayLabel(date, now) {
  const oneDay = 864e5;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target - today) / oneDay);
  const opts = { weekday: 'long', month: 'short', day: 'numeric' };
  if (diffDays === 0) return 'Today · ' + date.toLocaleDateString([], opts);
  if (diffDays === 1) return 'Tomorrow · ' + date.toLocaleDateString([], opts);
  if (diffDays < 0) return date.toLocaleDateString([], opts) + ' (past)';
  return date.toLocaleDateString([], opts);
}
