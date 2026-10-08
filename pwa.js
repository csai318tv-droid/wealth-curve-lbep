/* 부의 곡선 L-BEP 계산기 — 설치 안내 배너와 서비스워커 등록 */
(function () {
  'use strict';
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* 설치 실패해도 앱은 그대로 작동 */ });
    });
  }

  // 바닥글에 개인정보처리방침 링크 추가
  var foot = document.querySelector('.foot');
  if (foot) {
    var p = document.createElement('p');
    p.style.marginTop = '6px';
    p.innerHTML = '<a href="privacy.html">개인정보처리방침 · 이용 안내</a> · <a href="https://github.com/csai318tv-droid/wealth-curve-lbep/issues" target="_blank" rel="noopener">문의·의견 남기기</a>';
    foot.appendChild(p);
  }

  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (standalone) return;
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
  var isAndroid = /Android/i.test(ua);
  var inApp = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|DaumApps/i.test(ua);
  var dismissed = false;
  try { dismissed = localStorage.getItem('lbep-install-dismissed') === '1'; } catch (e) {}
  if (dismissed) return;

  var style = document.createElement('style');
  style.textContent = '#pwaBanner{position:fixed;left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:40;background:#1d5fc2;color:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:14px;line-height:1.45;display:flex;gap:10px;align-items:center;font-family:inherit}#pwaBanner .pwa-t{flex:1;min-width:0}#pwaBanner b{display:block;font-size:15px}#pwaBanner button{appearance:none;border:0;font:inherit;font-weight:600;border-radius:999px;padding:8px 12px;cursor:pointer}#pwaBanner .pwa-go{background:#fff;color:#1d5fc2}#pwaBanner .pwa-x{background:transparent;color:#fff;opacity:.85;padding:6px 8px}@media(min-width:720px){#pwaBanner{left:auto;right:20px;max-width:380px}}';
  document.head.appendChild(style);

  function banner(html) {
    var old = document.getElementById('pwaBanner'); if (old) old.remove();
    var el = document.createElement('div'); el.id = 'pwaBanner'; el.setAttribute('role', 'dialog'); el.innerHTML = html;
    document.body.appendChild(el);
    el.querySelector('.pwa-x').addEventListener('click', function () {
      el.remove();
      try { localStorage.setItem('lbep-install-dismissed', '1'); } catch (e) {}
    });
    return el;
  }

  if (inApp) {
    var openBtn = isAndroid ? '<a class="pwa-go" style="text-decoration:none;display:inline-block" href="intent://csai318tv-droid.github.io/wealth-curve-lbep/#Intent;scheme=https;package=com.android.chrome;end">크롬으로 열기</a>' : '';
    var how = isAndroid ? '카카오톡 안에서 열렸습니다. 오른쪽 버튼을 누르거나, 오른쪽 위 점 세 개(⋮) → ‘다른 브라우저로 열기’를 누르세요.' : '카카오톡 안에서 열렸습니다. 아래쪽 점 세 개(⋯) 또는 공유 버튼 → ‘Safari로 열기’를 누른 뒤, 공유 → ‘홈 화면에 추가’.';
    setTimeout(function () {
      banner('<div class="pwa-t"><b>앱으로 설치하려면 브라우저로 여세요</b>' + how + '</div>' + openBtn + '<button class="pwa-x" type="button" aria-label="닫기">✕</button>');
    }, 800);
    return;
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    window.__lbepDeferredPrompt = e;
    var nat = document.getElementById('installNative'); if (nat) nat.hidden = false;
    var el = banner('<div class="pwa-t"><b>휴대폰에 앱으로 설치하기</b>홈 화면에 아이콘이 생기고, 인터넷이 없어도 열립니다.</div><button class="pwa-go" type="button">설치</button><button class="pwa-x" type="button" aria-label="닫기">✕</button>');
    el.querySelector('.pwa-go').addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; el.remove(); }, function () { deferred = null; el.remove(); });
    });
  });

  if (isIOS) {
    setTimeout(function () {
      banner('<div class="pwa-t"><b>아이폰에 앱으로 설치하기</b>사파리 아래쪽 공유 버튼(네모에 화살표)을 누르고 ‘홈 화면에 추가’를 선택하세요.</div><button class="pwa-x" type="button" aria-label="닫기">✕</button>');
    }, 1500);
  }
})();
