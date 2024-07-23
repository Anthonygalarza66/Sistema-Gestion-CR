import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { format, parseISO } from "date-fns";

@Component({
  selector: "app-registro-evento",
  templateUrl: "./registro-evento.component.html",
  styleUrl: "./registro-evento.component.css",
})
export class RegistroEventoComponent {
  username: string = ""; // Inicialmente vacío
  private loggedIn = false;
  filtro: string = "";
  eventos: any[] = [];
  diasDeshabilitados: Set<string> = new Set();
  horasDisponibles: string[] = [];
  minFecha: string = "";
  maxFecha: string = "";
  fechaSeleccionada: string = "";
  horaSeleccionada: string = "";

  nuevoEvento: any = {
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
  };

  validationErrors: any = {};

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      this.apiService.getEventos().subscribe((response) => {
        this.eventos = response;
        this.calcularMinMaxFecha();

        console.log("Tipo de evento actual:", this.nuevoEvento.tipo_evento);
        this.deshabilitarDias();
      });
    }
  }

  bloquearHoras() {
    if (!this.fechaSeleccionada) {
      this.horasDisponibles = [];
      return;
    }
    // Si el tipo de evento es 'hogar', todas las horas del día están disponibles
    if (this.nuevoEvento.tipo_evento === "Hogar") {
      this.horasDisponibles = [];
      for (let hora = 0; hora < 24; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
          const horaStr = `${hora.toString().padStart(2, "0")}:${minuto
            .toString()
            .padStart(2, "0")}`;
          this.horasDisponibles.push(horaStr);
        }
      }
      return;
    }
    // Para otros tipos de eventos, bloquea las horas ocupadas
    const fechaSeleccionada = new Date(this.fechaSeleccionada);
    const ocupados = this.eventos
      .filter((evento) => {
        const eventoFecha = new Date(evento.fecha_hora);
        return eventoFecha.toDateString() === fechaSeleccionada.toDateString();
      })
      .map((evento) => ({
        start: new Date(evento.fecha_hora),
        end: new Date(
          new Date(evento.fecha_hora).getTime() +
            evento.duracion_evento * 60 * 60 * 1000
        ),
      }));

    console.log("Horas ocupadas:", ocupados);

    const horasDisponibles = this.generarHorasDisponibles(
      fechaSeleccionada,
      ocupados
    );

    console.log("Horas disponibles:", horasDisponibles);

    this.horasDisponibles = horasDisponibles;
  }

  generarHorasDisponibles(
    fechaSeleccionada: Date,
    ocupados: { start: Date; end: Date }[]
  ): string[] {
    const horasDisponibles: string[] = [];
    const fecha = new Date(fechaSeleccionada);
    fecha.setHours(0, 0, 0, 0); // Empezar desde medianoche del día seleccionado

    const finDia = new Date(fechaSeleccionada);
    finDia.setHours(23, 59, 59, 999); // Fin del día seleccionado

    while (fecha <= finDia) {
      const esOcupado = ocupados.some(
        (ocupado) => fecha >= ocupado.start && fecha < ocupado.end
      );

      if (!esOcupado) {
        horasDisponibles.push(fecha.toTimeString().slice(0, 5)); // Formato HH:MM
      }

      fecha.setMinutes(fecha.getMinutes() + 30); // Incrementar por 30 minutos
    }

    return horasDisponibles;
  }

  verificarHorasDisponibles(ocupados?: { start: Date; end: Date }[]) {
    const tipoEvento = this.nuevoEvento.tipo_evento;

    console.log("Tipo de evento en verificarHorasDisponibles:", tipoEvento);

    // No hacer nada si el tipo de evento es 'hogar'
    if (tipoEvento === "Hogar") {
      console.log("No se aplican validaciones para tipo de evento: hogar");
      return;
    }

    // Verifica que `fecha_hora` esté bien definida antes de convertirla a Date
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

  deshabilitarDias() {
    const eventosPorDia: Map<string, number> = new Map();

    this.eventos.forEach((evento) => {
      const fecha = new Date(evento.fecha_hora);
      const fechaKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;

      const cantidad = eventosPorDia.get(fechaKey) || 0;
      eventosPorDia.set(fechaKey, cantidad + 1);
    });

    eventosPorDia.forEach((cantidad, fechaKey) => {
      if (cantidad >= 2) {
        this.diasDeshabilitados.add(fechaKey);
      }
    });

    console.log("Días deshabilitados:", this.diasDeshabilitados);
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
    const fechaKey = `${fecha.substring(0, 10)}`;
    const deshabilitada = this.diasDeshabilitados.has(fechaKey);
    return deshabilitada;
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
    console.log("Fecha seleccionada:", this.fechaSeleccionada);
    console.log(
      "Tipo de evento en onFechaChange:",
      this.nuevoEvento.tipo_evento
    );

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
    localStorage.removeItem("username"); // Limpiar nombre de usuario del localStorage
    this.router.navigate(["/login"]); // Redirige a la página de inicio de sesión
  }
}
