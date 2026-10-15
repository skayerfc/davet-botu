// Slash komutlarını sunucuya kaydeder. Komut eklediğinde/değiştirdiğinde çalıştır:  npm run deploy
const { REST, Routes } = require('discord.js');
const config = require('./config');
const { klasorYukle } = require('./utils/yukleyici');

config.eksikKontrol(['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID']);

const komutlar = klasorYukle('commands').map((komut) => komut.data.toJSON());
const rest = new REST().setToken(config.token);

(async () => {
  try {
    console.log(`⏳ ${komutlar.length} slash komutu kaydediliyor...`);
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: komutlar });
    console.log('✅ Slash komutları başarıyla kaydedildi.');
  } catch (hata) {
    console.error('❌ Komutlar kaydedilemedi:', hata);
    process.exit(1);
  }
})();
