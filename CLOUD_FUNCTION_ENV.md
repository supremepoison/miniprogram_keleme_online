# 云函数环境变量配置

## imageGeneration 云函数

需要配置以下环境变量：

### DASHSCOPE_API_KEY

**说明**: 阿里云 DashScope API Key，用于调用通义万相文生图 API

**获取方式**:
1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录阿里云账号
3. 进入 "API-KEY管理" 页面
4. 创建新的 API Key 或使用现有的 API Key
5. 复制 API Key（格式如：sk-xxxxxx）

**配置步骤**:

#### 方法 1: 通过微信开发者工具配置
1. 打开微信开发者工具
2. 右键点击 `cloudfunctions/imageGeneration` 文件夹
3. 选择 "配置" -> "环境变量"
4. 添加环境变量：
   - 键名：`DASHSCOPE_API_KEY`
   - 键值：你的 API Key
5. 点击确定

#### 方法 2: 通过云开发控制台配置
1. 访问 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择你的环境：`cloudbase-7gak18djbca53c89`
3. 进入 "云函数" -> "imageGeneration"
4. 点击 "函数配置" 标签
5. 找到 "环境变量" 部分
6. 添加环境变量：
   - 键名：`DASHSCOPE_API_KEY`
   - 键值：你的 API Key
7. 保存配置

#### 方法 3: 通过配置文件配置
在 `cloudfunctions/imageGeneration` 目录下创建 `.env` 文件：
```bash
DASHSCOPE_API_KEY=sk-你的API_KEY
```

⚠️ **注意**: `.env` 文件不要提交到版本控制系统，应该添加到 `.gitignore` 文件中。

---

## 验证配置

配置完成后，请按以下步骤验证：

1. **部署云函数**：
   - 右键点击 `cloudfunctions/imageGeneration` 文件夹
   - 选择 "上传并部署：云端安装依赖"

2. **测试调用**：
   - 在小程序的创建页面输入描述
   - 点击"生成图片"按钮
   - 如果成功，应该能正常创建任务并生成图片

---

## 常见问题

### Q: API Key 配置正确，但调用失败？
A: 请检查：
- API Key 是否复制完整（没有多余空格）
- 云函数是否已重新部署
- 环境变量是否在部署后才添加的（需要重新部署）

### Q: 如何查看云函数的错误日志？
A:
- 在微信开发者工具中，右键点击云函数文件夹
- 选择 "云端日志"
- 可以查看详细的错误信息

### Q: API Key 如何保密？
A:
- 不要将 API Key 提交到代码仓库
- 使用 `.env` 文件或云开发控制台配置环境变量
- 定期更换 API Key

---

## 相关链接

- [阿里云百炼控制台](https://bailian.console.aliyun.com/)
- [通义万相 API 文档](https://help.aliyun.com/zh/model-studio/text-to-image-v2-api-reference)
- [云开发控制台](https://console.cloud.tencent.com/tcb)
