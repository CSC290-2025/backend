import * as z from 'zod';

const phoneRegex = new RegExp(/^(0[689]{1})+([0-9]{8})+$/);
const ContactResponseSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().nullable(),
  contact_name: z.string(),
  phone: z
    .string()
    .regex(phoneRegex, {
      message: 'Invalid phone number',
    })
    .nullable(),
});

const CreateContactSchema = ContactResponseSchema.omit({
  id: true,
});

const UpdateContactSchema = z.object({
  contact_name: z.string().optional(),
  phone: z
    .string()
    .regex(phoneRegex, {
      message: 'Invalid phone number',
    })
    .optional(),
});

const FindContactByUserIdSchema = z.object({
  contact: z.array(CreateContactSchema),
});

const DeleteContactResponseSchema = z.object({
  id: z.number().int(),
});
export {
  ContactResponseSchema,
  CreateContactSchema,
  UpdateContactSchema,
  FindContactByUserIdSchema,
  DeleteContactResponseSchema,
};
