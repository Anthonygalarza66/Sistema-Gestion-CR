import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-editar-control-dialogo',
  templateUrl: './editar-control-dialogo.component.html',
  styleUrls: ['./editar-control-dialogo.component.css'] // Corregido: debe ser 'styleUrls' en lugar de 'styleUrl'
})
export class EditarControlDialogoComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditarControlDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    // Inicializa el formulario con los datos proporcionados
    this.form = this.fb.group({
      placas: [data.placas || ''],
      fecha_ingreso: [data.fecha_ingreso || ''],
      fecha_salida: [data.fecha_salida || ''],
      nombre: [data.nombre || ''],
      apellidos: [data.apellidos || ''],
      sexo: [data.sexo || ''],
      cedula: [data.cedula || ''],
      ingresante: [data.ingresante || ''],
      direccion: [data.direccion || ''],
      username: [data.username || ''],
      observaciones: [data.observaciones || ''],
    });
  }

  onNoClick(): void {
    // Cierra el diálogo sin hacer cambios
    this.dialogRef.close();
  }

  save(): void {
    console.log('Datos del formulario antes de guardar:', this.form.value);
    this.dialogRef.close(this.form.value);
  }
}
