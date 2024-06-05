import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { NotificacionesComponent } from './notificaciones/notificaciones.component';



const routes: Routes = [
  { path: '', redirectTo: 'Pagina/Principal', pathMatch: 'full' } ,// Redirigir la ruta por defecto 
  { path: "login", component: LoginComponent, pathMatch: "full" },
  { path: 'Pagina/Principal', component: PrincipalComponent, pathMatch: "full" },
  { path: 'registro-control', component: RegistroControlComponent, pathMatch: "full" },
  { path: 'formulario-control', component: FormularioControlComponent, pathMatch: "full" },
  { path: 'registro-personal', component: RegistroPersonalComponent, pathMatch: "full" },
  { path: 'formulario-personal', component: FormularioPersonalComponent, pathMatch: "full" },
  { path: 'registro-residentes', component: RegistroResidentesComponent, pathMatch: "full" },
  { path: 'formulario-residentes', component: FormularioResidentesComponent, pathMatch: "full" },
  { path: 'eventos', component: EventosComponent, pathMatch: "full" },
  { path: 'registro-evento', component: RegistroEventoComponent, pathMatch: "full" },
  { path: 'registro-visitantes', component: RegistroVisitantesComponent, pathMatch: "full" },
  { path: 'registro-alicuotas', component: RegistroAlicuotasComponent, pathMatch: "full" },
  { path: 'alicuotas', component: AlicuotasComponent, pathMatch: "full" },
  { path: 'notificaciones', component: NotificacionesComponent, pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
