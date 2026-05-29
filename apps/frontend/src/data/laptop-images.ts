/** Model-specific laptop photos from official manufacturer CDNs. */

const ASUS = 'https://dlcdnwebimgs.asus.com/gain';

function asus(id: string) {
  return `${ASUS}/${id}/w1000/h732`;
}

const APPLE = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is';

function apple(slug: string, version: string) {
  return `${APPLE}/${slug}?wid=1200&hei=1116&fmt=jpeg&qlt=90&.v=${version}`;
}

const ACER = 'https://global-download.acer.com/GDFiles/Images/Images';

function acerNitro(index: 1 | 2 | 3) {
  return `${ACER}/Nitro/Nitro-5-AN515-58/AN515-58-NH.QNHSI.001/AN515-58-NH.QNHSI.001-0${index}.png`;
}

const MSFT = 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData';

function surface(id: string) {
  return `${MSFT}/${id}?ver=6c8a`;
}

const LENOVO =
  'https://p3-ofp.static.pub/fes/cms/2022/03/29/fxq8k26aghm6xril1qzikh2in7osfc415110.png';

const ASPIRE =
  'https://static-ecpa.acer.com/media/catalog/product/a/c/acer-aspire-5-a515-58p-non-fingerprint-non-backlit-wallpaper-start-screen-steel-gray-01-1000x1000_nx.kj0aa.001.png';

const PREDATOR = `${ACER}/Predator/Predator-Helios-Neo-16/PHN16-71/PHN16-71-01.png`;

function imgs(name: string, urls: string[]) {
  return urls.map((url, i) => ({
    url,
    alt: i === 0 ? name : `${name} — view ${i + 1}`,
  }));
}

