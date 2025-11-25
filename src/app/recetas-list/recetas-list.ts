import { Component, inject, OnInit } from '@angular/core';
import { RecetasService } from '../recetas';
import { Receta } from '../models';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { firstValueFrom } from 'rxjs';
import { FavoritosService } from '../favoritos';



@Component({
  selector: 'app-recetas-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recetas-list.html',
  styleUrl:'./recetas-list.css' ,
})

export class RecetasListComponent implements OnInit {
  private recetasSvc = inject(RecetasService);
  private favSvc = inject(FavoritosService);
  private auth = inject(AuthService);
  private router = inject(Router);

  recetas: Receta[] = [];
  page = 1;
  q = '';
  categoria = '';

  showAll = false;

  favoritosMap = new Map<string, string>();

  ngOnInit() {

    this.showAll = this.auth.isLoggedIn();
    this.load();
    this.loadFavoritosIfLogged();
  }

  onFilterChange() {
    this.load();
  }

  load() {
    if (this.showAll) {
      
      this.recetasSvc.getAllRecetas(this.q || undefined, this.categoria || undefined)
        .subscribe(r => this.recetas = r || []);
    } else {
      
      this.recetasSvc.getRecetas(this.page, 6, this.q || undefined, this.categoria || undefined)
        .subscribe(r => this.recetas = r || []);
    }
  }

  next() {
    if (!this.showAll) { this.page++; this.load(); }
  }

  prev() {
    if (!this.showAll && this.page > 1) { this.page--; this.load(); }
  }

  isFavorito(recetaId: number | string) {
    return this.favoritosMap.has(String(recetaId));
  }

  loadFavoritosIfLogged() {
    const user = this.auth.getUser();
    if (!user) {
      this.favoritosMap.clear();
      return;
    }
    this.favSvc.getFavoritosPorUsuario(user.id).subscribe(favs => {
      this.favoritosMap.clear();
      for (const f of favs) this.favoritosMap.set(String(f.recetaId), String(f.id));
    });
  }

  async toggleFavorito(receta: Receta) {
    const user = this.auth.getUser();
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }

    const recetaId = String(receta.id);
    const existingId = this.favoritosMap.get(recetaId);

    if (existingId) {
      try {
        await firstValueFrom(this.favSvc.removeFavoritoById(existingId));
        this.favoritosMap.delete(recetaId);
      } catch (e) {
        console.error('Error quitando favorito', e);
      }
    } else {
      this.favSvc.addFavorito(user.id, recetaId).subscribe({
        next: f => this.favoritosMap.set(String(f.recetaId), String(f.id)),
        error: e => console.error('Error agregando favorito', e)
      });
    }
  }
}
