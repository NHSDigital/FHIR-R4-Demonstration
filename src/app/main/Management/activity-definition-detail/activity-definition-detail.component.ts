import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivityDefinition} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {FhirService} from "../../../services/fhir.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";

@Component({
  selector: 'app-activity-definition-detail',
  templateUrl: './activity-definition-detail.component.html',
  styleUrls: ['./activity-definition-detail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ActivityDefinitionDetailComponent implements OnInit {

  @Input() activities: ActivityDefinition[] =[];

  expandedElement: null | ActivityDefinition | undefined;


  // @ts-ignore
  dataSource: MatTableDataSource<ActivityDefinition>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'status', 'title', 'code', 'description',  'resource'];

  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;

  constructor(
      private _loadingService: TdLoadingService,
      public dialog: MatDialog,
      public fhirService: FhirService) { }

  ngOnInit(): void {
    this.fhirService.getTIE('/ActivityDefinition').subscribe(bundle => {
      this._loadingService.resolve('overlayStarSyntax');
      if (bundle.entry !== undefined) {
        for (const entry of bundle.entry) {
          if (entry.resource !== undefined && entry.resource.resourceType === 'ActivityDefinition') {
            this.activities.push(entry.resource as ActivityDefinition); }
        }
        this.dataSource = new MatTableDataSource<ActivityDefinition>(this.activities);
      }
    });
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

}
