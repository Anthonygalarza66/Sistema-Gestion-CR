import { AfterViewInit, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { ApiService } from "../api.service";

@Component({
  selector: 'app-lector-qr',
  templateUrl: './lector-qr.component.html',
  styleUrls: ['./lector-qr.component.css']
})
export class LectorQrComponent implements AfterViewInit {

  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  qrData: string = '';
  parsedData: any = {};
  username: string = ''; // Inicialmente vacío
  idUsuario: number | null = null;
  private loggedIn = false;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private apiService: ApiService) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      console.log('Username desde localStorage:', this.username); // Verifica el valor aquí
      
      // Obtener el id_usuario asociado al username
      if (this.username !== 'Invitado') {
        this.apiService.getUserIdByUsername(this.username).subscribe(
          user => {
            this.idUsuario = user.id_usuario;
          },
          error => {
            console.error('Error al obtener el id_usuario:', error);
          }
        );
      }
    } 
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scanner.start();
      this.scanner.data.subscribe((results: ScannerQRCodeResult[]) => {
        if (results.length > 0) {
          this.qrData = results[0].value;
          console.log('QR Data:', this.qrData); // Verificar el valor del QR escaneado
          this.parseQRData();
        }
      });
    }
  }

  parseQRData(): void {
    let dataParts: string[];
  
    // Intentar dividir los datos por saltos de línea
    dataParts = this.qrData.split('\n').filter(Boolean);
  
    // Si no hay 8 partes, intentar dividir por `;`
    if (dataParts.length !== 8) {
      dataParts = this.qrData.split(';').filter(Boolean);
    }
  
    console.log('Data Parts:', dataParts);
  
    if (dataParts.length === 8) { 
      this.parsedData = {
        nombre: dataParts[0] ? dataParts[0].trim() : '',
        apellido: dataParts[1] ? dataParts[1].trim() : '',
        cedula: dataParts[2] ? dataParts[2].trim() : '',
        direccion: dataParts[3] ? dataParts[3].trim() : '',
        fecha: dataParts[4] ? dataParts[4].trim() : '',
        hora: dataParts[5] ? dataParts[5].trim() : '',
        placa: dataParts[6] ? dataParts[6].trim() : '',
        observaciones: dataParts[7] ? dataParts[7].trim() : '' 
      };
      console.log('Parsed Data:', this.parsedData); 
    } else {
      console.error('Error: El número de partes no es el esperado.');
    }
  }
  
  
  

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
  

  guardarDatosEnTabla() {
    if (!this.parsedData.nombre || !this.parsedData.apellido || !this.parsedData.cedula || !this.parsedData.direccion || !this.parsedData.fecha || !this.parsedData.hora || !this.parsedData.placa) {
      console.error('Error: faltan datos obligatorios.');
      return;
    }
  
    // Verifica y ajusta el valor de `sexo`
    const sexo = ['M', 'F'].includes(this.parsedData.sexo) ? this.parsedData.sexo : 'Indefinido'; // Valor por defecto 'Indefinido'
  
    // Verifica y ajusta el valor de `ingresante`
    const ingresante = ['Residente', 'Visitante', 'Delivery'].includes(this.parsedData.ingresante) ? this.parsedData.ingresante : 'Visitante'; // Valor por defecto 'Visitante'
  
    // Prepara los datos para enviar
    const controlAccesoData = {
      nombre: this.parsedData.nombre,
      apellidos: this.parsedData.apellido,
      cedula: this.parsedData.cedula,
      direccion: this.parsedData.direccion,
      fecha_ingreso: `${this.parsedData.fecha} ${this.parsedData.hora}`,
      fecha_salida: '', // Puedes dejar esto vacío si no se requiere
      id_usuario: this.idUsuario, // Usa el id_usuario obtenido de la API
      ingresante: ingresante,
      observaciones: this.parsedData.observaciones || '', // Opcional, por defecto vacío
      placas: this.parsedData.placa,
      sexo: sexo,
      username: this.username
    };
  
    // Imprime los datos en la consola
    console.log('Datos a enviar:', controlAccesoData);
  
    this.apiService.guardarControlAcceso(controlAccesoData).subscribe(
      response => {
        console.log('Datos guardados exitosamente:', response);
        this.router.navigate(['/registro-control']); // Redirigir a otra página si es necesario
      },
      error => {
        console.error('Error al guardar datos:', error);
        if (error.status === 422) {
          console.error('Error de validación:', error.error.errors);
        }
      }
    );
  }
}
