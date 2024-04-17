import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PrincipalComponent } from './Pagina/principal/principal.component';
import { RegistroControlComponent } from './registro-control/registro-control.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' } ,// Redirigir la ruta por defecto 
  { path: "login", component: LoginComponent, pathMatch: "full" },
  { path: 'Pagina/Principal', component: PrincipalComponent, pathMatch: "full" },
  { path: 'registro-control', component: RegistroControlComponent, pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
