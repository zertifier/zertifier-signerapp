import {Observable} from 'rxjs';
import {HttpHeaders} from '@angular/common/http';

export interface FilePublisher {
  publish(baseUrl: string, files: PublishedFile[], headers?: HttpHeaders): Observable<void>;

  validate(baseUrl: string, files: PublishedFile[]): Observable<void>;
}

export interface PublishedFile {
  path: string;
  content: string;
}
