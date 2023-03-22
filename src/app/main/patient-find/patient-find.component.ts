import { Component, OnInit } from '@angular/core';

import {UntypedFormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {EprService} from '../../services/epr.service';
import {Patient} from 'fhir/r4';


@Component({
  selector: 'app-patient-find',
  templateUrl: './patient-find.component.html',
  styleUrls: ['./patient-find.component.css']
})
export class PatientFindComponent implements OnInit {

  constructor(private _formBuilder: UntypedFormBuilder, private router: Router, private eprService: EprService) { }

  ngOnInit() {

  }

    yesno = [
        {name: 'Yes', viewValue: 0},
        {name: 'No', viewValue: 1}
    ];
    sexes = [
        {name: 'Female', viewValue: 'female'},
        {name: 'Male', viewValue: 'male'}
    ];

    disabled: boolean = false;


    selectPatient(patient: Patient) {
        console.log('Patient change - '+patient.id);
        this.eprService.setPatient(patient);
        this.router.navigateByUrl('patient/' + patient.id);
    }

}
