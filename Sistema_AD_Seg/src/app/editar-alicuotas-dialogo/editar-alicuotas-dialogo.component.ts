import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-editar-alicuotas-dialogo',
  templateUrl: './editar-alicuotas-dialogo.component.html',
  styleUrls: ['./editar-alicuotas-dialogo.component.css']
})
export class EditarAlicuotasDialogoComponent implements OnInit {
  form!: FormGroup;
  data: any;  // Propiedad para recibir datos

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario
    this.form = this.fb.group({
      id_alicuota: [this.data.id_alicuota],  // No editable
      fecha: [this.data.fecha, Validators.required],
      mes: [this.data.mes, Validators.required],
      monto_por_cobrar: [this.data.monto_por_cobrar, Validators.required],
      pagado: [this.data.pagado]
    });
  }

  save(): void {
    if (this.form.invalid) {
        console.error('El formulario es inválido.');
        return;
    }

    // Convertir el valor de 'pagado' a número (0 o 1)
    const formData = { 
        ...this.form.value, 
        pagado: Number(this.form.value.pagado)
    };

    console.log('Datos del formulario antes de guardar:', formData);
    this.apiService.updateAlicuota(this.data.id_alicuota, formData).subscribe(
        (response) => {
            console.log('Alícuota actualizada:', response);
            this.modalRef.close(response);
        },
        (error) => {
            console.error('Error al actualizar la alícuota:', error);
        }
    );
}

  
  
}
