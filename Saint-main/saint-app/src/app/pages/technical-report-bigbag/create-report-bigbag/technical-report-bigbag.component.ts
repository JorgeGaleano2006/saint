// technical-report-bigbag.component.ts (versión actualizada con servicio)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BigbagService } from '../../../services/bigbag.service';

@Component({
  selector: 'app-technical-report-bigbag',
  templateUrl: './technical-report-bigbag.component.html',
  styleUrls: ['./technical-report-bigbag.component.css']
})
export class TechnicalReportBigbagComponent implements OnInit {

  // Formulario reactivo
  bigbagForm: FormGroup;
  
  // Control de pasos
  currentStep: number = 1;
  totalSteps: number = 3;
  
  // Estados de los pasos
  stepStates = {
    1: { active: true, completed: false },
    2: { active: false, completed: false },
    3: { active: false, completed: false }
  };

  // Estados para manejar la carga
  isSubmitting: boolean = false;
  submitError: string = '';
  submitSuccess: boolean = false;

  // Para manejar archivos
  selectedFirmaFile: File | null = null;
  selectedFirmaConductorFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private bigbagService: BigbagService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateStepDisplay();
  }

  private initializeForm(): void {
    this.bigbagForm = this.fb.group({
      // Paso 1: Información Inicial
      fechaIngreso: [this.getTodayDate(), Validators.required],
      horaIngreso: [this.getCurrentTime(), Validators.required],
      planta: ['', Validators.required],
      remision: ['', Validators.required],
      cantidadRelacionada: ['', [Validators.required, Validators.min(1)]],
      nomOperario: ['', Validators.required],
      firma: ['', Validators.required], 
      observaciones: ['', Validators.required],
      
      // Paso 2: Información Adicional
      nomConductor: ['', Validators.required],
      placaVehiculo: ['', Validators.required],
      empresaTransporte: ['', Validators.required],
      firmaConductor: ['', Validators.required],
      
      // Paso 3: Datos Físicos
      cantidadFisico: ['', [Validators.required, Validators.min(0)]],
      diferenciaReportada: [''] // Campo calculado automáticamente
    });

    // Suscribirse a cambios en las cantidades para calcular la diferencia automáticamente
    this.bigbagForm.get('cantidadRelacionada')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaReportada();
    });

    this.bigbagForm.get('cantidadFisico')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaReportada();
    });
  }

  // Navegación entre pasos
  siguientePaso(): void {
    if (this.isCurrentStepValid() && this.currentStep < this.totalSteps) {
      this.stepStates[this.currentStep].completed = true;
      this.stepStates[this.currentStep].active = false;
      
      this.currentStep++;
      this.stepStates[this.currentStep].active = true;
      
      this.updateStepDisplay();
    } else {
      this.markCurrentStepFieldsAsTouched();
    }
  }

  pasoAnterior(): void {
    if (this.currentStep > 1) {
      this.stepStates[this.currentStep].active = false;
      this.currentStep--;
      this.stepStates[this.currentStep].active = true;
      this.stepStates[this.currentStep].completed = false;
      
      this.updateStepDisplay();
    }
  }

  irAPaso(step: number): void {
    if (step <= this.currentStep || this.stepStates[step - 1]?.completed) {
      this.stepStates[this.currentStep].active = false;
      this.currentStep = step;
      this.stepStates[this.currentStep].active = true;
      
      this.updateStepDisplay();
    }
  }

  // Función para calcular la diferencia reportada
  calcularDiferenciaReportada(): void {
    const cantidadRelacionada = this.bigbagForm.get('cantidadRelacionada')?.value;
    const cantidadFisico = this.bigbagForm.get('cantidadFisico')?.value;
    
    if (cantidadRelacionada && cantidadFisico) {
      const cantRelacionada = parseFloat(cantidadRelacionada);
      const cantFisico = parseFloat(cantidadFisico);
      
      if (!isNaN(cantRelacionada) && !isNaN(cantFisico)) {
        const diferencia = cantFisico - cantRelacionada;
        let mensajeDiferencia = '';
        
        if (diferencia > 0) {
          mensajeDiferencia = `+${diferencia} productos de más`;
        } else if (diferencia < 0) {
          mensajeDiferencia = `${Math.abs(diferencia)} productos faltantes`;
        } else {
          mensajeDiferencia = 'Las cantidades coinciden';
        }
        
        this.bigbagForm.patchValue({
          diferenciaReportada: mensajeDiferencia
        });
      }
    }
  }

  // Manejo de archivos de firma
  onSignatureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.validateImageFile(file)) {
        this.selectedFirmaFile = file;
        
      } else {
        event.target.value = '';
      }
    }
  }

  // Manejo de firma del conductor
  onConductorSignatureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.validateImageFile(file)) {
        this.selectedFirmaConductorFile = file;
        
      } else {
        event.target.value = '';
      }
    }
  }

  // Validar archivo de imagen
  private validateImageFile(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido.');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB máximo
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return false;
    }
    
    return true;
  }

  // Envío del formulario
  onSubmit(): void {
    if (this.bigbagForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      this.submitSuccess = false;

      // Preparar datos para envío
      const formData = this.bigbagForm.value;
      
      // Enviar datos usando el servicio
      this.bigbagService.enviarDatosBigBag(
        formData, 
        this.selectedFirmaFile || undefined,
        this.selectedFirmaConductorFile || undefined
      ).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          if (response.success) {
            this.submitSuccess = true;
            this.submitError = '';
            
            // Mostrar mensaje de éxito
            alert(`Recepción guardada exitosamente. Número de recepción: ${response.datos?.numero_recepcion}`);
            
            // Opcional: resetear formulario
            this.resetForm();
          } else {
            this.submitError = response.mensaje || 'Error al guardar la recepción';
            this.submitSuccess = false;
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitSuccess = false;
          
          if (error.error && error.error.mensaje) {
            this.submitError = error.error.mensaje;
          } else {
            this.submitError = 'Error de conexión. Por favor intente nuevamente.';
          }
          
          console.error('Error al enviar datos:', error);
        }
      });
      
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.markAllFieldsAsTouched();
      this.submitError = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.bigbagForm.reset();
    this.currentStep = 1;
    this.stepStates = {
      1: { active: true, completed: false },
      2: { active: false, completed: false },
      3: { active: false, completed: false }
    };
    this.selectedFirmaFile = null;
    this.selectedFirmaConductorFile = null;
    this.submitError = '';
    this.submitSuccess = false;
    this.isSubmitting = false;
    
    // Restablecer valores por defecto
    this.bigbagForm.patchValue({
      fechaIngreso: this.getTodayDate(),
      horaIngreso: this.getCurrentTime()
    });
    
    this.updateStepDisplay();
    
    
  }

  // Marcar todos los campos como tocados
  private markAllFieldsAsTouched(): void {
    Object.keys(this.bigbagForm.controls).forEach(key => {
      const control = this.bigbagForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Validaciones
  private isCurrentStepValid(): boolean {
    const currentStepFields = this.getFieldsForStep(this.currentStep);
    
    for (const field of currentStepFields) {
      const control = this.bigbagForm.get(field);
      if (control && control.invalid) {
        return false;
      }
    }
    
    return true;
  }

  private markCurrentStepFieldsAsTouched(): void {
    const currentStepFields = this.getFieldsForStep(this.currentStep);
    
    currentStepFields.forEach(field => {
      const control = this.bigbagForm.get(field);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private getFieldsForStep(step: number): string[] {
    switch (step) {
      case 1:
        return ['fechaIngreso', 'horaIngreso', 'planta', 'remision', 'cantidadRelacionada', 'nomOperario', 'observaciones'];
      case 2:
        return ['nomConductor', 'placaVehiculo', 'empresaTransporte', 'firmaConductor'];
      case 3:
        return ['cantidadFisico'];
      default:
        return [];
    }
  }

  // Utilidades
  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private updateStepDisplay(): void {
    this.updateStepStyles();
    this.updateStepContent();
  }

  private updateStepStyles(): void {
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepElement = document.getElementById(`cont_paso${i}`);
      const stepCircle = stepElement?.querySelector('.paso');
      
      if (stepElement && stepCircle) {
        stepElement.classList.remove('active', 'completed');
        stepCircle.classList.remove('active', 'completed');
        
        if (this.stepStates[i].active) {
          stepElement.classList.add('active');
          stepCircle.classList.add('active');
        } else if (this.stepStates[i].completed) {
          stepElement.classList.add('completed');
          stepCircle.classList.add('completed');
        }
      }
    }
  }

  private updateStepContent(): void {
    const allStepContents = document.querySelectorAll('.step-content');
    allStepContents.forEach(content => {
      (content as HTMLElement).style.display = 'none';
    });
    
    const currentStepContent = document.getElementById(`step-content-${this.currentStep}`);
    if (currentStepContent) {
      currentStepContent.style.display = 'block';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bigbagForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.bigbagForm.get(fieldName);
    
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    
    return '';
  }
}