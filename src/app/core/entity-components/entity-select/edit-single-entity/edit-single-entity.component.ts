import { Component, ElementRef, ViewChild } from "@angular/core";
import {
  EditComponent,
  EditPropertyConfig,
} from "../../entity-utils/dynamic-form-components/edit-component";
import { Entity } from "../../../entity/model/entity";
import { BehaviorSubject } from "rxjs";
import { DynamicComponent } from "../../../view/dynamic-components/dynamic-component.decorator";
import { EntityMapperService } from "../../../entity/entity-mapper.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { DisplayEntityComponent } from "../display-entity/display-entity.component";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@DynamicComponent("EditSingleEntity")
@Component({
  selector: "app-edit-single-entity",
  templateUrl: "./edit-single-entity.component.html",
  styleUrls: ["./edit-single-entity.component.scss"],
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    DisplayEntityComponent,
    NgIf,
    MatAutocompleteModule,
    MatButtonModule,
    FontAwesomeModule,
    AsyncPipe,
    NgForOf,
  ],
  standalone: true,
})
export class EditSingleEntityComponent extends EditComponent<string> {
  entities: Entity[] = [];
  placeholder: string;
  autocompleteEntities = new BehaviorSubject<Entity[]>([]);
  selectedEntity?: Entity;

  @ViewChild("inputElement") input: ElementRef;

  constructor(private entityMapperService: EntityMapperService) {
    super();
  }

  updateAutocomplete(inputText: string) {
    let filteredEntities = this.entities;
    if (inputText) {
      filteredEntities = this.entities.filter((entity) =>
        entity.toString().toLowerCase().includes(inputText.toLowerCase())
      );
    }
    this.autocompleteEntities.next(filteredEntities);
  }

  async onInitFromDynamicConfig(config: EditPropertyConfig<string>) {
    super.onInitFromDynamicConfig(config);
    this.placeholder = $localize`:Placeholder for input to set an entity|context Select User:Select ${
      config.formFieldConfig.label || config.propertySchema?.label
    }`;
    const entityType: string =
      config.formFieldConfig.additional || config.propertySchema.additional;
    this.entities = await this.entityMapperService.loadType(entityType);
    this.entities.sort((e1, e2) => e1.toString().localeCompare(e2.toString()));
    const selectedEntity = this.entities.find(
      (entity) => entity.getId() === this.formControl.value
    );
    if (selectedEntity) {
      this.selectedEntity = selectedEntity;
    }
  }

  select(selected: string | Entity) {
    let entity: Entity;
    if (typeof selected === "string") {
      entity = this.entities.find(
        (e) => e.toString().toLowerCase() === selected.toLowerCase()
      );
    } else {
      entity = selected;
    }

    if (entity) {
      this.selectedEntity = entity;
      this.formControl.setValue(entity.getId());
    } else {
      this.selectedEntity = undefined;
      this.formControl.setValue(undefined);
    }
  }
}
