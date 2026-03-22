import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { TiendasService } from '../../../services/tiendas/tiendas.service';
import { EnviosService } from '../../../services/envios/envios.service';
import { CotizadorService } from '../../../services/cotizador.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ModalMensajeComponent } from '../../modal-mensaje/modal-mensaje.component';

@Component({
  selector: 'app-crear-envio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ModalMensajeComponent],
  templateUrl: './crear-envio.component.html',
  styleUrls: ['./crear-envio.component.scss']
})
export class CrearEnvioComponent implements OnInit, OnDestroy {
  private fb        = inject(FormBuilder);
  private tiendasSvc = inject(TiendasService);
  private enviosSvc  = inject(EnviosService);
  private cotizadorSvc = inject(CotizadorService);
  private authSvc    = inject(AuthService);
  private router     = inject(Router);
  private destroy$   = new Subject<void>();

  tiendas: any[]    = [];
  isLoading         = false;
  calculandoPrecio  = false;
  precioCalculado: number | null = null;
  diasEstimados: number | null   = null;
  errorPrecio: string | null     = null;

  // Estado post-registro
  envioCreado: any  = null;
  boletaBase64: string | null = null;
  boletaFilename = '';

  // Modal
  modalVisible  = false;
  modalSuccess  = false;
  modalTitulo   = '';
  modalMensaje  = '';
  modalCodigo   = '';
  modalEstado   = '';

  form = this.fb.group({
    // Emisor
    emisorTipoDoc:  ['DNI'],
    emisorDni:      ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]],
    emisorNombre:   ['', Validators.required],
    emisorTelefono: [''],
    emisorCorreo:   ['', Validators.email],

