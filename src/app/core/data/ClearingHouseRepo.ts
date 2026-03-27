import {Injectable} from '@angular/core';
import {ApprovedCHs, CHServices, ClearingHouseList} from '../types/clearingHouse.types';

/** TODO I dont like how its structured
 * This class should return api of the clearing houses
 * however because some could rely on the proxies in the proxy.conf.json file
 * potentially double source of truth could happen.
 */
@Injectable({providedIn: "root"})
export class ClearingHouseRepo {
  clearingHouses: ClearingHouseList = {
    "GAIA": {
      "COMPLIANCE_V1": {
        url: "https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers",
        proxy: "/gaia/v1-staging/api/credential-offers",
      },
      "LNR_V1": {
        url: "https://registrationnumber.notary.lab.gaia-x.eu/v1-staging/registrationNumberVC",
        proxy: "/gaia_lnr/v1-staging/registrationNumberVC",
      }
    },
    "ARUBA": {
      "COMPLIANCE_V1": {
        url: "https://gx-compliance.aruba.it/v1/api/credential-offers",
        proxy: "/aruba/v1/api/credential-offers",
      },
      "LNR_V1": {
        url: "https://gx-notary.aruba.it/v1/registrationNumberVC",
        proxy: "/aruba_lnr/v1/registrationNumberVC",
      }
    },
    "DELTA_DAO": {
      "LNR_V1": {
        url: "https://delta-dao.com/notary/v1/registrationNumberVC",
        proxy: "/deltadao/notary/v1/registrationNumberVC",
      },
      "LNR_V2": {
        url: "https://www.delta-dao.com/notary/v2/registration-numbers/vat-id",
        proxy: "/deltadao/notary/v2/registration-numbers/vat-id",
      },
      "COMPLIANCE_V1": {
        url: "https://delta-dao.com/compliance/v1/api/credential-offers",
        proxy: "/deltadao/compliance/v1/api/credential-offers",
      },
      "COMPLIANCE_V2_STANDARD": {
        url: "https://delta-dao.com/compliance/v2/api/credential-offers/standard-compliance",
        proxy: "/deltadao/compliance/v2/api/credential-offers/standard-compliance",
      },
      "LABEL_V2_1": {
        url: "https://delta-dao.com/compliance/v2/api/credential-offers/label-level-1",
        proxy: "/deltadao/compliance/v2/api/credential-offers/label-level-1",
      },
      "LABEL_V2_2": {
        url: "https://delta-dao.com/compliance/v2/api/credential-offers/label-level-2",
        proxy: "/deltadao/compliance/v2/api/credential-offers/label-level-2",
      },
      "LABEL_V2_3": {
        url: "https://delta-dao.com/compliance/v2/api/credential-offers/label-level-3",
        proxy: "/deltadao/compliance/v2/api/credential-offers/label-level-3",
      }
    }
  }

  // TODO Only proxies are used, maybe use URL in prod?
  getAllUrls(service: CHServices = 'COMPLIANCE_V1', priorityCH: ApprovedCHs = 'ARUBA'): string[] {
    const urls: string[] = [];
    for (const [ch, api] of Object.entries(this.clearingHouses)) {
      if (ch === priorityCH && api[service]?.proxy) {
        urls.unshift(api[service].proxy);
      } else if (api[service]?.proxy) {
        urls.push(api[service].proxy);
      }
    }
    return urls;
  }
}
