import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-editar-control-dialogo',
  templateUrl: './editar-control-dialogo.component.html',
  styleUrls: ['./editar-control-dialogo.component.css']
})
export class EditarControlDialogoComponent implements OnInit {
  form!: FormGroup; 
  data: any;  // Propiedad para recibir datos

  usuariosSeguridad: any[] = [];
  usuarios: any[] = [];

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder, 
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario
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

    // Cargar los usuarios al inicializar el componente
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    console.log('Solicitando usuarios a la API...');
    this.apiService.getUsuarios().subscribe(
      (response) => {
        console.log('Usuarios obtenidos:', response);
        this.usuarios = response; // Asume que la respuesta es un array de usuarios
        this.filtrarUsuariosSeguridad();
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

  filtrarUsuariosSeguridad(): void {
    console.log('Filtrando usuarios de seguridad');
    this.usuariosSeguridad = this.usuarios.filter(
      (usuario: any) => usuario.perfil === 'Seguridad' && usuario.rol === 'Seguridad'
    );
    console.log('Usuarios de seguridad filtrados:', this.usuariosSeguridad);
  }

  GuardarUsername(event: any): void {
    const selectedUsername = event.target.value;
    console.log('Username seleccionado:', selectedUsername);
  
    // Buscar el usuario seleccionado en la lista de usuarios de seguridad
    const selectedUser = this.usuariosSeguridad.find((usuario: any) => usuario.username === selectedUsername);
    
    if (selectedUser) {
      this.form.patchValue({ username: selectedUser.username });
      console.log('Usuario encontrado:', selectedUser);
      console.log('Username asignado:', this.form.get('username')?.value);
    } else {
      this.form.patchValue({ username: '' });
      console.warn('Usuario no encontrado para el username:', selectedUsername);
    }
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
