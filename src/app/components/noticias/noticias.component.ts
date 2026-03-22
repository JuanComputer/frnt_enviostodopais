import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss']
})
export class NoticiasComponent {
  noticiaSeleccionada: string | null = null;

  noticias = [
    {
      id: 'rutas',
      categoria: 'Expansión',
      fecha: 'Enero 2025',
      img: 'assets/img/route.png',
      titulo: 'Nuevas rutas de envío disponibles',
      resumen: 'Ahora llegamos a más ciudades en todo el Perú con tiempos mejorados.',
      detalle: 'Hemos incorporado nuevas sedes en Arequipa, Trujillo y Cusco, ampliando nuestra red de distribución. Los envíos a estas ciudades ahora tienen tiempo estimado de 2 a 3 días hábiles.'
    },
    {
      id: 'empaque',
      categoria: 'Consejos',
      fecha: 'Febrero 2025',
      img: 'assets/img/packaging.png',
      titulo: 'Cómo empaquetar tus artículos correctamente',
      resumen: 'Sigue estos consejos para asegurarte de que tus paquetes lleguen en perfectas condiciones.',
      detalle: 'Usa cartón doble capa para objetos pesados, protege los frágiles con papel burbuja y etiqueta claramente el destinatario. Nunca dejes espacios vacíos dentro de la caja.'
    },
    {
      id: 'cotizador',
      categoria: 'Novedad',
      fecha: 'Marzo 2025',
      img: 'assets/img/cotizacion.png',
      titulo: 'Nuevo cotizador en línea',
      resumen: 'Calcula el precio de tu envío de forma instantánea desde nuestra plataforma.',
      detalle: 'Nuestra nueva herramienta de cotización te permite conocer el costo exacto de tu envío ingresando el origen, destino, peso y valor declarado del paquete. Disponible 24/7 sin necesidad de registro.'
    }
  ];

  toggleDetalle(id: string) {
    this.noticiaSeleccionada = this.noticiaSeleccionada === id ? null : id;
  }
}
