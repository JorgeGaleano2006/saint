// technical-report-bigbag.component.ts (con modal de éxito)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BigbagService } from '../../../services/bigbag.service';
import { User } from '../../../models/User';

@Component({
  selector: 'app-technical-report-bigbag',
  templateUrl: './technical-report-bigbag.component.html',
  styleUrls: ['./technical-report-bigbag.component.css']
})
export class TechnicalReportBigbagComponent implements OnInit {

  bigbagForm: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 3;
  
  stepStates = {
    1: { active: true, completed: false },
    2: { active: false, completed: false },
    3: { active: false, completed: false }
  };

  isSubmitting: boolean = false;
  submitError: string = '';
  submitSuccess: boolean = false;

  selectedFirmaFile: File | null = null;
  selectedFirmaConductorFile: File | null = null;

  // Propiedad para almacenar el usuario actual
  currentUser: User | null = null;

  // Propiedades para el modal de éxito
  showSuccessModal: boolean = false;
  numeroRecepcion: string = '';

  constructor(
    private fb: FormBuilder,
    private bigbagService: BigbagService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateStepDisplay();
    this.loadCurrentUser();
  }

  /**
   * Cargar el usuario actual desde el servicio de autenticación
   * Reemplaza este método con tu lógica de autenticación
   */
  private loadCurrentUser(): void {
    // Ejemplo temporal - cambiar por el id_Sdp que funciona
    this.currentUser = {
      // id = currenData.id_Sdp
      id: 27,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      password: '',
      enable: true,
      roles: []
    };
  }

  private initializeForm(): void {
    this.bigbagForm = this.fb.group({
      fechaIngreso: [this.getTodayDate(), Validators.required],
      horaIngreso: [this.getCurrentTime(), Validators.required],
      planta: ['', Validators.required],
      remision: ['', Validators.required],
      cantidadRelacionada: ['', [Validators.required, Validators.min(1)]],
      nomOperario: ['', Validators.required],
      firma: ['', Validators.required], 
      observaciones: ['', Validators.required],
      nomConductor: ['', Validators.required],
      placaVehiculo: ['', Validators.required],
      empresaTransporte: ['', Validators.required],
      firmaConductor: ['', Validators.required],
      cantidadFisico: ['', [Validators.required, Validators.min(0)]],
      diferenciaReportada: ['']
    });

    this.bigbagForm.get('cantidadRelacionada')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaReportada();
    });

    this.bigbagForm.get('cantidadFisico')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaReportada();
    });
  }

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

  onSignatureChange(event: any): void {
    const file = event.target.files[0];
    if (file && this.validateImageFile(file)) {
      this.selectedFirmaFile = file;
    } else {
      event.target.value = '';
    }
  }

  onConductorSignatureChange(event: any): void {
    const file = event.target.files[0];
    if (file && this.validateImageFile(file)) {
      this.selectedFirmaConductorFile = file;
    } else {
      event.target.value = '';
    }
  }

  private validateImageFile(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido.');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return false;
    }
    
    return true;
  }

  onSubmit(): void {
    // Validar que tengamos el usuario actual
    if (!this.currentUser || !this.currentUser.id) {
      this.submitError = 'Error: No se pudo obtener la información del usuario actual.';
      return;
    }

    if (this.bigbagForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      this.submitSuccess = false;

      const formData = this.bigbagForm.value;
      
      // Llamar al servicio pasando el ID del usuario
      this.bigbagService.enviarDatosBigBag(
        formData,
        this.currentUser.id,
        this.selectedFirmaFile || undefined,
        this.selectedFirmaConductorFile || undefined
      ).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          if (response.success) {
            this.submitSuccess = true;
            this.submitError = '';
            
            // Mostrar modal en lugar de alert
            this.numeroRecepcion = response.datos?.numero_recepcion || 'N/A';
            this.showSuccessModal = true;
            
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
      this.markAllFieldsAsTouched();
      this.submitError = 'Por favor complete todos los campos requeridos.';
    }
  }

  // Método para cerrar el modal de éxito
  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.resetForm();
  }

  // Método para cerrar el modal haciendo clic en el backdrop
  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeSuccessModal();
    }
  }

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
    this.showSuccessModal = false;
    this.numeroRecepcion = '';
    
    this.bigbagForm.patchValue({
      fechaIngreso: this.getTodayDate(),
      horaIngreso: this.getCurrentTime()
    });
    
    this.updateStepDisplay();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.bigbagForm.controls).forEach(key => {
      const control = this.bigbagForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

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