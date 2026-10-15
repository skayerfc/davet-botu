// Ana giriş dosyası: botu başlatır; komut, event, buton ve modal dosyalarını otomatik yükler.
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { suresiDolanlariTemizle } = require('./database');
const { klasorYukle } = require('./utils/yukleyici');

// .env eksiksiz mi?
config.eksikKontrol(['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'GIRIS_KANAL_ID', 'LOG_KANAL_ID']);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // guildMemberAdd için gerekli (Developer Portal'dan açılmalı)
  ],
});

// Yükleyicilerin koleksiyonları
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

for (const komut of klasorYukle('commands')) client.commands.set(komut.data.name, komut);
for (const buton of klasorYukle('buttons')) client.buttons.set(buton.customId, buton);
for (const modal of klasorYukle('modals')) client.modals.set(modal.customId, modal);

for (const olay of klasorYukle('events')) {
  if (olay.once) client.once(olay.name, (...args) => olay.execute(...args));
  else client.on(olay.name, (...args) => olay.execute(...args));
}

// Süresi dolmuş kodları açılışta ve her saat başı temizle
function temizlikYap() {
  try {
    const silinen = suresiDolanlariTemizle();
    if (silinen > 0) console.log(`🧹 ${silinen} süresi dolmuş kod temizlendi.`);
  } catch (hata) {
    console.error('Temizlik hatası:', hata.message);
  }
}
temizlikYap();
setInterval(temizlikYap, 60 * 60 * 1000);

process.on('unhandledRejection', (hata) => console.error('Yakalanmayan Promise hatası:', hata));

client.login(config.token);
