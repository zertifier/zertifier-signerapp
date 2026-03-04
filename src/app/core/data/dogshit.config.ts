import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

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
    "so": "serviceOffering.json",
    "cert": "cert.pem"
  }
  publishDomains: Record<string, string> = {
    "Zertifier": environment.zertifierProxyFileApiUrl || '',
  }

}
