import { Component } from '@angular/core';

@Component({
  selector: 'app-registro-personal',
  templateUrl: './registro-personal.component.html',
  styleUrl: './registro-personal.component.css'
})
export class RegistroPersonalComponent {
  username: string = "Admin"; 
  personal = [
    {
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      identificacion: "123456789",
      perfil: "seguridad",
      email: "ejemplo@",
      password: "*****",
      observaciones: "*****",
      
    },
  ];

  logout() {

  }

  exportarExcel(): void {
    
  }


}
