// Veritabanı katmanı (SQLite - better-sqlite3).
// Tek dosyada, kurulum gerektirmeden hızlı ve güvenilir veri saklama sağlar.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const config = require('./config');

// data klasörü yoksa oluştur
fs.mkdirSync(path.dirname(config.dbYolu), { recursive: true });

const db = new Database(config.dbYolu);
db.pragma('journal_mode = WAL');

// Tablo yoksa oluştur
db.exec(`
  CREATE TABLE IF NOT EXISTS kodlar (
    kod              TEXT PRIMARY KEY,
    olusturan_id     TEXT NOT NULL,
    olusturan_ad     TEXT NOT NULL,
    olusturma_zamani INTEGER NOT NULL,
    bitis_zamani     INTEGER NOT NULL,
    kullanildi       INTEGER NOT NULL DEFAULT 0,
    kullanan_id      TEXT,
    kullanan_ad      TEXT,
    kullanim_zamani  INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_kodlar_olusturan
    ON kodlar (olusturan_id, kullanildi, bitis_zamani);
`);

// Karışıklık yaratan karakterler (0, O, 1, I) bilerek çıkarıldı
const KARAKTERLER = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Kriptografik olarak güvenli rastgele kod üretir. Örn: INV-8X9K2L */
function kodUret() {
  let govde = '';
  for (let i = 0; i < config.kod.uzunluk; i++) {
    govde += KARAKTERLER[crypto.randomInt(KARAKTERLER.length)];
  }
  return config.kod.onek + govde;
}

const ekle = db.prepare(`
  INSERT INTO kodlar (kod, olusturan_id, olusturan_ad, olusturma_zamani, bitis_zamani)
  VALUES (@kod, @olusturan_id, @olusturan_ad, @olusturma_zamani, @bitis_zamani)
`);

/** Yeni, benzersiz ve 24 saat geçerli bir kod oluşturup kaydeder. */
function kodOlustur(olusturanId, olusturanAd) {
  const simdi = Date.now();
  for (let deneme = 0; deneme < 10; deneme++) {
    const kayit = {
      kod: kodUret(),
      olusturan_id: olusturanId,
      olusturan_ad: olusturanAd,
      olusturma_zamani: simdi,
      bitis_zamani: simdi + config.kod.sureMs,
    };
    try {
      ekle.run(kayit);
      return kayit;
    } catch (hata) {
      // Çok düşük ihtimalle kod çakışırsa yeniden dene
      if (hata.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw hata;
    }
  }
  throw new Error('Benzersiz kod üretilemedi.');
}

const aktifSayisiSorgu = db.prepare(`
  SELECT COUNT(*) AS sayi FROM kodlar
  WHERE olusturan_id = ? AND kullanildi = 0 AND bitis_zamani > ?
`);

/** Bir kişinin kullanılmamış ve süresi dolmamış kod sayısı. */
function aktifKodSayisi(olusturanId) {
  return aktifSayisiSorgu.get(olusturanId, Date.now()).sayi;
}

// Tek SQL ifadesiyle "kontrol + pasifleştirme" yapılır (atomik).
// Böylece aynı kodu iki kişi aynı anda göndermeye çalışsa bile sadece biri başarılı olur.
const kullanSorgu = db.prepare(`
  UPDATE kodlar
  SET kullanildi = 1, kullanan_id = @kullanan_id, kullanan_ad = @kullanan_ad, kullanim_zamani = @simdi
  WHERE kod = @kod AND kullanildi = 0 AND bitis_zamani > @simdi
  RETURNING *
`);

/**
 * Kod geçerliyse kullanılmış olarak işaretler ve kaydı döndürür.
 * Geçersiz / kullanılmış / süresi dolmuşsa null döner.
 */
function kodKullan(kod, kullananId, kullananAd) {
  return (
    kullanSorgu.get({ kod, kullanan_id: kullananId, kullanan_ad: kullananAd, simdi: Date.now() }) ||
    null
  );
}

const geriAcSorgu = db.prepare(`
  UPDATE kodlar
  SET kullanildi = 0, kullanan_id = NULL, kullanan_ad = NULL, kullanim_zamani = NULL
  WHERE kod = ?
`);

/** Rol verme işlemi başarısız olursa kodu tekrar kullanılabilir hale getirir. */
function kodGeriAc(kod) {
  geriAcSorgu.run(kod);
}

const temizleSorgu = db.prepare(`
  DELETE FROM kodlar WHERE kullanildi = 0 AND bitis_zamani < ?
`);

/** Süresi dolmuş ve kullanılmamış kodları (1 gün tolerans ile) siler. */
function suresiDolanlariTemizle() {
  return temizleSorgu.run(Date.now() - 24 * 60 * 60 * 1000).changes;
}

module.exports = {
  db,
  kodUret,
  kodOlustur,
  aktifKodSayisi,
  kodKullan,
  kodGeriAc,
  suresiDolanlariTemizle,
};
