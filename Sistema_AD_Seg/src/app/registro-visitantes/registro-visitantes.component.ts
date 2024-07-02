import { Component ,} from '@angular/core';
import { jsPDF } from 'jspdf';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-registro-visitantes',
  templateUrl: './registro-visitantes.component.html',
  styleUrl: './registro-visitantes.component.css'
})
export class RegistroVisitantesComponent  {
  username: string = "Admin"; 
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


  constructor(private router: Router , private fb: FormBuilder) {
    console.log('AppComponent running');
    this.qrdata = '...';
  }
  

  generarQR() {
    const datosQR = `${this.nombre};${this.apellido};${this.identificacion};${this.direccion};${this.nombreEvento};${this.fecha};${this.hora};${this.placas};${this.Observaciones}`;
    this.qrdata = datosQR;   
     
    
  }

  descargarQR() {
    const link = document.createElement('a');
    link.href = this.qrdata; 
    link.download = 'codigoQR.png'; 
  
    
    link.click();
  }
  

  logout() {
    this.loggedIn = false; // Marcar al usuario como no autenticado
  
    // Redirige a la página de inicio de sesión
    this.router.navigate(['/login']);

  }
  
  
}
