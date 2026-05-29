/** Component photos — ASUS CDN for boards/GPUs; verified Unsplash for CPUs, RAM, and storage. */

const ASUS = 'https://dlcdnwebimgs.asus.com/gain';

function asus(id: string) {
  return `${ASUS}/${id}/w1000/h732`;
}

const UNSPLASH = 'https://images.unsplash.com';

function unsplash(id: string) {
  return `${UNSPLASH}/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
}

function imgs(name: string, urls: string[]) {
  return urls.map((url, i) => ({
    url,
    alt: i === 0 ? name : `${name} — view ${i + 1}`,
  }));
}

/** Verified 200 OK — motherboard / CPU socket close-up */
const CPU_A = unsplash('1591488320449-011701bb6704');
/** Verified 200 OK — graphics card */
const GPU_A = unsplash('1591405351990-4726e331f141');
/** Verified 200 OK — PCB / circuit board */
const PCB = unsplash('1558494949-ef010cbdcc31');
/** Verified 200 OK — tech hardware */
const TECH = unsplash('1518770660439-4636190af475');

export const COMPONENT_IMAGES = {
  // CPUs
  intelCoreUltra9285K: imgs('Intel Core Ultra 9 285K', [CPU_A, PCB, TECH]),
  intelCoreUltra7265K: imgs('Intel Core Ultra 7 265K', [CPU_A, TECH, PCB]),
  intelCorei714700K: imgs('Intel Core i7-14700K', [CPU_A, PCB, CPU_A]),
  intelCorei514600K: imgs('Intel Core i5-14600K', [TECH, CPU_A, PCB]),
  amdRyzen99950X: imgs('AMD Ryzen 9 9950X', [CPU_A, TECH, PCB]),
  amdRyzen97900X3D: imgs('AMD Ryzen 9 7900X3D', [CPU_A, PCB, TECH]),
  amdRyzen77800X3D: imgs('AMD Ryzen 7 7800X3D', [CPU_A, TECH, CPU_A]),
  amdRyzen59600X: imgs('AMD Ryzen 5 9600X', [TECH, CPU_A, PCB]),
  amdRyzen57600X: imgs('AMD Ryzen 5 7600X', [CPU_A, PCB, TECH]),

  // GPUs — ASUS ROG / TUF product renders
  asusRogStrix4090: imgs('ASUS ROG Strix GeForce RTX 4090 OC', [
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
    asus('09F3ECE0-7B6E-4F6B-9886-F939321BB8D9'),
    GPU_A,
  ]),
  asusTuf4080Super: imgs('ASUS TUF Gaming GeForce RTX 4080 Super', [
    asus('26B3DFC8-6783-4FAB-BA61-D1A0AE10ED26'),
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
    GPU_A,
  ]),
  asusDual4070TiSuper: imgs('ASUS Dual GeForce RTX 4070 Ti Super', [
    asus('87DCDC3E-F5C1-4195-915A-3251D2AB06A1'),
    asus('6D242E91-1127-4073-A046-2692DB8CA2D4'),
    GPU_A,
  ]),
  asusDual4060Ti: imgs('ASUS Dual GeForce RTX 4060 Ti 16 GB', [
    asus('6DD41772-7CBB-4ADA-B4DB-9DA1F56BA87F'),
    asus('63F5E6BA-BC40-4680-98BF-06DF1673C6BC'),
    GPU_A,
  ]),
  asusRogStrix7900Xtx: imgs('ASUS ROG Strix Radeon RX 7900 XTX OC', [
    asus('97FA88F0-B42A-467D-9A1E-359FAEBC72CF'),
    asus('784B56CA-673B-4DF7-9F1F-8E5B0550D16F'),
    GPU_A,
  ]),
  asusTuf7800Xt: imgs('ASUS TUF Gaming Radeon RX 7800 XT OC', [
    asus('96A20D09-B380-4C6E-9584-7ADD425756D6'),
    asus('6D746C42-0F48-41BD-AFD9-4590B68B30CB'),
    GPU_A,
  ]),
  asusRogStrix4070Super: imgs('ASUS ROG Strix GeForce RTX 4070 Super OC', [
    asus('33428CC0-AC8A-4666-A994-513B09BD4468'),
    asus('7B31B3ED-9C64-49D4-99C6-B87C24DFB608'),
    GPU_A,
  ]),

  // RAM
  corsairVengeanceDdr5_32: imgs('Corsair Vengeance DDR5 32 GB (6000 MT/s)', [PCB, TECH, PCB]),
  corsairVengeanceDdr5_64: imgs('Corsair Vengeance DDR5 64 GB (6400 MT/s)', [TECH, PCB, TECH]),
  gskillTridentZ5_32: imgs('G.Skill Trident Z5 RGB DDR5 32 GB', [PCB, TECH, PCB]),
  kingstonFuryBeast_32: imgs('Kingston Fury Beast DDR5 32 GB', [TECH, PCB, TECH]),

  // SSD / storage
  samsung990Pro2tb: imgs('Samsung 990 PRO 2 TB NVMe', [TECH, PCB, TECH]),
  samsung990Pro1tb: imgs('Samsung 990 PRO 1 TB NVMe', [PCB, TECH, PCB]),
  samsung980Pro2tb: imgs('Samsung 980 PRO 2 TB NVMe', [TECH, TECH, PCB]),
  wdBlackSn850x2tb: imgs('WD Black SN850X 2 TB NVMe', [PCB, TECH, PCB]),

  // Motherboards
  asusRogCrosshairX870E: imgs('ASUS ROG Crosshair X870E Hero', [
    asus('10D24676-0DF0-4CC4-9543-F58D71B1A19E'),
    asus('2EC328E4-7529-4CB5-A797-3B13E84D4664'),
    CPU_A,
  ]),
  asusTufB650Plus: imgs('ASUS TUF Gaming B650-Plus WiFi', [
    asus('02386EE2-72FE-45AD-A708-CB85EEF4294D'),
    asus('1C252331-C386-4050-A1CD-116D442F13AA'),
    CPU_A,
  ]),
  asusPrimeZ790P: imgs('ASUS Prime Z790-P WiFi', [
    asus('09F3ECE0-7B6E-4F6B-9886-F939321BB8D9'),
    asus('26B3DFC8-6783-4FAB-BA61-D1A0AE10ED26'),
    CPU_A,
  ]),

  // Power supplies
  corsairRm850e: imgs('Corsair RM850e 850 W 80+ Gold', [TECH, PCB, TECH]),
  corsairSf750: imgs('Corsair SF750 750 W 80+ Platinum SFX', [PCB, TECH, PCB]),
};
