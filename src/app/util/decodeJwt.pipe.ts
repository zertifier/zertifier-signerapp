// kebab-case.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';
import {decodeJwt} from 'jose';

@Pipe({
  name: 'decodeJwt',
})
export class DecodeJwt implements PipeTransform {
  transform(value?: string) {
    if (!value) return undefined;
    return decodeJwt(value)
  }
}
