// 상태 관리 데이터
let currentSelectedTaskId = null;
let tasks = [];
let members = [];
let memberColors = {};
let customHolidays = {};
const baseHolidays = {'2026-01-01':'신정','2026-02-16':'설날','2026-02-17':'설날','2026-02-18':'설날','2026-03-01':'삼일절','2026-03-02':'대체휴무','2026-05-01':'근로자의날','2026-05-05':'어린이날','2026-05-24':'석가탄신일','2026-05-25':'대체휴무','2026-06-03':'지방선거','2026-06-06':'현충일'};

// 유틸리티 함수
function getSafeStr(val) {
    if (val === undefined || val === null) return '';
    const s = String(val).trim();
    return (s.toLowerCase() === 'undefined' || s.toLowerCase() === 'null') ? '' : s;
}

function formatDate(d) { 
    const date = new Date(d); 
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; 
}

function parseLocal(s) { 
    const p = s.split('-'); 
    const d = new Date(p[0], p[1]-1, p[2]); 
    d.setHours(0,0,0,0); 
    return d; 
}

function isWorkingDay(s) { 
    const d = parseLocal(s); 
    return !(d.getDay() === 0 || d.getDay() === 6 || baseHolidays[s] || customHolidays[s]); 
}