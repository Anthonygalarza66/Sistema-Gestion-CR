import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api'; 

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient) {}
  

  // Método para obtener todos los usuarios
  getUsuarios(): Observable<any> {
    console.log('Solicitando usuarios a la API...');
    return this.http.get<any>(`${this.apiUrl}/usuarios`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener un usuario específico por ID
  getUsuario(id: number): Observable<any> {
    console.log(`Solicitando usuario con ID ${id} a la API...`);
    return this.http.get<any>(`${this.apiUrl}/usuarios/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para crear un nuevo usuario
  createUsuario(usuario: any): Observable<any> {
    console.log('Enviando datos para crear usuario:', usuario);
    return this.http.post<any>(`${this.apiUrl}/usuarios`, usuario, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para actualizar un usuario existente
  updateUsuario(id: number, usuario: any): Observable<any> {
    console.log(`Enviando datos para actualizar usuario con ID ${id}:`, usuario);
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, usuario, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para eliminar un usuario
  deleteUsuario(id: number): Observable<any> {
    console.log(`Solicitando eliminación del usuario con ID ${id}`);
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

   // Método para obtener todos los personales
   getPersonales(): Observable<any> {
    console.log('Solicitando personales a la API...');
    return this.http.get<any>(`${this.apiUrl}/personal`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener un personal específico por ID
  getPersonal(id: number): Observable<any> {
    console.log(`Solicitando personal con ID ${id} a la API...`);
    return this.http.get<any>(`${this.apiUrl}/personal/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para crear un nuevo personal
  createPersonal(personal: any): Observable<any> {
    console.log('Enviando datos para crear personal:', personal);
    return this.http.post<any>(`${this.apiUrl}/personal`, personal, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para actualizar un personal existente
  updatePersonal(id: number, personal: any): Observable<any> {
    console.log(`Enviando datos para actualizar personal con ID ${id}:`, personal);
    return this.http.put<any>(`${this.apiUrl}/personal/${id}`, personal, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para eliminar un personal
  deletePersonal(id: number): Observable<any> {
    console.log(`Solicitando eliminación del personal con ID ${id}`);
    return this.http.delete<any>(`${this.apiUrl}/personal/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener todas las alícuotas
  getAlicuotas(): Observable<any> {
    console.log('Solicitando alícuotas a la API...');
    return this.http.get<any>(`${this.apiUrl}/alicuotas`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener una alícuota específica por ID
  getAlicuota(id: number): Observable<any> {
    console.log(`Solicitando alícuota con ID ${id} a la API...`);
    return this.http.get<any>(`${this.apiUrl}/alicuotas/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para crear una nueva alícuota
  createAlicuota(alicuota: any): Observable<any> {
    console.log('Enviando datos para crear alícuota:', alicuota);
    return this.http.post<any>(`${this.apiUrl}/alicuotas`, alicuota, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para actualizar una alícuota existente
  updateAlicuota(id: number, alicuota: any): Observable<any> {
    console.log(`Enviando datos para actualizar alícuota con ID ${id}:`, alicuota);
    return this.http.put<any>(`${this.apiUrl}/alicuotas/${id}`, alicuota, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para eliminar una alícuota
  deleteAlicuota(id: number): Observable<any> {
    console.log(`Solicitando eliminación de alícuota con ID ${id}`);
    return this.http.delete<any>(`${this.apiUrl}/alicuotas/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  marcarpagoAlicuitas(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/alicuotas/${id}/marcar-pago`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener todos los eventos
  getEventos(): Observable<any> {
    console.log('Solicitando eventos a la API...');
    return this.http.get<any>(`${this.apiUrl}/eventos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener un evento específico por ID
  getEvento(id: number): Observable<any> {
    console.log(`Solicitando evento con ID ${id} a la API...`);
    return this.http.get<any>(`${this.apiUrl}/eventos/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para crear un nuevo evento
   createEvento(evento: FormData): Observable<any> {
    console.log('Enviando datos para crear evento:', evento);
    return this.http.post<any>(`${this.apiUrl}/eventos`, evento, {
      headers: new HttpHeaders({
      })
    }).pipe(
      catchError(this.handleError)
    );
  }
  

  // Método para actualizar un evento existente
  updateEvento(id: number, evento: any): Observable<any> {
    console.log(`Enviando datos para actualizar evento con ID ${id}:`, evento);
    return this.http.put<any>(`${this.apiUrl}/eventos/${id}`, evento, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para eliminar un evento
  deleteEvento(id: number): Observable<any> {
    console.log(`Solicitando eliminación del evento con ID ${id}`);
    return this.http.delete<any>(`${this.apiUrl}/eventos/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener todos los residentes
  getResidentes(): Observable<any> {
    console.log('Solicitando residentes a la API...');
    return this.http.get<any>(`${this.apiUrl}/residentes`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener un residente por ID
  getResidente(id: number): Observable<any> {
    console.log(`Solicitando residente con ID ${id} a la API...`);
    return this.http.get<any>(`${this.apiUrl}/residentes/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para guardar (crear o actualizar) un residente
  guardarResidente(residente: any): Observable<any> {
    if (residente.id) {
      console.log(`Actualizando residente con ID ${residente.id}...`);
      return this.http.put<any>(`${this.apiUrl}/residentes/${residente.id}`, residente)
        .pipe(
          catchError(this.handleError)
        );
    } else {
      console.log('Creando un nuevo residente...');
      return this.http.post<any>(`${this.apiUrl}/residentes`, residente)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  // Método para crear un nuevo residente
  createResidente(residente: any): Observable<any> {
    console.log('Enviando datos para crear residente:', residente);
    return this.http.post<any>(`${this.apiUrl}/residentes`, residente, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para eliminar un residente
  deleteResidente(id: number): Observable<any> {
    console.log(`Eliminando residente con ID ${id}...`);
    return this.http.delete<any>(`${this.apiUrl}/residentes/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener todos los registros de control de acceso
  getControlAcceso(): Observable<any> {
    console.log('Solicitando registros de control de acceso a la API...');
    return this.http.get<any>(`${this.apiUrl}/control-acceso`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener un registro de control de acceso por ID
  getControlAccesoById(id: number): Observable<any> {
    console.log(`Solicitando registro de control de acceso con ID ${id} a la API...`);
    return this.http.get<any>(`${this.apiUrl}/control-acceso/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para crear un nuevo registro de control de acceso
  createControlAcceso(controlAcceso: FormData): Observable<any> {
    console.log('Enviando datos para crear control de acceso:', controlAcceso);
    return this.http.post<any>(`${this.apiUrl}/control-acceso`, controlAcceso)
        .pipe(
            catchError(this.handleError)
        );
  }  

  // Método para actualizar un registro de control de acceso existente
  updateControlAcceso(id: number, controlAcceso: FormData): Observable<any> {
    console.log(`Enviando datos para actualizar control de acceso con ID ${id}:`, controlAcceso);
    return this.http.put<any>(`${this.apiUrl}/${id}`, controlAcceso, {
      headers: new HttpHeaders({
        // Aquí puedes agregar otros encabezados si es necesario
      })
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Método para guardar (crear o actualizar) un registro de control de acceso
  guardarControlAcceso(controlAcceso: any): Observable<any> {
    if (controlAcceso.id_acceso) {
      console.log(`Actualizando registro de control de acceso con ID ${controlAcceso.id_acceso}...`);
      return this.http.put<any>(`${this.apiUrl}/control-acceso/${controlAcceso.id_acceso}`, controlAcceso, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    } else {
      console.log('Creando un nuevo registro de control de acceso...');
      return this.http.post<any>(`${this.apiUrl}/control-acceso`, controlAcceso, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  // Método para eliminar un registro de control de acceso
  deleteControlAcceso(id: number): Observable<any> {
    console.log(`Eliminando registro de control de acceso con ID ${id}...`);
    return this.http.delete<any>(`${this.apiUrl}/control-acceso/${id}`)
      .pipe(
        catchError(this.handleError)
      );
      
  }

   // Obtener usuarios con perfil y rol de seguridad
   getUsuariosSeguridad(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/seguridad`);
  }


  checkCedula(cedula: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/residentes/check-cedula/${cedula}`)
      .pipe(
        catchError(this.handleError) 
      );
  }

  checkCorreo(correo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/residentes/check-correo/${correo}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
        // Errores del cliente o de red
        errorMessage = `Error: ${error.error.message}`;
    } else {
        // Errores del backend
        errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
}

  getFileUrl(filename: string): string {
    return `${this.apiUrl}/uploads/${filename}`;
  }
}
