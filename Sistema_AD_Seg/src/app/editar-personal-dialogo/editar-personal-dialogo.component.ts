import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-editar-personal-dialogo',
  templateUrl: './editar-personal-dialogo.component.html',
  styleUrl: './editar-personal-dialogo.component.css'
})
export class EditarPersonalDialogoComponent implements OnInit {
  @Input() personal!: any; // Recibido del componente que abre el modal
  form!: FormGroup;
  validationErrors: any = {};

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('Datos en el modal:', this.personal);
    this.form = this.fb.group({
        id_personal: [this.personal.id_personal],  // No editable
        nombre: [this.personal.nombre, Validators.required],
        apellido: [this.personal.apellido, Validators.required],
        cedula: [this.personal.cedula, Validators.required],
        sexo: [this.personal.sexo, Validators.required],
        perfil: [this.personal.perfil, Validators.required],
        celular: [this.personal.celular, Validators.required],
        correo_electronico: [this.personal.correo_electronico],
        observaciones: [this.personal.observaciones]
    });
} 
  
  guardar(): void {
  if (this.form.invalid) {
      console.error('El formulario es inválido.');
      return;
  }

  // Asegúrate de que los campos id_usuario e id_personal estén presentes
  const personalData = { ...this.form.value, id_usuario: this.personal.id_usuario, id_personal: this.personal.id_personal };

  console.log(personalData); // Verificar los datos del formulario
  this.modalRef.close(personalData);
  }


  
}