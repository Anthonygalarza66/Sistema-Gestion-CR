import { Component } from '@angular/core';
/*import { HttpClient } from '@angular/common/http';*/

@Component({
  selector: 'app-loginpassword',
  templateUrl: './loginpassword.component.html',
  styleUrl: './loginpassword.component.css'
})
export class LoginpasswordComponent {
  usernameOrEmail: string = '';
  message: string = '';

 /* constructor(private http: HttpClient) {}*/

 onSubmit() {
   /* const payload = { usernameOrEmail: this.usernameOrEmail };

    this.http.post('/api/recovery', payload).subscribe(
      response => {
        this.message = 'Se ha enviado una solicitud de recuperación. Pronto se pondrán en contacto con usted.';
        this.usernameOrEmail = '';
      },
      error => {
        this.message = 'Ocurrió un error. Por favor, intente nuevamente.';
      }
    );*/
  
}
}