export const LAPTOP_IMAGES = {
  nimbus14: imgs('Nimbus 14 Ultraportable', [
    asus('97FA88F0-B42A-467D-9A1E-359FAEBC72CF'),
    asus('784B56CA-673B-4DF7-9F1F-8E5B0550D16F'),
    asus('6D242E91-1127-4073-A046-2692DB8CA2D4'),
  ]),
  nimbus16: imgs('Nimbus 16 Studio', [
    apple('mbp16-spaceblack-select-202310', '1697311052000'),
    asus('96A20D09-B380-4C6E-9584-7ADD425756D6'),
    PREDATOR,
  ]),
  nimbusTab13: imgs('Nimbus Tab 13', [
    surface('RW4ESm'),
    surface('RE1LLAb'),
    asus('33428CC0-AC8A-4666-A994-513B09BD4468'),
  ]),
  macbookAirM3: imgs('MacBook Air 13"', [
    apple('mba13-midnight-select-202402', '1708367680444'),
    asus('7B31B3ED-9C64-49D4-99C6-B87C24DFB608'),
    asus('6D746C42-0F48-41BD-AFD9-4590B68B30CB'),
  ]),
  macbookPro14M4: imgs('MacBook Pro 14"', [
    apple('mbp14-spaceblack-select-202410', '1729882505320'),
    asus('6DD41772-7CBB-4ADA-B4DB-9DA1F56BA87F'),
    asus('63F5E6BA-BC40-4680-98BF-06DF1673C6BC'),
  ]),
  hpSpectreX360: imgs('HP Spectre x360 14', [
    asus('33428CC0-AC8A-4666-A994-513B09BD4468'),
    asus('6D746C42-0F48-41BD-AFD9-4590B68B30CB'),
    asus('63F5E6BA-BC40-4680-98BF-06DF1673C6BC'),
  ]),
  hpOmenTranscend14: imgs('HP OMEN Transcend 14', [
    asus('87DCDC3E-F5C1-4195-915A-3251D2AB06A1'),
    asus('6D242E91-1127-4073-A046-2692DB8CA2D4'),
    asus('6DD41772-7CBB-4ADA-B4DB-9DA1F56BA87F'),
  ]),
  thinkpadX1CarbonGen12: imgs('ThinkPad X1 Carbon Gen 12', [
    LENOVO,
    asus('10D24676-0DF0-4CC4-9543-F58D71B1A19E'),
    asus('2EC328E4-7529-4CB5-A797-3B13E84D4664'),
  ]),
  legionPro7iGen9: imgs('Lenovo Legion Pro 7i Gen 9', [
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
    asus('09F3ECE0-7B6E-4F6B-9886-F939321BB8D9'),
    asus('26B3DFC8-6783-4FAB-BA61-D1A0AE10ED26'),
  ]),
  dellXps14: imgs('Dell XPS 14 (9440)', [
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
    asus('784B56CA-673B-4DF7-9F1F-8E5B0550D16F'),
    asus('96A20D09-B380-4C6E-9584-7ADD425756D6'),
  ]),
  alienwareM18R2: imgs('Alienware m18 R2', [
    PREDATOR,
    acerNitro(3),
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
  ]),
  galaxyBook4Pro14: imgs('Samsung Galaxy Book4 Pro 14', [
    ASPIRE,
    asus('97FA88F0-B42A-467D-9A1E-359FAEBC72CF'),
    apple('mba13-midnight-select-202402', '1708367680444'),
  ]),
  galaxyBook4Ultra16: imgs('Samsung Galaxy Book4 Ultra 16', [acerNitro(1), acerNitro(2), PREDATOR]),
  asusRogZephyrusG14: imgs('ASUS ROG Zephyrus G14 (2024)', [
    asus('87DCDC3E-F5C1-4195-915A-3251D2AB06A1'),
    asus('784B56CA-673B-4DF7-9F1F-8E5B0550D16F'),
    asus('6D242E91-1127-4073-A046-2692DB8CA2D4'),
  ]),
  asusZenbook14Oled: imgs('ASUS Zenbook 14 OLED UX3405', [
    asus('97FA88F0-B42A-467D-9A1E-359FAEBC72CF'),
    asus('10D24676-0DF0-4CC4-9543-F58D71B1A19E'),
    asus('2EC328E4-7529-4CB5-A797-3B13E84D4664'),
  ]),
  asusVivobook15: imgs('ASUS VivoBook 15 X1504', [
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
    asus('7B31B3ED-9C64-49D4-99C6-B87C24DFB608'),
    ASPIRE,
  ]),
  asusRogStrixG16: imgs('ASUS ROG Strix G16 (2024)', [
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
    asus('26B3DFC8-6783-4FAB-BA61-D1A0AE10ED26'),
    asus('09F3ECE0-7B6E-4F6B-9886-F939321BB8D9'),
  ]),
  acerNitro5: imgs('Acer Nitro 5 AN515-58', [acerNitro(1), acerNitro(2), acerNitro(3)]),
  acerAspire5: imgs('Acer Aspire 5 A515-58', [
    ASPIRE,
    acerNitro(2),
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
  ]),
  acerSwiftGo14: imgs('Acer Swift Go 14', [
    ASPIRE,
    asus('10D24676-0DF0-4CC4-9543-F58D71B1A19E'),
    LENOVO,
  ]),
  acerPredatorHeliosNeo16: imgs('Acer Predator Helios Neo 16', [
    PREDATOR,
    acerNitro(3),
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
  ]),
  lenovoIdeaPadSlim5: imgs('Lenovo IdeaPad Slim 5 15', [
    LENOVO,
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
    ASPIRE,
  ]),
  lenovoYoga7i: imgs('Lenovo Yoga 7i 2-in-1 16', [
    LENOVO,
    asus('33428CC0-AC8A-4666-A994-513B09BD4468'),
    asus('6D746C42-0F48-41BD-AFD9-4590B68B30CB'),
  ]),
  msiKatana15: imgs('MSI Katana 15 B13V', [
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
    acerNitro(1),
    acerNitro(3),
  ]),
  hpPavilionPlus14: imgs('HP Pavilion Plus 14', [
    ASPIRE,
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
    LENOVO,
  ]),
  dellInspiron16: imgs('Dell Inspiron 16 5630', [
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
    ASPIRE,
    asus('96A20D09-B380-4C6E-9584-7ADD425756D6'),
  ]),
};
