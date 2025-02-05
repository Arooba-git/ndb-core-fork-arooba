import { Component, Input } from "@angular/core";
import { OnInitDynamicComponent } from "../../../core/view/dynamic-components/on-init-dynamic-component.interface";
import { FormFieldConfig } from "../../../core/entity-components/entity-form/entity-form/FormConfig";
import { Entity } from "../../../core/entity/model/entity";
import { PanelConfig } from "../../../core/entity-components/entity-details/EntityDetailsConfig";
import { Todo } from "../model/todo";
import { DatabaseIndexingService } from "../../../core/entity/database-indexing/database-indexing.service";
import { DynamicComponent } from "../../../core/view/dynamic-components/dynamic-component.decorator";
import { SessionService } from "../../../core/session/session-service/session.service";
import { FormDialogService } from "../../../core/form-dialog/form-dialog.service";
import { TodoDetailsComponent } from "../todo-details/todo-details.component";
import { DataFilter } from "../../../core/entity-components/entity-subrecord/entity-subrecord/entity-subrecord-config";
import { EntitySubrecordComponent } from "../../../core/entity-components/entity-subrecord/entity-subrecord/entity-subrecord.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { FormsModule } from "@angular/forms";

@DynamicComponent("TodosRelatedToEntity")
@Component({
  selector: "app-todos-related-to-entity",
  templateUrl: "./todos-related-to-entity.component.html",
  styleUrls: ["./todos-related-to-entity.component.scss"],
  standalone: true,
  imports: [EntitySubrecordComponent, MatSlideToggleModule, FormsModule],
})
export class TodosRelatedToEntityComponent implements OnInitDynamicComponent {
  entries: Todo[] = [];

  @Input() columns: FormFieldConfig[] = [
    { id: "deadline" },
    { id: "subject" },
    { id: "startDate" },
    { id: "assignedTo" },
    { id: "description", visibleFrom: "xl" },
    { id: "repetitionInterval", visibleFrom: "xl" },
    { id: "relatedEntities", hideFromTable: true },
    { id: "completed", hideFromForm: true },
  ];

  @Input() entity: Entity;

  /** the property name of the Todo that contains the ids referencing related entities */
  private referenceProperty: keyof Todo & string = "relatedEntities";

  showInactive: boolean;

  // TODO: filter by current user as default in UX? --> custom filter component or some kind of variable interpolation?
  filter: DataFilter<Todo> = { isActive: true };
  includeInactive: boolean;
  backgroundColorFn = (r: Todo) => {
    if (!r.isActive) {
      return "#e0e0e0";
    } else {
      return r.getColor();
    }
  };

  constructor(
    private formDialog: FormDialogService,
    private dbIndexingService: DatabaseIndexingService,
    private sessionService: SessionService
  ) {
    // TODO: move this generic index creation into schema
    this.dbIndexingService.generateIndexOnProperty(
      "todo_index",
      Todo,
      this.referenceProperty,
      "deadline"
    );
  }

  async onInitFromDynamicConfig(config: PanelConfig) {
    this.entity = config.entity;
    this.columns = config.config?.columns ?? this.columns;

    this.entries = await this.loadDataFor(this.entity.getId(true));
    this.toggleInactive();
  }

  private loadDataFor(entityId: string): Promise<Todo[]> {
    return this.dbIndexingService.queryIndexDocs(
      Todo,
      "todo_index/by_" + this.referenceProperty,
      {
        startkey: [entityId, "\uffff"],
        endkey: [entityId],
        descending: true,
      }
    );
  }

  public getNewEntryFunction(): () => Todo {
    return () => {
      const newEntry = new Todo();
      newEntry.relatedEntities = [this.entity.getId(true)];
      newEntry.assignedTo = [this.sessionService.getCurrentUser().name];
      return newEntry;
    };
  }

  showDetails(entity: Todo) {
    this.formDialog.openSimpleForm(entity, this.columns, TodoDetailsComponent);
  }

  toggleInactive() {
    // TODO: move the toggle into its own component to be used like a filter? this is almost copy & paste from ChildSchoolOverview
    if (this.includeInactive) {
      this.filter = {};
    } else {
      this.filter = { isActive: true };
    }
  }
}
