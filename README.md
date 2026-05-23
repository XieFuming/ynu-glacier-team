# 云南大学冰川与气候变化研究团队网站

这是一个适合 GitHub Pages 部署的静态团队官网模板，用于展示团队简介、研究方向、成员、论文、项目、奖励、新闻和联系信息。

## 文件结构

```text
.
├── index.html                 # 网站页面结构
├── styles.css                 # 视觉样式
├── script.js                  # 读取 data/*.json 并渲染页面
├── data/
│   ├── site.json              # 团队简介、统计、研究方向、联系信息
│   ├── members.json           # 团队成员
│   ├── publications.json      # 代表性论文
│   ├── projects.json          # 科研项目
│   ├── awards.json            # 奖励荣誉
│   └── news.json              # 新闻动态
├── docs/
│   └── content-maintenance.md # 资料更新方法
└── .nojekyll                  # 告诉 GitHub Pages 不启用 Jekyll 处理
```

## 本地预览

由于页面会读取 `data/*.json`，建议用本地服务器预览，不要直接双击打开 HTML。

```powershell
python -m http.server 8000
```

然后在浏览器打开：

```text
http://localhost:8000
```

## GitHub Pages 部署步骤

1. 登录 GitHub，新建仓库，例如 `ynu-glacier-team`。
2. 将本目录所有文件上传到仓库根目录，确保 `index.html` 在根目录。
3. 进入仓库的 `Settings`。
4. 在左侧 `Code and automation` 区域点击 `Pages`。
5. 在 `Build and deployment` 里，把 `Source` 设为 `Deploy from a branch`。
6. 选择分支 `main`，文件夹选择 `/(root)`，保存。
7. 等待 GitHub Pages 构建完成，访问地址通常是：

```text
https://你的GitHub用户名.github.io/仓库名/
```

如果仓库名是 `你的GitHub用户名.github.io`，访问地址通常是：

```text
https://你的GitHub用户名.github.io/
```

官方参考：

- GitHub Pages 创建站点：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- GitHub Pages 发布源配置：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- 自定义域名配置：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## 后续更新流程

每次只需要修改 `data/*.json` 里的内容，然后提交到 `main` 分支。GitHub Pages 会自动重新发布。

常见更新：

- 修改团队简介、邮箱、地址：编辑 `data/site.json`
- 新增成员：编辑 `data/members.json`
- 新增论文：编辑 `data/publications.json`
- 新增项目：编辑 `data/projects.json`
- 新增奖励：编辑 `data/awards.json`
- 新增新闻：编辑 `data/news.json`

详细格式见 [docs/content-maintenance.md](docs/content-maintenance.md)。

## 替换首屏照片

当前首屏优先加载 Wikimedia Commons 照片，并提供 `assets/glacier-hero.svg` 作为本地兜底视觉。若要换成团队自己的野外照片：

1. 上传照片，例如 `assets/fieldwork.jpg`。
2. 打开 `styles.css`，搜索 `Sampling_on_the_glacier.jpg`。
3. 将图片地址改为：

```css
url("assets/fieldwork.jpg")
```

4. 同步修改 `index.html` 中的照片署名文字。

## 自定义域名

如果已有学院或团队域名，可在 GitHub 仓库 `Settings > Pages > Custom domain` 填写域名，并在域名服务商处配置 DNS。使用自定义域名时，建议先确认学校或学院的信息化管理要求。
