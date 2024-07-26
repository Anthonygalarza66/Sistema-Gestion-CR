import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';


@Component({
  selector: "app-registro-evento",
  templateUrl: "./registro-evento.component.html",
  styleUrl: "./registro-evento.component.css",
})
export class RegistroEventoComponent {

  username: string = ""; // Inicialmente vacío
  private loggedIn = false;
  rol: string | null = null;
  filtro: string = "";
  eventos: any[] = [];
  diasDeshabilitados: Set<string> = new Set();
  horasDisponibles: string[] = [];
  minFecha: string = "";
  maxFecha: string = "";
  fechaSeleccionada: string = "";
  horaSeleccionada: string = "";

  nuevoEvento: any = {
    id_usuario: '', 
    id_residente: '', 
    nombre: "",
    apellidos: "",
    celular: "",
    cedula: "",
    nombre_evento: "",
    direccion_evento: "",
    cantidad_vehiculos: 0,
    cantidad_personas: 0,
    tipo_evento: "",
    fecha_hora: "",
    duracion_evento: 0,
    listado_evento: null,
    observaciones: "",
    estado: "En proceso de aceptación",
  };

  validationErrors: any = {};
  private flatpickrInstance: any = null;
  

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    this.initializeFlatpickr();
  }
  

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      console.log("Username desde localStorage:", this.username); // Verificar en la consola
      this.rol = localStorage.getItem("role");
  
      if (this.rol === "Residente") {
        this.cargarDatosResidente();
      }
    }
  }

  cargarDatosResidente() {
    this.apiService.getUserIdByUsername(this.username).subscribe((user) => {
      const idUsuario = user.id_usuario;
      console.log("ID de usuario:", idUsuario);
      this.apiService.getResidente(idUsuario).subscribe((residente) => {
        console.log("Datos del residente:", residente);
        this.nuevoEvento = {
          ...this.nuevoEvento,
          id_usuario: idUsuario,
          id_residente: residente.id_residente,
          nombre: residente.nombre,
          apellidos: residente.apellido,
          celular: residente.celular,
          cedula: residente.cedula,
        };
        // Recargar eventos después de cargar los datos del residente
        this.cargarEventos();
      });
    });
  }
  
  cargarEventos() {
    this.apiService.getEventos().subscribe((eventos) => {
      this.eventos = eventos;
      console.log("Eventos cargados:", this.eventos);
      // Inicializa flatpickr aquí pero no configura días deshabilitados todavía
      this.initializeFlatpickr();
    });
  }
  

  bloquearHoras() {
    if (!this.fechaSeleccionada) {
      this.horasDisponibles = [];
      return;
    }
  
    // Asegúrate de que la fecha seleccionada sea una instancia de Date y ajuste correctamente
    const fechaSeleccionada = new Date(this.fechaSeleccionada + 'T00:00:00'); // Asegúrate de que esté en formato local
    fechaSeleccionada.setHours(0, 0, 0, 0); // Asegúrate de que la hora esté en 00:00:00
  
    // Filtra eventos para el día seleccionado
    const ocupados = this.eventos
      .filter((evento) => {
        const eventoFecha = new Date(evento.fecha_hora);
        eventoFecha.setHours(0, 0, 0, 0); // Asegúrate de que la hora esté en 00:00:00
        return eventoFecha.getTime() === fechaSeleccionada.getTime() &&
          evento.tipo_evento !== "Hogar";
      })
      .map((evento) => ({
        start: new Date(evento.fecha_hora),
        end: new Date(
          new Date(evento.fecha_hora).getTime() +
            evento.duracion_evento * 60 * 60 * 1000
        ),
      }));
  
    console.log("Horas ocupadas:", ocupados);
  
    this.horasDisponibles = this.generarHorasDisponibles(
      fechaSeleccionada,
      ocupados
    );
  
    console.log("Horas disponibles:", this.horasDisponibles);
  }
  
  
  
  generarHorasDisponibles(
    fechaSeleccionada: Date,
    ocupados: { start: Date; end: Date }[]
  ): string[] {
    const horasDisponibles: string[] = [];
    
    // Verifica que fechaSeleccionada sea una instancia de Date
    if (!(fechaSeleccionada instanceof Date)) {
      console.error("La fecha seleccionada no es una instancia de Date:", fechaSeleccionada);
      return horasDisponibles;
    }
  
    // Asegúrate de que fechaSeleccionada esté en el formato correcto
    const fecha = new Date(fechaSeleccionada);
    fecha.setHours(7, 0, 0, 0); // Empezar desde las 07:00 del día seleccionado
    
    const finDia = new Date(fechaSeleccionada);
    finDia.setHours(22, 0, 0, 0); // Fin del día seleccionado a las 22:00
  
    console.log("Fecha seleccionada en generarHorasDisponibles:", fecha);
    console.log("Horas ocupadas:", ocupados);
    
    while (fecha <= finDia) {
      const esOcupado = ocupados.some(
        (ocupado) => fecha >= ocupado.start && fecha < ocupado.end
      );
  
      if (!esOcupado) {
        // Asegúrate de que la hora esté en formato HH:MM
        const horaFormateada = fecha.toTimeString().slice(0, 5);
        horasDisponibles.push(horaFormateada);
      }
  
      fecha.setMinutes(fecha.getMinutes() + 30); // Incrementar por 30 minutos
    }
  
    return horasDisponibles;
  }
  
  
  
