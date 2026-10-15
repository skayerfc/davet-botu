// "Sunucuya Giriş Yap" butonuna tıklanınca davet kodu girilecek formu (modal) açar.
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const config = require('../config');
const { rolBul } = require('../utils/roller');

module.exports = {
  customId: 'giris_butonu',

  async execute(interaction) {
    const kimsesiz = await rolBul(interaction.guild, config.kimsesizRol);
    if (!kimsesiz) {
      return interaction.reply({
        content: '❌ Sistem yapılandırması eksik (başlangıç rolü bulunamadı). Lütfen yetkililere haber ver.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Sadece "Kimsesiz" rolündeki üyeler formu açabilir
    if (!interaction.member.roles.cache.has(kimsesiz.id)) {
      return interaction.reply({
        content: '✅ Zaten doğrulanmışsın, tekrar giriş yapmana gerek yok.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const kodKutusu = new TextInputBuilder()
      .setCustomId('kod_input')
      .setLabel('Davet Kodun')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('INV-XXXXXX')
      .setMaxLength(32)
      .setRequired(true);

    const modal = new ModalBuilder()
      .setCustomId('giris_modal') // modals/girisModal.js ile eşleşir
      .setTitle('Sunucuya Giriş')
      .addComponents(new ActionRowBuilder().addComponents(kodKutusu));

    return interaction.showModal(modal);
  },
};
