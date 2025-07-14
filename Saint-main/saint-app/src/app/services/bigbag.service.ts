import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BigBagData {
  // Paso 1: Información Inicial
  fechaIngreso: string;
  horaIngreso: string;
  planta: string;
  remision: number;
  cantidadRelacionada: number;
  nomOperario: string;
  firma?: File;
  observaciones: string;
  
  // Paso 2: Información Adicional
  nomConductor: string;
  placaVehiculo: string;
  empresaTransporte: string;
  firmaConductor: File;
  
  // Paso 3: Datos Físicos
  cantidadFisico: number;
  diferenciaReportada: string;
  
  // ID del usuario que crea el registro
  userId: number;
}

export interface BigBagResponse {
  success: boolean;
  mensaje: string;
  datos?: {
    id: number;
    fecha_creacion: string;
    numero_recepcion: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BigbagService {
  private apiUrl = 'http://localhost/php_backend_saint'; // Ajusta según tu configuración

  constructor(private http: HttpClient) { }

  /**
   * Método principal para enviar datos del formulario BigBag
   * @param formData - Datos del formulario
   * @param userId - ID del usuario que crea el registro
   * @param firmaFile - Archivo de firma del operario (opcional)
   * @param firmaConductorFile - Archivo de firma del conductor
   * @returns Observable con la respuesta del servidor
   */
  enviarDatosBigBag(
    formData: any, 
    userId: number,
    firmaFile?: File, 
    firmaConductorFile?: File
  ): Observable<BigBagResponse> {
    const formDataToSend = new FormData();
    
    // Agregar el ID del usuario
    formDataToSend.append('userId', userId.toString());
    
    // Agregar datos del formulario
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Agregar archivos si existen
    if (firmaFile) {
      formDataToSend.append('firma', firmaFile, firmaFile.name);
    }
    
    if (firmaConductorFile) {
      formDataToSend.append('firmaConductor', firmaConductorFile, firmaConductorFile.name);
    }

    // Agregar timestamp para el servidor
    formDataToSend.append('timestamp', new Date().toISOString());

    return this.http.post<BigBagResponse>(`${this.apiUrl}/recepcion-bigbag.php`, formDataToSend);
  }

  /**
   * Método alternativo si prefieres enviar el userId como parte del objeto formData
   */
  enviarDatosBigBagAlternativo(
    formData: any, 
    userId: number,
    firmaFile?: File, 
    firmaConductorFile?: File
  ): Observable<BigBagResponse> {
    const formDataToSend = new FormData();
    
    // Agregar el userId al objeto formData
    const dataWithUserId = { ...formData, userId: userId };
    
    // Agregar datos del formulario (incluyendo userId)
    Object.keys(dataWithUserId).forEach(key => {
      if (dataWithUserId[key] !== null && dataWithUserId[key] !== '') {
        formDataToSend.append(key, dataWithUserId[key]);
      }
    });

    // Agregar archivos si existen
    if (firmaFile) {
      formDataToSend.append('firma', firmaFile, firmaFile.name);
    }
    
    if (firmaConductorFile) {
      formDataToSend.append('firmaConductor', firmaConductorFile, firmaConductorFile.name);
    }

    // Agregar timestamp para el servidor
    formDataToSend.append('timestamp', new Date().toISOString());

    return this.http.post<BigBagResponse>(`${this.apiUrl}/recepcion-bigbag.php`, formDataToSend);
  }
}