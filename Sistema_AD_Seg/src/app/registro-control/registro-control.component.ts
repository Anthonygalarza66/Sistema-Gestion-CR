import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-registro-control',
  templateUrl: './registro-control.component.html',
  styleUrls: ['./registro-control.component.css'] 
})
export class RegistroControlComponent {
  username: string = "Admin"; 
  private loggedIn = false;
  data = [
    {
      placa: "ABC123",
      fecha: "2023-11-14",
      hora: "11:00",
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      cedula: "123456789",
      residenteVisitante: "Residente",
      direccion: "Calle Mayor 123",
    },
    {
      placa: "DEF456",
      fecha: "2023-11-15",
      nombre: "María",
      apellido: "Gómez",
      sexo:"F",
      cedula: "987654321",
      residenteVisitante: "Visitante",
      direccion: "Avenida del Sol 456",
    },
    
  ];
  
  constructor(private router: Router) {}

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }

  exportarExcel(): void {
    console.log('Exporting to Excel...');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('Registros'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    XLSX.writeFile(wb, 'Registros.xlsx');

  }
  
}
