import {Observable} from 'rxjs';
import {HttpHeaders} from '@angular/common/http';

export interface FilePublisher {
  publish(files: PublishedFile[], baseUrl: string, headers?: HttpHeaders): Observable<Object>;

  validate(files: PublishedFile[], baseUrl: string): Observable<Boolean>;
}

export interface PublishedFile {
  path: string;
  content: string;
}
