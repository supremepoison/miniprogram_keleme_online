# AI 画廊小程序

## 项目简介

这是一个基于 TDesign Weixin 组件库开发的微信小程序，用于 AI 画作的生成和分享。

## 功能特性

- **首页**：浏览所有用户分享的 AI 画作，支持滚动加载
- **我的**：个人信息管理和个人画廊展示，支持微信登录
- **创建图片**：输入提示词生成 AI 图片，支持发布作品

## 技术栈

- 微信小程序原生开发
- TDesign Weixin 组件库

## 项目结构

```
miniprogram-3/
├── pages/              # 页面目录
│   ├── home/          # 首页
│   ├── mine/          # 我的页面
│   └── create/        # 创建图片页面
├── prototype/         # HTML 原型文件
├── docs/             # 文档目录
├── images/           # 图片资源目录
├── app.js            # 小程序入口文件
├── app.json          # 全局配置文件
├── app.wxss          # 全局样式文件
└── package.json      # 依赖配置
```

## 开发说明

### 添加底部导航栏图标

目前底部导航栏只使用文字标签，如需添加图标，请执行以下步骤：

1. 从 [TDesign 官网](https://tdesign.tencent.com/miniprogram/components/icon) 下载图标资源
2. 准备以下 4 个图标文件（尺寸建议 81px × 81px）：
   - `images/tab-home.png` - 首页未选中图标
   - `images/tab-home-active.png` - 首页选中图标
   - `images/tab-mine.png` - 我的未选中图标
   - `images/tab-mine-active.png` - 我的选中图标
3. 修改 `app.json` 文件中的 `tabBar` 配置：

```json
"tabBar": {
  "color": "#999999",
  "selectedColor": "#0052D9",
  "backgroundColor": "#ffffff",
  "borderStyle": "black",
  "list": [
    {
      "pagePath": "pages/home/home",
      "text": "首页",
      "iconPath": "images/tab-home.png",
      "selectedIconPath": "images/tab-home-active.png"
    },
    {
      "pagePath": "pages/mine/mine",
      "text": "我的",
      "iconPath": "images/tab-mine.png",
      "selectedIconPath": "images/tab-mine-active.png"
    }
  ]
}
```

### 运行项目

1. 使用微信开发者工具打开项目
2. 在开发者工具中点击"编译"按钮
3. 即可在模拟器中查看效果

### TDesign 组件使用

项目已全局引入 TDesign 组件，可在任何页面直接使用：

```xml
<t-button theme="primary" size="large">按钮</t-button>
<t-textarea placeholder="请输入内容" />
<t-icon name="home" size="48rpx" />
```

更多组件使用方法请参考 [TDesign 官方文档](https://tdesign.tencent.com/miniprogram/getting-started)

## 已配置的组件

在 `app.json` 中已全局引入以下 TDesign 组件：

- `t-button` - 按钮
- `t-input` - 输入框
- `t-textarea` - 文本域
- `t-image` - 图片
- `t-cell` - 单元格
- `t-cell-group` - 单元格组
- `t-tag` - 标签
- `t-icon` - 图标
- `t-loading` - 加载中
- `t-toast` - 轻提示
- `t-fab` - 悬浮按钮
- `t-divider` - 分割线

如需使用其他组件，请在 `app.json` 的 `usingComponents` 中添加对应的配置。

## 注意事项

1. 确保 `node_modules` 目录已正确安装 `tdesign-miniprogram` 依赖
2. 如需添加新的 TDesign 组件，请先查看官方文档确认组件名称和用法
3. 图片占位符使用渐变色模拟，实际使用时请替换为真实图片
