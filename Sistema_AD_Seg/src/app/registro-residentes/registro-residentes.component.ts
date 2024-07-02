import { Component , OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 


@Component({
  selector: 'app-registro-residentes',
  templateUrl: './registro-residentes.component.html',
  styleUrl: './registro-residentes.component.css'
})
export class RegistroResidentesComponent {
  username: string = "Admin"; 
  private loggedIn = false;
  filtro: string = '';

  data = [
    {
      placa: "ABC123",
      solar: "44",
      m2: "25,59",
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      cedula: "123456789",
      email: "ejemplo@",
      password: "*****",
      celular: "+593",
      direccion: "Calle Mayor 123",
    },
    {
      placa: "DEF456",
      solar: "44",
      m2: "25,59",
      nombre: "María",
      apellido: "Gómez",
      sexo:"F",
      cedula: "987654321",
      email: "ejemplo@",
      password: "*****",
      celular: "+593",
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
    console.log('Exportando a Excel...');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('residentes'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'residentes');
    XLSX.writeFile(wb, 'Listado_Residentes.xlsx');
 
  }
  
  filtrar() {
    return this.data.filter(row =>
      row.placa.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.sexo.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.cedula.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.celular.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.direccion.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
