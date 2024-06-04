import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import {jsPDF} from 'jspdf';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PrincipalComponent } from './Pagina/principal/principal.component';
import { RegistroControlComponent } from './registro-control/registro-control.component';
import { FormularioControlComponent } from './formulario-control/formulario-control.component';
import { RegistroPersonalComponent } from './registro-personal/registro-personal.component';
import { FormularioPersonalComponent } from './formulario-personal/formulario-personal.component';
import { RegistroResidentesComponent } from './registro-residentes/registro-residentes.component';
import { FormularioResidentesComponent } from './formulario-residentes/formulario-residentes.component';
import { EventosComponent } from './eventos/eventos.component';
import { RegistroEventoComponent } from './registro-evento/registro-evento.component';
import { RegistroVisitantesComponent } from './registro-visitantes/registro-visitantes.component';
import { RegistroAlicuotasComponent } from './registro-alicuotas/registro-alicuotas.component';
import { AlicuotasComponent } from './alicuotas/alicuotas.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PrincipalComponent,
    RegistroControlComponent,
    FormularioControlComponent,
    RegistroPersonalComponent,
    FormularioPersonalComponent,
    RegistroResidentesComponent,
    FormularioResidentesComponent,
    EventosComponent,
    RegistroEventoComponent,
    RegistroVisitantesComponent,
    RegistroAlicuotasComponent,
    AlicuotasComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    QRCodeModule,
    
    
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
