function calculateAllSchedules() {
    members.forEach(m => {
        let mTasks = tasks.filter(t => t.member === m && t.status === 'scheduled').sort((a, b) => parseLocal(a.startDate) - parseLocal(b.startDate));
        let next = null;
        mTasks.forEach(t => {
            let start = parseLocal(t.startDate);
            if (next && start < next) start = new Date(next);
            while (!isWorkingDay(formatDate(start))) start.setDate(start.getDate() + 1);
            t.startDate = formatDate(start);
            let found = 0, end = new Date(start);
            while (found < t.duration) { if (isWorkingDay(formatDate(end))) found++; if (found < t.duration) end.setDate(end.getDate() + 1); }
            let n = new Date(end); n.setDate(n.getDate() + 1); next = n;
        });
    });
}

function generateCalendar() {
    const startStr = document.getElementById('start-date').value, endStr = document.getElementById('end-date').value;
    if(!startStr || !endStr) return;
    const start = parseLocal(startStr), end = parseLocal(endStr);
    members = document.getElementById('member-names').value.split(',').map(n => n.trim()).filter(n => n);
    const cp = document.getElementById('color-pickers-container'); cp.innerHTML = '';
    members.forEach((m, i) => { if(!memberColors[m]) memberColors[m] = ['#4A90E2','#E67E22','#2ECC71','#9B59B6','#E74C3C'][i%5]; cp.innerHTML += `<div class="color-item"><label>${m}</label><input type="color" value="${memberColors[m]}" onchange="memberColors['${m}']=this.value; renderAllTasks();"></div>`; });
    document.getElementById('color-settings-panel').style.display = 'flex';

    const tbody = document.getElementById('calendar-body'); tbody.innerHTML = '';
    let curr = new Date(start); curr.setDate(curr.getDate() - (curr.getDay() === 0 ? 6 : curr.getDay() - 1));
    while (curr <= end) {
        let tr = document.createElement('tr');
        for (let i = 1; i <= 5; i++) {
            let td = document.createElement('td'), dStr = formatDate(curr), hName = baseHolidays[dStr] || customHolidays[dStr];
            if (hName) td.classList.add('holiday');
            let h = document.createElement('div'); h.className = 'day-header'; h.onclick = () => toggleHoliday(dStr);
            h.innerHTML = `<span>${curr.getMonth()+1}/${curr.getDate()} (${['일','월','화','수','목','금','토'][curr.getDay()]})</span>` + (hName ? `<span class="holiday-name">${hName}</span>` : '');
            td.appendChild(h);
            if (!hName && curr >= start && curr <= end) members.forEach(m => {
                let dz = document.createElement('div'); dz.className = 'member-dropzone'; dz.dataset.date = dStr; dz.dataset.member = m;
                dz.innerHTML = `<span class="member-name">${m}</span>`; dz.ondragover = e => { e.preventDefault(); dz.classList.add('dragover'); }; dz.ondragleave = () => dz.classList.remove('dragover'); dz.ondrop = e => dropToCalendar(e, dz); td.appendChild(dz);
            });
            tr.appendChild(td); curr.setDate(curr.getDate() + 1);
        }
        tbody.appendChild(tr); curr.setDate(curr.getDate() + 2);
    }
    renderAllTasks();
}

function toggleHoliday(s) { 
    if (baseHolidays[s]) return alert("공휴일은 해제 불가"); 
    if (customHolidays[s]) delete customHolidays[s]; else customHolidays[s] = "지정 휴일"; 
    generateCalendar(); 
}

