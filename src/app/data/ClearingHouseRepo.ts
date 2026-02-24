import {Injectable} from '@angular/core';
import {ApprovedCHs, CHServices, ClearingHouseList} from '../types/clearingHouse.types';

/**
 * This class should return api of the clearing houses
 * however because some could rely on the proxies in the proxy.conf.json file
 * potentially double source of truth could happen.
 */
@Injectable({providedIn: "root"})
export class ClearingHouseRepo {
  clearingHouses: ClearingHouseList = {
    "GAIA": {
      "COMPLIANCE": {
        url: "https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers",
        proxy: "/gaia/v1-staging/api/credential-offers",
      },
      "LNR": {
        url: "https://registrationnumber.notary.lab.gaia-x.eu/v1-staging/registrationNumberVC",
        proxy: "/gaia_lnr/v1-staging/registrationNumberVC",
      }
    },
    "ARUBA": {
      "COMPLIANCE": {
        url: "https://gx-compliance.aruba.it/v1/api/credential-offers",
        proxy: "/aruba/v1/api/credential-offers",
      },
      "LNR": {
        url: "https://gx-notary.aruba.it/v1/registrationNumberVC",
        proxy: "/aruba_lnr/v1/registrationNumberVC",
      }
    },
    "DELTA_DAO": {
      "COMPLIANCE": {
        url: "https://delta-dao.com/compliance/v1/api/credential-offers",
        proxy: "/deltadao/compliance/v1/api/credential-offers",
      },
      "LNR": {
        url: "https://delta-dao.com/notary/v1/registrationNumberVC",
        proxy: "/deltadao/notary/v1/registrationNumberVC",
      }
    }
  }

  getAllUrls(service: CHServices = 'COMPLIANCE', priorityCH: ApprovedCHs = 'ARUBA'): string[] {
    const urls: string[] = [];
    for (const [ch, api] of Object.entries(this.clearingHouses)) {
      if (ch === priorityCH) {
        if (api[service].proxy) {
          urls.unshift(api[service].proxy);
        }
        urls.unshift(api[service].url);
      } else {
        urls.push(api[service].url);
        if (api[service].proxy) {
          urls.push(api[service].proxy);
        }
      }
    }
    return urls;
  }
}
