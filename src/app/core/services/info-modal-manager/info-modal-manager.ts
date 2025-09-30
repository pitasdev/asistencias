import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class InfoModalManager {
  success(mensaje: string): void {
    Swal.fire({
      icon: 'success',
      html: mensaje,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonColor: '#2c90ca'
    })
  }

  error(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      html: mensaje,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonColor: '#2c90ca'
    })
  }

  warning(mensaje: string): void {
    Swal.fire({
      icon: 'warning',
      html: mensaje,
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 4000,
      timerProgressBar: true,
      confirmButtonColor: '#2c90ca'
    })
  }

  info(mensaje: string): void {
    Swal.fire({
      icon: 'info',
      html: mensaje,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonColor: '#2c90ca'
    })
  }

  notifySuccess(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'bottom',
      icon: 'success',
      html: mensaje,
      showConfirmButton: false,
      timer: 3000
    })
  }

  notifyError(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'bottom',
      icon: 'error',
      html: mensaje,
      showConfirmButton: false,
      timer: 3000
    })
  }
}
