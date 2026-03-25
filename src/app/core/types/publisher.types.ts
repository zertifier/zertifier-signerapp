import {Observable} from 'rxjs';
import {HttpHeaders} from '@angular/common/http';
import {DecryptedCertificate} from './crypto.types';

export interface FilePublisher {
  publish(baseUrl: string, files: PublishedFile[], headers?: HttpHeaders): Observable<void>;

  validate(baseUrl: string, files: PublishedFile[]): Observable<void>;
}

export interface PublishedFile {
  path: string;
  content: string;
}


export type PublishInput = {
  cert: DecryptedCertificate,
  lrn: object,
  tac: object,
  lp: object,
  so?: object,
};
