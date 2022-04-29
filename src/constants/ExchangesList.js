import {
  EXCHANGES,
  RESOLUTIONS,
  DEFAULT_MAPPED_RESOLUTION,
  MAPPED_RESOLUTIONS,
  MAPPED_RESOLUTION_T1,
  MAPPED_SOCKET_RESOLUTIONS,
  MAPPED_SOCKET_RESOLUTION_T1,
} from './Exchanges'

export const EXCHANGE_OPTIONS = {
  binance: {
    ...EXCHANGES['binance'],
    resolutions: [...RESOLUTIONS, '1M'],
    needPingAlive: false,
    mappedResolutions: MAPPED_RESOLUTION_T1,
    mappedResolutionsSocket: MAPPED_RESOLUTION_T1,
  },
  binanceus: {
    ...EXCHANGES['binanceus'],
    resolutions: [...RESOLUTIONS, '1M'],
    needPingAlive: false,
    mappedResolutions: MAPPED_RESOLUTION_T1,
    mappedResolutionsSocket: MAPPED_RESOLUTION_T1,
  },
  kucoin: {
    ...EXCHANGES['kucoin'],
    resolutions: RESOLUTIONS,
    needPingAlive: true,
    mappedResolutions: MAPPED_RESOLUTIONS,
    mappedResolutionsSocket: MAPPED_SOCKET_RESOLUTIONS,
  },
  bybit: {
    ...EXCHANGES['bybit'],
    resolutions: RESOLUTIONS,
    needPingAlive: true,
    mappedResolutions: MAPPED_RESOLUTIONS,
    mappedResolutionsSocket: DEFAULT_MAPPED_RESOLUTION,
    klineLimit: 200,
  },
  huobipro: {
    ...EXCHANGES['huobipro'],
    resolutions: RESOLUTIONS,
    needPingAlive: true,
    mappedResolutions: MAPPED_RESOLUTIONS,
    mappedResolutionsSocket: DEFAULT_MAPPED_RESOLUTION,
  },
  okex: {
    ...EXCHANGES['okex'],
    resolutions: RESOLUTIONS,
    needPingAlive: true,
    mappedResolutions: MAPPED_RESOLUTIONS,
    mappedResolutionsSocket: MAPPED_SOCKET_RESOLUTION_T1,
    klineLimit: 100,
  },
}
