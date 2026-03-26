// kebab-case.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';
import {decodeJwt} from 'jose';

@Pipe({
  name: 'decodeJwt',
})
export class DecodeJwt implements PipeTransform {
  transform(value?: string) {
    if (!value) return undefined;
    try{
      return decodeJwt(value)
    } catch(err){
      console.error("Error decoding JWT", err)
      return undefined;
    }
  }
}
