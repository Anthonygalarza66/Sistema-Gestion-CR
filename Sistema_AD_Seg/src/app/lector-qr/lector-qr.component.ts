import { AfterViewInit, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-lector-qr',
  templateUrl: './lector-qr.component.html',
  styleUrls: ['./lector-qr.component.css']
})
export class LectorQrComponent implements AfterViewInit {
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  qrData: string = '';
  parsedData: any = {};
  username: string = "Admin"; 
  private loggedIn = false;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {}

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
    const dataParts = this.qrData.split(';').filter(Boolean); 
    console.log('Data Parts:', dataParts); 
    if (dataParts.length === 8) { 
      this.parsedData = {
        nombre: dataParts[0] ? dataParts[0].trim() : '',
        apellido: dataParts[1] ? dataParts[1].trim() : '',
        cedula: dataParts[2] ? dataParts[2].trim() : '',
        direccion: dataParts[3] ? dataParts[3].trim() : '',
        evento: dataParts[4] ? dataParts[4].trim() : '',
        fecha: dataParts[5] ? dataParts[5].trim() : '',
        hora: dataParts[6] ? dataParts[6].trim() : '',
        observaciones: dataParts[7] ? dataParts[7].trim() : ''
      };
      console.log('Parsed Data:', this.parsedData); 
    } else {
      console.error('Error: El número de partes no es el esperado.');
    }
  }

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);
  }

  guardarDatosEnTabla() {
    // Llama al servicio para guardar los datos
   // this.dataService.guardarDatos(this.parsedData).subscribe(
    //  response => {
     //   console.log('Datos guardados exitosamente:', response);
        // Aquí podrías hacer algo después de guardar, como redirigir a otra página
     //   this.router.navigate(['/otra-ruta']);
     // },
     // error => {
     //   console.error('Error al guardar datos:', error);
        // Manejar el error apropiadamente
      //}
   // );
  }
}
