import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";

@Component({
  selector: "app-gestionusuario",
  templateUrl: "./gestionusuario.component.html",
  styleUrls: ["./gestionusuario.component.css"],
})
export class GestionusuarioComponent implements OnInit {
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  usuarios: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    console.log("Cargando usuarios...");
    this.apiService.getUsuarios().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        // Enmascarar las contraseñas antes de asignar los datos a this.usuarios
        this.usuarios = data.map((usuario) => ({
          ...usuario,
          contrasena: "*****", // Enmascarar la contraseña
        }));
      },
      (error) => {
        console.error("Error al obtener usuarios:", error);
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
    if (this.usuarios.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuarios);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "Informacion_Usuarios.xlsx");
  }

  // Métodos editar usuario
  editUsuario(id: number): void {
    console.log("Editando usuario con ID:", id);
    // Aquí podrías redirigir a una página de edición o mostrar un formulario de edición
    // Por ejemplo:
    this.router.navigate(["/formulario-personal", id]);
  }

  deleteUsuario(id: number): void {
    const confirmDeletion = window.confirm(
      "¿Está seguro de eliminar este usuario?"
    );

    if (confirmDeletion) {
      console.log("Eliminando usuario con ID:", id);
      this.apiService.deleteUsuario(id).subscribe(
        () => {
          console.log("Usuario eliminado con éxito");
          this.loadUsuarios(); // Volver a cargar la lista de usuarios después de la eliminación
        },
        (error) => {
          console.error("Error al eliminar usuario:", error);
        }
      );
    } else {
      console.log("Eliminación cancelada");
    }
  }

  filtrar() {
    return this.usuarios.filter(
      (row) =>
        row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.perfil.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.username.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.correo_electronico.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
