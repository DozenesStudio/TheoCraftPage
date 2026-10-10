/* ==========================================================================
   TheoCraft — Wiki 交互脚本
   --------------------------------------------------------------------------
   · 左侧目录树：按主题分组，点击切换右侧正文
   · 左侧搜索框：按标题过滤目录
   · 右侧正文：当前全部为占位内容，之后逐篇补写
   想补写文档，改下面的 WIKI_TREE 即可（每篇 doc 的 body 字段直接写 HTML）。
   ========================================================================== */
'use strict';

(function () {

  /* ==========================================================================
     一、数据区  —— 目录结构与文档内容，全部写在这里
     --------------------------------------------------------------------------
     · 每个分组：{ name, key, docs: [...] }
     · 每篇文档：{ title, key, body }
       body 直接写 HTML 字符串；留空则显示统一的占位提示。
     ========================================================================== */
  const WIKI_TREE = [
    {
      name: '快速开始', key: 'start', docs: [
        { title: '快速开始', key: 'intro', body: '' },
        { title: '安装与运行', key: 'install', body: '' },
        { title: '转换你的第一个城市', key: 'first-city', body: '' },
        { title: '导入 Minecraft', key: 'import', body: '' }
      ]
    },
    {
      name: '引擎原理', key: 'engine', docs: [
        { title: '比例映射：一格一区块', key: 'scale', body: '' },
        { title: '地面投影模式', key: 'mode-ground', body: '' },
        { title: '地图画模式', key: 'mode-map', body: '' },
        { title: '高度分层与地形贴合', key: 'height', body: '' }
      ]
    },
    {
      name: '结构库规范', key: 'structure', docs: [
        { title: '结构库分类总览', key: 'library', body: '' },
        { title: '建筑结构与占位方块', key: 'building', body: '' },
        { title: '道路与环境适配', key: 'road', body: '' },
        { title: '材质映射表', key: 'materials', body: '' }
      ]
    },
    {
      name: '插件适配', key: 'plugin', docs: [
        { title: '适配中心简介', key: 'plugin-intro', body: '' },
        { title: '投稿与审核流程', key: 'plugin-submit', body: '' },
        { title: '第三方插件支持情况', key: 'plugin-support', body: '' }
      ]
    },
    {
      name: '常见问题', key: 'faq', docs: [
        { title: '常见问题（FAQ）', key: 'faq-main', body: '' },
        { title: '报错与排查', key: 'troubleshoot', body: '' },
        { title: '性能与体积', key: 'performance', body: '' }
      ]
    }
  ];

  /* ==========================================================================
     二、渲染与交互
     ========================================================================== */

  const tocEl = document.getElementById('wikiToc');
  const searchEl = document.getElementById('wikiSearch');
  const crumbEl = document.getElementById('wikiCrumb');
  const bodyEl = document.getElementById('wikiBody');

  let activeKey = 'intro';   // 当前选中的文档 key
  let keyword = '';

  /* 把 key → 文档 的映射整理出来，便于查找 */
  const DOC_INDEX = {};
  WIKI_TREE.forEach(function (group) {
    group.docs.forEach(function (doc) { DOC_INDEX[doc.key] = doc; });
  });

  /* ---- 渲染左侧目录树 ----
     搜索有内容时，只保留标题命中的文档；分组内没有命中就整组隐藏。 */
  function renderToc() {
    if (!tocEl) return;

    let anyVisible = false;

    const html = WIKI_TREE.map(function (group) {
      const docs = group.docs.filter(function (doc) {
        return !keyword || doc.title.toLowerCase().indexOf(keyword) !== -1;
      });
      if (!docs.length) return '';
      anyVisible = true;

      const items = docs.map(function (doc) {
        return '' +
          '<button class="wiki-toc__item' + (doc.key === activeKey ? ' is-active' : '') + '" ' +
            'type="button" data-doc="' + doc.key + '">' + doc.title + '</button>';
      }).join('');

      return '' +
        '<div class="wiki-toc__group">' +
          '<p class="wiki-toc__heading">' + group.name + '</p>' +
          items +
        '</div>';
    }).join('');

    tocEl.innerHTML = anyVisible ? html :
      '<p class="wiki-toc__empty">没有匹配的文档。</p>';
  }

  /* ---- 渲染右侧正文 ----
     文档有 body 就渲染 body，否则显示统一的占位块。
     标题一并写进 #wikiBody 内，避免反复替换节点后遗失引用。 */
  function renderDoc() {
    const doc = DOC_INDEX[activeKey];
    if (!doc) return;

    if (crumbEl) crumbEl.textContent = doc.title;

    if (bodyEl) {
      if (doc.body) {
        bodyEl.innerHTML = '<h1>' + doc.title + '</h1>' + doc.body;
      } else {
        bodyEl.innerHTML =
          '<h1>' + doc.title + '</h1>' +
          '<p>本篇文档正在整理中。下面是预留的正文结构，正式内容将陆续补写。</p>' +
          '<blockquote>提示：左侧目录可以切换章节。当前版本全部为占位内容。</blockquote>' +
          '<h2>这一节会写什么</h2>' +
          '<ul>' +
            '<li>本章节要讲解的概念与操作步骤</li>' +
            '<li>配图 / 示例文件的位置</li>' +
            '<li>相关章节的交叉引用</li>' +
          '</ul>' +
          '<div class="wiki-placeholder">本页为占位文档，正文内容待补写。</div>';
      }
    }

    renderToc();
  }

  /* ---- 切换文档 ---- */
  if (tocEl) {
    tocEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-doc]');
      if (!btn) return;
      activeKey = btn.getAttribute('data-doc');
      renderDoc();
    });
  }

  /* ---- 搜索（按标题过滤目录） ---- */
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      keyword = searchEl.value.trim().toLowerCase();
      renderToc();
    });
  }

  /* ---- 启动 ---- */
  renderDoc();

  if (window.TC && window.TC.initReveal) {
    try { window.TC.initReveal(); } catch (err) {
      if (window.console && console.error) console.error('[TheoCraft] initReveal 失败：', err);
    }
  }
})();