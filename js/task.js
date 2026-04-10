function renderDetailsPanel(taskId) {
    let t = tasks.find(x => x.id === taskId); if (!t) return;
    document.getElementById('details-title').innerText = getSafeStr(t.name);
    
    let html = t.details && t.details.length > 0 ? t.details.map((d, i) => `
        <div class="detail-row">
            <div class="detail-key editable-field" contenteditable="true" onblur="updateTaskDetailKey(${i}, this.innerText)">${getSafeStr(d.key)}</div>
            <div class="detail-val editable-field" contenteditable="true" onblur="updateTaskDetailValue(${i}, this.innerText)">${getSafeStr(d.value)}</div>
            <div class="detail-del-btn" onclick="deleteTaskDetail(${i})">❌</div>
        </div>`).join('') : '<div style="text-align:center; color:#999; margin: 15px 0;">등록된 항목이 없습니다.</div>';
    
    html += `<div style="margin-top:15px; text-align:center;"><button onclick="addTaskDetail()" style="padding:6px 12px; background:#3498db; color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">+ 새 항목 추가</button></div>`;
    document.getElementById('details-content').innerHTML = html;
}

function updateTaskDetailKey(i, k) { if (currentSelectedTaskId) { tasks.find(t => t.id === currentSelectedTaskId).details[i].key = getSafeStr(k); renderAllTasks(); } }
function updateTaskDetailValue(i, v) { if (currentSelectedTaskId) { tasks.find(t => t.id === currentSelectedTaskId).details[i].value = getSafeStr(v); renderAllTasks(); } }
function deleteTaskDetail(i) { if (currentSelectedTaskId) { let t = tasks.find(x => x.id === currentSelectedTaskId); t.details.splice(i, 1); renderAllTasks(); renderDetailsPanel(currentSelectedTaskId); } }
function addTaskDetail() { if (currentSelectedTaskId) { let t = tasks.find(x => x.id === currentSelectedTaskId); if (!t.details) t.details = []; t.details.push({ key: '새 항목', value: '' }); renderAllTasks(); renderDetailsPanel(currentSelectedTaskId); } }
function updateCurrentTaskName(n) { if (currentSelectedTaskId) { tasks.find(t => t.id === currentSelectedTaskId).name = getSafeStr(n); renderAllTasks(); } }

function addNewTask() { 
    const i = document.getElementById('new-task-input'); 
    if (!i.value.trim()) return; 
    tasks.push({ 
        id: 't-' + Date.now(), name: i.value.trim(), 
        details: [{key: '정보', value: ''}], status: 'pending', duration: 3, completed: false, member: null, startDate: null 
    }); 
    i.value = ''; renderAllTasks(); 
}

function deleteTask(e, id) { 
    e.stopPropagation(); 
    if (confirm("삭제할까요?")) { tasks = tasks.filter(t => t.id !== id); renderAllTasks(); } 
}