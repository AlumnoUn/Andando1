import { Component, inject, OnInit } from '@angular/core';
import { Receta } from '../models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecetasService } from '../recetas';
import { AuthService } from '../auth';

@Component({
  selector: 'app-admin-recetas',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-recetas.html',
  styleUrl: './admin-recetas.css',
})
export class AdminRecetasComponent implements OnInit {
  private recetasSvc = inject(RecetasService);
  private auth = inject(AuthService);

  recetas: Receta[] = [];

  ngOnInit() {
    const user = this.auth.getUser();
    if (!user || user.role !== 'admin') {
      this.recetas = [];
      return;
    }
    this.loadAll();
  }

  loadAll() {
    
    this.recetasSvc.getAllRecetas().subscribe({
      next: r => this.recetas = r || [],
      error: e => {
        console.error('Error cargando recetas (admin)', e);
        this.recetas = [];
      }
    });
  }

 eliminar(receta: Receta) {
    const ok = confirm(`Eliminar receta "${receta.titulo}" (id: ${receta.id})? Esto también eliminara favoritos asociados.`);
    if (!ok) return;

    this.recetasSvc.eliminarRecetaConFavoritos(receta.id).subscribe({
      next: () => {
        
        this.recetas = this.recetas.filter(x => String(x.id) !== String(receta.id));
      },
      error: e => {
        console.error('Error eliminando receta (admin)', e);
        alert('Ocurrió un error al eliminar la receta.');
      }
    });
  }
}
