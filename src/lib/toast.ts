import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'glass-alert',
    title: 'alert-title',
    confirmButton: 'btn-primary',
    cancelButton: 'btn-secondary'
  },
  buttonsStyling: false,
  background: 'rgba(18, 18, 42, 0.95)',
  color: '#e8e8f0',
});

export const toast = {
  success: (title: string, text?: string) => {
    return customSwal.fire({
      icon: 'success',
      iconColor: '#10b981',
      title,
      text,
      timer: 3000,
      showConfirmButton: false,
    });
  },
  error: (title: string, text?: string) => {
    return customSwal.fire({
      icon: 'error',
      iconColor: '#ef4444',
      title,
      text,
    });
  },
  confirm: (title: string, text: string) => {
    return customSwal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، متأكد',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });
  }
};
