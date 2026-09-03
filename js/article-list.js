document.getElementById('btnGoRegister').addEventListener('click', function () {
    window.location.href = '01_기사등록.html';
  });

  var statusLabel = { published: '발행중', scheduled: '예약발행', draft: '임시저장', private: '비공개' };

  function fmt(daysAgo, hour, min) {
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, min, 0, 0);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + ' ' + pad(hour) + ':' + pad(min);
  }

  var titlePool = [
    '서초구, 반포동에 AI 자전거 시범운영',
    '스마트 자전거 확대 검토, 다음 달 발표',
    '서초구 교통 정책 인터뷰 초안',
    '반포동 주민 반응은 엇갈려',
    '스마트시티 예산안 시의회 통과',
    '자전거 대여소 위치 선정 논란',
    '서초구청장 인터뷰 전문',
    '과거 오보 정정 관련 기사',
    '반포바이크 이용자 한 달 만에 3만명 돌파',
    '서초구청, 자전거도로 정비 예산 확대 편성',
    '스마트시티 시범지구 반포동 선정 배경은',
    '반포동 주민센터, 자전거 안전교육 프로그램 운영',
    '서초구 교통사고 감소, 자전거 인프라 효과 분석',
    '서울시, 자치구 스마트 모빌리티 사업 평가 착수',
    '반포한강공원 자전거길 연결 공사 내달 시작',
    '서초구의회, 스마트시티 조례 개정안 통과',
    '전기자전거 배터리 화재 예방 대책 마련',
    '반포동 상권, 자전거 이용객 증가로 매출 상승',
    '서울 자치구 중 서초구 스마트시티 지수 1위',
    '반포바이크 앱 이용후기, 만족도 조사 결과 공개',
    '서초구, 내년도 스마트시티 예산 전년比 20% 증액',
    '자전거 공유서비스 사고 책임 소재 논란',
    '반포동 재건축 단지, 자전거 주차공간 의무화',
    '서초구청장, 스마트 모빌리티 해외 사례 시찰',
    '반포바이크 정류소 위치 선정 기준 공개',
    '서울시내 공유자전거 이용률 지역별 비교',
    '반포동 학부모, 통학로 자전거도로 안전 요구',
    '서초구 스마트시티 사업, 국토부 우수사례 선정',
    '자전거 공유서비스 확대에 주민 의견 엇갈려',
    '반포동 소상공인, 스마트시티 인프라 활용법 문의 늘어',
    '서초구, 반포동 이어 방배동에도 자전거 사업 확대',
    '국회, 예산안 심사 본격 착수',
    '여야, 민생법안 처리 두고 신경전',
    '수출 증가세 3개월 연속 이어져',
    '증시, 외국인 매수세에 강세',
    '폭염 계속, 온열질환 주의보 확대',
    '프로야구, 순위 경쟁 막판까지 치열'
  ];

  var catPool = [
    { cat1: '지역뉴스', cat2: '지자체의회' },
    { cat1: '지역뉴스', cat2: '지역경제' },
    { cat1: '지역뉴스', cat2: '인물' },
    { cat1: '라이프', cat2: '우리동네 이야기' },
    { cat1: '아주뉴스', cat2: '' },
    { cat1: '포토/영상', cat2: '포토뉴스' }
  ];
  var statusPool = ['published', 'scheduled', 'draft', 'private'];

  var TOTAL_SAMPLE = 45;
  var articles = [];
  for (var gi = 0; gi < TOTAL_SAMPLE; gi++) {
    var cat = catPool[gi % catPool.length];
    var baseTitle = titlePool[gi % titlePool.length];
    var repeatSuffix = gi >= titlePool.length ? ' (' + (Math.floor(gi / titlePool.length) + 1) + ')' : '';
    var createdDaysAgo = gi; // 0~44일 전으로 분산 (기간 필터 시연용)
    var updatedDaysAgo = Math.max(0, createdDaysAgo - (gi % 3));
    articles.push({
      title: baseTitle + repeatSuffix,
      cat1: cat.cat1,
      cat2: cat.cat2,
      createdAt: fmt(createdDaysAgo, 9 + (gi % 10), (gi * 7) % 60),
      updatedAt: fmt(updatedDaysAgo, 10 + (gi % 8), (gi * 11) % 60),
      status: statusPool[gi % statusPool.length]
    });
  }

  var tbody = document.getElementById('articleTableBody');

  function parseDate(str) {
    var parts = str.split(' ');
    var dateParts = parts[0].split('.').map(Number);
    var timeParts = (parts[1] || '00:00').split(':').map(Number);
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
  }

  var periodSelect = document.getElementById('periodSelect');
  var statusFilterSelect = document.getElementById('statusFilterSelect');
  var customDateRange = document.getElementById('customDateRange');
  var startDateInput = document.getElementById('startDate');
  var endDateInput = document.getElementById('endDate');

  var PAGE_SIZE = 20;
  var currentPage = 1;

  periodSelect.addEventListener('change', function () {
    if (periodSelect.value === 'custom') {
      customDateRange.classList.add('show');
    } else {
      customDateRange.classList.remove('show');
      currentPage = 1;
      renderArticles();
    }
  });
  statusFilterSelect.addEventListener('change', function () {
    currentPage = 1;
    renderArticles();
  });
  document.getElementById('btnApplyCustomDate').addEventListener('click', function () {
    if (!startDateInput.value || !endDateInput.value) {
      showToast('시작일과 종료일을 모두 선택해주세요');
      return;
    }
    currentPage = 1;
    renderArticles();
  });

  function getFilteredArticles() {
    var period = periodSelect.value;
    var status = statusFilterSelect.value;
    var now = new Date();

    return articles.filter(function (a) {
      if (status !== 'all' && a.status !== status) return false;

      if (period === 'all') return true;

      var created = parseDate(a.createdAt);

      if (period === 'today') {
        return created.getFullYear() === now.getFullYear() &&
               created.getMonth() === now.getMonth() &&
               created.getDate() === now.getDate();
      }
      if (period === 'week') {
        var weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return created >= weekAgo && created <= now;
      }
      if (period === 'month') {
        var monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
        return created >= monthAgo && created <= now;
      }
      if (period === 'custom') {
        if (!startDateInput.value || !endDateInput.value) return true;
        var start = new Date(startDateInput.value + 'T00:00:00');
        var end = new Date(endDateInput.value + 'T23:59:59');
        return created >= start && created <= end;
      }
      return true;
    });
  }

  function isFiltering() {
    return periodSelect.value !== 'all' || statusFilterSelect.value !== 'all';
  }

  function renderArticles() {
    tbody.innerHTML = '';
    var filtered = getFilteredArticles();
    var reorderDisabled = isFiltering();

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="7">조건에 맞는 기사가 없습니다</td></tr>';
      document.getElementById('articlePagination').innerHTML = '';
      return;
    }

    var totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    var startIdx = (currentPage - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    pageItems.forEach(function (a, i) {
      var idx = startIdx + i;
      var realIdx = articles.indexOf(a);
      var tr = document.createElement('tr');
      var catText = a.cat2 ? a.cat1 + '<br>' + a.cat2 : a.cat1;
      tr.innerHTML =
        '<td class="col-no">' + (filtered.length - idx) + '</td>' +
        '<td class="col-title"><span class="title-cell" data-idx="' + realIdx + '">' + a.title + '</span></td>' +
        '<td class="col-cat">' + catText + '</td>' +
        '<td class="col-date">' + a.createdAt + '</td>' +
        '<td class="col-date">' + a.updatedAt + '</td>' +
        '<td class="col-status"><span class="badge ' + a.status + '">' + statusLabel[a.status] + '</span></td>' +
        '<td class="col-order">' +
          '<div class="order-btns">' +
            '<button class="btn-up" data-idx="' + realIdx + '" ' + (reorderDisabled || realIdx === 0 ? 'disabled' : '') + '>▲</button>' +
            '<button class="btn-down" data-idx="' + realIdx + '" ' + (reorderDisabled || realIdx === articles.length - 1 ? 'disabled' : '') + '>▼</button>' +
          '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.title-cell').forEach(function (el) {
      el.addEventListener('click', function () {
        window.location.href = '06_기사수정.html';
      });
    });

    tbody.querySelectorAll('.btn-up').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-idx'));
        if (idx === 0) return;
        var tmp = articles[idx - 1];
        articles[idx - 1] = articles[idx];
        articles[idx] = tmp;
        renderArticles();
      });
    });

    tbody.querySelectorAll('.btn-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-idx'));
        if (idx === articles.length - 1) return;
        var tmp = articles[idx + 1];
        articles[idx + 1] = articles[idx];
        articles[idx] = tmp;
        renderArticles();
      });
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    var pagination = document.getElementById('articlePagination');
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', function () { currentPage -= 1; renderArticles(); });
    pagination.appendChild(prevBtn);

    for (var p = 1; p <= totalPages; p++) {
      (function (p) {
        var pageBtn = document.createElement('button');
        pageBtn.textContent = String(p);
        if (p === currentPage) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', function () { currentPage = p; renderArticles(); });
        pagination.appendChild(pageBtn);
      })(p);
    }

    var nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', function () { currentPage += 1; renderArticles(); });
    pagination.appendChild(nextBtn);
  }

  renderArticles();
