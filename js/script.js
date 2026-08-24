(() => {

  // Theme ------------------------------------------------------------------

  var STORAGE_KEY = 'theme-preference';

  function getThemePreference() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  setTheme(getThemePreference());

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Icons ------------------------------------------------------------------

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Image error fallback ---------------------------------------------------

  document.addEventListener('error', function (e) {
    if (e.target.tagName === 'IMG') {
      e.target.style.display = 'none';
    }
  }, true);

  // Repository data --------------------------------------------------------

  var months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
  }

  function createProjectCard(project) {
    var card = document.createElement('a');
    card.href = 'project.html?slug=' + project.slug;
    card.className = 'project-card';
    card.innerHTML =
      '<div class="project-card-header">' +
        '<img src="' + project.logo + '" alt="شعار ' + project.name + '" class="project-card-logo" loading="lazy" decoding="async">' +
        '<h2 class="project-card-name">' + project.name + '</h2>' +
      '</div>' +
      '<hr class="project-card-divider">' +
      '<p class="project-card-desc">' + project.description + '</p>';
    return card;
  }

  function loadProjects() {
    var grid = document.getElementById('project-grid');
    if (!grid) return;

    fetch('data/repositories.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(function (projects) {
        projects.forEach(function (project) {
          grid.appendChild(createProjectCard(project));
        });
      })
      .catch(function () {
        var error = document.createElement('p');
        error.className = 'load-error';
        error.textContent = 'تعذر تحميل المشاريع. تحقق من اتصالك بالإنترنت وأعد المحاولة.';
        grid.appendChild(error);
      });
  }

  function loadProjectDetails() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    if (!slug) return;

    fetch('data/repositories.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(function (projects) {
        var project = projects.find(function (p) { return p.slug === slug; });
        if (!project) return;

        document.title = project.name + ' - المستودع المعرفي';

        var logo = document.getElementById('project-logo');
        var name = document.getElementById('project-name');
        var description = document.getElementById('project-description');
        var date = document.getElementById('project-date');
        var content = document.getElementById('project-content');
        var websiteLink = document.getElementById('project-website');
        var githubLink = document.getElementById('project-github');

        if (logo) {
          logo.src = project.logo;
          logo.alt = 'شعار ' + project.name;
        }
        if (name) name.textContent = project.name;
        if (description) description.textContent = project.description;
        if (date) date.textContent = formatDate(project.publicationDate);
        if (content) content.textContent = project.content;
        if (websiteLink) websiteLink.href = project.website;
        if (githubLink) githubLink.href = project.github;
      })
      .catch(function () {
        var el = document.getElementById('project-content');
        if (el) {
          el.textContent = 'تعذر تحميل بيانات المشروع. تحقق من اتصالك بالإنترنت وأعد المحاولة.';
        }
      });
  }

  loadProjects();
  loadProjectDetails();

  // Service Worker ---------------------------------------------------------

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }

})();
