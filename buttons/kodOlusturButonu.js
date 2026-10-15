// Kod kanalındaki "Kod Oluştur" butonuna tıklanınca kişiye özel davet kodu üretir.
const { kodOlusturVeYanitla } = require('../utils/kodYanit');

module.exports = {
  customId: 'kod_olustur_butonu',

  async execute(interaction) {
    return kodOlusturVeYanitla(interaction);
  },
};
