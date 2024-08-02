import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { RolePipe } from "../role.pipe";


@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

 
  eventos: any[] = [];
  residentes: any[] = [];
  usuarios: any[] = [];
  row: any;


  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
    this.loadEventos();
  }

  loadEventos(): void {
    console.log("Cargando Eventos...");
    this.apiService.getEventos().subscribe(
      (eventos: any[]) => {
        console.log("Datos recibidos:", eventos);
        this.eventos = [];
        
        eventos.forEach((evento) => {
          // Obtener usuario relacionado
          this.apiService.getUsuario(evento.id_usuario).subscribe((usuario: any) => {
            // Obtener residente relacionado
            this.apiService.getResidente(evento.id_residente).subscribe((residente: any) => {
              // Combinar datos en el objeto evento
              this.eventos.push({
                ...evento,
                usuario: usuario,
                residente: residente
              });
  
              // Ordenar los eventos por fecha (opcional)
              this.eventos.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
            }, (error) => {
              console.error("Error al obtener residente:", error);
            });
          }, (error) => {
            console.error("Error al obtener usuario:", error);
          });
        });
      },
      (error) => {
        console.error("Error al obtener eventos:", error);
      }
    );
  }
  

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem("username"); // Limpiar nombre de usuario del localStorage
    this.router.navigate(["/login"]); // Redirige a la página de inicio de sesión
  }

  exportarExcel(): void {
    console.log("Exportando a Excel...");
    if (this.eventos.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.eventos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eventos");
    XLSX.writeFile(wb, "Listado_Eventos.xlsx");
  }

  filtrar(): any[] {
    const filtroLower = this.filtro.toLowerCase();
    return this.eventos.filter(
      (row) =>
        // Filtro basado en datos del objeto 'usuario'
        (row.usuario?.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario?.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        // Filtro basado en datos del objeto 'residente'
        (row.residente?.cedula && row.residente.cedula.toLowerCase().includes(filtroLower)) ||
        (row.residente?.celular && row.residente.celular.toLowerCase().includes(filtroLower)) ||
        (row.sexo && row.sexo.toLowerCase().includes(filtroLower)) ||
        (row.perfil && row.perfil.toLowerCase().includes(filtroLower)) ||
        (row.observaciones && row.observaciones.toLowerCase().includes(filtroLower))
    );
  }
  
  

  // Métodos para editar y eliminar eventos
  editEventos(id: number): void {
    console.log("Editando Evento con ID:", id);
    this.router.navigate(["/formulario-evento", id]);
  }

  deleteEventos(id: number): void {
    // Usar SweetAlert2 para mostrar un cuadro de confirmación
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el evento de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Eliminando evento con ID:", id);
        this.apiService.deleteEvento(id).subscribe(
          () => {
            console.log("Evento eliminado con éxito");
            this.loadEventos(); // Volver a cargar la lista de eventos después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar evento:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }

  getFileUrl(filename: string): string {
    return this.apiService.getFileUrl(filename); 
  }

  isRole(role: string): boolean {
    const userRole = localStorage.getItem('role');
    return userRole === role;
  }

  updateEstado(id: number, nuevoEstado: string): void {
  this.apiService.updateEventoEstado(id, nuevoEstado).subscribe(
    (evento) => {
      // Actualiza el estado en el modelo de datos
      const index = this.eventos.findIndex(e => e.id_evento === id);
      if (index !== -1) {
        this.eventos[index].estado = nuevoEstado;
      }
    },
    (error) => {
      console.error('Error al actualizar el estado:', error);
    }
  );
  }
  
}
