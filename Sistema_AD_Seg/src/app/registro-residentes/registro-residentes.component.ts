import { Component } from '@angular/core';

@Component({
  selector: 'app-registro-residentes',
  templateUrl: './registro-residentes.component.html',
  styleUrl: './registro-residentes.component.css'
})
export class RegistroResidentesComponent {
  username: string = "Admin"; 
  data = [
    {
      placa: "ABC123",
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      cedula: "123456789",
      celular: "+593",
      direccion: "Calle Mayor 123",
    },
    {
      placa: "DEF456",
      nombre: "María",
      apellido: "Gómez",
      sexo:"F",
      cedula: "987654321",
      residenteVisitante: "Visitante",
      direccion: "Avenida del Sol 456",
    },
    
  ];

  logout() {

  }

  exportarExcel(): void {
    
  }
  

}
