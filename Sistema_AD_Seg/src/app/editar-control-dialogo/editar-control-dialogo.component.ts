import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-editar-control-dialogo',
  templateUrl: './editar-control-dialogo.component.html',
  styleUrls: ['./editar-control-dialogo.component.css']
})
export class EditarControlDialogoComponent implements OnInit {
  form!: FormGroup; 
  data: any;  // Propiedad para recibir datos

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Asegúrate de que 'data' esté inicializada antes de usarla
    this.form = this.fb.group({
      id_usuario: [this.data.id_usuario, Validators.required],
      placas: [this.data.placas, Validators.required],
      fecha_ingreso: [this.data.fecha_ingreso, Validators.required],
      fecha_salida: [this.data.fecha_salida],
      nombre: [this.data.nombre, Validators.required],
      apellidos: [this.data.apellidos, Validators.required],
      sexo: [this.data.sexo, Validators.required],
      cedula: [this.data.cedula, Validators.required],
      ingresante: [this.data.ingresante, Validators.required],
      direccion: [this.data.direccion, Validators.required],
      username: [this.data.username],
      observaciones: [this.data.observaciones]
    });
  }

  save(): void {
    const formData = { ...this.form.value };
    formData.fecha_ingreso = this.formatDate(formData.fecha_ingreso);
    formData.fecha_salida = formData.fecha_salida ? this.formatDate(formData.fecha_salida) : null;
    
    console.log('Datos del formulario antes de guardar:', formData);
    this.modalRef.close(formData);
  }
  
  private formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
  }
}
