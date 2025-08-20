import { MaterialListItemStatus } from "@/services/materialServices";
import { z } from "zod";

export const materialsSchema = z.object({
  id: z.number(),
  item: z.string(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  status: z.enum([
    MaterialListItemStatus.REQUESTED,
    MaterialListItemStatus.NO_REQUESTED,
    MaterialListItemStatus.QUOTED,
  ]),

});

export type Material = z.infer<typeof materialsSchema>;
