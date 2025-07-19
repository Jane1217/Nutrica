# RLS策略修复测试指南

## 问题描述

之前的错误：
```
ERROR: Food creation failed | Error: Insert food error: new row violates row-level security policy for table "food"
```

## 修复内容

### 1. 后端修复

#### 认证中间件
- 创建了 `backend/src/middleware/auth.js`
- 验证JWT令牌并提取用户信息
- 确保只有认证用户可以访问API

#### 数据库服务
- 更新 `backend/src/services/databaseService.js`
- 使用服务端密钥绕过RLS策略
- 确保后端有管理员权限

#### 食物路由
- 更新 `backend/src/routes/food/food.js`
- 添加认证中间件
- 从认证中间件获取用户ID，而不是从请求体

### 2. 前端修复

#### API工具函数
- 更新 `frontend/src/utils/api.js`
- `foodApi.addFood` 现在需要访问令牌参数

#### 模态框组件
- 更新所有调用 `foodApi.addFood` 的组件：
  - `FoodModal.jsx`
  - `EnterValueModal.jsx`
  - `DescribeFoodModal.jsx`
- 添加访问令牌获取和传递

## 测试步骤

### 1. 环境检查
```bash
# 确保后端环境变量正确
echo $SUPABASE_SERVICE_ROLE_KEY

# 启动后端
cd backend && npm run dev

# 启动前端
cd frontend && npm run dev
```

### 2. 功能测试

#### 测试1：添加食物（扫描标签）
1. 登录用户账号
2. 点击 "Eat" 按钮
3. 选择 "Scan Label"
4. 拍照或上传图片
5. 确认食物信息
6. 验证食物成功保存

#### 测试2：添加食物（手动输入）
1. 登录用户账号
2. 点击 "Eat" 按钮
3. 选择 "Enter Value"
4. 填写食物信息
5. 验证食物成功保存

#### 测试3：添加食物（描述）
1. 登录用户账号
2. 点击 "Eat" 按钮
3. 选择 "Describe"
4. 输入食物描述
5. 确认AI解析结果
6. 验证食物成功保存

### 3. 错误测试

#### 测试1：未认证用户
1. 登出用户
2. 尝试添加食物
3. 验证返回401错误

#### 测试2：无效令牌
1. 使用无效的访问令牌
2. 尝试添加食物
3. 验证返回401错误

## 预期结果

### 成功情况
- ✅ 食物数据成功保存到数据库
- ✅ 用户ID正确关联
- ✅ 前端显示成功消息
- ✅ 食物列表自动更新

### 错误情况
- ✅ 未认证用户收到401错误
- ✅ 无效令牌收到401错误
- ✅ 错误信息清晰明确

## 验证方法

### 1. 数据库验证
```sql
-- 检查食物记录
SELECT * FROM food WHERE user_id = 'your_user_id' ORDER BY created_at DESC LIMIT 5;
```

### 2. 日志验证
```bash
# 检查后端日志
tail -f backend/logs/app.log

# 检查认证日志
grep "认证" backend/logs/app.log
```

### 3. 网络请求验证
- 打开浏览器开发者工具
- 检查Network标签
- 验证Authorization头正确发送
- 验证响应状态码

## 故障排除

### 常见问题

1. **"缺少认证令牌"错误**
   - 检查前端是否正确获取访问令牌
   - 验证用户是否已登录

2. **"无效的认证令牌"错误**
   - 检查令牌是否过期
   - 验证令牌格式是否正确

3. **"只能删除自己的账号"错误**
   - 检查用户ID匹配
   - 验证认证中间件工作正常

### 调试步骤

1. 检查环境变量
2. 验证Supabase配置
3. 检查网络请求
4. 查看后端日志
5. 验证数据库权限

## 安全注意事项

- 确保服务端密钥安全存储
- 验证所有API端点都有适当的认证
- 检查RLS策略是否正确配置
- 确保用户只能访问自己的数据 