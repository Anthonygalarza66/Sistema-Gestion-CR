import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-personal',
  templateUrl: './formulario-personal.component.html',
  styleUrl: './formulario-personal.component.css'
})
export class FormularioPersonalComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
  usuarios: any[] = [];
  usuariosPersonal: any[] = []; 
  nuevoPersonal: any = {
    id_usuario: '', 
    nombre: '',
    apellido: '', 
    cedula: '',
    sexo:'',
    perfil: '',
    observaciones:'',
    celular:'',
    correo_electronico: '',
  };
 
  validationErrors: any = {};
  cedulaExists: boolean = false;
  correoExists: boolean = false;
  celularExists: boolean = false;


  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (response) => {
        // Filtrar usuarios con rol de 'Residente'
        this.usuarios = response;
        this.usuariosPersonal = this.usuarios.filter(user => ['Administracion', 'Seguridad'].includes(user.perfil));
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  } 

  seleccionarUsuario(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id_usuario = Number(target.value);  // Convertir el id_usuario a número
  
    // Encuentra el usuario seleccionado
    const usuarioSeleccionado = this.usuariosPersonal.find(usuario => usuario.id_usuario === id_usuario);
  
    if (usuarioSeleccionado) {
      this.nuevoPersonal.id_usuario = usuarioSeleccionado.id_usuario;
      this.nuevoPersonal.nombre = usuarioSeleccionado.nombre;
      this.nuevoPersonal.apellido = usuarioSeleccionado.apellido;
      this.nuevoPersonal.correo_electronico = usuarioSeleccionado.correo_electronico;
    } else {
      console.error('Usuario no encontrado');
    }
  }
  

    // Verificar la disponibilidad del correo electrónico
    checkCorreoUsuarios() {
      if (!this.nuevoPersonal.correo_electronico) {
        this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
        return;
      }
    }

  // Verificar la disponibilidad del número de celular
  checkCelularPersonal() {
    if (!this.nuevoPersonal.celular) {
      this.validationErrors.celular = ['El número de celular es obligatorio.'];
      return;
    }
    // Formatear el número de celular
    let celular = this.nuevoPersonal.celular;
    if (celular.length === 10 && celular.startsWith('0')) {
      celular = '+593' + celular.substring(1);
    } else if (celular.length === 9) {
      celular = '+593' + celular;
    }
    // Guardar el formato formateado en el objeto nuevoPersonal
    this.nuevoPersonal.celular = celular;

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


   // Verificar la disponibilidad de la cédula
   checkCedulaPersonal() {
  if (!this.nuevoPersonal.cedula) {
    this.validationErrors.cedula = ["Cédula es obligatoria."];
    return;
  }

  // Lógica de validación de cédula ecuatoriana
  const cedula = this.nuevoPersonal.cedula;

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
  this.apiService.checkCedulaPersonal(this.nuevoPersonal.cedula).subscribe(
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
  checkCorreoPersonal() {
    if (!this.nuevoPersonal.correo_electronico) {
      this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
      return;
    }

    this.apiService.checkCorreoPersonal(this.nuevoPersonal.correo_electronico).subscribe(
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

   // Método para manejar el envío del formulario
   guardar(): void {
    console.log('Datos del personal:', this.nuevoPersonal);  // Depura aquí
    this.apiService.getUserIdByEmail(this.nuevoPersonal.correo_electronico).subscribe(
        (response) => {
            this.nuevoPersonal.id_usuario = response.id_usuario;
    
            this.apiService.createPersonal(this.nuevoPersonal).subscribe(
                (response) => {
                    console.log('Personal creado:', response);
                    Swal.fire({
                        title: 'Éxito',
                        text: 'Personal creado correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        this.router.navigate(['/registro-personal']);
                    });
                },
                (error) => {
                    console.error('Error al crear Personal:', error);
                    Swal.fire({
                        title: 'Error',
                        text: error.status === 422
                            ? 'Por favor, corrija los errores en el formulario.'
                            : 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            );
        },
        (error) => {
            console.error('Error al obtener id_usuario:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al obtener ID de usuario. Verifique el correo electrónico.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
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
