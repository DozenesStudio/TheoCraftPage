/* ==========================================================================
   TheoCraft — TCP 插件适配中心 交互脚本
   --------------------------------------------------------------------------
   · 左侧分类树：分类法与转换器结构库（assets/ 目录）保持一致
   · 右侧瀑布流：占位作品列表 + 搜索 + 排序
   · 右下角悬浮加号：跳转「申请投稿」页（该页尚未制作，先给出提示）
   · 当前全部为占位内容，后端接入后替换 POSTS 数据即可
   ========================================================================== */
'use strict';

(function () {

  /* ==========================================================================
     一、数据区
     ========================================================================== */

  /* 分类树：与 assets/ 下的结构库分类法一致
     buildings = assets/buildings/*，roads = assets/roads/*，vegetation = assets/vegetation */
  const CATEGORY_TREE = [
    {
      name: '建筑', key: 'buildings', children: [
        { name: '商业建筑', key: 'commercial' },
        { name: '装饰 / 栅栏', key: 'deco' },
        { name: '灾难', key: 'disaster' },
        { name: '农场', key: 'farm' },
        { name: '工业建筑', key: 'industrial' },
        { name: '地标建筑', key: 'landmark' },
        { name: '军事', key: 'military' },
        { name: '杂项', key: 'misc' },
        { name: '公共建筑', key: 'public' },
        { name: '住宅建筑', key: 'residential' },
        { name: '服务建筑', key: 'service' },
        { name: '供给设施', key: 'supply' },
        { name: '交通设施', key: 'transport' }
      ]
    },
    {
      name: '道路', key: 'roads', children: [
        { name: '道路', key: 'road' },
        { name: '铁路', key: 'rail' },
        { name: '公交', key: 'bus' },
        { name: '航空', key: 'air' },
        { name: '道路装饰', key: 'roaddeco' },
        { name: '铁路装饰', key: 'raildeco' }
      ]
    },
    {
      name: '植被', key: 'vegetation', children: [
        { name: '树木', key: 'vegetation' }
      ]
    }
  ];

  /* 占位作品（后端接入后替换）。
     h = 封面高度，用来制造瀑布流的错落感。 */
  const POSTS = [
    { title: '示例：北美风商业街角', category: 'commercial', h: 150, author: '占位作者A', src: '原版' },
    { title: '示例：双层独立住宅', category: 'residential', h: 210, author: '占位作者B', src: '第三方插件' },
    { title: '示例：十字路口铺装', category: 'road', h: 120, author: '占位作者C', src: '原版' },
    { title: '示例：小型火车站', category: 'rail', h: 180, author: '占位作者D', src: '第三方插件' },
    { title: '示例：城市街心公园', category: 'deco', h: 160, author: '占位作者E', src: '原版' },
    { title: '示例：工业园区厂房', category: 'industrial', h: 200, author: '占位作者F', src: '第三方插件' },
    { title: '示例：市政厅广场', category: 'public', h: 170, author: '占位作者G', src: '原版' },
    { title: '示例：成片农田', category: 'farm', h: 130, author: '占位作者H', src: '原版' },
    { title: '示例：机场航站楼', category: 'transport', h: 220, author: '占位作者I', src: '第三方插件' },
    { title: '示例：云杉树林', category: 'vegetation', h: 190, author: '占位作者J', src: '原版' },
    { title: '示例：地标观景塔', category: 'landmark', h: 240, author: '占位作者K', src: '第三方插件' },
    { title: '示例：公交枢纽站', category: 'bus', h: 140, author: '占位作者L', src: '第三方插件' }
  ];

  /* 分类 key → 中文名，用于卡片标签与筛选显示 */
  const CATEGORY_NAME = {};
  CATEGORY_TREE.forEach(function (group) {
    group.children.forEach(function (child) { CATEGORY_NAME[child.key] = child.name; });
  });

  /* ==========================================================================
     二、渲染与交互
     ========================================================================== */

  const treeEl = document.getElementById('plugTree');
  const listEl = document.getElementById('plugList');
  const searchEl = document.getElementById('plugSearch');
  const sortEl = document.getElementById('plugSort');
  const resultEl = document.getElementById('plugResult');

  let activeCategory = 'all';   // 'all' 或某个叶子分类 key
  let keyword = '';

  /* ---- 渲染左侧分类树 ---- */
  function renderTree() {
    if (!treeEl) return;
    treeEl.innerHTML = CATEGORY_TREE.map(function (group, gi) {
      const leaves = group.children.map(function (child) {
        return '' +
          '<button class="tree__leaf" type="button" data-cat="' + child.key + '">' +
            '<span>' + child.name + '</span>' +
            '<span class="tree__count">' + countByCategory(child.key) + '</span>' +
          '</button>';
      }).join('');

      return '' +
        '<div class="tree__group' + (gi === 0 ? ' is-open' : '') + '" data-group="' + group.key + '">' +
          '<button class="tree__toggle" type="button" aria-expanded="' + (gi === 0 ? 'true' : 'false') + '">' +
            '<svg class="tree__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
              'stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"></path></svg>' +
            '<span>' + group.name + '</span>' +
            '<span class="tree__count">' + group.children.length + '</span>' +
          '</button>' +
          '<div class="tree__children">' + leaves + '</div>' +
        '</div>';
    }).join('');
  }

  function countByCategory(key) {
    return POSTS.filter(function (p) { return p.category === key; }).length;
  }

  /* ---- 过滤 + 排序 ---- */
  function getVisiblePosts() {
    let items = POSTS.filter(function (p) {
      const okCat = activeCategory === 'all' || p.category === activeCategory;
      const okKey = !keyword ||
        (p.title + ' ' + p.author + ' ' + p.src).toLowerCase().indexOf(keyword) !== -1;
      return okCat && okKey;
    });

    const sort = sortEl ? sortEl.value : 'new';
    if (sort === 'name') {
      items = items.slice().sort(function (a, b) { return a.title.localeCompare(b.title, 'zh'); });
    } else if (sort === 'hot') {
      items = items.slice().reverse();   // 占位：暂无真实数据，先按热度倒序演示
    }
    return items;
  }

  /* ---- 渲染瀑布流 ---- */
  function renderList() {
    if (!listEl) return;
    const items = getVisiblePosts();

    if (resultEl) resultEl.textContent = '共 ' + items.length + ' 件';

    if (!items.length) {
      listEl.innerHTML = '<p class="waterfall__empty">没有匹配的作品，换个关键词或分类试试。</p>';
      return;
    }

    listEl.innerHTML = items.map(function (p) {
      const catName = CATEGORY_NAME[p.category] || p.category;
      const initial = (p.author || '?').trim().charAt(0).toUpperCase();
      return '' +
        '<article class="wf-card">' +
          '<div class="wf-card__cover" style="--h:' + p.h + 'px">' +
            '<span class="wf-card__badge">' + p.src + '</span>' +
            '封面占位' +
          '</div>' +
          '<div class="wf-card__body">' +
            '<h3 class="wf-card__title">' + p.title + '</h3>' +
            '<ul class="wf-card__meta">' +
              '<li class="meta-chip meta-chip--mode">' + catName + '</li>' +
              '<li class="meta-chip">' + p.src + '</li>' +
            '</ul>' +
            '<div class="wf-card__foot">' +
              '<span class="wf-card__author"><span class="wf-card__avatar">' + initial + '</span>' + p.author + '</span>' +
              '<span>占位</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ---- 分类树事件：展开 / 收起、选中叶子 ---- */
  if (treeEl) {
    treeEl.addEventListener('click', function (e) {
      const toggle = e.target.closest('.tree__toggle');
      if (toggle) {
        const group = toggle.parentElement;
        const open = group.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }
      const leaf = e.target.closest('.tree__leaf');
      if (leaf) {
        // 再点一次已选中的分类 = 取消选择，回到全部
        activeCategory = (activeCategory === leaf.getAttribute('data-cat')) ? 'all' : leaf.getAttribute('data-cat');
        markActiveLeaf();
        renderList();
      }
    });
  }

  function markActiveLeaf() {
    if (!treeEl) return;
    Array.prototype.forEach.call(treeEl.querySelectorAll('.tree__leaf'), function (leaf) {
      leaf.classList.toggle('is-active', leaf.getAttribute('data-cat') === activeCategory);
    });
  }

  /* ---- 搜索 ---- */
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      keyword = searchEl.value.trim().toLowerCase();
      renderList();
    });
  }

  /* ---- 排序 ---- */
  if (sortEl) sortEl.addEventListener('change', renderList);

  /* ---- 右下角悬浮加号：跳转「申请投稿」页（尚未制作，先提示） ----
     后端与投稿页就绪后，把下面的提示换成：
       window.location.href = 'submit/index.html';
  */
  const fab = document.getElementById('plugFab');
  const toast = document.getElementById('plugToast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-show'); }, 2600);
  }

  if (fab) {
    fab.addEventListener('click', function () {
      showToast('申请投稿页面正在开发中，敬请期待');
    });
  }

  /* ---- 启动 ---- */
  renderTree();
  renderList();

  if (window.TC && window.TC.initReveal) {
    try { window.TC.initReveal(); } catch (err) {
      if (window.console && console.error) console.error('[TheoCraft] initReveal 失败：', err);
    }
  }
})();