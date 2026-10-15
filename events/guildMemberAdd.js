// Sunucuya yeni bir üye katıldığında "Kimsesiz" başlangıç rolünü otomatik verir.
const { Events } = require('discord.js');
const config = require('../config');
const { rolBul } = require('../utils/roller');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) return; // botlara rol verme

    const kimsesiz = await rolBul(member.guild, config.kimsesizRol);
    if (!kimsesiz) {
      console.error(`⚠️ "${config.kimsesizRol.ad}" rolü bulunamadı, ${member.user.tag} kullanıcısına rol verilemedi.`);
      return;
    }

    try {
      await member.roles.add(kimsesiz, 'Yeni üye: başlangıç rolü');
      console.log(`👤 ${member.user.tag} katıldı → "${kimsesiz.name}" rolü verildi.`);
    } catch (hata) {
      console.error(`⚠️ ${member.user.tag} kullanıcısına rol verilemedi (botun rolü, "${kimsesiz.name}" rolünün üstünde olmalı):`, hata.message);
    }
  },
};
