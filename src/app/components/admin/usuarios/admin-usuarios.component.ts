import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import { StorageService } from '../../../services/storage.service';
import { ReplacePipe } from '../../../pipes/replace.pipe';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReplacePipe],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  private adminSvc  = inject(AdminService);
  private storageSvc = inject(StorageService);
  private fb        = inject(FormBuilder);

  usuarios: any[]   = [];
  sedes: any[]      = [];
  isLoading         = true;
  filtroRol         = '';
  filtroActivo      = '';

  // Modal crear/editar
  modalVisible      = false;
  editando: any     = null;
  guardando         = false;
  errorForm         = '';

  get userRole(): string { return this.storageSvc.getUser()?.role || ''; }
  get esAdminGeneral(): boolean { return this.userRole === 'Administrador General'; }

  readonly roles = ['Operador', 'Cliente', 'Administrador de Sede', 'Administrador General'];
  get rolesPermitidos(): string[] {
    return this.esAdminGeneral ? this.roles : ['Operador', 'Cliente'];
  }

  form = this.fb.group({
    nombre:    ['', Validators.required],
    apellidoP: ['', Validators.required],
    apellidoM: [''],
    correo:    ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.minLength(6)]],
    dni:       ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
    rolNombre: ['Operador', Validators.required],
    sedeId:    [null as string | null],
    activo:    [true],
  });

  ngOnInit(): void {
    this.cargarUsuarios();
    this.adminSvc.listarSedes().subscribe({ next: r => this.sedes = r.data || [] });
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    const filtros: any = {};
    if (this.filtroRol)    filtros.rol    = this.filtroRol;
    if (this.filtroActivo) filtros.activo = this.filtroActivo === 'true';
    this.adminSvc.listarUsuarios(filtros).subscribe({
      next:  r => { this.usuarios = r.data || []; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  abrirCrear(): void {
    this.editando = null;
    this.errorForm = '';
    this.form.reset({ rolNombre: 'Operador', activo: true });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  abrirEditar(u: any): void {
    this.editando = u;
    this.errorForm = '';
    this.form.patchValue({
      nombre: u.nombre, apellidoP: u.apellidoP, apellidoM: u.apellidoM,
      correo: u.correo, dni: u.dni, rolNombre: u.rol?.nombre,
      sedeId: u.sede?.id || null, activo: u.activo,
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorForm = 'Revisa los campos marcados en rojo antes de continuar.';
      return;
    }
    this.guardando = true; this.errorForm = '';
    const dto = this.form.value;
    const obs = this.editando
      ? this.adminSvc.editarUsuario(this.editando.id, dto)
      : this.adminSvc.crearUsuario(dto);

    obs.subscribe({
      next: r => {
        this.guardando = false;
        if (r.statusCode === 200 || r.statusCode === 201) {
          this.modalVisible = false;
          this.cargarUsuarios();
        } else { this.errorForm = r.message; }
      },
      error: () => { this.guardando = false; this.errorForm = 'Error de conexión'; }
    });
  }

  toggleActivo(u: any): void {
    this.adminSvc.toggleActivo(u.id).subscribe({
      next: r => { if (r.statusCode === 200) this.cargarUsuarios(); }
    });
  }

  cerrar(): void { this.modalVisible = false; }

  isInvalid(c: string): boolean {
    const ctrl = this.form.get(c);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  sedeName(id: string): string {
    return this.sedes.find(s => s.id === id)?.nombre || '—';
  }
}
