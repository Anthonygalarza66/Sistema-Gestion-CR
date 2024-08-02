import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  public validationErrors: any = {};


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
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      console.log('Username desde localStorage:', this.username); // Verifica el valor aquí
    } 
    this.cdr.detectChanges();
      console.log('qrcElement después de detectChanges:', this.qrcElement);
    }
    

    generarQR() {
      // Verifica que todos los campos requeridos estén completos
      if (!this.nombre || !this.apellido || !this.identificacion || !this.direccion || !this.fecha || !this.hora || !this.placas || !this.Observaciones) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'Por favor, llene todos los campos requeridos antes de generar el QR.',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      // Si todos los campos están completos, genera el QR
      const datosQR = `${this.nombre};${this.apellido};${this.identificacion};${this.direccion};${this.fecha};${this.hora};${this.placas};${this.Observaciones}`;
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
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }

  validateCedula() {
    const cedula = this.identificacion;

    if (cedula.length !== 10) {
      this.validationErrors.cedula = ["La cédula debe tener 10 dígitos."];
      return;
    }

    const digitoRegion = parseInt(cedula.substring(0, 2), 10);
    if (digitoRegion < 1 || digitoRegion > 24) {
      this.validationErrors.cedula = ["Esta cédula no pertenece a ninguna región."];
      return;
    }

    const ultimoDigito = parseInt(cedula.substring(9, 10), 10);
    const pares = parseInt(cedula.substring(1, 2), 10) + parseInt(cedula.substring(3, 4), 10) +
                  parseInt(cedula.substring(5, 6), 10) + parseInt(cedula.substring(7, 8), 10);

    const numeroImpar = (num: string) => {
      let n = parseInt(num, 10) * 2;
      return n > 9 ? n - 9 : n;
    };

    const impares = numeroImpar(cedula[0]) + numeroImpar(cedula[2]) + numeroImpar(cedula[4]) +
                    numeroImpar(cedula[6]) + numeroImpar(cedula[8]);

    const sumaTotal = pares + impares;
    const primerDigitoSuma = parseInt(sumaTotal.toString().substring(0, 1), 10);
    const decena = (primerDigitoSuma + 1) * 10;
    let digitoValidador = decena - sumaTotal;

    if (digitoValidador === 10) {
      digitoValidador = 0;
    }

    if (digitoValidador !== ultimoDigito) {
      this.validationErrors.cedula = ["La cédula es incorrecta."];
    } else {
      this.validationErrors.cedula = [];
      console.log('La cédula es correcta');
    }
  }
}
