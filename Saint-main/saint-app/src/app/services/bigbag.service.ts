// bigbag.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BigBagFormData {
  fechaIngreso: string;
  horaIngreso: string;
  planta: string;
  remision: string;
  cantidadRelacionada: number;
  nomOperario: string;
  firma?: string;
  observaciones: string;
  nomConductor: string;
  placaVehiculo: string;
  empresaTransporte: string;
  firmaConductor: string;
  cantidadFisico: number;
  diferenciaReportada: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BigbagService {
  private apiUrl = 'http://localhost:8000/api'; // Cambia por tu URL de Laravel
  
  constructor(private http: HttpClient) {}

  // Método para enviar el formulario
  submitBigBagForm(formData: BigBagFormData): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApiResponse>(`${this.apiUrl}/bigbag`, formData, { headers });
  }

  // Método para enviar formulario con archivo (si hay firma)
  submitBigBagFormWithFile(formData: FormData): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
      // No incluir Content-Type para FormData, Angular lo maneja automáticamente
    });

    return this.http.post<ApiResponse>(`${this.apiUrl}/bigbag`, formData, { headers });
  }

  // Método para obtener todos los registros
  getAllBigBags(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/bigbag`);
  }

  // Método para obtener un registro por ID
  getBigBagById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/bigbag/${id}`);
  }

  // Método para actualizar un registro
  updateBigBag(id: number, formData: BigBagFormData): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.put<ApiResponse>(`${this.apiUrl}/bigbag/${id}`, formData, { headers });
  }

  // Método para eliminar un registro
  deleteBigBag(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/bigbag/${id}`);
  }
}