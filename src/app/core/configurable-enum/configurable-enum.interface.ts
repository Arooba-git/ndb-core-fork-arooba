/**
 * Interface specifying overall object representing an enum with all its options
 * as stored in the config database
 */
export type ConfigurableEnumConfig<
  T extends ConfigurableEnumValue = ConfigurableEnumValue
> = Array<T>;

/**
 * Mandatory properties of each option of an configurable enum
 * the actual object can contain additional properties in the specific context of that enum (e.g. a `color` property)
 */
export interface ConfigurableEnumValue {
  /**
   * identifier that is unique among all values of the same enum and does not change even when label or other things are edited
   */
  id: string;

  /**
   * human-readable name that is displayed representing the value in the UI
   */
  label: string;

  /**
   * an optional color code which should be displayed
   */
  color?: string;

  /**
   * indicates this is a fallback option generated by configurable-enum datatype for
   * a value that is not included in the selectable enum options of the config.
   */
  isInvalidOption?: boolean;

  /**
   * Optionally any number of additional properties specific to a certain enum collection.
   */
  [x: string]: any;
}

export const EMPTY: ConfigurableEnumValue = {
  id: "",
  label: "",
};

/**
 * The prefix of all enum collection entries in the config database.
 *
 * This prefix is concatenated with the individual enum collection's id, resulting in the full config object id.
 */
export const CONFIGURABLE_ENUM_CONFIG_PREFIX = "enum:";
