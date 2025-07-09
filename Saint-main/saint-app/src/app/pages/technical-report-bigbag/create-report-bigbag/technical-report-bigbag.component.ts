import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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
      planta: ['', Validators.required], // Ahora es un input text
      remision: ['', Validators.required],
      cantidadRelacionada: ['', [Validators.required, Validators.min(1)]],
      nomOperario: ['', Validators.required],
      firma: [''], // Ahora es un input image - opcional
      observaciones: ['', Validators.required],
      
      // Paso 2: Información Adicional
      nomConductor: ['', Validators.required],
      placaVehiculo: ['', Validators.required],
      empresaTransporte: ['', Validators.required],
      documentoConductor: ['', Validators.required],
      
      // Paso 3: Datos Físicos
      cantidadFisico: ['', [Validators.required, Validators.min(0)]],
      diferenciaReportada: [''],
      pesoTotal: ['', [Validators.required, Validators.min(0)]],
      estadoEmpaque: ['', Validators.required],
      tipoMaterial: ['', Validators.required],
      observacionesFisicas: ['']
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

  // Función corregida para calcular la diferencia reportada
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
          mensajeDiferencia = ` +${diferencia} productos de más`;
        } else if (diferencia < 0) {
          mensajeDiferencia = `${Math.abs(diferencia)} productos faltantes`;
        } else {
          mensajeDiferencia = ' Las cantidades coinciden';
        }
        
        // Actualizar el campo de diferencia reportada
        this.bigbagForm.patchValue({
          diferenciaReportada: mensajeDiferencia
        });
      }
    }
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
        return ['cantidadFisico', 'pesoTotal', 'estadoEmpaque', 'tipoMaterial'];
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
    // Actualiza las clases CSS de los pasos
    this.updateStepStyles();
    
    // Muestra/oculta los contenidos de cada paso
    this.updateStepContent();
  }

  private updateStepStyles(): void {
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepElement = document.getElementById(`cont_paso${i}`);
      const stepCircle = stepElement?.querySelector('.paso');
      
      if (stepElement && stepCircle) {
        // Remover clases existentes
        stepElement.classList.remove('active', 'completed');
        stepCircle.classList.remove('active', 'completed');
        
        // Añadir clase según el estado
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
    // Oculta todos los contenidos de pasos
    const allStepContents = document.querySelectorAll('.step-content');
    allStepContents.forEach(content => {
      (content as HTMLElement).style.display = 'none';
    });
    
    // Muestra solo el contenido del paso actual
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

  // Manejo de firma - ahora para input image
  onSignatureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Aquí puedes manejar la carga del archivo de imagen
      console.log('Archivo de firma seleccionado:', file.name);
      
      // Opcionalmente, puedes leer el archivo para mostrarlo como preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bigbagForm.patchValue({
          firma: e.target?.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Envío del formulario
  onSubmit(): void {
    if (this.bigbagForm.valid) {
      const formData = this.bigbagForm.value;
      console.log('Datos del formulario:', formData);
      
      // Aquí enviarías los datos a tu servicio
      // this.bigbagService.submitForm(formData).subscribe(...)
      
      alert('Formulario enviado exitosamente');
    } else {
      console.log('Formulario inválido');
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.bigbagForm.controls).forEach(key => {
      const control = this.bigbagForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Getters para facilitar el acceso en el template
  get fechaIngreso() { return this.bigbagForm.get('fechaIngreso'); }
  get horaIngreso() { return this.bigbagForm.get('horaIngreso'); }
  get planta() { return this.bigbagForm.get('planta'); }
  get remision() { return this.bigbagForm.get('remision'); }
  get cantidadRelacionada() { return this.bigbagForm.get('cantidadRelacionada'); }
  get nomOperario() { return this.bigbagForm.get('nomOperario'); }
  get firma() { return this.bigbagForm.get('firma'); }
  get observaciones() { return this.bigbagForm.get('observaciones'); }
  get nomConductor() { return this.bigbagForm.get('nomConductor'); }
  get placaVehiculo() { return this.bigbagForm.get('placaVehiculo'); }
  get empresaTransporte() { return this.bigbagForm.get('empresaTransporte'); }
  get documentoConductor() { return this.bigbagForm.get('firmaConductor'); }
  get cantidadFisico() { return this.bigbagForm.get('cantidadFisico'); }
  get diferenciaReportada() { return this.bigbagForm.get('diferenciaReportada'); }

}