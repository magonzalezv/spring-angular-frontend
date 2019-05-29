import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styles: []
})
export class FormComponent implements OnInit {

  public cliente: Cliente = new Cliente();
  public titulo = 'Crear cliente';

  public errores: string[];

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.cargarCliente();
  }

  cargarCliente(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      
      if (id) {
        this.clienteService.getCliente(id).subscribe((cliente) => this.cliente = cliente);
      }

    });
  }

   create(): void {
    this.clienteService.create(this.cliente)
    .subscribe(cliente => {
      this.router.navigate(['/clientes']);
      swal.fire('Nuevo cliente', `El cliente ${cliente.nombre} ha sido creado con éxito`, 'success')
    },
    err => {
      this.errores = err.error.errors as string[];
      console.error('Código del estado desde el backend: ' + err.status);
      console.error(err.error.errors);
    }
    );
  }

  update(): void {
    this.clienteService.update(this.cliente)
      .subscribe( response => {
        this.router.navigate(['/clientes']);
        swal.fire('Usuario actualizado', ` ${response.mensaje}: ${response.cliente.nombre}`, 'success');
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Código del estado desde el backend: ' + err.status);
        console.error(err.error.errors);
      });
  }

  

}
