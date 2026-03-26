import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

// TODO not used everywhere too laaaazy for now
@Injectable({providedIn: 'root'})
export class DogshitConfig {
  subjectPostfix = '#subject';
  didVerificationMethod = '#verification';
  fileNames_v1: Record<string, string> = {
    "tac": "termsAndConditions.json",
    "lp": "legalParticipant.json",
    "lrn": "legalRegistrationNumber.json",
    "did": "did.json",
    "so": "serviceOffering.json",
    "cert": "cert.pem",
    "compliance": "compliance.json",
    "vp": "verifiablePresentation.json",
  }

  fileNames_v2: Record<string, string> = {
    "tac": "termsAndConditions.jwt",
    "lp": "legalPerson.jwt",
    "lrn": "legalRegistrationNumber.jwt",
    "did": "did.json",
    "so": "serviceOffering.jwt",
    "cert": "cert.pem",
    "compliance": "compliance.jwt",
    "vp": "verifiablePresentation.jwt",
  }

  publishDomains: Record<string, string> = {
    "Zertifier": environment.zertifierProxyFileApiUrl || '',
  }
}
