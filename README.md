# nextjs-auth-db-template

简单的 Next.js 项目模板，包含用户认证和数据库功能。

技术栈

- Next.js 16
- TypeScript
- React
- Tailwind CSS
- Drizzle ORM
- Neon Database
- Resend

## drizzle 数据库

1. 配置 drizzle.config.ts
2. 运行 `npx drizzle-kit generate` 生成迁移文件
3. 运行 `npx drizzle-kit migrate` 迁移数据库

依赖包 `"drizzle-orm": "0.44.6"` 为指定的版本, 大于该版本目前发现存在类型错误的问题

## resend 邮箱配置

部署项目时需要添加业务域名, 通过[resend 域名配置](https://resend.com/domains)添加. 并且只能使用私有域名, `vercel` 等公共域名无法添加.
