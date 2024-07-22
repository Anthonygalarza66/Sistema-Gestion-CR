import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'app-registro-evento',
  templateUrl: './registro-evento.component.html',
  styleUrl: './registro-evento.component.css'
})
export class RegistroEventoComponent {

  username: string = ""; // Inicialmente vacío
  private loggedIn = false;
  filtro: string = "";

  nuevoEvento: any = {
    nombre: '',
    apellidos: '',
    celular: '',
    cedula: '',
    nombre_evento: '',
    direccion_evento: '',
    cantidad_vehiculos: 0,
    cantidad_personas: 0,
    tipo_evento: '',
    fecha_hora: '',
    duracion_evento: 0,
    listado_evento: null,
    observaciones: ''
  };

  validationErrors: any = {};

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    }
  }

   // Método para manejar el envío del formulario
   guardar() {
    const formData = new FormData();
  
    // Añadir los campos del formulario a FormData
    Object.keys(this.nuevoEvento).forEach(key => {
      if (this.nuevoEvento[key] !== null) {
        formData.append(key, this.nuevoEvento[key]);
      }
    });
  
    this.apiService.createEvento(formData).subscribe(
      (response) => {
        console.log('Evento creado:', response);
        this.router.navigate(['/eventos']);
      },
      (error) => {
        console.error('Error al crear evento:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
        } else {
          this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
        }
      }
    );
  }  

  subirdoc(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevoEvento.listado_evento = file; 
    }
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
}