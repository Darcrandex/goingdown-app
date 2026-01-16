import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema', // 模型定义文件夹
  out: './drizzle', // 迁移文件输出目录
  dialect: 'postgresql', // 可选: "sqlite" | "mysql" | "postgresql"
  dbCredentials: {
    url: process.env.DATABASE_URL!, // (只能)从 .env 加载
  },
})
