export interface SystemModule {
  id: string;
  sort_order: number;
  name_th: string;
  name_en: string;
  dashboard_name_th: string;
  dashboard_name_en: string;
  verify_identity: boolean;
  department: boolean;
  admin_only: boolean;
  show_dashboard: boolean;
  key?: string;
}

export type CreateModulePayload = Omit<SystemModule, "id">;
export type UpdateModulePayload = Omit<SystemModule, "id">;
