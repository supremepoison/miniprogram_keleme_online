# 图片预览和下载功能使用指南

## 功能概述

用户可以在首页点击图片，进入全屏预览页面，并可以下载图片到本地相册。

## 实现的功能

### 1. 图片预览页面

**位置**: `pages/image-preview`

**功能**:
- 全屏显示图片
- 黑色背景，沉浸式体验
- 显示提示词
- 支持保存图片到相册
- 长按图片可显示系统菜单

**页面元素**:
- **全屏图片**: 居中显示，自适应屏幕
- **关闭按钮**: 左上角，点击返回
- **下载按钮**: 底部中央，保存图片到相册
- **提示词**: 底部显示，最多显示 2 行

### 2. 首页集成

**修改** `pages/home/home.wxml`:
- 图片添加 `bindtap` 事件
- 点击图片跳转到预览页面

**修改** `pages/home/home.js`:
- 添加 `onImageTap()` 方法
- 跳转到预览页面，传递图片 URL 和提示词

### 3. 下载功能实现

**支持两种图片类型**:

#### 云存储图片（cloud://）
1. 调用 `wx.cloud.getTempFileURL()` 获取临时下载链接
2. 调用 `wx.saveImageToPhotosAlbum()` 保存到相册

#### HTTP/HTTPS 图片
1. 调用 `wx.downloadFile()` 下载到临时目录
2. 调用 `wx.saveImageToPhotosAlbum()` 保存到相册

**错误处理**:
- 下载失败提示
- 授权失败引导用户授权
- 文件格式不支持提示

## 使用流程

### 用户操作流程

1. **浏览首页**: 查看图片列表
2. **点击图片**: 进入全屏预览页面
3. **查看大图**: 全屏查看图片
4. **下载图片**: 点击"保存图片"按钮
5. **授权相册**: 首次下载需要授权
6. **保存成功**: 提示"保存成功"
7. **返回首页**: 点击关闭按钮返回

### 技术流程

```
用户点击图片
    ↓
onImageTap 触发
    ↓
跳转到 image-preview 页面
    ↓
传递 imageUrl 和 prompt 参数
    ↓
页面加载，显示图片
    ↓
用户点击"保存图片"
    ↓
判断图片类型（cloud:// 或 http://）
    ↓
云存储: getTempFileURL
HTTP: downloadFile
    ↓
获取临时文件路径
    ↓
saveImageToPhotosAlbum
    ↓
成功提示或错误处理
```

## 页面结构

### image-preview 页面

**布局**:
```
┌─────────────────┐
│   [关闭按钮]   │  ← 固定左上角
├─────────────────┤
│                 │
│                 │
│   全屏图片      │
│   (aspectFit)   │
│                 │
│                 │
├─────────────────┤
│  [下载按钮]     │  ← 固定底部中央
├─────────────────┤
│  [提示词]       │  ← 固定底部左侧
└─────────────────┘
```

**样式特点**:
- 纯黑背景（#000）
- 半透明按钮背景
- 毛玻璃效果（backdrop-filter）
- 自定义导航栏

## 参数说明

### 页面跳转参数

```javascript
{
  imageUrl: string,  // 图片 URL（需要 encodeURIComponent）
  prompt: string    // 提示词（需要 encodeURIComponent）
}
```

### 示例代码

```javascript
wx.navigateTo({
  url: `/pages/image-preview/image-preview?imageUrl=${encodeURIComponent('cloud://xxx')}&prompt=${encodeURIComponent('提示词')}`
});
```

## 权限要求

### 相册访问权限

**首次下载**:
- 需要用户授权保存图片到相册
- 系统弹出授权弹窗
- 用户可以"允许"或"拒绝"

**拒绝授权后**:
- 再次点击下载会显示引导弹窗
- 用户可以点击"去授权"进入设置
- 在设置中允许访问相册

**设置路径**:
小程序 → 右上角"..." → 设置 → 隐私保护 → 用户信息与权限 → 相册

## 性能优化

### 1. 图片加载

- 使用 `mode="aspectFit"` 确保图片完整显示
- 图片自适应屏幕大小

### 2. 防重复下载

- `isDownloading` 状态防止重复点击
- 下载中禁用按钮

### 3. 临时文件

- 使用微信临时目录
- 自动清理临时文件

## 常见问题

### Q: 点击图片没有反应？

A: 请检查：
1. 图片 URL 是否有效
2. 页面路由是否正确配置
3. 控制台是否有错误信息

### Q: 下载图片失败？

A: 请检查：
1. 云存储权限是否正确
2. 用户是否已授权相册访问
3. 图片 URL 是否可访问

### Q: 提示词不显示？

A: 请检查：
1. 数据库中是否有 prompt 字段
2. URL 参数是否正确传递
3. 是否使用了 `decodeURIComponent` 解码

### Q: 授权后仍然无法保存？

A: 请尝试：
1. 重新打开小程序
2. 检查系统设置中的相册权限
3. 删除小程序后重新安装

## 后续优化建议

1. **双击/长按**: 支持双击或长按触发预览
2. **手势操作**: 支持缩放、拖动等手势
3. **多图预览**: 支持左右滑动切换图片
4. **分享功能**: 支持分享图片到微信
5. **收藏功能**: 支持收藏喜欢的图片
6. **缓存机制**: 缓存已下载的图片
7. **下载进度**: 显示下载进度
8. **批量下载**: 支持批量下载多张图片
9. **图片信息**: 显示更详细的图片信息（尺寸、大小等）
10. **编辑功能**: 支持简单的图片编辑（裁剪、滤镜等）

## 相关 API 文档

- [wx.navigateTo](https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateTo.html)
- [wx.saveImageToPhotosAlbum](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.saveImageToPhotosAlbum.html)
- [wx.downloadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/download/wx.downloadFile.html)
- [wx.cloud.getTempFileURL](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage.html#云文件-http-下载地址)
- [image 组件](https://developers.weixin.qq.com/miniprogram/dev/component/image.html)

---

## 技术亮点

### 1. 自定义预览页面
- 相比 `wx.previewImage` 更灵活
- 可以添加自定义按钮和交互
- 更好的用户体验

### 2. 多格式支持
- 支持云存储图片（cloud://）
- 支持网络图片（http://、https://）

### 3. 优雅的授权处理
- 自动检测授权状态
- 引导用户授权
- 友好的错误提示

### 4. 沉浸式体验
- 全屏黑色背景
- 毛玻璃效果
- 自定义导航栏
