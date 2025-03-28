import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';
import {URL_SERVICIOS} from '../config/rhapp.config';
import {URL_NOTIFICATION} from '../config/rhapp.config';
import {LogService} from 'src/services/log.services';

@Injectable()
export class DataService {

    // API path
    BASE_PATH = URL_SERVICIOS;
    PUSH_PATH = URL_NOTIFICATION;

    constructor(
      private logging: LogService,
      private http: HttpClient
    ) {
    }

    // Http Options
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    // Http Options for Login
    httpLoginOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/x-authc-username-password-web+json'
        })
    };

    // Handle API errors
    handleError(error: HttpErrorResponse) {
      this.logging.print(true, 'handleError', '', error);
      return throwError(error);
    };

    sendPush(encodedurl){
      const url = `${this.PUSH_PATH}?${encodedurl}`;
      this.logging.print(false, 'sendPush: ' + url, encodedurl, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    updatePass(userid, authObj): Observable<any> {
        const url = `${this.BASE_PATH}/users/${userid}`;
        this.logging.print(false, 'updatePass: ' + url, authObj, undefined);
        return this.http
            .put(url, authObj, this.httpOptions)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    updateStaff(staffId, objUpdate): Observable<any> {
        const url = `${this.BASE_PATH}/rh_staffs/${staffId}`;
        this.logging.print(false, 'updateStaff: ' + url, objUpdate, undefined);
        return this.http
            .put(url, objUpdate, this.httpOptions)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    addSkill(objSkill): Observable<any> {
        const url = `${this.BASE_PATH}/rh_staff_additional`;
        this.logging.print(false, 'addSkill: ' + url, objSkill, undefined);
        return this.http
            .post(url, objSkill, this.httpOptions)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    login(authObject): Observable<any> {
        const url = `${this.BASE_PATH}/authenticate`;
        this.logging.print(false, 'login', authObject, undefined);
        return this.http
            .post(url, authObject, this.httpLoginOptions)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    forgotPassword(body): Observable<any> {
        const url = `${this.BASE_PATH}/authenticate/forgot-password`;
        this.logging.print(false, 'forgotPassword:' + url, body, undefined);
        return this.http.post<any>(url, body, this.httpOptions);
    }

    createMessage(message): Observable<any> {
        const url = `${this.BASE_PATH}/notifications`;
        this.logging.print(false, 'createMessage', message, undefined);
        return this.http
            .post(url, message, this.httpOptions)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    validate(authObject): Observable<any> {
      const encodedmessage = encodeURI(authObject);
      const url = `${this.BASE_PATH}/user_role/filter?username=${encodedmessage}`;
      this.logging.print(false, 'validate: ' + url, authObject, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEmails(): Observable<any> {
      const url = `${this.BASE_PATH}/accounts`;
      this.logging.print(false, 'getEmails: ' + url, '', undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getNotifications(): Observable<any> {
      const url = `${this.BASE_PATH}/notifications`;
      this.logging.print(false, 'getNotifications: ' + url, '', undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getNotificationsByEvent(eventid): Observable<any> {
      const url = `${this.BASE_PATH}/notifications/filter?eventId=${eventid}`;
      this.logging.print(false, 'getNotificationsByEvent: ' + url, eventid, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    staffList(): Observable<any> {
      const url = `${this.BASE_PATH}/rh_staffs`;
      this.logging.print(false, 'staffList', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    staffDetails(userid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_staffs/${userid}`;
      this.logging.print(false, 'staffDetails', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    staffAdditionals(userid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_staff_additional/filter?staffId=${userid}`;
      this.logging.print(false, 'staffAdditionals', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    staffSkills(): Observable<any> {
      const url = `${this.BASE_PATH}/rh_staff_additional/filter?paramKey=SKILLS`;
      this.logging.print(false, 'staffSkills', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEvent(eventId): Observable<any> {
      const url = `${this.BASE_PATH}/rh_events/${eventId}`;
      this.logging.print(false, 'getEvent', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEvents(): Observable<any> {
      const url = `${this.BASE_PATH}/rh_events`;
      this.logging.print(false, 'getEvents', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    updateEventStatus(eventId, obj): Observable<any> {
      const url = `${this.BASE_PATH}/rh_events/${eventId}`;
      this.logging.print(false, 'updateEventStatus', url, undefined);
      return this.http
          .put(url, obj, this.httpOptions)
          .pipe(
              retry(2),
              catchError(this.handleError)
          )
    }

    updateEventStaffStatus(staffEventId, obj): Observable<any> {
      const url = `${this.BASE_PATH}/rh_event_staff/${staffEventId}`;
      this.logging.print(false, 'updateEventStaffStatus', url, undefined);
      return this.http
          .put(url, obj, this.httpOptions)
          .pipe(
              retry(2),
              catchError(this.handleError)
          )
    }

    getClientAdmin(adminid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_client_admin/filter?adminId=${adminid}`;
      this.logging.print(false, 'getClientAdmin', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEventsByStaff(userid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_event_staff/filter?staffId=${userid}`;
      this.logging.print(false, 'getEventsByStaff', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEventByStaff(userid, eventid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_event_staff/filter?staffId=${userid}&eventId=${eventid}`;
      this.logging.print(false, 'getEventByStaff', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEventSkills(eventid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_event_skill/filter?eventId=${eventid}`;
      this.logging.print(false, 'getEventSkills', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getStaffByEvent(eventid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_event_staff/filter?eventId=${eventid}`;
      this.logging.print(false, 'getStaffByEvent', url, undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    getEventsByManager(userid): Observable<any> {
      const url = `${this.BASE_PATH}/rh_event_manager/filter?managerId=${userid}`;
      this.logging.print(false, 'getEventsByManager' + url, '', undefined);
      return this.http.get(url)
          .pipe(
              retry(0),
              catchError(this.handleError)
          )
    }

    register(wizard): Observable<any> {
        const url = `${this.BASE_PATH}/rh_staffs`;
        this.logging.print(false, 'register: ' + url, wizard, undefined);
        return this.http
            .post(url, wizard, this.httpOptions)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    getParams(): Observable<any> {
        const url = `${this.BASE_PATH}/rh_parameters`;
        this.logging.print(false, 'getParams', url, undefined);
        return this.http.get<any>(url)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }

    getParamsByKey(key: string): Observable<any> {
        const url = `${this.BASE_PATH}/rh_parameters/param_key/${key}`;
        this.logging.print(false, 'getParamsByKey', url, undefined);
        return this.http.get<any>(url)
            .pipe(
                retry(2),
                catchError(this.handleError)
            )
    }
}
