import {Injectable} from '@angular/core';

// TODO not used everywhere too laaaazy for now
@Injectable({providedIn: 'root'})
export class DogshitConfig {
  subjectPostfix = '#subject';
  didVerificationMethod = '#verification';
  fileNames: Record<string, string> = {
    "tac": "termsAndConditions.json",
    "lp": "legalParticipant.json",
    "lnr": "legalRegistrationNumber.json",
    "did": "did.json",
    "so": "serviceOffering.json"
  }

}
