import { EntitySchemaDatatype } from "../../entity/schema/entity-schema-datatype";
import {
  CONFIGURABLE_ENUM_CONFIG_PREFIX,
  ConfigurableEnumConfig,
  ConfigurableEnumValue,
} from "../configurable-enum.interface";
import { ConfigService } from "../../config/config.service";
import { EntitySchemaField } from "../../entity/schema/entity-schema-field";

export class ConfigurableEnumDatatype
  implements EntitySchemaDatatype<ConfigurableEnumValue>
{
  public readonly name = "configurable-enum";
  public readonly viewComponent = "DisplayConfigurableEnum";
  public readonly editComponent = "EditConfigurableEnum";

  constructor(private configService: ConfigService) {}

  /**
   * transforms Objects of InteractionType to strings to save in DB
   * @param value Object to be saved as specified in config file; e.g. `{id: 'CALL', label:'Phone Call', color:'#FFFFFF'}`
   */
  public transformToDatabaseFormat(value: ConfigurableEnumValue): string {
    return value.id;
  }

  /**
   * transforms saved strings from the DB to Objects of InteractionType
   * @param value string from database as specified in config file; e.g. 'PHONE_CALL'
   * @param schemaField
   */
  public transformToObjectFormat(
    value: string,
    schemaField: EntitySchemaField
  ): ConfigurableEnumValue {
    let enumId = schemaField.additional || schemaField.innerDataType;
    if (!enumId.startsWith(CONFIGURABLE_ENUM_CONFIG_PREFIX)) {
      enumId = CONFIGURABLE_ENUM_CONFIG_PREFIX + enumId;
    }

    let enumOption = this.configService
      .getConfig<ConfigurableEnumConfig>(enumId)
      ?.find((option) => option.id === value);
    if (!enumOption) {
      enumOption = this.generateOptionForInvalid(value);
    }

    return enumOption;
  }

  /**
   * Build a dummy option so that invalid values are not lost on the next save and users can manually correct issues.
   * @param enumId
   * @private
   */
  private generateOptionForInvalid(optionValue: string) {
    return {
      id: optionValue,
      isInvalidOption: true,
      label:
        $localize`:enum option label prefix for invalid id dummy:[invalid option]` +
        " " +
        optionValue,
    };
  }
}
