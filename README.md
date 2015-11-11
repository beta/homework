# Homework

基于 GitHub Issues 的作业列表。

## 安装

 1. 新建项目 + clone + push，或者 fork 本项目（需要到项目设置中启用 Issues 功能）；
 2. 前往 [GitHub 设置](https://github.com/settings/tokens) 中为建立的项目生成一个 access token（**注意：生成时请勿勾选任何 scope**），并填写到 `config.js` 的 `access_token` 中（请分割字符串以避免 GitHub 识别并屏蔽 access token），commit & push；
 3. 建立 `gh-pages` 分支，访问 http://yourusername.github.com/homework 即可。

## 作业格式

每条作业为一个 issue，issue 标题为作业所属科目的名称，内容分为 `---` 分隔的两部分：

 1. 第一部分为头信息，YAML 格式，包括作业提交时间 `deadline` 和提交方式 `submit`（如果该作业是一个实验项目）；
 2. 第二部分为作业内容，使用 Markdown 书写。

作业的类型使用标签表示，`homework` 标签表示普通的作业，`lab` 标签表示实验项目。

需要注意的一些细节：

 1. `deadline` 的格式为 `'YYYY-MM-DD'`，期末提交的用 `'end-of-term'` 表示，提交时间未定的用 `unknown` 表示；
 2. 虽然 YAML 允许字符串不使用引号表示，但是 `deadline` 的值请使用引号，从而避免解析 YAML 时自动生成 `Date` 对象；
 3. `submit` 使用 `|` 开头的 scalar；
 4. `---` 的上下请各留出一行空白；
 5. 正文 Markdown 使用 [marked](https://github.com/chjj/marked) 解析，支持 [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)。

## Credits

 - [Material Design Lite](http://www.getmdl.io/)
 - [Ractive.js](http://www.ractivejs.org/)
 - [director](https://github.com/flatiron/director)
 - [marked](https://github.com/chjj/marked)
 - [highlight.js](https://highlightjs.org/)
 - [js-yaml](https://github.com/nodeca/js-yaml)

## License

This project is open-sourced under MIT License.
