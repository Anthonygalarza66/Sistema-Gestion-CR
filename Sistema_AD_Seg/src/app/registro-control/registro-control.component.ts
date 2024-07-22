import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";

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
    localStorage.removeItem("username"); // Limpiar nombre de usuario del localStorage
    this.router.navigate(["/login"]); // Redirige a la página de inicio de sesión
  }

  exportarExcel(): void {
    console.log("Exportando a Excel...");
    if (this.control_acceso.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.control_acceso);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ControlAcceso");
    XLSX.writeFile(wb, "Listado_ControlAcceso.xlsx");
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
    console.log("Editando control de acceso con ID:", id);
    this.router.navigate(["/formulario-control", id]);
  }

  deleteControl(id: number): void {
    const confirmDeletion = window.confirm(
      "¿Está seguro de eliminar este registro de control de acceso?"
    );

    if (confirmDeletion) {
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
  }
}