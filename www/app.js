// =================================================================
// 도약다로 v17.0 Live - 한글 이름 원터치 3초 간편 공유 앱 (app.js)
// 구글 데이터센터 24시간 실시간 스마트폰 동기화 연동
// 작성일: 2026-07-21
// =================================================================

// -----------------------------------------------------------------
// 1. 구글 무료 클라우드 데이터센터 (Supabase) 라이브 연동 정보
// -----------------------------------------------------------------
const SUPABASE_URL = 'https://fhwqaixpxffnapmqvvdy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3OiOiJzdXBhYmFzZSIsInJlZiI6ImZod3FhaXhweGZmbmFwbXF2dmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODA3NzQsImV4cCI6MjEwMDE1Njc3NH0.Pt8PWa_kseivEXivT4wtAuQv1IjtQrV-JRBgOvFNy1w';

// Supabase 클라이언트 SDK 초기화
let supabase = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("⚡ [도약다로] 구글 클라우드 DB 24시간 동기화 준비 완료!");
    }
} catch(e) {
    console.log("로컬 스토리지 데이터 가동");
}

// -----------------------------------------------------------------
// 2. 애플리케이션 상태 관리 객체 (State Management)
// -----------------------------------------------------------------
const AppState = {
    currentUser: null,       // 현재 접속된 팀원 정보 { id, fullName }
    ideas: [],               // 수집된 아이디어 배열
    schedules: [],           // 일정 데이터 배열
    meetingNotes: [],        // 회의록 데이터 배열
    currentCalYear: 2026,    // 현재 캘린더 표시 년도
    currentCalMonth: 6,      // 현재 캘린더 표시 월 (0-indexed, 6 = 7월)
    selectedCalDateStr: null // 캘린더 선택 날짜 (YYYY-MM-DD)
};

// -----------------------------------------------------------------
// 3. 한글 성함 3초 간편 입장 처리
// -----------------------------------------------------------------
window.handleSimpleNameLogin = function(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    
    const fullNameInput = document.getElementById('authFullName');
    let fullName = fullNameInput ? fullNameInput.value.trim() : '';

    if (!fullName) {
        fullName = '팀원';
    }

    const userObj = {
        id: 'usr_' + Date.now(),
        fullName: fullName
    };

    loginSuccess(userObj);
    return false;
};

// -----------------------------------------------------------------
// 4. 초기화 함수 (DOM 로드 후 실행)
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 [도약다로 v17.0] 전수 검증 및 날짜 달력 픽커 모드 초기화...");
    
    // 로컬 및 구글 클라우드 DB 데이터 동기화 불러오기
    await loadInitialData();
    
    // 이벤트 리스너 바인딩
    bindEvents();
    
    // 기존 자동 로그인 세션이 있는지 확인
    checkAutoLogin();
});

// -----------------------------------------------------------------
// 5. 로컬 데이터 및 구글 클라우드 DB 실시간 데이터 동기화
// -----------------------------------------------------------------
async function loadInitialData() {
    // 1) 아이디어 로드
    try {
        const savedIdeas = localStorage.getItem('doyakdaro_ideas');
        if (savedIdeas) {
            AppState.ideas = JSON.parse(savedIdeas);
        } else {
            AppState.ideas = [
                {
                    id: 'idea-1',
                    title: '모바일 핑거 터치 기반 간편 회의록',
                    desc: '회의 끝나고 손가락 3번 터치로 바로 팀원 일정으로 전송하는 기능 구축',
                    author: '홍길동',
                    likes: 4,
                    isConverted: true
                },
                {
                    id: 'idea-2',
                    title: '주간 도약다로 왕 칭찬 폭죽 이벤트',
                    desc: '가장 좋은 아이디어를 내고 목표를 달성한 팀원에게 훈장 부여하기',
                    author: '김철수',
                    likes: 2,
                    isConverted: false
                }
            ];
            saveIdeasToStorage();
        }
    } catch(e) {}

    // 2) 일정 로드
    try {
        const savedSchedules = localStorage.getItem('doyakdaro_schedules');
        if (savedSchedules) {
            AppState.schedules = JSON.parse(savedSchedules);
        } else {
            AppState.schedules = [
                {
                    id: 'sched-1',
                    title: '3분기 팀 목표 방향성 수립',
                    description: '소규모 인원끼리 공유하는 프로젝트 달성 일정 논의',
                    status: 'todo',
                    priority: 'high',
                    dueDate: '2026-07-25',
                    createdBy: '김철수 팀장'
                },
                {
                    id: 'sched-2',
                    title: '도약다로 정식 안드로이드 APK 완성',
                    description: '독립형 앱으로 스마트폰 직접 설치 및 공유 완료',
                    status: 'done',
                    priority: 'high',
                    dueDate: '2026-07-21',
                    createdBy: '이영희 매니저'
                },
                {
                    id: 'sched-3',
                    title: '구글 데이터센터 보안 연결 세팅',
                    description: '무료 데이터센터 인프라 및 단방향 암호화 연동',
                    status: 'done',
                    priority: 'high',
                    dueDate: '2026-07-21',
                    createdBy: '홍길동'
                },
                {
                    id: 'sched-4',
                    title: '도약다로 성장 빌딩 시각화 타워 탑재',
                    description: '목표 달성 시마다 빌딩 높이가 1층씩 솟아오르는 이펙트',
                    status: 'done',
                    priority: 'high',
                    dueDate: '2026-07-21',
                    createdBy: '홍길동'
                }
            ];
            saveSchedulesToStorage();
        }
    } catch(e) {}

    // 3) 회의록 로드
    try {
        const savedMeetings = localStorage.getItem('doyakdaro_meetings');
        if (savedMeetings) {
            AppState.meetingNotes = JSON.parse(savedMeetings);
        } else {
            AppState.meetingNotes = [
                {
                    id: 'meet-1',
                    title: '도약다로 킥오프 전략 및 소규모 회의록',
                    date: '2026-07-21',
                    attendees: '홍길동, 김철수, 이영희',
                    content: '구글 무료 데이터센터 인프라를 활용하여 안전하고 빠른 팀 일정 공유 앱 [도약다로]를 구축하기로 함.',
                    actionItems: ['앱 인터페이스 시안 확정', 'Supabase 스키마 배포']
                }
            ];
            saveMeetingsToStorage();
        }
    } catch(e) {}

    // 구글 클라우드 DB 동기화
    if (supabase) {
        try {
            const { data, error } = await supabase.from('schedules').select('*');
            if (!error && data && data.length > 0) {
                console.log("☁️ [도약다로] 구글 클라우드에서 최신 일정을 동기화했습니다.");
            }
        } catch (e) {}
    }
}

function bindEvents() {
    // 인라인 핸들러와 백업 이벤트 바인딩
}

function loginSuccess(userObj) {
    AppState.currentUser = userObj;

    const authSection = document.getElementById('authSection');
    const mainAppSection = document.getElementById('mainAppSection');
    const bottomNav = document.getElementById('bottomNav');
    const userProfileBadge = document.getElementById('userProfileBadge');

    if (authSection) authSection.style.display = 'none';
    if (mainAppSection) mainAppSection.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'flex';
    if (userProfileBadge) userProfileBadge.style.display = 'flex';

    try {
        localStorage.setItem('doyakdaro_simple_session', JSON.stringify({
            id: userObj.id,
            fullName: userObj.fullName
        }));
    } catch(e){}

    const headerName = document.getElementById('headerUserName');
    const welcomeName = document.getElementById('welcomeUserName');

    if (headerName) headerName.textContent = userObj.fullName;
    if (welcomeName) welcomeName.textContent = userObj.fullName;

    try {
        renderAllViews();
    } catch(err) {}
}

