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
  celularExists: boolean = false;


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

  // Lógica de validación de cédula ecuatoriana
  const cedula = this.nuevoResidente.cedula;

  if (cedula.length !== 10) {
    this.validationErrors.cedula = ["La cédula debe tener 10 dígitos."];
    return;
  }

  const digitoRegion = parseInt(cedula.substring(0, 2), 10);
  if (digitoRegion < 1 || digitoRegion > 24) {
    this.validationErrors.cedula = ["Esta cédula no pertenece a ninguna región."];
    return;
  }

  const ultimoDigito = parseInt(cedula.substring(9, 10), 10);
  const pares = parseInt(cedula.substring(1, 2), 10) + parseInt(cedula.substring(3, 4), 10) +
                parseInt(cedula.substring(5, 6), 10) + parseInt(cedula.substring(7, 8), 10);

  const numeroImpar = (num: string) => {
    let n = parseInt(num, 10) * 2;
    return n > 9 ? n - 9 : n;
  };

  const impares = numeroImpar(cedula[0]) + numeroImpar(cedula[2]) + numeroImpar(cedula[4]) +
                  numeroImpar(cedula[6]) + numeroImpar(cedula[8]);

  const sumaTotal = pares + impares;
  const primerDigitoSuma = parseInt(sumaTotal.toString().substring(0, 1), 10);
  const decena = (primerDigitoSuma + 1) * 10;
  let digitoValidador = decena - sumaTotal;

  if (digitoValidador === 10) {
    digitoValidador = 0;
  }

  if (digitoValidador !== ultimoDigito) {
    this.validationErrors.cedula = ["La cédula es incorrecta."];
    return;
  }

  // Si la cédula es válida, verificar si está registrada
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

  // Verificar la disponibilidad del número de celular
  checkCelularR() {
    if (!this.nuevoResidente.celular) {
      this.validationErrors.celular = ['El número de celular es obligatorio.'];
      return;
    }

    // Formatear el número de celular
    let celular = this.nuevoResidente.celular;
    if (celular.length === 10 && celular.startsWith('0')) {
      celular = '+593' + celular.substring(1);
    } else if (celular.length === 9) {
      celular = '+593' + celular;
    }

    // Guardar el formato formateado en el objeto nuevoPersonal
    this.nuevoResidente.celular = celular;

    this.apiService.checkCelularPersonal(celular).subscribe(
      (response) => {
        this.celularExists = response.exists;
        if (this.celularExists) {
          this.validationErrors.celular = ['El número de celular ya está registrado.'];
        } else {
          this.validationErrors.celular = [];
        }
      },
      (error) => {
        console.error('Error al verificar el número de celular:', error);
        this.validationErrors.celular = ['Error al verificar el número de celular.'];
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
  localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
  localStorage.removeItem('role'); // Limpiar rol del localStorage
  this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
}
}
