// Rol bulma yardımcısı: önce ID'ye, ID yoksa isme göre rolü bulur.

/**
 * @param {import('discord.js').Guild} guild
 * @param {{id: string|null, ad: string}} rolAyari config içindeki rol ayarı
 * @returns {Promise<import('discord.js').Role|null>}
 */
async function rolBul(guild, rolAyari) {
  const { id, ad } = rolAyari;

  if (id) {
    return guild.roles.cache.get(id) ?? (await guild.roles.fetch(id).catch(() => null));
  }

  const hedef = ad.toLocaleLowerCase('tr');
  const bul = () => guild.roles.cache.find((r) => r.name.toLocaleLowerCase('tr') === hedef);

  // Önce önbellekte ara (hızlı), yoksa rolleri çekip tekrar dene
  let rol = bul();
  if (!rol) {
    await guild.roles.fetch().catch(() => null);
    rol = bul();
  }
  return rol ?? null;
}

module.exports = { rolBul };
