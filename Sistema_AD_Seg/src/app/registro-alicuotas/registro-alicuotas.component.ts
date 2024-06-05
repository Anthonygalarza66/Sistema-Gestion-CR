import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro-alicuotas',
  templateUrl: './registro-alicuotas.component.html',
  styleUrl: './registro-alicuotas.component.css'
})
export class RegistroAlicuotasComponent {
  username: string = "Admin"; 
  private loggedIn = false;


  constructor(private router: Router) {}

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }


}
