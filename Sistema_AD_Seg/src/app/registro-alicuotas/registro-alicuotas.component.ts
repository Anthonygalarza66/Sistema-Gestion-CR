import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-alicuotas',
  templateUrl: './registro-alicuotas.component.html',
  styleUrl: './registro-alicuotas.component.css'
})
export class RegistroAlicuotasComponent {
  
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  nuevoAlicuota: any = {
    id_residente: null,
    fecha: '',
    mes: '',
    monto_por_cobrar: null
  };

  validationErrors: any = {};
  residentes: any[] = []; // Lista de residentes

  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
    this.loadResidentes(); // Cargar residentes al inicializar el componente
  }

  loadResidentes(): void {
    this.apiService.getResidentes().subscribe(
      (data: any[]) => {
        this.residentes = data;
      },
      (error) => {
        console.error('Error al obtener residentes:', error);
      }
    );
  }

  // Método para manejar el envío del formulario
  guardar(): void {
    this.apiService.createAlicuota(this.nuevoAlicuota).subscribe(
        (response) => {
            console.log('Alicuota creada:', response);
            Swal.fire({
                title: 'Éxito',
                text: 'La alícuota ha sido creada correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                this.router.navigate(['alicuotas']);
            });
        },
        (error) => {
            console.error('Error al crear Alicuota:', error);
            Swal.fire({
                title: 'Error',
                text: error.status === 422
                    ? 'Por favor, corrija los errores en el formulario.'
                    : 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            if (error.status === 422) {
                this.validationErrors = error.error.errors;
            } else {
                this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
            }
        }
    );
}
onDateChange(event: any): void {
  const selectedDate = new Date(event.target.value);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const monthIndex = selectedDate.getMonth(); // Obtén el índice del mes
  this.nuevoAlicuota.mes = monthNames[monthIndex]; // Asigna el nombre del mes al campo correspondiente
}


  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }

}
