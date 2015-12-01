# Homework

基于 GitHub Issues 的作业列表。

## 安装

 1. 新建项目 + clone + push，或者 fork 本项目（需要到项目设置中启用 Issues 功能）；
 2. 前往 [GitHub 设置](https://github.com/settings/tokens)为建立的项目生成一个 access token（**注意：生成时请勿勾选任何 scope**），并填写到 `config.js` 的 `access_token` 中（请分割字符串以避免 GitHub 识别并屏蔽 access token），同时根据注释填写 `config.js` 的其余项，commit & push；
 3. 建立 `gh-pages` 分支，访问 http://yourusername.github.com/homework 即可。

## 作业格式

每条作业为一个 issue，内容分为 `---` 分隔的两部分：

 > 已修改：课程名不再用 issue 标题表示，改用头信息中的 `course` 字段。

 1. 第一部分为头信息，YAML 格式，包括课程名 `course`、作业提交时间 `deadline` 和提交方式 `submit`（如果该作业是一个实验项目）；
 2. 第二部分为作业内容，使用 Markdown 书写。

作业的类型使用标签表示，`homework` 标签表示普通的作业，`lab` 标签表示实验项目。

需要注意的一些细节：

 1. `deadline` 的格式为 `'YYYY-MM-DD'`，期末提交的用 `'end-of-term'` 表示，提交时间未定的用 `unknown` 表示；
 2. 虽然 YAML 允许字符串不使用引号表示，但是 `deadline` 的值请使用引号，从而避免解析 YAML 时自动生成 `Date` 对象；
 3. `submit` 使用 `|` 开头的 [scalar](http://www.yaml.org/spec/1.2/spec.html#scalar//)，按照 Markdown 语法解析，各段落间请留出空行；
 4. `---` 的上下请各留出一行空白；
 5. 正文 Markdown 使用 [marked](https://github.com/chjj/marked) 解析，支持 [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)。

作业格式示例：

```
course: 软件工程
deadline: '2015-11-16'

---

当用户把个人身份证号放入识别，系统能自动读取号码，之后显示目的地名菜单。

用户选择其目的地，并输入信用卡和密码后，系统就输出火车票，并扣除相应的费用。

要求系统反应快，同时支持多个用户买票。

 1. 讨论上面需求的歧义语句和遗漏；
 2. 指出非功能需求；
 3. 用结构化语言改写之，尽可能做到准确和无二义性。

```

实验格式示例：

```
course: 编译原理
deadline: '2015-11-15'
submit: |
  发送邮件到 xxx@xxx.com。
  
  邮件及附件名称：学号-姓名。
  
  附件内容：压缩包，代码 + 实验报告。

---

完成词法分析器的功能 + P76 3.14 的功能。

用 C/C++/Java 等自选语言编写，需要提交程序代码、实验报告，报告中要明确输入输出并截图。

```

## Credits

 - [Material Design Lite](http://www.getmdl.io/)
 - [Ractive.js](http://www.ractivejs.org/)
 - [director](https://github.com/flatiron/director)
 - [marked](https://github.com/chjj/marked)
 - [highlight.js](https://highlightjs.org/)
 - [js-yaml](https://github.com/nodeca/js-yaml)

## License

This project is open-sourced under MIT License.
