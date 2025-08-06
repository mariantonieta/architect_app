import { z } from "zod"

export const materialsSchema = z.object({
    id: z.number(),
    item: z.string(),
    description: z.string(),
    unit: z.string(),
    quantity: z.number(),
    // category: z.string(),
    // subcategory: z.string(),
    // metricQuantity: z.number(),
    // updatedQuantity: z.number(),
    // finalUnit: z.string(),
    // status: z.string(),
})

export type Material = z.infer<typeof materialsSchema>