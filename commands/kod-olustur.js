// /kod-olustur → 24 saat geçerli, tek kullanımlık davet kodu üretir.
// Kod sadece komutu kullanan kişiye gizli (ephemeral) mesajla gönderilir.
// KOD_KANAL_ID ayarlıysa komut sadece o kanalda çalışır.
const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const config = require('../config');
const { kodOlusturVeYanitla } = require('../utils/kodYanit');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kod-olustur')
    .setDescription('Sunucuya davet etmek için 24 saat geçerli, tek kullanımlık bir kod oluşturur.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    // Kod kanalı belirlenmişse sadece orada kullanılabilir
    if (config.kodKanalId && interaction.channelId !== config.kodKanalId) {
      return interaction.reply({
        content: `❌ Bu komutu sadece <#${config.kodKanalId}> kanalında kullanabilirsin.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return kodOlusturVeYanitla(interaction);
  },
};
