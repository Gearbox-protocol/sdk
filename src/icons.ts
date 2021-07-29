// ICONS

import {getStatic} from "./index";

const t = (name: string) => getStatic(`/tokens/${name}`);

export const ICONS: Record<string, string> = {
  weth: t('eth.svg'),
  eth: t('eth.svg'),
  dai: t('dai.svg'),
  link: t('link.svg'),
  aave: t('aave.svg'),
  snx: t('snx.svg'),
  gusd: t('gusd.svg'),
  bal: t('bal.svg'),
  zrx: t('zrx.svg'),
  usdt: t('usdt.svg'),
  crv: t('crv.png'),
  busd: t('busd.svg'),
  uni: t('uni.png'),
  usdc: t('usdc.svg'),
  yfi: t('yfi.svg'),
  wbtc: t('wbtc.svg'),
  "1inch": t('inch.svg'),
  comp: t('comp.svg'),
  srm: t('srm.svg'),
  sushi: t('sushi.svg'),
  ddai: t('ddai.svg'),
  dweth: t('dweth.svg'),
  duni: t('duni.svg'),
  dusdc: t('dusdc.svg'),
  dwbtc: t('dwbtc.svg'),
};
