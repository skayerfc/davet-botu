// Tüm etkileşimleri (slash komut, buton, modal) ilgili işleyiciye yönlendirir.
const { Events, MessageFlags } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const { client } = interaction;
    let isleyici;

    if (interaction.isChatInputCommand()) {
      isleyici = client.commands.get(interaction.commandName);
    } else if (interaction.isButton()) {
      isleyici = client.buttons.get(interaction.customId);
    } else if (interaction.isModalSubmit()) {
      isleyici = client.modals.get(interaction.customId);
    }

    if (!isleyici) return;

    try {
      await isleyici.execute(interaction);
    } catch (hata) {
      console.error('❌ Etkileşim hatası:', hata);
      const mesaj = { content: '❌ Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar dene.', flags: MessageFlags.Ephemeral };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(mesaj).catch(() => {});
      } else {
        await interaction.reply(mesaj).catch(() => {});
      }
    }
  },
};
