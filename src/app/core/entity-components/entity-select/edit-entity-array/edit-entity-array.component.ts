import { Component } from "@angular/core";
import {
  EditComponent,
  EditPropertyConfig,
} from "../../entity-utils/dynamic-form-components/edit-component";
import { DynamicComponent } from "../../../view/dynamic-components/dynamic-component.decorator";
import { EntitySelectComponent } from "../entity-select/entity-select.component";

@DynamicComponent("EditEntityArray")
@Component({
  selector: "app-edit-entity-array",
  templateUrl: "./edit-entity-array.component.html",
  imports: [EntitySelectComponent],
  standalone: true,
})
export class EditEntityArrayComponent extends EditComponent<string[]> {
  placeholder: string;

  entityName: string;

  onInitFromDynamicConfig(config: EditPropertyConfig<string[]>) {
    super.onInitFromDynamicConfig(config);

    this.entityName =
      config.formFieldConfig.additional || config.propertySchema.additional;

    this.placeholder = $localize`:Placeholder for input to add entities|context Add User(s):Add ${this.label}`;
  }
}
