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
  filtro: string = '';


  data = [
    {
      placa: "ABC123",
      fechaingreso: "2023/11/14 14:00:05",
      fechasalida: "2023/11/14 14:00:05",
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      cedula: "123456789",
      residenteVisitante: "Residente",
      direccion: "Calle Mayor 123",
      turno: "A.Cepeda",
      observaciones: "",

    },
    {
      placa: "DEF456",
      fechaingreso: "2023/11/15",
      nombre: "María",
      apellido: "Gómez",
      sexo:"F",
      cedula: "987654321",
      residenteVisitante: "Visitante",
      direccion: "Avenida del Sol 456",
      turno: "E.Vibor",
      observaciones: "ojo",

    },
    {
      placa: "AAA-0001",
      fechaingreso: "2024/7/1 18:41",
      fechasalida: "2024/7/1 19:41",
      nombre: "Freya",
      apellido: "López López",
      sexo:"F",
      cedula: "0920720018",
      residenteVisitante: "Visitante",
      direccion: "Mz 44  V.43",
      turno: "E.Vibor",
      observaciones: "LLeva flores",

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

  filtrar() {
    return this.data.filter(row =>
      row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.cedula.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.placa.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.fechaingreso.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.residenteVisitante.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.direccion.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
  
}
