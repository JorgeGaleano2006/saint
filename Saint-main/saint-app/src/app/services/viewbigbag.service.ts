// documento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private apiUrl = 'http://localhost/php_backend_saint/controladores/DocumentoLlegadaController.php';

  constructor(private http: HttpClient) {}

  obtenerDocumentos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
