/** Model-specific accessory photos from official manufacturer CDNs. */

const APPLE = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is';
const GSMA = 'https://fdn2.gsmarena.com';
const SAMSUNG = 'https://images.samsung.com/is/image/samsung';
const LOGITECH = 'https://resource.logitech.com/content/dam/logitech/en/products';

function apple(sku: string) {
  return `${APPLE}/${sku}?wid=1144&hei=1144&fmt=jpeg&qlt=90`;
}

function gsmBigpic(slug: string) {
  return `${GSMA}/vv/bigpic/${slug}.jpg`;
}

function gsmPic(folder: string, slug: string, index: number) {
  return `${GSMA}/vv/pics/${folder}/${slug}-${index}.jpg`;
}

function samsungAsset(path: string, transform = '$720_N_PNG$') {
  return `${SAMSUNG}/${path}?${transform}`;
}

function lg(hash: string, file: string) {
  return `https://media.us.lg.com/m/${hash}/${file}`;
}

function imgs(name: string, urls: string[]) {
  return urls.map((url, i) => ({
    url,
    alt: i === 0 ? name : `${name} — view ${i + 1}`,
  }));
}

export const ACCESSORY_IMAGES = {
  airPodsPro2: imgs('Apple AirPods Pro (2nd generation)', [
    apple('MTJV3'),
    apple('MV7N2'),
    apple('MX542'),
  ]),
  airPods4: imgs('Apple AirPods 4', [apple('MX542'), apple('MTJV3'), apple('MV7N2')]),
  magicKeyboard: imgs('Apple Magic Keyboard with Touch ID', [
    apple('MK2E3'),
    apple('MK2E3'),
    apple('MQD83'),
  ]),
  magicMouse: imgs('Apple Magic Mouse (USB-C)', [apple('MQD83'), apple('MQD83'), apple('MK2E3')]),
  magicTrackpad: imgs('Apple Magic Trackpad (USB-C)', [
    apple('MX2D3'),
    apple('MX2D3'),
    apple('MQD83'),
  ]),
  magSafeCharger: imgs('Apple MagSafe Charger', [apple('MQLN3'), apple('MQLN3'), apple('MX4F2')]),
  appleWatchSeries10: imgs('Apple Watch Series 10', [
    apple('MUQ93'),
    apple('MUQ93'),
    apple('MTJV3'),
  ]),
  airTag4Pack: imgs('Apple AirTag (4 pack)', [apple('MYQT3'), apple('MYQT3'), apple('MQLN3')]),
  usbCChargeCable: imgs('Apple USB-C Charge Cable (2 m)', [
    apple('MX4F2'),
    apple('MX4F2'),
    apple('MQLN3'),
  ]),
  iphoneSiliconeCase: imgs('Apple iPhone FineWoven Case with MagSafe', [
    apple('MT0Y3'),
    apple('MT0Y3'),
    apple('MX4F2'),
  ]),
  galaxyWatch7: imgs('Samsung Galaxy Watch7', [
    gsmBigpic('samsung-galaxy-watch7'),
    gsmPic('samsung', 'samsung-galaxy-watch7', 1),
    gsmPic('samsung', 'samsung-galaxy-watch7', 2),
    gsmPic('samsung', 'samsung-galaxy-watch7', 3),
  ]),
  galaxyWatchUltra: imgs('Samsung Galaxy Watch Ultra', [
    gsmBigpic('samsung-galaxy-watch-ultra'),
    gsmPic('samsung', 'samsung-galaxy-watch-ultra', 1),
    gsmPic('samsung', 'samsung-galaxy-watch-ultra', 2),
    gsmPic('samsung', 'samsung-galaxy-watch-ultra', 3),
  ]),
  galaxyWatch6Classic: imgs('Samsung Galaxy Watch6 Classic', [
    gsmBigpic('samsung-galaxy-watch6-classic'),
    gsmPic('samsung', 'samsung-galaxy-watch7', 1),
    gsmPic('samsung', 'samsung-galaxy-watch7', 2),
  ]),
  galaxyBuds4Pro: imgs('Samsung Galaxy Buds4 Pro', [
    samsungAsset('assets/us/2602/gnb/02152026/GNB_Buds4-Pro_88x88.png'),
    samsungAsset('assets/us/2602/gnb/02152026/GNB_Buds4-Pro_88x88.png', '$650_519_PNG$'),
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
  ]),
  mxMaster3S: imgs('Logitech MX Master 3S', [
    `${LOGITECH}/mice/mx-master-3s/migration-assets-for-delorean-2025/gallery/mx-master-3s-top-view-pale-grey.png`,
    `${LOGITECH}/mice/mx-master-3s/migration-assets-for-delorean-2025/gallery/mx-master-3s-left-profile-view-pale-grey.png`,
    `${LOGITECH}/mice/mx-master-3s-business-wireless-mouse/gallery/mx-master-3s-for-business-gallery-1.png`,
  ]),
  sonyWh1000xm5: imgs('Sony WH-1000XM5', [
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
  ]),
  sonyWf1000xm5: imgs('Sony WF-1000XM5', [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=80',
  ]),
  boseQcUltra: imgs('Bose QuietComfort Ultra Headphones', [
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
  ]),
  jblTourOneM2: imgs('JBL Tour One M2', [
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
  ]),
  sonosAce: imgs('Sonos Ace', [
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
  ]),
  samsung25wCharger: imgs('Samsung 25W USB-C Fast Charger', [
    samsungAsset('assets/us/2602/gnb/02152026/GNB-Mobile-S26U-88x88.png'),
    samsungAsset('assets/us/2602/gnb/02152026/GNB-Mobile-S26U-88x88.png', '$650_519_PNG$'),
    apple('MQLN3'),
  ]),
};
