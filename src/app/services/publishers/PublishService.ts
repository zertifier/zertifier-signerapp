import {inject, Injectable} from '@angular/core';
import {BaseFilePublisher} from './HttpPublisher';
import {PublishedFile} from '../../core/types/publisher.types';

@Injectable()
export class PublishService {
  #httpPublisher = inject(BaseFilePublisher);

  publish(files: PublishedFile[], endpointUrl: string) {
    return this.#httpPublisher.publish(files, endpointUrl);
  }
}
