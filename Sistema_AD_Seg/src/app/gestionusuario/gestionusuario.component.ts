import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 



@Component({
  selector: 'app-gestionusuario',
  templateUrl: './gestionusuario.component.html',
  styleUrl: './gestionusuario.component.css'
})
export class GestionusuarioComponent {
  username: string = "Admin"; 
  private loggedIn = false;
  filtro: string = '';


  data = [
    {
      nombre: "Juan Alberto",
      apellido: "Pérez Peroza",
      perfil: "Guardia de seguridad",
      usuario: "Juan Perez",
      email: "juanito69@email.com",
      password:"*****",
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
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('Usuarios'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'Informacion_Usuarios.xlsx');

  }

  filtrar() {
    return this.data.filter(row =>
      row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.perfil.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.usuario.toLowerCase().includes(this.filtro.toLowerCase()) ||
      row.email.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

}
