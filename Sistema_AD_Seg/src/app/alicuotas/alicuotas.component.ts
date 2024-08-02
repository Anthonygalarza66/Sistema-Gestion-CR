import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { EditarAlicuotasDialogoComponent } from '../editar-alicuotas-dialogo/editar-alicuotas-dialogo.component';

 
@Component({
  selector: 'app-alicuotas',
  templateUrl: './alicuotas.component.html',
  styleUrl: './alicuotas.component.css'
})
export class AlicuotasComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  alicuota: any[] = [];
  residentes: any[] = [];
  usuarios: any[] = [];

  totalAdeudadoGeneral: number = 0; // Total adeudado
  idUsuario: number | null = null;
  role: string | null = null;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      this.role = localStorage.getItem("role"); // Obtener el rol del localStorage
      if (this.role === "Residente") {
        this.loadUserId(); // Solo cargar el ID si el rol es "Residente"
      } else {
        // Manejo para cuando el rol no es "Residente"
        this.idUsuario = null;
        this.loadAlicuota();
      }
    }
  }

  loadUserId(): void {
    if (this.username !== "Invitado") {
      this.apiService.getUserIdByUsername(this.username).subscribe(
        (data: any) => {
          this.idUsuario = data.id_usuario;
          console.log("ID de Usuario en loadUserId:", this.idUsuario); // Verifica si se está estableciendo correctamente
          this.loadAlicuota(); // Cargar alícuotas después de obtener el ID
        },
        (error) => {
          console.error("Error al obtener ID de Usuario:", error);
        }
      );
    } else {
      // Si el usuario es "Invitado", no cargar alícuotas específicas
      this.idUsuario = null;
      this.loadAlicuota();
    }
  }  

  loadAlicuota(): void {
    console.log("Cargando alícuotas...");
    this.apiService.getAlicuotas().subscribe(
      (alicuotas: any[]) => {
        console.log("Datos recibidos:", alicuotas);
        this.alicuota = [];
    
        // Crear un array de promesas para obtener los datos relacionados
        const promesas = alicuotas.map(alicuota => {
          return this.apiService.getUsuario(alicuota.residente.id_usuario).pipe(
            switchMap((usuario: any) => 
              this.apiService.getResidente(alicuota.residente.id_residente).pipe(
                map((residente: any) => ({
                  ...alicuota,
                  usuario: usuario,
                  residente: residente
                }))
              )
            )
          ).toPromise();
        });
  
        // Esperar a que todas las promesas se resuelvan
        Promise.all(promesas).then(resultados => {
          this.alicuota = resultados;
  
          // Filtrar las alícuotas si el rol es "Residente"
          if (this.idUsuario !== null && this.role === "Residente") {
            this.alicuota = this.alicuota.filter(alicuota => 
              alicuota.residente.id_usuario === this.idUsuario
            );
          }
  
          // Ordenar las alícuotas por fecha (opcional)
          this.alicuota.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  
          // Recalcular total adeudado
          this.calcularTotalAdeudadoGeneral();
        }).catch(error => {
          console.error("Error al obtener datos relacionados:", error);
        });
      },
      (error) => {
        console.error("Error al obtener alícuotas:", error);
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
    if (this.alicuota.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
  
    // Combina datos de alícuotas y residentes en un nuevo array
    const exportData = this.alicuota.map(row => ({
      Solar: row.residente.solar,
      M2: row.residente.m2,
      Nombre: row.residente.nombre,
      Apellido: row.residente.apellido,
      Cedula: row.residente.cedula,
      Direccion: row.residente.direccion,
      Fecha: row.fecha,
      Mes: row.mes,
      MontoPorCobrar: row.monto_por_cobrar,
      Estado: row.pagado ? 'Pagado' : 'No Pagado',
      Total: this.getTotalAdeudado(row.residente.id_residente)
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alicuotas");
    XLSX.writeFile(wb, "Listado_Alicuotas.xlsx");
  }
  
   
  filtrar(): any[] {
    const filtroLower = this.filtro.toLowerCase();
    
    return this.alicuota.filter(row =>
      // Filtro basado en datos del objeto 'usuario'
      (row.usuario?.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
      (row.usuario?.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
      // Filtro basado en datos del objeto 'residente'
      (row.residente?.cedula && row.residente.cedula.toLowerCase().includes(filtroLower)) ||
      (row.residente?.celular && row.residente.celular.toLowerCase().includes(filtroLower)) ||
      (row.residente?.solar && row.residente.solar.toLowerCase().includes(filtroLower)) ||
      (row.residente?.direccion && row.residente.direccion.toLowerCase().includes(filtroLower)) ||
      // Filtro basado en datos adicionales de la alícuota
      (row.fecha && row.fecha.toLowerCase().includes(filtroLower)) ||
      (row.mes && row.mes.toLowerCase().includes(filtroLower)) ||
      (row.monto_por_cobrar && row.monto_por_cobrar.toString().toLowerCase().includes(filtroLower))
    );
  }
  

  calcularTotalAdeudadoGeneral(): void {
    this.totalAdeudadoGeneral = this.alicuota
      .filter(row => !row.pagado)
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

  getTotalAdeudado(id_residente: number | null): number {
    if (id_residente === null) {
      return 0;
    }
    
    return this.alicuota
      .filter(row => row.residente?.id_residente === id_residente && !row.pagado)
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

  marcarpago(id: number): void {
    console.log("Marcando alícuota como pagado con ID:", id);
    this.apiService.marcarpagoAlicuitas(id).subscribe(
      () => {
        console.log("Pago marcado exitosamente");
        // Volver a cargar la lista de alícuotas y recalcular el total adeudado
        this.loadAlicuota();
      },
      (error) => {
        console.error("Error al marcar el pago:", error);
      }
    );
  }

   // Métodos para editar personal
   editAlicuota(id: number): void {
    this.apiService.getAlicuota(id).subscribe(data => {
      const modalRef = this.modalService.open(EditarAlicuotasDialogoComponent, {
        size: 'md',
        backdrop: 'static',
        centered: true
      });
  
      modalRef.componentInstance.data = data;
  
      modalRef.result.then(result => {
        if (result) {
          this.apiService.updateAlicuota(id, result).subscribe(
            response => {
              console.log('Alícuota actualizada', response);
              this.loadAlicuota(); // Recargar la lista de alícuotas
            },
            error => {
              console.error('Error al actualizar alícuota:', error);
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
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
  }

  deleteAlicuota(id: number): void {
    Swal.fire({
      title: '¿Está seguro de eliminar esta alicuota?',
      text: "¿Está seguro de eliminar esta alicuota?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Eliminando alícuota con ID:", id);
        this.apiService.deleteAlicuota(id).subscribe(
          () => {
            console.log("Alícuota eliminada con éxito");
            this.loadAlicuota(); // Volver a cargar la lista de alícuotas después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar alícuota:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }

}
