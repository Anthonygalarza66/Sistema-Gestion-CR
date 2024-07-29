import { Component } from '@angular/core';
import { ApiService } from "../api.service";
import { Router , ActivatedRoute } from "@angular/router";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";


@Component({
  selector: 'app-loginpassword',
  templateUrl: './loginpassword.component.html',
  styleUrl: './loginpassword.component.css'
})
export class LoginpasswordComponent {

  usernameOrEmail: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onSubmit() {
    if (!this.isValidEmail(this.usernameOrEmail)) {
      this.message = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    this.loading = true;

    this.apiService.checkCorreoUsuarios(this.usernameOrEmail).subscribe(
      (response: any) => {
        if (response.exists) {
          this.apiService.requestPasswordReset(this.usernameOrEmail).subscribe(
            () => {
              this.message = 'Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico.';
              this.loading = false;
              // Redirigir al usuario a la página de inicio de sesión
              this.router.navigate(['/login']);
            },
            (error) => {
              console.error('Error al solicitar el restablecimiento de contraseña:', error);
              this.message = 'Error al solicitar el restablecimiento de contraseña.';
              this.loading = false;
            }
          );
        } else {
          this.message = 'Correo electrónico no encontrado.';
          this.loading = false;
        }
      },
      (error) => {
        console.error('Error al verificar el correo electrónico:', error);
        this.message = 'Error al verificar el correo electrónico.';
        this.loading = false;
      }
    );
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
    
  }
  
}
