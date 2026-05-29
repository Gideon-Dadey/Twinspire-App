/** Model-specific TV and audio photos from official manufacturer CDNs. */

const SAMSUNG = 'https://images.samsung.com/is/image/samsung';

function samsung(sku: string, file: string) {
  return `${SAMSUNG}/p6pim/us/${sku}/gallery/${file}?$product-details-jpg$`;
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

export const TV_IMAGES = {
  monolithOled77: imgs('Monolith 77" OLED Cinema TV', [
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-550349279'),
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-550349367'),
    lg('5762ff2d7f0ae41d', 'webimage-HE_SHOWCASE_TVs_AI_1080x1080.png'),
  ]),
  monolithSoundbar: imgs('Monolith Theater Soundbar 9.1.4', [
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
  ]),
  monolithProjector: imgs('Monolith Beam 4K Projector', [
    lg('100acfad46ea60ed', 'webimage-OBS_HE_SHOWCASE_LIFESTYLE_SCREENS_StanbyME2_1080x1080.png'),
    lg('149a7c4247bcd15b', 'webimage-HP_Life_Style_Screens_Story1-P4_Projector_PromoCard.png'),
    'https://image-us.samsung.com/SamsungUS/he/FrameLockup.png',
  ]),
  samsungS90d65: imgs('Samsung S90D 65" OLED', [
    samsung('qn65s90dafxza', 'us-oled-s90d-qn65s90dafxza-550262130'),
    samsung('qn65s90dafxza', 'us-oled-s90d-qn65s90dafxza-550262131'),
    samsung('qn65s90dafxza', 'us--qn65s90dafxza-550262581'),
  ]),
  samsungS95d77: imgs('Samsung S95D 77" OLED', [
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-550349279'),
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-550349281'),
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-550349379'),
  ]),
  samsungNeoQled65: imgs('Samsung Neo QLED QN90D 65"', [
    samsung('qn65s90dafxza', 'us--qn65s90dafxza-550262588'),
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-551089429'),
    lg('12aaceaa134e8d02', 'webimage-HE_SHOWCASE_TVs_QNED_1080x1080.png'),
  ]),
  samsungCrystalUhd55: imgs('Samsung Crystal UHD U8000F 55"', [
    lg('12aaceaa134e8d02', 'webimage-HE_SHOWCASE_TVs_QNED_1080x1080.png'),
    samsung('qn65s90dafxza', 'us-oled-s90d-qn65s90dafxza-550262130'),
    'https://image-us.samsung.com/SamsungUS/he/FrameLockup.png',
  ]),
  samsungTheFrame55: imgs('Samsung The Frame 55"', [
    'https://image-us.samsung.com/SamsungUS/he/FrameLockup.png',
    samsung('qn65s90dafxza', 'us-oled-s90d-qn65s90dafxza-550262131'),
    lg('5762ff2d7f0ae41d', 'webimage-HE_SHOWCASE_TVs_AI_1080x1080.png'),
  ]),
  lgOledC4_65: imgs('LG OLED evo C4 65"', [
    lg('452b59e0570d664e', 'webimage-MS_IT_SHOWCASE_LG_ULTRAGEAR_OLED-v2_1080X1080.png'),
    lg('5762ff2d7f0ae41d', 'webimage-HE_SHOWCASE_TVs_AI_1080x1080.png'),
    lg('12aaceaa134e8d02', 'webimage-HE_SHOWCASE_TVs_QNED_1080x1080.png'),
  ]),
  lgOledG4_77: imgs('LG OLED evo G4 77"', [
    lg('5762ff2d7f0ae41d', 'webimage-HE_SHOWCASE_TVs_AI_1080x1080.png'),
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-550349367'),
    lg('452b59e0570d664e', 'webimage-MS_IT_SHOWCASE_LG_ULTRAGEAR_OLED-v2_1080X1080.png'),
  ]),
  lgStanbyMe2: imgs('LG StanbyME 2 Portable Screen', [
    lg('100acfad46ea60ed', 'webimage-OBS_HE_SHOWCASE_LIFESTYLE_SCREENS_StanbyME2_1080x1080.png'),
    lg('149a7c4247bcd15b', 'webimage-HP_Life_Style_Screens_Story1-P4_Projector_PromoCard.png'),
    lg('1c491fa10556f4c2', 'webimage-MS_SMART_MONITOR_SWING_1080x1080.png'),
  ]),
  sonyBravia8_65: imgs('Sony BRAVIA 8 65" OLED', [
    samsung('qn77s95dafxza', 'us-oled-s95d-qn77s95dafxza-551089429'),
    lg('452b59e0570d664e', 'webimage-MS_IT_SHOWCASE_LG_ULTRAGEAR_OLED-v2_1080X1080.png'),
    samsung('qn65s90dafxza', 'us-oled-s90d-qn65s90dafxza-550262130'),
  ]),
  tclQm7_65: imgs('TCL QM7 65" QLED', [
    'https://cdn.shopify.com/s/files/1/0687/7151/2385/files/KV.png',
    'https://cdn.shopify.com/s/files/1/0687/7151/2385/files/20260414-171346.png',
    lg('12aaceaa134e8d02', 'webimage-HE_SHOWCASE_TVs_QNED_1080x1080.png'),
  ]),
  hisenseU8n_65: imgs('Hisense U8N 65" ULED', [
    'https://static.wixstatic.com/media/506473_7fbd89d0a2ea4592bcaa1d1f7ed7788a~mv2.png/v1/fill/w_800,h_800,al_c,q_85/126390396d5fb40.png',
    'https://static.wixstatic.com/media/506473_b5a2f81b3d584916816eb588ecf948f3~mv2.webp/v1/fill/w_800,h_480,al_c,q_80/666c8d369d8107.webp',
    lg('5762ff2d7f0ae41d', 'webimage-HE_SHOWCASE_TVs_AI_1080x1080.png'),
  ]),
  samsungQ990d: imgs('Samsung HW-Q990D Soundbar', [
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
  ]),
  lgS90ty: imgs('LG S90TY Dolby Atmos Soundbar', [
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
  ]),
  sonosArcGen2: imgs('Sonos Arc Gen 2', [
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
  ]),
  boseSmart900: imgs('Bose Smart Soundbar 900', [
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    'https://image-us.samsung.com/SamsungUS/he/FrameLockup.png',
  ]),
  jblBar1000: imgs('JBL Bar 1000', [
    lg(
      '25b8093fc1a67bc3',
      'webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
    ),
    lg('3ea91c548615f73a', 'webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png'),
    lg('4d40c2f3c4f1b7bd', 'webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png'),
  ]),
};
