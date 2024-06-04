import { Component ,} from '@angular/core';
import { jsPDF } from 'jspdf';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-registro-visitantes',
  templateUrl: './registro-visitantes.component.html',
  styleUrl: './registro-visitantes.component.css'
})
export class RegistroVisitantesComponent  {
  username: string = "Admin"; 
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


  constructor(private fb: FormBuilder) {
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

  }
  
}
