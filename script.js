const dataFiles = {
  site: "data/site.json",
  members: "data/members.json",
  publications: "data/publications.json",
  projects: "data/projects.json",
  awards: "data/awards.json",
  news: "data/news.json"
};

const state = {
  memberGroup: "全部",
  publicationYear: "全部",
  publicationQuery: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const escapeHTML = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
};

const sortByYearDesc = (items) =>
  [...items].sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

async function loadData() {
  const entries = await Promise.all(
    Object.entries(dataFiles).map(async ([key, path]) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`无法加载 ${path}`);
      return [key, await response.json()];
    })
  );
  return Object.fromEntries(entries);
}

function renderSite(site) {
  $$("[data-site-field]").forEach((node) => {
    const field = node.dataset.siteField;
    if (site[field]) node.textContent = site[field];
  });

  const stats = $("[data-stats]");
  stats.innerHTML = (site.stats || [])
    .map(
      (item) => `
        <div>
          <dt>${escapeHTML(item.label)}</dt>
          <dd>${escapeHTML(item.value)}</dd>
        </div>
      `
    )
    .join("");

  const links = $("[data-quick-links]");
  links.innerHTML = (site.quickLinks || [])
    .map(
      (item) =>
        `<a href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>`
    )
    .join("");

  const contact = $("[data-contact]");
  contact.innerHTML = `
    <div class="contact-line">
      <span>邮箱</span>
      <a href="mailto:${escapeHTML(site.contact.email)}">${escapeHTML(site.contact.email)}</a>
    </div>
    <div class="contact-line">
      <span>地址</span>
      <strong>${escapeHTML(site.contact.address)}</strong>
    </div>
    <div class="contact-line">
      <span>依托单位</span>
      <strong>${escapeHTML(site.contact.affiliation)}</strong>
    </div>
    <div class="contact-line">
      <span>招生方向</span>
      <strong>${escapeHTML(site.contact.admissions)}</strong>
    </div>
  `;
}

function renderResearch(site) {
  const research = $("[data-research]");
  research.innerHTML = (site.researchAreas || [])
    .map(
      (item, index) => `
        <article class="research-card">
          <span class="research-index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderMemberFilters(members, render) {
  const groups = ["全部", ...new Set(members.map((member) => member.group).filter(Boolean))];
  const target = $("[data-member-filters]");
  target.innerHTML = groups
    .map(
      (group) => `
        <button class="chip${state.memberGroup === group ? " is-active" : ""}" type="button" data-group="${escapeHTML(group)}">
          ${escapeHTML(group)}
        </button>
      `
    )
    .join("");

  $$("[data-group]", target).forEach((button) => {
    button.addEventListener("click", () => {
      state.memberGroup = button.dataset.group;
      render();
    });
  });
}

function renderMembers(members) {
  const filtered = state.memberGroup === "全部"
    ? members
    : members.filter((member) => member.group === state.memberGroup);

  const target = $("[data-members]");
  if (!filtered.length) {
    target.innerHTML = `<p class="empty-state">暂无成员信息，请在 data/members.json 中补充。</p>`;
    return;
  }

  target.innerHTML = filtered
    .map((member) => {
      const tags = (member.tags || [])
        .map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`)
        .join("");
      return `
        <article class="member-card">
          <div class="member-top">
            <div class="avatar" aria-hidden="true">${escapeHTML(member.initials || member.name.slice(0, 1))}</div>
            <div>
              <h3>${escapeHTML(member.name)}</h3>
              <div class="member-role">${escapeHTML(member.role)}</div>
            </div>
          </div>
          <p>${escapeHTML(member.bio)}</p>
          <div class="tag-list">${tags}</div>
        </article>
      `;
    })
    .join("");
}

