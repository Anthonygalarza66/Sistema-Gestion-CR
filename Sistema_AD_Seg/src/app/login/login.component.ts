import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = ''; 
  password: string = '';
  showNotification: boolean = false;
  notificationMessage: string = '';

  constructor(private router: Router, private apiService: ApiService) {}

  login() {
    this.apiService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          const storedUsername = localStorage.getItem('username');
          const role = localStorage.getItem('role');
          console.log('Nombre de usuario almacenado:', storedUsername);
          console.log('Rol del usuario:', role);
  
          // Redirigir según el rol del usuario
          if (role === 'Administracion') {
            this.router.navigate(['/gestionusuario']);
          } else if (role === 'Seguridad') {
            this.router.navigate(['/registro-control']);
          } else if (role === 'Residente') {
            this.router.navigate(['/eventos']);
          } else {
            this.router.navigate(['/access-denied']);
          }
        } else {
          alert('Nombre de usuario o contraseña incorrectos');
        }
      },
      error: (err) => {
        console.error('Error al autenticar', err);
        alert('Error en la autenticación');
      }
    });
  }
  

  forgotPassword() {
    this.router.navigate(['/loginpassword']);
  }
}
