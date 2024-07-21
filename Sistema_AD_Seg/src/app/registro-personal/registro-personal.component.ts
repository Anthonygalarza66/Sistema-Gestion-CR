import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";

@Component({
  selector: "app-registro-personal",
  templateUrl: "./registro-personal.component.html",
  styleUrls: ["./registro-personal.component.css"],
})
export class RegistroPersonalComponent implements OnInit {
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  personal: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
    this.loadPersonal();
  }

  loadPersonal(): void {
    console.log("Cargando personal...");
    this.apiService.getPersonales().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        this.personal = data;
      },
      (error) => {
        console.error("Error al obtener personal:", error);
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
    if (this.personal.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.personal);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Personal");
    XLSX.writeFile(wb, "Listado_Personal.xlsx");
  }

  filtrar() {
    const filtrados = this.personal.filter(
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

  // Métodos para editar personal
  editPersonal(id: number): void {
    console.log("Editando personal con ID:", id);
    this.router.navigate(["/formulario-personal", id]);
  }

  deletePersonal(id: number): void {
    const confirmDeletion = window.confirm(
      "¿Está seguro de eliminar este personal?"
    );

    if (confirmDeletion) {
      console.log("Eliminando personal con ID:", id);
      this.apiService.deletePersonal(id).subscribe(
        () => {
          console.log("Personal eliminado con éxito");
          this.loadPersonal(); // Volver a cargar la lista de personal después de la eliminación
        },
        (error) => {
          console.error("Error al eliminar personal:", error);
        }
      );
    } else {
      console.log("Eliminación cancelada");
    }
  }
}
