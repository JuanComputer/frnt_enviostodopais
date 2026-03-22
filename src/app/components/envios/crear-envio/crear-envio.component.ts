import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TiendasService } from '../../../services/tiendas/tiendas.service';
import { EnviosService } from '../../../services/envios/envios.service';
import { ModalMensajeComponent } from '../../modal-mensaje/modal-mensaje.component';

@Component({
  selector: 'app-crear-envio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ModalMensajeComponent],
  templateUrl: './crear-envio.component.html',
  styleUrls: ['./crear-envio.component.scss']
})
export class CrearEnvioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tiendasSvc = inject(TiendasService);
  private enviosSvc = inject(EnviosService);

  tiendas: any[] = [];
  isLoading = false;

  // Boleta generada
  boletaBase64: string | null = null;
  boletaFilename = '';
  ultimoEnvioId: string | null = null;

  // Modal
  modalVisible = false;
  modalSuccess = false;
  modalTitulo = '';
  modalMensaje = '';
  modalCodigo = '';
  modalEstado = '';

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
    tipoEntrega:      ['SEDE', Validators.required],
    destinoId:        [null as string | null],
    direccionEntrega: [''],

    // Documento
    tipoDocumento:     ['BOLETA', Validators.required],
    precioEnvio:       [null as number | null, [Validators.required, Validators.min(0)]],
    descripcionPaquete:['', Validators.required],
    fechaEstimada:     [''],
  });

  ngOnInit(): void {
    this.tiendasSvc.listar().subscribe({
      next: res => (this.tiendas = res.data || []),
      error: () => this.showModal(false, 'Error', 'No se pudieron cargar las tiendas')
    });

    this.form.get('tipoEntrega')?.valueChanges.subscribe(tipo => {
      const dir = this.form.get('direccionEntrega');
      if (tipo === 'DOMICILIO') dir?.setValidators([Validators.required]);
      else dir?.clearValidators();
      dir?.updateValueAndValidity();
    });
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showModal(false, 'Campos incompletos', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    this.isLoading = true;
    this.boletaBase64 = null;

    const v = this.form.value;

    // Construir payload adaptado al backend
    const payload = {
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
      tipoDocumento:      v.tipoDocumento,
      precioEnvio:        v.precioEnvio,
      descripcionPaquete: v.descripcionPaquete,
      fechaEstimada:      v.fechaEstimada || null,
    };

    this.enviosSvc.crear(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.statusCode === 200) {
          const envioId = res.data?.id;
          this.ultimoEnvioId = envioId;

          this.showModal(true, 'Envío registrado', res.message,
            res.data?.codigoTracking, res.data?.estado);

          this.form.reset({
            emisorTipoDoc: 'DNI',
            receptorTipoDoc: 'DNI',
            tipoEntrega: 'SEDE',
            tipoDocumento: 'BOLETA'
          });

          // Obtener el PDF automáticamente
          if (envioId) {
            this.enviosSvc.generarBoleta(envioId).subscribe({
              next: (boletaRes: any) => {
                if (boletaRes?.statusCode === 200) {
                  this.boletaBase64 = boletaRes.data.base64;
                  this.boletaFilename = boletaRes.data.filename;
                }
              },
              error: () => console.warn('No se pudo obtener la boleta PDF')
            });
          }
        } else {
          this.showModal(false, 'Error', res?.message || 'No se pudo crear el envío.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.showModal(false, 'Error de conexión', 'No se pudo contactar con el servidor.');
      }
    });
  }

  abrirBoleta() {
    if (!this.boletaBase64) return;
    const byteChars = atob(this.boletaBase64);
    const byteNums = Array.from(byteChars, c => c.charCodeAt(0));
    const blob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  descargarBoleta() {
    if (!this.boletaBase64) return;
    const byteChars = atob(this.boletaBase64);
    const byteNums = Array.from(byteChars, c => c.charCodeAt(0));
    const blob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.boletaFilename || 'boleta.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }

  showModal(success: boolean, titulo: string, mensaje: string,
            codigo = '', estado = '') {
    this.modalSuccess = success;
    this.modalTitulo  = titulo;
    this.modalMensaje = mensaje;
    this.modalCodigo  = codigo;
    this.modalEstado  = estado;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }
}
