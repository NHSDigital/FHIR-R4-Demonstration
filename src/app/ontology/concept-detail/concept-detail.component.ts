import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {Parameters, ParametersParameter, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {ResourceDialogComponent} from "../../dialogs/resource-dialog/resource-dialog.component";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {FlatTreeControl} from "@angular/cdk/tree";


interface Concept {
  name: string;
  code: ValueSetExpansionContains
  children: Concept[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-concept-detail',
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss']
})
export class ConceptDetailComponent implements OnInit {
  private _transformer = (node: Concept, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node.code,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level,
      node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children,
  );

  // @ts-ignore
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;


  @Input()
  concept : ValueSetExpansionContains = {

  }
  parameters: Parameters | undefined;
  parentList: ValueSetExpansionContains[]=[];
  childList: ValueSetExpansionContains[]=[];
  synonyms: string[] = [];
  fullName: string | undefined
  preferred: string | undefined
  tags: string | undefined

  conceptData : Concept[] = [];
  dmd: string | undefined;
  constructor(public fhirService: FhirService,
              public dialog: MatDialog,) { }

  ngOnInit(): void {

      this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['concept']) this.getData()
  }

  getData() {

    this.parentList = []
    this.childList = []
    this.dmd = undefined
    if (this.concept !== undefined && this.concept.system !== undefined && this.concept.code !== undefined) {
      this.fhirService.lookup(this.concept.system, this.concept.code).subscribe( params => {

        this.parameters = params
        this.getPropertyRoles()

        var childConcept :Concept = {
          code: {
          },
          name: 'Child',
          children: []
        }

        this.conceptData.push(childConcept)
        var children = this.getParameters("child")
        var maxCodes = 25;
        for(let child of children) {
          maxCodes--;
          // @ts-ignore
          var childCT = {name: child,
                code: {
                  system: 'http://snomed.info/sct',
                  code: child,
                  display: child
                },
                children: []
              }
          childConcept.children.push(childCT)
          if (maxCodes>0) {
            this.getName(childCT)
          }
        }
        var parents = this.getParameters("parent")
        for(let parent of parents) {
          // @ts-ignore
          var parentConcept : Concept = { name: this.getParameter("display", params),
            code: {
              system: 'http://snomed.info/sct',
              code: parent,
              display : this.getParameter("display", params)
            },
            children:[]
          }
          this.conceptData.push(parentConcept)
          this.getName(parentConcept)
        }
      } )
    }
  }

  getPropertyRoles() {
    this.conceptData=[]
    if (this.parameters!==undefined && this.parameters.parameter!==undefined) {
          this.getProperty(this.parameters.parameter, this.conceptData)
    }
    this.dataSource.data = this.conceptData
  }
  getProperty(parameters : ParametersParameter[], concepts : Concept[]) {
    this.fullName = undefined
    this.preferred = undefined
    this.synonyms = []
    this.tags = undefined
    for (let parameter of parameters) {
      if ((parameter.name === 'property' || parameter.name === 'subproperty') && parameter.part !== undefined) {
        var role: any | undefined = undefined
        var subProperty : ParametersParameter[] = []
        var valueCode : any | undefined = undefined
        for (let it of parameter.part) {
          if (it.name === 'subproperty') {
            subProperty.push(it)
          }
          if (it.name === 'valueCode') {
            valueCode = it
          }
          if (it.name === 'code' && it.valueCode !== undefined ) {
            if (Number(it.valueCode) > 0) {
              role = it
            }
          }
        }
        if (role !== undefined) {
          var concept: Concept | undefined = undefined;
          /// find existing concept
          for (let it of concepts) {
            if (it.code.code === role.valueCode) {
              concept = it
            }
          }
          // add if concept not found
          if (concept === undefined) {
            concept = {
              name: role.valueCode,
              code: {
                code: role.valueCode
              },
              children: []
            }
            concepts.push(concept)
            this.getName(concept)

          }
          if (subProperty.length>0) {
            this.getProperty(subProperty,concept.children)
          }
          if (valueCode !== undefined) {
            var valueConcept = {
              name: valueCode.valueCode,
              code: {
                code: valueCode.valueCode
              },
              children: []
            }
            concept.children.push(valueConcept)
            this.getName(valueConcept)
          }
        }
      }
      if (parameter.name === 'designation') {
         if (parameter.part !== undefined) {
           var use: string | undefined
           var value : string | undefined
           for (let part of parameter.part) {
             if (part.name=='use' && part.valueCoding !== undefined) {
               use = part.valueCoding.code
             }
             if (part.name=='value' && part.valueString !== undefined) {
               value = part.valueString
             }
           }
           if (use !== undefined && value !== undefined) {
              if (use === '900000000000003001') {
                this.fullName = value
                var strings = value.split('(')
                this.tags = strings[strings.length-1].replace(')','')
              }
             if (use === '900000000000013009') this.synonyms.push(value)
             if (use === 'preferredForLanguage') this.preferred = value

           }
         }
      }
    }
  }

  getName(concept : Concept) {
    if (concept.code.code !== undefined) {

      switch (concept.code.code) {
        case '10363801000001108': {

          concept.name = 'Virtual medicinal product'
          concept.code.display = concept.name
          this.dmd = 'VMP'
          return
        }
        case '10363901000001102': {
            concept.name = 'Actual medicinal product'
          concept.code.display = concept.name
            this.dmd = 'AMP'
            return
          }
        case '8653601000001108': {
          concept.name = 'Virtual medicinal product pack'
          concept.code.display = concept.name
          this.dmd = 'VMPP'
          return
        }
        case '10364001000001104': {
          concept.name = 'Actual medicinal product pack'
          concept.code.display = concept.name
          this.dmd = 'AMPP'
          return
        }
        default:
        //  console.log(concept.code.code)
      }

      this.fhirService.lookup('http://snomed.info/sct', concept.code.code).subscribe(params => {
        var display = this.getParameter("display", params)
        if (display !== undefined) {
          concept.name = display
          concept.code.display = concept.name
          this.dataSource.data = this.conceptData
        }
      })
    }
  }

  getParameter(code : string, params : Parameters | undefined) : string | undefined {
    if (params === undefined) params = this.parameters
    if (params !== undefined && params.parameter !== undefined) {
       for (let param of params.parameter){
         var name = undefined
         var value: string | undefined = undefined
         if (param.name === code) {
           if (param.valueBoolean !== undefined) return param.valueBoolean ? 'true' : 'false'
           if (param.valueString !== undefined) return param.valueString
           if (param.valueCode !== undefined) return param.valueCode
         }
         if (param.part !== undefined) {

           for (let part of param.part) {
             if (part.name === 'code') {
               name = part.valueCode

             }
             if (part.name === 'value') {

               if (part.valueBoolean !== undefined) value = part.valueBoolean ? 'true' : 'false'
               if (part.valueString !== undefined) value = part.valueString
               if (part.valueCode !== undefined) value = part.valueCode
             }

           }
         }
         if (name !== undefined && name === code) return value;
      }
    }
    return undefined
  }

  getParameters(code: string) : string[] {
    var results: string[] = []
    if (this.parameters !== undefined && this.parameters.parameter !== undefined) {
      for (let param of this.parameters.parameter){
        var name = undefined
        var value: string | undefined = undefined
        if (param.name === code) {
          if (param.valueBoolean !== undefined) results.push(String(param.valueBoolean))
          if (param.valueString !== undefined) results.push(param.valueString)
          if (param.valueCode !== undefined) results.push(param.valueCode)
        }
        if (param.part !== undefined) {

          for (let part of param.part) {
            if (part.name === 'code') {
              name = part.valueCode

            }
            if (part.name === 'value') {

              if (part.valueBoolean !== undefined) value = String(part.valueBoolean)
              if (part.valueString !== undefined) value = part.valueString
              if (part.valueCode !== undefined) value = part.valueCode
            }

          }
        }
        if (name !== undefined && name === code && value !== undefined) results.push(value)
      }
    }
    //console.log(results)
    return results
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

    selected(parent: ValueSetExpansionContains) {
        this.concept = parent
        this.getData()
    }

  selectedN(node :any) {

    if (node.data.system !== undefined) {
      console.log(node)
      this.concept = node.data
      this.getData()
    }
  }
}
