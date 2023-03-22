import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {Patient, ServiceRequest, Task} from "fhir/r4";
import {TaskCreateComponent} from "../../../dialogs/task-create/task-create.component";
import {ServiceCreateComponent} from "../../../dialogs/service-create/service-create.component";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  requests: ServiceRequest[] = [];
  tasks: Task[] = [];
  patientid: string | null = null;
  public nhsNumber: string | undefined;
  constructor( private fhirSrv: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               public dialog: MatDialog,
               private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientid = this.eprService.patient.id;
        this.getRecords(this.eprService.patient);
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientid = patient.id

      this.getRecords(patient);
    });
  }

  private getRecords(patient : Patient) {
    if (patient !== undefined) {
      if (patient.identifier !== undefined) {
        for (const identifier of patient.identifier) {
          if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
            this.nhsNumber = identifier.value;
          }
        }
      }
    }
    this.fhirSrv.get('/Task?patient=' + this.patientid + '').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Task') {
                this.tasks.push(entry.resource as Task); }
            }
          }
        }
    );
    this.fhirSrv.get('/ServiceRequest?patient=' + this.patientid + '').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'ServiceRequest') { this.requests.push(entry.resource as ServiceRequest); }
            }
          }
        }
    );
  }
  addTask(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( TaskCreateComponent, dialogConfig);
  }

  addServiceRequest(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( ServiceCreateComponent, dialogConfig);
  }

}