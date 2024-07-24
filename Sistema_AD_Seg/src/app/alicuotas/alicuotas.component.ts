import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";

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

  totalAdeudadoGeneral: number = 0; // Total adeudado


  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      this.loadAlicuota(); // Llamada a cargar datos
    }
  }

  loadAlicuota(): void {
    console.log("Cargando alicuota...");
    this.apiService.getAlicuotas().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        this.alicuota = data;
      },
      (error) => {
        console.error("Error al obtener alicuota:", error);
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
  
   
  filtrar() {
    const filtroLowerCase = this.filtro.toLowerCase();
    return this.alicuota.filter(row =>
      (row.residente.nombre && row.residente.nombre.toLowerCase().includes(filtroLowerCase)) ||
      (row.residente.apellido && row.residente.apellido.toLowerCase().includes(filtroLowerCase)) ||
      (row.residente.solar && row.residente.solar.toLowerCase().includes(filtroLowerCase)) ||
      (row.residente.cedula && row.residente.cedula.toLowerCase().includes(filtroLowerCase)) ||
      (row.fecha && row.fecha.toLowerCase().includes(filtroLowerCase)) ||
      (row.mes && row.mes.toLowerCase().includes(filtroLowerCase)) ||
      (row.total && row.total.toString().toLowerCase().includes(filtroLowerCase)) ||
      (row.residente.direccion && row.residente.direccion.toLowerCase().includes(filtroLowerCase))
    );
  }  

  calcularTotalAdeudadoGeneral(): void {
    this.totalAdeudadoGeneral = this.alicuota
      .filter(row => !row.pagado)
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

  getTotalAdeudado(id_residente: number): number {
    return this.alicuota
      .filter(row => row.residente.id_residente === id_residente && !row.pagado)
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
    console.log("Editando personal con ID:", id);
    this.router.navigate(["/registro-alicuotas", id]);
  }

  deleteAlicuota(id: number): void {
    const confirmDeletion = window.confirm(
      "¿Está seguro de eliminar esta alicuota?"
    );

    if (confirmDeletion) {
      console.log("Eliminando alicuota con ID:", id);
      this.apiService.deleteAlicuota(id).subscribe(
        () => {
          console.log("Alicuota eliminada con éxito");
          this.loadAlicuota(); // Volver a cargar la lista de personal después de la eliminación
        },
        (error) => {
          console.error("Error al eliminar Alicuota:", error);
        }
      );
    } else {
      console.log("Eliminación cancelada");
    }
  }

}
