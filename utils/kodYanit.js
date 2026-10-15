// Kod oluşturma işleminin ortak mantığı.
// Hem /kod-olustur komutu hem de "Kod Oluştur" butonu bu fonksiyonu kullanır.
const { EmbedBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const { kodOlustur, aktifKodSayisi } = require('../database');
const { rolBul } = require('./roller');

/**
 * Kodu oluşturur ve SADECE etkileşimi başlatan kişiye gizli (ephemeral) mesajla gönderir.
 * @param {import('discord.js').ChatInputCommandInteraction | import('discord.js').ButtonInteraction} interaction
 */
async function kodOlusturVeYanitla(interaction) {
  const ephemeral = MessageFlags.Ephemeral;
  const member = interaction.member;

  // 1) "Kimsesiz" rolündeki (henüz doğrulanmamış) kişiler kod oluşturamaz
  const kimsesiz = await rolBul(interaction.guild, config.kimsesizRol);
  if (kimsesiz && member.roles.cache.has(kimsesiz.id)) {
    return interaction.reply({
      content: '❌ Önce sunucuya giriş yapmalısın, doğrulanmamış üyeler kod oluşturamaz.',
      flags: ephemeral,
    });
  }

  // 2) Opsiyonel: sadece belirli rollerden birine sahip olanlar kod oluşturabilsin
  const izinliRoller = config.kodOlusturanRolIds;
  if (izinliRoller.length > 0 && !izinliRoller.some((id) => member.roles.cache.has(id))) {
    return interaction.reply({
      content: '❌ Kod oluşturmak için gerekli role sahip değilsin.',
      flags: ephemeral,
    });
  }

  // 3) Kişi başına aynı anda geçerli kod sayısı sınırı (kötüye kullanımı önler)
  const aktif = aktifKodSayisi(interaction.user.id);
  if (aktif >= config.kod.kisiBasinaMaksAktif) {
    return interaction.reply({
      content: `❌ Aynı anda en fazla **${config.kod.kisiBasinaMaksAktif}** geçerli kodun olabilir. Mevcut kodlarından biri kullanılınca ya da süresi dolunca yenisini oluşturabilirsin.`,
      flags: ephemeral,
    });
  }

  // 4) Kodu oluştur ve veritabanına kaydet (oluşturan ID + kullanıcı adı ile)
  const kayit = kodOlustur(interaction.user.id, interaction.user.username);
  const bitisUnix = Math.floor(kayit.bitis_zamani / 1000);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎟️ Davet Kodun Hazır')
    .setDescription(`\`\`\`${kayit.kod}\`\`\``)
    .addFields(
      { name: '⏳ Geçerlilik', value: `<t:${bitisUnix}:R> sona erer (<t:${bitisUnix}:f>)` },
      { name: '☝️ Kullanım', value: 'Tek kullanımlıktır. Davet ettiğin kişiye ilet; giriş kanalındaki butona tıklayıp bu kodu yazması yeterli.' }
    )
    .setFooter({ text: 'Bu mesajı sadece sen görebilirsin.' });

  return interaction.reply({ embeds: [embed], flags: ephemeral });
}

module.exports = { kodOlusturVeYanitla };
