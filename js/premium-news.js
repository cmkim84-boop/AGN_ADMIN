document.getElementById('btnOpenImportModal').addEventListener('click', function () {
    openImportModal();
  });

  function fmt(daysAgo, hour, min) {
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, min, 0, 0);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + ' ' + pad(hour) + ':' + pad(min);
  }

  var titlePool = [
    '중국 전기차 수출 증가, 국내 업계 긴장',
    '베이징 반도체 투자 확대 방침 발표',
    'AI 반도체 수요 폭증, 관련주 강세',
    '생성형 AI 도입 기업 1년 새 두 배',
    '국내 스타트업, AI 신약개발 기술 수출',
    '재테크 전문가가 꼽은 이달의 투자처',
    '금리 동결에도 대출 수요 꾸준',
    '부동산 시장 회복 조짐, 거래량 증가',
    '해외 투자자 국내 채권 매입 확대',
    '반도체 업황 반등, 수출 전망 밝아',
    '중국 전자상거래 플랫폼 국내 진출 가속',
    '베이징-서울 항공노선 증편 논의',
    'AI 스타트업 투자 유치 잇따라',
    '생성형 AI 저작권 분쟁, 법원 판단은',
    '재테크 카페 회원 급증, 투자 열기 반영',
    '중국 부동산 경기 침체, 국내 영향은',
    '전기차 배터리 기술 특허 경쟁 치열',
    '가상자산 시장 변동성 확대',
    'AI 윤리 가이드라인 제정 논의 본격화',
    '해외 명품 소비 트렌드 변화',
    '중국 관광객 국내 유입 다시 증가',
    '반도체 장비 국산화율 상승세',
    '재테크 유튜버 투자자문 논란',
    '베이징 올림픽 유산 활용 사업 추진',
    'AI 챗봇 상담 서비스 도입 확산',
    '중국발 공급망 리스크 재점화',
    '금융권 디지털 전환 가속화',
    '해외 부동산 투자 세제 개편 논의',
    '전기차 충전 인프라 확충 계획',
    '중국 소비 시장 회복세 뚜렷'
  ];
  var sourceTypePool = ['아주경제', '아주경제2', '영상', '포토'];

  var TOTAL_SAMPLE = 45;
  var articles = [];
  for (var gi = 0; gi < TOTAL_SAMPLE; gi++) {
    var baseTitle = titlePool[gi % titlePool.length];
    var repeatSuffix = gi >= titlePool.length ? ' (' + (Math.floor(gi / titlePool.length) + 1) + ')' : '';
    var createdDaysAgo = gi; // 0~44일 전으로 분산 (기간 필터 시연용)
    var updatedDaysAgo = Math.max(0, createdDaysAgo - (gi % 3));
    articles.push({
      title: baseTitle + repeatSuffix,
      sourceType: sourceTypePool[gi % sourceTypePool.length],
      createdAt: fmt(createdDaysAgo, 9 + (gi % 10), (gi * 7) % 60),
      updatedAt: fmt(updatedDaysAgo, 10 + (gi % 8), (gi * 11) % 60)
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
    var now = new Date();

    return articles.filter(function (a) {
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
    return periodSelect.value !== 'all';
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
      tr.innerHTML =
        '<td class="col-no">' + (filtered.length - idx) + '</td>' +
        '<td class="col-title"><span class="title-cell" data-idx="' + realIdx + '">' + a.title + '</span></td>' +
        '<td class="col-source"><span class="badge-source">' + a.sourceType + '</span></td>' +
        '<td class="col-date">' + a.createdAt + '</td>' +
        '<td class="col-date">' + a.updatedAt + '</td>' +
        '<td class="col-del"><button class="btn-delete-article" data-idx="' + realIdx + '">×</button></td>' +
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
        var idx = Number(el.getAttribute('data-idx'));
        openViewArticleModal(articles[idx]);
      });
    });

    tbody.querySelectorAll('.btn-delete-article').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-idx'));
        var title = articles[idx].title;
        articles.splice(idx, 1);
        renderArticles();
        showToast('"' + title + '" 기사가 삭제되었습니다');
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

  // ── 기사 보기 레이어팝업 ──
  var viewArticleModalOverlay = document.getElementById('viewArticleModalOverlay');
  document.getElementById('btnCloseViewArticleModal').addEventListener('click', function () {
    viewArticleModalOverlay.classList.remove('show');
  });
  viewArticleModalOverlay.addEventListener('click', function (e) {
    if (e.target === viewArticleModalOverlay) viewArticleModalOverlay.classList.remove('show');
  });

  function openViewArticleModal(article) {
    document.getElementById('viewArticleTitle').textContent = article.title;
    document.getElementById('viewArticleMeta').textContent = '등록일시 ' + article.createdAt + '  ·  수정일시 ' + article.updatedAt;
    document.getElementById('viewArticleBody').textContent =
      article.title + '에 대한 내용입니다.\n\n' +
      '이 기사는 프리미엄뉴스에서 불러온 콘텐츠입니다. 상세 본문은 원본 기사 페이지에서 확인하실 수 있습니다.';
    viewArticleModalOverlay.classList.add('show');
  }

  // ── 기사 불러오기 모달 (아주경제/영상/포토 + 관련기사 팝업과 동일한 검색 UI) ──
  var ajuTitles = [
    '서초구, 반포동 스마트 자전거 200대 추가 도입',
    '반포바이크 이용자 한 달 만에 3만명 돌파',
    '서초구청, 자전거도로 정비 예산 확대 편성',
    '스마트시티 시범지구 반포동 선정 배경은',
    '서초구 교통사고 감소, 자전거 인프라 효과 분석',
    '서울시, 자치구 스마트 모빌리티 사업 평가 착수',
    '서초구의회, 스마트시티 조례 개정안 통과',
    '전기자전거 배터리 화재 예방 대책 마련',
    '서울 자치구 중 서초구 스마트시티 지수 1위',
    '서초구, 내년도 스마트시티 예산 전년比 20% 증액',
    '자전거 공유서비스 사고 책임 소재 논란',
    '서초구청장, 스마트 모빌리티 해외 사례 시찰',
    '서울시내 공유자전거 이용률 지역별 비교',
    '서초구 스마트시티 사업, 국토부 우수사례 선정',
    '서초구, 반포동 이어 방배동에도 자전거 사업 확대',
    '국회, 예산안 심사 본격 착수',
    '수출 증가세 3개월 연속 이어져',
    '증시, 외국인 매수세에 강세'
  ];
  var videoTitles = [
    '반포바이크 현장 스케치 영상',
    '스마트시티 예산안 통과 순간 영상',
    '반포동 주민 인터뷰 모음 영상',
    '폭염 속 온열질환 예방법 영상',
    '프로야구 순위 경쟁 하이라이트 영상',
    '국회 예산안 심사 현장 영상',
    '반포한강공원 자전거길 개통 현장 영상',
    '서초구청장 인터뷰 영상',
    '전기자전거 배터리 안전 점검 영상',
    '반포바이크 앱 사용법 가이드 영상',
    '자전거도로 정비 공사 드론 촬영 영상',
    '서초구 스마트시티 해외 시찰 영상'
  ];
  var photoTitles = [
    '반포바이크 출범식 현장 포토',
    '반포한강공원 자전거길 포토',
    '서초구청 스마트시티 브리핑 포토',
    '반포동 상권 활성화 현장 포토',
    '자전거 안전교육 현장 포토',
    '서초구의회 조례 개정 현장 포토',
    '반포바이크 정류소 전경 포토',
    '스마트시티 조성 현장 포토',
    '반포동 재건축 현장 포토',
    '서초구 교통정책 설명회 포토'
  ];
  var importKeywordPool = ['반포바이크', '스마트시티', '자전거', '서초구', '교통', '환경', '지자체'];

  function fmtImportDate(daysAgo) {
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var sourcePools = { aju: ajuTitles, video: videoTitles, photo: photoTitles };
  var sourceCandidates = {};
  Object.keys(sourcePools).forEach(function (key) {
    sourceCandidates[key] = sourcePools[key].map(function (title, i) {
      return {
        title: title,
        date: fmtImportDate(i * 3),
        keywords: [importKeywordPool[i % importKeywordPool.length], importKeywordPool[(i + 2) % importKeywordPool.length]]
      };
    });
  });

  var currentImportSource = 'aju';
  var importFiltered = sourceCandidates.aju.slice();
  var IMPORT_PAGE_SIZE = 10;
  var importCurrentPage = 1;
  var importSelected = []; // 선택된 제목 배열 (개수 제한 없음)

  var importModalOverlay = document.getElementById('importModalOverlay');
  var importResultsList = document.getElementById('importResultsList');
  var importPagination = document.getElementById('importPagination');
  var importSelectedCount = document.getElementById('importSelectedCount');

  function openImportModal() {
    document.querySelectorAll('#importSourceTabs .source-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelector('#importSourceTabs .source-tab[data-source="aju"]').classList.add('active');
    currentImportSource = 'aju';
    document.getElementById('importStartDate').value = '';
    document.getElementById('importEndDate').value = '';
    document.getElementById('importSearchType').value = 'all';
    document.getElementById('importSearchInput').value = '';
    importSelected = [];
    importFiltered = sourceCandidates[currentImportSource].slice();
    importCurrentPage = 1;
    renderImportResults();
    importModalOverlay.classList.add('show');
  }

  document.getElementById('btnCloseImportModal').addEventListener('click', function () {
    importModalOverlay.classList.remove('show');
  });
  importModalOverlay.addEventListener('click', function (e) {
    if (e.target === importModalOverlay) importModalOverlay.classList.remove('show');
  });

  document.querySelectorAll('#importSourceTabs .source-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#importSourceTabs .source-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentImportSource = tab.getAttribute('data-source');
      importFiltered = sourceCandidates[currentImportSource].slice();
      importCurrentPage = 1;
      renderImportResults();
    });
  });

  document.getElementById('btnImportSearch').addEventListener('click', function () {
    var startVal = document.getElementById('importStartDate').value;
    var endVal = document.getElementById('importEndDate').value;
    var searchType = document.getElementById('importSearchType').value;
    var query = document.getElementById('importSearchInput').value.trim();
    var pool = sourceCandidates[currentImportSource];

    importFiltered = pool.filter(function (c) {
      if (startVal && c.date < startVal) return false;
      if (endVal && c.date > endVal) return false;
      if (query === '') return true;
      if (searchType === 'title') return c.title.indexOf(query) !== -1;
      if (searchType === 'keyword') return c.keywords.some(function (k) { return k.indexOf(query) !== -1; });
      return c.title.indexOf(query) !== -1 || c.keywords.some(function (k) { return k.indexOf(query) !== -1; });
    });

    importCurrentPage = 1;
    renderImportResults();

    if (importFiltered.length === 0) {
      showToast('검색 결과가 없습니다');
    }
  });

  function renderImportResults() {
    var totalPages = Math.ceil(importFiltered.length / IMPORT_PAGE_SIZE);
    var startIdx = (importCurrentPage - 1) * IMPORT_PAGE_SIZE;
    var pageItems = importFiltered.slice(startIdx, startIdx + IMPORT_PAGE_SIZE);

    importResultsList.innerHTML = '';
    if (pageItems.length === 0) {
      importResultsList.innerHTML = '<div class="import-empty">조건에 맞는 기사가 없습니다</div>';
    }
    pageItems.forEach(function (c) {
      var item = document.createElement('div');
      item.className = 'import-result-item';
      if (importSelected.indexOf(c.title) !== -1) item.classList.add('selected');
      item.innerHTML =
        '<div class="r-body">' +
          '<span class="r-title">' + c.title + '</span>' +
          '<span class="r-meta">' + c.date + '</span>' +
        '</div>' +
        '<button class="btn-view-original" type="button">원본기사보기</button>';
      item.addEventListener('click', function () {
        var pos = importSelected.indexOf(c.title);
        if (pos !== -1) {
          importSelected.splice(pos, 1);
        } else {
          importSelected.push(c.title);
        }
        renderImportResults();
      });
      item.querySelector('.btn-view-original').addEventListener('click', function (e) {
        e.stopPropagation();
        showToast('"' + c.title + '" 원본 기사 페이지로 이동합니다');
      });
      importResultsList.appendChild(item);
    });

    importSelectedCount.textContent = importSelected.length + '개 선택됨';
    renderImportPagination(totalPages);
  }

  function renderImportPagination(totalPages) {
    importPagination.innerHTML = '';
    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = importCurrentPage === 1;
    prevBtn.addEventListener('click', function () { importCurrentPage -= 1; renderImportResults(); });
    importPagination.appendChild(prevBtn);

    for (var p = 1; p <= totalPages; p++) {
      (function (p) {
        var pageBtn = document.createElement('button');
        pageBtn.textContent = String(p);
        if (p === importCurrentPage) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', function () { importCurrentPage = p; renderImportResults(); });
        importPagination.appendChild(pageBtn);
      })(p);
    }

    var nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = importCurrentPage === totalPages;
    nextBtn.addEventListener('click', function () { importCurrentPage += 1; renderImportResults(); });
    importPagination.appendChild(nextBtn);
  }

  document.getElementById('btnImportAdd').addEventListener('click', function () {
    if (importSelected.length === 0) {
      showToast('가져올 기사를 선택해주세요');
      return;
    }
    var now = new Date();
    var nowStr = fmt(0, now.getHours(), now.getMinutes());
    importSelected.forEach(function (title) {
      articles.unshift({ title: title, createdAt: nowStr, updatedAt: nowStr });
    });
    importModalOverlay.classList.remove('show');
    currentPage = 1;
    renderArticles();
    showToast(importSelected.length + '개의 기사를 가져왔습니다');
  });
