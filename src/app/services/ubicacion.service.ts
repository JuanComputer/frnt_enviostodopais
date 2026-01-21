import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento, Distrito,Provincia } from '../shared/models/ubigeo.model'; 
import { ResponseDto } from '../shared/models/response-dto'; 

@Injectable({ providedIn: 'root' })
export class UbicacionService {

  private base = 'https://back-enviostodopais.onrender.com/api/ubigeo';

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<ResponseDto<Departamento[]>> {
    return this.http.get<ResponseDto<Departamento[]>>(`${this.base}/departamentos`);
  }

  getProvincias(depCodigo: string): Observable<ResponseDto<Provincia[]>> {
    return this.http.get<ResponseDto<Provincia[]>>(
      `${this.base}/provincias`,
      { params: { departamentoCodigo: depCodigo } }
    );
  }

  getDistritos(provCodigo: string): Observable<ResponseDto<Distrito[]>> {
    return this.http.get<ResponseDto<Distrito[]>>(
      `${this.base}/distritos`,
      { params: { provinciaCodigo: provCodigo } }
    );
  }
}
