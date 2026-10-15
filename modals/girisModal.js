// Giriş formu gönderilince: kodu doğrular, rolleri değiştirir, kodu pasifleştirir ve log atar.
const { EmbedBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const { kodKullan, kodGeriAc } = require('../database');
const { rolBul } = require('../utils/roller');
const { engelKalanSure, hataliDenemeEkle, sifirla } = require('../utils/denemeSiniri');

const unix = (ms) => Math.floor(ms / 1000);

module.exports = {
  customId: 'giris_modal',

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const { guild, member, user } = interaction;

    // --- Çok fazla hatalı deneme yapıldıysa geçici engel ---
    const engel = engelKalanSure(user.id);
    if (engel > 0) {
      return interaction.editReply(
        `⏳ Çok fazla hatalı deneme yaptın. Lütfen **${Math.ceil(engel / 60000)} dakika** sonra tekrar dene.`
      );
    }

    // --- Roller mevcut mu? ---
    const kimsesizRol = await rolBul(guild, config.kimsesizRol);
    const uyeRol = await rolBul(guild, config.uyeRol);
    if (!kimsesizRol || !uyeRol) {
      console.error(`⚠️ Rol bulunamadı → Kimsesiz: ${!!kimsesizRol}, Üye: ${!!uyeRol}`);
      return interaction.editReply('❌ Sistem yapılandırması eksik (roller bulunamadı). Lütfen yetkililere haber ver.');
    }

    // --- Kullanıcı gerçekten "Kimsesiz" rolünde mi? ---
    if (!member.roles.cache.has(kimsesizRol.id)) {
      return interaction.editReply('✅ Zaten doğrulanmışsın.');
    }

    // --- Girilen kodu temizle (boşlukları at, büyük harfe çevir) ---
    const girilenKod = interaction.fields.getTextInputValue('kod_input').replace(/\s+/g, '').toUpperCase();

    // --- Kodu atomik olarak doğrula + pasifleştir ---
    const kayit = kodKullan(girilenKod, user.id, user.username);
    if (!kayit) {
      hataliDenemeEkle(user.id);
      return interaction.editReply('❌ Geçersiz veya süresi dolmuş kod!');
    }

    // --- Rol değişimi: önce Üye ver, sonra Kimsesiz al (kullanıcı hiç rolsüz kalmasın) ---
    try {
      await member.roles.add(uyeRol, `Davet kodu doğrulandı: ${kayit.kod}`);
      await member.roles.remove(kimsesizRol, `Davet kodu doğrulandı: ${kayit.kod}`);
    } catch (hata) {
      console.error('⚠️ Rol değişimi başarısız:', hata.message);
      kodGeriAc(kayit.kod); // kod boşa harcanmasın
      return interaction.editReply(
        '❌ Rolün verilirken bir hata oluştu, kodun harcanmadı. Lütfen yetkililere haber ver (botun rolü, "Kimsesiz" ve "Üye" rollerinin üstünde olmalı).'
      );
    }

    sifirla(user.id);

    // --- Log kanalına bilgilendirme embed'i gönder ---
    await logGonder(interaction, kayit);

    return interaction.editReply(`🎉 Doğrulama başarılı! Hoş geldin, artık **${uyeRol.name}** rolüne sahipsin.`);
  },
};

/** Log kanalına detaylı embed gönderir. Hata olsa bile kullanıcının girişini etkilemez. */
async function logGonder(interaction, kayit) {
  try {
    const { guild, member, user } = interaction;
    const kanal = await guild.channels.fetch(config.logKanalId).catch(() => null);
    if (!kanal || !kanal.isTextBased()) {
      console.error('⚠️ LOG_KANAL_ID ile belirtilen kanal bulunamadı.');
      return;
    }

    const katilmaZamani = member.joinedTimestamp ?? Date.now();
    const dogrulamaZamani = kayit.kullanim_zamani;

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🎟️ Yeni Üye Doğrulandı')
      .setDescription(
        `📌 **${kayit.olusturan_ad}** adlı kişi kod oluşturdu ve bu kod (\`${kayit.kod}\`) **${user.username}**'ın sunucuya gelmesini sağladı.`
      )
      .addFields(
        { name: '👤 Davet Eden', value: `<@${kayit.olusturan_id}>\n\`${kayit.olusturan_ad}\``, inline: true },
        { name: '🆕 Katılan Üye', value: `<@${user.id}>\n\`${user.username}\``, inline: true },
        { name: '🔑 Kullanılan Kod', value: `\`${kayit.kod}\``, inline: true },
        { name: '📅 Sunucuya Katılma Tarihi', value: `<t:${unix(katilmaZamani)}:F>`, inline: false },
        { name: '✅ Doğrulama Tarihi', value: `<t:${unix(dogrulamaZamani)}:F>`, inline: false },
        { name: '🕒 Kodun Oluşturulma Tarihi', value: `<t:${unix(kayit.olusturma_zamani)}:F>`, inline: false }
      )
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `Kullanıcı ID: ${user.id}` })
      .setTimestamp();

    // allowedMentions boş: embed içindeki etiketler kimseye bildirim göndermez
    await kanal.send({ embeds: [embed], allowedMentions: { parse: [] } });
  } catch (hata) {
    console.error('⚠️ Log mesajı gönderilemedi:', hata.message);
  }
}
