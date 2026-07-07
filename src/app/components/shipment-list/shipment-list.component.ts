import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnviosService } from '../../services/envios/envios.service';
import { StorageService } from '../../services/storage.service';
import { Envio } from '../../shared/models/envio.model';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-list.component.html',
  styleUrls: ['./shipment-list.component.scss']
})
export class ShipmentListComponent implements OnInit {
  shipments: Envio[]     = [];
  filteredShipments: Envio[] = [];
  selectedShipment: Envio | null = null;
  mostrarModal   = false;
  isLoading      = true;

  // Filtros
  filtroEstado   = '';
  filtroDni      = '';
  filtroTracking = '';

  // Cambio de estado
  mostrarCambioEstado = false;
  estadosValidos: string[] = [];
  nuevoEstado   = '';
  notaEstado    = '';
  guardandoEstado = false;
  errorEstado   = '';

  // PDF
  cargandoPdf   = false;

  // Debe coincidir exactamente con el CHECK constraint de tb_envios_estado en la BD
  readonly ESTADOS_COLOR: Record<string, string> = {
    'Registrado':         'registrado',
    'Recibido en sede':   'recibido',
    'En tránsito':        'transito',
    'Retrasado':          'retrasado',
    'Con problemas':      'con-problemas',
    'Entregado':          'entregado',
    'Cancelado':          'cancelado',
  };

  readonly ROLES_STAFF = ['Operador', 'Administrador de Sede', 'Administrador General'];

  constructor(
    private enviosService: EnviosService,
    private storageSvc: StorageService,
  ) {}

  get userRole(): string {
    return this.storageSvc.getUser()?.role || '';
  }

  get puedeCambiarEstado(): boolean {
    return this.ROLES_STAFF.includes(this.userRole);
  }

  ngOnInit(): void {
    this.cargarEnvios();
  }

  cargarEnvios(): void {
    this.isLoading = true;
    // Un Cliente solo puede ver sus propios envíos (endpoint distinto);
    // el staff (Operador/Admin) ve el listado general filtrado por sede.
    const fuente = this.puedeCambiarEstado
      ? this.enviosService.listar()
      : this.enviosService.misEnvios();

    fuente.subscribe({
      next: (res) => {
        this.isLoading  = false;
        this.shipments  = res.data || [];
        this.aplicarFiltros();
      },
      error: () => { this.isLoading = false; }
    });
  }

  aplicarFiltros(): void {
    this.filteredShipments = this.shipments.filter(s => {
      const matchEstado   = !this.filtroEstado   || s.estado === this.filtroEstado;
      const matchDni      = !this.filtroDni      || (s.receptorDni || '').includes(this.filtroDni);
      const matchTracking = !this.filtroTracking || (s.codigoTracking || '').toLowerCase()
                              .includes(this.filtroTracking.toLowerCase());
      return matchEstado && matchDni && matchTracking;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = ''; this.filtroDni = ''; this.filtroTracking = '';
    this.aplicarFiltros();
  }

  verDetalles(s: Envio): void {
    this.selectedShipment = s;
    this.mostrarModal = true;
    this.mostrarCambioEstado = false;
    this.nuevoEstado = ''; this.notaEstado = ''; this.errorEstado = '';
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.selectedShipment = null;
    this.mostrarCambioEstado = false;
    document.body.style.overflow = '';
  }

  abrirCambioEstado(): void {
    if (!this.selectedShipment?.id || !this.puedeCambiarEstado) return;
    this.mostrarCambioEstado = true;
    this.nuevoEstado = ''; this.notaEstado = ''; this.errorEstado = '';
    this.enviosService.obtenerEstadosValidos(this.selectedShipment.id).subscribe({
      next: (res: any) => { this.estadosValidos = res.data || []; },
      error: ()        => { this.estadosValidos = []; }
    });
  }

  confirmarCambioEstado(): void {
    if (!this.selectedShipment?.id || !this.nuevoEstado) return;
    if (this.nuevoEstado === 'Con problemas' && !this.notaEstado.trim()) {
      this.errorEstado = 'Debe indicar el detalle del problema'; return;
    }
    this.guardandoEstado = true; this.errorEstado = '';
    this.enviosService.cambiarEstado(this.selectedShipment.id, {
      nuevoEstado: this.nuevoEstado, nota: this.notaEstado
    }).subscribe({
      next: (res: any) => {
        this.guardandoEstado = false;
        if (res?.statusCode === 200) {
          // Actualizar localmente
          const idx = this.shipments.findIndex(s => s.id === this.selectedShipment!.id);
          if (idx >= 0) {
            this.shipments[idx] = res.data;
            this.selectedShipment = res.data;
          }
          this.aplicarFiltros();
          this.mostrarCambioEstado = false;
        } else {
          this.errorEstado = res?.message || 'Error al cambiar estado';
        }
      },
      error: () => { this.guardandoEstado = false; this.errorEstado = 'Error de conexión'; }
    });
  }

  verBoleta(s: Envio): void {
    if (!s.id) return;
    this.cargandoPdf = true;
    this.enviosService.generarBoleta(s.id).subscribe({
      next: (res: any) => {
        this.cargandoPdf = false;
        if (res?.statusCode === 200) {
          const bytes = atob(res.data.base64);
          const arr   = Array.from(bytes, c => c.charCodeAt(0));
          const blob  = new Blob([new Uint8Array(arr)], { type: 'application/pdf' });
          window.open(URL.createObjectURL(blob), '_blank');
        }
      },
      error: () => { this.cargandoPdf = false; }
    });
  }

  estadoClass(estado: string | undefined): string {
    return this.ESTADOS_COLOR[estado || ''] || 'registrado';
  }

  get todosLosEstados(): string[] {
    return Object.keys(this.ESTADOS_COLOR);
  }

  get requiereNota(): boolean {
    return this.nuevoEstado === 'Con problemas';
  }
}