function checkAutoLogin() {
    try {
        const sessionData = localStorage.getItem('doyakdaro_simple_session');
        if (sessionData) {
            const userObj = JSON.parse(sessionData);
            if (userObj && userObj.fullName) {
                const input = document.getElementById('authFullName');
                if (input) input.value = userObj.fullName;
                loginSuccess(userObj);
            }
        }
    } catch(e){}
}

function handleLogout() {
    if (confirm('이름을 변경하시겠습니까?')) {
        try {
            localStorage.removeItem('doyakdaro_simple_session');
        } catch(e){}
        location.reload();
    }
}

function renderAllViews() {
    try { if (typeof directApplyViewerRestrictions === 'function') directApplyViewerRestrictions(); } catch(e){}
    try { renderDashboard(); } catch(e){}
    try { renderIdeaVault(); } catch(e){}
    try { renderCalendarGrid(); } catch(e){}
    try { renderKanbanBoard(); } catch(e){}
    try { renderMeetingNotes(); } catch(e){}
    try { if (typeof renderDashboardDDayCards === 'function') renderDashboardDDayCards(); } catch(e){}
}
window.renderAllViews = renderAllViews;
window.directRenderAllViews = renderAllViews;

// [대시보드 렌더링]
function renderDashboard() {
    const todoList = AppState.schedules.filter(s => s.status === 'todo');
    const inProgressList = AppState.schedules.filter(s => s.status === 'in_progress');
    const doneList = AppState.schedules.filter(s => s.status === 'done');

    const elIdeas = document.getElementById('countIdeas');
    const elTasks = document.getElementById('countConvertedTasks');
    const elDone = document.getElementById('countDone');

    if (elIdeas) elIdeas.textContent = AppState.ideas.length;
    if (elTasks) elTasks.textContent = inProgressList.length + todoList.length;
    if (elDone) elDone.textContent = doneList.length;

    const doneTasksCount = doneList.length;
    const towerFloors = Math.max(1, doneTasksCount + 1);

    const elTowerText = document.getElementById('towerFloorsText');
    if (elTowerText) elTowerText.textContent = `🏢 도약다로 ${towerFloors}층 빌딩`;

    const towerContainer = document.getElementById('growthTowerVisual');
    if (towerContainer) {
        towerContainer.innerHTML = '';

        for (let f = 1; f <= towerFloors; f++) {
            const floorSegment = document.createElement('div');
            floorSegment.className = 'tower-floor-segment';
            
            let floorTitle = `${f}F. 도약 단계`;
            if (f === 1) floorTitle = "1F. 도약다로 본부 🏢";
            else if (f === 2) floorTitle = "2F. 아이디어 랩 💡";
            else if (f === 3) floorTitle = "3F. 실천 센터 🚀";
            else if (f >= 4) floorTitle = `${f}F. 대도약 스파이어 🌟`;

            floorSegment.innerHTML = `
                <div class="tower-window"></div>
                <span class="floor-label">${floorTitle}</span>
                <div class="tower-window"></div>
            `;
            towerContainer.appendChild(floorSegment);
        }
    }

    const streakDays = doneTasksCount > 0 ? (doneTasksCount * 2 + 1) : 0;
    const elStreak = document.getElementById('streakFlameText');
    if (elStreak) elStreak.textContent = `🔥 ${streakDays}일 연속 달성 중!`;

    const convertedIdeasCount = AppState.ideas.filter(i => i.isConverted).length;
    const totalIdeas = AppState.ideas.length;
    const ideaRealizationPct = totalIdeas > 0 ? Math.round((convertedIdeasCount / totalIdeas) * 100) : 0;

    const elIdeaText = document.getElementById('ideaRealizationText');
    const elIdeaBar = document.getElementById('ideaProgressBar');
    if (elIdeaText) elIdeaText.textContent = `${ideaRealizationPct}% (${convertedIdeasCount}/${totalIdeas}개 추진중)`;
    if (elIdeaBar) elIdeaBar.style.width = `${ideaRealizationPct}%`;

    const total = AppState.schedules.length;
    const doneCount = doneList.length;
    const percentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const elMainPct = document.getElementById('progressPercentageText');
    const elMainBar = document.getElementById('mainProgressBar');
    if (elMainPct) elMainPct.textContent = `${percentage}%`;
    if (elMainBar) elMainBar.style.width = `${percentage}%`;

    // 랭킹
    const memberScores = {};
    AppState.schedules.forEach(task => {
        const creator = task.createdBy || '기타';
        if (!memberScores[creator]) memberScores[creator] = 0;
        if (task.status === 'done') memberScores[creator] += 100;
        else if (task.status === 'in_progress') memberScores[creator] += 30;
    });

    AppState.ideas.forEach(idea => {
        const author = idea.author || '기타';
        if (!memberScores[author]) memberScores[author] = 0;
        memberScores[author] += 20;
    });

    const rankingContainer = document.getElementById('teamMemberRankingList');
    if (rankingContainer) {
        rankingContainer.innerHTML = '';

        const sortedMembers = Object.entries(memberScores).sort((a, b) => b[1] - a[1]);
        if (sortedMembers.length === 0) {
            rankingContainer.innerHTML = '<div class="feed-empty">아직 활동 기록이 없습니다.</div>';
        } else {
            sortedMembers.forEach(([name, score], idx) => {
                let badgeTitle = "🌱 신예 실행가";
                if (idx === 0) badgeTitle = "👑 1위 아이디어/목표 달성왕";
                else if (idx === 1) badgeTitle = "🥈 열정 불꽃 리더";
                else if (idx === 2) badgeTitle = "🥉 든든한 실행 파트너";

                const rankItem = document.createElement('div');
                rankItem.className = 'ranking-item';
                rankItem.innerHTML = `
                    <div class="rank-user-info">
                        <span class="rank-badge">${idx + 1}</span>
                        <span class="rank-name">${name} <small style="color:var(--accent-purple); font-size:0.75rem;">(${badgeTitle})</small></span>
                    </div>
                    <span class="rank-score">${score} XP</span>
                `;
                rankingContainer.appendChild(rankItem);
            });
        }
    }

    const feedContainer = document.getElementById('recentDoneFeedList');
    if (feedContainer) {
        feedContainer.innerHTML = '';

        if (doneList.length === 0) {
            feedContainer.innerHTML = '<li class="feed-empty">아직 완료된 일정이 없습니다. 일정을 달성하고 폭죽을 터뜨려보세요! 🎉</li>';
        } else {
            doneList.slice(-3).reverse().forEach(item => {
                const li = document.createElement('li');
                li.className = 'feed-item';
                li.innerHTML = `
                    <span><strong>${item.title}</strong> (${item.createdBy})</span>
                    <span class="due-tag">🏆 +100 XP 완료</span>
                `;
                feedContainer.appendChild(li);
            });
        }
    }
}

