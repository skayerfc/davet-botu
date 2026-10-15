// /kod-paneli-kur → Kod kanalına sabit "Kod Üret" mesajını/butonunu gönderir.
// Sadece yöneticiler kullanabilir. Bir kez çalıştırmak yeterlidir.
const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kod-paneli-kur')
    .setDescription('Kod kanalına "Kod Üret" butonunu gönderir. (Yönetici)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    if (!config.kodKanalId) {
      return interaction.reply({
        content: '❌ .env dosyasında KOD_KANAL_ID tanımlı değil. Kod kanalının ID\'sini ekleyip botu yeniden başlat.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const kanal = await interaction.guild.channels.fetch(config.kodKanalId).catch(() => null);
    if (!kanal || !kanal.isTextBased()) {
      return interaction.reply({
        content: '❌ KOD_KANAL_ID ile belirtilen kanal bulunamadı veya bir metin kanalı değil.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎟️ Davet Kodu Oluştur')
      .setDescription(
        'Güvenilir birini özel çemberimize dahil etmek mi istiyorsun? Aşağıdaki `[ 🔑 Kod Üret ]` butonuna tıklayarak davet edeceğin kişi için özel bir anahtar oluşturabilirsin.\n\n' +
          '• **Süre & Kullanım:** Kod yalnızca 24 saat geçerlidir ve tek kullanımlıktır.\n' +
          '• **Gizlilik:** Ürettiğin kod yalnızca senin ekranına (gizli mesaj olarak) düşer, başkası göremez.'
      );

    const satir = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('kod_olustur_butonu') // buttons/kodOlusturButonu.js ile eşleşir
        .setLabel('Kod Üret')
        .setEmoji('🔑')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await kanal.send({ embeds: [embed], components: [satir] });
    } catch (hata) {
      return interaction.reply({
        content: `❌ Mesaj gönderilemedi (botun o kanalda mesaj gönderme yetkisi var mı?): ${hata.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({ content: `✅ Kod paneli ${kanal} kanalına gönderildi.`, flags: MessageFlags.Ephemeral });
  },
};
