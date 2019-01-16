import { ConfigValidation as StaticConfigValidation } from "./config-validation";
import { IConfigValidation } from "./interfaces";

export * from "./configuration/basic-heating-rule";
export * from "./configuration/configuration";
export * from "./configuration/dated-config";
export * from "./configuration/named-config";
export * from "./configuration/override";
export * from "./configuration/program";
export * from "./configuration/sensor-config";
export * from "./configuration/time-of-day";

// TypeScript does not allow interface members to be static.  This next export simulates this
// by exporting an instance variable called ConvfigValidation that implements static methods 
// that have the same signature as those in IConfigValidation
export const ConfigValidation: IConfigValidation = StaticConfigValidation;
