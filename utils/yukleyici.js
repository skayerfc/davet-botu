// Bir klasördeki tüm .js dosyalarını yükleyip modül listesi olarak döndürür.
const fs = require('fs');
const path = require('path');

function klasorYukle(klasorAdi) {
  const dizin = path.join(__dirname, '..', klasorAdi);
  if (!fs.existsSync(dizin)) return [];

  return fs
    .readdirSync(dizin)
    .filter((dosya) => dosya.endsWith('.js'))
    .map((dosya) => require(path.join(dizin, dosya)));
}

module.exports = { klasorYukle };
