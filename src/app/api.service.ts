import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService { // file that contains all crud apis

  constructor(private httpClient: HttpClient) { }

  // upload to aws s3
  uploadPhoto(image: File): Observable<object> {
    const formData = new FormData();
    formData.append('image', image);

    return this.httpClient.post(`${environment.apiUrl}/photos/upload`, formData);
  }


  // db crud apis
  getPhotos(): Observable<{ success: boolean, photos: [] }> {
    return this.httpClient.get<{ success: boolean, photos: [] }>(`${environment.apiUrl}/photos/`);
  }

  createPhoto(image: { url: string, caption: string }) {
    return this.httpClient.post(`${environment.apiUrl}/photos/add`, image);
  }

  updateCaption(id: number, caption: string) {
    return this.httpClient.patch(`${environment.apiUrl}/photos`, { caption, id });
  }

  deletePhoto(id: number) {
    return this.httpClient.delete(`${environment.apiUrl}/photos/${id}`);
  }
}
