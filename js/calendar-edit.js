var singleDayCheck = document.getElementById('singleDayCheck');
  var endDateInput = document.getElementById('endDateInput');
  var dateTilde = document.getElementById('dateTilde');
  var startDateInput = document.getElementById('startDateInput');

  function updateDateMode() {
    var isSingle = singleDayCheck.checked;
    endDateInput.style.display = isSingle ? 'none' : 'block';
    dateTilde.style.display = isSingle ? 'none' : 'inline';
  }
  singleDayCheck.addEventListener('change', updateDateMode);
  updateDateMode();

  document.getElementById('btnCancel').addEventListener('click', function () {
    showToast('작성 중인 내용이 취소되었습니다');
  });

  document.getElementById('btnSubmit').addEventListener('click', function () {
    var content = document.getElementById('contentInput').value.trim();
    var startDate = startDateInput.value;
    var endDate = singleDayCheck.checked ? startDate : endDateInput.value;

    if (content === '') {
      showToast('행사내용을 입력해주세요');
      return;
    }
    if (!startDate) {
      showToast('시작일을 선택해주세요');
      return;
    }
    if (!singleDayCheck.checked && !endDate) {
      showToast('종료일을 선택해주세요');
      return;
    }
    if (!singleDayCheck.checked && new Date(endDate) < new Date(startDate)) {
      showToast('종료일은 시작일보다 빠를 수 없습니다');
      return;
    }

    var articleUrl = document.getElementById('articleUrlInput').value.trim();
    if (articleUrl !== '' && articleUrl.indexOf('http') !== 0) {
      showToast('기사 링크는 http:// 또는 https://로 시작해야 합니다');
      return;
    }

    var dateLabel = startDate === endDate ? startDate : (startDate + ' ~ ' + endDate);
    showToast('"' + content + '" 일정이 수정되었습니다 (' + dateLabel + ')');
  });
