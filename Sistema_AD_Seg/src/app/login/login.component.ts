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

  constructor(private router: Router) {}
  
  login() {
    if (this.username === 'usuario' && this.password === 'contraseña') {
      alert('Inicio de sesión exitoso');
    } else {
      alert('Nombre de usuario o contraseña incorrectos');
    }
  }

  forgotPassword() {
    this.router.navigate(['/loginpassword']);
  }
}
