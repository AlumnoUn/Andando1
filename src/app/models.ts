export interface User {
  id: number | string;
  nombre: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

export interface Receta {
  id: number | string;
  titulo: string;
  descripcion: string;
  categoria: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Postre';
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  tiempo: number;
  autorId: number | string;
  createdAt: string;
}

export interface Favorito {
  id: number | string;
  usuarioId: number | string;
  recetaId: number | string;
  createdAt: string;
}

export interface Comentario {
  id: number | string;
  recetaId: number | string;
  usuarioId: number | string;
  texto: string;
  createdAt: string;
  editedAt?: string;
}
