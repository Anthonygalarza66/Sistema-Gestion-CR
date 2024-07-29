import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import * as mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { QRCodeModule } from "angularx-qrcode";
import html2canvas from "html2canvas";

@Component({
  selector: "app-registro-evento",
  templateUrl: "./registro-evento.component.html",
  styleUrl: "./registro-evento.component.css",
})
export class RegistroEventoComponent implements OnInit {
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
  qevento: any = {};
  qrCodes: any[] = [];

  nuevoEvento: any = {
    id_usuario: "",
    id_residente: "",
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

  data: any = {
    nombreEvento: "",
    nombreEncargado: "",
    fechaEvento: "",
    horaEvento: "",
    direccionEvento: "",
    invitados: [],
  };

  validationErrors: any = {};
  private flatpickrInstance: any = null;
  public tienePagosPendientes: boolean = false;

  @ViewChildren("qrContainer") qrContainers!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
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

        // Obtener el estado de pago del residente desde la tabla alicuotas
        this.apiService
          .getAlicuotasByIdResidente(residente.id_residente)
          .subscribe((alicuotas) => {
            console.log("Alícuotas del residente:", alicuotas); // Verifica que se están obteniendo las alícuotas correctamente

            // Verificar si hay alícuotas pendientes
            this.tienePagosPendientes = alicuotas.some((alicuota: any) => {
              console.log("Alícuota pagada (valor):", alicuota.pagado); // Verifica el valor de 'pagado'
              console.log("Monto por cobrar:", alicuota.monto_por_cobrar); // Verifica el monto por cobrar
              return alicuota.pagado === 0; // Compara con el valor numérico 0
            });

            console.log(
              "Estado de pagos pendientes:",
              this.tienePagosPendientes
            );
            this.cargarEventos();
          });
      });
    });
  }

  validarAccesoEstancias() {
    // Mensaje de advertencia
    alert(
      "Lo sentimos, por falta de pagos, no puede ocupar estancias de la urbanización."
    );

    // Deshabilitar opciones específicas en el select
    const selectElement = document.getElementById(
      "tipoEvento"
    ) as HTMLSelectElement;
    if (selectElement) {
      const opciones = selectElement.options;
      for (let i = 0; i < opciones.length; i++) {
        const option = opciones[i];
        if (
          [
            "Evento social",
            "Cancha de futbol",
            "Parque comunitario",
            "Club Acuatico",
            "Club Residencial",
          ].includes(option.value)
        ) {
          option.disabled = true;
        }
      }
    }
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
    const fechaSeleccionada = new Date(this.fechaSeleccionada + "T00:00:00"); // Asegúrate de que esté en formato local
    fechaSeleccionada.setHours(0, 0, 0, 0); // Asegúrate de que la hora esté en 00:00:00

    // Filtra eventos para el día seleccionado
    const ocupados = this.eventos
      .filter((evento) => {
        const eventoFecha = new Date(evento.fecha_hora);
        eventoFecha.setHours(0, 0, 0, 0); // Asegúrate de que la hora esté en 00:00:00
        return (
          eventoFecha.getTime() === fechaSeleccionada.getTime() &&
          evento.tipo_evento !== "Hogar"
        );
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
      console.error(
        "La fecha seleccionada no es una instancia de Date:",
        fechaSeleccionada
      );
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

    // Verifica el estado de pago del residente
    if (this.tienePagosPendientes) {
      // Si el residente no ha pagado, restringe las opciones de eventos
      if (
        [
          "Evento social",
          "Cancha de futbol",
          "Parque comunitario",
          "Club Acuatico",
          "Club Residencial",
        ].includes(this.nuevoEvento.tipo_evento)
      ) {
        alert(
          "Lo sentimos, por falta de pagos, no puede ocupar estancias de la urbanización."
        );
        this.nuevoEvento.tipo_evento = ""; // Limpiar selección si no es válida

        // Deshabilitar opciones específicas en el select
        const selectElement = document.getElementById(
          "tipoEvento"
        ) as HTMLSelectElement;
        if (selectElement) {
          const opciones = selectElement.options;
          for (let i = 0; i < opciones.length; i++) {
            const option = opciones[i];
            if (
              [
                "Evento social",
                "Cancha de futbol",
                "Parque comunitario",
                "Club Acuatico",
                "Club Residencial",
              ].includes(option.value)
            ) {
              option.disabled = true;
            }
          }
        }
        return; // Salir de la función
      }
    }

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
    const ahoraKey = `${ahora.getFullYear()}-${(ahora.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${ahora.getDate().toString().padStart(2, "0")}`;

    // Reiniciar días deshabilitados
    this.diasDeshabilitados = new Set();

    // Bloquear días anteriores a hoy para todos los eventos
    this.diasDeshabilitados.add(ahoraKey);

    this.eventos.forEach((evento) => {
      if (evento.tipo_evento !== "Hogar") {
        const fecha = new Date(evento.fecha_hora);
        const fechaKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;

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
      this.flatpickrInstance.set(
        "disable",
        Array.from(this.diasDeshabilitados)
      );
    }
  }

  initializeFlatpickr(): void {
    if (!this.flatpickrInstance) {
      // Solo inicializar si no está ya inicializado
      this.flatpickrInstance = flatpickr("#fecha", {
        minDate: this.minFecha,
        maxDate: this.maxFecha,
        disable: Array.from(this.diasDeshabilitados), // Esto se actualizará después
        onChange: (selectedDates) => {
          this.fechaSeleccionada = selectedDates[0]
            ? selectedDates[0].toISOString().slice(0, 10)
            : "";
          console.log(
            "Fecha seleccionada en flatpickr:",
            this.fechaSeleccionada
          ); // Verifica aquí
          this.onFechaChange();
        },
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
    const fechaKey = `${fecha.split("-").join("-")}`;
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
      const horaFormateada = this.horaSeleccionada.padStart(5, "0");

      // Combina fecha y hora en el formato YYYY-MM-DD HH:MM:SS
      const fechaHoraLocal = `${this.fechaSeleccionada} ${horaFormateada}:00`;

      // Asigna el formato local al evento
      this.nuevoEvento.fecha_hora = fechaHoraLocal;

      console.log(
        "Fecha y hora actualizada para el backend:",
        this.nuevoEvento.fecha_hora
      );
    }
  }

  // Método para manejar la carga del archivo DOCX
  subirdoc(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevoEvento.listado_evento = file;
      console.log("Archivo DOCX cargado:", file.name); // Log para el archivo cargado
      this.parseDocument(file);
    } else {
      console.error("No se seleccionó ningún archivo.");
    }
  }

  // Método para procesar el documento DOCX
  parseDocument(file: File) {
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const arrayBuffer = event.target.result;

      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        // Extraer datos del HTML convertido
        const variables = this.extractDataFromHtml(html);
        this.generateQRCodes(variables);
      } catch (error) {
        console.error("Error al procesar el documento:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Método para extraer datos del HTML convertido
  extractDataFromHtml(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extraer datos del HTML
    const nombreEvento =
      doc
        .querySelector("table tr:nth-child(2) td:nth-child(2)")
        ?.textContent?.trim() || "";
    const nombreEncargado =
      doc
        .querySelector("table tr:nth-child(3) td:nth-child(2)")
        ?.textContent?.trim() || "";
    const celular =
      doc
        .querySelector("table tr:nth-child(3) td:nth-child(4)")
        ?.textContent?.trim() || "";
    const fechaEvento =
      doc
        .querySelector("table tr:nth-child(4) td:nth-child(2)")
        ?.textContent?.trim() || "";
    const horaEvento =
      doc
        .querySelector("table tr:nth-child(4) td:nth-child(4)")
        ?.textContent?.trim() || "";
    const direccionEvento =
      doc
        .querySelector("table tr:nth-child(5) td:nth-child(2)")
        ?.textContent?.trim() || "";

    // Extraer los datos de los invitados
    const invitados: any[] = [];
    const rows = doc.querySelectorAll("table tr");
    let isReadingInvitados = false;

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");

      if (cells.length === 5 && cells[0]?.textContent?.trim() === "Nombres") {
        isReadingInvitados = true; // Comienza a leer los datos de los invitados
        return; // Salta la fila de encabezado
      }

      if (isReadingInvitados && cells.length === 5) {
        // Solo agrega filas si tienen contenido en las celdas esperadas
        if (cells[0]?.textContent?.trim() && cells[1]?.textContent?.trim()) {
          invitados.push({
            nombres: cells[0]?.textContent?.trim() || "",
            apellidos: cells[1]?.textContent?.trim() || "",
            cedula: cells[2]?.textContent?.trim() || "",
            placa: cells[3]?.textContent?.trim() || "",
            observaciones: cells[4]?.textContent?.trim() || "",
          });
        }
      }
    });

    console.log("Invitados:", invitados);

    return {
      nombreEvento,
      nombreEncargado,
      celular,
      fechaEvento,
      horaEvento,
      direccionEvento,
      invitados,
    };
  }

  generateQRCodes(data: any) {
    const {
      nombreEvento,
      nombreEncargado,
      fechaEvento,
      horaEvento,
      direccionEvento,
      invitados,
    } = data;
    this.qrCodes = invitados.map((invitado: any) => ({
      qrData: `${invitado.nombres}\n${invitado.apellidos}\n${invitado.cedula}\n${direccionEvento}\n${fechaEvento}\n${horaEvento}\n${invitado.placa}\n${nombreEvento}`,
      nombre: invitado.nombres,
      apellido: invitado.apellidos,
    }));
    this.cdr.detectChanges();
    this.generatePDFs();
  }

  generatePDFs(): Promise<{ pdf: jsPDF; nombreArchivo: string }[]> {
    return new Promise((resolve, reject) => {
      if (this.qrContainers.length === 0) {
        console.error("Contenedores QR no encontrados");
        reject("Contenedores QR no encontrados");
        return;
      }

      const pdfs: { pdf: jsPDF; nombreArchivo: string }[] = []; // Declarar tipo explícito
      let completed = 0;
      const total = this.qrContainers.length;

      this.qrContainers.forEach((container, index) => {
        setTimeout(() => {
          // Hacer visible el contenedor temporalmente
          container.nativeElement.style.opacity = "1";
          container.nativeElement.style.pointerEvents = "auto";
          console.log(`Contenedor ${index} hecho visible`);

          html2canvas(container.nativeElement)
            .then((canvas) => {
              // Volver a ocultar el contenedor
              container.nativeElement.style.opacity = "0";
              container.nativeElement.style.pointerEvents = "none";
              console.log(`Contenedor ${index} oculto de nuevo`);

              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF("p", "mm", "a4");
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();

              const imgWidth = 190; // Ancho fijo en mm
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              // Calcular la posición para centrar la imagen horizontalmente
              const xOffset = (pdfWidth - imgWidth) / 2; // Centrar horizontalmente
              let position = 20; // Espacio para el texto y márgenes

              // Agregar texto con el nombre y apellido del invitado
              const invitado = this.qrCodes[index];
              const nombreApellido = `Nombre: ${invitado.nombre}\nApellidos: ${invitado.apellido}`;
              pdf.setFontSize(12);
              pdf.text(nombreApellido, 10, position); // Posición del texto en la página
              position += 20; // Ajustar la posición del texto para que no se sobreponga con la imagen

              // Agregar la imagen al PDF
              pdf.addImage(
                imgData,
                "PNG",
                xOffset,
                position,
                imgWidth,
                imgHeight
              );

              // Verificar si es necesario agregar más páginas
              const heightLeft = imgHeight - (pdfHeight - position - 20);
              if (heightLeft > 0) {
                // Agregar más páginas si es necesario
                pdf.addPage();
                pdf.text(nombreApellido, 10, 10); // Agregar texto en nuevas páginas
                pdf.addImage(imgData, "PNG", xOffset, 20, imgWidth, imgHeight); // Ajustar posición para el QR en nuevas páginas
              }

              // Crear el nombre del archivo PDF usando nombre y apellido del invitado
              const nombreArchivo =
                `qr_${invitado.nombre}_${invitado.apellido}.pdf`.replace(
                  /\s+/g,
                  "_"
                );
              pdfs.push({ pdf, nombreArchivo }); // Agregar al array de PDFs

              // Incrementar el contador de PDFs completados
              completed++;
              if (completed === total) {
                // Resolver la promesa con los PDFs generados
                resolve(pdfs);
              }
            })
            .catch((error) => {
              console.error("Error al generar el PDF:", error);
              reject(error);
            });
        }, 500); // Ajusta el tiempo si es necesario
      });
    });
  }

  guardar(): void {
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

        // Generar los códigos QR después de guardar el evento
        this.generatePDFs()
          .then((pdfs) => {
            // Descargar los PDFs después de generarlos
            pdfs.forEach(({ pdf, nombreArchivo }) => {
              pdf.save(nombreArchivo);
              console.log(`PDF guardado como ${nombreArchivo}`);
            });

            // Redirigir a /eventos después de generar y descargar los PDFs
            this.router.navigate(["/eventos"]);
          })
          .catch((error) => {
            console.error("Error al generar los PDFs:", error);
          });
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

  logout() {
    this.loggedIn = false;
    localStorage.removeItem("username"); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem("role"); // Limpiar rol del localStorage
    this.router.navigate(["/login"]); // Redirige a la página de inicio de sesión
  }
}