function renderAllTasks() {
    calculateAllSchedules(); 
    document.querySelectorAll('.calendar .task-card, #pending-tasks .task-card').forEach(e => e.remove());
    tasks.forEach(t => {
        if (t.status === 'pending') document.getElementById('pending-tasks').appendChild(createCardDOM(t));
        else {
            let curr = parseLocal(t.startDate), workDates = []; 
            while(workDates.length < t.duration) { let dStr = formatDate(curr); if(isWorkingDay(dStr)) workDates.push(dStr); curr.setDate(curr.getDate() + 1); }
            let chunks = [], currentChunk = [];
            workDates.forEach(dStr => {
                let dz = document.querySelector(`.member-dropzone[data-date='${dStr}'][data-member='${t.member}']`); if (!dz) return;
                if (currentChunk.length > 0) { 
                    let lD = parseLocal(currentChunk[currentChunk.length-1].date), tD = parseLocal(dStr);
                    if (tD - lD > 86400000 || dz.closest('tr') !== currentChunk[0].dz.closest('tr')) { chunks.push(currentChunk); currentChunk = []; } 
                }
                currentChunk.push({date: dStr, dz: dz});
            });
            if (currentChunk.length > 0) chunks.push(currentChunk);
            chunks.forEach((chunk, i) => {
                let card = createCardDOM(t); card.style.width = `calc(${chunk.length * 100}% + ${(chunk.length-1) * 9}px)`; card.style.backgroundColor = memberColors[t.member];
                if (chunks.length > 1) { if (i === 0) card.classList.add('card-start'); else if (i === chunks.length - 1) card.classList.add('card-end'); else card.classList.add('card-mid'); }
                if (i === chunks.length - 1) { let h = document.createElement('div'); h.className = 'resize-handle'; h.onmousedown = e => startResize(e, t.id); card.appendChild(h); }
                chunk[0].dz.appendChild(card);
            });
        }
    });
    updateDashboard();
}

function createCardDOM(t) {
    let card = document.createElement('div'); card.className = `task-card ${t.completed ? 'completed' : ''}`; card.id = t.id; card.draggable = true; card.ondragstart = e => e.dataTransfer.setData("text", t.id);
    card.onclick = e => { e.stopPropagation(); currentSelectedTaskId = t.id; renderDetailsPanel(t.id); if(document.getElementById('right-sidebar').style.display === 'none') toggleSidebar('right-sidebar'); };
    card.ondblclick = e => { e.stopPropagation(); t.completed = !t.completed; renderAllTasks(); };
    
    let tooltipHTML = "";
    if (Array.isArray(t.details) && t.details.length > 0) {
        tooltipHTML = t.details.map(d => {
            let k = getSafeStr(d.key), v = getSafeStr(d.value);
            if (k === '' && v === '') return '';
            return `${k}${k ? ': ' : ''}${v}`;
        }).filter(Boolean).join('\n');
    }
    if (!tooltipHTML) tooltipHTML = "세부 정보가 없습니다.";

    card.innerHTML = `<div class="card-text"><b>${getSafeStr(t.name)}</b> (${t.duration}일)</div><div class="delete-btn" onclick="deleteTask(event, '${t.id}')">❌</div><div class="tooltip">${tooltipHTML}</div>`;
    return card;
}

function dropToCalendar(e, dz) { 
    e.preventDefault(); dz.classList.remove('dragover'); let t = tasks.find(x => x.id === e.dataTransfer.getData("text")); 
    if (t) { t.status = 'scheduled'; t.member = dz.dataset.member; t.startDate = dz.dataset.date; 
        let mTasks = tasks.filter(x => x.member === t.member && x.status === 'scheduled' && x.id !== t.id);
        let next = mTasks.filter(x => parseLocal(x.startDate) > parseLocal(t.startDate)).sort((a, b) => parseLocal(a.startDate) - parseLocal(b.startDate))[0];
        if (next) { let max = 0, curr = parseLocal(t.startDate), nS = parseLocal(next.startDate); while (curr < nS) { if (isWorkingDay(formatDate(curr))) max++; curr.setDate(curr.getDate() + 1); } if (max > 0 && t.duration > max) t.duration = max; else if (max === 0) t.duration = 1; }
        renderAllTasks(); 
    } 
}
function dropToPending(e) { e.preventDefault(); let t = tasks.find(x => x.id === e.dataTransfer.getData("text")); if (t) { t.status = 'pending'; t.member = null; renderAllTasks(); } }
function allowDrop(e) { e.preventDefault(); }

let resizeId = null;
function startResize(e, id) { e.preventDefault(); e.stopPropagation(); resizeId = id; document.body.classList.add('is-resizing'); }

document.addEventListener('mouseover', e => {
    if (!resizeId) return; let t = tasks.find(x => x.id === resizeId), td = e.target.closest('td'); 
    if (td && t) { let dz = td.querySelector(`.member-dropzone[data-member='${t.member}']`); if (dz && dz.dataset.date) { let c = 0, start = parseLocal(t.startDate), end = parseLocal(dz.dataset.date); if (end < start) c = 1; else while(start <= end) { if(isWorkingDay(formatDate(start))) c++; start.setDate(start.getDate() + 1); } if (t.duration !== c) { t.duration = c; renderAllTasks(); } } }
});