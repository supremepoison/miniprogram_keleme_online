# 首页数据接入使用指南

## 功能概述

首页显示所有用户发布的图片，支持滚动加载和下拉刷新。每张图片卡片展示：
- 图片内容
- 提示词
- 用户头像和用户名
- 发布时间

## 实现的功能

### 1. 云函数 - getGallery

**位置**: `cloudfunctions/getGallery`

**功能**:
- 获取所有用户发布的图片
- 根据发布时间倒序排列
- 支持分页查询
- 联表查询用户信息（头像、昵称）

**参数**:
```javascript
{
  page: 1,        // 页码，从 1 开始
  pageSize: 10     // 每页数量，默认 10
}
```

**返回**:
```javascript
{
  code: 0,
  message: '成功',
  data: {
    images: [
      {
        id: 'xxx',
        prompt: '提示词',
        imageUrl: 'cloud://xxx',
        userId: 'xxx',
        userNickName: '用户昵称',
        userAvatar: 'cloud://xxx',
        createTime: Date
      }
    ],
    total: 100,      // 总数量
    page: 1,         // 当前页码
    pageSize: 10,    // 每页数量
    hasMore: true     // 是否有更多数据
  }
}
```

### 2. 前端实现

#### 首页页面 (`pages/home/home.js`)

**数据字段**:
- `imageList`: 图片列表
- `loading`: 加载状态
- `hasMore`: 是否有更多数据
- `page`: 当前页码
- `pageSize`: 每页数量

**方法**:
- `loadMoreImages()`: 加载更多图片（支持分页）
- `formatTime(date)`: 格式化时间显示
- `onImageError(e)`: 图片加载失败处理
- `onImageLoad(e)`: 图片加载成功处理

**生命周期**:
- `onLoad()`: 页面加载时，加载第一页数据
- `onShow()`: 页面显示时，如果是第一页则刷新数据
- `onReachBottom()`: 滚动到底部时，加载下一页
- `onPullDownRefresh()`: 下拉刷新时，重置数据并重新加载

#### 首页 UI (`pages/home/home.wxml`)

**显示内容**:
- 图片网格布局（2列）
- 图片卡片，包含：
  - 真实图片（从云存储加载）
  - 占位符（图片加载失败时）
  - 提示词（最多显示 2 行）
  - 用户信息（头像、昵称、时间）
- 空状态（没有作品时）
- 加载状态提示
- "没有更多了"提示

## 需要完成的步骤

### 1. 部署云函数

在微信开发者工具中：
1. 右键点击 `cloudfunctions/getGallery` 文件夹
2. 选择 **"上传并部署：云端安装依赖"**
3. 等待部署完成

### 2. 配置数据库权限

确保以下集合的权限设置正确：

#### images 集合
- **权限**: 所有用户可读，仅创建者可写

#### users 集合
- **权限**: 所有用户可读，仅创建者可写

### 3. 配置云存储权限

- **权限**: 所有用户可读，仅创建者可写

## 使用流程

### 用户操作流程

1. **进入首页**: 自动加载第一页图片（10条）
2. **滚动查看**: 继续向下滚动，自动加载更多图片
3. **下拉刷新**: 下拉页面，刷新并重新加载最新数据
4. **点击图片**: （可扩展）查看图片详情

### 技术流程

```
页面加载
    ↓
loadMoreImages(page=1)
    ↓
调用 getGallery 云函数
    ↓
云函数查询 images 集合（倒序、分页）
    ↓
联表查询 users 集合获取用户信息
    ↓
返回图片列表
    ↓
前端更新 imageList
    ↓
用户滚动到底部
    ↓
onReachBottom 触发
    ↓
loadMoreImages(page=2)
    ↓
加载第二页数据
    ↓
追加到 imageList
```

## 技术特点

### 1. 分页查询
- 每页默认 10 条数据
- 使用 `skip` 和 `limit` 实现
- 避免一次性加载大量数据

### 2. 联表查询
- 先获取所有图片的 userId
- 使用 `_.in(userIds)` 批量查询用户信息
- 将用户信息合并到图片数据中
- 减少数据库查询次数

### 3. 滚动加载
- 使用 `onReachBottom` 生命周期
- 检查 `loading` 和 `hasMore` 状态
- 防止重复加载

### 4. 下拉刷新
- 使用 `onPullDownRefresh` 生命周期
- 重置页码和数据列表
- 重新加载第一页数据

### 5. 图片显示
- 支持云存储图片
- 支持占位符（图片加载失败时）
- 使用 `aspectFill` 模式填充图片
- 固定正方形比例（1:1）

## 性能优化

### 1. 减少数据库查询
- 一次性批量查询用户信息
- 避免循环查询

### 2. 分页加载
- 避免一次性加载过多数据
- 按需加载，减少内存占用

### 3. 图片懒加载
- 只显示当前页面的图片
- 滚动时加载更多

### 4. 防抖处理
- `loading` 状态防止重复请求
- `hasMore` 状态避免无效请求

## 调试方法

### 查看云函数日志

1. 右键点击 `cloudfunctions/getGallery` 文件夹
2. 选择"云端日志"
3. 查看查询结果和错误信息

### 查看数据库数据

1. 在云开发控制台进入"数据库"标签页
2. 查看 `images` 和 `users` 集合
3. 检查数据结构和权限

### 查看云存储文件

1. 在云开发控制台进入"存储"标签页
2. 查看上传的图片
3. 检查文件权限

### 前端调试

在微信开发者工具的 Console 中查看：
- 查询结果
- 图片加载状态
- 分页加载日志

## 常见问题

### Q: 图片不显示？

A: 请检查：
1. 云存储中的图片是否存在
2. 云存储权限是否设置为"所有用户可读"
3. 图片 URL 是否正确

### Q: 用户信息不显示？

A: 请检查：
1. `users` 集合中是否有对应的数据
2. `users` 集合的权限是否正确
3. `userId` 和用户 `_id` 是否匹配

### Q: 滚动加载不工作？

A: 请检查：
1. `hasMore` 状态是否正确
2. `loading` 状态是否正确
3. 控制台是否有错误信息

### Q: 下拉刷新不工作？

A: 请检查：
1. 是否在 `app.json` 中启用了下拉刷新
2. `onPullDownRefresh` 方法是否正确实现
3. 是否调用了 `wx.stopPullDownRefresh()`

## 后续优化建议

1. **图片压缩**: 自动压缩大图片，减少加载时间
2. **缓存机制**: 缓存已加载的图片和数据
3. **预加载**: 预加载下一页数据
4. **骨架屏**: 加载时显示骨架屏
5. **图片懒加载**: 使用小程序的图片懒加载能力
6. **搜索功能**: 支持按提示词搜索图片
7. **筛选功能**: 按时间、用户等条件筛选
8. **详情页**: 点击图片进入详情页，查看大图和更多信息

---

## 相关链接

- [云开发控制台](https://console.cloud.tencent.com/tcb)
- [云数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
- [云存储文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage.html)
- [小程序页面事件](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html)
