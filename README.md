# Davet & Doğrulama Botu (Discord.js v14)

Sunucuya yeni giren üyelere otomatik **Kimsesiz** rolü verir. Mevcut üyeler `/kod-olustur` ile 24 saat geçerli, tek kullanımlık davet kodu üretir. Yeni üye giriş kanalındaki butona tıklayıp kodu forma yazar; kod geçerliyse **Kimsesiz** rolü alınır, **Üye** rolü verilir ve log kanalına detaylı bir mesaj düşer.

## Akış

1. Üye katılır → `guildMemberAdd` → **Kimsesiz** rolü verilir
2. Mevcut üye `/kod-olustur` yazar → kod yalnızca ona gizli mesajla gelir (`INV-8X9K2L`)
3. Yeni üye giriş kanalındaki **Sunucuya Giriş Yap** butonuna tıklar → form açılır
4. Kodu yazar → bot doğrular → rolleri değiştirir → kodu pasifleştirir → log atar

Log mesajı:
> 📌 **[Davet Eden]** adlı kişi kod oluşturdu ve bu kod (`INV-8X9K2L`) **[Yeni Üye]**'ın sunucuya gelmesini sağladı.

Embed içinde davet eden, katılan üye, kullanılan kod, sunucuya katılma tarihi, doğrulama tarihi ve kodun oluşturulma tarihi de yer alır.

## Klasör Yapısı

```
├── index.js               # Botu başlatır, tüm dosyaları yükler
├── deploy-commands.js     # Slash komutlarını sunucuya kaydeder
├── config.js              # .env ayarları
├── database.js            # SQLite işlemleri (kod üret / kullan / temizle)
├── commands/
│   ├── kod-olustur.js     # /kod-olustur
│   ├── giris-paneli-kur.js# /giris-paneli-kur (yönetici, giriş butonunu gönderir)
│   └── kod-paneli-kur.js  # /kod-paneli-kur (yönetici, "Kod Oluştur" butonunu gönderir)
├── buttons/
│   ├── girisButonu.js     # Giriş butonuna tıklayınca modal açar
│   └── kodOlusturButonu.js# "Kod Oluştur" butonu
├── modals/girisModal.js   # Kod doğrulama, rol değişimi, log
├── events/                # ready, guildMemberAdd, interactionCreate
└── utils/                 # rol bulma, deneme sınırı, dosya yükleyici
```

## Kurulum

### 1) Discord Developer Portal
1. https://discord.com/developers/applications → **New Application**
2. **Bot** sekmesi → token'ı kopyala → **Privileged Gateway Intents** altında **SERVER MEMBERS INTENT**'i aç (zorunlu, yoksa bot giriş yapamaz)
3. **OAuth2 → URL Generator**: scope olarak `bot` ve `applications.commands`; bot izinleri: `Manage Roles`, `View Channels`, `Send Messages`, `Embed Links`
4. Oluşan linkle botu sunucuna ekle

### 2) Sunucu ayarları
- **Kimsesiz** ve **Üye** rollerini oluştur
- Sunucu Ayarları → Roller'de **botun rolünü, Kimsesiz ve Üye rollerinin üstüne sürükle** (aksi halde rol veremez)
- Giriş kanalı ve log kanalını hazırla. Giriş kanalında **Kimsesiz** rolü kanalı görebilmeli; diğer kanallar Kimsesiz'e kapalı olmalı
- Discord'da Gelişmiş Ayarlar'ı açıp kanal/rol/sunucu ID'lerini sağ tık → **ID'yi Kopyala** ile al

