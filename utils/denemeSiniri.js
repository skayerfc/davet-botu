// Hatalı kod denemelerini sınırlar (kaba kuvvet / tahmin saldırılarına karşı basit koruma).
// Bellekte tutulur; bot yeniden başlarsa sıfırlanır.

const PENCERE_MS = 10 * 60 * 1000; // 10 dakika
const MAKS_HATALI_DENEME = 5;

const kayitlar = new Map(); // kullaniciId -> { sayi, bitis }

/** Kullanıcı engelliyse kalan süreyi (ms) döndürür, değilse 0. */
function engelKalanSure(kullaniciId) {
  const kayit = kayitlar.get(kullaniciId);
  if (!kayit) return 0;
  if (Date.now() > kayit.bitis) {
    kayitlar.delete(kullaniciId);
    return 0;
  }
  return kayit.sayi >= MAKS_HATALI_DENEME ? kayit.bitis - Date.now() : 0;
}

/** Hatalı denemeyi kaydeder. */
function hataliDenemeEkle(kullaniciId) {
  const simdi = Date.now();
  const kayit = kayitlar.get(kullaniciId);
  if (!kayit || simdi > kayit.bitis) {
    kayitlar.set(kullaniciId, { sayi: 1, bitis: simdi + PENCERE_MS });
  } else {
    kayit.sayi += 1;
  }
}

/** Başarılı girişten sonra sayacı sıfırlar. */
function sifirla(kullaniciId) {
  kayitlar.delete(kullaniciId);
}

module.exports = { engelKalanSure, hataliDenemeEkle, sifirla };