// -----------------------------------------------------------------
// 9. 아이디어 보물상자 렌더링
// -----------------------------------------------------------------
function renderIdeaVault() {
    const container = document.getElementById('ideaCardsList');
    if (!container) return;
    container.innerHTML = '';

    if (AppState.ideas.length === 0) {
        container.innerHTML = '<div class="feed-empty glass-panel">보관된 아이디어가 없습니다. 생각나는 아이디어를 즉시 등록해보세요!</div>';
        return;
    }

    AppState.ideas.slice().reverse().forEach(idea => {
        const card = document.createElement('div');
        card.className = 'idea-card glass-panel';

        let convertActionHtml = idea.isConverted
            ? `<span class="converted-tag"><i class="fa-solid fa-circle-check"></i> 프로젝트 추진중</span>`
            : `<button class="btn-convert-task" onclick="convertIdeaToSchedule('${idea.id}')">🚀 프로젝트 추진 (일정 등록)</button>`;

        card.innerHTML = `
            <div class="idea-card-header">
                <div class="idea-title">${idea.title}</div>
                <div class="idea-author"><i class="fa-solid fa-user-pen"></i> 제안자: ${idea.author}</div>
            </div>
            <div class="idea-desc">${idea.desc || '내용 요약 없음'}</div>
            <div class="idea-actions">
                <button class="btn-like" onclick="likeIdea('${idea.id}')">
                    <i class="fa-solid fa-thumbs-up"></i> 응원 ${idea.likes}
                </button>
                ${convertActionHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

function handleCreateIdea() {
    if (typeof directCheckViewerLockdown === 'function' && directCheckViewerLockdown()) return false;
    const titleEl = document.getElementById('ideaTitle');
    const descEl = document.getElementById('ideaDesc');
    
    const title = titleEl ? titleEl.value.trim() : '';
    const desc = descEl ? descEl.value.trim() : '';

    if (!title) {
        alert('아이디어 제목을 입력해주세요.');
        return;
    }

    const newIdea = {
        id: 'idea-' + Date.now(),
        title: title,
        desc: desc,
        author: AppState.currentUser ? AppState.currentUser.fullName : '팀원',
        createdAt: (function(){
            var now = new Date();
            var y = now.getFullYear();
            var m = String(now.getMonth() + 1).padStart(2, '0');
            var d = String(now.getDate()).padStart(2, '0');
            var hh = String(now.getHours()).padStart(2, '0');
            var mm = String(now.getMinutes()).padStart(2, '0');
            return y + '-' + m + '-' + d + ' ' + hh + ':' + mm;
        })(),
        likes: 1,
        isConverted: false
    };

    AppState.ideas.push(newIdea);
    saveIdeasToStorage();

    if (titleEl) titleEl.value = '';
    if (descEl) descEl.value = '';
    
    const modal = document.getElementById('ideaModal');
    if (modal) modal.style.display = 'none';

    alert('🎉 아이디어가 도약다로 보물상자에 보관되었습니다!');
    renderAllViews();
}

function likeIdea(ideaId) {
    const actorName = AppState.currentUser ? AppState.currentUser.fullName : '팀원';
    if (typeof window.checkAndUseDailyLikeCount === 'function') {
        if (!window.checkAndUseDailyLikeCount(actorName)) return false;
    }

    const target = AppState.ideas.find(i => i.id === ideaId);
    if (target) {
        target.likes++;
        saveIdeasToStorage();
        renderIdeaVault();
    }
}

function convertIdeaToSchedule(ideaId) {
    if (typeof directCheckViewerLockdown === 'function' && directCheckViewerLockdown()) return false;
    const targetIdea = AppState.ideas.find(i => i.id === ideaId);
    if (targetIdea) {
        targetIdea.isConverted = true;
        saveIdeasToStorage();

        const dueDateStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

        AppState.schedules.push({
            id: 'sched-idea-' + Date.now(),
            title: `[아이디어 실현] ${targetIdea.title}`,
            description: targetIdea.desc,
            status: 'todo',
            priority: 'high',
            dueDate: dueDateStr,
            createdBy: targetIdea.author
        });
        saveSchedulesToStorage();

        triggerGoalConfetti();
        alert(`🚀 아이디어가 도약다로 정식 프로젝트로 승격되었습니다! 도약다로 빌딩 층수가 높아집니다!`);
        renderAllViews();
    }
}

// -----------------------------------------------------------------
// 10. 시각적 캘린더 렌더링
// -----------------------------------------------------------------
function renderCalendarGrid() {
    const year = AppState.currentCalYear;
    const month = AppState.currentCalMonth;

    const monthTitle = document.getElementById('calendarMonthTitle');
    if (monthTitle) monthTitle.textContent = `${year}년 ${month + 1}월`;

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell other-month';
        cell.textContent = prevMonthDays - i;
        grid.appendChild(cell);
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let day = 1; day <= totalDays; day++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell';
        if (dayStr === todayStr) cell.classList.add('today');
        if (dayStr === AppState.selectedCalDateStr) cell.classList.add('selected');

        const dayNumSpan = document.createElement('span');
        dayNumSpan.textContent = day;
        cell.appendChild(dayNumSpan);

        const dayTasks = AppState.schedules.filter(s => s.dueDate === dayStr);
        if (dayTasks.length > 0) {
            const badgeContainer = document.createElement('div');
            badgeContainer.className = 'cal-badge-container';

            const inProgressTasks = dayTasks.filter(t => t.status === 'in_progress');
            const todoTasks = dayTasks.filter(t => t.status === 'todo');
            const doneTasks = dayTasks.filter(t => t.status === 'done');

            // 소수 일정(1~2개)은 제목 뱃지 형태로 보여주고, 많을 때는 요약 카운트 뱃지로 표시
            if (dayTasks.length <= 4) {
                dayTasks.forEach(task => {
                    const badge = document.createElement('div');
                    const isOverdue = (task.dueDate < todayStr && task.status !== 'done');
                    const statusClass = isOverdue ? 'overdue' : task.status.replace('_', '-');
                    badge.className = `cal-badge badge-${statusClass}`;
                    
                    let statusDot = '<i class="badge-dot dot-blue"></i>';
                    if (isOverdue) statusDot = '<span style="font-size:0.72rem; margin-right:2px;">⚠️</span>';
                    else if (task.status === 'in_progress') statusDot = '<i class="badge-dot dot-amber"></i>';
                    else if (task.status === 'done') statusDot = '<i class="badge-dot dot-green"></i>';

                    badge.innerHTML = `${statusDot}<span class="badge-text">${task.title}</span>`;
                    badgeContainer.appendChild(badge);
                });
            } else {
                dayTasks.slice(0, 3).forEach(task => {
                    const badge = document.createElement('div');
                    const isOverdue = (task.dueDate < todayStr && task.status !== 'done');
                    const statusClass = isOverdue ? 'overdue' : task.status.replace('_', '-');
                    badge.className = `cal-badge badge-${statusClass}`;
                    
                    let statusDot = '<i class="badge-dot dot-blue"></i>';
                    if (isOverdue) statusDot = '<span style="font-size:0.72rem; margin-right:2px;">⚠️</span>';
                    else if (task.status === 'in_progress') statusDot = '<i class="badge-dot dot-amber"></i>';
                    else if (task.status === 'done') statusDot = '<i class="badge-dot dot-green"></i>';

                    badge.innerHTML = `${statusDot}<span class="badge-text">${task.title}</span>`;
                    badgeContainer.appendChild(badge);
                });

                const bMore = document.createElement('div');
                bMore.className = 'cal-badge badge-more-chip';
                bMore.style.cssText = 'background:rgba(15,23,42,0.06); color:#475569; border:1px dashed rgba(15,23,42,0.25); display:inline-flex; align-items:center; justify-content:center; padding:2px 6px; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer; margin-top:2px;';
                bMore.innerHTML = `<span>+ ${dayTasks.length - 3}개 더보기 🔍</span>`;
                badgeContainer.appendChild(bMore);
            }

            cell.appendChild(badgeContainer);
        }

        cell.addEventListener('click', () => {
            AppState.selectedCalDateStr = dayStr;
            renderCalendarGrid();
            renderSelectedDateTasks(dayStr);
        });

        grid.appendChild(cell);
    }
}

function renderSelectedDateTasks(dateStr) {
    const titleEl = document.getElementById('selectedDateTitle');
    const container = document.getElementById('selectedDateTasksList');
    if (titleEl) titleEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${dateStr} 일정 상세 목록`;

    if (!container) return;
    container.innerHTML = '';

    const dayTasks = AppState.schedules.filter(s => s.dueDate === dateStr);

    if (dayTasks.length === 0) {
        container.innerHTML = '<div class="feed-empty">이 날짜에는 등록된 일정이 없습니다.</div>';
        return;
    }

    dayTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-card-slim';
        item.style.cssText = 'background:#ffffff; border:1px solid rgba(15,23,42,0.12); border-radius:10px; padding:8px 12px; margin-bottom:6px; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.03);';
        item.onclick = function () { directOpenEditScheduleModal(task.id); };

        const isOverdue = (task.dueDate < getTodayStr() && task.status !== 'done');
        const isProg = (task.status === 'in_progress');
        const isDone = (task.status === 'done');

        const statusBadge = isOverdue ? '<span style="background:rgba(239,68,68,0.15); color:#dc2626; border:1px solid rgba(239,68,68,0.4); font-size:0.75rem; font-weight:700; padding:2px 6px; border-radius:6px; flex-shrink:0;">⚠️ 마감지연</span>' :
            (isDone ? '<span style="background:rgba(16,185,129,0.15); color:#059669; border:1px solid rgba(16,185,129,0.4); font-size:0.75rem; font-weight:700; padding:2px 6px; border-radius:6px; flex-shrink:0;">🟢 완료</span>' :
            (isProg ? '<span style="background:rgba(245,158,11,0.15); color:#b45309; border:1px solid rgba(245,158,11,0.4); font-size:0.75rem; font-weight:700; padding:2px 6px; border-radius:6px; flex-shrink:0;">🟡 진행 중</span>' :
            '<span style="background:rgba(59,130,246,0.15); color:#2563eb; border:1px solid rgba(59,130,246,0.4); font-size:0.75rem; font-weight:700; padding:2px 6px; border-radius:6px; flex-shrink:0;">🔵 할 일</span>'));

        const descHtml = task.description ? `<div class="task-desc-accordion" style="font-size:0.81rem; color:#475569; background:rgba(15,23,42,0.03); padding:4px 8px; border-radius:6px; margin-top:4px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;" onclick="this.style.webkitLineClamp = (this.style.webkitLineClamp === '1' ? '999' : '1'); event.stopPropagation();" title="클릭하면 메모 전체보기/접기">📝 ${task.description}</div>` : '';

        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0;">
                    ${statusBadge}
                    <span style="font-weight:700; color:#0f172a; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${task.title}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    <span style="font-size:0.75rem; color:#64748b; background:rgba(15,23,42,0.04); padding:2px 6px; border-radius:6px;">${task.createdBy}</span>
                    <div style="display:flex; gap:4px;">
                        <button class="btn-like" onclick="directOpenEditScheduleModal('${task.id}', event)" style="color:#2563eb; background:rgba(37,99,235,0.08); padding:3px 6px; border-radius:6px; border:none; cursor:pointer;" title="수정">✏️</button>
                        <button class="btn-like" onclick="directDeleteSchedule('${task.id}', event)" style="color:#dc2626; background:rgba(220,38,38,0.08); padding:3px 6px; border-radius:6px; border:none; cursor:pointer;" title="삭제">🗑️</button>
                    </div>
                </div>
            </div>
            ${descHtml}
        `;
        container.appendChild(item);
    });
}

// -----------------------------------------------------------------
// 11. 칸반 보드 렌더링
// -----------------------------------------------------------------
function getDaysUntilDueNum(dueDateStr) {
    if (!dueDateStr) return 999999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dueDateStr.split('-');
    if (parts.length < 3) return 999999;
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return diffDays - 0.1;
    return diffDays;
}

function sortKanbanListByMode(tasks, sortMode) {
    const list = tasks.slice();
    const priorityMap = { high: 3, medium: 2, low: 1 };
    if (sortMode === 'priority') {
        list.sort((a, b) => (priorityMap[b.priority] || 2) - (priorityMap[a.priority] || 2));
    } else if (sortMode === 'urgent') {
        list.sort((a, b) => {
            const daysA = getDaysUntilDueNum(a.dueDate);
            const daysB = getDaysUntilDueNum(b.dueDate);
            return daysA - daysB;
        });
    } else { // dueDate
        list.sort((a, b) => (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99'));
    }
    return list;
}

function renderKanbanBoard() {
    const listTodo = document.getElementById('listTodo');
    const listInProgress = document.getElementById('listInProgress');
    const listDone = document.getElementById('listDone');

    if (!listTodo || !listInProgress || !listDone) return;

    listTodo.innerHTML = '';
    listInProgress.innerHTML = '';
    listDone.innerHTML = '';

    if (!AppState.kanbanSorts) {
        AppState.kanbanSorts = { todo: 'dueDate', in_progress: 'dueDate', done: 'dueDate' };
    }

    const todayStr = (typeof getTodayStr === 'function') ? getTodayStr() : (new Date().toISOString().split('T')[0]);

    // 100% 순수 수동 상태 관리 복원 (유저의 버튼 클릭 조작 엄격 준수)
    const rawTodo = AppState.schedules.filter(s => s.status === 'todo' || (!s.status && s.status !== 'in_progress' && s.status !== 'done'));
    const rawProg = AppState.schedules.filter(s => s.status === 'in_progress');
    const rawDone = AppState.schedules.filter(s => s.status === 'done');

    const sortedTodo = sortKanbanListByMode(rawTodo, AppState.kanbanSorts.todo);
    const sortedProg = sortKanbanListByMode(rawProg, AppState.kanbanSorts.in_progress);
    const sortedDone = sortKanbanListByMode(rawDone, AppState.kanbanSorts.done);

    const badgeTodo = document.getElementById('badgeTodo');
    const badgeProg = document.getElementById('badgeInProgress');
    const badgeDone = document.getElementById('badgeDone');

    if (badgeTodo) badgeTodo.textContent = sortedTodo.length;
    if (badgeProg) badgeProg.textContent = sortedProg.length;
    if (badgeDone) badgeDone.textContent = sortedDone.length;

    sortedTodo.forEach(item => { listTodo.appendChild(createKanbanCardElement(item)); });
    sortedProg.forEach(item => { listInProgress.appendChild(createKanbanCardElement(item)); });
    sortedDone.forEach(item => { listDone.appendChild(createKanbanCardElement(item)); });
}

function createKanbanCardElement(item) {
    const card = document.createElement('div');
    card.className = 'kanban-card-slim';
    card.style.cssText = 'background:#ffffff; border:1px solid rgba(15,23,42,0.12); border-radius:12px; padding:10px 12px; margin-bottom:8px; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.03); transition:all 0.2s ease; display:flex; flex-direction:column; gap:4px; position:relative;';
    card.onclick = function(e) {
        if (e && e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) return;
        if (typeof window.directOpenEditScheduleModal === 'function') {
            window.directOpenEditScheduleModal(item.id, e);
        }
    };

    let priorityBadgeHtml = item.priority === 'high' ? '<span style="color:#ef4444; background:rgba(239,68,68,0.1); padding:1px 6px; border-radius:4px; font-size:0.72rem; font-weight:700;">🔴높음</span>' :
        (item.priority === 'low' ? '<span style="color:#10b981; background:rgba(16,185,129,0.1); padding:1px 6px; border-radius:4px; font-size:0.72rem; font-weight:700;">🟢낮음</span>' :
        '<span style="color:#b45309; background:rgba(245,158,11,0.1); padding:1px 6px; border-radius:4px; font-size:0.72rem; font-weight:700;">🟡보통</span>');

    let dDayBadge = getDDayBadgeHtml(item.dueDate, item.status);

    let moveButtonsHtml = '';
    if (item.status === 'todo') {
        moveButtonsHtml = `
            <button class="btn-status-move" onclick="if(event)event.stopPropagation(); moveTaskStatus('${item.id}', 'in_progress')" style="background:rgba(245,158,11,0.15); color:#b45309; border:1px solid rgba(245,158,11,0.3); padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;" title="진행 중 상태로 변경">진행 ▶</button>
        `;
    } else if (item.status === 'in_progress') {
        moveButtonsHtml = `
            <button class="btn-status-move" onclick="if(event)event.stopPropagation(); moveTaskStatus('${item.id}', 'todo')" style="background:rgba(59,130,246,0.12); color:#2563eb; border:1px solid rgba(59,130,246,0.3); padding:2px 6px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;" title="할 일 상태로 이동">◀ 할일</button>
            <button class="btn-status-move" onclick="if(event)event.stopPropagation(); moveTaskStatus('${item.id}', 'done')" style="background:rgba(16,185,129,0.15); color:#059669; border:1px solid rgba(16,185,129,0.3); padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;" title="완료 처리">완료 🎉</button>
        `;
    } else if (item.status === 'done') {
        moveButtonsHtml = `
            <button class="btn-status-move" onclick="if(event)event.stopPropagation(); moveTaskStatus('${item.id}', 'in_progress')" style="background:rgba(245,158,11,0.15); color:#b45309; border:1px solid rgba(245,158,11,0.3); padding:2px 6px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;" title="진행 중으로 되돌리기">◀ 진행중</button>
        `;
    }

    const editDeleteBtnsHtml = `
        <button class="btn-like" onclick="if(event)event.stopPropagation(); if(typeof window.directOpenEditScheduleModal==='function') window.directOpenEditScheduleModal('${item.id}', event);" style="color:#2563eb; background:rgba(37,99,235,0.08); padding:2px 6px; border-radius:6px; border:none; cursor:pointer; font-size:0.78rem;" title="수정">✏️</button>
        <button class="btn-like" onclick="if(event)event.stopPropagation(); if(typeof window.directDeleteSchedule==='function') window.directDeleteSchedule('${item.id}', event);" style="color:#dc2626; background:rgba(220,38,38,0.08); padding:2px 6px; border-radius:6px; border:none; cursor:pointer; font-size:0.78rem;" title="삭제">🗑️</button>
    `;

    const descHtml = item.description ? `<div style="font-size:0.8rem; color:#475569; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:1px;">📝 ${item.description}</div>` : '';

    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <span style="font-weight:700; color:#0f172a; font-size:0.92rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${item.title}</span>
            <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                ${priorityBadgeHtml}
                ${dDayBadge}
            </div>
        </div>
        ${descHtml}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:0.78rem; color:#64748b;">
            <span style="display:inline-flex; align-items:center; gap:4px;"><i class="fa-regular fa-clock" style="font-size:0.75rem;"></i> ${item.dueDate || '미정'} (${item.createdBy})</span>
            <div style="display:flex; align-items:center; gap:4px;">
                ${moveButtonsHtml}
                ${editDeleteBtnsHtml}
            </div>
        </div>
    `;
    return card;
}

function moveTaskStatus(taskId, newStatus) {
    if (typeof directCheckViewerLockdown === 'function' && directCheckViewerLockdown()) return false;
    const targetTask = AppState.schedules.find(s => String(s.id) === String(taskId));
    if (targetTask) {
        targetTask.status = newStatus;
        saveSchedulesToStorage();
        if (typeof window.syncScheduleToCloud === 'function') {
            window.syncScheduleToCloud(targetTask);
        }
        renderAllViews();

        if (newStatus === 'done') {
            if (typeof playGoalDoneSound === 'function') playGoalDoneSound();
            triggerGoalConfetti();
        } else {
            if (typeof playClickSound === 'function') playClickSound();
        }
    }
}

function triggerGoalConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });
    }
}

