import { Component, OnInit } from '@angular/core';
import { DocumentoService } from '../../../services/viewbigbag.service';

@Component({
  selector: 'app-view-report-bigbag',
  templateUrl: './view-report-bigbag.component.html',
  styleUrls: ['./view-report-bigbag.component.css']
})
export class ViewReportBigbagComponent implements OnInit {
  documentos: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Propiedades para el modal de detalles
  mostrarModal: boolean = false;
  documentoSeleccionado: any = null;

  // Propiedades para el modal de edición
  mostrarModalEdicion: boolean = false;
  documentoEditar: any = null;
  formEdicion = {
    cant_relacionada: 0,
    cantidad_fisico: 0
  };
  
  // Estados de carga y error
  cargandoActualizacion: boolean = false;
  errorActualizacion: string = '';
  exitoActualizacion: boolean = false;

  constructor(private documentoService: DocumentoService) {}

  ngOnInit(): void {
    this.documentoService.obtenerDocumentos().subscribe(data => {
      this.documentos = data;
    });
  }

  get filteredDocumentos() {
    if (!this.searchText) {
      return this.documentos;
    }
    return this.documentos.filter(doc =>
      doc.num_recepcion?.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.fecha_ingreso?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.hora_llegada?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.planta?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.num_remision?.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.estado?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.nom_operario?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.nom_conductor?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.nom_transportador?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.placa_vehiculo?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      doc.nombres?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get paginatedDocumentos() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDocumentos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredDocumentos.length / this.itemsPerPage);
  }

  // Método mejorado para cambiar la cantidad de elementos por página
  onItemsPerPageChange() {
    this.currentPage = 1; // Resetear a la primera página
    // Validar que la página actual no exceda el total de páginas
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  // Método mejorado para el cambio de búsqueda
  onSearchChange() {
    this.currentPage = 1; // Resetear a la primera página cuando se busca
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Método para ir a una página específica
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Método para obtener el rango de páginas a mostrar
  getPageRange(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const range: number[] = [];
    
    if (totalPages <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          range.push(i);
        }
        range.push(-1); // Representa "..."
        range.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        range.push(1);
        range.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        range.push(1);
        range.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          range.push(i);
        }
        range.push(-1);
        range.push(totalPages);
      }
    }
    
    return range;
  }

  // Obtener información de la paginación actual
  getPaginationInfo(): string {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredDocumentos.length);
    const total = this.filteredDocumentos.length;
    
    if (total === 0) {
      return 'No hay documentos para mostrar';
    }
    
    return `Mostrando ${startIndex} a ${endIndex} de ${total} documentos`;
  }

  verDocumento(doc: any) {
    this.documentoSeleccionado = doc;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.documentoSeleccionado = null;
  }

  editarDocumento(doc: any) {
    // Cierra el modal de detalles si está abierto
    if (this.mostrarModal) {
      this.cerrarModal();
    }
    
    // Configura el modal de edición
    this.documentoEditar = { ...doc }; // Crear una copia del documento
    this.formEdicion = {
      cant_relacionada: doc.cant_relacionada || 0,
      cantidad_fisico: doc.cantidad_fisico || 0
    };
    
    // Resetear estados
    this.errorActualizacion = '';
    this.exitoActualizacion = false;
    
    // Mostrar modal de edición
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion() {
    this.mostrarModalEdicion = false;
    this.documentoEditar = null;
    this.formEdicion = {
      cant_relacionada: 0,
      cantidad_fisico: 0
    };
    this.errorActualizacion = '';
    this.exitoActualizacion = false;
  }

  guardarCambios() {
  // Validaciones
  if (this.formEdicion.cant_relacionada < 0 || this.formEdicion.cantidad_fisico < 0) {
    this.errorActualizacion = 'Las cantidades no pueden ser negativas';
    return;
  }
  if (!this.documentoEditar) {
    this.errorActualizacion = 'Error: No se ha seleccionado un documento';
    return;
  }

  this.cargandoActualizacion = true;
  this.errorActualizacion = '';

  // Calcular la diferencia y obtener el mensaje descriptivo
  const diferencia = this.formEdicion.cant_relacionada - this.formEdicion.cantidad_fisico;
  let mensajeDescriptivo: string;
  
  if (diferencia > 0) {
    // cant_relacionada > cantidad_fisico = faltan productos físicos
    mensajeDescriptivo = `${diferencia} productos faltantes`;
  } else if (diferencia < 0) {
    // cant_relacionada < cantidad_fisico = hay productos de más
    mensajeDescriptivo = `${Math.abs(diferencia)} productos de más`;
  } else {
    // Las cantidades son iguales
    mensajeDescriptivo = 'Las cantidades coinciden';
  }

  this.documentoService.actualizarCantidades(
    this.documentoEditar.num_recepcion,
    this.formEdicion.cant_relacionada,
    this.formEdicion.cantidad_fisico,
    mensajeDescriptivo  // Enviar el mensaje completo, no el número
  ).subscribe({
    next: (response) => {
      this.cargandoActualizacion = false;

      if (response.success) {
        // Actualizar el documento en el array local
        const index = this.documentos.findIndex(doc => doc.num_recepcion === this.documentoEditar.num_recepcion);
        if (index !== -1) {
          this.documentos[index] = {
            ...this.documentos[index],
            cant_relacionada: this.formEdicion.cant_relacionada,
            cantidad_fisico: this.formEdicion.cantidad_fisico,
            // Guardar el mensaje descriptivo completo
            diferencia_reportada: mensajeDescriptivo
          };
        }

        this.exitoActualizacion = true;

        // Mostrar mensaje al usuario
        alert(`Documento actualizado exitosamente: ${mensajeDescriptivo}`);

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.cerrarModalEdicion();
        }, 2000);
      } else {
        this.errorActualizacion = response.message || 'Error al actualizar el documento';
      }
    },
    error: (error) => {
      this.cargandoActualizacion = false;
      console.error('Error al actualizar:', error);
      this.errorActualizacion = 'Error de conexión. Intente nuevamente.';
    }
  });
}

  // Método para calcular la diferencia en tiempo real
  calcularDiferencia(): number {
    return this.formEdicion.cant_relacionada - this.formEdicion.cantidad_fisico;
  }

  // Método mejorado para obtener el mensaje descriptivo de la diferencia
  obtenerMensajeDiferencia(): string {
    const diferencia = this.calcularDiferencia(); // cant_relacionada - cantidad_fisico
    
    if (diferencia > 0) {
      // Si diferencia es positiva: cant_relacionada > cantidad_fisico = faltan productos físicos
      return `${diferencia} productos faltantes`;
    } else if (diferencia < 0) {
      // Si diferencia es negativa: cant_relacionada < cantidad_fisico = hay productos de más
      return `${Math.abs(diferencia)} productos de más`;
    } else {
      return 'Las cantidades coinciden';
    }
  }

  // Método para obtener la clase CSS según la diferencia
  obtenerClaseDiferencia(): string {
    const diferencia = this.calcularDiferencia(); // cant_relacionada - cantidad_fisico
    
    if (diferencia > 0) {
      // Si diferencia es positiva: faltan productos físicos
      return 'diferencia-negativa';
    } else if (diferencia < 0) {
      // Si diferencia es negativa: hay productos de más
      return 'diferencia-positiva';
    } else {
      return 'diferencia-cero';
    }
  }

  verFirma(ruta: string) {
    const baseUrl = 'http://localhost/php_backend_saint'; // o tu dominio real
    const urlCompleta = `${baseUrl}/${ruta}`;
    window.open(urlCompleta, '_blank');
  }
}