function renderPublicationFilters(publications, render) {
  const years = ["全部", ...new Set(sortByYearDesc(publications).map((pub) => String(pub.year)).filter(Boolean))];
  const target = $("[data-publication-filters]");
  target.innerHTML = years
    .map(
      (year) => `
        <button class="chip${state.publicationYear === year ? " is-active" : ""}" type="button" data-year="${escapeHTML(year)}">
          ${escapeHTML(year)}
        </button>
      `
    )
    .join("");

  $$("[data-year]", target).forEach((button) => {
    button.addEventListener("click", () => {
      state.publicationYear = button.dataset.year;
      render();
    });
  });

  const search = $("[data-publication-search]");
  if (!search.dataset.bound) {
    search.addEventListener("input", () => {
      state.publicationQuery = search.value.trim().toLowerCase();
      renderPublications(publications);
    });
    search.dataset.bound = "true";
  }
}

function renderPublications(publications) {
  const query = state.publicationQuery;
  const filtered = sortByYearDesc(publications).filter((pub) => {
    const yearMatch = state.publicationYear === "全部" || String(pub.year) === state.publicationYear;
    const haystack = [pub.title, pub.authors, pub.journal, pub.year, pub.keywords?.join(" ")]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return yearMatch && (!query || haystack.includes(query));
  });

  const target = $("[data-publications]");
  if (!filtered.length) {
    target.innerHTML = `<p class="empty-state">没有匹配的论文。可以调整筛选，或在 data/publications.json 中补充成果。</p>`;
    return;
  }

  target.innerHTML = filtered
    .map((pub) => {
      const links = [
        pub.doi ? `<a href="https://doi.org/${escapeHTML(pub.doi)}" target="_blank" rel="noreferrer">DOI</a>` : "",
        pub.url ? `<a href="${escapeHTML(pub.url)}" target="_blank" rel="noreferrer">全文/期刊</a>` : ""
      ].filter(Boolean).join("");

      return `
        <article class="publication-item">
          <div class="pub-year">${escapeHTML(pub.year)}</div>
          <div>
            <h3 class="pub-title">${escapeHTML(pub.title)}</h3>
            <p class="pub-meta">${escapeHTML(pub.authors)}</p>
            <p class="pub-meta">${escapeHTML(pub.journal)}</p>
            <div class="pub-links">${links}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjects(projects) {
  const target = $("[data-projects]");
  target.innerHTML = sortByYearDesc(projects)
    .map(
      (project) => `
        <article class="project-card">
          <div class="project-meta">${escapeHTML(project.period)} · ${escapeHTML(project.level)}</div>
          <h3>${escapeHTML(project.title)}</h3>
          <p>${escapeHTML(project.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderAwards(awards) {
  const target = $("[data-awards]");
  target.innerHTML = sortByYearDesc(awards)
    .map(
      (award) => `
        <article class="award-item">
          <div class="award-year">${escapeHTML(award.year)}</div>
          <h3>${escapeHTML(award.title)}</h3>
          <p>${escapeHTML(award.organization)}</p>
        </article>
      `
    )
    .join("");
}

function renderNews(news) {
  const target = $("[data-news]");
  target.innerHTML = [...news]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (item) => `
        <article class="news-card">
          <div class="news-date">${escapeHTML(formatDate(item.date))}</div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.summary)}</p>
        </article>
      `
    )
    .join("");
}

function setupNavigation() {
  const header = $("[data-header]");
  const nav = $("[data-nav]");
  const toggle = $("[data-menu-toggle]");
  const links = $$("a[href^='#']", nav);
  const sections = links
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.3, 0.55] }
  );

  sections.forEach((section) => observer.observe(section));
}

async function init() {
  try {
    const data = await loadData();
    renderSite(data.site);
    renderResearch(data.site);

    const rerenderMembers = () => {
      renderMemberFilters(data.members, rerenderMembers);
      renderMembers(data.members);
    };
    rerenderMembers();

    const rerenderPublications = () => {
      renderPublicationFilters(data.publications, rerenderPublications);
      renderPublications(data.publications);
    };
    rerenderPublications();

    renderProjects(data.projects);
    renderAwards(data.awards);
    renderNews(data.news);
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="empty-state" role="alert">资料加载失败。请通过本地服务器预览网站，例如 python -m http.server 8000。</div>`
    );
  }
  setupNavigation();
}

document.addEventListener("DOMContentLoaded", init);
