---
title: about
layout: page
comments: false
---

欢迎来到论文精读小组网站！

本网站用于记录、整理和分享团队成员的论文精读笔记，涵盖：

- 深度学习（Deep Learning）
- 计算机视觉（CV）
- 自然语言处理（NLP）
- 多模态（Multimodal）
- 强化学习（RL）
- AI4Science 等方向

希望通过长期积累，形成高质量的论文学习社区。

---

# 📝 如何编写一篇论文精读笔记

## 1. 安装 Git

下载地址：

- https://git-scm.com/

安装完成后，打开命令行配置 Git：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的GitHub邮箱"
```

注意：

* 邮箱必须与 GitHub 账号绑定邮箱一致
* 建议提前注册 GitHub 账号

---

## 2. 配置 GitHub SSH（推荐）

生成 SSH 密钥：

```bash
ssh-keygen -t ed25519 -C "你的GitHub邮箱"
```

一路回车即可。

然后查看公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

复制输出内容。

进入 GitHub：

```text
Settings
→ SSH and GPG keys
→ New SSH key
```

将公钥粘贴进去保存。

测试是否连接成功：

```bash
ssh -T git@github.com
```

---

## 3. 安装 Node.js

下载地址：

* [https://nodejs.org/](https://nodejs.org/)

安装完成后验证：

```bash
node -v
npm -v
```

---

## 4. 安装 Hexo

全局安装：

```bash
npm install -g hexo-cli
```

验证：

```bash
hexo -v
```

---

## 5. 克隆论文仓库

```bash
git clone https://github.com/paper-reading-group/paper-reading-source.git
```

进入项目目录：

```bash
cd paper-reading-source
```

安装项目依赖：

```bash
npm install
```

---

# ✍️ 创建论文精读笔记

## 方法一（推荐）

直接创建 Markdown 文件：

```text
source/_posts/
```

文件命名格式：

```text
论文标题.md
```

例如：

```text
2026-05-13-MambaVision.md
```

---

## 方法二（Hexo 命令创建）

```bash
hexo new "论文标题"
```

生成后的文件会自动出现在：

```text
source/_posts/论文标题.md
```

---

# 🖼️ 图片添加方式

生成论文文件的同时生成图片文件夹：

```text
source/_posts/论文标题/
```

在"论文标题.md"里面直接写：

```markdown
![图片描述](图片文件名)

例如：
  ![MambaVision架构](attention.png)
```

---

## 📌 文章封面图（推荐）

建议每篇论文添加封面图：

```markdown
---
title: MambaVision 精读
cover: cover.png
---
```

将cover.png文件放在source/_posts/论文标题/里面

---

# 📄 论文格式要求

请使用 Markdown 格式编写。

推荐模板：

```markdown
---
title: 论文标题
date: 2026-05-13
categories:
  - 论文精读

tags:
  - NLP
  - Transformer

author: 原论文作者
reader: 精读人姓名
topic: 研究方向
---

# 1. 论文背景

# 2. 核心思想

# 3. 模型结构

# 4. 实验设计

# 5. 实验结果

# 6. 优点与不足

# 7. 我的理解与思考

# 8. 参考资料
```

---

# 🚀 提交你的论文

完成后执行：

```bash
git add .

git commit -m "新增论文精读：论文标题"

git push

```

执行：

```bash
hexo clean
hexo g
hexo d
```

上传成功后，网站会自动更新。

---

# 👀 本地预览网站

生成静态页面：

```bash
hexo g
```
启动本地服务器：

```bash
hexo s
```
浏览器访问：

http://localhost:4000

即可查看网页效果。

---

# ⚠️ 团队协作规范

为了避免 Git 冲突，请遵守以下规则：

## 1. 一人一篇论文

不要多人同时修改同一个 `.md` 文件。

## 2. 提交前先同步仓库

每次开始写作前执行：

```bash
git pull
```

## 3. 文件命名规范统一

推荐：

```text
YYYY-MM-DD-论文标题.md
```

不要使用：

* 空格
* 中文标点
* 特殊符号

## 4. 提交信息规范

推荐格式：

```text
新增论文精读：XXX
修改论文内容：XXX
修复图片显示问题
```

## 5.不要上传以下内容

禁止上传：

```text
- node_modules/
- .deploy_git/
- public/
- .cache/
- db.json
```

这些文件会自动生成，不需要提交到 GitHub。

---

# 🌟 推荐内容

优秀论文精读建议包含：

* 论文背景
* 方法创新点
* 模型结构图
* 数学公式解释
* 实验结果分析
* 与已有方法对比
* 个人思考

鼓励加入：

* 图片
* 流程图
* 代码分析
* 数学推导
* 实验复现结果

---

# 📚 网站技术栈

本网站基于：

* Hexo
* GitHub Pages
* Markdown
* NexT Theme

构建与部署。

---

欢迎大家持续分享高质量论文精读内容 🚀

```
```
