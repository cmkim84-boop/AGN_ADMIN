var MAX_SHORTS = 10;
  var MIN_SHORTS = 5;
  var shortsList = [
    { title: '서초구 반포바이크 현장 스케치', source: 'aju', exposed: true },
    { title: '스마트시티 예산안 통과 순간', source: 'aju', exposed: true },
    { title: '반포동 주민 인터뷰 모음', source: 'keyword', exposed: true },
    { title: '폭염 속 온열질환 예방법', source: 'keyword', exposed: true },
    { title: '프로야구 순위 경쟁 하이라이트', source: 'aju', exposed: false }
  ];

  var shortsListEl = document.getElementById('shortsListEl');
  var countBadge = document.getElementById('countBadge');
  var warningBanner = document.getElementById('warningBanner');
  var btnAddShorts = document.getElementById('btnAddShorts');
  btnAddShorts.addEventListener('click', openAddModal);

  function renderShorts() {
    shortsListEl.innerHTML = '';

    if (shortsList.length === 0) {
      shortsListEl.innerHTML = '<div class="shorts-empty">등록된 쇼츠가 없습니다. "+ 쇼츠 추가"로 등록해주세요.</div>';
    } else {
      shortsList.forEach(function (s, idx) {
        var row = document.createElement('div');
        row.className = 'shorts-row';
        row.innerHTML =
          '<span class="row-order">' + (idx + 1) + '</span>' +
          '<span class="row-title">' + s.title + '</span>' +
          '<span class="row-right">' +
            '<span class="source-badge ' + s.source + '">' + (s.source === 'aju' ? 'ABC' : s.source === 'direct' ? '직접입력' : '키워드 자동') + '</span>' +
            '<button class="btn-preview" data-idx="' + idx + '">미리보기</button>' +
            '<label class="switch"><input type="checkbox" class="expose-toggle" data-idx="' + idx + '" ' + (s.exposed ? 'checked' : '') + '><span class="switch-track"></span></label>' +
            '<button class="shorts-remove" data-idx="' + idx + '">×</button>' +
          '</span>';
        shortsListEl.appendChild(row);
      });
    }

    btnAddShorts.disabled = shortsList.length >= MAX_SHORTS;

    // 미리보기 버튼
    shortsListEl.querySelectorAll('.btn-preview').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-idx'));
        openPreviewModal(shortsList[idx]);
      });
    });

    // 삭제 버튼
    shortsListEl.querySelectorAll('.shorts-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-idx'));
        var title = shortsList[idx].title;
        shortsList.splice(idx, 1);
        renderShorts();
        showToast('"' + title + '" 쇼츠가 삭제되었습니다');
      });
    });

    // 노출 토글
    shortsListEl.querySelectorAll('.expose-toggle').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = Number(chk.getAttribute('data-idx'));
        shortsList[idx].exposed = chk.checked;
        showToast(chk.checked ? '메인페이지에 노출됩니다' : '메인페이지 노출 해제');
      });
    });

    updateCountBadge();
  }

  function updateCountBadge() {
    var count = shortsList.length;
    countBadge.textContent = count + ' / ' + MAX_SHORTS;
    countBadge.className = 'count-badge';
    if (count >= MIN_SHORTS) {
      countBadge.classList.add('ok');
      warningBanner.classList.remove('show');
    } else {
      countBadge.classList.add('warn');
      warningBanner.textContent = '메인페이지 노출을 위해 최소 ' + MIN_SHORTS + '개가 필요합니다. 현재 ' + (MIN_SHORTS - count) + '개 부족합니다.';
      warningBanner.classList.add('show');
    }
  }

  renderShorts();

  // ── 쇼츠 미리보기 모달 ──
  var previewModalOverlay = document.getElementById('previewModalOverlay');
  document.getElementById('btnClosePreviewModal').addEventListener('click', function () {
    previewModalOverlay.classList.remove('show');
  });
  previewModalOverlay.addEventListener('click', function (e) {
    if (e.target === previewModalOverlay) previewModalOverlay.classList.remove('show');
  });

  function openPreviewModal(shorts) {
    var thumb = document.getElementById('previewThumb');
    var titleEl = document.getElementById('previewTitle');
    var seed = encodeURIComponent(shorts.title).slice(0, 20);
    thumb.style.backgroundImage = 'url(https://picsum.photos/seed/' + seed + '/300/500)';
    thumb.innerHTML = '<span class="play-icon">▶</span>';
    titleEl.textContent = shorts.title;
    previewModalOverlay.classList.add('show');
  }

  // ── 쇼츠 추가 모달 ──
  var addModalOverlay = document.getElementById('addModalOverlay');

  function openAddModal() {
    if (shortsList.length >= MAX_SHORTS) {
      showToast('최대 ' + MAX_SHORTS + '개까지만 등록할 수 있습니다');
      return;
    }
    document.getElementById('keywordInput').value = '';
    document.getElementById('keywordLoading').classList.remove('show');
    document.getElementById('keywordResultsHead').classList.remove('show');
    document.getElementById('keywordResultsGrid').classList.remove('show');
    document.getElementById('keywordResultsGrid').innerHTML = '';
    document.getElementById('directUrlInput').value = '';
    keywordSelectedIdx = {};
    switchTab('aju');
    ajuCurrentPage = 1;
    renderAjuResults();
    addModalOverlay.classList.add('show');
  }

  document.getElementById('btnCloseAddModal').addEventListener('click', function () {
    addModalOverlay.classList.remove('show');
  });
  addModalOverlay.addEventListener('click', function (e) {
    if (e.target === addModalOverlay) addModalOverlay.classList.remove('show');
  });

  function switchTab(tab) {
    document.getElementById('tabAju').classList.toggle('active', tab === 'aju');
    document.getElementById('tabKeyword').classList.toggle('active', tab === 'keyword');
    document.getElementById('tabDirect').classList.toggle('active', tab === 'direct');
    document.getElementById('paneAju').classList.toggle('active', tab === 'aju');
    document.getElementById('paneKeyword').classList.toggle('active', tab === 'keyword');
    document.getElementById('paneDirect').classList.toggle('active', tab === 'direct');
  }
  document.getElementById('tabAju').addEventListener('click', function () { switchTab('aju'); });
  document.getElementById('tabKeyword').addEventListener('click', function () { switchTab('keyword'); });
  document.getElementById('tabDirect').addEventListener('click', function () { switchTab('direct'); });

  // ABC 탭 - 최신순 쇼츠 목록 (데모 샘플, 10건씩 페이징)
  var ajuLatestShorts = [
    '반포바이크 현장 스케치, 출근길 직접 타보니',
    '스마트시티 예산안 통과 순간 영상',
    '반포동 주민들이 말하는 자전거 서비스',
    '폭염 속 온열질환 예방법 30초 요약',
    '프로야구 순위 경쟁 하이라이트 모음',
    '국회 예산안 심사 현장 브리핑',
    '수출 3개월 연속 증가, 현장 반응은',
    '증시 외국인 매수세, 전문가 코멘트',
    '반포한강공원 자전거길 개통 현장',
    '서초구청장 인터뷰, 스마트시티 비전',
    '전기자전거 배터리 안전 점검 영상',
    '반포동 상권 매출 변화 인터뷰',
    '자전거도로 정비 공사 드론 촬영',
    '서울시 자치구 스마트 모빌리티 순위',
    '반포바이크 앱 사용법 30초 가이드',
    '국제 정상회담 현장 하이라이트',
    '해외 특파원이 전하는 베이징 소식',
    '공연 현장 하이라이트, 관객 반응',
    '연예계 이슈 브리핑 영상',
    'AI 스타트업 창업자 인터뷰',
    '재테크 전문가가 말하는 이달의 투자 팁',
    '지역 축제 현장 스케치 영상',
    '학교 급식 현장 점검 리포트',
    '민생 인터뷰, 물가 체감도는',
    '스마트팩토리 견학 현장 영상',
    '반포동 재건축 현장 드론 촬영',
    '서초구 교통사고 감소 통계 브리핑',
    '통학로 자전거도로 안전 점검',
    '서초구 스마트시티 해외 시찰 영상',
    '공유자전거 이용률 지역별 비교',
    '반포바이크 정류소 위치 공개 현장',
    '방배동 자전거 사업 확대 브리핑',
    '서초구의회 조례 개정 현장',
    '반포동 학부모 인터뷰, 통학로 안전'
  ];
  var AJU_PAGE_SIZE = 10;
  var ajuCurrentPage = 1;

  function renderAjuResults() {
    var resultsList = document.getElementById('shortsResultsList');
    var pagination = document.getElementById('shortsResultsPagination');
    var totalPages = Math.ceil(ajuLatestShorts.length / AJU_PAGE_SIZE);
    var startIdx = (ajuCurrentPage - 1) * AJU_PAGE_SIZE;
    var pageItems = ajuLatestShorts.slice(startIdx, startIdx + AJU_PAGE_SIZE);

    resultsList.innerHTML = '';
    pageItems.forEach(function (title) {
      var item = document.createElement('div');
      item.className = 'import-result-item';
      item.innerHTML = '<span>' + title + '</span><span style="color:var(--text-muted); font-size:11px;">추가 ›</span>';
      item.addEventListener('click', function () {
        addShorts(title, 'aju');
      });
      resultsList.appendChild(item);
    });

    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = ajuCurrentPage === 1;
    prevBtn.addEventListener('click', function () { ajuCurrentPage -= 1; renderAjuResults(); });
    pagination.appendChild(prevBtn);

    for (var p = 1; p <= totalPages; p++) {
      (function (p) {
        var pageBtn = document.createElement('button');
        pageBtn.textContent = String(p);
        if (p === ajuCurrentPage) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', function () { ajuCurrentPage = p; renderAjuResults(); });
        pagination.appendChild(pageBtn);
      })(p);
    }

    var nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = ajuCurrentPage === totalPages;
    nextBtn.addEventListener('click', function () { ajuCurrentPage += 1; renderAjuResults(); });
    pagination.appendChild(nextBtn);
  }

  // 키워드 탭 - 자동 생성 데모 (10~20개 후보 생성 후 다중 선택)
  var keywordSelectedIdx = {};

  document.getElementById('btnKeywordGenerate').addEventListener('click', function () {
    var keyword = document.getElementById('keywordInput').value.trim();
    if (keyword === '') {
      showToast('키워드를 입력해주세요');
      return;
    }
    keywordSelectedIdx = {};

    var loading = document.getElementById('keywordLoading');
    var head = document.getElementById('keywordResultsHead');
    var grid = document.getElementById('keywordResultsGrid');
    head.classList.remove('show');
    grid.classList.remove('show');
    grid.innerHTML = '';
    loading.classList.add('show');

    setTimeout(function () {
      loading.classList.remove('show');

      var count = 10 + Math.floor(Math.random() * 11); // 10~20개
      var titleTemplates = [
        '{k} 현장 스케치, 직접 가보니',
        '{k} 이렇게 달라졌다',
        '{k} 하이라이트 모음.zip',
        '{k} 궁금증 30초 정리',
        '{k} 반응 총정리',
        '{k} 여기까지 알아야 함',
        '{k}, 이게 실화라고?',
        '{k} 현장 브리핑 영상',
        '{k} 몰랐던 사실 3가지',
        '{k} 지금 이 정도라니',
        '{k} 요약, 1분이면 충분',
        '{k} 비하인드 스토리',
        '{k} 오늘의 한 장면',
        '{k} 인터뷰 풀버전 하이라이트',
        '{k} 이거 안 보면 손해',
        '{k} 현장 직캠 모음',
        '{k} 전후 비교 영상',
        '{k} 담당자가 말하는 진짜 이유',
        '{k} 시민 반응 인터뷰',
        '{k} 오늘 이슈 총정리'
      ];
      var candidates = [];
      var usedTemplates = titleTemplates.slice();
      for (var i = 0; i < count; i++) {
        if (usedTemplates.length === 0) usedTemplates = titleTemplates.slice();
        var pickIdx = Math.floor(Math.random() * usedTemplates.length);
        var template = usedTemplates.splice(pickIdx, 1)[0];
        candidates.push(template.replace('{k}', keyword));
      }

      grid.innerHTML = '';
      candidates.forEach(function (title, idx) {
        var card = document.createElement('div');
        card.className = 'keyword-candidate';
        card.setAttribute('data-idx', idx);
        card.innerHTML = '<span>' + title + '</span><span class="kc-check">✓</span>';
        card.addEventListener('click', function () {
          if (keywordSelectedIdx[idx]) {
            delete keywordSelectedIdx[idx];
            card.classList.remove('selected');
          } else {
            keywordSelectedIdx[idx] = title;
            card.classList.add('selected');
          }
          updateKeywordSelectionCount();
        });
        grid.appendChild(card);
      });

      document.getElementById('keywordResultsCount').textContent = count + '개 후보 생성됨';
      head.classList.add('show');
      grid.classList.add('show');
      updateKeywordSelectionCount();
    }, 900);
  });

  function updateKeywordSelectionCount() {
    var n = Object.keys(keywordSelectedIdx).length;
    var btn = document.getElementById('btnAddSelectedKeyword');
    btn.textContent = '선택한 쇼츠 추가 (' + n + ')';
    btn.disabled = n === 0;
  }

  document.getElementById('btnAddSelectedKeyword').addEventListener('click', function () {
    var titles = Object.keys(keywordSelectedIdx).map(function (k) { return keywordSelectedIdx[k]; });
    if (titles.length === 0) {
      showToast('먼저 후보를 선택해주세요');
      return;
    }
    var remaining = MAX_SHORTS - shortsList.length;
    if (titles.length > remaining) {
      showToast('최대 ' + MAX_SHORTS + '개까지만 등록할 수 있어 ' + remaining + '개만 추가됩니다');
      titles = titles.slice(0, remaining);
    }
    titles.forEach(function (title) {
      shortsList.push({ title: title, source: 'keyword', exposed: true });
    });
    renderShorts();
    addModalOverlay.classList.remove('show');
    showToast(titles.length + '개의 쇼츠가 추가되었습니다');
  });

  function addShorts(title, source) {
    if (shortsList.length >= MAX_SHORTS) {
      showToast('최대 ' + MAX_SHORTS + '개까지만 등록할 수 있습니다');
      return;
    }
    shortsList.push({ title: title, source: source, exposed: true });
    renderShorts();
    addModalOverlay.classList.remove('show');
    showToast('"' + title + '" 쇼츠가 추가되었습니다');
  }

  // 직접입력 탭 - 쇼츠 주소 직접 추가
  document.getElementById('btnDirectAdd').addEventListener('click', function () {
    var url = document.getElementById('directUrlInput').value.trim();
    if (url === '') {
      showToast('쇼츠 주소를 입력해주세요');
      return;
    }
    if (url.indexOf('http') !== 0) {
      showToast('올바른 URL 형식으로 입력해주세요 (http:// 또는 https://)');
      return;
    }
    addShorts(url, 'direct');
  });

  document.getElementById('btnCancel').addEventListener('click', function () {
    showToast('변경사항이 취소되었습니다');
  });
  document.getElementById('btnRegister').addEventListener('click', function () {
    if (shortsList.length < MIN_SHORTS) {
      showToast('최소 ' + MIN_SHORTS + '개 이상 등록해야 게시할 수 있습니다');
      return;
    }
    showToast('쇼츠 설정이 등록되었습니다');
  });