verificarHorasDisponibles(ocupados?: { start: Date; end: Date }[]) {
  const tipoEvento = this.nuevoEvento.tipo_evento;

  console.log("Tipo de evento en verificarHorasDisponibles:", tipoEvento);

  if (tipoEvento === "Hogar") {
    console.log("No se aplican validaciones para tipo de evento: hogar");
    return;
  }

  if (!this.nuevoEvento.fecha_hora) {
    console.error("Fecha y hora seleccionada no está definida.");
    return;
  }

  const fechaHoraSeleccionada = new Date(this.nuevoEvento.fecha_hora);
  const finEventoSeleccionado = new Date(
    fechaHoraSeleccionada.getTime() +
      this.nuevoEvento.duracion_evento * 60 * 60 * 1000
  );

  console.log("Fecha y hora seleccionada:", fechaHoraSeleccionada);
  console.log("Fin del evento seleccionado:", finEventoSeleccionado);

  const conflicto = this.eventos.some((evento) => {
    const start = new Date(evento.fecha_hora);
    const end = new Date(
      start.getTime() + evento.duracion_evento * 60 * 60 * 1000
    );
    console.log(`Evento existente: Inicio=${start}, Fin=${end}`);
    return fechaHoraSeleccionada < end && finEventoSeleccionado > start;
  });

  if (conflicto) {
    alert("La hora seleccionada se superpone con otro evento existente.");
  }
}


onTipoEventoChange() {
  console.log("Tipo de evento seleccionado:", this.nuevoEvento.tipo_evento);
  
  // Actualizar días deshabilitados solo si el tipo de evento no es 'Hogar'
  if (this.nuevoEvento.tipo_evento !== "Hogar") {
    this.deshabilitarDias(); // Recalcular días deshabilitados basado en el nuevo tipo de evento
  } else {
    // Si es 'Hogar', asegurarse de que no haya días deshabilitados
    this.diasDeshabilitados.clear();
  }
  
  // Inicializar flatpickr o actualizar la configuración si ya está inicializado
  this.initializeFlatpickr(); // Asegúrate de inicializar o actualizar flatpickr
}

deshabilitarDias() {
  const ahora = new Date();
  const ahoraKey = `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, "0")}-${ahora.getDate().toString().padStart(2, "0")}`;

  // Reiniciar días deshabilitados
  this.diasDeshabilitados = new Set();
  
  // Bloquear días anteriores a hoy para todos los eventos
  this.diasDeshabilitados.add(ahoraKey);

  this.eventos.forEach((evento) => {
    if (evento.tipo_evento !== "Hogar") {
      const fecha = new Date(evento.fecha_hora);
      const fechaKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;
      
      if (fechaKey < ahoraKey) {
        this.diasDeshabilitados.add(fechaKey);
      }
    }
  });

  console.log("Días deshabilitados:", Array.from(this.diasDeshabilitados));
  // Actualiza flatpickr solo después de recalcular días deshabilitados
  this.actualizarFlatpickrConDiasDeshabilitados();
}


actualizarFlatpickrConDiasDeshabilitados(): void {
  if (this.flatpickrInstance) {
    this.flatpickrInstance.set('disable', Array.from(this.diasDeshabilitados));
  }
}

