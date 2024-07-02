import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-formulario-control',
  templateUrl: './formulario-control.component.html',
  styleUrl: './formulario-control.component.css'
})
export class FormularioControlComponent {
  username: string = "Admin"; 
  private loggedIn = false;


  constructor(private router: Router) {}

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }

}
