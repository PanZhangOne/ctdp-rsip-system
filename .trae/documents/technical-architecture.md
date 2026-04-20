## 1. 架构设计
```mermaid
graph TD
    A["前端 (React + Vite)"] --> B["状态管理 (Zustand)"]
    A --> C["路由 (React Router)"]
    B --> D["本地存储 (localforage / IndexedDB)"]
    A --> E["PWA / 本地通知"]
```

## 2. 技术栈说明
- 前端框架：React@18 + TypeScript + Vite
- 样式方案：Tailwind CSS + Lucide React (图标)
- 状态管理：Zustand
- 本地存储：localforage (封装 IndexedDB)
- 拖拽/树状图：React Flow (用于定式树)
- 组件库辅助：Radix UI 原语或纯手写 Tailwind，配合 Framer Motion (动效)
- 初始化工具：vite-init
- 动画库：Framer Motion

## 3. 路由定义
| 路由 | 用途 |
|-------|---------|
| / | 专注页 (Tab 1: Focus) - 默认首页 |
| /system | 体系页 (Tab 2: System) |
| /policies | 国策页 (Tab 3: Policies) |
| /profile | 我的页 (Tab 4: Profile) |

## 4. 数据模型 (Data Model)
### 4.1 实体关系图
```mermaid
erDiagram
    "专注会话 (Session)" {
        string id
        number startTime
        number endTime
        number plannedDuration
        string chainId
        string endType
    }
    "时延事件 (Urge)" {
        string id
        string sessionId
        number intensity
        string delayLevel
    }
    "国策 (Policy)" {
        string id
        string title
        string condition_if
        string action_then
    }
    "树节点 (TreeNode)" {
        string id
        string policyId
        string parentId
        string status
    }
    "专注会话 (Session)" ||--o{ "时延事件 (Urge)" : "包含"
    "国策 (Policy)" ||--o{ "树节点 (TreeNode)" : "应用在"
```

## 5. 本地存储方案
使用 localforage 存储 JSON 对象：
- `sessions`: 专注记录列表
- `urges`: 冲动时延记录列表
- `policies`: 自定义与内置国策
- `tree_nodes`: 国策树节点状态及层级关系
- `settings`: 用户设置及链条规则
