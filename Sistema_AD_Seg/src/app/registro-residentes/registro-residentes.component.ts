import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
 
@Component({
  selector: 'app-registro-residentes',
  templateUrl: './registro-residentes.component.html',
  styleUrl: './registro-residentes.component.css'
})
export class RegistroResidentesComponent implements OnInit {
  
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  residentes: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.apiService.getResidentes().subscribe((data: any) => {
      this.residentes = data.map((residente: any) => ({
        ...residente,
        placas: [residente.vehiculo1_placa, residente.vehiculo2_placa, residente.vehiculo3_placa].filter(placa => placa).join(', '),
        observacionesVehicular: [residente.vehiculo1_observaciones, residente.vehiculo2_observaciones, residente.vehiculo3_observaciones].filter(obs => obs).join(' | ')
      }));
    });
  }

  loadResidentes(): void {
    console.log("Cargando residentes...");
    this.apiService.getResidentes().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        this.residentes = data;
      },
      (error) => {
        console.error("Error al obtener residentes:", error);
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
    if (this.residentes.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.residentes);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Residentes");
    XLSX.writeFile(wb, "Listado_loadResidentes.xlsx");
  }

  filtrar() {
    const filtrados = this.residentes.filter(
      (row) =>
        row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.sexo.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.cedula.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.perfil.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.observaciones.toLowerCase().includes(this.filtro.toLowerCase())
    );
    return filtrados;
  }

  // Métodos para editar residentes
  editResidentes(id: number): void {
    console.log("Editando residentes con ID:", id);
    this.router.navigate(["/formulario-personal", id]);
  }

  deleteResidentes(id: number): void {
    const confirmDeletion = window.confirm(
      "¿Está seguro de eliminar este Residente?"
    );

    if (confirmDeletion) {
      console.log("Eliminando Residentes con ID:", id);
      this.apiService.deleteResidente(id).subscribe(
        () => {
          console.log("Residente eliminado con éxito");
          this.loadResidentes(); // Volver a cargar la lista de Residente después de la eliminación
        },
        (error) => {
          console.error("Error al eliminar Residente:", error);
        }
      );
    } else {
      console.log("Eliminación cancelada");
    }
  }
}
