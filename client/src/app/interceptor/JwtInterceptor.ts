// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//     intercept(req: HttpRequest<any>, next: HttpHandler) {
//         const jwtToken = localStorage.getItem('jwtToken');

//         // Skip adding JWT for the authentication call
//         if (req.url.includes('/authen')) {
//             return next.handle(req); 
//         }

//         if (jwtToken) {
//             const clonedRequest = req.clone({
//                 setHeaders: { Authorization: `Bearer ${jwtToken}` },
//             });
//             return next.handle(clonedRequest);
//         }

//         return next.handle(req);
//     }
// }
