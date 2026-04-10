const leftSidebar = document.getElementById('left-sidebar');
const resizerLeft = document.getElementById('resizer-left');
const rightSidebar = document.getElementById('right-sidebar');
const resizerRight = document.getElementById('resizer-right');

let isResizingLeft = false, isResizingRight = false, startX, startWidthLeft, startWidthRight;

resizerLeft.addEventListener('mousedown', e => { 
    isResizingLeft = true; startX = e.clientX; startWidthLeft = leftSidebar.offsetWidth; 
    document.body.classList.add('is-panel-resizing'); resizerLeft.classList.add('active'); 
});
resizerRight.addEventListener('mousedown', e => { 
    isResizingRight = true; startX = e.clientX; startWidthRight = rightSidebar.offsetWidth; 
    document.body.classList.add('is-panel-resizing'); resizerRight.classList.add('active'); 
});

document.addEventListener('mousemove', e => {
    if (isResizingLeft) { 
        let w = startWidthLeft + (e.clientX - startX); 
        if (w > 180 && w < 500) leftSidebar.style.width = w + 'px'; 
    } else if (isResizingRight) { 
        let w = startWidthRight - (e.clientX - startX); 
        if (w > 200 && w < 600) rightSidebar.style.width = w + 'px'; 
    }
});

document.addEventListener('mouseup', () => { 
    if (isResizingLeft || isResizingRight) {
        isResizingLeft = isResizingRight = false; 
        document.body.classList.remove('is-panel-resizing'); 
        resizerLeft.classList.remove('active'); 
        resizerRight.classList.remove('active'); 
    }
    if (typeof resizeId !== 'undefined' && resizeId) { 
        resizeId = null; 
        document.body.classList.remove('is-resizing'); 
    } 
});

function toggleSidebar(id) { 
    const s = document.getElementById(id), t = document.getElementById(id + '-toggle'), r = (id === 'left-sidebar' ? resizerLeft : resizerRight); 
    if (s.style.display === 'none') { s.style.display = 'flex'; t.style.display = 'none'; r.style.display = 'block'; } 
    else { s.style.display = 'none'; t.style.display = 'flex'; r.style.display = 'none'; } 
}

function toggleHeader() { 
    const c = document.getElementById('header-content'), b = document.getElementById('header-toggle-btn'); 
    if (c.style.display === 'none') { c.style.display = 'block'; b.innerText = '설정 접기 🔼'; } 
    else { c.style.display = 'none'; b.innerText = '설정 펴기 🔽'; } 
}

function updateDashboard() { 
    const all = tasks.length, comp = tasks.filter(t => t.completed).length; 
    document.getElementById('total-tasks').innerText = all; 
    document.getElementById('completed-tasks').innerText = comp; 
    document.getElementById('progress-rate').innerText = all ? Math.round(comp/all*100) : 0;
}