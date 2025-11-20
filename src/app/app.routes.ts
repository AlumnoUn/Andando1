//import { RecetasListComponent } from '../recetas-list';
//import { RecetaFormComponent } from '/receta-form';
import { Routes } from '@angular/router';
import { RecetasListComponent } from './recetas-list/recetas-list';
import { LoginComponent } from './login/login';
import { RecetaDetalleComponent } from './receta-detalle/receta-detalle';
import { RegistroComponent } from './registro/registro';
import { MisRecetasComponent } from './mis-recetas/mis-recetas';
import { MisFavoritosComponent } from './mis-favoritos/mis-favoritos';
import { RecetaFormComponent } from './receta-form/receta-form';
import { authGuard } from './auth-guard';
import { adminGuard } from './admin-guard';
import { AdminRecetasComponent } from './admin-recetas/admin-recetas';
import { PerfilComponent } from './perfil/perfil';

export const routes: Routes = [
  { path: '', component: RecetasListComponent },
  { path: 'receta/:id', component: RecetaDetalleComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'mis-recetas', component: MisRecetasComponent, canActivate: [authGuard] },
  { path: 'mis-favoritos', component: MisFavoritosComponent, canActivate: [authGuard] },
  { path: 'crear-receta', component: RecetaFormComponent, canActivate: [authGuard] },
  { path: 'editar-receta/:id', component: RecetaFormComponent, canActivate: [authGuard] },
  { path: 'admin/recetas', component: AdminRecetasComponent, canActivate: [authGuard, adminGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