    // Receptor
    receptorTipoDoc: ['DNI'],
    receptorDni:     ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]],
    receptorNombre:  ['', Validators.required],

    // Entrega
    tipoEntrega:     ['SEDE', Validators.required],
    destinoId:       [null as string | null],
    direccionEntrega:[''],

    // Paquete
    peso:            [null as number | null, [Validators.required, Validators.min(0.01)]],
    valorDeclarado:  [null as number | null, [Validators.required, Validators.min(1)]],
    tipoServicio:    ['Estandar', Validators.required],
    descripcionPaquete: ['', Validators.required],

    // Documento
    tipoDocumento:   ['BOLETA', Validators.required],
    fechaEstimada:   [''],
  });

  ngOnInit(): void {
    this.tiendasSvc.listar().subscribe({
      next: res => (this.tiendas = res.data || []),
      error: () => this.showModal(false, 'Error', 'No se pudieron cargar las sedes')
    });

    // Dirección obligatoria si es DOMICILIO
    this.form.get('tipoEntrega')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tipo => {
        const dir = this.form.get('direccionEntrega');
        if (tipo === 'DOMICILIO') dir?.setValidators([Validators.required]);
        else dir?.clearValidators();
        dir?.updateValueAndValidity();
        this.recalcularPrecio();
      });

    // Recalcular precio cuando cambian campos relevantes
    const camposPrecio = ['destinoId', 'peso', 'valorDeclarado', 'tipoServicio'];
    camposPrecio.forEach(campo => {
      this.form.get(campo)?.valueChanges
        .pipe(debounceTime(600), takeUntil(this.destroy$))
        .subscribe(() => this.recalcularPrecio());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  recalcularPrecio(): void {
    const v = this.form.value;
    // Necesitamos destino (o al menos para DOMICILIO no), peso y valor declarado
    const peso = v.peso;
    const valorDeclarado = v.valorDeclarado;
    const tipoServicio = v.tipoServicio || 'Estandar';
    const destinoId = v.destinoId;
    const tipoEntrega = v.tipoEntrega;

    if (!peso || !valorDeclarado || peso <= 0 || valorDeclarado < 0) {
      this.precioCalculado = null;
      this.diasEstimados = null;
      this.errorPrecio = null;
      return;
    }
    if (tipoEntrega === 'SEDE' && !destinoId) {
      this.precioCalculado = null;
      this.errorPrecio = null;
      return;
    }

    this.calculandoPrecio = true;
    this.errorPrecio = null;

    // Para cotizar necesitamos un origenId — usamos el mismo destino como placeholder
    // El backend usa solo el tipo de servicio + peso + valor para calcular
    const payload = {
      origenId: destinoId || '00000000-0000-0000-0000-000000000000',
      destinoId: destinoId || '00000000-0000-0000-0000-000000000000',
      peso: peso,
      tipoServicio: tipoServicio,
      valorDeclarado: valorDeclarado
    };

    this.cotizadorSvc.calcular(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.calculandoPrecio = false;
          if (res?.statusCode === 200) {
            this.precioCalculado = res.data.precio;
            this.diasEstimados   = res.data.diasEstimados;
          } else {
            this.errorPrecio = 'No se pudo calcular el precio';
          }
        },
        error: () => {
          this.calculandoPrecio = false;
          this.errorPrecio = 'Error al conectar con el cotizador';
        }
      });
  }

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showModal(false, 'Campos incompletos', 'Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!this.precioCalculado) {
      this.showModal(false, 'Precio no calculado', 'Espera a que el sistema calcule el precio antes de continuar.');
      return;
    }

    this.isLoading = true;
    const v = this.form.value;

    const payload: any = {
      emisorNombre:       v.emisorTipoDoc === 'RUC' ? null : v.emisorNombre,
      emisorRazonSocial:  v.emisorTipoDoc === 'RUC' ? v.emisorNombre : null,
      emisorDni:          v.emisorDni,
      emisorTelefono:     v.emisorTelefono || null,
      emisorCorreo:       v.emisorCorreo || null,
      receptorNombre:     v.receptorTipoDoc === 'RUC' ? null : v.receptorNombre,
      receptorRazonSocial:v.receptorTipoDoc === 'RUC' ? v.receptorNombre : null,
      receptorDni:        v.receptorDni,
      destinoId:          v.destinoId || null,
      tipoEntrega:        v.tipoEntrega,
      direccionEntrega:   v.direccionEntrega || null,
      peso:               v.peso,
      valorDeclarado:     v.valorDeclarado,
      tipoServicio:       v.tipoServicio,
      descripcionPaquete: v.descripcionPaquete,
      tipoDocumento:      v.tipoDocumento,
      fechaEstimada:      v.fechaEstimada || null,
    };

    this.enviosSvc.crear(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.statusCode === 200) {
          this.envioCreado = res.data;
          this.showModal(true, 'Envío registrado', '¡El envío fue registrado exitosamente!',
            res.data?.codigoTracking, res.data?.estado);
          // Obtener PDF
          if (res.data?.id) {
            this.enviosSvc.generarBoleta(res.data.id).subscribe({
              next: (br: any) => {
                if (br?.statusCode === 200) {
                  this.boletaBase64 = br.data.base64;
                  this.boletaFilename = br.data.filename;
                }
              }
            });
          }
        } else {
          this.showModal(false, 'Error', res?.message || 'No se pudo registrar el envío.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.showModal(false, 'Error de conexión', 'No se pudo contactar con el servidor.');
      }
    });
  }

  registrarOtro(): void {
    this.envioCreado    = null;
    this.boletaBase64   = null;
    this.boletaFilename = '';
    this.precioCalculado = null;
    this.diasEstimados   = null;
    this.form.reset({
      emisorTipoDoc: 'DNI', receptorTipoDoc: 'DNI',
      tipoEntrega: 'SEDE', tipoServicio: 'Estandar', tipoDocumento: 'BOLETA'
    });
  }

  salir(): void {
    this.router.navigate(['/lista-envios']);
  }

  abrirBoleta(): void {
    if (!this.boletaBase64) return;
    const blob = this.base64ToBlob(this.boletaBase64);
    window.open(URL.createObjectURL(blob), '_blank');
  }

  descargarBoleta(): void {
    if (!this.boletaBase64) return;
    const blob = this.base64ToBlob(this.boletaBase64);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = this.boletaFilename || 'boleta.pdf';
    a.click();
  }

  private base64ToBlob(b64: string): Blob {
    const bytes = atob(b64);
    const arr = Array.from(bytes, c => c.charCodeAt(0));
    return new Blob([new Uint8Array(arr)], { type: 'application/pdf' });
  }

  showModal(success: boolean, titulo: string, mensaje: string, codigo = '', estado = ''): void {
    this.modalSuccess = success; this.modalTitulo = titulo;
    this.modalMensaje = mensaje; this.modalCodigo = codigo;
    this.modalEstado  = estado;  this.modalVisible = true;
  }

  cerrarModal(): void { this.modalVisible = false; }

  // Helper para marcar campo como inválido y tocado
  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }
}
