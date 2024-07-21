import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-formulario-residentes',
  templateUrl: './formulario-residentes.component.html',
  styleUrl: './formulario-residentes.component.css'
})
export class FormularioResidentesComponent {
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";
  
  nuevoResidente: any = {
    nombre: '',
		apellido: '',
		cedula: '',
		sexo: '',
		perfil:'',
		direccion:'',
		celular:'',
		correo_electronico:'', 
		cantidad_vehiculos:'',
		vehiculo1_placa:'',
		vehiculo1_observaciones:'',
		vehiculo2_placa:'',
		vehiculo2_observaciones:'',
		vehiculo3_placa:'',
		vehiculo3_observaciones:'',
		observaciones:''
  };

  validationErrors: any = {};

  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
  }

  // Método para manejar el envío del formulario
  guardar() {
    this.apiService.createResidente(this.nuevoResidente).subscribe(
      (response) => {
        console.log('Residente creado:', response);
        this.router.navigate(['/registro-residentes']);
      },
      (error) => {
        console.error('Error al crear Residente:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
        } else {
          this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
        }
      }
    );
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }

}
