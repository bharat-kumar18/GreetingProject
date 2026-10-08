const { Client } = require('pg');

async function checkPasswords() {
  const passwords = ['postgres', 'root', 'admin', 'password', ''];
  for (const pw of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: pw,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`Connected successfully with password: '${pw}'`);
      await client.end();
      return pw;
    } catch (e) {
      console.log(`Failed with password: '${pw}' - ${e.message}`);
    }
  }
  console.log('All passwords failed');
  return null;
}

checkPasswords();
