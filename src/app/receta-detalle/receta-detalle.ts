import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecetasService } from '../recetas';
import { Receta, Comentario } from '../models';
import { FavoritosService } from '../favoritos';
import { ComentariosService } from '../comentarios';
import { AuthService } from '../auth';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users-service';

@Component({
  selector: 'app-receta-detalle',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receta-detalle.html',
  styleUrl: './receta-detalle.css',
})

export class RecetaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recetasSvc = inject(RecetasService);
  private favSvc = inject(FavoritosService);
  private comSvc = inject(ComentariosService);
  private usersSvc = inject(UsersService);
  public auth = inject(AuthService);

  receta: Receta | null = null;


  isFavorito = false;
  favoritoId?: string | number;


  comentarios: Comentario[] = [];
  nuevoComentario = '';
  editingId?: string | number;
  editingTexto = '';

  private namesCache = new Map<string, string>();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarReceta(id);
    }
  }

  private cargarReceta(id: string) {
    this.recetasSvc.getReceta(id).subscribe({
      next: r => {
        this.receta = r;
        this.loadFavoritoStatus();
        this.loadComentarios();
      },
      error: err => {
        console.error('Error cargando receta', err);
        this.router.navigateByUrl('/');
      }
    });
  }


  async loadFavoritoStatus() {
    const user = this.auth.getUser();
    if (!user || !this.receta) {
      this.isFavorito = false;
      this.favoritoId = undefined;
      return;
    }
    const f = await this.favSvc.findFavorito(user.id, this.receta.id);
    this.isFavorito = !!f;
    this.favoritoId = f?.id;
  }

  async toggleFavorito() {
    const user = this.auth.getUser();
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (!this.receta) return;

    const recetaId = this.receta.id;
    if (this.isFavorito && this.favoritoId) {
      try {
        await firstValueFrom(this.favSvc.removeFavoritoById(this.favoritoId));
        this.isFavorito = false;
        this.favoritoId = undefined;
      } catch (e) {
        console.error('Error quitando favorito', e);
      }
    } else {
      this.favSvc.addFavorito(user.id, recetaId).subscribe({
        next: f => {
          this.isFavorito = true;
          this.favoritoId = f.id;
        },
        error: e => console.error('Error agregando favorito', e)
      });
    }
  }


  loadComentarios() {
    if (!this.receta) {
      this.comentarios = [];
      return;
    }
    this.comSvc.getComentariosPorReceta(this.receta.id).subscribe({
      next: cs => {
        this.comentarios = cs || [];

        const ids = Array.from(new Set((this.comentarios || []).map(c => String(c.usuarioId))));

        const toLoad = ids.filter(id => !this.namesCache.has(id));
        if (toLoad.length) {
          this.usersSvc.preloadUsers(toLoad);
        }
      },
      error: e => {
        console.error('Error cargando comentarios', e);
        this.comentarios = [];
      }
    });
  }

  enviarComentario() {
    const user = this.auth.getUser();
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }
    const texto = (this.nuevoComentario || '').trim();
    if (!this.receta || !texto) return;

    this.comSvc.addComentario(this.receta.id, user.id, texto).subscribe({
      next: c => {
        this.comentarios.push(c);
        if (!this.namesCache.has(String(user.id))) {
          this.namesCache.set(String(user.id), user.nombre || `Usuario ${user.id}`);
        }
        this.nuevoComentario = '';
      },
      error: e => {
        console.error('Error creando comentario', e);
        alert('No se pudo publicar el comentario.');
      }
    });
  }

  puedeModificarComentario(cm: Comentario): boolean {
    const user = this.auth.getUser();
    if (!user) return false;
    return user.role === 'admin' || String(user.id) === String(cm.usuarioId);
  }

  startEdit(cm: Comentario) {
    this.editingId = cm.id;
    this.editingTexto = cm.texto;
  }

  cancelarEdicion() {
    this.editingId = undefined;
    this.editingTexto = '';
  }

  guardarEdicion(cm: Comentario) {
    const texto = (this.editingTexto || '').trim();
    if (!texto) return;
    this.comSvc.editarComentario(cm.id, texto).subscribe({
      next: updated => {
        cm.texto = (updated as any).texto ?? texto;
        cm.editedAt = (updated as any).editedAt ?? new Date().toISOString();
        this.cancelarEdicion();
      },
      error: e => {
        console.error('Error editando comentario', e);
        alert('No se pudo guardar la edición.');
      }
    });
  }

  borrarComentario(cm: Comentario) {
    if (!confirm('¿Eliminar este comentario?')) return;
    this.comSvc.eliminarComentario(cm.id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(x => String(x.id) !== String(cm.id));
      },
      error: e => {
        console.error('Error borrando comentario', e);
        alert('No se pudo eliminar el comentario.');
      }
    });
  }

  puedeModificarReceta(): boolean {
    const user = this.auth.getUser();
    if (!user || !this.receta) return false;
    return user.role === 'admin' || String(user.id) === String(this.receta.autorId);
  }

  editarReceta() {
    if (!this.receta) return;
    this.router.navigate(['/editar-receta', this.receta.id]);
  }

  eliminarReceta() {
    if (!this.receta) return;
    const ok = confirm('¿Eliminar esta receta? Esto también eliminará comentarios y favoritos relacionados.');
    if (!ok) return;

    this.recetasSvc.eliminarRecetaConFavoritos(this.receta.id).subscribe({
      next: () => {
        const user = this.auth.getUser();
        if (user) {
          this.router.navigateByUrl('/mis-recetas');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: e => {
        console.error('Error eliminando receta con relaciones', e);
        alert('Ocurrió un error al eliminar la receta.');
      }
    });
  }


  displayNameFor(usuarioId: number | string): string {
    const key = String(usuarioId);
    const cached = this.namesCache.get(key);
    if (cached) return cached;

    const local = this.auth.getUser();
    if (local && String(local.id) === key) {
      const name = local.nombre || `Usuario ${key}`;
      this.namesCache.set(key, name);
      return name;
    }

    this.usersSvc.getUserById(key).subscribe(u => {
      if (u && u.nombre) {
        this.namesCache.set(key, u.nombre);
      }
    });

    return `Usuario ${key}`;
  }
}