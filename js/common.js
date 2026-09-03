/* ==========================================================================
   common.js
   모든 페이지가 공유하는 공통 동작: 토스트 알림, 사이드바 뉴스관리 하위메뉴 토글
   이 스크립트는 각 페이지의 </body> 바로 앞, 본문 마크업 뒤에 로드됩니다.
   ========================================================================== */

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 1800);
}

document.querySelectorAll('.nav-parent-row').forEach(function (row) {
  row.addEventListener('click', function () {
    var navItem = row.closest('.nav-item');
    var submenu = navItem.querySelector('.submenu');
    var toggleBtn = navItem.querySelector('.nav-toggle');
    submenu.classList.toggle('open');
    toggleBtn.classList.toggle('open');
  });
});
