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

  actualizarCantidades(numRecepcion: string, cantRelacionada: number, cantidadFisica: number, diferenciaReportada: string): Observable<any> {
  const data = {
    num_recepcion: numRecepcion,
    cant_relacionada: cantRelacionada,
    cantidad_fisico: cantidadFisica,
    diferencia_reportada: diferenciaReportada
  };
  
  return this.http.put(this.apiUrl, data);
}
}