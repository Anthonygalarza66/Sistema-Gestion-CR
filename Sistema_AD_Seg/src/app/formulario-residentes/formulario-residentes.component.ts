import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-formulario-residentes",
  templateUrl: "./formulario-residentes.component.html",
  styleUrl: "./formulario-residentes.component.css",
})
export class FormularioResidentesComponent {
  
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  nuevoResidente: any = {
    nombre: "",
    apellido: "",
    cedula: "",
    sexo: "",
    perfil: "",
    direccion: "",
    celular: "",
    correo_electronico: "",
    cantidad_vehiculos: "",
    vehiculo1_placa: "",
    vehiculo1_observaciones: "",
    vehiculo2_placa: "",
    vehiculo2_observaciones: "",
    vehiculo3_placa: "",
    vehiculo3_observaciones: "",
    observaciones: "",
  };

  validationErrors: any = {};
  cedulaExists: boolean = false;
  correoExists: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
  }

  // Verificar la disponibilidad de la cédula
  checkCedula() {
    if (!this.nuevoResidente.cedula) {
      this.validationErrors.cedula = ["Cédula es obligatoria."];
      return;
    }

    this.apiService.checkCedula(this.nuevoResidente.cedula).subscribe(
      (response) => {
        this.cedulaExists = response.exists;
        if (this.cedulaExists) {
          this.validationErrors.cedula = ["La cédula ya está registrada."];
        } else {
          this.validationErrors.cedula = [];
        }
      },
      (error) => {
        console.error("Error al verificar cédula:", error);
        this.validationErrors.cedula = ["Error al verificar la cédula."];
      }
    );
  }

  // Verificar la disponibilidad del correo electrónico
  checkCorreo() {
    if (!this.nuevoResidente.correo_electronico) {
      this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
      return;
    }

    this.apiService.checkCorreo(this.nuevoResidente.correo_electronico).subscribe(
      (response) => {
        this.correoExists = response.exists;
        if (this.correoExists) {
          this.validationErrors.correo_electronico = ['El correo electrónico ya está registrado.'];
        } else {
          this.validationErrors.correo_electronico = [];
        }
      },
      (error) => {
        console.error('Error al verificar correo electrónico:', error);
        this.validationErrors.correo_electronico = ['Error al verificar el correo electrónico.'];
      }
    );
  }

  guardar() {
    if (this.cedulaExists || this.correoExists) {
      this.validationErrors.general = 'Por favor, corrija los errores antes de enviar el formulario.';
      return;
    }

    this.apiService.createResidente(this.nuevoResidente).subscribe(
      (response) => {
        console.log('Residente creado:', response);
        this.router.navigate(['/registro-residentes']);
      },
      (error) => {
        console.error('Error al crear Residente:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors || {};
        } else {
          this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
        }
      }
    );
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem("username"); // Limpiar nombre de usuario del localStorage
    this.router.navigate(["/login"]); // Redirige a la página de inicio de sesión
  }
}