initializeFlatpickr(): void {
  if (!this.flatpickrInstance) { // Solo inicializar si no está ya inicializado
    this.flatpickrInstance = flatpickr("#fecha", {
      minDate: this.minFecha,
      maxDate: this.maxFecha,
      disable: Array.from(this.diasDeshabilitados), // Esto se actualizará después
      onChange: (selectedDates) => {
        this.fechaSeleccionada = selectedDates[0] ? selectedDates[0].toISOString().slice(0, 10) : '';
        console.log("Fecha seleccionada en flatpickr:", this.fechaSeleccionada); // Verifica aquí
        this.onFechaChange();
      }
    });
  } else {
    // Actualizar los días deshabilitados si la instancia ya está inicializada
    this.actualizarFlatpickrConDiasDeshabilitados();
  }
}


onTipoEventoSelect(event: any) {
  this.nuevoEvento.tipo_evento = event.target.value;
  this.onTipoEventoChange();
}


  isHoraDeshabilitada(fechaHora: string): boolean {
    if (!fechaHora) return false;

    const fechaHoraSeleccionada = new Date(fechaHora);
    const finEventoSeleccionado = new Date(
      fechaHoraSeleccionada.getTime() +
        this.nuevoEvento.duracion_evento * 60 * 60 * 1000
    );

    return this.eventos.some((evento) => {
      const start = new Date(evento.fecha_hora);
      const end = new Date(
        start.getTime() + evento.duracion_evento * 60 * 60 * 1000
      );
      return fechaHoraSeleccionada < end && finEventoSeleccionado > start;
    });
  }

  isFechaDeshabilitada(fecha: string): boolean {
    const fechaKey = `${fecha.split('-').join('-')}`;
    return this.diasDeshabilitados.has(fechaKey);
  }
  
  calcularMinMaxFecha() {
    const ahora = new Date();
    this.minFecha = ahora.toISOString().slice(0, 10); // Solo la parte de la fecha
    const unAnoEnElFuturo = new Date(ahora);
    unAnoEnElFuturo.setFullYear(ahora.getFullYear() + 1);
    this.maxFecha = unAnoEnElFuturo.toISOString().slice(0, 10); // Solo la parte de la fecha

    console.log("Min Fecha:", this.minFecha);
    console.log("Max Fecha:", this.maxFecha);
    console.log("Nuevo Evento:", this.nuevoEvento);
  }

  onFechaChange() {
    console.log("Fecha seleccionada en onFechaChange:", this.fechaSeleccionada);
    if (this.nuevoEvento.tipo_evento !== "Hogar") {
      console.log("Llamando a bloquearHoras...");
      this.bloquearHoras(); // Recalcular horas disponibles solo para el día seleccionado
    } else {
      console.log("Tipo de evento es hogar, no se llama a bloquearHoras.");
      // Limpiar horas disponibles si es hogar
      this.horasDisponibles = [];
    }
    this.actualizarFechaHora();
  }
  

  onHoraChange() {
    this.actualizarFechaHora();
  }

  actualizarFechaHora() {
    if (this.fechaSeleccionada && this.horaSeleccionada) {
      // Asegúrate de que la hora esté en formato HH:MM
      const horaFormateada = this.horaSeleccionada.padStart(5, '0');
  
      // Combina fecha y hora en el formato YYYY-MM-DD HH:MM:SS
      const fechaHoraLocal = `${this.fechaSeleccionada} ${horaFormateada}:00`;
  
      // Asigna el formato local al evento
      this.nuevoEvento.fecha_hora = fechaHoraLocal;
  
      console.log('Fecha y hora actualizada para el backend:', this.nuevoEvento.fecha_hora);
    }
  }

  guardar() {
    const formData = new FormData();

    Object.keys(this.nuevoEvento).forEach((key) => {
      if (this.nuevoEvento[key] !== null) {
        formData.append(key, this.nuevoEvento[key]);
      }
    });

    console.log("Datos del evento a guardar:", this.nuevoEvento);

    this.apiService.createEvento(formData).subscribe(
      (response) => {
        console.log("Evento creado:", response);
        this.router.navigate(["/eventos"]);
      },
      (error) => {
        console.error("Error al crear evento:", error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
        } else {
          this.validationErrors = {
            general:
              "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.",
          };
        }
      }
    );
  }

  subirdoc(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevoEvento.listado_evento = file;
    }
  }

logout() {
  this.loggedIn = false;
  localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
  localStorage.removeItem('role'); // Limpiar rol del localStorage
  this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
}
}
