import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CarePlan, CareTeam, EpisodeOfCare, Goal, Patient} from "fhir/r4";
import {CareTeamCreateComponent} from "./care-team-create/care-team-create.component";
import {CarePlanCreateComponent} from "./care-plan-create/care-plan-create.component";
import {EpisodeOfCareCreateComponent} from "./episode-of-care-create/episode-of-care-create.component";
import {GoalCreateComponent} from "./goal-create/goal-create.component";

@Component({
  selector: 'app-coordinated-care',
  templateUrl: './coordinated-care.component.html',
  styleUrls: ['./coordinated-care.component.scss']
})
export class CoordinatedCareComponent implements OnInit {
  episodes: EpisodeOfCare[] = [];
  careTeams: CareTeam[] = [];
  carePlans: CarePlan[] = [];
  patientId: string | undefined = undefined;
  private nhsNumber: string | undefined;
  goals: Goal[] = [];
  constructor( private fhirService: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               public dialog: MatDialog,
               private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {

    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientId = this.eprService.patient.id;
        this.getRecords(this.eprService.patient);
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id

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
    this.fhirService.get('/EpisodeOfCare?patient=' + this.patientId + '&status=active,waitlist').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'EpisodeOfCare') { this.episodes.push(entry.resource as EpisodeOfCare); }
            }
          }
        }
    );


    this.fhirService.getTIE('/CarePlan?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'CarePlan') { this.carePlans.push(entry.resource as CarePlan); }
            }
          }
        }
    );

    this.fhirService.getTIE('/Goal?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Goal') { this.goals.push(entry.resource as Goal); }
            }
          }
        }
    );

    this.fhirService.getTIE('/CareTeam?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
            }
          }
        }
    );
  }

  addCareTeam(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( CareTeamCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.resourceType !== undefined) {
        console.log(result)
        this.careTeams.push(result);
        this.careTeams = Object.assign([], this.careTeams)
      }
    })
  }
  addCarePlan(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( CarePlanCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.resourceType !== undefined) {
        console.log(result)
        this.carePlans.push(result);
        this.carePlans = Object.assign([], this.carePlans)
      }
    })
  }

  addStay(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( EpisodeOfCareCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.resourceType !== undefined) {
        console.log(result)
        this.episodes.push(result);
        this.episodes = Object.assign([], this.episodes)
      }
    })
  }


    addGoal() {
      const dialogConfig = new MatDialogConfig();

      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.height = '80%';
      dialogConfig.width = '50%';

      dialogConfig.data = {
        id: 1,
        patientId: this.patientId,
        nhsNumber: this.nhsNumber
      };
      const dialogRef = this.dialog.open( GoalCreateComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {

        if (result !== undefined && result.resourceType !== undefined) {
          console.log(result)
          this.goals.push(result);
          this.goals = Object.assign([], this.goals)
        }
      })
    }
}
