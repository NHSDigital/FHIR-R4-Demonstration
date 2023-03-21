import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {EpisodeOfCare, Patient} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-episode-of-care',
  templateUrl: './episode-of-care.component.html',
  styleUrls: ['./episode-of-care.component.scss']
})
export class EpisodeOfCareComponent implements OnInit {

  @Input() episodes: EpisodeOfCare[] | undefined;

   @Input() showDetail = false;

  @Input() patient: Patient | undefined;

  @Output() episodeOfCare = new EventEmitter<any>();


  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<EpisodeOfCare>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'start', 'end', 'status',  'type', 'diagnosis', 'referral', 'provider', 'manager', 'team',
      'resource'];

  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.patientId !== undefined) {
    //  this.dataSource = new EpisodeOfCareDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<EpisodeOfCare>(this.episodes);
    }
  }

  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }


  selectEpisodeOfCare(episodeOfCare: EpisodeOfCare): void {
    this.episodeOfCare.emit(episodeOfCare);
  }
  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource
    };
    this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
}
