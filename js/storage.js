async function saveData() {
    const s = { startDate: document.getElementById('start-date').value, endDate: document.getElementById('end-date').value, memberNames: document.getElementById('member-names').value, members, memberColors, customHolidays, tasks };
    if ('showSaveFilePicker' in window) { 
        try { 
            const h = await window.showSaveFilePicker({ suggestedName: 'project_backup.json', types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }] }); 
            const w = await h.createWritable(); 
            await w.write(JSON.stringify(s, null, 2)); 
            await w.close(); 
        } catch (e) {} 
    }
    else { 
        const a = document.createElement('a'); 
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(s)); 
        a.download = "backup.json"; a.click(); 
    }
}

function loadData(event) {
    const f = event.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = e => {
        try {
            const s = JSON.parse(e.target.result);
            document.getElementById('start-date').value = s.startDate || s.sd || ""; 
            document.getElementById('end-date').value = s.endDate || s.ed || ""; 
            document.getElementById('member-names').value = s.memberNames || s.mn || "";
            
            members = s.members || []; 
            memberColors = s.memberColors || {}; 
            customHolidays = s.customHolidays || {}; 
            tasks = s.tasks || [];
            
            tasks.forEach(t => {
                t.name = getSafeStr(t.name) || '이름 없음';
                if (typeof t.details === 'string') {
                    t.details = t.details.split('\n').map(l => { 
                        let x = l.indexOf(':'); 
                        return x > -1 ? {key: getSafeStr(l.substr(0, x)), value: getSafeStr(l.substr(x+1))} : {key: '정보', value: getSafeStr(l)}; 
                    });
                }
                if (Array.isArray(t.details)) {
                    t.details.forEach(d => { d.key = getSafeStr(d.key); d.value = getSafeStr(d.value); });
                }
            });
            generateCalendar(); 
            alert("불러오기 성공");
        } catch(err) { 
            alert("파일 로드 실패"); 
        }
    }; 
    r.readAsText(f);
}

// 💡 스크립트가 모두 로드된 직후 앱 초기화 실행
window.onload = function() {
    generateCalendar();
};