### 3) Projeyi çalıştır
Node.js 18+ gerekir (Node 22 ile test edildi).

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
# .env dosyasını doldur
npm run deploy           # slash komutlarını kaydet (bir kez)
npm start
```

### 4) Giriş butonunu gönder
Sunucuda bir yönetici olarak `/giris-paneli-kur` yaz. Buton `GIRIS_KANAL_ID` kanalına gönderilir. Bot yeniden başlasa bile buton çalışmaya devam eder, tekrar göndermene gerek yok.

### 5) Kod oluşturma kanalı (opsiyonel ama önerilir)
Üyelerin kod oluşturacağı ayrı bir kanal kullanmak için:
1. `.env` dosyasına kanalın ID'sini yaz: `KOD_KANAL_ID=...`
2. `npm run deploy` ve `npm start` komutlarını çalıştır (yeni komut kaydedilsin)
3. Yönetici olarak `/kod-paneli-kur` yaz. Kanala **Kod Oluştur** butonu gelir.

Bundan sonra üyeler butona tıklayarak ya da o kanalda `/kod-olustur` yazarak kod alır. `/kod-olustur` başka kanallarda çalışmaz. Kodu sadece oluşturan kişi görür. Kanalı **Kimsesiz** rolüne kapalı, **Üye** rolüne açık yapmalısın.

## .env Ayarları

| Değişken | Açıklama |
|---|---|
| `DISCORD_TOKEN` | Bot tokeni |
| `CLIENT_ID` | Uygulama (Application) ID |
| `GUILD_ID` | Sunucu ID |
| `GIRIS_KANAL_ID` | Butonun gönderileceği kanal |
| `LOG_KANAL_ID` | Logların atılacağı kanal |
| `KIMSESIZ_ROL_ID` / `KIMSESIZ_ROL_ADI` | Başlangıç rolü (ID boşsa isimle aranır, varsayılan `Kimsesiz`) |
| `UYE_ROL_ID` / `UYE_ROL_ADI` | Kalıcı üye rolü (ID boşsa isimle aranır, varsayılan `Üye`) |
| `KOD_KANAL_ID` | Opsiyonel: kod oluşturma kanalı. Doluysa `/kod-olustur` sadece orada çalışır, `/kod-paneli-kur` butonu oraya gönderir |
| `KOD_OLUSTURAN_ROL_ID` | Opsiyonel: doluysa kod oluşturma sadece bu rollere açık. Birden fazla rol için ID'leri virgülle ayır: `111...,222...` |
| `KISI_BASINA_MAKS_AKTIF_KOD` | Bir kişinin aynı anda geçerli kod sayısı (varsayılan 5) |

## Veri Saklama

Kodlar `data/davet.db` (SQLite, `better-sqlite3`) dosyasında tutulur, ayrıca kurulum gerekmez. Her kayıt: kod, oluşturan ID ve kullanıcı adı, oluşturma/bitiş zamanı, kullanıldı mı, kullanan kişi ve kullanım zamanı. Kullanılan kodlar silinmez, pasifleştirilir (geçmiş kaydı için). Süresi dolup kullanılmamış kodlar bir gün sonra otomatik temizlenir.

## Güvenlik Notları

- Kod doğrulaması tek bir SQL ifadesiyle (kontrol + pasifleştirme) yapılır; aynı kodu iki kişi aynı anda girse bile yalnızca biri kabul edilir
- Kodlar `crypto.randomInt` ile üretilir, karışan karakterler (0/O, 1/I) kullanılmaz
- Rol verme başarısız olursa (ör. bot rolü yetersiz) kod harcanmaz, tekrar kullanılabilir hale gelir
- 10 dakika içinde 5 hatalı kod denemesi yapan kişiye geçici bekleme uygulanır
- `Kimsesiz` rolündeki kişiler `/kod-olustur` kullanamaz
- Log mesajlarındaki etiketler bildirim göndermez

## Sık Karşılaşılan Sorunlar

- **`Used disallowed intents`**: Developer Portal'da Server Members Intent kapalı
- **`Missing Permissions` / rol verilmiyor**: Botun rolü Kimsesiz/Üye rollerinin altında ya da `Manage Roles` izni yok
- **Slash komutları görünmüyor**: `npm run deploy` çalıştırılmamış ya da `CLIENT_ID`/`GUILD_ID` yanlış
