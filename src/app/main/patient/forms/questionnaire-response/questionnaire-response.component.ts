import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import { QuestionnaireResponse} from 'fhir/r4';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {FhirService} from '../../../../services/fhir.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {Router} from "@angular/router";

@Component({
  selector: 'app-questionnaire-response',
  templateUrl: './questionnaire-response.component.html',
  styleUrls: ['./questionnaire-response.component.css']
})
export class QuestionnaireResponseComponent implements OnInit {

    @Input() forms: QuestionnaireResponse[] | undefined;

    @Input() showDetail = false;

    @Input() patientId: string | undefined;

    @Output() form = new EventEmitter<any>();

    @Input() useBundle = false;

  // @ts-ignore
    dataSource: MatTableDataSource<QuestionnaireResponse>;
  @ViewChild(MatSort) sort: MatSort | undefined;

    displayedColumns = ['date', 'questionnaire', 'status',  'source', 'author', 'resource'];

    constructor(
                public dialog: MatDialog,
                public fhirService: FhirService,
                private router: Router,
    ) { }

    ngOnInit(): void {

        if (this.patientId !== undefined) {
          //  this.dataSource = new QuestionnaireResponseDataSource(this.fhirService, this.patientId, []);
        } else {
          this.dataSource = new MatTableDataSource<QuestionnaireResponse>(this.forms);
        }

    }
  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
        this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }




    select(resource: any): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            id: 1,
            resource
        };
        const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
    }

    viewForm(form : QuestionnaireResponse): void {
        this.router.navigate(['/patient', form.subject?.reference?.replace('Patient/',''), 'forms', form.id])
    }


  getName(url: string ): string {
      var questionnaire = this.fhirService.getQuestionnaire(url);
      if (questionnaire !== undefined) {
          if (questionnaire.title) return questionnaire.title
      }
      return 'Not found';
  }
}
