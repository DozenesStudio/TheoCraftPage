/* ==========================================================================
   TheoCraft — 下载页交互脚本
   --------------------------------------------------------------------------
   · 进入页面弹出「开发中」提示，关闭后所有下载按钮置灰、不可交互
   · 未被锁定时点击下载按钮，也会再次弹窗提示
   · 通用模块（主题 / 导航 / 页脚 / 入场）来自 ../assets/js/base.js
   ========================================================================== */
'use strict';

(function () {

  var modal = document.getElementById('dlModal');
  var closeBtn = document.getElementById('dlModalClose');
  var dlButtons = Array.prototype.slice.call(document.querySelectorAll('.js-dl-btn'));
  var locked = false;   // 是否已经锁死下载按钮

  /* 打开弹窗 */
  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    // 等一帧再加 is-open，保证过渡能触发
    window.requestAnimationFrame(function () { modal.classList.add('is-open'); });
    if (closeBtn) closeBtn.focus();
  }

  /* 关闭弹窗，并把所有下载按钮置灰、禁用 */
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () { modal.hidden = true; }, 280);
    lockDownloads();
  }

  /* 把所有下载按钮置灰、不可交互 */
  function lockDownloads() {
    locked = true;
    dlButtons.forEach(function (btn) {
      btn.classList.add('btn--disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('tabindex', '-1');
      // <a> 用 aria-disabled + 类控制视觉；仍监听点击但会被下面的逻辑拦下
    });
  }

  /* 下载按钮：未锁定时点开弹窗提示；锁定后不会有任何反应 */
  dlButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();          // 一律不跳转（没有真实下载地址）
      if (locked) return;          // 已锁死：交给 .btn--disabled 的 pointer-events 处理
      openModal();
    });
  });

  /* 弹窗的关闭入口：右上角 ×、知道了按钮、点遮罩 */
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal();
    });
  }

  /* Esc 关闭 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* 进入页面即弹出「开发中」提示 */
  openModal();

  /* 滚动入场 */
  if (window.TC && window.TC.initReveal) {
    try { window.TC.initReveal(); } catch (err) {
      if (window.console && console.error) console.error('[TheoCraft] initReveal 失败：', err);
    }
  }
})();