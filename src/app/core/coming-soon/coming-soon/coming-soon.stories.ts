import { Story, Meta } from "@storybook/angular/types-6-0";
import { moduleMetadata } from "@storybook/angular";
import { ComingSoonComponent } from "./coming-soon.component";
import { AnalyticsService } from "../../analytics/analytics.service";
import { StorybookBaseModule } from "../../../utils/storybook-base.module";

export default {
  title: "Core/ComingSoonPage",
  component: ComingSoonComponent,
  decorators: [
    moduleMetadata({
      imports: [ComingSoonComponent, StorybookBaseModule],
      providers: [
        {
          provide: AnalyticsService,
          useValue: { eventTrack: (x) => console.log("track", x) },
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<ComingSoonComponent> = (args: ComingSoonComponent) => ({
  component: ComingSoonComponent,
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};
