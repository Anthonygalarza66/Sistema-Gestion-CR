import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-residente-dialogo',
  templateUrl: './editar-residente-dialogo.component.html',
  styleUrl: './editar-residente-dialogo.component.css'
})
export class EditarResidenteDialogoComponent implements OnInit {
  @Input() residente!: any; // Recibido del componente que abre el modal
  form!: FormGroup;
  validationErrors: any = {};

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('Datos en el modal:', this.residente);
    this.form = this.fb.group({
      nombre: [this.residente.nombre, Validators.required],
      apellido: [this.residente.apellido, Validators.required],
      cedula: [this.residente.cedula, Validators.required],
      perfil: [this.residente.perfil, Validators.required],
      sexo: [this.residente.sexo, Validators.required],
      direccion: [this.residente.direccion],
      celular: [this.residente.celular, Validators.required],
      correo_electronico: [this.residente.correo_electronico, [Validators.email]],
      cantidad_vehiculos: [this.residente.cantidad_vehiculos],
      vehiculo1_placa: [this.residente.vehiculo1_placa],
      vehiculo2_placa: [this.residente.vehiculo2_placa],
      vehiculo3_placa: [this.residente.vehiculo3_placa],
      vehiculo1_observaciones: [this.residente.vehiculo1_observaciones],
      vehiculo2_observaciones: [this.residente.vehiculo2_observaciones],
      vehiculo3_observaciones: [this.residente.vehiculo3_observaciones],
      solar: [this.residente.solar, Validators.required],
      m2: [this.residente.m2, Validators.required],
      observaciones: [this.residente.observaciones]
    });
  }
  
  

  guardar(): void {
    if (this.form.invalid) {
      console.error('El formulario es inválido.');
      return;
    }
  
    // Prepara los datos del residente
    const residenteData = { 
      ...this.form.value, 
      id_usuario: this.residente.id_usuario, 
      id_residente: this.residente.id_residente 
    };
    
    console.log(residenteData); // Verificar los datos del formulario
    
    // Muestra un mensaje de éxito
    Swal.fire({
      title: 'Guardado con éxito',
      text: 'Los datos del residente se han guardado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      // Cierra el modal después de mostrar el mensaje de éxito
      this.modalRef.close(residenteData);
    });
  }
}