import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent {
  username: string = "Admin"; 
  private loggedIn = false;
  filtro: string = '';

 
  nombre: string = '';
  apellido: string = '';
  celular: string = '';
  cedula: string = '';
  nombreEvento: string = '';
  direccionEvento: string = '';
  cantidadVehiculos?: number  ;
  cantidadPersonas?: number ;
  tipoEvento: string = '';
  fechaHora: string = '';
  duracionEvento: string = '';
  observaciones: string = '';
  invitados?: File ;

  data = [
    {
    nombre: 'Juan',
    apellido: 'Pérez',
    celular: '123456789',
    cedula: '0011223344',
    nombreEvento: 'Conferencia de Tecnología',
    direccionEvento: 'Centro de Convenciones',
    cantidadVehiculos: 10,
    cantidadPersonas: 200,
    tipoEvento: 'Conferencia',
    fechaHora: '2023-07-01T09:00',
    duracionEvento: '4 horas',
    observaciones: 'Requiere proyector y sonido',
    invitados: null
    },

    {
      nombre: 'Ana',
      apellido: 'Pérez',
      celular: '45897',
      cedula: '0011223344',
      nombreEvento: 'Conferencia de Tecnología',
      direccionEvento: 'Centro de Convenciones',
      cantidadVehiculos: 10,
      cantidadPersonas: 200,
      tipoEvento: 'Conferencia',
      fechaHora: '2023-07-01T09:00',
      duracionEvento: '4 horas',
      observaciones: 'Requiere proyector y sonido',
      invitados: null
      },
    
  ];

  constructor(private router: Router) {}

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }

  exportarExcel(): void {
    console.log('Exportando a Excel...');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('eventos'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'eventos');
    XLSX.writeFile(wb, 'eventos.xlsx');
 
  }
  filtrar() {
    return this.data.filter(row =>
      row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.cedula.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.nombreEvento.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.tipoEvento.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.fechaHora.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.direccionEvento.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
