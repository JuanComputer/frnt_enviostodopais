import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CotizadorService } from '../../services/cotizador.service';
import { TiendasService } from '../../services/tiendas/tiendas.service';
import { Subject, takeUntil } from 'rxjs';
import { ResponseDto } from '../../shared/models/response-dto';
import { Tienda } from '../../shared/models/tienda.model';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cotizador.component.html',
  styleUrls: ['./cotizador.component.scss']
})
export class CotizadorComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  tiendas: Tienda[] = [];
  resultado: any = null;
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cotizadorService: CotizadorService,
    private tiendasService: TiendasService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      origenId: ['', Validators.required],
      destinoId: ['', Validators.required],
      peso: ['', [Validators.required, Validators.min(0.1)]],
      tipoServicio: ['Normal', Validators.required], // Ajustado a 'Normal'
      valorDeclarado: ['', [Validators.required, Validators.min(0)]]
    });

    // Solo cargar tiendas en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.cargarTiendas();
    }
  }

  cargarTiendas() {
    this.tiendasService
      .listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ResponseDto<Tienda[]>) => {
          this.tiendas = res.data || [];
          if (!this.tiendas.length) {
            this.toastr.error('No se pudieron cargar las tiendas');
          }
        },
        error: () => {
          this.toastr.error('No se pudieron cargar las tiendas');
        }
      });
  }

  cotizar() {
    if (this.form.invalid) {
      this.toastr.warning('Complete todos los campos correctamente');
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.resultado = null;

    this.cotizadorService
      .calcular(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ResponseDto<any>) => {
          this.isLoading = false;
          if (res.statusCode === 200) {
            // Mapear la respuesta del backend a los nombres esperados por el template
            this.resultado = {
              precio:         res.data.precio,
              diasEstimados:  res.data.diasEstimados,
              valorDeclarado: res.data.valorDeclarado
            };
          } else {
            this.toastr.error(res.message || 'No se pudo calcular el costo');
          }
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error de conexión con el servidor');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  validateOrigin() {
    if (this.form.get('origenId')?.value === this.form.get('destinoId')?.value) {
      this.form.get('destinoId')?.setErrors({ match: true });
    }
  }

  validateDestination() {
    if (this.form.get('destinoId')?.value === this.form.get('origenId')?.value) {
      this.form.get('destinoId')?.setErrors({ match: true });
    }
  }

  validateWeight() {
    const peso = this.form.get('peso')?.value;
    if (peso && peso < 0.1) {
      this.form.get('peso')?.setErrors({ min: true });
    }
  }

  validateValue() {
    const valor = this.form.get('valorDeclarado')?.value;
    if (valor && valor < 0) {
      this.form.get('valorDeclarado')?.setErrors({ min: true });
    }
  }
}