// Bot hazır olduğunda çalışır.
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} olarak giriş yapıldı.`);
  },
};
