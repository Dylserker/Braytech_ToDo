import mysql, { type PoolConnection } from 'mysql2/promise'
import { env } from './config/env.js'

export const database = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
})

export async function ensureBungieUser(
  membershipId: string,
  membershipType: number,
  displayName: string,
  profilePictureUrl: string | null,
) {
  const connection = await database.getConnection()
  try {
    await connection.beginTransaction()
    const [existingRows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT user_id FROM bungie_accounts WHERE bungie_membership_id = ? AND bungie_membership_type = ? FOR UPDATE',
      [membershipId, membershipType],
    )
    let userId: number
    if (existingRows.length > 0) {
      const existingUserId = existingRows[0]?.user_id
      if (typeof existingUserId !== 'number') throw new Error('Bungie account has no user record')
      userId = existingUserId
      await connection.execute(
        'UPDATE users SET display_name = ?, profile_picture_url = ? WHERE id = ?',
        [displayName, profilePictureUrl, userId],
      )
    } else {
      const [userResult] = await connection.execute<mysql.ResultSetHeader>(
        'INSERT INTO users (display_name, profile_picture_url) VALUES (?, ?)',
        [displayName, profilePictureUrl],
      )
      userId = userResult.insertId
      await connection.execute(
        'INSERT INTO bungie_accounts (user_id, bungie_membership_id, bungie_membership_type, bungie_display_name) VALUES (?, ?, ?, ?)',
        [userId, membershipId, membershipType, displayName],
      )
    }
    await connection.commit()
    return userId
  } catch (error) {
    await rollback(connection, error)
    throw error
  } finally {
    connection.release()
  }
}

async function rollback(connection: PoolConnection, originalError: unknown) {
  try {
    await connection.rollback()
  } catch (rollbackError) {
    console.error('Database rollback failed', { originalError, rollbackError })
  }
}
