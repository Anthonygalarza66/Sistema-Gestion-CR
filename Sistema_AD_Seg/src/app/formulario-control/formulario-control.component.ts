import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID } from '@angular/core';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-formulario-control',
  templateUrl: './formulario-control.component.html',
  styleUrls: ['./formulario-control.component.css']
})
export class FormularioControlComponent implements OnInit {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;

  nuevoControl: any = {
    id_usuario: '', 
    nombre: '',
    apellidos: '',
    cedula: '',
    sexo: '',
    placas: '',
    direccion: '',
    ingresante: '',
    fecha_ingreso: '',
    fecha_salida: '',
    observaciones: '',
    username: '' 
  };

  usuarios: any[] = []; 
  usuariosSeguridad: any[] = [];

  validationErrors: any = {};

  constructor(private router: Router, private apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    }
    console.log('Iniciando carga de usuarios');
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
    const selectedUserId = event.target.value;
    console.log('ID de usuario seleccionado:', selectedUserId);
  
    // Verificar si selectedUserId es un número
    const selectedIdNumber = parseInt(selectedUserId, 10);
    if (isNaN(selectedIdNumber)) {
      console.warn('El ID seleccionado no es válido:', selectedUserId);
      return;
    }
  
    // Buscar el usuario seleccionado en la lista de usuarios de seguridad
    const selectedUser = this.usuariosSeguridad.find((usuario: any) => usuario.id_usuario === selectedIdNumber);
    
    if (selectedUser) {
      this.nuevoControl.username = selectedUser.username;
      console.log('Usuario encontrado:', selectedUser);
      console.log('Username asignado:', this.nuevoControl.username);
    } else {
      this.nuevoControl.username = '';
      console.warn('Usuario no encontrado para el ID:', selectedUserId);
    }
  }

  onPlacaChange(event: any): void {
    const placaSeleccionada = event.target.value;
  
    // Buscar el residente asociado a la placa
    this.apiService.getResidentePorPlaca(placaSeleccionada).subscribe(
      (residente: any) => {
        if (residente) {
          this.nuevoControl.nombre = residente.nombre;
          this.nuevoControl.apellidos = residente.apellido;
          this.nuevoControl.cedula = residente.cedula;
          this.nuevoControl.sexo = residente.sexo;
        } else {
          // Limpiar los campos si no se encuentra el residente
          this.nuevoControl.nombre = '';
          this.nuevoControl.apellidos = '';
          this.nuevoControl.cedula = '';
          this.nuevoControl.sexo = '';
        }
      },
      (error) => {
        console.error('Error al obtener residente por placa:', error);
        // Limpiar los campos si ocurre un error
        this.nuevoControl.nombre = '';
        this.nuevoControl.apellidos = '';
        this.nuevoControl.cedula = '';
        this.nuevoControl.sexo = '';
      }
    );
  }
  

  guardar(): void {
    // Asegúrate de que el username esté configurado correctamente
    console.log('Enviando datos para crear control de acceso:', this.nuevoControl);
  
    this.apiService.createControlAcceso(this.nuevoControl).subscribe(
      (response) => {
        console.log('Control de acceso creado:', response);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: 'Guardado con éxito',
          text: 'El control de acceso se ha guardado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          // Redirigir después de cerrar el mensaje de éxito
          this.router.navigate(['/registro-control']);
        });
      },
      (error) => {
        console.error('Error al crear Control:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
        } else {
          this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
        }
      }
    );
  }

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
}
