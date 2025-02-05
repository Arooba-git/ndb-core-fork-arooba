import { Component, OnInit } from "@angular/core";
import { PouchDatabase } from "../../core/database/pouch-database";
import { ActivatedRoute } from "@angular/router";
import { EntityRegistry } from "../../core/entity/database-entity.decorator";
import { EntityMapperService } from "../../core/entity/entity-mapper.service";
import { PublicFormConfig } from "./public-form-config";
import { Entity, EntityConstructor } from "../../core/entity/model/entity";
import { toFormFieldConfig } from "../../core/entity-components/entity-subrecord/entity-subrecord/entity-subrecord-config";
import { FormFieldConfig } from "../../core/entity-components/entity-form/entity-form/FormConfig";
import {
  EntityForm,
  EntityFormService,
} from "../../core/entity-components/entity-form/entity-form.service";
import { EntityFormComponent } from "../../core/entity-components/entity-form/entity-form/entity-form.component";
import { MatButtonModule } from "@angular/material/button";
import { ConfigService } from "../../core/config/config.service";
import { EntitySchemaService } from "../../core/entity/schema/entity-schema.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "app-public-form",
  templateUrl: "./public-form.component.html",
  styleUrls: ["./public-form.component.scss"],
  imports: [EntityFormComponent, MatButtonModule, MatCardModule],
  standalone: true,
})
export class PublicFormComponent<E extends Entity> implements OnInit {
  private entityType: EntityConstructor<E>;
  private prefilled: Partial<E> = {};
  formConfig: PublicFormConfig;
  entity: E;
  columns: FormFieldConfig[][];
  form: EntityForm<E>;

  constructor(
    private database: PouchDatabase,
    private route: ActivatedRoute,
    private entities: EntityRegistry,
    private entityMapper: EntityMapperService,
    private entityFormService: EntityFormService,
    private configService: ConfigService,
    private entitySchemaService: EntitySchemaService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    if (!this.database["pouchDB"]) {
      this.database.initRemoteDB();
    }
    // wait for config to be initialized
    this.configService.configUpdates
      .pipe(untilDestroyed(this))
      .subscribe(() => this.loadFormConfig());
  }

  submit() {
    this.entityFormService
      .saveChanges(this.form, this.entity)
      .then(() => this.snackbar.open($localize`Successfully submitted form`))
      .then(() => this.initForm());
  }

  reset() {
    this.initForm();
  }

  private async loadFormConfig() {
    const id = this.route.snapshot.paramMap.get("id");
    this.formConfig = await this.entityMapper.load(PublicFormConfig, id);
    this.entityType = this.entities.get(
      this.formConfig.entity
    ) as EntityConstructor<E>;
    if (this.formConfig.prefilled) {
      this.prefilled = this.entitySchemaService.transformDatabaseToEntityFormat(
        this.formConfig.prefilled,
        this.entityType.schema
      );
    }
    this.columns = this.formConfig.columns.map((row) =>
      row.map(toFormFieldConfig)
    );
    this.initForm();
  }

  private initForm() {
    this.entity = new this.entityType();
    Object.entries(this.prefilled).forEach(([prop, value]) => {
      this.entity[prop] = value;
    });
    this.form = this.entityFormService.createFormGroup(
      [].concat(...this.columns),
      this.entity
    );
  }
}
