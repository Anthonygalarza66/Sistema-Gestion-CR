import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import Swal from 'sweetalert2';


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
                Swal.fire({
                    title: 'Error',
                    text: 'Nombre de usuario o contraseña incorrectos',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: (err) => {
            console.error('Error al autenticar', err);
            Swal.fire({
                title: 'Error',
                text: 'Error en la autenticación',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });
} 

  forgotPassword() {
    this.router.navigate(['/loginpassword']);
  }
}
