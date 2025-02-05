import { Component, Input, OnInit } from "@angular/core";
import { Note } from "../model/note";
import { NoteDetailsComponent } from "../note-details/note-details.component";
import { ActivatedRoute } from "@angular/router";
import { EntityMapperService } from "../../../core/entity/entity-mapper.service";
import { FilterSelectionOption } from "../../../core/filter/filter-selection/filter-selection";
import { SessionService } from "../../../core/session/session-service/session.service";
import { FormDialogService } from "../../../core/form-dialog/form-dialog.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { LoggingService } from "../../../core/logging/logging.service";
import { EntityListComponent } from "../../../core/entity-components/entity-list/entity-list.component";
import { applyUpdate } from "../../../core/entity/model/entity-update";
import { EntityListConfig } from "../../../core/entity-components/entity-list/EntityListConfig";
import { EventNote } from "../../attendance/model/event-note";
import { WarningLevel } from "../../../core/entity/model/warning-level";
import { RouteData } from "../../../core/view/dynamic-routing/view-config.interface";
import { merge } from "rxjs";
import { RouteTarget } from "../../../app.routing";
import moment from "moment";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Angulartics2Module } from "angulartics2";

/**
 * additional config specifically for NotesManagerComponent
 */
export interface NotesManagerConfig {
  /** whether to also load EventNote entities in addition to Note entities */
  includeEventNotes?: boolean;

  /** whether a toggle control is displayed to users, allowing to change the "includeEventNotes" state */
  showEventNotesToggle?: boolean;
}

@RouteTarget("NotesManager")
@Component({
  selector: "app-notes-manager",
  templateUrl: "./notes-manager.component.html",
  imports: [
    EntityListComponent,
    MatSlideToggleModule,
    NgIf,
    FormsModule,
    Angulartics2Module,
  ],
  standalone: true,
})
@UntilDestroy()
export class NotesManagerComponent implements OnInit {
  @Input() includeEventNotes: boolean;
  @Input() showEventNotesToggle: boolean;

  config: EntityListConfig;
  noteConstructor = Note;
  notes: Note[] = [];
  isLoading: boolean = true;

  private statusFS: FilterSelectionOption<Note>[] = [
    {
      key: "urgent",
      label: $localize`:Filter-option for notes:Urgent`,
      filter: { "warningLevel.id": WarningLevel.URGENT },
    },
    {
      key: "follow-up",
      label: $localize`:Filter-option for notes:Needs Follow-Up`,
      filter: {
        "warningLevel.id": { $in: [WarningLevel.URGENT, WarningLevel.WARNING] },
      },
    },
    { key: "", label: $localize`All`, filter: {} },
  ];

  private dateFS: FilterSelectionOption<Note>[] = [
    {
      key: "current-week",
      label: $localize`:Filter-option for notes:This Week`,
      filter: { date: this.getWeeksFilter(0) },
    },
    {
      key: "last-week",
      label: $localize`:Filter-option for notes:Since Last Week`,
      filter: { date: this.getWeeksFilter(1) },
    },
    { key: "", label: $localize`All`, filter: {} },
  ];

  constructor(
    private formDialog: FormDialogService,
    private sessionService: SessionService,
    private entityMapperService: EntityMapperService,
    private route: ActivatedRoute,
    private log: LoggingService
  ) {}

  async ngOnInit() {
    this.route.data.subscribe(
      async (data: RouteData<EntityListConfig & NotesManagerConfig>) => {
        this.config = data.config;
        this.addPrebuiltFilters();

        this.includeEventNotes = data.config.includeEventNotes;
        this.showEventNotesToggle = data.config.showEventNotesToggle;
        this.notes = await this.loadEntities();
      }
    );

    this.subscribeEntityUpdates();
  }

  private async loadEntities(): Promise<Note[]> {
    let notes = await this.entityMapperService.loadType(Note);
    if (this.includeEventNotes) {
      const eventNotes = await this.entityMapperService.loadType(EventNote);
      notes = notes.concat(eventNotes);
    }
    this.isLoading = false;
    return notes;
  }

  private subscribeEntityUpdates() {
    merge(
      this.entityMapperService.receiveUpdates(Note),
      this.entityMapperService.receiveUpdates(EventNote)
    )
      .pipe(untilDestroyed(this))
      .subscribe((updatedNote) => {
        if (
          !this.includeEventNotes &&
          updatedNote?.entity?.getType() === EventNote.ENTITY_TYPE
        ) {
          return;
        }

        this.notes = applyUpdate(this.notes, updatedNote);
      });
  }

  async updateIncludeEvents() {
    this.isLoading = true;
    this.notes = await this.loadEntities();
  }

  private addPrebuiltFilters() {
    for (const prebuiltFilter of this.config.filters.filter(
      (filter) => filter.type === "prebuilt"
    )) {
      switch (prebuiltFilter.id) {
        case "status": {
          prebuiltFilter["options"] = this.statusFS;
          prebuiltFilter["default"] = "";
          break;
        }
        case "date": {
          prebuiltFilter["options"] = this.dateFS;
          prebuiltFilter["default"] = "current-week";
          break;
        }
        default: {
          this.log.warn(
            "[NoteManagerComponent] No filter options available for prebuilt filter: " +
              prebuiltFilter.id
          );
          prebuiltFilter["options"] = [];
        }
      }
    }
  }

  private getWeeksFilter(weeksBack: number) {
    const start = moment().subtract(weeksBack, "weeks").startOf("week");
    const end = moment().endOf("day");
    const startString = start.format("YYYY-MM-DD");
    const endString = end.format("YYYY-MM-DD");
    return { $gte: startString, $lte: endString };
  }

  addNoteClick() {
    const newNote = new Note(Date.now().toString());
    newNote.date = new Date();
    newNote.authors = [this.sessionService.getCurrentUser().name];
    this.showDetails(newNote);
  }

  showDetails(entity: Note) {
    this.formDialog.openDialog(NoteDetailsComponent, entity);
  }
}
