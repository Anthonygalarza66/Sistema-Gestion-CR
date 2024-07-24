import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-formulario-personal',
  templateUrl: './formulario-personal.component.html',
  styleUrl: './formulario-personal.component.css'
})
export class FormularioPersonalComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
  nuevoPersonal: any = {
    nombre: '',
    apellido: '',
    cedula: '',
    sexo:'',
    perfil: '',
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
    this.apiService.createPersonal(this.nuevoPersonal).subscribe(
      (response) => {
        console.log('Personal creado:', response);
        this.router.navigate(['/registro-personal']);
      },
      (error) => {
        console.error('Error al crear Personal:', error);
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
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
  
}
