import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EditarControlDialogoComponent } from "../editar-control-dialogo/editar-control-dialogo.component";


@Component({
  selector: 'app-registro-control',
  templateUrl: './registro-control.component.html',
  styleUrls: ['./registro-control.component.css'] 
})
export class RegistroControlComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  control_acceso: any[] = [];


  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en el navegador antes de acceder al localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado"; 
    }
    
    this.loadControlAcceso();
  }

  loadControlAcceso(): void {
    console.log("Cargando control de acceso...");
    this.apiService.getControlAcceso().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        this.control_acceso = data;
      },
      (error) => {
        console.error("Error al obtener control de acceso:", error);
      }
    );
  }  

logout() {
  this.loggedIn = false;
  localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
  localStorage.removeItem('role'); // Limpiar rol del localStorage
  this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
}



  exportarExcel(): void {
    console.log("Exportando a Excel...");
    if (this.control_acceso.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const exportData = this.control_acceso.map(row => ({
      Placas:row.placas,
      Fecha_de_ingreso:row.fecha_ingreso,
      Fecha_de_salida:row.fecha_salida,
      Nombres: row.nombre,
      Apellidos: row.apellidos,
      Sexo: row.sexo,
      Cédula: row.cedula,
      Tipo_de_ingreso: row.ingresante,
      Dirección:row.direccion,
      Personal_de_turno: row.username,
      Observaciones: row.observaciones,
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alicuotas");
    XLSX.writeFile(wb, "Listado_Accesos.xlsx");
  }

  filtrar() {
    const filtroLowerCase = this.filtro.toLowerCase();
  
    return this.control_acceso.filter(row => {
      return (row.placas?.toLowerCase().includes(filtroLowerCase) ||
              row.fecha_ingreso?.toLowerCase().includes(filtroLowerCase) ||
              row.fecha_salida?.toLowerCase().includes(filtroLowerCase) ||
              row.nombre?.toLowerCase().includes(filtroLowerCase) ||
              row.apellidos?.toLowerCase().includes(filtroLowerCase) ||
              row.sexo?.toLowerCase().includes(filtroLowerCase) ||
              row.cedula?.toLowerCase().includes(filtroLowerCase) ||
              row.ingresante?.toLowerCase().includes(filtroLowerCase) ||
              row.direccion?.toLowerCase().includes(filtroLowerCase) ||
              row.turno?.toLowerCase().includes(filtroLowerCase) ||
              row.observaciones?.toLowerCase().includes(filtroLowerCase));
    });
  }  

  editControl(id: number): void {
    this.apiService.getControlAccesoById(id).subscribe(data => {
      const modalRef = this.modalService.open(EditarControlDialogoComponent, {
        size: 'md', // Tamaño del modal
        backdrop: 'static', // Opcional: evitar que el modal se cierre al hacer clic fuera
        centered: true, // Opcional: centrar el modal
      });
  
      // Pasar datos al modal
      modalRef.componentInstance.data = data;
  
      modalRef.result.then(result => {
        if (result) {
          // Verificar y ajustar el formato de los datos si es necesario
          const updatedData = {
            ...result,
            fecha_ingreso: this.formatDate(result.fecha_ingreso),
            fecha_salida: result.fecha_salida ? this.formatDate(result.fecha_salida) : null
          };
  
          console.log('Datos actualizados antes de enviar al backend:', updatedData);
  
          this.apiService.updateControlAcceso(id, updatedData).subscribe(
            response => {
              console.log('Control de acceso actualizado', response);
              this.loadControlAcceso(); // Recargar datos
            },
            error => {
              console.error('Error al actualizar control de acceso:', error);
            }
          );
        }
      }, (reason) => {
        // Opcional: manejar el rechazo del modal
      });
    });
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
  }


  deleteControl(id: number): void {
    // Usar SweetAlert2 para mostrar un cuadro de confirmación
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el registro de control de acceso de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Eliminando control de acceso con ID:", id);
        this.apiService.deleteControlAcceso(id).subscribe(
          () => {
            console.log("Control de acceso eliminado con éxito");
            this.loadControlAcceso(); // Volver a cargar la lista de control de acceso después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar control de acceso:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}