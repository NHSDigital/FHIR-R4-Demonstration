import { Component, OnInit } from '@angular/core';
import {StravaService} from "../../../services/strava.service";
import {WithingsService} from "../../../services/withings.service";
import {EprService} from "../../../services/epr.service";
import {HttpClient} from "@angular/common/http";
import {Observable, tap, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-personal-health-device',
  templateUrl: './personal-health-device.component.html',
  styleUrls: ['./personal-health-device.component.scss']
})
export class PersonalHealthDeviceComponent implements OnInit {
  patientid: string | null = null;
  visible = false;
  constructor(  private strava: StravaService,
                private http: HttpClient,
                private withings: WithingsService,
                private eprService: EprService,) { }

  ngOnInit(): void {
    this.getVisible();
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientid = this.eprService.patient.id;
      }
    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientid = patient.id
    });

  }
  connectStrava(): void {

    console.log(window.location.origin);
    this.strava.authorise(window.location.origin + '/patient/'+this.patientid);
  }

  connectWithings(): void {
    console.log(window.location.origin);
    this.withings.authorise(window.location.origin + '/patient/'+this.patientid);
  }

  getVisible() {
  //  this.visible = false;
    console.log('getVisible');
    this.http.get<any>('https://geolocation-db.com/json/')
        .pipe(
            catchError((err: any, caught: any) => {
       //       console.log(err)
              return throwError(err)
            }),
            tap(response => {
              if (response.IPv4 === '86.27.236.161') {
                this.visible = true;
            //    console.log(response.IPv4);
              }

            })
        ).subscribe(next => {
         // console.log('called')
    })
  }

}
