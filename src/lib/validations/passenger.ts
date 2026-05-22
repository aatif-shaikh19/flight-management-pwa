import { z } from 'zod'

export const PassengerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes'),

  passportNo: z
    .string()
    .min(6, 'Passport number must be at least 6 characters')
    .max(20, 'Passport number too long')
    .regex(/^[A-Z0-9]+$/i, 'Passport number can only contain letters and numbers'),

  nationality: z
    .string()
    .min(2, 'Please enter a valid nationality')
    .max(100),

  dob: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), 'Please enter a valid date of birth')
    .refine((d) => {
      const age = (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24 * 365)
      return age >= 2
    }, 'Passenger must be at least 2 years old')
    .refine((d) => {
      const age = (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24 * 365)
      return age <= 120
    }, 'Please enter a valid date of birth'),
})

export type PassengerFormData = z.infer<typeof PassengerSchema>
