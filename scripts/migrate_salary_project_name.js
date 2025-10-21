// Migration script to update old salary records in MongoDB to add missing projectName field
// Usage: node migrate_salary_project_name.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'webuild360'; // Change if your DB name is different

async function migrate() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const salaryCol = db.collection('salary_history');

    // Find all records missing projectName or with empty value
    const cursor = salaryCol.find({ $or: [ { projectName: { $exists: false } }, { projectName: '' }, { projectName: null } ] });
    let count = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      // Try to infer project name (if you have logic, add here)
      // For now, set to 'Unknown' or any default value
      const projectName = 'Unknown';
      await salaryCol.updateOne({ _id: doc._id }, { $set: { projectName } });
      count++;
    }
    console.log(`Migration complete. Updated ${count} records.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

migrate();
