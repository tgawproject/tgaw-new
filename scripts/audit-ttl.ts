import { MongoClient } from "mongodb"

const uri = process.env.DATABASE_URL!
if (!uri) throw new Error("DATABASE_URL missing")

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()
  const col = db.collection("AuditLog")
  // TTL index: documents expire when expiresAt <= now; null/ missing never expire
  // expireAfterSeconds 0 means expire exactly at expiresAt
  const indexes = await col.indexes()
  const hasTTL = indexes.some((idx) => idx.key && "expiresAt" in idx.key && idx.expireAfterSeconds === 0)
  if (hasTTL) {
    console.log("AuditLog TTL index already exists on expiresAt")
  } else {
    console.log("Creating TTL index on AuditLog.expiresAt (expireAfterSeconds: 0, tiered 90d / indefinite)...")
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true })
    console.log("Created TTL index")
  }
  // Helpful secondary indexes (already in Prisma but ensure)
  await col.createIndex({ createdAt: -1 }, { background: true }).catch(() => {})
  await col.createIndex({ action: 1 }, { background: true }).catch(() => {})
  await col.createIndex({ actorId: 1 }, { background: true }).catch(() => {})
  await col.createIndex({ targetType: 1, targetId: 1 }, { background: true }).catch(() => {})
  console.log("Done")
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
