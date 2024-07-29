import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.message = 'Token no proporcionado.';
      return;
    }
  }
  
  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }
  
    this.loading = true;
  
    this.apiService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe(
      () => {
        this.message = 'Contraseña restablecida exitosamente.';
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error al restablecer la contraseña:', error);
        this.message = 'Error al restablecer la contraseña.';
        this.loading = false;
      }
    );
  }  
}
