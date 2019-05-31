import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Cliente } from './cliente';
import { Region } from './region';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';

import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { AuthService } from '../usuarios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  private noEstaAutorizado(e): boolean {
    if (e.status == 401) {

      if (this.authService.estaAutenticado()) {
        this.authService.logout();
      }

      this.router.navigate(['/login']);
      return true;
    }

    if (e.status == 403) {
      swal.fire('Acceso denegado', 'Hola ' + this.authService.usuario.username + ', no tienes acceso a este recurso!', 'warning');
      this.router.navigate(['/clientes']);
      return true;
    }

    return false;
  }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones').pipe(
      catchError(e => {
        this.noEstaAutorizado(e);
        return throwError(e);
      })
    );
  }

  // Lista todos los clientes
  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page)
      .pipe(
        tap((response: any) => {
          (response.content as Cliente[]).forEach(cliente => {
            console.log(cliente.nombre);
          });
        }),
        map((response: any) => {
          (response.content as Cliente[]).map(cliente => {
            cliente.nombre = cliente.nombre.toUpperCase();
            // cliente.createdAt = formatDate(cliente.createdAt, 'EEEE dd, MMMM yyyy', 'es');
            return cliente;
          });
          return response;
        }),
        tap(response => {
          (response.content as Cliente[]).forEach(cliente => {
            console.log(cliente.nombre);
          });
        })
      );
  }

  // Crea un cliente
  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError(e => {

        if (this.noEstaAutorizado(e)) {
          return throwError(e);
        }

        if (e.status === 400) {
          return throwError(e);
        }

        console.error(e.error.mensaje);
        swal.fire('Error al crear al cliente', e.error.error, 'error')
        return throwError(e);
      })
    );
  }

  // Lista un cliente por ID
  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (this.noEstaAutorizado(e)) {
          return throwError(e);
        }
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        swal.fire('Error al editar', e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Actualiza un cliente por ID
  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(this.urlEndPoint + '/' + cliente.id, cliente).pipe(
      catchError(e => {

        if (this.noEstaAutorizado(e)) {
          return throwError(e);
        }

        if (e.status === 400) {
          return throwError(e);
        }

        console.error(e.error.mensaje);
        swal.fire('Error al actualizar al cliente', e.error.error, 'error')
        return throwError(e);
      })
    );
  }

  // Elimina un cliente por ID
  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(this.urlEndPoint + '/' + id).pipe(
      catchError(e => {

        if (this.noEstaAutorizado(e)) {
          return throwError(e);
        }
        console.error(e.error.mensaje);
        swal.fire('Error al eliminar el cliente', e.error.error, 'error')
        return throwError(e);
      })
    );
  }

  // Sube foto de perfil
  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id', id);

  
    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      catchError(e => {
        this.noEstaAutorizado(e);
        return throwError(e);
      })
    );

  }
}
