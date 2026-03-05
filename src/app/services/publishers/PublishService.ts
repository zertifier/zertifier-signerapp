import {inject, Injectable} from '@angular/core';
import {ZertifierFilePublisher} from './HttpPublisher';
import {PublishedFile} from '../../core/types/publisher.types';
import {environment} from '../../../environments/environment';
import {HttpHeaders} from '@angular/common/http';

@Injectable()
export class PublishService {
  #httpPublisher = inject(ZertifierFilePublisher);

  publish(files: PublishedFile[], endpointUrl: string) {
    const token = environment.zertifierFileApiToken;
    if (!token) {
      throw new Error('No token found in .env for publish service')
    }
    const header = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.#httpPublisher.publish(files, endpointUrl, header);
  }
}
