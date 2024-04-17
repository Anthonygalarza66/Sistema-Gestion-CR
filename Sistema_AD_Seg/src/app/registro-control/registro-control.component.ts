import { Component } from '@angular/core';

@Component({
  selector: 'app-registro-control',
  templateUrl: './registro-control.component.html',
  styleUrls: ['./registro-control.component.css'] // Use styleUrls instead of styleUrl
})
export class RegistroControlComponent {
  username: string = "Admin"; 
  data = [
    {
      placa: "ABC123",
      fecha: "2023-11-14",
      nombre: "Juan",
      apellido: "Pérez",
      sexo:"M",
      cedula: "123456789",
      residenteVisitante: "Residente",
      direccion: "Calle Mayor 123",
    },
    {
      placa: "DEF456",
      fecha: "2023-11-15",
      nombre: "María",
      apellido: "Gómez",
      sexo:"F",
      cedula: "987654321",
      residenteVisitante: "Visitante",
      direccion: "Avenida del Sol 456",
    },
    // You can add more rows here...
  ];

  logout() {

  }

}
