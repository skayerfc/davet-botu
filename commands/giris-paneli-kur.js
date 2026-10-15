// /giris-paneli-kur → Giriş kanalına sabit "Kodu Onayla" mesajını/butonunu gönderir.
// Sadece yöneticiler kullanabilir. Bir kez çalıştırmak yeterlidir; buton bot yeniden başlasa da çalışmaya devam eder.
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
    .setName('giris-paneli-kur')
    .setDescription('Giriş kanalına "Kodu Onayla" butonunu gönderir. (Yönetici)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    const kanal = await interaction.guild.channels.fetch(config.girisKanalId).catch(() => null);
    if (!kanal || !kanal.isTextBased()) {
      return interaction.reply({
        content: '❌ GIRIS_KANAL_ID ile belirtilen kanal bulunamadı veya bir metin kanalı değil.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🔑 Sunucuya Giriş')
      .setDescription(
        'Burası herkese açık bir topluluk değildir. İçeriye yalnızca mevcut üyelerimizin referansı ve özel erişim anahtarı ile giriş yapılabilir.\n\n' +
          '**Giriş Adımları:**\n' +
          '1. Seni sunucuya referans gösteren kişiden özel doğrulama kodunu temin et.\n' +
          '2. Aşağıdaki `[ 🔑 Kodu Onayla ]` butonuna tıkla.\n' +
          '3. Kodunu açılan forma eksiksiz gir.\n\n' +
          'Doğrulama tamamlandığında "Kimsesiz" statün kaldırılacak ve özel kanallara erişim yetkin tanımlanacaktır.'
      );

    const satir = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giris_butonu') // buttons/girisButonu.js ile eşleşir
        .setLabel('Kodu Onayla')
        .setEmoji('🔑')
        .setStyle(ButtonStyle.Success)
    );

    try {
      await kanal.send({ embeds: [embed], components: [satir] });
    } catch (hata) {
      return interaction.reply({
        content: `❌ Mesaj gönderilemedi (botun o kanalda mesaj gönderme yetkisi var mı?): ${hata.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({ content: `✅ Giriş paneli ${kanal} kanalına gönderildi.`, flags: MessageFlags.Ephemeral });
  },
};
