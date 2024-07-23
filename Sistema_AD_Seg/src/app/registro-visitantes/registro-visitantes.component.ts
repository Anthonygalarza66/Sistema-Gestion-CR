import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-visitantes',
  templateUrl: './registro-visitantes.component.html',
  styleUrls: ['./registro-visitantes.component.css']
})
export class RegistroVisitantesComponent implements AfterViewInit {

  username: string = ""; // Inicialmente vacío
  private loggedIn = false;

  public qrdata: string = '';
  public nombre: string = '';
  public apellido: string = '';
  public identificacion: string = '';
  public direccion: string = '';
  public nombreEvento: string='';
  public fecha: string='';
  public hora: string='';
  public placas: string='';
  public Observaciones: string='';

  public email: string = 'fremi_20@hotmail.com';
  public subject: string = 'Asunto del Correo'; // Asunto del correo
  public text: string = 'Texto del correo'; // Texto del correo

  @ViewChild('qrcElement', { static: false }) qrcElement!: ElementRef;
  @ViewChild('qrContainer') qrContainer!: ElementRef;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    console.log('AppComponent running');
    this.qrdata = '...';
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
      console.log('qrcElement después de detectChanges:', this.qrcElement);
    }
    

  generarQR() {
    const datosQR = `${this.nombre};${this.apellido};${this.identificacion};${this.direccion};${this.nombreEvento};${this.fecha};${this.hora};${this.placas};${this.Observaciones}`;
    this.qrdata = datosQR;
  }

  descargarQR(): void {
    setTimeout(() => {
      if (this.qrContainer && this.qrContainer.nativeElement) {
        html2canvas(this.qrContainer.nativeElement).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = 'codigo-qr.png';
          link.click();
        }).catch(error => {
          console.error('Error al generar la imagen:', error);
        });
      } else {
        console.error('Contenedor QR no encontrado');
      }
    }, 500); // Ajusta el tiempo si es necesario
  }
  
  descargarPDF(): void {
    setTimeout(() => {
      if (this.qrContainer && this.qrContainer.nativeElement) {
        html2canvas(this.qrContainer.nativeElement).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 190;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save('codigo-qr.pdf');
        }).catch(error => {
          console.error('Error al generar el PDF:', error);
        });
      } else {
        console.error('Contenedor QR no encontrado');
      }
    }, 500); // Ajusta el tiempo si es necesario
  }
  
  

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);
  }

  enviarQR(): void {

  }

}