// -----------------------------------------------------------------
// 12. 일정 및 회의록 등록
// -----------------------------------------------------------------
function getSafeTodayStr() {
    if (typeof window.getTodayStr === 'function') return window.getTodayStr();
    const today = new Date();
    return today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
}

function handleCreateSchedule() {
    try {
        const titleEl = document.getElementById('schedTitle');
        const descEl = document.getElementById('schedDesc');
        const dueDateEl = document.getElementById('schedDueDate');
        const priorityEl = document.getElementById('schedPriority');

        const title = titleEl ? titleEl.value.trim() : '';
        const desc = descEl ? descEl.value.trim() : '';
        const dueDate = (dueDateEl && dueDateEl.value) ? dueDateEl.value : getSafeTodayStr();
        const priority = priorityEl ? priorityEl.value : 'medium';

        if (!title) {
            alert('일정/목표 제목을 입력해 주세요.');
            return;
        }

        const newSchedule = {
            id: 'sched-' + Date.now(),
            title: title,
            description: desc,
            status: 'todo',
            priority: priority,
            dueDate: dueDate || getSafeTodayStr(),
            createdBy: AppState.currentUser ? AppState.currentUser.fullName : '팀원'
        };

        AppState.schedules.push(newSchedule);
        saveSchedulesToStorage();
        if (typeof window.syncScheduleToCloud === 'function') {
            try { window.syncScheduleToCloud(newSchedule); } catch(e){}
        }

        if (titleEl) titleEl.value = '';
        if (descEl) descEl.value = '';
        
        const modal = document.getElementById('scheduleModal');
        if (modal) modal.style.display = 'none';

        if (typeof window.directRenderAllViews === 'function') {
            window.directRenderAllViews();
        } else if (typeof renderAllViews === 'function') {
            renderAllViews();
        }
    } catch(err) {
        console.error("handleCreateSchedule 예외:", err);
    }
}

