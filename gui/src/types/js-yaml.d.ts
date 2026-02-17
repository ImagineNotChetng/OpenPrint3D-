declare module "js-yaml" {
  export function dump(obj: unknown, opts?: {
    default_flow_style?: boolean;
    sort_keys?: boolean;
    allow_unicode?: boolean;
    indent?: number;
  }): string;
  
  export function safe_dump(obj: unknown, opts?: {
    default_flow_style?: boolean;
    sort_keys?: boolean;
    allow_unicode?: boolean;
    indent?: number;
  }): string;
  
  export function load(str: string): unknown;
  export function safe_load(str: string): unknown;
}
