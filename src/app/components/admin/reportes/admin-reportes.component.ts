import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin/admin.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reportes.component.html',
  styleUrls: ['./admin-reportes.component.scss']
})
export class AdminReportesComponent implements OnInit {
  private adminSvc   = inject(AdminService);
  private storageSvc = inject(StorageService);

  data: any       = null;
  isLoading       = true;

  get esAdminGeneral(): boolean {
    return this.storageSvc.getUser()?.role === 'Administrador General';
  }

  ngOnInit(): void {
    this.adminSvc.resumen().subscribe({
      next:  r => { this.data = r.data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get porEstadoEntries(): [string, number][] {
    if (!this.data?.porEstado) return [];
    return Object.entries(this.data.porEstado) as [string, number][];
  }

  get porServicioEntries(): [string, number][] {
    if (!this.data?.porTipoServicio) return [];
    return Object.entries(this.data.porTipoServicio) as [string, number][];
  }

  get totalEnvios(): number { return this.data?.totalEnvios || 0; }

  pct(val: number): number {
    return this.totalEnvios > 0 ? Math.round((val / this.totalEnvios) * 100) : 0;
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      'Registrado':       'registrado',
      'Recibido en sede': 'recibido',
      'En tránsito':      'transito',
      'Retrasado':        'retrasado',
      'Con problemas':    'con-problemas',
      'Entregado':        'entregado',
      'Cancelado':        'cancelado',
    };
    return map[estado] || 'registrado';
  }
}
