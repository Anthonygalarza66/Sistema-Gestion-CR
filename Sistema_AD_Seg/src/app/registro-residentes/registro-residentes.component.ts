import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EditarResidenteDialogoComponent } from '../editar-residente-dialogo/editar-residente-dialogo.component';
import { ChangeDetectorRef } from '@angular/core';
 
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
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      this.apiService.getResidentes().subscribe((data: any) => {
        console.log('Datos recibidos:', data); // Verifica la estructura
        this.residentes = data.map((residente: any) => ({
          ...residente,
          placas: [residente.vehiculo1_placa, residente.vehiculo2_placa, residente.vehiculo3_placa].filter(placa => placa).join(', '),
          observacionesVehicular: [residente.vehiculo1_observaciones, residente.vehiculo2_observaciones, residente.vehiculo3_observaciones].filter(obs => obs).join(' | ')
        }));
      });
    }
  }
  


  loadResidentes(): void {
    console.log("Cargando residentes...");
    this.apiService.getResidentes().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        this.residentes = data.map((residente: any) => ({
          ...residente,
          placas: [residente.vehiculo1_placa, residente.vehiculo2_placa, residente.vehiculo3_placa].filter(placa => placa).join(', '),
          observacionesVehicular: [residente.vehiculo1_observaciones, residente.vehiculo2_observaciones, residente.vehiculo3_observaciones].filter(obs => obs).join(' | ')
        }));
      },
      (error) => {
        console.error("Error al obtener residentes:", error);
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
    const filtroLower = this.filtro.toLowerCase();
    return this.residentes.filter(
      (row) =>
        (row.usuario.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        (row.sexo && row.sexo.toLowerCase().includes(filtroLower)) ||
        (row.cedula && row.cedula.toLowerCase().includes(filtroLower)) ||
        (row.perfil && row.perfil.toLowerCase().includes(filtroLower)) ||
        (row.observaciones && row.observaciones.toLowerCase().includes(filtroLower))
    );
  }  

  // Métodos para editar residentes
  editResidentes(id: number): void {
    // Obtiene los datos del residente a editar
    this.apiService.getResidente(id).subscribe(data => {
      console.log('Datos recibidos:', data);

      // Abre el modal para editar el residente
      const modalRef = this.modalService.open(EditarResidenteDialogoComponent, {
        size: 'lg',
        backdrop: 'static',
        centered: true
      });

      // Pasa los datos del residente al modal
      modalRef.componentInstance.residente = data;

      // Maneja el resultado del modal
      modalRef.result.then(result => {
        if (result) {
          console.log('Datos del modal:', result);

          // Actualiza el residente en la API
          this.apiService.updateResidente(id, result).subscribe(
            response => {
              console.log('Residente actualizado', response);

              // Recarga la lista de residentes para reflejar los cambios
              this.loadResidentes();

              // Forza la detección de cambios para asegurar que la vista se actualice
              this.cdr.detectChanges();
            },
            error => {
              console.error('Error al actualizar residente:', error);
            }
          );
        }
      }, (reason) => {
        console.log('Modal cerrado con rechazo:', reason);
      });
    });
  }
  
  deleteResidentes(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el registro de residente de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Eliminando Residente con ID:", id);
        this.apiService.deleteResidente(id).subscribe(
          () => {
            console.log("Residente eliminado con éxito");
            this.loadResidentes(); // Volver a cargar la lista de residentes después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar Residente:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}
