import { Component } from "@angular/core";
import { ViewDirective } from "../view.directive";
import { ViewPropertyConfig } from "../../../entity-list/EntityListConfig";
import { DynamicComponent } from "../../../../view/dynamic-components/dynamic-component.decorator";

@DynamicComponent("DisplayUnit")
@Component({
  selector: "app-display-unit",
  template: '{{ value ? value + " " + unit : "" }}',
  standalone: true,
})
export class DisplayUnitComponent extends ViewDirective<string> {
  unit: string;

  onInitFromDynamicConfig(config: ViewPropertyConfig) {
    super.onInitFromDynamicConfig(config);
    this.unit =
      config.config || config.entity.getSchema().get(this.property).additional;
  }
}
