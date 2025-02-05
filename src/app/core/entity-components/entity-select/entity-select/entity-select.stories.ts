import { Story, Meta } from "@storybook/angular/types-6-0";
import { moduleMetadata } from "@storybook/angular";
import { Child } from "../../../../child-dev-project/children/model/child";
import { Database } from "../../../database/database";
import { BackupService } from "../../../admin/services/backup.service";
import { EntityMapperService } from "../../../entity/entity-mapper.service";
import { ChildrenService } from "../../../../child-dev-project/children/children.service";
import { BehaviorSubject } from "rxjs";
import { EntitySelectComponent } from "./entity-select.component";
import { StorybookBaseModule } from "../../../../utils/storybook-base.module";
import { School } from "../../../../child-dev-project/schools/model/school";

const child1 = new Child();
child1.name = "First Child";
child1.projectNumber = "1";
child1.photo = {
  path: "",
  photo: new BehaviorSubject("assets/child.png"),
};
const child2 = new Child();
child2.name = "Second Child";
child2.projectNumber = "2";
child2.photo = {
  path: "",
  photo: new BehaviorSubject("assets/child.png"),
};
const child3 = new Child();
child3.name = "Third Child";
child3.projectNumber = "3";
child3.photo = {
  path: "",
  photo: new BehaviorSubject("assets/child.png"),
};

export default {
  title: "Core/EntityComponents/EntitySelect",
  component: EntitySelectComponent,
  decorators: [
    moduleMetadata({
      imports: [EntitySelectComponent, StorybookBaseModule],
      declarations: [],
      providers: [
        { provide: BackupService, useValue: {} },
        {
          provide: EntityMapperService,
          useValue: {
            loadType: () =>
              Promise.resolve([
                child1,
                child2,
                child3,
                School.create({ name: "School ABC" }),
              ]),
          },
        },
        { provide: Database, useValue: {} },
        { provide: ChildrenService, useValue: {} },
      ],
    }),
  ],
  parameters: {
    controls: {
      exclude: [
        "allEntities",
        "filteredEntities",
        "selectedEntities",
        "formControl",
        "loading",
        "separatorKeysCodes",
        "additionalFilter",
        "accessor",
      ],
    },
  },
} as Meta;

const Template: Story<EntitySelectComponent<Child>> = (
  args: EntitySelectComponent<Child>
) => ({
  component: EntitySelectComponent,
  props: args,
});

export const primary = Template.bind({});
primary.args = {
  entityType: Child.ENTITY_TYPE,
  label: "Attending Children",
  placeholder: "Select Children",
};

export const multipleTypes = Template.bind({});
multipleTypes.args = {
  entityType: [Child.ENTITY_TYPE, School.ENTITY_TYPE],
  label: "Related Records",
  placeholder: "Select records",
};

export const disabled = Template.bind({});
disabled.args = {
  entityType: Child.ENTITY_TYPE,
  label: "Attending Children",
  placeholder: "Select Children",
  selection: [child1.getId()],
  disabled: true,
};
