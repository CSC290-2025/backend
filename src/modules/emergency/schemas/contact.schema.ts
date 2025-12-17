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
  id: z.number().int(),
  contact_name: z.string().nullable(),
  phone: z
    .string()
    .regex(phoneRegex, {
      message: 'Invalid phone number',
    })
    .nullable(),
});

const FindContactByUserIdSchema = z.object({
  contact: z.array(CreateContactSchema),
});
export {
  ContactResponseSchema,
  CreateContactSchema,
  UpdateContactSchema,
  FindContactByUserIdSchema,
};
