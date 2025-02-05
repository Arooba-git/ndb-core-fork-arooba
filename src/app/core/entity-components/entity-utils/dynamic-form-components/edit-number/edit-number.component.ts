import { Component } from "@angular/core";
import { EditComponent, EditPropertyConfig } from "../edit-component";
import { CustomNumberValidators } from "../../../../../utils/custom-number-validators";
import { DynamicComponent } from "../../../../view/dynamic-components/dynamic-component.decorator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { ErrorHintComponent } from "../../error-hint/error-hint.component";

@DynamicComponent("EditNumber")
@Component({
  selector: "app-edit-number",
  templateUrl: "./edit-number.component.html",
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    ErrorHintComponent,
  ],
  standalone: true,
})
export class EditNumberComponent extends EditComponent<number> {
  onInitFromDynamicConfig(config: EditPropertyConfig<number>) {
    super.onInitFromDynamicConfig(config);
    const newValidators = [CustomNumberValidators.isNumber];
    if (this.formControl.validator) {
      newValidators.push(this.formControl.validator);
    }
    this.formControl.setValidators(newValidators);
    this.formControl.updateValueAndValidity();
  }
}
