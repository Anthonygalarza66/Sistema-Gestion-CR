import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-registro-personal',
  templateUrl: './registro-personal.component.html',
  styleUrl: './registro-personal.component.css'
})
export class RegistroPersonalComponent {
  username: string = "Admin"; 
  private loggedIn = false;
 
  personal = [
    {
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      identificacion: "123456789",
      perfil: "seguridad",
      email: "ejemplo@",
      password: "*****",
      observaciones: "*****",
      
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
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('personal'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'personal');
    XLSX.writeFile(wb, 'Listado_Personal.xlsx');
 
  }


}