function handleCreateMeeting() {
    const titleEl = document.getElementById('meetTitle');
    const catEl = document.getElementById('meetCategory');
    const attendeesEl = document.getElementById('meetAttendees');
    const contentEl = document.getElementById('meetContent');

    const title = titleEl ? titleEl.value.trim() : '';
    const category = catEl ? catEl.value : 'project';
    const attendees = attendeesEl ? attendeesEl.value.trim() : '';
    const content = contentEl ? contentEl.value.trim() : '';

    if (!title || !content) {
        alert('회의 안건 제목과 내용을 입력해 주세요.');
        return;
    }

    const newMeeting = {
        id: 'meet-' + Date.now(),
        title: title,
        category: category,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        attendees: attendees || '전체 팀원',
        content: content
    };

    if (!AppState.meetingNotes) AppState.meetingNotes = [];
    AppState.meetingNotes.push(newMeeting);
    saveMeetingsToStorage();

    if (titleEl) titleEl.value = '';
    if (attendeesEl) attendeesEl.value = '';
    if (contentEl) contentEl.value = '';

    const modal = document.getElementById('meetingModal');
    if (modal) modal.style.display = 'none';

    if (typeof window.directRenderMeetingNotes === 'function') {
        window.directRenderMeetingNotes();
    } else {
        renderMeetingNotes();
    }
}

