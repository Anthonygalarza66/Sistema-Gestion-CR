import { AfterViewInit, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from "../api.service";
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';



@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
  residentes: any[] = [];
  residenteseleccionado: any = null;
  seleccionarmotivo: string = '';
  residendenumero: string = '';
  messageText: string = '';
  

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private apiService: ApiService, private http: HttpClient) {}
    
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      console.log('Username desde localStorage:', this.username); 
      this.loadResidentes();
    }
  }

  loadResidentes(): void {
    this.apiService.getResidentes().pipe(
      switchMap((residentes: any[]) => {
        // Crear un array de promesas para obtener los usuarios relacionados
        const promesas = residentes.map(residente => 
          this.apiService.getUsuario(residente.id_usuario).pipe(
            map(usuario => ({
              ...residente,
              usuario: usuario // Combinar datos de residente y usuario
            }))
          ).toPromise()
        );
        
        // Esperar a que todas las promesas se resuelvan
        return Promise.all(promesas);
      })
    ).subscribe(
      (data) => {
        this.residentes = data;
      },
      (error) => console.error('Error al cargar residentes', error)
    );
  }

  motivos: Record<string, string> = {
    'Recordatorio': 'Este es un recordatorio importante.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Alerta': 'Este es un mensaje de alerta. Actúe con precaución.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Información': 'Esta es una información general sobre nuestras políticas.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Acceso Permitido': 'Su acceso ha sido permitido. Puede ingresar a las instalaciones. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Acceso Denegado': 'Su acceso ha sido denegado. Contacte con el personal de seguridad.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Emergencia': 'Este es un mensaje de emergencia. Por favor, siga las instrucciones.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Mantenimiento Programado': 'Se llevará a cabo un mantenimiento programado el [fecha]. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Actualización de Seguridad': 'Se ha actualizado la política de seguridad. Revise los cambios. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Recordatorio de Visita': 'Este es un recordatorio sobre su visita programada.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Aviso de Pérdida': 'Se ha encontrado un objeto. Por favor, pase por la oficina de seguridad.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Cambio de Horario': 'Ha habido un cambio en los horarios. Verifique los nuevos horarios.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Reglas y Normas': 'Este es un recordatorio sobre las reglas y normas de la comunidad.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Pago de Alicuotas': 'Este es un recordatorio de que el pago de alícuotas debe realizarse durante los primeros 10 días del mes. Por favor, asegúrese de realizar su pago a tiempo para evitar recargos.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Delivery en Garita': 'Su delivery ha llegado a la garita de seguridad. Puede pasar a recogerlo en cualquier momento. Gracias por su atención.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Evento': 'Este es un recordatorio de que sus invitados han llegado al evento. Por favor, diríjalos a la entrada correspondiente. ¡Gracias!. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Falta de Pago': 'Estimado residente,\n\nLe informamos que, debido a la falta de pago de las alícuotas correspondientes, no podrá hacer uso de las instalaciones de la urbanización ni del servicio de puerta de garita. Es importante que regularice su situación a la mayor brevedad posible para evitar inconvenientes adicionales.\n\nPara cualquier consulta o para efectuar el pago, por favor, comuníquese con la administración.\n\nMensaje enviado por el Sistema de Administracion Camino Real'
  };

  onMotivoChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const motivo = target.value;

    // Asigna el mensaje predeterminado al campo de texto
    this.messageText = this.motivos[motivo] || '';
  }

  enviarWhatsApp() {
    // Verificar si se ha seleccionado un residente y se ha ingresado un mensaje
    if (!this.residenteseleccionado || !this.messageText) {
      alert('Por favor, seleccione un residente y un mensaje.');
      return;
    }
    
    // Datos a enviar
    const whatsappData = {
      to: this.residenteseleccionado.celular, // Asegúrate de que este es el número correcto
      message: this.messageText
    };
    
    // Logs para depuración
    console.log('Enviando mensaje de WhatsApp a:', whatsappData.to);
    console.log('Contenido del mensaje:', whatsappData.message);
    
    // Llamada al servicio API para enviar el mensaje de WhatsApp
    this.apiService.sendWhatsAppMessage(whatsappData.to, whatsappData.message).subscribe(
      response => {
        console.log('Respuesta de la API:', response); // Log de la respuesta de la API
        console.log('Mensaje de WhatsApp enviado. SID del mensaje:', response.sid);
        alert('Mensaje de WhatsApp enviado correctamente.');
      },
      error => {
        console.error('Error al enviar el mensaje de WhatsApp', error); // Log del error
        alert('Error al enviar el mensaje de WhatsApp. Por favor, intente de nuevo.');
      }
    );
  }
  

  enviarSMS() {
    if (!this.residenteseleccionado || !this.messageText) {
      alert('Por favor, seleccione un residente y un mensaje.');
      return;
    }
  
    const smsData = {
      to: this.residenteseleccionado.celular, // Accede al número de celular del residente seleccionado
      message: this.messageText
    };
    console.log('Enviando mensaje a:', smsData.to);
    console.log('Contenido del mensaje:', smsData.message);
  
    this.apiService.sendSms(smsData.to, smsData.message)
      .subscribe(
        response => {
          console.log('Mensaje enviado', response);
          alert('Mensaje enviado correctamente.');
        },
        error => {
          console.error('Error al enviar el mensaje', error);
          alert('Error al enviar el mensaje.');
        }
      );
  }
  

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
  
}
