// 발행 상태에 따라 예약일시 필드 표시
  var statusSelect = document.getElementById('statusSelect');
  var scheduleField = document.getElementById('scheduleField');
  statusSelect.addEventListener('change', function () {
    if (statusSelect.value === 'scheduled') {
      scheduleField.classList.add('show');
    } else {
      scheduleField.classList.remove('show');
    }
  });

  // 상단 버튼 동작
  document.getElementById('btnDraftSave').addEventListener('click', function () {
    showToast('임시저장 되었습니다');
  });
  document.getElementById('btnPreview').addEventListener('click', function () {
    showToast('미리보기를 새 창으로 엽니다 (데모)');
  });
  document.getElementById('btnPublish').addEventListener('click', function () {
    var status = statusSelect.value;
    if (status === 'scheduled') {
      var when = document.getElementById('scheduleInput').value;
      showToast(when ? ('예약발행 등록: ' + when) : '예약일시를 선택하세요');
    } else if (status === 'private') {
      showToast('비공개로 저장되었습니다');
    } else {
      showToast('발행되었습니다');
    }
  });

  // 부제목 (최대 5개)
  var subtitleList = document.getElementById('subtitleList');
  var subtitleCount = document.getElementById('subtitleCount');
  var btnAddSubtitle = document.getElementById('btnAddSubtitle');
  var MAX_SUBTITLES = 5;

  function updateSubtitleCount() {
    var count = subtitleList.querySelectorAll('.subtitle-row').length;
    subtitleCount.textContent = count + ' / ' + MAX_SUBTITLES;
    btnAddSubtitle.disabled = count >= MAX_SUBTITLES;
    btnAddSubtitle.style.opacity = count >= MAX_SUBTITLES ? '0.4' : '1';
    btnAddSubtitle.style.cursor = count >= MAX_SUBTITLES ? 'not-allowed' : 'pointer';
  }

  function addSubtitleRow() {
    var count = subtitleList.querySelectorAll('.subtitle-row').length;
    if (count >= MAX_SUBTITLES) {
      showToast('부제목은 최대 5개까지 추가할 수 있습니다');
      return;
    }
    var row = document.createElement('div');
    row.className = 'subtitle-row';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '부제목 ' + (count + 1);

    var removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function () {
      row.remove();
      updateSubtitleCount();
    });

    row.appendChild(input);
    row.appendChild(removeBtn);
    subtitleList.appendChild(row);
    updateSubtitleCount();
    input.focus();
  }

  btnAddSubtitle.addEventListener('click', addSubtitleRow);
  updateSubtitleCount();

  // 뉴스 형태 배지 미리보기
  var newsTypeSelect = document.getElementById('newsTypeSelect');
  var typeBadgePreview = document.getElementById('typeBadgePreview');
  var typeLabels = { general: '일반', photo: '포토', video: '동영상뉴스' };
  function renderTypeBadge() {
    typeBadgePreview.innerHTML = '<span class="badge on">' + typeLabels[newsTypeSelect.value] + '</span>';
  }
  newsTypeSelect.addEventListener('change', renderTypeBadge);
  renderTypeBadge();

  // 관련기사 토글 - 노출 여부 + 기사선택 영역 표시/숨김
  var relatedPickerArea = document.getElementById('relatedPickerArea');
  function updateRelatedPickerVisibility() {
    relatedPickerArea.style.display = document.getElementById('toggleRelated').checked ? 'block' : 'none';
  }
  document.getElementById('toggleRelated').addEventListener('change', function (e) {
    showToast(e.target.checked ? '본문 하단에 관련기사가 노출됩니다' : '관련기사 노출 해제');
    updateRelatedPickerVisibility();
  });
  updateRelatedPickerVisibility();

  document.getElementById('btnPickRelated').addEventListener('click', function () {
    openRelatedModal();
  });

  // 기자 추가/삭제 (공동 작업 - 여러 명 등록 가능)
  var journalistBox = document.getElementById('journalistBox');
  var journalistSelect = document.getElementById('journalistSelect');
  document.getElementById('btnAddJournalist').addEventListener('click', function () {
    var name = journalistSelect.value;
    if (!name) {
      showToast('기자를 선택해주세요');
      return;
    }
    var existing = Array.prototype.map.call(journalistBox.querySelectorAll('.tag span:first-child'), function (el) {
      return el.textContent;
    });
    if (existing.indexOf(name) !== -1) {
      showToast('이미 추가된 기자입니다');
      return;
    }
    var tag = document.createElement('span');
    tag.className = 'tag';
    var label = document.createElement('span');
    label.textContent = name;
    var removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function () { tag.remove(); });
    tag.appendChild(label);
    tag.appendChild(removeBtn);
    journalistBox.appendChild(tag);
    journalistSelect.value = '';
  });

  // 1차 / 2차 카테고리 연동
  var category1Select = document.getElementById('category1Select');
  var category2Select = document.getElementById('category2Select');
  var subCategoryMap = {
    local: ['부산시소식', '지역경제', '지자체의회', '인물'],
    life: ['우리동네 발견', '우리동네 이야기', '우리동네 문화/행사']
  };
  category1Select.addEventListener('change', function () {
    var subCats = subCategoryMap[category1Select.value];
    if (!category1Select.value) {
      category2Select.innerHTML = '<option value="">2차 카테고리 선택</option>';
      category2Select.disabled = true;
    } else if (subCats && subCats.length > 0) {
      category2Select.innerHTML = '<option value="">2차 카테고리 선택</option>';
      subCats.forEach(function (name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        category2Select.appendChild(opt);
      });
      category2Select.disabled = false;
    } else {
      category2Select.innerHTML = '<option value="">2차 카테고리 없음</option>';
      category2Select.disabled = true;
    }
  });

  // 태그 추가 (공통 함수)
  var tagInput = document.getElementById('tagInput');
  var tagBox = document.getElementById('tagBox');

  function addTag(text) {
    var trimmed = text.trim();
    if (trimmed === '') return;
    var existing = Array.prototype.map.call(tagBox.querySelectorAll('.tag span:first-child'), function (el) {
      return el.textContent;
    });
    if (existing.indexOf('#' + trimmed) !== -1) return;

    var tag = document.createElement('span');
    tag.className = 'tag';
    var label = document.createElement('span');
    label.textContent = '#' + trimmed;
    var removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function () { tag.remove(); });
    tag.appendChild(label);
    tag.appendChild(removeBtn);
    tagBox.appendChild(tag);
  }

  tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && tagInput.value.trim() !== '') {
      e.preventDefault();
      addTag(tagInput.value);
      tagInput.value = '';
    }
  });

  // AI 키워드 버튼 - 본문을 분석해 태그를 자동으로 채움 (데모용 간이 분석)
  var stopWords = ['그리고', '있다', '한다', '하는', '것으로', '위해', '지난', '이번', '통해', '따르면', '대한', '으로', '에서', '까지', '부터', '에게', '보다', '이라고', '했다', '밝혔다'];

  function extractKeywords(text) {
    if (!text || text.trim() === '') return [];
    var cleaned = text.replace(/\[[^\]]*\]/g, ' ');
    var words = cleaned.split(/[\s,\.\n\'"\(\)·"“”]+/).filter(function (w) {
      return w.length >= 2 && stopWords.indexOf(w) === -1;
    });
    var freq = {};
    words.forEach(function (w) {
      freq[w] = (freq[w] || 0) + 1;
    });
    return Object.keys(freq)
      .sort(function (a, b) { return freq[b] - freq[a]; })
      .slice(0, 5);
  }

  document.getElementById('btnAiKeyword').addEventListener('click', function () {
    var source = (titleInput.value + ' ' + bodyEditor.value).trim();
    if (source === '') {
      showToast('먼저 제목이나 본문을 입력해주세요');
      return;
    }
    var keywords = extractKeywords(source);
    if (keywords.length === 0) {
      showToast('추출할 키워드를 찾지 못했습니다');
      return;
    }
    keywords.forEach(function (k) { addTag(k); });
    showToast('기사 분석 완료: 키워드 ' + keywords.length + '개가 추가되었습니다');
  });

  // 대표 이미지 업로드 (데모용 - 실제 저장 없음)
  var imgDrop = document.getElementById('imgDrop');
  var imgFile = document.getElementById('imgFile');
  imgDrop.addEventListener('click', function () { imgFile.click(); });
  imgFile.addEventListener('change', function () {
    if (imgFile.files && imgFile.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        imgDrop.innerHTML = '';
        var img = document.createElement('img');
        img.src = e.target.result;
        imgDrop.appendChild(img);
      };
      reader.readAsDataURL(imgFile.files[0]);
    }
  });

  // AI 버튼 데모 동작 (실제 API 호출 없이 결과 예시만 표시)
  var aiResultBox = document.getElementById('aiResultBox');
  var bodyEditor = document.getElementById('bodyEditor');
  var titleInput = document.getElementById('titleInput');

  function showAiResult(html) {
    aiResultBox.innerHTML = html;
    aiResultBox.classList.add('show');
  }

  document.getElementById('aiDraft').addEventListener('click', function () {
    bodyEditor.value =
      '서초구청이 오는 5일부터 반포동 일대에서 인공지능 기반 스마트 자전거 대여 서비스 \'반포바이크\' 시범 운영에 들어간다고 2일 밝혔다.\n' +
      '\n' +
      '[이미지: 반포동 한강공원 인근에 설치된 반포바이크 대여소 전경]\n' +
      '\n' +
      '이번 시범 운영은 총 200대 규모로 진행되며, 이용자는 전용 애플리케이션을 통해 QR코드를 스캔해 자전거를 대여할 수 있다. 대여소는 반포동 일대 20곳에 설치되며, 이용 요금은 30분당 1000원으로 책정됐다.\n' +
      '\n' +
      '서초구청 관계자는 "이번 서비스가 탄소중립 실현과 교통 혼잡 완화에 기여할 것"이라고 말했다. 그는 이어 "특히 출퇴근 시간대 대중교통 이용이 어려운 구간에서 마지막 이동 수단으로 활용될 수 있을 것"이라고 덧붙였다.\n' +
      '\n' +
      '[이미지: 반포바이크 전용 애플리케이션 화면 캡처]\n' +
      '\n' +
      '반포바이크는 인공지능 기반 배치 시스템을 도입한 것이 특징이다. 실시간 이용 현황을 분석해 수요가 몰리는 대여소에는 자동으로 자전거가 재배치된다.\n' +
      '\n' +
      '주민들의 반응은 엇갈렸다. 30대 직장인 김모씨는 "출근길에 지하철역까지 이동하는 데 유용할 것 같다"며 기대감을 나타냈다. 반면 일부 주민들은 "인도를 침범하는 자전거 주차 문제가 우려된다"고 지적했다.\n' +
      '\n' +
      '[이미지: 반포바이크를 이용하는 시민의 모습]\n' +
      '\n' +
      '서초구청은 시범 운영 기간 동안 이용 실적과 만족도를 조사해 내년도 확대 여부를 결정할 계획이다. 시범 운영은 3개월간 진행되며, 이후 이용자 설문조사와 데이터 분석을 거쳐 정식 서비스 전환 여부가 결정된다.\n' +
      '\n' +
      '한편 서울시는 이번 반포동 시범사업을 시작으로 다른 자치구에도 유사한 스마트 모빌리티 서비스를 확대하는 방안을 검토 중이다.\n' +
      '\n' +
      '[이미지: 서초구청에서 열린 반포바이크 출범식 현장]\n' +
      '\n' +
      '[확인 필요: 정확한 예산 규모, 대여소 정확한 위치 목록, 담당 부서 및 연락처]';
    showAiResult('AI 초안이 생성되었습니다. 완성도 70~80% 수준이며, 본문의 [확인 필요] 표시 부분은 취재로 채워주세요.');
  });

  document.getElementById('aiHeadline').addEventListener('click', function () {
    showAiResult(
      '제목 추천 (택 1):' +
      '<ul>' +
      '<li>서초구, AI 자전거 \'반포바이크\' 5일부터 시범 운영</li>' +
      '<li>반포동서 스마트 자전거 대여 서비스 나온다… 200대 규모</li>' +
      '<li>서초구 스마트 자전거 대여 서비스는 어떻게 이용하나</li>' +
      '</ul>'
    );
  });

  document.getElementById('aiCopyedit').addEventListener('click', function () {
    showAiResult('교열 결과: "인공지능 기반"과 "AI 기반" 표기가 혼용되어 있습니다. 첫 등장 정식 표기 후 약칭으로 통일하는 것을 권장합니다.');
  });

  document.getElementById('aiPolish').addEventListener('click', function () {
    showAiResult('기사 다듬기 완료: 문장 길이를 일부 조정하고 중복 표현을 정리했습니다.');
  });

  // AI번역 체크박스 - 선택한 매체판으로 번역 생성 데모
  var translateCheckboxes = {
    transAju: '아주경제',
    transAjp: 'AJP',
    transDaily: '아주일보',
    transVn: '베트남'
  };
  Object.keys(translateCheckboxes).forEach(function (id) {
    document.getElementById(id).addEventListener('change', function (e) {
      var label = translateCheckboxes[id];
      showToast(e.target.checked ? (label + '판 번역이 생성 대상에 추가되었습니다') : (label + '판 번역이 제외되었습니다'));
    });
  });

  // 관련기사 선택 (데모용 샘플 데이터, 10건씩 페이징, 최대 3개 선택)
  var relatedTitlePool = [
    '서초구, 반포동 스마트 자전거 200대 추가 도입',
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
    '서초구, 반포동 이어 방배동에도 자전거 사업 확대'
  ];
  var relatedKeywordPool = ['반포바이크', '스마트시티', '자전거', '서초구', '교통', '환경', '지자체'];

  function fmtRelatedDate(daysAgo) {
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var relatedCandidates = relatedTitlePool.map(function (title, i) {
    return {
      title: title,
      date: fmtRelatedDate(i * 3),
      keywords: [relatedKeywordPool[i % relatedKeywordPool.length], relatedKeywordPool[(i + 2) % relatedKeywordPool.length]]
    };
  });
  var relatedFiltered = relatedCandidates.slice();
  var RELATED_PAGE_SIZE = 10;
  var relatedCurrentPage = 1;
  var relatedSelected = []; // 선택된 제목 배열 (최대 3개)

  var relatedModalOverlay = document.getElementById('relatedModalOverlay');
  var relatedResultsList = document.getElementById('relatedResultsList');
  var relatedPagination = document.getElementById('relatedPagination');
  var relatedSelectedCount = document.getElementById('relatedSelectedCount');

  function openRelatedModal() {
    document.getElementById('relatedStartDate').value = '';
    document.getElementById('relatedEndDate').value = '';
    document.getElementById('relatedSearchType').value = 'all';
    document.getElementById('relatedSearchInput').value = '';
    relatedFiltered = relatedCandidates.slice();
    relatedCurrentPage = 1;
    renderRelatedResults();
    relatedModalOverlay.classList.add('show');
  }
  document.getElementById('btnCloseRelatedModal').addEventListener('click', function () {
    relatedModalOverlay.classList.remove('show');
  });
  relatedModalOverlay.addEventListener('click', function (e) {
    if (e.target === relatedModalOverlay) relatedModalOverlay.classList.remove('show');
  });

  document.getElementById('btnRelatedSearch').addEventListener('click', function () {
    var startVal = document.getElementById('relatedStartDate').value;
    var endVal = document.getElementById('relatedEndDate').value;
    var searchType = document.getElementById('relatedSearchType').value;
    var query = document.getElementById('relatedSearchInput').value.trim();

    relatedFiltered = relatedCandidates.filter(function (c) {
      if (startVal && c.date < startVal) return false;
      if (endVal && c.date > endVal) return false;

      if (query === '') return true;

      if (searchType === 'title') {
        return c.title.indexOf(query) !== -1;
      }
      if (searchType === 'keyword') {
        return c.keywords.some(function (k) { return k.indexOf(query) !== -1; });
      }
      // 전체: 제목 또는 키워드
      return c.title.indexOf(query) !== -1 || c.keywords.some(function (k) { return k.indexOf(query) !== -1; });
    });

    relatedCurrentPage = 1;
    renderRelatedResults();

    if (relatedFiltered.length === 0) {
      showToast('검색 결과가 없습니다');
    }
  });

  function renderRelatedResults() {
    var totalPages = Math.ceil(relatedFiltered.length / RELATED_PAGE_SIZE);
    var startIdx = (relatedCurrentPage - 1) * RELATED_PAGE_SIZE;
    var pageItems = relatedFiltered.slice(startIdx, startIdx + RELATED_PAGE_SIZE);

    relatedResultsList.innerHTML = '';
    if (pageItems.length === 0) {
      relatedResultsList.innerHTML = '<div class="import-empty">조건에 맞는 관련기사가 없습니다</div>';
    }
    pageItems.forEach(function (c) {
      var title = c.title;
      var item = document.createElement('div');
      item.className = 'import-result-item';
      if (relatedSelected.indexOf(title) !== -1) item.classList.add('selected');
      item.innerHTML = '<span class="r-title">' + title + '</span><span class="r-meta">' + c.date + ' · ' + c.keywords.join(', ') + '</span>';
      item.addEventListener('click', function () {
        var pos = relatedSelected.indexOf(title);
        if (pos !== -1) {
          relatedSelected.splice(pos, 1);
        } else {
          if (relatedSelected.length >= 3) {
            showToast('관련기사는 최대 3개까지 선택할 수 있습니다');
            return;
          }
          relatedSelected.push(title);
        }
        renderRelatedResults();
      });
      relatedResultsList.appendChild(item);
    });

    relatedSelectedCount.textContent = relatedSelected.length + ' / 3 선택됨';
    renderRelatedPagination(totalPages);
  }

  function renderRelatedPagination(totalPages) {
    relatedPagination.innerHTML = '';
    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = relatedCurrentPage === 1;
    prevBtn.addEventListener('click', function () { relatedCurrentPage -= 1; renderRelatedResults(); });
    relatedPagination.appendChild(prevBtn);

    for (var p = 1; p <= totalPages; p++) {
      (function (p) {
        var pageBtn = document.createElement('button');
        pageBtn.textContent = String(p);
        if (p === relatedCurrentPage) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', function () { relatedCurrentPage = p; renderRelatedResults(); });
        relatedPagination.appendChild(pageBtn);
      })(p);
    }

    var nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = relatedCurrentPage === totalPages;
    nextBtn.addEventListener('click', function () { relatedCurrentPage += 1; renderRelatedResults(); });
    relatedPagination.appendChild(nextBtn);
  }

  document.getElementById('btnRelatedDone').addEventListener('click', function () {
    relatedModalOverlay.classList.remove('show');
    renderRelatedSelectedList();
    showToast(relatedSelected.length + '개의 관련기사가 선택되었습니다');
  });

  function renderRelatedSelectedList() {
    var listEl = document.getElementById('relatedSelectedList');
    listEl.innerHTML = '';
    if (relatedSelected.length === 0) {
      listEl.innerHTML = '<div class="related-empty">선택된 관련기사가 없습니다</div>';
      return;
    }
    relatedSelected.forEach(function (title) {
      var row = document.createElement('div');
      row.className = 'related-selected-item';
      var titleSpan = document.createElement('span');
      titleSpan.className = 'rs-title';
      titleSpan.textContent = title;
      var removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', function () {
        var pos = relatedSelected.indexOf(title);
        if (pos !== -1) relatedSelected.splice(pos, 1);
        renderRelatedSelectedList();
      });
      row.appendChild(titleSpan);
      row.appendChild(removeBtn);
      listEl.appendChild(row);
    });
  }
  renderRelatedSelectedList();
