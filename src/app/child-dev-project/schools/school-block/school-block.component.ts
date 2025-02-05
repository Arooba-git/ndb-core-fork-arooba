import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { EntityMapperService } from "../../../core/entity/entity-mapper.service";
import { School } from "../model/school";
import { OnInitDynamicComponent } from "../../../core/view/dynamic-components/on-init-dynamic-component.interface";
import { DynamicComponent } from "../../../core/view/dynamic-components/dynamic-component.decorator";
import { FaDynamicIconComponent } from "../../../core/view/fa-dynamic-icon/fa-dynamic-icon.component";

@DynamicComponent("SchoolBlock")
@Component({
  selector: "app-school-block",
  templateUrl: "./school-block.component.html",
  styleUrls: ["./school-block.component.scss"],
  standalone: true,
  imports: [FaDynamicIconComponent],
})
export class SchoolBlockComponent implements OnInitDynamicComponent, OnChanges {
  icon: string = School.icon;
  @Input() entity: School = new School("");
  @Input() entityId: string;
  @Input() linkDisabled: boolean;

  constructor(private entityMapper: EntityMapperService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("entityId")) {
      this.initFromEntityId();
    }
  }

  onInitFromDynamicConfig(config: any) {
    this.entity = config.entity;
    if (config.hasOwnProperty("entityId")) {
      this.entityId = config.entityId;
      this.initFromEntityId();
    }
    this.linkDisabled = config.linkDisabled;
  }

  private async initFromEntityId() {
    if (!this.entityId) {
      return;
    }
    this.entity = await this.entityMapper.load(School, this.entityId);
  }
}