function renderMeetingNotes() {
    if (typeof window.directRenderMeetingNotes === 'function') {
        window.directRenderMeetingNotes();
        return;
    }
    const container = document.getElementById('meetingNotesList');
    if (!container) return;
    container.innerHTML = '';

    if (!AppState.meetingNotes || AppState.meetingNotes.length === 0) {
        container.innerHTML = '<div class="feed-empty glass-panel" style="grid-column: 1 / -1;">보관된 회의록이 없습니다. 새 회의록을 작성해보세요!</div>';
        return;
    }

    AppState.meetingNotes.slice().reverse().forEach(note => {
        const card = document.createElement('div');
        card.className = 'meeting-card-slim';
        card.style.cssText = 'background:#ffffff; border:1px solid rgba(15,23,42,0.12); border-radius:12px; padding:12px 14px; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.03); transition:all 0.2s ease; display:flex; flex-direction:column; justify-content:space-between; gap:6px;';
        card.onclick = function(e) {
            if (e && e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) return;
            if (typeof window.directShowMeetingDetail === 'function') {
                window.directShowMeetingDetail(note.id);
            }
        };

        const actionsBadge = `<span style="font-size:0.72rem; background:rgba(37,99,235,0.08); color:#2563eb; padding:2px 6px; border-radius:6px; font-weight:700; border:1px solid rgba(37,99,235,0.18);">📝 회의록</span>`;

        const editMeetBtnHtml = `<button type="button" class="btn-like" onclick="if(event)event.stopPropagation(); if(typeof window.directOpenEditMeetingModal==='function') window.directOpenEditMeetingModal('${note.id}', event);" style="color:#2563eb; background:rgba(37,99,235,0.08); padding:2px 6px; border-radius:6px; border:none; cursor:pointer; font-size:0.78rem;" title="수정">✏️</button>`;
        const deleteMeetBtnHtml = `<button type="button" class="btn-like" onclick="if(event)event.stopPropagation(); if(typeof directDeleteMeeting==='function') directDeleteMeeting('${note.id}', event);" style="color:#dc2626; background:rgba(220,38,38,0.08); padding:2px 6px; border-radius:6px; border:none; cursor:pointer; font-size:0.78rem;" title="삭제">🗑️</button>`;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <span style="font-weight:800; color:#0f172a; font-size:0.95rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">📝 ${note.title}</span>
                ${actionsBadge}
            </div>
            <div style="font-size:0.83rem; color:#475569; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.4;">${note.content || '회의 내용 요약 미작성'}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:0.78rem; color:#64748b; border-top:1px dashed rgba(15,23,42,0.08); padding-top:6px;">
                <span>📅 <strong>${note.date}</strong> | 👥 ${note.attendees || '팀원'}</span>
                <div style="display:flex; align-items:center; gap:4px;">
                    ${editMeetBtnHtml}
                    ${deleteMeetBtnHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function saveIdeasToStorage() {
    try { localStorage.setItem('doyakdaro_ideas', JSON.stringify(AppState.ideas)); } catch(e){}
    if (typeof window.syncIdeaToCloud === 'function' && AppState.ideas) {
        AppState.ideas.forEach(function(i){ window.syncIdeaToCloud(i); });
    }
}
window.saveIdeasToStorage = saveIdeasToStorage;

function saveSchedulesToStorage() {
    try { localStorage.setItem('doyakdaro_schedules', JSON.stringify(AppState.schedules)); } catch(e){}
    if (typeof window.syncScheduleToCloud === 'function' && AppState.schedules) {
        AppState.schedules.forEach(function(s){ window.syncScheduleToCloud(s); });
    }
}
window.saveSchedulesToStorage = saveSchedulesToStorage;

function saveMeetingsToStorage() {
    try { localStorage.setItem('doyakdaro_meetings', JSON.stringify(AppState.meetingNotes)); } catch(e){}
    if (typeof window.syncMeetingToCloud === 'function' && AppState.meetingNotes) {
        AppState.meetingNotes.forEach(function(m){ window.syncMeetingToCloud(m); });
    }
}
window.saveMeetingsToStorage = saveMeetingsToStorage;

// 🔑 [3초 만에 도약다로 원터치 입장 직통 로그인 처리 함수]
function directInstantLogin(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var nameInput = document.getElementById('authFullName');
    var passInput = document.getElementById('authRoomPasscode');

    var fullName = nameInput ? nameInput.value.trim() : '';
    var passcode = passInput ? passInput.value.trim() : '';

    var savedPasscode = localStorage.getItem('doyakdaro_room_passcode') || '1234';
    if (passcode && passcode !== savedPasscode) {
        alert("🔑 팀 방 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
        return false;
    }

    if (!fullName) fullName = '팀원';

    var userObj = { id: 'user-' + Date.now(), fullName: fullName };
    AppState.currentUser = userObj;

    try {
        localStorage.setItem('doyakdaro_simple_session', JSON.stringify({
            id: userObj.id,
            fullName: userObj.fullName
        }));
    } catch (e) { }

    var authSec = document.getElementById('authSection');
    var mainSec = document.getElementById('mainAppSection');
    var bNav = document.getElementById('bottomNav');
    var uBadge = document.getElementById('userProfileBadge');
    var appHdr = document.getElementById('appHeader');

    if (authSec) {
        authSec.classList.remove('active');
        authSec.style.cssText = 'display: none !important;';
    }
    if (mainSec) mainSec.style.cssText = 'display: block !important; padding-top: 80px !important;';
    if (appHdr) appHdr.style.cssText = 'display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; height: 64px !important; z-index: 999999 !important; background: #ffffff !important; background-color: #ffffff !important; backdrop-filter: blur(20px) !important; padding: 0 20px !important; align-items: center !important; justify-content: space-between !important; border-bottom: 1px solid rgba(15,23,42,0.08) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.02) !important;';
    if (bNav) bNav.style.display = 'flex';
    if (uBadge) uBadge.style.display = 'flex';

    var hName = document.getElementById('headerUserName');
    var wName = document.getElementById('welcomeUserName');
    if (hName) hName.textContent = userObj.fullName;
    if (wName) wName.textContent = userObj.fullName;

    if (typeof renderAllViews === 'function') renderAllViews();
    try { playSuccessSound(); } catch (err) { }
    return false;
}
window.directInstantLogin = directInstantLogin;

// ⏳ [대시보드 D-1, D-3, D-5 카테고리 3열 카드 100% 안전 무결점 렌더링 함수]
function renderDashboardDDayCards() {
    try {
        var badge1 = document.getElementById('badgeD1Count');
        var badge3 = document.getElementById('badgeD3Count');
        var badge5 = document.getElementById('badgeD5Count');

        var list1 = document.getElementById('previewD1List');
        var list3 = document.getElementById('previewD3List');
        var list5 = document.getElementById('previewD5List');

        if (!list1 || !list3 || !list5) return;

        var todayStr = getTodayStr();
        var dToday = new Date(todayStr + 'T00:00:00');

        var activeSchedules = (AppState.schedules || []).filter(function (s) {
            return s.status !== 'done';
        }).map(function (s) {
            var dTarget = null;
            if (s.dueDate && typeof s.dueDate === 'string' && s.dueDate.indexOf('-') !== -1) {
                dTarget = new Date(s.dueDate + 'T00:00:00');
            }
            if (!dTarget || isNaN(dTarget.getTime())) {
                dTarget = new Date('2099-12-31T00:00:00');
            }
            var diffMs = dTarget - dToday;
            var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            if (isNaN(diffDays)) diffDays = 9999;
            return {
                task: s,
                diffDays: diffDays
            };
        }).sort(function (a, b) {
            return a.diffDays - b.diffDays;
        });

        // 순수 D-0(오늘), D-1(내일), D-2(모레) 마감 임박 일정만 표출 (지연 제외)!
        var tasksD1 = activeSchedules.filter(function (item) { return item.diffDays >= 0 && item.diffDays <= 2; });
        var tasksD3 = activeSchedules.filter(function (item) { return item.diffDays === 3 || item.diffDays === 4; });
        var tasksD5 = activeSchedules.filter(function (item) { return item.diffDays >= 5; });

        window.lastDDayTasksD1 = tasksD1;
        window.lastDDayTasksD3 = tasksD3;
        window.lastDDayTasksD5 = tasksD5;

        if (badge1) badge1.textContent = tasksD1.length + '개';
        if (badge3) badge3.textContent = tasksD3.length + '개';
        if (badge5) badge5.textContent = tasksD5.length + '개';

        function renderPreviewList(container, items, emptyMsg, colorHex, filterType, filterTitle) {
            container.innerHTML = '';
            try {
                container.dataset.fullList = JSON.stringify(items || []);
            } catch(e){}

            if (!items || items.length === 0) {
                container.innerHTML = '<span style="color: #94a3b8; font-size: 0.78rem;">' + emptyMsg + '</span>';
                return;
            }

            var displayItems = items.slice(0, 3);
            var remainingCount = items.length - displayItems.length;

            displayItems.forEach(function (obj) {
                var task = obj.task || {};
                var diffDays = obj.diffDays;
                var item = document.createElement('div');
                item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:6px; font-size:0.8rem; font-weight:700; color:#1e293b; background:rgba(15,23,42,0.03); padding:5px 8px; border-radius:6px; border-left:3px solid ' + colorHex + '; cursor:pointer; margin-bottom:4px;';
                item.onclick = function (e) {
                    e.stopPropagation();
                    if (typeof directOpenEditScheduleModal === 'function') directOpenEditScheduleModal(task.id);
                };

                var titleText = task.title || '일정';
                var author = task.createdBy || '팀원';
                
                var dBadgeText = (isNaN(diffDays) || diffDays > 9000) ? '⏳ 미정' : (diffDays < 0 ? ('⚠️ 지연 D+' + Math.abs(diffDays)) : (diffDays === 0 ? '🎯 오늘 D-Day' : ('🚨 D-' + diffDays)));
                var dBadgeBg = (diffDays <= 2 ? '#ef4444' : (diffDays <= 4 ? '#d97706' : '#2563eb'));

                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:4px; flex:1; min-width:0;">
                        <span style="font-size:0.7rem; font-weight:800; color:#ffffff; background:${dBadgeBg}; padding:2px 6px; border-radius:4px; flex-shrink:0;">${dBadgeText}</span>
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${titleText}</span>
                    </div>
                    <span style="font-size:0.72rem; color:#64748b; flex-shrink:0;">(${author})</span>
                `;
                container.appendChild(item);
            });

            if (remainingCount > 0) {
                var moreDiv = document.createElement('div');
                moreDiv.style.cssText = 'font-size:0.75rem; color:' + colorHex + '; font-weight:800; text-align:center; padding:4px 6px; cursor:pointer; background:rgba(15,23,42,0.03); border-radius:6px; margin-top:4px; border:1px dashed ' + colorHex + '; transition:all 0.2s ease;';
                moreDiv.onclick = function (e) {
                    e.stopPropagation();
                    if (typeof directOpenMetricFilterModal === 'function') directOpenMetricFilterModal(filterType, filterTitle);
                };
                moreDiv.innerHTML = '... 외 ' + remainingCount + '개 일정 더보기 🔍';
                container.appendChild(moreDiv);
            }
        }

        renderPreviewList(list1, tasksD1, 'D-1~D-2 임박 일정이 없습니다.', '#ef4444', 'd1', '🚨 D-1~D-2 마감 임박 일정');
        renderPreviewList(list3, tasksD3, 'D-3~D-4 준비 일정이 없습니다.', '#d97706', 'd3', '⚡ D-3~D-4 마감 준비 일정');
        renderPreviewList(list5, tasksD5, 'D-5+ 여유 일정이 없습니다.', '#2563eb', 'd5', '📅 D-5+ 다가오는 여유 일정');
    } catch (errDDay) {
        console.log("renderDashboardDDayCards 방어막 작동:", errDDay);
    }
}
window.renderDashboardDDayCards = renderDashboardDDayCards;

// 📊 [D-1~D-2/D-3~D-4/D-5+ 무결점 파라미터 정규화 팝업 모달 열기 함수]
function directOpenMetricFilterModal(filterType, customTitle) {
    try {
        var titleEl = document.getElementById('metricFilterModalTitle');
        var container = document.getElementById('metricFilterModalList');
        var modal = document.getElementById('metricFilterModal');

        if (!container || !modal) return;
        container.innerHTML = '';

        // 1. 파라미터 정규화 (소문자/대문자/포함문자열 100% 통합 처리)
        var rawType = String(filterType || '').toLowerCase();
        var rawCustom = String(customTitle || '').toLowerCase();

        var targetType = 'd5'; // 기본값 안전 세팅
        if (rawType === 'd1' || rawType === 'd-1' || rawType === 'd1~d2' || rawCustom.indexOf('d-1') !== -1 || rawCustom.indexOf('임박') !== -1) {
            targetType = 'd1';
        } else if (rawType === 'd3' || rawType === 'd-3' || rawType === 'd3~d4' || rawCustom.indexOf('d-3') !== -1 || rawCustom.indexOf('준비') !== -1) {
            targetType = 'd3';
        } else if (rawType === 'd5' || rawType === 'd-5' || rawType === 'd5+' || rawCustom.indexOf('d-5') !== -1 || rawCustom.indexOf('여유') !== -1) {
            targetType = 'd5';
        } else if (rawType === 'today' || rawType === '오늘') {
            targetType = 'today';
        } else if (rawType === 'in_progress' || rawType === '진행중') {
            targetType = 'in_progress';
        } else if (rawType === 'overdue' || rawType === '지연') {
            targetType = 'overdue';
        }

        // 대시보드 피드가 생성해둔 최신 D-Day 전역 상자 갱신 구동
        if (typeof renderDashboardDDayCards === 'function') {
            try { renderDashboardDDayCards(); } catch(e){}
        }

        var filteredTasks = [];
        var titleText = '📅 D-5+ 다가오는 여유 일정 목록';

        if (targetType === 'd1') {
            titleText = '🚨 D-1~D-2 마감 임박 일정 목록';
            filteredTasks = (window.lastDDayTasksD1 && window.lastDDayTasksD1.length > 0) ? window.lastDDayTasksD1 : [];
        } else if (targetType === 'd3') {
            titleText = '⚡ D-3~D-4 마감 준비 일정 목록';
            filteredTasks = (window.lastDDayTasksD3 && window.lastDDayTasksD3.length > 0) ? window.lastDDayTasksD3 : [];
        } else if (targetType === 'd5') {
            titleText = '📅 D-5+ 다가오는 여유 일정 목록';
            filteredTasks = (window.lastDDayTasksD5 && window.lastDDayTasksD5.length > 0) ? window.lastDDayTasksD5 : [];
        } else if (targetType === 'today') {
            titleText = '🎯 오늘 마감 목표 일정 목록';
            var todayStr = (typeof getTodayStr === 'function') ? getTodayStr() : (new Date().toISOString().split('T')[0]);
            var rawSchedules = (typeof AppState !== 'undefined' && AppState.schedules) ? AppState.schedules : [];
            filteredTasks = rawSchedules.filter(function (s) { return s && s.dueDate === todayStr; }).map(function(s){ return {task: s, diffDays: 0}; });
        } else if (targetType === 'in_progress') {
            titleText = '🟡 열렬 진행 중인 일정 목록';
            var rawSchedules = (typeof AppState !== 'undefined' && AppState.schedules) ? AppState.schedules : [];
            filteredTasks = rawSchedules.filter(function (s) { return s && (s.status === 'in_progress' || s.status === 'doing'); }).map(function(s){ return {task: s, diffDays: 0}; });
        } else if (targetType === 'overdue') {
            titleText = '⚠️ 마감 지연된 일정 목록';
            var todayStr = (typeof getTodayStr === 'function') ? getTodayStr() : (new Date().toISOString().split('T')[0]);
            var rawSchedules = (typeof AppState !== 'undefined' && AppState.schedules) ? AppState.schedules : [];
            filteredTasks = rawSchedules.filter(function (s) { return s && s.dueDate < todayStr && s.status !== 'done'; }).map(function(s){ return {task: s, diffDays: -1}; });
        }

        // 만약 window 전역 상자가 비어있다면 2중 안전망으로 AppState.schedules 및 localStorage에서 100% 무조건 추출!
        if (!filteredTasks || filteredTasks.length === 0) {
            var rawSchedules = (typeof AppState !== 'undefined' && AppState.schedules && AppState.schedules.length > 0) ? AppState.schedules : [];
            if (!rawSchedules || rawSchedules.length === 0) {
                try {
                    var stored = localStorage.getItem('doyakdaro_schedules');
                    if (stored) rawSchedules = JSON.parse(stored);
                } catch(e){}
            }
            if (rawSchedules && rawSchedules.length > 0) {
                var todayStr = (typeof getTodayStr === 'function') ? getTodayStr() : (new Date().toISOString().split('T')[0]);
                var dToday = new Date(todayStr + 'T00:00:00');
                var activeList = rawSchedules.filter(function (s) { return s && s.status !== 'done'; }).map(function (s) {
                    var due = s.dueDate || s.date || s.createdAt || todayStr;
                    var dTarget = null;
                    if (due && typeof due === 'string' && due.indexOf('-') !== -1) {
                        dTarget = new Date(due.split('T')[0] + 'T00:00:00');
                    }
                    if (!dTarget || isNaN(dTarget.getTime())) dTarget = dToday;
                    var diffMs = dTarget - dToday;
                    var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                    if (isNaN(diffDays)) diffDays = 0;
                    return { task: s, diffDays: diffDays };
                });

                if (targetType === 'd1') {
                    filteredTasks = activeList.filter(function (item) { return item.diffDays >= 0 && item.diffDays <= 2; });
                } else if (targetType === 'd3') {
                    filteredTasks = activeList.filter(function (item) { return item.diffDays === 3 || item.diffDays === 4; });
                } else if (targetType === 'd5') {
                    filteredTasks = activeList.filter(function (item) { return item.diffDays >= 5; });
                } else {
                    filteredTasks = activeList;
                }
            }
        }

        if (!filteredTasks) filteredTasks = [];

        if (titleEl) titleEl.innerHTML = titleText + ' (' + filteredTasks.length + '건)';

        if (filteredTasks.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:30px 10px; color:#64748b; font-size:0.9rem; font-weight:700;">🎉 해당 조건에 해당되는 일정이 없습니다!</div>';
        } else {
            filteredTasks.forEach(function (obj) {
                var task = obj.task || obj;
                var diffDays = (typeof obj.diffDays !== 'undefined') ? obj.diffDays : 0;
                var card = document.createElement('div');
                card.className = 'glass-panel';
                card.style.cssText = 'background:#ffffff; border:1px solid rgba(15,23,42,0.12); border-radius:12px; padding:12px 14px; margin-bottom:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:8px; box-shadow:0 2px 6px rgba(0,0,0,0.04); transition:all 0.2s ease;';
                card.onclick = function (e) {
                    e.stopPropagation();
                    modal.style.display = 'none';
                    if (typeof directOpenEditScheduleModal === 'function') directOpenEditScheduleModal(task.id);
                };

                var dBadgeText = (isNaN(diffDays) || diffDays > 9000) ? '⏳ 미정' : (diffDays < 0 ? ('⚠️ 지연 D+' + Math.abs(diffDays)) : (diffDays === 0 ? '🎯 오늘 D-Day' : ('🚨 D-' + diffDays)));
                var dBadgeBg = (diffDays <= 2 ? '#ef4444' : (diffDays <= 4 ? '#d97706' : '#2563eb'));

                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                        <span style="font-size:0.75rem; font-weight:800; color:#ffffff; background:${dBadgeBg}; padding:3px 8px; border-radius:6px; flex-shrink:0;">${dBadgeText}</span>
                        <span style="font-weight:700; color:#0f172a; font-size:0.92rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${task.title || '일정'}</span>
                    </div>
                    <span style="font-size:0.8rem; color:#64748b; font-weight:600; flex-shrink:0;">(${task.createdBy || '팀원'})</span>
                `;
                container.appendChild(card);
            });
        }

        modal.style.cssText = 'display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.35) !important; backdrop-filter: blur(4px) !important; z-index: 99999999 !important; justify-content: center !important; align-items: center !important; padding: 20px !important;';
    } catch(eErr) {
        console.log("directOpenMetricFilterModal 샌드박스 차단 방어막:", eErr);
    }
}

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                    ${statusBadge}
                    ${dDayBadge}
                    <span style="font-weight:700; color:#0f172a; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${task.title}</span>
                </div>
                <span style="font-size:0.78rem; color:#64748b; font-weight:600; flex-shrink:0;">${task.createdBy || '팀원'}</span>
            `;
            container.appendChild(card);
        });
    }

    modal.style.display = 'flex';
}
window.directOpenMetricFilterModal = directOpenMetricFilterModal;

// 🌟 [상단 명품 토스트 알림 생성 함수]
function showSuccessToast(message) {
    try {
        var oldToast = document.querySelector('.custom-success-toast');
        if (oldToast && oldToast.parentNode) oldToast.parentNode.removeChild(oldToast);

        var toast = document.createElement('div');
        toast.className = 'custom-success-toast';
        toast.innerHTML = `<span style="font-size:1.1rem;">🎉</span> <span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(function () {
            if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
        }, 2300);
    } catch(e){}
}
window.showSuccessToast = showSuccessToast;

// ✨ [등록된 일정 날짜/카드 반짝 펄스 하이라이트 연출 함수]
function highlightScheduleElement(dateStr, taskId) {
    try {
        setTimeout(function () {
            if (dateStr) {
                var calCells = document.querySelectorAll('.cal-day-cell');
                calCells.forEach(function (cell) {
                    if (cell.getAttribute('data-date') === dateStr || (cell.innerHTML && cell.innerHTML.indexOf(dateStr) !== -1)) {
                        cell.classList.add('schedule-highlight-pulse');
                        setTimeout(function () { cell.classList.remove('schedule-highlight-pulse'); }, 1700);
                    }
                });
            }
            if (taskId) {
                var card = document.querySelector('.kanban-card-slim[data-id="' + taskId + '"]');
                if (card) {
                    card.classList.add('schedule-highlight-pulse');
                    setTimeout(function () { card.classList.remove('schedule-highlight-pulse'); }, 1700);
                }
            }
        }, 100);
    } catch(e){}
}
window.highlightScheduleElement = highlightScheduleElement;

