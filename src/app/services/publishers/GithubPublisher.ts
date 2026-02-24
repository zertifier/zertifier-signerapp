import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

/**
 * Redundant, probably will never be used, pending for removing in the future
 Github rate limit, approx: 5000 request per hour per token
 https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28
 Documentation:
 https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#create-or-update-file-contents
 */
@Injectable({providedIn: 'root'})
export class GithubFileUploadService {
  private apiBase = 'https://api.github.com';
  #httpClient = inject(HttpClient);

  uploadFileToRepo(
    token: string,
    repoOwner: string,
    repoName: string,
    filePath: string,
    content: string,
    message: string,
  ): Observable<any> {
    // example url: https://github.com/zertifier/zertifier-vc-presentation-dev/blob/main/signerAppTest/did.json
    const url = `${this.apiBase}/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const headers = new HttpHeaders({
      Authorization: `token ${token}`,
      // docs: "Setting to application/vnd.github+json is recommended."
      Accept: 'application/vnd.github+json',
    });

    const body = {
      message,
      // docs: "The new file content, using Base64 encoding."
      content: btoa(content),
    };

    // Success codes are: 200(ok), 201(created)
    // Fail codes: 404, 409(conflict), 422(Validation failed/spammed)
    return this.#httpClient.put(url, body, {headers});
  }


}

