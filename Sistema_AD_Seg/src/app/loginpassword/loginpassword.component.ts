import { Component } from '@angular/core';
import { ApiService } from "../api.service";
import { Router , ActivatedRoute } from "@angular/router";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import Swal from 'sweetalert2';



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
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingresa un correo electrónico válido.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    this.loading = true;

    this.apiService.checkCorreoUsuarios(this.usernameOrEmail).subscribe(
        (response: any) => {
            if (response.exists) {
                this.apiService.requestPasswordReset(this.usernameOrEmail).subscribe(
                    () => {
                        Swal.fire({
                            title: 'Éxito',
                            text: 'Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            // Redirigir al usuario a la página de inicio de sesión después de cerrar el mensaje
                            this.router.navigate(['/login']);
                        });
                        this.loading = false;
                    },
                    (error) => {
                        console.error('Error al solicitar el restablecimiento de contraseña:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al solicitar el restablecimiento de contraseña.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                        this.loading = false;
                    }
                );
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Correo electrónico no encontrado.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
                this.loading = false;
            }
        },
        (error) => {
            console.error('Error al verificar el correo electrónico:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al verificar el correo electrónico.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            this.loading = false;
        }
    );
}


  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
    
  }
  
}
