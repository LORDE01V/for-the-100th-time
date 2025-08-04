import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const user = localStorage.getItem('user');
  
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${userData.token}`
        }
      });
    }
  }
  
  return next(req);
};