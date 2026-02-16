import { z } from 'zod';

export const QuoteItemSchema = z.object({
    id: z.coerce.string().optional(),
    itemOrder: z.number(),
    itemDescription: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    total: z.coerce.number(), // This is usually calculated, but good to have in schema
    gst: z.coerce.number().refine((val) => val === 0 || val === 10, {
        message: "GST must be 0 or 10",
    }),
    serviceItemId: z.string().nullable().optional(),
    productItemId: z.string().nullable().optional(),
});

export const QuoteSchema = z.object({
    id: z.coerce.string().optional(), // Coerce handles number -> string conversion
    quoteNumber: z.string().optional(),
    quoteDate: z.string().min(1, "Date is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    status: z.enum(['PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED']).default('PENDING'),

    discountType: z.enum(['DOLLAR', 'PERCENT']),
    discountValue: z.coerce.number().min(0),

    totalPrice: z.coerce.number(),
    gst: z.coerce.number(),

    // Client is optional (backend can create one if missing)
    clientId: z.coerce.string().optional(),
    clientFirstname: z.string().min(1, "First Name is required"),
    clientLastname: z.string().min(1, "Last Name is required"),
    clientEntityName: z.string().nullable().optional(),
    clientEmail: z.string().email("Invalid email address").min(1, "Email is required"),
    clientPhone: z.string().min(1, "Phone is required"),

    notes: z.string().nullable().optional(),
    quoteRevision: z.number().default(0),

    quoteItems: z.array(QuoteItemSchema),
    companyId: z.coerce.string().min(1, "Company ID is missing"),
});

export const InvoiceItemSchema = QuoteItemSchema; // Re-use for now as structure is identical

export const InvoiceSchema = z.object({
    id: z.string().optional(),
    invoiceNumber: z.string().optional(),
    issueDate: z.string().min(1, "Date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']).default('DRAFT'),

    discountType: z.enum(['DOLLAR', 'PERCENT']),
    discountValue: z.coerce.number().min(0),

    totalPrice: z.coerce.number(),
    gst: z.coerce.number(),

    clientId: z.string().optional(),
    clientFirstname: z.string().min(1, "First Name is required"),
    clientLastname: z.string().min(1, "Last Name is required"),
    clientEntityName: z.string().optional(),
    clientEmail: z.string().email("Invalid email address").min(1, "Email is required"),
    clientPhone: z.string().min(1, "Phone is required"),

    notes: z.string().optional(),

    invoiceItems: z.array(InvoiceItemSchema),
    companyId: z.string().optional(),
});

export type QuoteFormValues = z.infer<typeof QuoteSchema>;
export type InvoiceFormValues = z.infer<typeof InvoiceSchema>;

export const CompanySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Business Name is required"),
    abn: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    bank_bsb: z.string().optional(),
    bank_account: z.string().optional(),
    website: z.string().optional(),
    stripeConnectedAccountId: z.string().optional(),
    stripeChargesEnabled: z.boolean().optional(),
});

export type CompanyFormValues = z.infer<typeof CompanySchema>;

export const CustomerSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    clientEntityName: z.string().optional(),
    phoneNumber: z.string().min(1, "Phone number is required"),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

export const ProductSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export const ServiceSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
});

export type ServiceFormValues = z.infer<typeof ServiceSchema>;

export const AssetDefinitionRowSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    required: z.enum(['yes', 'no']),
    valueType: z.enum(['string', 'number']),
    defaultValue: z.string().optional(),
    unit: z.string().optional(),
});

export const AssetDefinitionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Asset Title is required"),
    productDescription: z.string().optional(),
    rows: z.array(AssetDefinitionRowSchema),
});

export type AssetDefinitionFormValues = z.infer<typeof AssetDefinitionSchema>;

export const EmployeeSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
});

export type EmployeeFormValues = z.infer<typeof EmployeeSchema>;


