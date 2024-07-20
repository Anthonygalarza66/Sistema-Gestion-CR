import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.component.html',
  styleUrl: './registro-usuario.component.css'
})
export class RegistroUsuarioComponent {

  username: string = "Admin"; 
  private loggedIn = false;
  constructor(private router: Router) {}

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }

}
