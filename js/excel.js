document.getElementById('file-upload').addEventListener('change', function(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = function(ev) {
        try {
            const wb = XLSX.read(ev.target.result, {type: 'binary'});
            document.getElementById('sheet-select').innerHTML = wb.SheetNames.map(n => `<option value="${n}">${n}</option>`).join('');
            document.getElementById('sheet-wrapper').style.display = 'flex';
            window.currentWb = wb;
            loadColumnsFromSheet();
            document.getElementById('excel-panel').style.display = 'block';
        } catch(err) {
            alert('엑셀 파일을 읽는 중 오류가 발생했습니다.\n상세: ' + err.message);
        }
    };
    r.readAsBinaryString(f);
});

function loadColumnsFromSheet() { 
    try {
        const n = document.getElementById('sheet-select').value;
        const rawRows = XLSX.utils.sheet_to_json(window.currentWb.Sheets[n], {header: 1, defval: ""});
        if(!rawRows || rawRows.length === 0) return alert("시트에 데이터가 없습니다.");
        
        let headerIdx = -1;
        for (let i = 0; i < rawRows.length; i++) {
            if (Array.isArray(rawRows[i]) && rawRows[i].some(cell => getSafeStr(cell) !== '')) {
                headerIdx = i;
                break;
            }
        }

        if (headerIdx === -1) return alert("시트에서 데이터를 찾을 수 없습니다.");

        let headers = [];
        let emptyCount = 1;
        rawRows[headerIdx].forEach((col) => {
            let colName = getSafeStr(col);
            if (colName === '') colName = `(이름없음 ${emptyCount++})`;
            
            let finalName = colName;
            let dupCount = 1;
            while (headers.includes(finalName)) {
                finalName = `${colName} (${dupCount++})`;
            }
            headers.push(finalName);
        });

        let parsedData = [];
        for (let i = headerIdx + 1; i < rawRows.length; i++) {
            let rowData = rawRows[i];
            if (!Array.isArray(rowData)) continue;
            
            let firstColValue = getSafeStr(rowData[0]);
            if (firstColValue === '') break;
            
            let obj = {};
            headers.forEach((h, j) => {
                obj[h] = getSafeStr(rowData[j]);
            });
            parsedData.push(obj);
        }

        document.getElementById('name-col-select').innerHTML = headers.map(c => `<option value="${c}">${c}</option>`).join(''); 
        document.getElementById('detail-cols-container').innerHTML = headers.map(c => `<label><input type="checkbox" value="${c}" checked> ${c}</label>`).join(''); 
        window.tempRows = parsedData; 
    } catch(e) {
        alert("열 정보를 불러오는 중 오류 발생: " + e.message);
    }
}

function importExcelData() { 
    const nCol = document.getElementById('name-col-select').value;
    const checked = Array.from(document.querySelectorAll('#detail-cols-container input:checked')).map(cb => cb.value); 
    
    window.tempRows.forEach((row, i) => { 
        let detailsArr = checked.map(c => { 
            return { key: getSafeStr(c), value: getSafeStr(row[c]) }; 
        });
        let tName = getSafeStr(row[nCol]) || `새 대상 ${i+1}`;
        tasks.push({ id: 't-'+Date.now()+'-'+i, name: tName, details: detailsArr, status: 'pending', duration: 3, completed: false, member: null, startDate: null }); 
    }); 
    
    document.getElementById('excel-panel').style.display = 'none'; 
    document.getElementById('file-upload').value = '';
    renderAllTasks(); 
}

function cancelImport() { 
    document.getElementById('excel-panel').style.display = 'none'; 
    document.getElementById('file-upload').value = ''; 
}