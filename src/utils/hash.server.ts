import bcrypt from 'bcryptjs'

/**
 * 哈希内容
 * @param content 内容
 * @returns 哈希后的内容
 */
export const hashContent = async (content: string) => {
  const salt = await bcrypt.genSalt(10) // 生成盐
  return await bcrypt.hash(content, salt)
}

/**
 * 验证内容是否匹配哈希值
 * @param content 内容
 * @param storedHash 存储的哈希值
 * @returns 是否匹配
 */
export const verifyContent = async (content: string, storedHash: string) => {
  return await bcrypt.compare(content, storedHash)
}
