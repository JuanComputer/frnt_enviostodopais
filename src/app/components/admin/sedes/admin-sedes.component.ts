import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-admin-sedes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-sedes.component.html',
  styleUrls: ['./admin-sedes.component.scss']
})
export class AdminSedesComponent implements OnInit {
  private adminSvc   = inject(AdminService);
  private storageSvc = inject(StorageService);
  private fb         = inject(FormBuilder);

  sedes: any[]    = [];
  isLoading       = true;
  modalVisible    = false;
  editando: any   = null;
  guardando       = false;
  errorForm       = '';
  confirmarEliminarId: string | null = null;

  get esAdminGeneral(): boolean {
    return this.storageSvc.getUser()?.role === 'Administrador General';
  }

  form = this.fb.group({
    nombre:    ['', Validators.required],
    direccion: ['', Validators.required],
    latitud:   [null as number | null],
    longitud:  [null as number | null],
  });

  ngOnInit(): void { this.cargarSedes(); }

  cargarSedes(): void {
    this.isLoading = true;
    this.adminSvc.listarSedes().subscribe({
      next:  r => { this.sedes = r.data || []; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  abrirCrear(): void {
    this.editando = null; this.errorForm = '';
    this.form.reset();
    this.modalVisible = true;
  }

  abrirEditar(s: any): void {
    this.editando = s; this.errorForm = '';
    this.form.patchValue({
      nombre: s.nombre, direccion: s.direccion,
      latitud: s.latitud, longitud: s.longitud
    });
    this.modalVisible = true;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true; this.errorForm = '';
    const obs = this.editando
      ? this.adminSvc.editarSede(this.editando.id, this.form.value)
      : this.adminSvc.crearSede(this.form.value);
    obs.subscribe({
      next: r => {
        this.guardando = false;
        if (r.statusCode === 200 || r.statusCode === 201) {
          this.modalVisible = false; this.cargarSedes();
        } else { this.errorForm = r.message; }
      },
      error: () => { this.guardando = false; this.errorForm = 'Error de conexión'; }
    });
  }

  eliminar(id: string): void {
    this.adminSvc.eliminarSede(id).subscribe({
      next: r => { if (r.statusCode === 200) { this.confirmarEliminarId = null; this.cargarSedes(); } }
    });
  }

  cerrar(): void { this.modalVisible = false; }
  isInvalid(c: string): boolean {
    const ctrl = this.form.get(c); return !!(ctrl?.invalid && ctrl?.touched);
  }
}
