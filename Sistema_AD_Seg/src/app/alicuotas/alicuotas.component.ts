import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-alicuotas',
  templateUrl: './alicuotas.component.html',
  styleUrl: './alicuotas.component.css'
})
export class AlicuotasComponent {

  username: string = "Admin"; 
  private loggedIn = false;
  filtro: string = '';

  data = [
    {
      solar: "44",
      m2: "25,44",
      nombre: "Juan",
      apellido: "Perez",
      cedula: "123456789",
      direccion: "mz villa",
      fecha: "10/04/2022",
      mes: "Abril",
      deuda: "",
      total: "0",
    },
    {
      solar: "44",
      m2: "25,44",
      nombre: "Ana",
      apellido: "Perez",
      cedula: "123456789",
      direccion: "mz villa",
      fecha: "10/05/2022",
      mes: "Mayo",
      deuda: "150",
      total: "150",
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
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('alicuotas'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'alicuotas');
    XLSX.writeFile(wb, 'Alicuotas.xlsx');

  }
  
  filtrar() {
    return this.data.filter(row =>
      row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.cedula.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.fecha.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.mes.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.total.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.direccion.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

}
