import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {EditarPersonalDialogoComponent} from '../editar-personal-dialogo/editar-personal-dialogo.component';

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
    private modalService: NgbModal,
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
  localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
  localStorage.removeItem('role'); // Limpiar rol del localStorage
  this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
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
    const filtroLower = this.filtro.toLowerCase();
    const filtrados = this.personal.filter(
      (row) =>
        (row.usuario.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        (row.sexo.toLowerCase().includes(this.filtro.toLowerCase()) )||
        (row.cedula.toLowerCase().includes(this.filtro.toLowerCase())) ||
        (row.perfil.toLowerCase().includes(this.filtro.toLowerCase()) )||
        (row.observaciones.toLowerCase().includes(this.filtro.toLowerCase()))
    );
    return filtrados;
  }

  // Métodos para editar personal
  editPersonal(id: number): void {
    this.apiService.getPersonal(id).subscribe(data => {
      console.log('Datos recibidos:', data);
      const modalRef = this.modalService.open(EditarPersonalDialogoComponent, {
        size: 'md',
        backdrop: 'static',
        centered: true
      });
      modalRef.componentInstance.personal = data;
      
      modalRef.result.then(result => {
        if (result) {
          console.log('Datos del modal:', result);
          this.apiService.updatePersonal(id, result).subscribe(
            response => {
              console.log('Personal actualizado', response);
              this.loadPersonal(); // Recargar la lista de personales
            },
            error => {
              console.error('Error al actualizar personal:', error);
            }
          );
        }
      }, (reason) => {
        console.log('Modal cerrado con rechazo:', reason);
      });
    });
  }
  

  deletePersonal(id: number): void {
    // Usar SweetAlert2 para mostrar un cuadro de confirmación
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el registro de personal de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
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
    });
  }
}
