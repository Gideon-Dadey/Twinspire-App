/** Model-specific product photos (GSM Arena press-style renders). */

const GSMA = 'https://fdn2.gsmarena.com';

function bigpic(slug: string) {
  return `${GSMA}/vv/bigpic/${slug}.jpg`;
}

function pic(folder: string, slug: string, index: number | string) {
  return `${GSMA}/vv/pics/${folder}/${slug}-${index}.jpg`;
}

function imgs(name: string, urls: string[]) {
  return urls.map((url, i) => ({
    url,
    alt: i === 0 ? name : `${name} — view ${i + 1}`,
  }));
}

export const PHONE_IMAGES = {
  iphone16ProMax: imgs('iPhone 16 Pro Max', [
    bigpic('apple-iphone-16-pro-max'),
    pic('apple', 'apple-iphone-16-pro-max', 1),
    pic('apple', 'apple-iphone-16-pro-max', 2),
  ]),
  iphone16Pro: imgs('iPhone 16 Pro', [
    bigpic('apple-iphone-16-pro'),
    pic('apple', 'apple-iphone-16-pro', 1),
    pic('apple', 'apple-iphone-16-pro', 2),
  ]),
  iphone16: imgs('iPhone 16', [
    bigpic('apple-iphone-16'),
    pic('apple', 'apple-iphone-16', 1),
    pic('apple', 'apple-iphone-16', 2),
  ]),
  iphone16Plus: imgs('iPhone 16 Plus', [
    bigpic('apple-iphone-16-plus'),
    pic('apple', 'apple-iphone-16-plus', 1),
    pic('apple', 'apple-iphone-16-plus', 2),
  ]),
  iphone15: imgs('iPhone 15', [
    bigpic('apple-iphone-15'),
    pic('apple', 'apple-iphone-15', 1),
    pic('apple', 'apple-iphone-15', 2),
  ]),
  iphoneSe2024: imgs('iPhone SE (2024)', [
    bigpic('apple-iphone-se-2022'),
    pic('apple', 'apple-iphone-se-2022', 1),
    pic('apple', 'apple-iphone-se-2022', 2),
  ]),
  galaxyS25Ultra: imgs('Samsung Galaxy S25 Ultra', [
    bigpic('samsung-galaxy-s25-ultra-sm-s938'),
    pic('samsung', 'samsung-galaxy-s25-ultra-sm-s938', 1),
    pic('samsung', 'samsung-galaxy-s25-ultra-sm-s938', 2),
  ]),
  galaxyS25Plus: imgs('Samsung Galaxy S25+', [
    bigpic('samsung-galaxy-s25-plus-sm-s936'),
    pic('samsung', 'samsung-galaxy-s25-plus-sm-s936', 1),
    pic('samsung', 'samsung-galaxy-s25-plus-sm-s936', 2),
  ]),
  galaxyS25: imgs('Samsung Galaxy S25', [
    bigpic('samsung-galaxy-s25-sm-s931'),
    pic('samsung', 'samsung-galaxy-s25-sm-s931', 1),
    pic('samsung', 'samsung-galaxy-s25-sm-s931', 2),
  ]),
  galaxyZFold6: imgs('Samsung Galaxy Z Fold 6', [
    bigpic('samsung-galaxy-z-fold6'),
    pic('samsung', 'samsung-galaxy-z-fold6', 1),
    pic('samsung', 'samsung-galaxy-z-fold6', 2),
  ]),
  galaxyZFlip6: imgs('Samsung Galaxy Z Flip 6', [
    bigpic('samsung-galaxy-z-flip6'),
    pic('samsung', 'samsung-galaxy-z-flip6', 1),
    pic('samsung', 'samsung-galaxy-z-flip6', 2),
  ]),
  galaxyA55: imgs('Samsung Galaxy A55 5G', [
    bigpic('samsung-galaxy-a55'),
    pic('samsung', 'samsung-galaxy-a55', 1),
    pic('samsung', 'samsung-galaxy-a55', 2),
  ]),
  galaxyA35: imgs('Samsung Galaxy A35 5G', [
    bigpic('samsung-galaxy-a35'),
    pic('samsung', 'samsung-galaxy-a35', 1),
    pic('samsung', 'samsung-galaxy-a35', 2),
  ]),
  infinixGt20Pro: imgs('Infinix GT 20 Pro', [
    bigpic('infinix-gt-20-pro'),
    pic('infinix', 'infinix-gt-20-pro', 1),
    pic('infinix', 'infinix-gt-20-pro', 2),
  ]),
  infinixNote40Pro: imgs('Infinix Note 40 Pro', [
    bigpic('infinix-note-40-pro-5g-'),
    pic('infinix', 'infinix-note-40-pro-5g', 2),
    pic('infinix', 'infinix-note-40-pro-5g', 4),
  ]),
  infinixHot40Pro: imgs('Infinix Hot 40 Pro', [
    bigpic('infinix-hot-40-pro'),
    pic('infinix', 'infinix-hot-40-pro', 1),
    pic('infinix', 'infinix-hot-40-pro', 2),
  ]),
  infinixSmart8: imgs('Infinix Smart 8', [
    bigpic('infinix-smart-8-plus'),
    pic('infinix', 'infinix-smart-8-hd', 1),
    pic('infinix', 'infinix-smart-8-hd', 2),
  ]),
  tecnoCamon30Premier: imgs('Tecno Camon 30 Premier', [
    bigpic('tecno-camon-30-premier-5g'),
    pic('tecno', 'tecno-camon-30-premier-5g', 1),
    pic('tecno', 'tecno-camon-30-premier-5g', 2),
  ]),
  tecnoPova6Pro: imgs('Tecno Pova 6 Pro', [
    bigpic('tecno-pova-6-pro-11'),
    pic('tecno', 'tecno-pova-6-pro', '02'),
    pic('tecno', 'tecno-pova-6-pro', '03'),
  ]),
  tecnoSpark20Pro: imgs('Tecno Spark 20 Pro', [
    bigpic('tecno-spark-20-pro'),
    pic('tecno', 'tecno-spark-20-pro', 1),
    pic('tecno', 'tecno-spark-20-pro', 2),
  ]),
  tecnoPhantomVFold: imgs('Tecno Phantom V Fold', [
    bigpic('tecno-phantom-v-fold'),
    pic('tecno', 'tecno-phantom-v-fold', 1),
    pic('tecno', 'tecno-phantom-v-fold', 2),
  ]),
  honorMagic6Pro: imgs('Honor Magic 6 Pro', [
    bigpic('honor-magic6-pro'),
    pic('honor', 'honor-magic6-pro', 1),
    pic('honor', 'honor-magic6-pro', 2),
  ]),
  honor200Pro: imgs('Honor 200 Pro', [
    pic('honor', 'honor-200-pro', 1),
    pic('honor', 'honor-200-pro', 2),
  ]),
  honor90: imgs('Honor 90', [
    bigpic('honor-90'),
    pic('honor', 'honor-90', 1),
    pic('honor', 'honor-90', 2),
  ]),
  honorX9b: imgs('Honor X9b', [
    bigpic('honor-x9b'),
    pic('honor', 'honor-x9b', 1),
    pic('honor', 'honor-x9b', 2),
  ]),
} as const;
