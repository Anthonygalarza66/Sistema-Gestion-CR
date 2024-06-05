import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro-evento',
  templateUrl: './registro-evento.component.html',
  styleUrl: './registro-evento.component.css'
})
export class RegistroEventoComponent {
  username: string = "Admin"; 
  private loggedIn = false;


  constructor(private router: Router) {}

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }
}
