import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';

@Injectable()
export class LogService {

    TAG_APP_NAME = "RHSTAFF ";
    isDebug: boolean = true;

    constructor(private http: HttpClient) {
    }

    print(isError: boolean, title: string, message, anException){
      if(this.isDebug){
        if(isError){
          console.log(this.TAG_APP_NAME + title, anException);
        }else{
          console.log(this.TAG_APP_NAME + title, message);
        }
      }
    }

}
