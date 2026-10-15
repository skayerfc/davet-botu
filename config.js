// Yapılandırma dosyası: .env değerlerini okur ve tek bir yerden dışa aktarır.
const path = require('path');
require('dotenv').config();

const env = process.env;

/** Zorunlu .env değişkenlerinden eksik olanları kontrol eder, varsa botu durdurur. */
function eksikKontrol(anahtarlar) {
  const eksikler = anahtarlar.filter((k) => !env[k] || !env[k].trim());
  if (eksikler.length) {
    console.error(`❌ .env dosyasında eksik değişkenler var: ${eksikler.join(', ')}`);
    process.exit(1);
  }
}

module.exports = {
  token: env.DISCORD_TOKEN,
  clientId: env.CLIENT_ID,
  guildId: env.GUILD_ID,
  girisKanalId: env.GIRIS_KANAL_ID,
  logKanalId: env.LOG_KANAL_ID,

  // Roller: ID verilmişse ID ile, verilmemişse isimle bulunur
  kimsesizRol: { id: env.KIMSESIZ_ROL_ID || null, ad: env.KIMSESIZ_ROL_ADI || 'Kimsesiz' },
  uyeRol: { id: env.UYE_ROL_ID || null, ad: env.UYE_ROL_ADI || 'Üye' },

  // Kod oluşturabilecek roller (virgülle ayrılmış birden fazla ID olabilir).
  // Boşsa "Kimsesiz" rolü olmayan herkes kod oluşturabilir.
  kodOlusturanRolIds: (env.KOD_OLUSTURAN_ROL_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),

  // Kod oluşturma kanalı (opsiyonel): doluysa /kod-olustur sadece bu kanalda çalışır,
  // /kod-paneli-kur butonu bu kanala gönderilir
  kodKanalId: env.KOD_KANAL_ID || null,

  // Davet kodu ayarları
  kod: {
    onek: 'INV-',
    uzunluk: 6,
    sureMs: 24 * 60 * 60 * 1000, // 24 saat
    kisiBasinaMaksAktif: Number(env.KISI_BASINA_MAKS_AKTIF_KOD) || 5,
  },

  // Veritabanı dosyası
  dbYolu: env.DB_YOLU || path.join(__dirname, 'data', 'davet.db'),

  eksikKontrol,
};
