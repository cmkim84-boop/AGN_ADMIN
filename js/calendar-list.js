document.getElementById('btnAddCalendar').addEventListener('click', function () {
    window.location.href = '04_캘린더추가.html';
  });

  function fmtCreated(daysAgo) {
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
  }

  var eventPool = [
    '서초구 스마트시티 컨퍼런스',
    '반포한강공원 벚꽃축제',
    '지역경제 활성화 토론회',
    '자전거 안전교육 캠페인',
    '아주경제 부산 창간기념 행사',
    '지자체의회 정기회의',
    '스타트업 데모데이',
    '반포동 주민 화합 한마당',
    '교통정책 공청회',
    '중소상공인 지원 설명회',
    '지역 문화예술 축제',
    '스마트 모빌리티 박람회',
    '청년 취업박람회',
    '환경의 날 기념행사',
    '지역 신문의 날 기념식',
    '자원봉사자의 날 행사',
    '반포바이크 1주년 기념식',
    '서초구청 온라인 시민 설명회',
    '지역 스포츠 대축전',
    '연말 불우이웃 돕기 행사'
  ];

  var TOTAL_EVENTS = 26;
  var calendarEvents = [];
  var now = new Date();
  for (var i = 0; i < TOTAL_EVENTS; i++) {
    var monthOffset = i % 14; // 최근 ~14개월에 걸쳐 분산
    var startD = new Date(now.getFullYear(), now.getMonth() - monthOffset, 5 + (i % 20));
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var toStr = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

    var isMultiDay = i % 4 === 0; // 4개 중 1개꼴로 여러 날짜에 걸친 행사
    var endD = new Date(startD);
    if (isMultiDay) {
      endD.setDate(endD.getDate() + 1 + (i % 4)); // 2~5일짜리 행사
    }

    calendarEvents.push({
      startDate: toStr(startD),
      endDate: toStr(endD),
      content: eventPool[i % eventPool.length],
      exposed: i % 3 !== 0,
      createdAt: fmtCreated(monthOffset * 30 + (i % 5)),
      articleUrl: (i % 5 === 0) ? 'https://www.ajunews.com/view/example-' + (i + 1) : ''
    });
  }
  // 최신 시작일순 정렬
  calendarEvents.sort(function (a, b) { return new Date(b.startDate) - new Date(a.startDate); });

  var yearSelect = document.getElementById('yearSelect');
  var monthSelect = document.getElementById('monthSelect');

  var years = Array.from(new Set(calendarEvents.map(function (e) { return e.startDate.slice(0, 4); }))).sort().reverse();
  yearSelect.innerHTML = '<option value="all">전체 연도</option>' +
    years.map(function (y) { return '<option value="' + y + '">' + y + '년</option>'; }).join('');

  for (var m = 1; m <= 12; m++) {
    var opt = document.createElement('option');
    opt.value = String(m);
    opt.textContent = m + '월';
    monthSelect.appendChild(opt);
  }

  var PAGE_SIZE = 10;
  var currentPage = 1;

  yearSelect.addEventListener('change', function () { currentPage = 1; renderCalendar(); });
  monthSelect.addEventListener('change', function () { currentPage = 1; renderCalendar(); });

  var tbody = document.getElementById('calendarTableBody');

  function formatDateCell(e) {
    return e.startDate === e.endDate ? e.startDate : (e.startDate + ' ~ ' + e.endDate);
  }

  function eventInYearMonth(e, year, month) {
    // 시작일~종료일 사이에 선택한 연/월에 해당하는 날짜가 하나라도 포함되면 매치
    var start = new Date(e.startDate);
    var end = new Date(e.endDate);
    for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      var y = String(d.getFullYear());
      var mo = String(d.getMonth() + 1);
      if ((year === 'all' || y === year) && (month === 'all' || mo === month)) return true;
    }
    return false;
  }

  function renderCalendar() {
    var year = yearSelect.value;
    var month = monthSelect.value;

    var filtered = calendarEvents.filter(function (e) {
      return eventInYearMonth(e, year, month);
    });

    tbody.innerHTML = '';
    var paginationEl = document.getElementById('calendarPagination');

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">조건에 맞는 일정이 없습니다</td></tr>';
      paginationEl.innerHTML = '';
      return;
    }

    var totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    var startIdx = (currentPage - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    pageItems.forEach(function (e, i) {
      var idx = startIdx + i;
      var realIdx = calendarEvents.indexOf(e);
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="col-no">' + (idx + 1) + '</td>' +
        '<td class="col-date">' + formatDateCell(e) + '</td>' +
        '<td class="col-content"><div class="content-row"><span class="content-cell">' + e.content + '</span>' + (e.articleUrl ? '<a class="article-link-icon" href="' + e.articleUrl + '" target="_blank" rel="noopener" title="관련 기사 보기">🔗 기사</a>' : '') + '</div></td>' +
        '<td class="col-onoff"><label class="switch"><input type="checkbox" class="expose-toggle" data-idx="' + realIdx + '" ' + (e.exposed ? 'checked' : '') + '><span class="switch-track"></span></label></td>' +
        '<td class="col-created">' + e.createdAt + '</td>' +
        '<td class="col-del"><div class="row-actions"><button class="btn-edit" data-idx="' + realIdx + '">수정</button><button class="btn-delete" data-idx="' + realIdx + '">×</button></div></td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.expose-toggle').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = Number(chk.getAttribute('data-idx'));
        calendarEvents[idx].exposed = chk.checked;
        showToast(chk.checked ? '메인페이지에 노출됩니다' : '메인페이지 노출 해제');
      });
    });

    tbody.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.location.href = '05_캘린더수정.html';
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-idx'));
        var content = calendarEvents[idx].content;
        calendarEvents.splice(idx, 1);
        renderCalendar();
        showToast('"' + content + '" 일정이 삭제되었습니다');
      });
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    var pagination = document.getElementById('calendarPagination');
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', function () { currentPage -= 1; renderCalendar(); });
    pagination.appendChild(prevBtn);

    for (var p = 1; p <= totalPages; p++) {
      (function (p) {
        var pageBtn = document.createElement('button');
        pageBtn.textContent = String(p);
        if (p === currentPage) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', function () { currentPage = p; renderCalendar(); });
        pagination.appendChild(pageBtn);
      })(p);
    }

    var nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', function () { currentPage += 1; renderCalendar(); });
    pagination.appendChild(nextBtn);
  }

  renderCalendar();

  // ── AI 캘린더 추가 ──
  var aiModalOverlay = document.getElementById('aiModalOverlay');
  var aiYearSelect = document.getElementById('aiYearSelect');
  var aiMonthSelect = document.getElementById('aiMonthSelect');
  var aiSelectPane = document.getElementById('aiSelectPane');
  var aiLoading = document.getElementById('aiLoading');
  var aiCandidatesEl = document.getElementById('aiCandidates');
  var aiFooterSelect = document.getElementById('aiFooterSelect');
  var aiFooterResult = document.getElementById('aiFooterResult');

  var thisYear = new Date().getFullYear();
  var aiYearOptions = [thisYear - 1, thisYear, thisYear + 1];
  aiYearSelect.innerHTML = aiYearOptions.map(function (y) { return '<option value="' + y + '">' + y + '년</option>'; }).join('');
  aiYearSelect.value = String(thisYear);

  for (var am = 1; am <= 12; am++) {
    var amOpt = document.createElement('option');
    amOpt.value = String(am);
    amOpt.textContent = am + '월';
    aiMonthSelect.appendChild(amOpt);
  }
  aiMonthSelect.value = String(new Date().getMonth() + 1);

  var aiCandidatesData = [];
  var aiSelectedSet = {};

  document.getElementById('btnAiAddCalendar').addEventListener('click', function () {
    resetAiModal();
    aiModalOverlay.classList.add('show');
  });
  document.getElementById('btnCloseAiModal').addEventListener('click', function () {
    aiModalOverlay.classList.remove('show');
  });
  aiModalOverlay.addEventListener('click', function (e) {
    if (e.target === aiModalOverlay) aiModalOverlay.classList.remove('show');
  });

  function resetAiModal() {
    aiSelectPane.style.display = 'block';
    aiLoading.classList.remove('show');
    aiCandidatesEl.classList.remove('show');
    aiCandidatesEl.innerHTML = '';
    aiFooterSelect.style.display = 'flex';
    aiFooterResult.style.display = 'none';
    aiSelectedSet = {};
  }

  document.getElementById('btnAiBack').addEventListener('click', resetAiModal);

  var aiEventPool = ['지역 문화축제', '전통시장 활성화 행사', '어린이날 기념 행사', '지자체 정기 설명회', '주민 참여 토론회', '환경 정화 캠페인', '청년 창업 박람회', '반려동물 축제', '지역 도서관 북페스티벌', '노인 일자리 박람회'];

  function generateAiCandidates(year, month) {
    var count = 4 + Math.floor(Math.random() * 3); // 4~6개
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var list = [];
    for (var i = 0; i < count; i++) {
      var day = 3 + ((i * 5) % 25);
      list.push({
        title: aiEventPool[(i + Number(month)) % aiEventPool.length],
        date: year + '-' + pad(Number(month)) + '-' + pad(day),
        source: (i % 2 === 0) ? '공공데이터' : '웹검색'
      });
    }
    return list;
  }

  document.getElementById('btnAiSearch').addEventListener('click', function () {
    aiSelectPane.style.display = 'none';
    aiLoading.classList.add('show');
    aiFooterSelect.style.display = 'none';

    setTimeout(function () {
      aiLoading.classList.remove('show');
      aiCandidatesData = generateAiCandidates(aiYearSelect.value, aiMonthSelect.value);
      renderAiCandidates();
      aiCandidatesEl.classList.add('show');
      aiFooterResult.style.display = 'flex';
    }, 900);
  });

  function renderAiCandidates() {
    aiCandidatesEl.innerHTML = '';
    aiCandidatesData.forEach(function (c, idx) {
      var item = document.createElement('label');
      item.className = 'ai-candidate-item';
      item.innerHTML =
        '<input type="checkbox" data-idx="' + idx + '">' +
        '<div class="ac-body">' +
          '<div class="ac-title">' + c.title + '<span class="ac-source">' + c.source + '</span></div>' +
          '<div class="ac-meta">' + c.date + '</div>' +
        '</div>';
      aiCandidatesEl.appendChild(item);
    });

    aiCandidatesEl.querySelectorAll('input[type="checkbox"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = Number(chk.getAttribute('data-idx'));
        if (chk.checked) {
          aiSelectedSet[idx] = true;
        } else {
          delete aiSelectedSet[idx];
        }
        updateAiSelectedCount();
      });
    });
    updateAiSelectedCount();
  }

  function updateAiSelectedCount() {
    document.getElementById('aiSelectedCount').textContent = Object.keys(aiSelectedSet).length + '개 선택됨';
  }

  document.getElementById('btnAiRegister').addEventListener('click', function () {
    var indices = Object.keys(aiSelectedSet);
    if (indices.length === 0) {
      showToast('등록할 항목을 선택해주세요');
      return;
    }
    var today = fmtCreated(0);
    indices.forEach(function (idxStr) {
      var c = aiCandidatesData[Number(idxStr)];
      calendarEvents.push({
        startDate: c.date,
        endDate: c.date,
        content: c.title,
        exposed: true,
        createdAt: today,
        articleUrl: ''
      });
    });
    calendarEvents.sort(function (a, b) { return new Date(b.startDate) - new Date(a.startDate); });
    aiModalOverlay.classList.remove('show');
    currentPage = 1;
    renderCalendar();
    showToast(indices.length + '개의 일정이 AI로 등록되었습니다');
  });
